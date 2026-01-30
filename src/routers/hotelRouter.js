import express from 'express'
import { hotelController } from '../controllers/hotelController.js';

const router = express.Router()

// Lấy danh sách vị trí
router.get('/getAllLocations',hotelController.getAllLocations);
// Lấy danh sách 1 vài vị trí
router.get('/getSomeLocaltions',hotelController.getSomeLocaltions);

// Lấy danh sách khách sạn
router.get('/getAllHotels',hotelController.getAllHotels);

// Lấy thông tin khách sạn theo id
router.get('/getHotelById/:id',hotelController.getHotelById);

// Lấy khách sạn theo khu vực
router.get('/getHotelsByLocation/:locationId',hotelController.getHotelsByLocation);

// Lấy những khách sạn liên quan tới địa điểm và nhận phòng trả phòng và số người
router.get('/getSearchAvailableHotels',hotelController.getSearchAvailableHotels);

// Lấy tất cả đánh giá của khách sạn 
router.get("/getAllReviewByHotelId/:id",hotelController.getAllReviewByHotelId)

router.get('/getAllImageHotels',hotelController.getAllImageHotels)

export default router