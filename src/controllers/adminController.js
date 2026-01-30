import { BadrequestException } from "../helpers/exception.helper.js";
import { responseSuccess } from "../helpers/response.helper.js";
import { adminService } from "../services/adminService.js";


export const adminController = {
    // Tạo vị trí
    createLocation: async function (req, res, next) {
        try {
            const imageFile = req.file?.path;
            const { newLocation } = await adminService.createLocation(req.body, imageFile);
            const response = responseSuccess(newLocation, "Tạo vị trí thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Tạo vị trí không thành công", err);
            next(err);
        }
    },

    // update vị trí
    updateLocation: async function (req, res, next) {
        try {
            const locationId = parseInt(req.params.id);
            const imageFile = req.file?.path;
            const { updatedLocation } = await adminService.updateLocaltion(locationId, req.body, imageFile);
            const response = responseSuccess(updatedLocation, "Cập nhật vị trí thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Cập nhật vị trí không thành công", err);
            next(err);
        }
    },
    // Xoá vị trí
    deleteLocation: async function (req, res, next) {
        try {
            const locationId = parseInt(req.params.id);
            await adminService.deleteLocation(locationId);
            const response = responseSuccess(null, "Xoá vị trí thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Xoá vị trí không thành công", err);
            next(err);
        }
    },
    // Lấy danh sách vị trí
    getAllLocaltionNames: async function (req, res, next) {
        try {
            const locations = await adminService.getAllLocaltionNames();
            const response = responseSuccess(locations, "Lấy danh sách vị trí thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách vị trí không thành công", err);
            next(err);
        }
    },
    getAllLocaltionsForAdmin: async function (req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1
            const locations = await adminService.getAllLocaltionsForAdmin(page);
            const response = responseSuccess(locations, "Lấy danh sách vị trí thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách vị trí không thành công", err);
            next(err);
        }
    },
    // Tạo tiện nghi
    createAmenity: async function (req, res, next) {
        try {
            const newAmenity = await adminService.createAmenity(req.body);
            const response = responseSuccess(newAmenity, "Tạo tiện nghi thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Tạo tiện nghi không thành công", err);
            next(err);
        }

    },
    updateAmenity: async function (req, res, next) {
        try {
            const amenityId = req.params.id;

            const updateAmenity = await adminService.updateAmenity(amenityId, req.body)
            const response = responseSuccess(updateAmenity, "Cập nhật tiện nghi thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật tiện nghi không thành công", err);
            next(err);
        }
    },
    deleteAmenity: async function (req, res, next) {
        try {
            const amenityId = req.params.id;
            await adminService.deleteAmenity(amenityId)
            const response = responseSuccess(null, "Xóa tiện nghi thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Xóa tiện nghi không thành công", err);
            next(err);
        }

    },
    // Lấy danh sách tiện nghi
    getAllAmenities: async function (req, res, next) {
        try {
            const amenities = await adminService.getAllAmenities();
            const response = responseSuccess(amenities, "Lấy danh sách tiện nghi thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách tiện nghi không thành công", err);
            next(err);
        }
    },
    // Tạo khách sạn
    createHotel: async function (req, res, next) {
        try {
            const imageFile = req.files?.map(file => file.path) || [];
            const { newHotel } = await adminService.createHotel(req.body, imageFile)
            const response = responseSuccess(newHotel, "Tạo khách sạn thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Tạo khách sạn không thành công", err)
            next(err)
        }
    },

    // Lấy danh sách khách sạn
    getAllHotels: async function (req, res, next) {
        try {
            const hotelName = req.query.hotelName || "";
            const locationId = parseInt(req.query.locationId) || "";
            const page = parseInt(req.query.page) || 1
            const hotels = await adminService.getAllHotels(locationId, hotelName, page);
            const response = responseSuccess(hotels, "Lấy danh sách khách sạn thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách khách sạn không thành công", err);
            next(err);
        }
    },
    // Cập nhật khách sạn 
    updateHotel: async function (req, res, next) {
        try {
            const hotelId = parseInt(req.params.id);
            const imageFile = req.file?.path;
            const { updatedHotel } = await adminService.updateHotel(hotelId, req.body, imageFile);
            const response = responseSuccess(updatedHotel, "Cập nhật khách sạn thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Cập nhật khách sạn không thành công", err);
            next(err);
        }
    },

    deleteHotel: async function (req, res, next) {
        try {
            const hotelId = parseInt(req.params.id);
            await adminService.deleteHotel(hotelId);
            const response = responseSuccess(null, "Xoá khách sạn thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Xoá khách sạn không thành công", err);
            next(err);
        }
    },
    // Lấy danh sách ảnh phụ của khách sạn theo hotelId
    getHotelImages: async function (req, res, next) {
        const hotelId = parseInt(req.query.hotelId);
        const page = parseInt(req.query.page) || 1
        try {
            const hotelImages = await adminService.getHotelImages(hotelId, page);
            const response = responseSuccess(hotelImages, "Lấy danh sách ảnh phụ của khách sạn thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách ảnh phụ khách sạn đó không thành công", err);
            next(err);
        }
    },
    getRoomImages: async function (req, res, next) {
        const roomId = parseInt(req.query.roomId);
        const page = parseInt(req.query.page) || 1
        try {
            const roomImages = await adminService.getRoomImages(roomId, page);
            const response = responseSuccess(roomImages, "Lấy danh sách ảnh phụ của phòng thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách ảnh phụ phòng không thành công", err);
            next(err);
        }
    },
    getAllHotelImages: async function (req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1
            const hotelImages = await adminService.getAllHotelImages(page);
            const response = responseSuccess(hotelImages, "Lấy danh sách ảnh khách sạn phụ thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách ảnh phụ khách sạn không thành công", err);
            next(err);
        }
    },
    getAllRoomName: async function (req, res, next) {
        try {
            const roomName = await adminService.getAllRoomName();
            const response = responseSuccess(roomName, "Lấy danh sách tên phòng thành công thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách tên phòng thành công không thành công", err);
            next(err);
        }
    },
    // Thêm sửa xóa ảnh phụ của khách sạn
    addHotelImage: async function (req, res, next) {
        const hotelId = parseInt(req.params.hotelId);
        const imageFile = req.files?.map(file => file.path) || [];
        if (!imageFile || imageFile.length === 0) {
            throw { status: 400, message: "Ảnh không tải lên" };
        }
        try {
            const newImages = await adminService.addHotelImage(hotelId, imageFile);
            const response = responseSuccess(newImages, "Thêm ảnh khách sạn thành công");
            return res.status(response.status).json(response);
        } catch (err) {
            console.error("Thêm ảnh khách sạn không thành công", err);
            next(err);

        }
    },

    updateHotelImage: async function (req, res, next) {
        const imageId = parseInt(req.params.id);
        const imageFile = req.file?.path;
        if (!imageFile) {
            return res.status(400).json({ message: "Ảnh không tải lên" });
        }
        try {
            const updatedImage = await adminService.updateHotelImage(imageId, imageFile);
            const response = responseSuccess(updatedImage, "Cập nhật ảnh khách sạn thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Cập nhật ảnh khách sạn không thành công", err);
            next(err);
        }
    },
    deleteHotelImage: async function (req, res, next) {
        const imageId = parseInt(req.params.id);
        try {
            await adminService.deleteHotelImage(imageId);
            const response = responseSuccess(null, "Xoá ảnh khách sạn thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Xoá ảnh khách sạn không thành công", err);
            next(err);
        }
    },


    // Lấy khách sạn theo khu vực
    getHotelsByLocation: async function (req, res, next) {
        const locationId = parseInt(req.params.locationId);
        try {
            const hotels = await adminService.getHotelsByLocation(locationId);
            const response = responseSuccess(hotels, "Lấy danh sách khách sạn theo khu vực thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách khách sạn theo khu vực không thành công", err);
            next(err);
        }
    },

    // Tạo phòng của khách sạn đó
    createRoom: async function (req, res, next) {
        try {
            const imageFile = req.files?.map(file => file.path) || [];
            const newRoom = await adminService.createRoom(req.body, imageFile);
            const response = responseSuccess(newRoom, "Tạo phòng thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Tạo phòng không thành công", err);
            next(err);
        }
    },
    // update phòng của khách sạn
    updateRoom: async function (req, res, next) {
        const roomId = parseInt(req.params.id);
        const imageFile = req.file?.path;
        try {
            const updatedRoom = await adminService.updateRoom(roomId, req.body, imageFile);
            const response = responseSuccess(updatedRoom, "Cập nhật phòng thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Cập nhật phòng không thành công", err);
            next(err);
        }
    },

    // Xoá phòng của khách sạn
    deleteRoom: async function (req, res, next) {
        const roomId = parseInt(req.params.id);
        try {
            await adminService.deleteRoom(roomId);
            const response = responseSuccess(null, "Xoá phòng thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Xoá phòng không thành công", err);
            next(err);
        }
    },
    // Tạo ảnh phụ cho phòng
    addRoomImage: async function (req, res, next) {
        const roomId = parseInt(req.params.roomId);
        const imageFile = req.files?.map(file => file.path) || [];
        if (!imageFile || imageFile.length === 0) {
            throw new BadrequestException("Ảnh không tải lên");
        }
        try {
            const newImages = await adminService.addRoomImage(roomId, imageFile);
            const response = responseSuccess(newImages, "Thêm ảnh phòng thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Thêm ảnh phòng không thành công", err);
            next(err);
        }
    },
    // Cập nhật ảnh phụ của phòng
    updateRoomImage: async function (req, res, next) {
        const imageId = parseInt(req.params.id);
        const imageFile = req.file?.path;
        if (!imageFile) {
            throw new BadrequestException("Ảnh không tải lên");
        }
        try {
            const updatedImage = await adminService.updateRoomImage(imageId, imageFile);
            const response = responseSuccess(updatedImage, "Cập nhật ảnh phòng thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Cập nhật ảnh phòng không thành công", err);
            next(err);
        }
    },
    // Xóa ảnh phụ của phòng
    deleteRoomImage: async function (req, res, next) {
        const imageId = parseInt(req.params.id);
        try {
            await adminService.deleteRoomImage(imageId);
            const response = responseSuccess(null, "Xóa ảnh phòng thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Xóa ảnh phòng không thành công", err);
            next(err);
        }
    },
    // Lấy danh sách phòng 
    getAllRooms: async function (req, res, next) {
        try {
            const hotelId = parseInt(req.query.hotelId) || "";
            const roomName = req.query.roomName || "";
            const page = parseInt(req.query.page) || 1;
            const rooms = await adminService.getAllRooms(hotelId, roomName, page);
            const response = responseSuccess(rooms, "Lấy danh sách phòng thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách phòng không thành công", err);
            next(err);
        }

    },
    // Tạo blog
    createBlog: async function (req, res, next) {
        try {
            const imageFile = req.file?.path;
            const newBlog = await adminService.createBlog(req.body, imageFile);
            const response = responseSuccess(newBlog, "Tạo blog thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Tạo blog không thành công", err);
            next(err);
        }
    },
    // Cập nhật blog 
    updateBlog: async function (req, res, next) {
        const blogId = parseInt(req.params.id);
        const imageFile = req.file?.path;
        try {
            const updatedBlog = await adminService.updateBlog(blogId, req.body, imageFile);
            const response = responseSuccess(updatedBlog, "Cập nhật blog thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Cập nhật blog không thành công", err);
            next(err);
        }
    },
    // Xóa blog
    deleteBlog: async function (req, res, next) {
        const blogId = parseInt(req.params.id);
        try {
            await adminService.deleteBlog(blogId);
            const response = responseSuccess(null, "Xoá blog thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Xoá blog không thành công", err);
            next(err);
        }
    },
    // Tạo sửa xóa người dùng ở admin
    createUser: async function (req, res, next) {
        try {
            const avatarPath = req.file?.path;
            const newUser = await adminService.createUser(req.body, avatarPath);
            const response = responseSuccess(newUser, "Tạo người dùng thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Tạo người dùng không thành công", err);
            next(err);
        }
    },
    updateUser: async function (req, res, next) {
        const userId = parseInt(req.params.id);
        const avatarPath = req.file?.path;
        try {
            const updatedUser = await adminService.updateUser(userId, req.body, avatarPath);
            const response = responseSuccess(updatedUser, "Cập nhật người dùng thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Cập nhật người dùng không thành công", err);
            next(err);
        }
    },
    deleteUser: async function (req, res, next) {

        try {
            const userId = parseInt(req.params.id);
            await adminService.deleteUser(userId);
            const response = responseSuccess(null, "Xoá người dùng thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Xoá người dùng không thành công", err);
            next(err);
        }
    },
    // Lấy danh sách người dùng
    getAllUsers: async function (req, res, next) {

        try {
            const currentUser = req.user.id; // Lấy id của người dùng hiện tại
            const page = parseInt(req.query.page) || 1
            const fullName = req.query.fullName || "";
            const users = await adminService.getAllUsers(currentUser, page, fullName);
            const response = responseSuccess(users, "Lấy danh sách người dùng thành công");
            res.status(response.status).json(response);
        } catch (error) {
            console.error("Lấy danh sách người dùng không thành công", error);
            next(error);
        }
    },
    // Lấy danh sách phòng của khách sạn
    getRoomsByHotelId: async function (req, res, next) {
        const hotelId = parseInt(req.params.hotelId);
        try {
            const rooms = await adminService.getRoomsByHotelId(hotelId);
            const response = responseSuccess(rooms, "Lấy danh sách phòng thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách phòng không thành công", err);
            next(err);
        }
    },
    getAllBlogs: async function (req, res, next) {
        try {
            const locationId = parseInt(req.query.locationId) || "";
            const blogTitle = req.query.blogTitle || ""
            const page = parseInt(req.query.page) || 1;
            const blogs = await adminService.getAllBlogs(locationId, blogTitle, page);
            const response = responseSuccess(blogs, "Lấy danh sách blog thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách blog không thành công", err);
            next(err);
        }
    },
    getAllHotelNames: async function (req, res, next) {
        try {
            const hotelNames = await adminService.getAllHotelNames();
            const response = responseSuccess(hotelNames, "Lấy danh sách tên khách sạn thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách tên khách sạn không thành công", err);
            next(err);
        }
    },

    getAllBooking: async function (req, res, next) {
        try {
            const status = req.query.status;
            const page = parseInt(req.query.page) || 1
            const bookings = await adminService.getAllBooking(status, page);
            const response = responseSuccess(bookings, `Lấy danh sách bookings ở trạng thái ${status ? status : "CONFIRMED & FINISHED"}  thành công`);
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách bookings không thành công", err);
            next(err);
        }
    },
    createVoucher: async function (req, res, next) {
        try {
            const newVoucher = await adminService.createVoucher(req.body);
            const response = responseSuccess(newVoucher, "Tạo voucher thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Tạo voucher không thành công", err);
            next(err);
        }
    },
    updateVoucher: async function (req, res, next) {
        try {
            const voucherId = parseInt(req.params.id);
            console.log("voucherId", voucherId)

            const updatedVoucher = await adminService.updateVoucher(voucherId, req.body);
            const response = responseSuccess(updatedVoucher, "Cập nhật voucher thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Cập nhật voucher không thành công", err);
            next(err);
        }
    },
    getVoucherById: async function (req, res, next) {
        try {
            const voucherId = parseInt(req.params.id);
            const voucher = await adminService.getVoucherById(voucherId);
            const response = responseSuccess(voucher, "Lấy thông tin voucher thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy thông tin voucher không thành công", err);
            next(err);
        }
    },
    getAllVouchers: async function (req, res, next) {
        try {
            const codeName = req.query.codeName || "";
            const page = parseInt(req.query.page) || 1
            const vouchers = await adminService.getAllVoucher(codeName, page);
            const response = responseSuccess(vouchers, "Lấy danh sách voucher thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách voucher không thành công", err);
            next(err);
        }
    },
    getAllUserUseVoucher: async function (req, res, next) {
        try {
            const userId = req.user
            const codeName = req.query.codeName || ""
            const page = parseInt(req.query.page) || 1
            const userUserVoucher = await adminService.getAllUserUseVoucher(userId, codeName, page)
            const response = responseSuccess(userUserVoucher, "Lấy danh sách người dùng voucher thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách người dùng voucher không thành công", err);
            next(err);
        }
    }
};