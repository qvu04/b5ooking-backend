import { responseSuccess } from "../helpers/response.helper.js";
import { userService } from "../services/userService.js";


export const userController = {
    updateUser: async function (req, res, next) {
        try {
            const userId = req.user.id;
            const avatarPath = req.file?.path;
            const updateUser = await userService.updateProfile(userId, req.body, avatarPath);
            const response = responseSuccess(updateUser, "Cập nhật người dùng thành công");
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Cập nhật người dùng không thành công", err)
            next(err)
        }
    },
    checkVoucher: async function (req, res, next) {
        try {
            const userId = req.user.id;
            const data = await userService.checkVoucher(userId,req.body);
            const response = responseSuccess(data, "Kiểm tra voucher thành công");
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Kiểm tra voucher không thành công", err);
            next(err);
        }
    },

    bookingRoom: async function (req, res, next) {
        try {
            const userId = req.user.id;
            const newBooking = await userService.bookingRoom(userId, req.body);
            const response = responseSuccess(newBooking, "Booking thành công");
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Booking không thành công", err)
            next(err)
        }
    },
    createStripeSession : async function (req,res,next) {
        try {
            const session = await userService.createStripeSession(req.body);
            const response = responseSuccess(session, "Tạo phiên thanh toán thành công");
            res.status(response.status).json(response);
        } catch (error) {
            console.error("Tạo phiên thanh toán không thành công", error);
            next(error);
        }
    },
    verifyStripeSession: async function (req, res, next) {
        try {
            const sessionId = req.params.id;
            const verificationResult = await userService.verifyStripeSession(sessionId);
            const response = responseSuccess(verificationResult, "Xác thực phiên thanh toán thành công");
            res.status(response.status).json(response);
        } catch (error) {
            console.error("Xác thực phiên thanh toán không thành công", error);
            next(error);
        }
    },
    confirmBooking : async function (req,res,next) {
        try {
            const userId = req.user.id;
            const bookingId = req.params.id;
            const confirmBooking = await userService.confirmBooking(userId,bookingId);
            const response = responseSuccess(confirmBooking,"Xác nhận thanh toán phòng thành công");
             res.status(response.status).json(response)
        } catch (err) {
            console.error("Xác nhận thanh toán phòng không thành công", err)
            next(err)
        }
    },
    cancelBooking : async function name(req,res,next) {
         try {
            const userId = req.user.id;
            const bookingId = req.params.id;
            const cancelBooking = await userService.cancelBooking(userId,bookingId);
            const response = responseSuccess(cancelBooking,"Hủy phòng thành công");
             res.status(response.status).json(response)
        } catch (err) {
            console.error("Hủy phòng không thành công", err)
            next(err)
        }
    },
    getBookingByStatus: async function (req, res, next) {
        try {
            const userId = req.user.id;
            const status = req.query.status;
            const bookingStatus = await userService.getBookingByStatus(userId,status);
            const response = responseSuccess(bookingStatus, "Lấy các trạng thái booking của người dùng thành công");
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy các trạng thái booking người dùng không thành công", err);
            next(err);
        }
    },
    getFinishedBookings : async function (req,res,next) {
          try {
            const userId = req.user.id;
            const finishedBookings = await userService.getFinishedBookings(userId);
            const response = responseSuccess(finishedBookings, "Lấy danh sách booking đã ở xong của người dùng thành công");
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách booking đã ở xong người dùng không thành công", err);
            next(err);
        }
    },
    addFavoriteHotel: async function (req, res, next) {
        try {
            const userId = req.user.id;
            const hotelId = req.params.hotelId;

            const favorite = await userService.addFavoriteHotel(userId, hotelId);
            const response = responseSuccess(favorite, "Yêu thích khách sạn thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Yêu thích khách sạn không thành công", err)
            next(err)
        }
    },
    removeFavoriteHotel: async function (req, res, next) {
        try {
            const userId = req.user.id;
            const hotelId = req.params.hotelId;
            await userService.removeFavoriteHotel(userId, hotelId)
            const response = responseSuccess(null, "Xóa khách sạn thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Xóa khách sạn không thành công", err)
            next(err)
        }
    },
    getAllFavoriteHotel: async function (req, res, next) {
        try {
            const userId = req.user.id;
            const favorites = await userService.getAllFavoriteHotel(userId);
            const response = responseSuccess(favorites, 'Lấy danh sách yêu thích khách sạn thành công')
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách yêu thích khách sạn không thành công", err)
            next(err)
        }
    },

    addReview: async function (req, res, next) {
        try {
            const userId = req.user.id;
            const hotelId = req.params.hotelId;
            const newReview = await userService.addReview(userId, hotelId, req.body)
            const response = responseSuccess(newReview, "Thêm review vào khách sạn thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Thêm review không thành công", err)
            next(err)
        }
    },
    updateReview: async function (req, res, next) {
        try {
            const userId = req.user.id;
            const reviewId = req.params.id;

            const updateReview = await userService.updateReview(userId, reviewId, req.body)
            const response = responseSuccess(updateReview, "Cập nhật đánh giá thành công")
            res.status(response.status).json(response)
        } catch (error) {
            console.error("Cập nhật đánh giá không thành công", err)
            next(err)
        }
    },

    deleteReview: async function (req, res, next) {
        try {
            const userId = req.user.id;
            const reviewId = req.params.id;
            await userService.deleteReview(userId, reviewId)
            const response = responseSuccess(null, "Xóa đánh giá thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Xóa đánh giá không thành công", err)
            next(err)
        }
    },
    // getAllReviewByHotelId: async function (req, res, next) {
    //     try {
    //         const hotelId = req.params.id;
    //         const reviews = await userService.getAllReviewByHotelId(hotelId)
    //         const response = responseSuccess(reviews, "Lấy danh sách đánh giá của khách sạn thành công")
    //         res.status(response.status).json(response)
    //     } catch (err) {
    //          console.error("Lấy danh sách đánh giá của khách sạn đó không thành công", err)
    //         next(err)
    //     }
    // },

    getAllReviewHotelByUser : async function (req,res,next) {
        try {
            const userId = req.user.id
            const reviewsUser = await userService.getAllReviewHotelByUser(userId)
           const response = responseSuccess(reviewsUser, "Lấy danh sách đánh giá của khách sạn của người dùng đó thành công")
            res.status(response.status).json(response)
        } catch (err) {
             console.error("Lấy danh sách đánh giá của khách sạn của người dùng đó không thành công", err)
            next(err)
        }

    }

}