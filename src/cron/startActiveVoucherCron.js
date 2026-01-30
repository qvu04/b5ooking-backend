import cron from "node-cron";
import { adminService } from "../services/adminService.js";
export const startActiveVoucherCron = () => {
   cron.schedule("*/10 * * * *", async () => {
    console.log("⏰ Bắt đầu cron check...");
    await adminService.updateActiveVoucher();
    console.log("✅ Cron check xong");
  });
}