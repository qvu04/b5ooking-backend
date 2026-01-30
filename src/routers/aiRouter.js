import express from 'express'
import { aiController } from '../controllers/aiController.js'

import { aiAuthMiddleware } from '../middleware/aiAuthMiddleware.js'
const router = express.Router()

router.post('/ask',aiAuthMiddleware,aiController.aiMessage)
export default router