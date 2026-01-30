import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import Stripe from "stripe";
import { BadrequestException, ConflictException, NotFoundException } from "../helpers/exception.helper.js";
const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
import { BookingStatus } from "@prisma/client";
export const userService = {
    updateProfile: async function (userId, data, avatarPath) {

        const { firstName, lastName, password, gender, phone, dateOfBirth, address } = data;
        const updateData = {}

        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (avatarPath) updateData.avatar = avatarPath;
        if (gender) updateData.gender = gender;
        if (phone) updateData.phone = phone;
        if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
        if (address) updateData.address = address;
        if (password) updateData.password = await bcrypt.hash(password, 10)

        if (firstName || lastName) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            updateData.fullName = `${firstName || user.firstName} ${lastName || user.lastName}`;
        }

        const updateUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                fullName: true,
                role: true,
                avatar: true,
                gender: true,
                phone: true,
                dateOfBirth: true,
                address: true,
                update_At: true,
                email: true,
                role: true
            }
        })

        return {
            updateUser: updateUser
        };
    },
    checkVoucher: async (userId, data) => {
        const { roomId, checkIn, checkOut, voucherCode } = data;
        const now = new Date();
        const parsedCheckIn = new Date(checkIn);
        const parsedCheckOut = new Date(checkOut);

        const voucher = await prisma.voucher.findUnique({
            where: { code: voucherCode }
        });
        if (!voucher) throw new NotFoundException("Mã voucher không hợp lệ");
        if (!voucher.isActive) throw new BadrequestException("Mã voucher không còn hiệu lực");
        if (voucher.expiresAt < now) throw new BadrequestException("Mã voucher đã hết hạn");
        if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
            throw new BadrequestException("Mã voucher đã đạt giới hạn sử dụng");
        }

        const userUsedCount = await prisma.booking.count({
            where: {
                userId,
                voucherId: voucher.id,
                status: { not: 'CANCELED' }  // bỏ qua đơn đã hủy
            }
        });

        if (voucher.perUserLimit && userUsedCount >= voucher.perUserLimit) {
            throw new BadrequestException("Bạn đã sử dụng mã voucher này vượt quá giới hạn cho phép");
        }

        // Tính thử tổng tiền
        const oneDay = 1000 * 60 * 60 * 24;
        const nights = Math.ceil((parsedCheckOut - parsedCheckIn) / oneDay);
        if (nights <= 0) {
            throw new BadrequestException("Ngày trả phòng phải sau ngày nhận phòng");
        }

        const room = await prisma.room.findUnique({ where: { id: parseInt(roomId) } });
        if (!room) throw new NotFoundException("Không tìm thấy phòng");

        const pricePerNight = room.discount
            ? Math.round(room.price * (1 - room.discount / 100))
            : room.price;

        const originalPrice = nights * pricePerNight;
        const finalPrice = Math.round(originalPrice * (1 - voucher.discount / 100));

        return {
            voucher,
            roomPrice: room.price, // Giá gốc của phòng
            voucherCode: voucher.code, // Mã voucher
            discountRoom: room.discount || 0, // Phần trăm giảm giá của phòng
            nights: nights, // Số đêm ở
            pricePerNight: pricePerNight,// Giá đã áp dụng giảm giá phòng
            originalPrice: originalPrice,  // Giá đã áp dụng giảm giá phòng (tính đêm và giảm giá phòng) chưa áp dụng voucher
            finalPrice: finalPrice, // Giá cuối cùng sau khi áp dụng voucher
            discountVoucher: voucher.discount // Phần trăm giảm giá của voucher
        };
    },

    bookingRoom: async function (userId, data) {
        const { roomId, checkIn, checkOut, guests, currency, voucherCode } = data;

        const parsedCheckIn = new Date(checkIn);
        const parsedCheckOut = new Date(checkOut);
        const now = new Date();
        const oneDay = 1000 * 60 * 60 * 24;
        const nights = Math.ceil((parsedCheckOut - parsedCheckIn) / oneDay);
        if (nights <= 0) {
            throw new BadrequestException("Ngày trả phòng phải sau ngày nhận phòng");
        }

        const existingBooking = await prisma.booking.findFirst({
            where: {
                roomId: parseInt(roomId),
                status: { in: ['PENDING', 'CONFIRMED'] },
                checkOut: { gt: now },
                AND: [
                    { checkIn: { lte: parsedCheckOut } },
                    { checkOut: { gte: parsedCheckIn } }
                ]
            }
        });

        if (existingBooking) {
            throw new ConflictException("Phòng đã được đặt trong thời gian này.")
        }

        const room = await prisma.room.findUnique({
            where: {
                id: parseInt(roomId)
            }
        });

        if (!room) {
            throw new NotFoundException("Không tìm thấy phòng")
        }

        const pricePerNight = room.discount
            ? Math.round(room.price * (1 - room.discount / 100))
            : room.price;

        let totalPrice = nights * pricePerNight
        let appliedVoucher = null;
        if (voucherCode) {
            const { voucher, finalPrice } = await this.checkVoucher(userId, {
                roomId,
                checkIn: parsedCheckIn,
                checkOut: parsedCheckOut,
                voucherCode
            });
            appliedVoucher = voucher;
            totalPrice = finalPrice;
        }
        if (guests > room.maxGuests) {
            throw new BadrequestException(`Phòng chỉ cho phép tối đa ${room.maxGuests} người.`);
        }
        const newBooking = await prisma.booking.create({
            data: {
                userId: userId,
                roomId: parseInt(roomId),
                checkIn: parsedCheckIn,
                checkOut: parsedCheckOut,
                totalPrice: totalPrice,
                guests: guests,
                status: 'PENDING',
                paymentStatus: 'UNPAID',
                currency: currency || 'vnd',
                voucherId: appliedVoucher ? appliedVoucher.id : null,
            },
            include: {
                user: true,
                room: {
                    include: {
                        hotel: true
                    }
                }
            }
        });
        return {
            nights: nights,
            newBooking: newBooking,
            appliedVoucher: appliedVoucher
        }
    },
    createStripeSession: async function (data) {
        const { bookingId, lang } = data;

        // 1. Lấy booking từ DB
        const booking = await prisma.booking.findUnique({
            where: { id: parseInt(bookingId) },
            include: {
                room: {
                    include: {
                        hotel: true
                    }
                }
            }
        });

        if (!booking) {
            throw new NotFoundException("Không tìm thấy đơn đặt");
        }

        // 2. Xác định tiền tệ & tính toán unitAmount
        let currencyUsed, unitAmount, descriptionText;

        if (lang === "en") {
            // Nếu ngôn ngữ là tiếng Anh → ép hiển thị USD
            currencyUsed = "usd";
            unitAmount = Math.round((booking.totalPrice / 25000) * 100); // Quy đổi VND → cents (USD)
            descriptionText = `Guests: ${booking.guests}, From ${booking.checkIn.toISOString().split("T")[0]} to ${booking.checkOut.toISOString().split("T")[0]}, Total: ${booking.totalPrice} VND => $${(unitAmount / 100).toFixed(2)} USD`;
        } else {
            // Mặc định tiếng Việt → dùng VND
            currencyUsed = "vnd";
            unitAmount = booking.totalPrice; // Stripe cho phép VNĐ (không cần *100)
            descriptionText = `Khách: ${booking.guests}, Từ ${booking.checkIn.toISOString().split("T")[0]} đến ${booking.checkOut.toISOString().split("T")[0]}, Tổng: ${unitAmount} VND`;
        }

        // 3. Tạo session Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: currencyUsed,
                        unit_amount: unitAmount,
                        product_data: {
                            name: `${booking.room.name} - ${booking.room.hotel.name}`,
                            description: descriptionText,
                            images: [booking.room.image]
                        }
                    },
                    quantity: 1
                }
            ],
            mode: "payment",
            success_url: `${process.env.FRONTEND_URL}/profile/booking/payment?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/profile/booking/payment?session_id={CHECKOUT_SESSION_ID}`,
            metadata: { bookingId: booking.id.toString() }
        });

        // 4. Cập nhật DB với sessionId
        await prisma.booking.update({
            where: { id: booking.id },
            data: { stripeSessionId: session.id }
        });

        // 5. Trả về sessionId cho FE
        return {
            sessionId: session.id,
            url: session.url
        };
    },


    verifyStripeSession: async function (sessionId) {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const bookingId = parseInt(session.metadata.bookingId);
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                room: { include: { hotel: true } }
            }
        });
        if (!session) {
            throw new NotFoundException("Không tìm thấy phiên thanh toán")
        }
        if (session.payment_status === "paid") {
            await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    status: "CONFIRMED",
                    paymentStatus: "PAID",
                    paidAmount: session.amount_total,
                    paidCurrency: session.currency
                }
            });

            if (booking.voucherId) {
                await prisma.voucher.update({
                    where: { id: booking.voucherId },
                    data: { usedCount: { increment: 1 } }
                });
            }

            return { paid: true, booking };
        } else {
            return { paid: false, booking };
        }
    },
    confirmBooking: async function (userId, bookingId) {
        const booking = await prisma.booking.findUnique({ where: { id: parseInt(bookingId) } })
        if (!booking || booking.userId !== userId) {
            throw new NotFoundException("Không tìm thấy đơn đặt")
        }
        if (booking.status !== 'PENDING') {
            throw new BadrequestException("Chỉ xác nhận đơn chờ")
        }

        const confirmBooking = await prisma.booking.update({
            where: { id: parseInt(bookingId) },
            data: {
                status: 'CONFIRMED'
            }
        })
        return {
            confirmBooking: confirmBooking
        }

    },
    cancelBooking: async function (userId, bookingId) {
        const booking = await prisma.booking.findUnique({ where: { id: parseInt(bookingId) } })
        if (!booking || booking.userId !== userId) {
            throw new NotFoundException("Không tìm thấy đơn để hủy")
        }
        if (booking.status === 'CANCELED') throw new BadrequestException("Đã bị hủy trước đó");
        if (booking.status !== "PENDING") throw new BadrequestException("Chỉ huỷ đơn đang chờ");
        const cancelBooking = await prisma.booking.update({
            where: { id: parseInt(bookingId) },
            data: {
                status: 'CANCELED'
            }
        })
        return {
            cancelBooking: cancelBooking
        }
    },
    getBookingByStatus: async (userId, status) => {
        const whereClause = { userId };

        if (status) {
            // ✅ Ép kiểu rõ ràng bằng enum
            whereClause.status = BookingStatus[status];
        } else {
            whereClause.status = {
                not: BookingStatus.FINISHED,
            };
        }

        const bookings = await prisma.booking.findMany({
            where: whereClause,
            orderBy: { create_At: "desc" },
            include: {
                room: {
                    include: {
                        hotel: true
                    }
                }
            }
        });

        // ✅ Thêm nights, pricePerNight, totalPrice cho từng đơn
        const bookingsWithDetails = bookings.map((booking) => {
            const checkIn = new Date(booking.checkIn);
            const checkOut = new Date(booking.checkOut);
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

            const basePrice = booking.room.price;
            const discount = booking.room.discount || 0;
            const pricePerNight = Math.round(basePrice * (1 - discount / 100));
            const totalPrice = nights * pricePerNight;

            return {
                ...booking,
                nights,
                pricePerNight,
                calculatedTotalPrice: totalPrice
            };
        });

        return { bookings: bookingsWithDetails };
    },
    getFinishedBookings: async (userId) => {
        const bookings = await prisma.booking.findMany({
            where: {
                userId,
                status: "FINISHED"
            },
            orderBy: { create_At: "desc" },
            include: {
                room: {
                    include: {
                        hotel: true
                    }
                }
            }
        });


        const withDetails = bookings.map((booking) => {
            const checkIn = new Date(booking.checkIn);
            const checkOut = new Date(booking.checkOut);
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

            const pricePerNight = booking.room.discount
                ? Math.round(booking.room.price * (1 - booking.room.discount / 100))
                : booking.room.price;

            const totalPrice = nights * pricePerNight;

            return {
                ...booking,
                nights,
                pricePerNight,
                calculatedTotalPrice: totalPrice
            };
        });

        return { bookings: withDetails };
    },

    updateFinishBooking: async function () {
        const now = new Date();
        console.log("🕐 Đang chạy cron update - Giờ hiện tại:", now.toISOString());

        const result = await prisma.booking.updateMany({
            where: {
                status: "CONFIRMED",
                checkOut: { lt: now }
            },
            data: { status: "FINISHED" }
        });

        console.log("✅ Đã cập nhật", result.count, "booking thành FINISHED");
    },

    addFavoriteHotel: async function (userId, hotelId) {
        const parsedHotelId = parseInt(hotelId)
        const existingFavorite = await prisma.favoriteHotel.findUnique({
            where: {
                userId_hotelId: {
                    userId: userId,
                    hotelId: parsedHotelId,
                },
            },
        });

        if (existingFavorite) {
            throw new BadrequestException("Khách sạn này đã được người dùng yêu thích")
        }

        const favorite = await prisma.favoriteHotel.create({
            data: {
                userId: userId,
                hotelId: parsedHotelId
            }
        })

        return {
            favorite: favorite
        }
    },

    removeFavoriteHotel: async function (userId, hotelId) {
        const parsedHotelId = parseInt(hotelId)
        await prisma.favoriteHotel.delete({
            where: {
                userId_hotelId: {
                    userId: userId,
                    hotelId: parsedHotelId
                }
            }
        })
    },

    getAllFavoriteHotel: async function (userId) {

        const favorites = await prisma.favoriteHotel.findMany({
            where: {
                userId: userId
            },
            include: {
                hotel: true
            }
        })
        return {
            favorites: favorites
        }
    },

    addReview: async function (userId, hotelId, data) {
        const { comment, rating } = data
        const parsedHotelId = parseInt(hotelId);

        const newReview = await prisma.review.create({
            data: {
                userId: userId,
                hotelId: parsedHotelId,
                comment: comment || "",
                rating: rating || 0
            },
            include: {
                user: {
                    select: {
                        fullName: true,
                        avatar: true
                    }
                }
            }


        })

        const avg = await prisma.review.aggregate({
            where: {
                hotelId: parsedHotelId
            },
            _avg: {
                rating: true
            }
        })

        await prisma.hotel.update({
            where: { id: parsedHotelId },
            data: {
                averageRating: avg._avg.rating || 0
            }
        })
        return {
            newReview: newReview
        }
    },

    updateReview: async function (userId, reviewId, data) {
        const parsedReviewId = parseInt(reviewId)
        const { comment, rating } = data

        const existingReview = await prisma.review.findUnique({ where: { id: parsedReviewId } })
        if (!existingReview) {
            throw new NotFoundException("Không tìm thấy đánh giá")
        }

        if (existingReview.userId !== userId) {
            throw new ConflictException("Không có quyền được sửa đánh giá này")
        }

        const updateReview = await prisma.review.update({
            where: { id: parsedReviewId },
            data: {
                comment: comment || "",
                rating: rating || 0
            }
        });

        const avg = await prisma.review.aggregate({
            where: {
                hotelId: existingReview.hotelId
            },
            _avg: {
                rating: true
            }
        })

        await prisma.hotel.update({
            where: { id: existingReview.hotelId },
            data: {
                averageRating: avg._avg.rating || 0
            }
        })
        return {
            updateReview: updateReview
        }
    },

    deleteReview: async function (userId, reviewId) {
        const parsedReviewId = parseInt(reviewId)

        const existingReview = await prisma.review.findUnique({
            where: { id: parsedReviewId }
        })

        if (!existingReview) {
            throw new NotFoundException("Không tìm thấy đánh giá này")
        }
        if (existingReview.userId !== userId) {
            throw new ConflictException("Không có quyền xóa bài viết này")
        }

        await prisma.review.delete({
            where: { id: parsedReviewId }
        })

        const avg = await prisma.review.aggregate({
            where: {
                hotelId: existingReview.hotelId
            },
            _avg: {
                rating: true
            }
        })

        await prisma.hotel.update({
            where: { id: existingReview.hotelId },
            data: {
                averageRating: avg._avg.rating || 0
            }
        })
    },



    getAllReviewHotelByUser: async function (userId) {
        const reviewsUser = await prisma.review.findMany({
            where: { userId: userId },
            select: {
                user: {
                    select: {
                        id: true,
                        avatar: true,
                        fullName: true
                    }
                },
                hotel: {
                    select: {
                        name: true,
                        image: true,
                        averageRating: true
                    }
                }
            },
            orderBy: { create_At: "desc" }
        })
        return {
            reviewsUser: reviewsUser
        }
    },
    statusBooking: async () => {
        const now = new Date();
        const expiredTime = new Date(now.getTime() - 1 * 60 * 1000);

        const statusBooking =  await prisma.booking.updateMany({
            where : {
                status: "PENDING",
                create_At: { lt: expiredTime }
            },
            data : {
                status: "CANCELED"
            }
        })
        if (statusBooking.count > 0) {
            console.log(`Đã hủy ${statusBooking.count} đơn đặt chờ quá hạn.`);
        }
    }

}