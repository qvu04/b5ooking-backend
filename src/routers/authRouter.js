import express from 'express'


import { authController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';


const router = express.Router();


router.post("/register",authController.register);
router.post("/login",authController.login)
router.get('/getUserById',authMiddleware,authController.getUserById);
router.post('/loginGoogle',authController.loginGoogle);



export default router;  