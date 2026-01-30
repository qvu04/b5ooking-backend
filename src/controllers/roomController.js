import { responseSuccess } from "../helpers/response.helper.js";
import { roomService } from "../services/roomService.js";

export const roomController = {
    // Lấy danh sách phòng của khách sạn
    getRoomsByHotelId: async function (req, res, next) {
        const hotelId = parseInt(req.params.hotelId);
        try {
            const rooms = await roomService.getRoomsByHotelId(hotelId);
            const response = responseSuccess(rooms, "Lấy danh sách phòng thành công");
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy danh sách phòng không thành công", err);
            next(err);
        }
    },

    getRoomById: async function (req, res, next) {
        try {
            const roomId = req.params.roomId;

            const room = await roomService.getRoomById(roomId);
            const response = responseSuccess(room, "Lấy thông tin phòng thành công")
            res.status(response.status).json(response);
        } catch (err) {
            console.error("Lấy thông tin phòng không thành công", err);
            next(err);
        }
    },
    getAvailableRoomsByHotelId : async function (req,res,next) {
        try {
            const result = await roomService.getAvailableRoomsByHotelId(req.query);
          const response = responseSuccess(result, "Lấy danh sách phòng phù hợp thành công");
            res.status(response.status).json(response);
        } catch (error) {
            console.error("Lấy danh sách phòng phù hợp không thành công", error);
            next(error);
        }
    }
}