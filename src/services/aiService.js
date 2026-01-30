import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

const SYSTEM_PROMPT = `
Bạn là trợ lý ảo chuyên về khách sạn, du lịch và đặt phòng.
- Trả lời thân thiện, tự nhiên.
- Luôn trả JSON duy nhất, KHÔNG có text ngoài JSON.
- Nếu người dùng chưa đăng nhập:
  - Vẫn được xem khách sạn, phòng, blog.
  - Nếu muốn đặt phòng hoặc hỏi về booking → báo cần đăng nhập.
- Nếu người dùng đã đăng nhập:
  - Có thể xem và đặt phòng, xem booking, blog, hoặc khách sạn yêu thích.

Trả đúng format JSON:
{
  "text": "<Câu trả lời tự nhiên>",
  "object": {
    "type": "hotel" | "room" | "booking" | "blog" | "favoriteHotel" | "general",
    "filters": {
      "city": string?,
      "hotelName": string?,
      "roomName": string?,
      "amenity": string | string[]?,
      "descriptionKeyword": string?,
      "checkAvailability": boolean?,
      "ratingStars": number?,
      "status": string?,
        "paymentStatus": string?,
      "detail": boolean? // true nếu người dùng muốn xem chi tiết
    }
  }
}

Hướng dẫn nhận diện:
- “Tôi muốn xem khách sạn ở Đà Nẵng” → type = "hotel", filters.city = "Đà Nẵng"
- “Khách sạn Crab Bui Vien Homestay còn phòng trống không?” → type = "room", filters.hotelName = "Crab Bui Vien Homestay", filters.checkAvailability = true
- “Có những loại phòng nào ở Crab Bui Vien Homestay?” → type = "room", filters.hotelName = "Crab Bui Vien Homestay"
- “Chi tiết về Phòng Sang Trọng Giường Đôi Có Bồn Tắm ở Crab Bui Vien Homestay” → type = "room", filters.hotelName = "Crab Bui Vien Homestay", filters.roomName = "Phòng Sang Trọng Giường Đôi Có Bồn Tắm", filters.detail = true
Nếu người dùng nói “xem đơn đặt phòng”, “xem các phòng đã đặt”, “xem lịch sử đặt phòng” → hiểu là muốn xem danh sách booking.
- “Đặt phòng tại khách sạn ABC” → type = "booking"
- “Blog về du lịch Nha Trang” → type = "blog"
- “Khách sạn yêu thích của tôi” → type = "favoriteHotel"
- “Xin chào”, “Cảm ơn” → type = "general"
`;



export const aiService = {
    aiMessage: async function (userId, data) {
        const { ask } = data;
        const isLoggedIn = !!userId;

        const authStatus = isLoggedIn
            ? `Người dùng ${userId.fullName} (id: ${userId.id}) đã đăng nhập.`
            : "Người dùng chưa đăng nhập.";

        // 🔮 Gọi OpenRouter AI để phân tích câu hỏi
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            temperature: 0.3,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                {
                    role: "user",
                    content: `${authStatus} Phân tích câu hỏi và trả về JSON đúng format: "${ask}"`,
                },
            ],
        });


        let responseData;
        try {
            responseData = JSON.parse(completion.choices[0].message.content.trim());
        } catch (err) {
            console.error("Lỗi parse JSON:", err);
            responseData = {
                text: "Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn.",
                object: { type: "general", filters: {} },
            };
        }
        const lowAsk = ask.toLowerCase();
        const bookingKeywords = ["xem đơn đặt phòng", "xem các phòng đã đặt", "xem lịch sử đặt phòng", "lịch sử đặt phòng"];
        const blogKeywords = ["blog", "bài viết", "du lịch"];
        const hotelKeywords = ["khách sạn", "phòng"];

        if (responseData.object.type === "general") {
            if (bookingKeywords.some(k => lowAsk.includes(k))) {
                responseData.object.type = "booking";
            } else if (blogKeywords.some(k => lowAsk.includes(k))) {
                responseData.object.type = "blog";
            } else if (hotelKeywords.some(k => lowAsk.includes(k))) {
                responseData.object.type = "hotel";
            }
            responseData.object.filters = responseData.object.filters || {};
        }


        const { object } = responseData;
        const filters = object?.filters || {};
        const type = object?.type || "general";
        let dataResult = null;




        switch (type) {
            // 🏨 KHÁCH SẠN
            case "hotel": {
                const { city, hotelName, amenity, descriptionKeyword, ratingStars } = filters;
                console.log("Hotel filter:", city);

                const where = {};

                if (city) where.location = { city: { contains: city } };
                if (hotelName) where.name = { contains: hotelName.replace(/^khách sạn\s*/i, "") };
                if (descriptionKeyword) where.description = { contains: descriptionKeyword };
                if (amenity)
                    where.amenities = {
                        some: { amenity: { name: { in: Array.isArray(amenity) ? amenity : [amenity] } } },
                    };
                if (ratingStars) where.averageRating = { gte: ratingStars };

                dataResult = await prisma.hotel.findMany({
                    where,
                    include: { location: { select: { city: true } } },
                });
                console.log("Found hotels:", dataResult.length);
                break;
            }

            // 🛏️ PHÒNG
            case "room": {
                const { hotelName, roomName, checkAvailability, city } = filters;
                const where = {};

                if (roomName) {
                    where.OR = [
                        { name: { contains: roomName.trim() } },
                        { type: { contains: roomName.trim() } },
                    ];
                }

                if (hotelName) {
                    where.hotel = {
                        name: { contains: hotelName.replace(/^khách sạn\s*/i, "") },
                    };
                }

                if (city) {
                    where.hotel = {
                        ...where.hotel,
                        location: { city: { contains: city } },
                    };
                }

                const rooms = await prisma.room.findMany({
                    where,
                    include: {
                        bookings: true,
                        hotel: {
                            include: { location: true },
                        },
                    },
                });

                let availableRooms = rooms;
                if (checkAvailability) {
                    const now = new Date();
                    availableRooms = rooms.filter(
                        (r) =>
                            !r.bookings.some(
                                (b) =>
                                    new Date(b.startDate) <= now &&
                                    new Date(b.endDate) >= now
                            )
                    );
                }

                dataResult = availableRooms;

                if (!isLoggedIn && checkAvailability) {
                    responseData.text += " (Bạn cần đăng nhập để đặt phòng)";
                }
                break;
            }

            // 📅 BOOKING
            case "booking": {
                if (!isLoggedIn) {
                    responseData.text = "Bạn cần đăng nhập để xem hoặc đặt phòng.";
                    dataResult = [];
                    break;
                }

                const { status } = filters;
                const where = { userId: userId.id };

                switch (status?.toLowerCase()) {
                    case "hủy":
                        where.status = "CANCELED";
                        where.paymentStatus = "UNPAID";
                        break;
                    case "chờ thanh toán":
                    case "đang chờ":
                        where.status = "PENDING";
                        break;
                    case "hoàn thành":
                    case "đã hoàn thành":
                        where.status = "FINISHED";
                        where.paymentStatus = "PAID";
                        break;
                    case "đã thanh toán confirm":
                    case "paid confirmed":
                        where.status = "CONFIRMED";
                        where.paymentStatus = "PAID";
                        break;
                    default:
                        where.status = {
                            in: ["PENDING", "CONFIRMED", "FINISHED", "CANCELED"],
                        };
                }

                const bookings = await prisma.booking.findMany({
                    where,
                    include: {
                        room: { include: { hotel: true } },
                        Voucher: true,
                        user: true,
                    },
                });

                const totalAmount = bookings.reduce(
                    (sum, b) => sum + (b.totalPrice || 0),
                    0
                );
                dataResult = { bookings, totalAmount };

                if (bookings.length > 0) {
                    let statusText = "";

                    if (!status || ["tất cả", "xem tất cả"].includes(status?.toLowerCase())) {
                        const countPending = bookings.filter(
                            (b) => b.status === "PENDING"
                        ).length;
                        const countConfirmed = bookings.filter(
                            (b) => b.status === "CONFIRMED"
                        ).length;
                        const countFinished = bookings.filter(
                            (b) => b.status === "FINISHED"
                        ).length;
                        const countCanceled = bookings.filter(
                            (b) => b.status === "CANCELED"
                        ).length;

                        const parts = [];
                        if (countPending) parts.push(`chờ thanh toán: ${countPending}`);
                        if (countConfirmed)
                            parts.push(`Thanh toán và xác nhận: ${countConfirmed}`);
                        if (countFinished)
                            parts.push(`hoàn thành: ${countFinished}`);
                        if (countCanceled)
                            parts.push(`hủy: ${countCanceled}`);

                        statusText = parts.join(", ");
                        responseData.text = `Bạn có ${bookings.length} đơn đặt phòng (${statusText}), tổng cộng ${totalAmount.toLocaleString()} VND.`;
                    } else {
                        let statusText = "";
                        switch (status?.toLowerCase()) {
                            case "hủy":
                                statusText = "đơn đặt phòng đã hủy";
                                break;
                            case "chờ thanh toán":
                            case "đang chờ":
                                statusText = "đơn đặt phòng đang chờ thanh toán";
                                break;
                            case "hoàn thành":
                            case "đã hoàn thành":
                                statusText = "đơn đặt phòng hoàn thành";
                                break;
                            case "đã thanh toán và xác nhận":
                            case "paid confirmed":
                                statusText = "đơn đã thanh toán và confirmed";
                                break;
                        }
                        responseData.text = `Bạn có ${bookings.length} ${statusText}, tổng cộng ${totalAmount.toLocaleString()} VND.`;
                    }
                } else {
                    responseData.text = "Bạn chưa có đơn đặt phòng nào.";
                }
                break;
            }

            // ❤️ YÊU THÍCH
            case "favoriteHotel": {
                if (!isLoggedIn) {
                    responseData.text = "Vui lòng đăng nhập để xem danh hoặc đặt phòng.";
                    dataResult = [];
                } else {
                    dataResult = await prisma.favoriteHotel.findMany({
                        where: { userId: userId.id },
                        include: { hotel: true },
                    });
                }
                break;
            }

            // 📰 BLOG
            case "blog": {
                let { city } = filters;
                if (!city && ask) {
                    const cityMatch = ask.match(/blog (ở|tại|o) ([\w\s]+)/i);
                    if (cityMatch) city = cityMatch[2].trim();
                }

                const where = {};
                if (city) {
                    where.location = {
                        is: {
                            city: { contains: city },
                        },
                    };
                }

                dataResult = await prisma.blogPost.findMany({
                    where,
                    include: { location: true },
                });
                break;
            }

            // 🧠 MẶC ĐỊNH
            default: {
                responseData.text =
                    responseData.text || "Xin chào! Tôi có thể giúp gì cho bạn?";
                dataResult = [];
                break;
            }
        }

        return {
            data: {
                text: responseData.text,
                object: responseData.object,
                data: dataResult,
            },
        };

    },
};

export default aiService;
