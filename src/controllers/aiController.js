import { responseSuccess } from "../helpers/response.helper.js"
import aiService from "../services/aiService.js"

export const aiController = {
    aiMessage : async function (req,res,next) {
        try {
            const userId = req.user || null
            const data = await aiService.aiMessage(userId,req.body)
            const reponse = responseSuccess(data,"Trả lời thành công")
            res.status(reponse.status).json(reponse)
        } catch (err) {
            console.error("Trả lời thất bại",err)
            next(err)
        }
    }
}