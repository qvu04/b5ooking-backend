import express from 'express';
import { upload } from '../Config/cloudinary.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { checkAdmin } from '../middleware/checkAdmin.js';
import { adminController } from '../controllers/adminController.js';
import { adminService } from '../services/adminService.js';

const router = express.Router();

// Tạo thêm,sửa, xóa vị trí
router.post('/createLocation',upload.single('imageFile'),authMiddleware,checkAdmin,adminController.createLocation);
router.put('/updateLocation/:id',upload.single('imageFile'),authMiddleware,checkAdmin,adminController.updateLocation);
router.delete('/deleteLocation/:id',authMiddleware,checkAdmin,adminController.deleteLocation);


// Lấy danh sách vị trí
router.get('/getAllLocaltionsForAdmin',authMiddleware,checkAdmin,adminController.getAllLocaltionsForAdmin);
router.get('/getAllLocaltionNames',authMiddleware,checkAdmin,adminController.getAllLocaltionNames);
// Tạo sửa xóa tiện nghi
router.post('/createAmenity',authMiddleware,checkAdmin,adminController.createAmenity);
router.put('/updateAmenity/:id',authMiddleware,checkAdmin,adminService.updateAmenity);
router.delete('/deleteAmenity/:id',authMiddleware,checkAdmin,adminService.deleteAmenity)
// Lấy danh sách tiện nghi
router.get('/getAllAmenities',authMiddleware,checkAdmin,adminController.getAllAmenities);

// Tạo sửa xóa khách sạn
router.post('/createHotel',upload.array('imageFile',30),authMiddleware,checkAdmin,adminController.createHotel);
router.put('/updateHotel/:id',upload.single('imageFile'),authMiddleware,checkAdmin,adminController.updateHotel);
router.delete('/deleteHotel/:id',authMiddleware,checkAdmin,adminController.deleteHotel);

// Lấy danh sách khách sạn
router.get('/getAllHotels',authMiddleware,checkAdmin,adminController.getAllHotels);
router.get('/getAllHotelNames',authMiddleware,checkAdmin,adminController.getAllHotelNames);
router.get('/getAllRooms',authMiddleware,checkAdmin, adminController.getAllRooms)

// // Lấy thông tin khách sạn theo id
// router.get('/getHotelById/:id',authMiddleware,checkAdmin,adminController.getHotelById);

// lấy danh sách ảnh phụ của khách sạn
router.get('/getHotelImages',authMiddleware,checkAdmin,adminController.getHotelImages);
router.get('/getRoomImages',authMiddleware,checkAdmin,adminController.getRoomImages);
router.get('/getAllRoomName',authMiddleware,checkAdmin,adminController.getAllRoomName);
router.get('/getAllHotelImages',authMiddleware,checkAdmin,adminController.getAllHotelImages);
// Thêm sửa xóa ảnh phụ của khách sạn
router.post('/addHotelImage/:hotelId',upload.array('imageFile',30),authMiddleware,checkAdmin,adminController.addHotelImage);
router.put('/updateHotelImage/:id',upload.single('imageFile'),authMiddleware,checkAdmin,adminController.updateHotelImage);
router.delete('/deleteHotelImage/:id',authMiddleware,checkAdmin,adminController.deleteHotelImage);

// Lấy khách sạn theo khu vực
router.get('/getHotelsByLocation/:locationId',authMiddleware,checkAdmin,adminController.getHotelsByLocation);

// Tạo sửa xóa phòng
router.post('/createRoom',upload.array('imageFile',5),authMiddleware,checkAdmin,adminController.createRoom);
router.put('/updateRoom/:id',upload.single('imageFile'),authMiddleware,checkAdmin,adminController.updateRoom);
router.delete('/deleteRoom/:id',authMiddleware,checkAdmin,adminController.deleteRoom);

// Tạo sửa xóa ảnh phụ của phòng 
router.post('/addRoomImage/:roomId',upload.array('imageFile',5),authMiddleware,checkAdmin,adminController.addRoomImage);
router.put('/updateRoomImage/:id',upload.single('imageFile'),authMiddleware,checkAdmin,adminController.updateRoomImage);
router.delete('/deleteRoomImage/:id',authMiddleware,checkAdmin,adminController.deleteRoomImage);

// Tạo sửa xóa blog
router.post('/createBlog',upload.single('imageFile'),authMiddleware,checkAdmin,adminController.createBlog);
router.put('/updateBlog/:id',upload.single('imageFile'),authMiddleware,checkAdmin,adminController.updateBlog);
router.delete('/deleteBlog/:id',authMiddleware,checkAdmin,adminController.deleteBlog);

router.get('/getAllBlogs', authMiddleware,checkAdmin,adminController.getAllBlogs);

// Tạo người dùng 
router.post('/createUser',authMiddleware,checkAdmin,adminController.createUser)
// update người dùng 
router.put('/updateUser/:id',upload.single('avatar'),authMiddleware,checkAdmin,adminController.updateUser)
// Xóa người dùng 
router.delete('/deleteUser/:id',authMiddleware,checkAdmin,adminController.deleteUser)

// Lấy danh sách người dùng
router.get('/getAllUsers',authMiddleware,checkAdmin,adminController.getAllUsers);
// Lấy danh sách phòng của khách sạn
router.get('/getRoomsByHotel/:hotelId',authMiddleware,checkAdmin,adminController.getRoomsByHotelId);

router.get('/getAllBooking',authMiddleware,checkAdmin,adminController.getAllBooking)

router.post('/createVoucher',authMiddleware,checkAdmin,adminController.createVoucher)

router.patch('/updateVoucher/:id',authMiddleware,checkAdmin,adminController.updateVoucher)

router.get('/getVoucherById/:id',authMiddleware,checkAdmin,adminController.getVoucherById)

router.get('/getAllVouchers',authMiddleware,checkAdmin,adminController.getAllVouchers)

router.get('/getAllUserUseVoucher',authMiddleware,checkAdmin,adminController.getAllUserUseVoucher)
export default router