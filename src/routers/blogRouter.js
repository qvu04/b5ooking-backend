import express from 'express';

import { blogController } from '../controllers/blogController.js';

const router = express.Router();

router.get('/getAllBlogs', blogController.getAllBlogs);
router.get('/getSomeBlogs', blogController.getSomeBlogs);
router.get('/getBlogBySlug/:slug', blogController.getBlogBySlug);
router.get('/getAllBlogsByLocationId/:locationId', blogController.getAllBlogsByLocationId);
export default router;