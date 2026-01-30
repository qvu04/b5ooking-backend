import express from 'express'
import authRouter from '../routers/authRouter.js'
import userRouter from '../routers/userRouter.js'
import adminRouter from '../routers/adminRouter.js'
import blogRouter from '../routers/blogRouter.js'
import dashBoardRouter from '../routers/dashBoardRouter.js'
import hotelRouter from '../routers/hotelRouter.js'
import roomRouter from '../routers/roomRouter.js'
import reportRouter from '../routers/reportRouter.js'
import aiRouter from '../routers/aiRouter.js'
const router = express.Router();

router.use('/api/auth', authRouter)
router.use('/api/user', userRouter)
router.use('/api/admin', adminRouter)
router.use('/api/blog', blogRouter)
router.use('/api/dashBoard', dashBoardRouter)
router.use('/api/hotel', hotelRouter)
router.use('/api/room', roomRouter)
router.use('/api/report', reportRouter)
router.use('/api/ai', aiRouter)
export default router;