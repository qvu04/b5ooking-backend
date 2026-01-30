import { PrismaClient } from "@prisma/client";
import PdfPrinter from "pdfmake";
import path from "path";
import { dashboardService } from "./dashboardService.js";

const prisma = new PrismaClient();

// Fonts Unicode
const fonts = {
    Roboto: {
        normal: path.join(process.cwd(), "src", "font", "Roboto-Regular.ttf"),
        bold: path.join(process.cwd(), "src", "font", "Roboto-Bold.ttf"),
        italics: path.join(process.cwd(), "src", "font", "Roboto-Italic.ttf"),
        bolditalics: path.join(process.cwd(), "src", "font", "Roboto-BoldItalic.ttf"),
    },
};

const printer = new PdfPrinter(fonts);

// Format số tiền chuẩn, dấu phẩy
const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// Helper tạo table đồng bộ (có thể bật/tắt header lặp lại)
function createTable(headers, rows, repeatHeader = true) {
    return {
        table: {
            headerRows: repeatHeader ? 1 : 0,
            widths: Array(headers.length).fill("*"),
            body: [
                headers.map((h) => ({
                    text: h,
                    style: "tableHeader",
                    alignment: "center",
                })),
                ...rows.map((row) =>
                    row.map((cell) => ({
                        text: cell?.toString() || "-",
                        alignment: "center",
                    }))
                ),
            ],
        },
        layout: {
            fillColor: (rowIndex) =>
                rowIndex === 0 ? "#2E86C1" : rowIndex % 2 === 0 ? "#F2F4F4" : null,
        },
        margin: [0, 5, 0, 5],
    };
}

export const reportService = {
    async generatePDF(fromDate, toDate, res) {
        const total = await dashboardService.getTotal();
        const monthly = await dashboardService.getGroupedRevenue("month", fromDate, toDate);
        const hotelStats = await dashboardService.getHotelRevenuePercentage(fromDate, toDate);

        const bookings = await prisma.booking.findMany({
            where: {
                status: { in: ["CONFIRMED", "FINISHED"] },
                create_At: { gte: new Date(fromDate), lte: new Date(toDate) },
            },
            include: { user: true, room: true, Voucher: true },
            orderBy: { create_At: "asc" },
        });

        const docDefinition = {
            defaultStyle: { font: "Roboto" },
            pageMargins: [40, 60, 40, 60],

            // ✅ Tiêu đề chỉ hiển thị ở trang đầu tiên
            header: (currentPage) => {
                if (currentPage === 1) {
                    return {
                        text: "BÁO CÁO DOANH THU HỆ THỐNG",
                        style: "header",
                        alignment: "center",
                    };
                }
                return null;
            },

            // ✅ Footer hiển thị ở mọi trang
            footer: (currentPage, pageCount) => ({
                text: `Trang ${currentPage} / ${pageCount} - Báo cáo tự động bởi Hotel Booking`,
                style: "footer",
                alignment: "center",
                margin: [0, 0, 0, 10],
            }),

            styles: {
                header: { fontSize: 20, bold: true, color: "#2E86C1", margin: [0, 10, 0, 10] },
                subheader: { fontSize: 16, bold: true, color: "#117A65", margin: [0, 10, 0, 5] },
                tableHeader: { bold: true, color: "white", fillColor: "#2E86C1" },
                normal: { fontSize: 12 },
                footer: { fontSize: 10, color: "gray" },
                tableLabel: { fontSize: 12, color: "#34495E" },
                tableValue: { fontSize: 12, bold: true, color: "#2E86C1" },
            },

            content: [
                // Thời gian báo cáo
                {
                    columns: [
                        { text: `Từ ngày: ${fromDate}`, style: "normal" },
                        { text: `Đến ngày: ${toDate}`, style: "normal", alignment: "right" },
                    ],
                    margin: [0, 0, 0, 15],
                },

                // 1. Tổng quan
                { text: "1. Tổng quan", style: "subheader" },
                {
                    table: {
                        widths: ["*", "*"],
                        body: [
                            [
                                { text: "Tổng doanh thu", style: "tableLabel" },
                                { text: `${formatNumber(total.totalRevenueBooking)} VND`, style: "tableValue" },
                            ],
                            [
                                { text: "Tổng người dùng", style: "tableLabel" },
                                { text: `${total.totalUser}`, style: "tableValue" },
                            ],
                            [
                                { text: "Tổng khách sạn", style: "tableLabel" },
                                { text: `${total.totalHotel}`, style: "tableValue" },
                            ],
                            [
                                { text: "Tổng phòng", style: "tableLabel" },
                                { text: `${total.totalRoom}`, style: "tableValue" },
                            ],
                        ],
                    },
                    layout: {
                        fillColor: (rowIndex) => (rowIndex % 2 === 0 ? "#F8F9F9" : null),
                        hLineWidth: () => 0.5,
                        vLineWidth: () => 0.5,
                        hLineColor: () => "#D5DBDB",
                        vLineColor: () => "#D5DBDB",
                        paddingLeft: () => 5,
                        paddingRight: () => 5,
                        paddingTop: () => 3,
                        paddingBottom: () => 3,
                    },
                    margin: [0, 0, 0, 15],
                },

                // 2. Doanh thu theo tháng
                { text: "2. Doanh thu theo tháng", style: "subheader" },
                createTable(
                    ["Tháng", "Doanh thu (VND)"],
                    monthly.map((m) => [m.label, formatNumber(m.revenue)])
                ),

                // 3. Tỷ lệ doanh thu theo khách sạn
                { text: "3. Tỷ lệ doanh thu theo khách sạn", style: "subheader" },
                createTable(
                    ["STT", "Khách sạn", "Doanh thu (VND)", "Tỷ lệ (%)"],
                    hotelStats.map((h, i) => [
                        i + 1,
                        h.name,
                        formatNumber(h.revenue),
                        h.precent.toFixed(2),
                    ])
                ),

                // 4. Danh sách booking chi tiết
                { text: "4. Danh sách booking chi tiết", style: "subheader" },
                createTable(
                    ["ID", "Khách hàng", "Phòng", "Ngày đặt", "Ngày trả", "Mã giảm giá", "Tổng (VND)"],
                    bookings.map((b) => [
                        b.id,
                        b.user?.fullName || "Ẩn danh",
                        b.room?.name || "N/A",
                        b.checkIn.toISOString().split("T")[0],
                        b.checkOut.toISOString().split("T")[0],
                        b.voucher?.code || "-",
                        formatNumber(b.totalPrice || 0),
                    ]),
                    true // vẫn giữ headerRows để bảng đọc dễ hơn
                ),
            ],
        };

        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(res);
        pdfDoc.end();
    },
};
