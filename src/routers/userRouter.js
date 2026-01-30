import express from 'express'
import { userController } from '../controllers/userController.js'
import { upload } from '../Config/cloudinary.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()
// Cập nhật hồ sơ người dùng
router.patch('/update-profile', upload.single('avatar'), authMiddleware, userController.updateUser)

// Booking Room
router.post('/BookingRoom', authMiddleware, userController.bookingRoom)

router.post('/checkVoucher', authMiddleware, userController.checkVoucher)

// Tạo phiên thanh toán Stripe
router.post('/createStripeSession', authMiddleware, userController.createStripeSession)

// Xác thực phiên thanh toán Stripe
router.get('/verifyStripeSession/:id', authMiddleware, userController.verifyStripeSession)

router.post('/ConfirmBooking/:id', authMiddleware, userController.confirmBooking)

router.post('/CancelBooking/:id', authMiddleware, userController.cancelBooking)

router.get('/getFinishedBookings', authMiddleware, userController.getFinishedBookings)

// Lấy danh sách lịch sử booking Room
router.get("/getBookingByStatus", authMiddleware, userController.getBookingByStatus)

//  Thêm yêu thích khác sạn
router.post('/addFavoriteHotel/:hotelId', authMiddleware, userController.addFavoriteHotel)

// Xóa yêu thích của khách sạn
router.delete('/removeFavoriteHotel/:hotelId', authMiddleware, userController.removeFavoriteHotel)

// Lấy danh sách yêu thích khách sạn của người dùng
router.get('/getAllFavoriteHotel', authMiddleware, userController.getAllFavoriteHotel)

// Thêm sửa xóa để đánh giá hotel
router.post('/addReview/:hotelId', authMiddleware, userController.addReview)
router.put("/updateReview/:id", authMiddleware, userController.updateReview)
router.delete("/deleteReview/:id", authMiddleware, userController.deleteReview)

// Lấy đánh giá theo khách sạn
// router.get("/getAllReviewByHotelId/:id",userController.getAllReviewByHotelId)

// Lấy danh sách đánh giá khách sạn của ng dùng đó hui
router.get('/getAllReviewByUser', authMiddleware, userController.getAllReviewHotelByUser)
export default router