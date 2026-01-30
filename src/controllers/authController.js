import { responseSuccess } from "../helpers/response.helper.js"
import { authService } from "../services/authService.js"

export const authController = {
  register: async function (req, res, next) {
    try {
      const { newUser } = await authService.register(req.body)
      const reponse = responseSuccess(newUser, "Tạo người dùng thành công")
      res.status(reponse.status).json(reponse)
    } catch (err) {
      console.error("Đăng kí người dùng không thành công", err)
      next(err)
    }
  },

  login: async function (req, res, next) {
    try {
      const { user } = await authService.login(req.body)
      const reponse = responseSuccess(user, "Đăng nhập thành công")
      res.status(reponse.status).json(reponse)
    } catch (err) {
      console.error("Đăng nhập người dùng không thành công", err)
      next(err)
    }
  },

  loginGoogle: async function (req, res, next) {
    try {
      console.log("Request body:", req.body); // Debugging line to check the request body
      const { user } = await authService.loginGoogle(req.body)
      const response = responseSuccess(user, "Đăng nhập với Google thành công")
      res.status(response.status).json(response)
    } catch (err) {
      console.error("Đăng nhập với Google không thành công", err)
      next(err)
    }
  },
  getUserById : async function (req, res, next) {

  

    try {
      const userId = req.user.id;
      const user = await authService.getUserById(userId);
      const response = responseSuccess(user, "Lấy thông tin người dùng thành công");
      res.status(response.status).json(response);
    } catch (err) {
      console.error("Lấy thông tin người dùng không thành công", err)
      next(err)
    }
  },
  googleLogin: async function (req, res, next) {
    try {
      const user = await authService.login(req.body)
      const reponse = responseSuccess(user, "Đăng nhập thành công")
      res.status(reponse.status).json(reponse)
    } catch (err) {
      console.error("Đăng nhập người dùng không thành công", err)
      next(err)
    }
  },


}
