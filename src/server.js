import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routers/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { startBookingStatusCron } from "./cron/bookingStatus.cron.js";
import { startActiveVoucherCron } from "./cron/startActiveVoucherCron.js";
import { startStatusBooking } from "./cron/statusBooking.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
    res.send("hello");
});

app.use(router);
app.use(errorHandler);

const PORT = process.env.PORT;
if (!PORT) {
    throw new Error("PORT is not defined");
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    if (process.env.NODE_ENV === "production") {
        try {
            startBookingStatusCron();
            startActiveVoucherCron();
            startStatusBooking();
            console.log("Cron jobs started");
        } catch (err) {
            console.error("Cron init error:", err.message);
        }
    }
});
