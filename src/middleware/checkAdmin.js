
export const checkAdmin = (req,res,next) => {
    if(req.user.role !== "ADMIN" ) {
        return res.status(403).json({ message: 'Cấm truy cập' });
    }
    next();
}