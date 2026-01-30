
export const errorHandler = (err, req, res, next) => {
  console.error("Lỗi toàn cục:", err)

  const status = err.status || 500
  const message = err.message || "Đã xảy ra lỗi nội bộ"

  res.status(status).json({ message })
}
