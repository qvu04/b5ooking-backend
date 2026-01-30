import { dashboardService } from "../services/dashboardService.js"
import { responseSuccess } from "../helpers/response.helper.js"

export const dashBoardController = {
    getTotal: async function (req, res, next) {
        try {
            const total = await dashboardService.getTotal()
            const response = responseSuccess(total, "Lấy tổng thống kê thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Lấy tổng thống kê không thành công", err)
            next(err)
        }
    },

    getGroupedRevenue: async function (req, res, next) { 
    try {
        let { type = 'day', fromDate, toDate } = req.query;

        if (!fromDate || !toDate) {
            return res.status(400).json({ message: "fromDate và toDate là bắt buộc" });
        }

        const start = new Date(fromDate);
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999); // thêm dòng này nếu muốn bao phủ tại controller

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: "fromDate hoặc toDate không hợp lệ" });
        }

        const result = await dashboardService.getGroupedRevenue(type, fromDate, toDate);
        const response = responseSuccess(result, `Thống kê doanh thu theo ${type} thành công`);
        res.status(response.status).json(response);
    } catch (err) {
        console.error(`Thống kê doanh thu theo ${type} thất bại:`, err);
        next(err);
    }
},


    getHotelRevenuePercentage: async function (req, res, next) {
        try {
              const { fromDate, toDate } = req.query;
              if (!fromDate || !toDate || isNaN(Date.parse(fromDate)) || isNaN(Date.parse(toDate))) {
                return res.status(400).json({ message: "fromDate hoặc toDate không hợp lệ" });
              }
            const result = await dashboardService.getHotelRevenuePercentage(fromDate, toDate)
            const response = responseSuccess(result, "Phần trăm doanh thu của từng khách sạn thành công")
            res.status(response.status).json(response)
        } catch (err) {
            console.error("Phần trăm doanh thu của từng khách sạn không thành công", err)
            next(err)
        }
    }
}