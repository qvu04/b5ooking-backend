export const responseSuccess = (data = null, message = "Thành công", status = 200) => {
    return {
        data : data,
        message: message,
        status: status,
        doc : "domain.com/swagger"
    }
}

export const responseError = (message = "Lỗi không xác định", status = 500,stack = null) => {
    return {
        message: message,
        status: status,
        stack: stack,
        doc : "domain.com/swagger"
    }
}