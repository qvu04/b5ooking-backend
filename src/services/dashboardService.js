import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export const dashboardService = {
    getTotal: async function () {
        const totalRevenueBooking = await prisma.booking.aggregate({
            _sum: {
                totalPrice: true
            },
            where: {
               status: { in: ['CONFIRMED', 'FINISHED'] }
            }
        })
        const totalUser = await prisma.user.count({
            where: {
                role: 'USER'
            }
        })
        const totalHotel = await prisma.hotel.count()
        const totalRoom = await prisma.room.count()
        return {
            totalRevenueBooking: totalRevenueBooking._sum.totalPrice || 0,
            totalUser: totalUser,
            totalHotel: totalHotel,
            totalRoom: totalRoom
        }
    },

    getGroupedRevenue: async function (type = 'day', fromDate, toDate) {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999); // bao phủ hết ngày toDate

    if (type === 'day') {
        const data = await prisma.booking.groupBy({
            by: ['create_At'],
            _sum: { totalPrice: true },
            where: {
                status: { in: ['CONFIRMED', 'FINISHED'] },
                create_At: {
                    gte: start,
                    lte: end
                }
            },
            orderBy: { create_At: 'asc' }
        });

        return data.map(item => ({
            label: item.create_At.toISOString().split('T')[0],
            revenue: item._sum.totalPrice || 0
        }));
    }

    if (type === 'week') {
        const data = await prisma.$queryRaw`
            SELECT
                YEARWEEK(create_At, 1) AS week,
                MIN(DATE(create_At)) AS weekStart,
                SUM(totalPrice) AS revenue
            FROM Booking
            WHERE status IN ('CONFIRMED', 'FINISHED')
              AND create_At BETWEEN ${start} AND ${end}
            GROUP BY YEARWEEK(create_At, 1)
            ORDER BY week ASC;
        `;

        return data.map(item => ({
            label: item.weekStart.toISOString().split('T')[0],
            revenue: Number(item.revenue)
        }));
    }

    if (type === 'month') {
        const data = await prisma.$queryRaw`
            SELECT
                DATE_FORMAT(create_At, '%Y-%m') AS month,
                SUM(totalPrice) AS revenue
            FROM Booking
            WHERE status IN ('CONFIRMED', 'FINISHED')
              AND create_At BETWEEN ${start} AND ${end}
            GROUP BY month
            ORDER BY month ASC;
        `;

        return data.map(item => ({
            label: item.month,
            revenue: Number(item.revenue)
        }));
    }

    return []; 
},
   getHotelRevenuePercentage: async function (fromDate, toDate) {
  const start = new Date(fromDate);
  const end = new Date(toDate);

  const result = await prisma.$queryRaw`
    SELECT
      h.id,
      h.name,
      SUM(b.totalPrice) AS revenue
    FROM Booking b
    JOIN Room r ON b.roomId = r.id
    JOIN Hotel h ON r.hotelId = h.id
    WHERE b.status IN ('CONFIRMED', 'FINISHED')
      AND b.create_At BETWEEN ${start} AND ${end}
    GROUP BY h.id
    ORDER BY revenue DESC;
  `;

  const totalRevenue = result.reduce((sum, item) => sum + Number(item.revenue), 0);

  return result.map(item => ({
    hotelId: item.id,
    name: item.name,
    revenue: Number(item.revenue),
    precent: totalRevenue > 0 ? Number(item.revenue) / totalRevenue * 100 : 0,
  }));
}



}