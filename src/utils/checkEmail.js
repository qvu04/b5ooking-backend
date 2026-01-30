export const checkEmail = (email) => {
  console.log("Email đang kiểm tra:", email)

  const emailRegex = /^[^\s@]+@gmail\.com$/;
  if (!emailRegex.test(email)) {
    const error = new Error("Email phải hợp lệ và kết thúc bằng @gmail.com");
    error.status = 400;
    throw error;
  }
}
