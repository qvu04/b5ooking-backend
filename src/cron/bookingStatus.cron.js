import cron from "node-cron";
import { userService } from "../services/userService.js";


export const startBookingStatusCron = () => {
  // Mỗi phút chạy 1 lần
  cron.schedule("*/10 * * * *", async () => {
    console.log("⏰ Bắt đầu cron check...");
    await userService.updateFinishBooking();
    console.log("✅ Cron check xong");
  });
};