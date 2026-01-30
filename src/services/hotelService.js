import { PrismaClient } from '@prisma/client';
import { NotFoundException } from '../helpers/exception.helper.js';
const prisma = new PrismaClient();

export const hotelService = {
    // Lấy danh sách vị trí
    getAllLocaltions: async function () {
        const locations = await prisma.location.findMany();
        return {
            locations: locations
        }

    },
    // Lấy danh sách vị trí (Lấy 6 cái)
    getSomeLocaltions: async function () {
        const locations = await prisma.location.findMany({
            take: 6
        });
        return {
            locations: locations
        }

    },
    // Lấy danh sách khách sạn
    getAllHotels: async function (page) {
        const limit = 12;
        const skip = (page - 1) * limit;
        const hotels = await prisma.hotel.findMany({
            take: limit,
            skip: skip,
            include: {
                location: true,
                reviews: true,
                images: true,
                amenities: {
                    include: {
                        amenity: true
                    },
                }
            }
        });
        const total = await prisma.hotel.count()
        return {
            hotels: hotels,
            pagination: {
                page: page,
                limit: limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    },

    // Đánh giá sao 
    getRatingStatsByHotelId: async function (hotelId) {
        const reviews = await prisma.review.findMany({
            where: { hotelId: hotelId },
            select: {
                rating: true
            }
        });

        const count = {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        }

        for (const r of reviews) {
            const rounded = Math.round(r.rating)
            count[rounded]++;
        }
        const total = reviews.length;

        const percentages = {
            1: total ? (count[1] / total) * 100 : 0,
            2: total ? (count[2] / total) * 100 : 0,
            3: total ? (count[3] / total) * 100 : 0,
            4: total ? (count[4] / total) * 100 : 0,
            5: total ? (count[5] / total) * 100 : 0,
        };

        return { count, percentages };

    },
    // lấy thông tin khách sạn theo id
    getHotelById: async function (hotelId) {
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId },
            include: {
                location: true,
                rooms: {
                    take: 3,
                    select: {
                        name: true,
                        type: true,
                        price: true,
                        discount: true,
                        maxGuests: true,
                        amenities: {
                            include: {
                                amenity: true
                            }
                        }
                    }
                },
                reviews: {
                    orderBy: { create_At: "desc" },
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                avatar: true
                            }
                        }
                    }
                },
                images: true,
                amenities: {
                    include: {
                        amenity: true
                    },
                },
                _count: {
                    select: {
                        reviews: true
                    }
                }
            }
        });
        if (!hotel) {
            throw new NotFoundException("Khách sạn không tồn tại");
        }
        const ratingStats = await hotelService.getRatingStatsByHotelId(hotelId);

        return {
            hotel: hotel,
            reviewCount: hotel._count.reviews,
            ratingStats
        }
    },
    // Lấy khách sạn liên quan tới khu vực
    getHotelsByLocation: async function (locationId) {
        const hotels = await prisma.hotel.findMany({
            where: { locationId: locationId },
            include: {
                location: true,
                images: true,
                amenities: {
                    include: {
                        amenity: true
                    },
                }
            }
        });
        const countHotel = await prisma.hotel.count({
            where: { locationId: locationId }
        })
        if (!hotels || hotels.length === 0) {
            throw new NotFoundException("Không có khách sạn nào ở vị trí này");
        }
        return {
            countHotel: countHotel,
            hotels: hotels

        }
    },
    // Lấy những khách sạn liên quan tới địa điểm và nhận phòng trả phòng và số người
    getSearchAvailableHotels: async function (data) {
        const { locationId, checkIn, checkOut, guests } = data;

        const filters = {
            hotel: {},
        };

        if (locationId) {
            filters.hotel.locationId = parseInt(locationId);
        }

        if (guests) {
            filters.maxGuests = {
                gte: parseInt(guests),
            };
        }

        if (checkIn && checkOut) {
            filters.bookings = {
                none: {
                    OR: [
                        {
                            checkIn: { lte: new Date(checkOut) },
                            checkOut: { gte: new Date(checkIn) }
                        }
                    ]
                }
            };
        }

        const rooms = await prisma.room.findMany({
            where: filters,
            include: {
                hotel: {
                    include: {
                        location: true,
                        images: true,
                    }
                }
            }
        });

        const hotelMap = new Map();
        for (const room of rooms) {
            hotelMap.set(room.hotel.id, room.hotel);
        }

        return {
            count: hotelMap.size,
            hotels: Array.from(hotelMap.values())
        };
    },

    // Lấy tất cả đánh giá của khách sạn đó 
    getAllReviewByHotelId: async function (hotelId) {
        const parsedHotelId = parseInt(hotelId)
        const reviews = await prisma.review.findMany({
            where: { hotelId: parsedHotelId },
            select: {
                comment: true,
                rating: true,
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        avatar: true
                    }
                }
            }
        })
        return {
            reviews: reviews
        }
    },

    getAllImageHotels : async function(page) {
        const limit = 20;
        const skip = (page - 1) * limit;
        const images = await prisma.hotel.findMany({
            take : limit,
            skip : skip,
            select : {
                id : true,
                image   : true,
            }
        })
        const total = await prisma.hotel.count()
        return {
             imagesHotel : images,
            pagination : {
                page : page,
                limit : limit,
                totalPages : Math.ceil(total/limit)
            },
            
        }
    }
}