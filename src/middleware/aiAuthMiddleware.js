import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const aiAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    const userId = decoded.userId || decoded.id;
    if (!userId) {
      req.user = null;
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, email: true },
    });

    req.user = user || null;
    console.log("AI Middleware User:", req.user);
    next();

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      console.warn("Token hết hạn — coi như user chưa đăng nhập.");
    } else {
      console.error("AI Auth Error:", err.message);
    }
    req.user = null;
    next();
  }
};
