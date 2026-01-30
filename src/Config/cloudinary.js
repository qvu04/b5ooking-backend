import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Chỉ xử lý upload hình ảnh
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'avatars', // thư mục trong Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'],
    resource_type: 'image', // đảm bảo chỉ nhận ảnh
  },
});

export const upload = multer({ storage });
