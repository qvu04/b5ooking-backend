import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routers/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import {startBookingStatusCron } from "./cron/bookingStatus.cron.js";
import { startActiveVoucherCron } from "./cron/startActiveVoucherCron.js";
import { startStatusBooking } from "./cron/statusBooking.js";

dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8080
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

startBookingStatusCron()
startActiveVoucherCron()
startStatusBooking()
app.get("/", (req, res) => {
    res.send("hello")
})
app.use(router)
app.use(errorHandler)
app.listen(PORT, () => {
    console.log(`Máy chủ được chạy ở http://localhost:${PORT}`)
})