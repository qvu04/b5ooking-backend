import express from 'express';
import { reportController } from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { checkAdmin } from '../middleware/checkAdmin.js';

const router = express.Router();

router.get('/reportPdf',authMiddleware,checkAdmin,reportController.generatePDF);

export default router;