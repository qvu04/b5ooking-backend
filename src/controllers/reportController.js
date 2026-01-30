// reportController.js
import { reportService } from "../services/reportService.js";

export const reportController = {
  generatePDF: async function (req, res, next) {
    try {
      const { fromDate, toDate } = req.query;
      if (!fromDate || !toDate) {
        return res.status(400).json({ message: "fromDate và toDate là bắt buộc" });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=dashboard-report.pdf");

      await reportService.generatePDF(fromDate, toDate, res);
    } catch (err) {
      next(err);
    }
  },
};
