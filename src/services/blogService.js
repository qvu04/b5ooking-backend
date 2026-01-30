import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

export const blogService = {

    getAllBlogs: async function (page = 1) {
        const limit = 6;
        const skip = (page - 1) * limit;
        const blogs = await prisma.blogPost.findMany({
            skip: skip,
            take: limit,
            orderBy: {
                create_At: 'desc'
            },
            select: {
                id: true,
                title: true,
                summary: true,
                image: true,
                slug: true,
                create_At: true,
                update_At: true,
            }
        })
        const total = await prisma.blogPost.count();

        return {
            blogs: blogs,
            pagination: {
                page: page,
                limit: limit,
                total: total,
                totalPages: Math.ceil(total / limit)
            }
        };
    },
    getSomeBlogs: async function () {
        const blogs = await prisma.blogPost.findMany({
            select: {
                id: true,
                title: true,
                summary: true,
                image: true,
                slug: true,
                create_At: true,
                update_At: true,
            },
            take: 4
        })
        return {
            blogs: blogs
        };
    },

    getBlogBySlug: async function (slug) {
        const blog = await prisma.blogPost.findUnique({
            where: { slug: slug },
            select: {
                id: true,
                title: true,
                content: true,
                author: true,
                summary: true,
                image: true,
                create_At: true,
                update_At: true,
            }
        });
        return {
            blog: blog
        };
    },

    getAllBlogsByLocationId: async function (locationId, page) {
        const limit = 6;
        const skip = (page - 1) * limit;
        const blogs = await prisma.blogPost.findMany({
            where: { locationId: locationId },
            skip: skip,
            take: limit,
            orderBy: {
                create_At: 'desc'
            },
            select: {
                id: true,
                title: true,
                summary: true,
                image: true,
                slug: true,
                create_At: true,
                update_At: true,
            }
        });
        const total = await prisma.blogPost.count({
            where: { locationId: locationId }
        })
        return {
            blogs: blogs,
            pagination: {
                page: page,
                limit: limit,
                total: total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
}