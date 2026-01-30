import { PrismaClient } from '@prisma/client';
import { ConflictException, NotFoundException } from '../helpers/exception.helper.js';
import { createSlug } from '../utils/createSlug.js';
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

export const adminService = {

    // Tạo vị trí 
    createLocation: async function (data, imageFile) {
        const { city } = data;
        if (!city) {
            throw new ConflictException("Thiếu trường tên vị trí");
        }

        const existingLocation = await prisma.location.findFirst({ where: { city: city } });
        if (existingLocation) {
            throw new ConflictException("Vị trí đã tồn tại");
        }
        const newLocation = await prisma.location.create({
            data: {
                city: city,
                imageLocation: imageFile
            }
        });
        return {
            newLocation: newLocation
        }
    },
    // Cập nhật vị trí
    updateLocaltion: async function (locationId, data, imageFile) {
        const { city } = data;
        const updateData = {};
        if (city) updateData.city = city;
        if (imageFile) updateData.imageLocation = imageFile;

        const updatedLocation = await prisma.location.update({
            where: { id: locationId },
            data: updateData
        });
        return {
            updatedLocation: updatedLocation
        }
    },

    // Xoá vị trí
    deleteLocation: async function (locationId) {
        const location = await prisma.location.findUnique({
            where: { id: locationId }
        });
        if (!location) {
            throw new ConflictException("Vị trí không tồn tại");
        }
        const hotelCount = await prisma.hotel.count({
            where: { locationId: locationId }
        });
        if (hotelCount > 0) {
            throw new ConflictException("Không thể xoá vị trí vì có khách sạn ");
        }
        await prisma.location.delete({
            where: { id: locationId }
        });
    },
    // Lấy danh sách vị trí
    getAllLocaltionNames: async function () {
        const locations = await prisma.location.findMany({
            select: {
                id: true,
                city: true
            }
        });
        return {
            locations: locations
        }

    },
    getAllLocaltionsForAdmin: async function (page) {
        const limit = 5;
        const skip = (page - 1) * limit;
        const total = await prisma.location.count()
        const locations = await prisma.location.findMany({
            take: limit,
            skip: skip,
            select: {
                id: true,
                imageLocation: true,
                city: true
            }
        })

        return {
            locations: locations,
            pagination: {
                page: page,
                limit: limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    },
    // Tạo tiện nghi 
    createAmenity: async function (data) {
        const { name } = data;
        if (!name) {
            throw new ConflictException("Thiếu trường tên tiện nghi");
        }
        const existingAmenity = await prisma.amenity.findFirst({ where: { name: name } });
        if (existingAmenity) {
            throw new ConflictException("Tiện nghi đã tồn tại");
        }
        const newAmenity = await prisma.amenity.create({
            data: {
                name: name
            }
        });
        return {
            newAmenity: newAmenity
        }
    },
    // Sửa tiện nghi
    updateAmenity: async function (amenityId, data) {
        const { name } = data
        const amenity = await prisma.amenity.findUnique({
            where: { id: amenityId }
        });
        if (!amenity) {
            throw new ConflictException("Tiện nghi không tồn tại");
        }
        const updateAmenity = await prisma.amenity.update({
            where: { id: amenityId },
            data: {
                name: name
            }
        })
        return {
            updateAmenity: updateAmenity
        }
    },
    // Xóa tiện nghi 
    deleteAmenity: async function (amenityId) {
        const amenity = await prisma.amenity.findUnique({
            where: { id: amenityId }
        });
        if (!amenity) {
            throw new ConflictException("Tiện nghi không tồn tại");
        }
        await prisma.amenity.delete({
            where: { id: amenityId }
        })
    },
    // Lấy danh sách tiện nghi
    getAllAmenities: async function () {
        const amenities = await prisma.amenity.findMany();
        return {
            amenities: amenities
        }
    },
    // Tạo khách sạn
    createHotel: async function (data, imageFile) {
        const { name, address, description, locationId, defaultRating, amenities } = data;

        const amenitiesIds = Array.isArray(amenities)
            ? amenities.map(id => parseInt(id))
            : amenities
                ? [parseInt(amenities)]
                : [];

        const existingHotel = await prisma.hotel.findFirst({ where: { name: name } });
        if (existingHotel) {
            throw new ConflictException("Khách sạn đã tồn tại với tên này");
        }
        if (!name || !address || !description || !locationId || !imageFile || !amenitiesIds.length) {
            throw new BadrequestException("Thiếu trường nào đó");
        }

        const parsedLocationId = parseInt(locationId);
        const parsedRating = defaultRating ? parseFloat(defaultRating) : 0;
        const location = await prisma.location.findUnique({
            where: { id: parsedLocationId }
        });
        console.log(location)
        if (!location) {
            throw new NotFoundException("Không tìm thấy vị trí");
        }
        const imageCover = imageFile[0];
        const imageGallery = imageFile.slice(1);

        const newHotel = await prisma.hotel.create({
            data: {
                name: name,
                image: imageCover,
                address: address,
                description: description,
                locationId: parsedLocationId,
                defaultRating: parsedRating
            }
        });

        if (imageGallery.length > 0) {
            const hotelImages = imageGallery.map((image) => ({
                hotelId: newHotel.id,
                imageUrl: image
            }));
            await prisma.hotelImage.createMany({
                data: hotelImages
            });

        }

        if (amenitiesIds.length > 0) {
            const hotelAmenities = amenitiesIds.map((amenityId) => ({
                hotelId: newHotel.id,
                amenityId: amenityId
            }));
            await prisma.hotelAmenity.createMany({
                data: hotelAmenities,
                skipDuplicates: true // Bỏ qua nếu đã tồn tại
            });
        }
        return {
            newHotel: newHotel
        }
    },

    // Lấy danh sách khách sạn
    getAllHotels: async function (locationId, hotelName, page) {
        const limit = 5;
        const skip = (page - 1) * limit;
        const whereCondition = {
            ...(locationId ? { locationId: locationId } : {}),
            ...(hotelName ? { name: { contains: hotelName.toLowerCase() } } : {})
        };
        const hotels = await prisma.hotel.findMany({
            where: whereCondition,
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
        const total = await prisma.hotel.count({
            where: whereCondition
        })
        return {
            hotels: hotels,
            pagination: {
                page: page,
                limit: limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    },


    // Cập nhật khách sạn
    updateHotel: async function (hotelId, data, imageFile) {
        const { name, address, description, locationId, defaultRating, amenities } = data;

        const updateData = {};
        if (name) updateData.name = name;
        if (address) updateData.address = address;
        if (description) updateData.description = description
        if (locationId) {
            const parsedLocationId = parseInt(locationId);
            const location = await prisma.location.findUnique({
                where: { id: parsedLocationId }
            });
            if (!location) {
                throw new NotFoundException("Không tìm thấy vị trí");
            }
            updateData.locationId = parsedLocationId;
        }
        if (defaultRating) {
            const parsedRating = parseFloat(defaultRating);
            updateData.defaultRating = parsedRating;
        }
        if (imageFile) {
            updateData.image = imageFile;
        }

        if (amenities) {
            const amenitiesIds = Array.isArray(amenities)
                ? amenities.map(id => parseInt(id))
                : [parseInt(amenities)];

            await prisma.hotelAmenity.deleteMany({
                where: { hotelId: hotelId }
            });
            const hotelAmenities = amenitiesIds.map((amenityId) => ({
                hotelId: hotelId,
                amenityId: amenityId
            }));

            await prisma.hotelAmenity.createMany({
                data: hotelAmenities,
                skipDuplicates: true // Bỏ qua nếu đã tồn tại
            });

        }



        const updatedHotel = await prisma.hotel.update({
            where: { id: hotelId },
            data: updateData,
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
        return {
            updatedHotel: updatedHotel
        }
    },
    // Xoá khách sạn
    deleteHotel: async function (hotelId) {
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId }
        });
        if (!hotel) {
            throw new NotFoundException("Khách sạn không tồn tại");
        }


        await prisma.hotelImage.deleteMany({
            where: { hotelId }
        });

        await prisma.hotelAmenity.deleteMany({
            where: { hotelId }
        });


        await prisma.review.deleteMany({
            where: { hotelId }
        });


        await prisma.favoriteHotel.deleteMany({
            where: { hotelId }
        });


        const rooms = await prisma.room.findMany({
            where: { hotelId },
            select: { id: true }
        });
        const roomIds = rooms.map(r => r.id);


        await prisma.roomImage.deleteMany({
            where: { RoomId: { in: roomIds } }
        });


        await prisma.roomAmenity.deleteMany({
            where: { roomId: { in: roomIds } }
        });


        await prisma.booking.deleteMany({
            where: { roomId: { in: roomIds } }
        });


        await prisma.room.deleteMany({
            where: { hotelId }
        });


        await prisma.hotel.delete({
            where: { id: hotelId }
        });
    },

    // Lấy danh sách ảnh phụ của khách sạn
    getHotelImages: async function (hotelId, page) {
        const whereCondition = hotelId
            ? { hotelId: hotelId }
            : {}
        const limit = 5;
        const skip = (page - 1) * limit;

        // Lấy ảnh phân trang
        const hotelImages = await prisma.hotelImage.findMany({
            where: whereCondition,
            skip: skip,
            take: limit,
            select: {
                id: true,
                imageUrl: true,
                createdAt: true,
                hotel: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
        });

        const total = await prisma.hotelImage.count({
            where: whereCondition
        });

        return {
            hotelImages: hotelImages,
            pagination: {
                page: page,
                limit: limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    },
    getRoomImages: async function (roomId, page) {
        const whereCondition = roomId
            ? { RoomId: roomId }
            : {}
        const limit = 5;
        const skip = (page - 1) * limit;
        const roomImages = await prisma.roomImage.findMany({
            where: whereCondition,
            take: limit,
            skip: skip,
            select: {
                id: true,
                imageUrl: true,
                createdAt: true,
                room: {
                    select: {
                        id: true,
                        name: true,
                        hotel: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        })
        const total = await prisma.roomImage.count({
            where: whereCondition
        })

        return {
            roomImages: roomImages,
            pagination: {
                page: page,
                limit: limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    },

    getAllRoomName: async function () {
        const roomName = await prisma.room.findMany({
            select: {
                id: true,
                name: true,
                hotel: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        return {
            roomName: roomName
        }
    },


    // Lấy tất cả ảnh phụ của tất cả khách sạn
    getAllHotelImages: async function (page) {
        const limit = 10;
        const skip = (page - 1) * limit
        const hotelImages = await prisma.hotelImage.findMany({
            take: limit,
            skip: skip
        })
        const total = await prisma.hotelImage.count()
        return {
            total: total,
            hotelImages: hotelImages,
            pagination: {
                page: page,
                limit: limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    },

    // Thêm xóa sửa images phụ của khách sạn
    addHotelImage: async function (hotelId, imageFile) {
        const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId }
        })
        if (!hotel) {
            throw new NotFoundException("Khách sạn không tồn tại");
        }
        const newHotelImage = imageFile.map((image) => ({
            hotelId: hotelId,
            imageUrl: image
        }));
        const imageHotelImage = await prisma.hotelImage.createMany({
            data: newHotelImage
        });

        return {
            addImageHotelImage: imageHotelImage
        }
    },
    updateHotelImage: async function (imageId, imageFile) {
        const image = await prisma.hotelImage.findUnique({
            where: { id: imageId }
        })
        if (!image) {
            throw new NotFoundException("Ảnh không tồn tại");
        }
        const updatedImage = await prisma.hotelImage.update({
            where: { id: imageId },
            data: { imageUrl: imageFile }
        });
        return {
            updatedImage: updatedImage
        }
    },
    deleteHotelImage: async function (imageId) {
        const image = await prisma.hotelImage.findUnique({
            where: { id: imageId }
        });
        console.log(image)
        if (!image) {
            throw new NotFoundException("Ảnh không tồn tại");
        }
        await prisma.hotelImage.delete({
            where: { id: imageId }
        });
    },


    // Lấy khách sạn liên quan tới địa điểm
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
        if (!hotels || hotels.length === 0) {
            throw new NotFoundException("Không có khách sạn nào ở vị trí này");
        }
        return {
            hotels: hotels
        }
    },

    // Thêm sửa xóa phòng 
    createRoom: async function (data, imageFile) {
        const { hotelId, name, type, description, price, discount, maxGuests, amenities } = data;
        const amenitiesIds = Array.isArray(amenities)
            ? amenities.map(id => parseInt(id))
            : amenities
                ? [parseInt(amenities)]
                : [];
        if (!hotelId || !name || !type || !description || !price || !maxGuests || !imageFile || !amenitiesIds.length || !discount) {
            throw new ConflictException("Thiếu trường nào đó");
        }
        const parsedHotelId = parseInt(hotelId);
        const hotel = await prisma.hotel.findUnique({
            where: { id: parsedHotelId }
        });
        if (!hotel) {
            throw new NotFoundException("Không tìm thấy khách sạn");
        }

        const existingRoom = await prisma.room.findFirst({ where: { name: name, hotelId: parsedHotelId } });
        if (existingRoom) {
            throw new ConflictException("Phòng đã tồn tại với tên này trong khách sạn");
        }


        const imageCover = imageFile[0];
        const imageGallery = imageFile.slice(1);

        const newRoom = await prisma.room.create({
            data: {
                hotelId: parsedHotelId,
                name: name,
                type: type,
                description: description,
                price: parseInt(price),
                discount: parseInt(discount),
                maxGuests: parseInt(maxGuests),
                image: imageCover
            }
        });

        if (imageGallery.length > 0) {
            const roomImages = imageGallery.map((image) => {
                return {
                    RoomId: newRoom.id,
                    imageUrl: image
                }
            });
            await prisma.roomImage.createMany({
                data: roomImages
            });
        }

        if (amenitiesIds.length > 0) {
            const roomAmenities = amenitiesIds.map((amenityId) => ({
                roomId: newRoom.id,
                amenityId: amenityId
            }));
            await prisma.roomAmenity.createMany({
                data: roomAmenities,
                skipDuplicates: true // Bỏ qua nếu đã tồn tại
            });
        }

        return {
            newRoom: newRoom
        }
    },

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

    // Cập nhật phòng
    updateRoom: async function (roomId, data, imageFile) {
        const { name, type, description, price, discount, maxGuests, amenities } = data;
        const updateData = {};
        if (name) updateData.name = name;
        if (type) updateData.type = type;
        if (description) updateData.description = description;
        if (price) updateData.price = parseInt(price);
        if (discount) updateData.discount = parseInt(discount);
        if (maxGuests) updateData.maxGuests = parseInt(maxGuests);
        if (imageFile) {
            updateData.image = imageFile;
        }
        const parsedRoomId = parseInt(roomId);
        const room = await prisma.room.findUnique({
            where: { id: parsedRoomId }
        });
        if (!room) {
            throw new NotFoundException("Phòng không tồn tại");
        }

        if (amenities) {
            const amenitiesIds = Array.isArray(amenities)
                ? amenities.map(id => parseInt(id))
                : [parseInt(amenities)];

            await prisma.roomAmenity.deleteMany({
                where: { roomId: parsedRoomId }
            });
            const roomAmenities = amenitiesIds.map((amenityId) => ({
                roomId: parsedRoomId,
                amenityId: amenityId
            }));

            await prisma.roomAmenity.createMany({
                data: roomAmenities,
                skipDuplicates: true // Bỏ qua nếu đã tồn tại
            });
        }

        const updatedRoom = await prisma.room.update({
            where: { id: parsedRoomId },
            data: updateData,
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
            updatedRoom: updatedRoom
        }
    },

    // Xoá phòng
    deleteRoom: async function (roomId) {
        const parsedRoomId = parseInt(roomId);
        const room = await prisma.room.findUnique({
            where: { id: parsedRoomId }
        });
        if (!room) {
            throw new NotFoundException("Phòng không tồn tại");
        }
        await prisma.roomImage.deleteMany({
            where: { RoomId: parsedRoomId }
        });
        await prisma.roomAmenity.deleteMany({
            where: { roomId: parsedRoomId }
        });
        await prisma.booking.deleteMany({
            where: { roomId: parsedRoomId }
        });
        await prisma.room.delete({
            where: { id: parsedRoomId }
        });
    },
    // Tạo ảnh phụ của phòng 
    addRoomImages: async function (RoomId, imageFile) {
        const room = await prisma.room.findUnique({
            where: { id: RoomId }
        });
        if (!room) {
            throw new NotFoundException("Phòng không tồn tại");
        }
        const newRoomImages = imageFile.map((image) => ({
            RoomId: RoomId,
            imageUrl: image
        }));

        const roomImages = await prisma.roomImage.createMany({
            data: newRoomImages
        });

        return {
            roomImages: roomImages
        };
    },
    // Cập nhật ảnh phụ của phòng
    updateRoomImages: async function (imageId, imageFile) {
        const image = await prisma.roomImage.findUnique({
            where: { id: imageId }
        });
        if (!image) {
            throw new NotFoundException("Ảnh không tồn tại");
        }
        const updatedImage = await prisma.roomImage.update({
            where: { id: imageId },
            data: { imageUrl: imageFile }
        });
        return {
            updatedImage: updatedImage
        }
    },
    // Xóa ảnh phụ của phòng
    deleteRoomImage: async function (imageId) {
        const image = await prisma.roomImage.findUnique({
            where: { id: imageId }
        });
        if (!image) {
            throw new NotFoundException("Ảnh không tồn tại");
        }
        await prisma.roomImage.delete({
            where: { id: imageId }
        });
    },


    // Tạo ảnh phụ của phòng 
    addRoomImage: async function (roomId, imageFile) {
        const parsedRoomId = parseInt(roomId);
        const room = await prisma.room.findUnique({
            where: { id: parsedRoomId }
        });
        if (!room) {
            throw new NotFoundException("Phòng không tồn tại");
        }
        const newRoomImage = imageFile.map((image) => ({
            RoomId: parsedRoomId,
            imageUrl: image
        }));
        const roomImages = await prisma.roomImage.createMany({
            data: newRoomImage
        });
        return {
            roomImages: roomImages
        }
    },

    // Cập nhật ảnh phụ của phòng
    updateRoomImage: async function (imageId, imageFile) {
        const image = await prisma.roomImage.findUnique({
            where: { id: imageId }
        });
        if (!image) {
            throw new NotFoundException("Ảnh không tồn tại");
        }
        const updatedImage = await prisma.roomImage.update({
            where: { id: imageId },
            data: { imageUrl: imageFile }
        });
        return {
            updatedImage: updatedImage
        }
    },

    // Xóa ảnh phụ của phòng
    deleteRoomImage: async function (imageId) {
        const image = await prisma.roomImage.findUnique({
            where: { id: imageId }
        });
        if (!image) {
            throw new NotFoundException("Ảnh không tồn tại");
        }
        await prisma.roomImage.delete({
            where: { id: imageId }
        });
    },

    getAllHotelNames: async function () {
        const hotelNames = await prisma.hotel.findMany({
            select: {
                id: true,
                name: true
            }
        });
        return {
            hotelNames: hotelNames
        }
    },
    // Lấy danh sách phòng 
    getAllRooms: async function (hotelId, roomName, page) {
        const limit = 5;
        const skip = (page - 1) * limit;
        const whereCondition = {
            ...(hotelId ? { hotelId: hotelId } : {}),
            ...(roomName ? { name: { contains: roomName.toLowerCase() } } : {})
        };
        const rooms = await prisma.room.findMany({
            where: whereCondition,
            take: limit,
            skip: skip,
            include: {
                hotel: true,
                images: true,
                amenities: {
                    include: {
                        amenity: true
                    }
                }
            }
        });
        const total = await prisma.room.count({
            where: whereCondition
        })
        return {
            rooms: rooms,
            pagination: {
                page: page,
                limit: limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    },

    // Tạo blog
    createBlog: async function (data, imageFile) {
        const { title, content, author, locationId, summary } = data;

        if (!title || !content || !author || !locationId || !imageFile || !summary) {
            throw new ConflictException("Thiếu trường nào đó");
        }
        const slug = createSlug(title);
        const blog = await prisma.blogPost.findUnique({
            where: { slug: slug }
        });
        if (blog) {
            throw new ConflictException("Blog đã tồn tại");
        }
        const newBlog = await prisma.blogPost.create({
            data: {
                title: title,
                content: content,
                author: author || "",
                locationId: parseInt(locationId),
                image: imageFile,
                slug: slug,
                summary: summary
            },
            include: {
                location: true
            }
        });
        return {
            blog: newBlog
        }
    },

    // Cập nhật blog
    // Cập nhật blog
    updateBlog: async function (blogId, data, imageFile) {
        const { title, content, author, locationId, summary } = data;

        if (!title || !content || !author || !locationId || !summary) {
            throw new ConflictException("Thiếu trường nào đó");
        }

        const blog = await prisma.blogPost.findUnique({
            where: { id: blogId }
        });
        if (!blog) {
            throw new NotFoundException("Blog không tồn tại");
        }

        const slug = createSlug(title);
        if (blog.slug !== slug) {
            const slugExist = await prisma.blogPost.findUnique({
                where: { slug }
            });
            if (slugExist) {
                throw new ConflictException("Slug đã tồn tại");
            }
        }

        const updatedBlog = await prisma.blogPost.update({
            where: { id: blogId },
            data: {
                title: title,
                content: content,
                author: author || "",
                locationId: parseInt(locationId),
                image: imageFile,
                slug: slug,
                summary: summary
            },
            include: {
                location: true
            }
        });

        return {
            blog: updatedBlog
        };
    },

    // Xoá blog
    deleteBlog: async function (blogId) {
        const blog = await prisma.blogPost.findUnique({
            where: { id: blogId }
        });
        if (!blog) {
            throw new NotFoundException("Blog không tồn tại");
        }
        await prisma.blogPost.delete({
            where: { id: blogId }
        });
    },

    // Tạo người dùng
    createUser: async function (data, avatarPath) {
        const { firstName, lastName, email, password, role, gender } = data;
        if (!firstName || !lastName || !email || !password || !role || !gender) {
            throw new ConflictException("Thiếu trường nào đó");
        }
        const existingUser = await prisma.user.findUnique({
            where: { email: email }
        });
        if (existingUser) {
            throw new ConflictException("Người dùng đã tồn tại với email này");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                firstName: firstName,
                lastName: lastName,
                fullName: `${firstName} ${lastName}`,
                email: email,
                credentials: {
                    create: {
                        password: hashedPassword,
                        provider: "local"
                    }
                },
                role: role,
                gender: gender,
                avatar: avatarPath || ""
            }
        });
        return {
            user: newUser
        }
    },

    // update người dùng
    updateUser: async function (userId, data, avatarPath) {
        const { firstName, lastName, email, role, gender } = data;

        if (!firstName || !lastName || !email || !role || !gender) {
            throw new ConflictException("Thiếu trường nào đó");
        }

        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!existingUser) {
            throw new NotFoundException("Người dùng không tồn tại");
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName: firstName,
                lastName: lastName,
                fullName: `${firstName} ${lastName}`,
                email: email,
                role: role,
                gender: gender,
                avatar: avatarPath
            }
        });
        return {
            user: updatedUser
        };
    },

    // Xoá người dùng
    deleteUser: async function (userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundException("Người dùng không tồn tại");
        }

        // Xoá các dữ liệu liên quan
        await prisma.booking.deleteMany({ where: { userId } });
        await prisma.review.deleteMany({ where: { userId } });
        await prisma.favoriteHotel.deleteMany({ where: { userId } });
        await prisma.credential.deleteMany({ where: { userId } });

        // Xoá người dùng
        await prisma.user.delete({
            where: { id: userId }
        });
    },

    // Lấy danh sách người dùng
    getAllUsers: async function (currentUser, page, fullName) {
        const limit = 10;
        const skip = (page - 1) * limit;

        const whereCondition = {
            NOT: { id: currentUser },
            ...(fullName && {
                fullName: {
                    contains: fullName.toLowerCase(),
                }
            })
        };

        const users = await prisma.user.findMany({
            take: limit,
            skip: skip,
            where: whereCondition,
        });

        const total = await prisma.user.count({
            where: whereCondition,
        });

        return {
            users: users,
            pagination: {
                page: page,
                limit: limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    },


    getAllBlogs: async function (locationId, blogTitle, page) {
        const limit = 5;
        const skip = (page - 1) * limit;
        const whereCondition = {
            ...(locationId ? { locationId: locationId } : {}),
            ...(blogTitle ? { title: { contains: blogTitle.toLowerCase() } } : {})
        }
        const blogs = await prisma.blogPost.findMany({
            where: whereCondition,
            skip: skip,
            take: limit,
            orderBy: {
                create_At: 'desc'
            },
            select: {
                id: true,
                location: true,
                title: true,
                summary: true,
                image: true,
                content: true,
                author: true,
                slug: true,
                create_At: true,
                update_At: true,
            }
        })
        const total = await prisma.blogPost.count({
            where: whereCondition
        });

        return {
            blogs: blogs,
            pagination: {
                page: page,
                limit: limit,
                total: total,
                totalPages: Math.ceil(total / limit)
            }
        };
    },

    getAllBooking: async function (status, page) {
        const limit = 5;
        const skip = (page - 1) * limit;
        let statusFilter = undefined;
        if (status && status !== 'ALL') {
            statusFilter = status;
        } else {
            statusFilter = { in: ['CONFIRMED', 'FINISHED'] };
        }
        const bookings = await prisma.booking.findMany({
            take: limit,
            skip: skip,
            where: {
                status: statusFilter
            },
            include: {
                user: true,
                room: {
                    include: {
                        hotel: true
                    }
                }
            }
        })
        const total = await prisma.booking.count({
            where: {
                status: statusFilter
            },
        })
        return {
            bookings: bookings,
            pagination: {
                page: page,
                limit: limit,
                total: total,
                totalPages: Math.ceil(total / limit)
            }
        }
    },
    createVoucher: async function (data) {
        const { code, discount, expiresAt, usageLimit, perUserLimit } = data;

        if (!code || !discount || !expiresAt || !usageLimit || !perUserLimit) {
            throw new ConflictException("Thiếu trường nào đó");
        }
        const existingVoucher = await prisma.voucher.findUnique({
            where: { code: code }
        });
        if (existingVoucher) {
            throw new ConflictException("Mã giảm giá đã tồn tại với code này");
        }
        const newVoucher = await prisma.voucher.create({
            data: {
                code: code,
                discount: parseInt(discount),
                expiresAt: new Date(expiresAt),
                usageLimit: parseInt(usageLimit),
                perUserLimit: parseInt(perUserLimit),
            }
        });
        return {
            voucher: newVoucher
        }

    },
    updateVoucher: async function (voucherId, data) {
        const { expiresAt, isActive, usageLimit, perUserLimit } = data;
        const updateData = {};
        if (expiresAt) updateData.expiresAt = new Date(expiresAt);
        if (isActive) updateData.isActive = isActive === 'true' ? true : false;
        if (usageLimit) updateData.usageLimit = parseInt(usageLimit);
        if (perUserLimit) updateData.perUserLimit = parseInt(perUserLimit);
        const voucher = await prisma.voucher.findUnique({
            where: { id: parseInt(voucherId) }
        });
        if (!voucher) {
            throw new NotFoundException("Không tìm thấy voucher");
        }
        const updatedVoucher = await prisma.voucher.update({
            where: { id: parseInt(voucherId) },
            data: updateData
        });
        return {
            voucher: updatedVoucher
        };
    },
    getVoucherById: async function (voucherId) {
        const voucher = await prisma.voucher.findUnique({
            where: { id: parseInt(voucherId) }
        })

        if (!voucher) {
            throw new NotFoundException("Không tìm thấy voucher");
        }
        return {
            voucher: voucher
        }
    },
    getAllVoucher: async function (codeName, page) {
        const limit = 5;
        const skip = (page - 1) * limit;
        const whereCondition = {
            ...(codeName ? { code: { contains: codeName.toLowerCase() } } : {})
        }
        const vouchers = await prisma.voucher.findMany({
            take: limit,
            skip: skip,
            where: whereCondition,
            orderBy: {
                create_At: 'desc'
            }
        })
        const totalVoucher = await prisma.voucher.count({
            where: whereCondition
        });
        return {
            vouchers: vouchers,
            pagination: {
                page: page,
                limit: limit,
                total: totalVoucher,
                totalPages: Math.ceil(totalVoucher / limit)
            }
        }
    },
    updateActiveVoucher: async function () {
        const now = new Date()
        console.log("Đang chạy cron update - Giờ hiện tại ", now.toISOString())

        const result = await prisma.voucher.updateMany({
            where: {
                isActive: true,
                expiresAt: { lt: now }
            },
            data: {
                isActive: false,
            }
        })
        console.log("Đã cập nhật", result.count, "Đã hết hạn voucher")
    },
    getAllUserUseVoucher: async function (currentUser, codeName, page) {
        const limit = 5;
        const skip = (page - 1) * limit;


        const whereCondition = {
            NOT: { id: currentUser.id },
            bookings: {
                some: {
                    voucherId: { not: null },
                    ...(codeName
                        ? {
                            Voucher: {
                                code: { contains: codeName.toLowerCase() },
                            },
                        }
                        : {}),
                },
            },
        };


        const userVoucher = await prisma.user.findMany({
            where: whereCondition,
            take: limit,
            skip: skip,
            orderBy: {
                create_At: "desc",
            },
            select: {
                id: true,
                fullName: true,
                avatar: true,
                email: true,
                role: true,
                bookings: {
                    where: {
                        voucherId: { not: null },
                        ...(codeName
                            ? {
                                Voucher: {
                                    code: { contains: codeName.toLowerCase() },
                                },
                            }
                            : {}),
                    },
                    select: {
                        Voucher: {
                            select: {
                                id: true,
                                code: true,
                                discount: true,
                                expiresAt: true,
                            },
                        },
                    },
                },
            },
        });

        // Tổng số user có sử dụng voucher
        const totalvoucher = await prisma.user.count({
            where: whereCondition,
        });

        return {
            userVoucher,
            pagination: {
                page: page,
                limit: limit,
                total: totalvoucher,
                totalPage: Math.ceil(totalvoucher / limit),
            },
        };
    }


};