import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const roomService = {
    // Lấy danh sách phòng theo id khách sạn
    getRoomsByHotelId: async function (hotelId) {
        const rooms = await prisma.room.findMany({
            where: { hotelId: hotelId },
            include: {
                images: true,
                amenities: {
                    include: {
                        amenity: true
                    }
                }
            }
        });
        if (!rooms || rooms.length === 0) {
            throw new NotFoundException("Không có phòng nào trong khách sạn này");
        }

        return {
            rooms: rooms
        }
    },
    // Lấy thông tin phòng theo id
    getRoomById: async function (roomId) {
        const parsedRoomId = parseInt(roomId);
        const room = await prisma.room.findUnique({
            where: { id: parsedRoomId },
            include: {
                images: true,
                amenities: {
                    include: {
                        amenity: true
                    }
                }
            }
        });
        if (!room) {
            throw new NotFoundException("Phòng không tồn tại");
        }
        return {
            room: room
        }
    },
    getAvailableRoomsByHotelId: async function (data) {
        const {hotelId, checkIn, checkOut, guests } = data
        const parsedCheckIn = new Date(checkIn);
        const parsedCheckOut = new Date(checkOut)

        const rooms = await prisma.room.findMany({
            where: {
                hotelId: parseInt(hotelId),
                maxGuests: {
                    gte: parseInt(guests)
                },
                bookings: {
                    none: {
                          status: { in: ['PENDING', 'CONFIRMED'] },
                        OR: [
                            {
                                checkIn: { lte: parsedCheckOut },
                                checkOut: { gte: parsedCheckIn }
                            }
                        ]
                    }
                }
            },
            include: {
                images: true,
                amenities: {
                    include: {
                        amenity: true
                    }
                }
            }
        });
        return {
            availableRooms: rooms
        }
    }
}