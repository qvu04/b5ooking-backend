import { responseSuccess } from "../helpers/response.helper.js";
import { hotelService } from "../services/hotelService.js";

export const hotelController = {
    getAllLocations: async function (req, res, next) {
        try {
            const locations = await hotelService.getAllLocaltions();
            const response = responseSuccess(locations, "Lấy danh sách vị trí thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách vị trí không thành công", err);
            next(err);
        }
    },
    getSomeLocaltions: async function (req, res, next) {
        try {
            const locations = await hotelService.getSomeLocaltions();
            const response = responseSuccess(locations, "Lấy danh sách 1 vài vị trí thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách 1 vài vị trí không thành công", err);
            next(err);
        }
    },
    // Lấy danh sách khách sạn
    getAllHotels: async function (req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1
            const hotels = await hotelService.getAllHotels(page);
            const response = responseSuccess(hotels, "Lấy danh sách khách sạn thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách khách sạn không thành công", err);
            next(err);
        }
    },
    // lấy thông tin khách sạn theo id
    getHotelById: async function (req, res, next) {
        const hotelId = parseInt(req.params.id);
        try {
            const { hotel, reviewCount, ratingStats } = await hotelService.getHotelById(hotelId);

            hotel.reviewCount = reviewCount;
            hotel.ratingStats = ratingStats;

            const response = responseSuccess(hotel, "Lấy thông tin khách sạn thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy thông tin khách sạn không thành công", err);
            next(err);
        }
    },
    // Lấy khách sạn theo khu vực
    getHotelsByLocation: async function (req, res, next) {
        const locationId = parseInt(req.params.locationId);
        try {
            const hotels = await hotelService.getHotelsByLocation(locationId);
            const response = responseSuccess(hotels, "Lấy danh sách khách sạn theo khu vực thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách khách sạn theo khu vực không thành công", err);
            next(err);
        }
    },
    // Lấy những khách sạn liên quan tới địa điểm và nhận phòng trả phòng và số người
    getSearchAvailableHotels: async function (req, res, next) {
        try {
            const result = await hotelService.getSearchAvailableHotels(req.query);
            const response = responseSuccess(result, "Lấy danh sách khách sạn thành công");
            res.status(response.status).json(response);
        } catch (error) {
            console.error("Lấy danh sách khách sạn không thành công", error);
            next(error);
        }
    },
    // Lấy tất cả đánh giá của khách sạn 
    getAllReviewByHotelId: async function (req, res, next) {
        try {
            const hotelId = req.params.id;
            const reviews = await hotelService.getAllReviewByHotelId(hotelId)
            const response = responseSuccess(reviews, "Lấy danh sách đánh giá của khách sạn thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy danh sách đánh giá của khách sạn đó không thành công", err)
            next(err)
        }
    },
    getAllImageHotels : async function (req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const images = await hotelService.getAllImageHotels(page);
            const response = responseSuccess(images, "Lấy danh sách hình ảnh khách sạn thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách hình ảnh khách sạn không thành công", err);
            next(err);
        }
    }
}