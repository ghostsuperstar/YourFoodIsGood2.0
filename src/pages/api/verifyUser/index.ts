import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/db';
import authenticate, { UpdateRequest } from '../auth/authenticate';
import { IncomingForm, Fields, Files } from 'formidable';
import { OpenAI } from 'openai';
import { getHeadingDescription } from '../posts/index';

export default async function handler(req: UpdateRequest, res: NextApiResponse) {
  authenticate(req, res, async () => {
    const userId = req.userId;
    console.log('Authenticated userId:', userId);

    if (req.method === 'GET') {
      try {
        if (!userId) {
          console.warn('User not authenticated for GET');
          return res.status(401).json({ message: 'User not authenticated' });
        }
        if (typeof userId !== 'number') {
          return res.status(500);
        }

        console.log('Fetching user posts from database...');
        const posts = await prisma.post.findMany({
          where: { userId: userId },
          include: {
            user: { select: { username: true } },
            location: true,
          },
        });

        const formattedPosts = posts.map((post) => ({
          id: post.id,
          heading: post.heading,
          imagelink: post.imagelink,
          reviews: post.reviews,
          location: post.location
            ? {
                address: post.location.address,
                latitude: post.location.latitude,
                longitude: post.location.longitude,
              }
            : null,
          createdAt: post.createdAt,
          createdBy: post.user.username,
        }));

        console.log('User posts fetched successfully');
        return res.status(200).json(formattedPosts);
      } catch (error) {
        console.error('Error retrieving posts:', error);
        return res.status(500).json({ message: 'Error retrieving posts' });
      }
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id || typeof id !== 'string') {
        console.warn('Invalid or missing post ID');
        return res.status(400).json({ message: 'Invalid or missing post ID' });
      }

      try {
        console.log('Checking post ownership...');
        const post = await prisma.post.findUnique({
          where: { id: parseInt(id) },
          select: { userId: true },
        });

        if (!post) {
          console.warn('Post not found');
          return res.status(404).json({ message: 'Post not found' });
        }
        if (typeof post.userId !== 'number') {
          return res.status(500);
        }
        if (typeof userId !== 'number') {
          return res.status(500);
        }

        if (post.userId !== userId) {
          console.warn('Unauthorized delete attempt');
          return res.status(403).json({ message: 'You are not authorized to delete this post' });
        }

        console.log('Deleting related comments...');
        await prisma.comment.deleteMany({
          where: { postId: parseInt(id) },
        });

        console.log('Deleting post...');
        await prisma.post.delete({
          where: { id: parseInt(id) },
        });

        console.log('Post and related comments deleted successfully');
        return res.status(200).json({ message: 'Post and related comments deleted successfully' });
      } catch (error) {
        console.error('Error deleting post:', error);
        return res.status(500).json({ message: 'Error deleting post' });
      }
    }

    console.warn('Unsupported HTTP method');
    return res.status(405).json({ message: 'Method not allowed' });
  });
}
