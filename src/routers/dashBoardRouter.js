import express from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { checkAdmin } from '../middleware/checkAdmin.js'
import { dashBoardController } from '../controllers/dashBoardController.js'

const router = express.Router()

router.get('/getTotal',authMiddleware,checkAdmin,dashBoardController.getTotal);
router.get('/getGroupedRevenue',authMiddleware,checkAdmin,dashBoardController.getGroupedRevenue);
router.get('/getHotelRevenuePercentage',authMiddleware,checkAdmin,dashBoardController.getHotelRevenuePercentage);

export default router