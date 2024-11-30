import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/db';
import authenticate,{UpdateRequest} from '../auth/authenticate';
import { IncomingForm, Fields, Files } from 'formidable';
import { OpenAI } from 'openai';
import {getHeadingDescription} from "../posts/index";


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
        if(typeof userId!=="number"){
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
        if(typeof post.userId!=="number"){
            return res.status(500);
        }
        if(typeof userId!=="number"){
            return res.status(500);
        }

        if (post.userId !== userId) {
          console.warn('Unauthorized delete attempt');
          return res.status(403).json({ message: 'You are not authorized to delete this post' });
        }

        console.log('Deleting post...');
        await prisma.post.delete({
          where: { id: parseInt(id) },
        });

        console.log('Post deleted successfully');
        return res.status(200).json({ message: 'Post deleted successfully' });
      } catch (error) {
        console.error('Error deleting post:', error);
        return res.status(500).json({ message: 'Error deleting post' });
      }
    }
   /* if (req.method === 'PUT') {
        const { id } = req.query;
  
        if (!id || typeof id !== 'string') {
          console.warn('Invalid or missing post ID');
          return res.status(400).json({ message: 'Invalid or missing post ID' });
        }
  
        const form = new IncomingForm();
        form.parse(req, async (err: any, fields: Fields) => {
          if (err) {
            console.error('Error parsing form data:', err);
            return res.status(500).json({ message: 'Error parsing form data' });
          }
  
          const heading = Array.isArray(fields.heading) ? fields.heading[0] : fields.heading;
          const reviews = Array.isArray(fields.reviews) ? fields.reviews[0] : fields.reviews;
          const soldOut = Array.isArray(fields.soldOut) ? fields.soldOut[0] : fields.soldOut;
  
          if (typeof heading !== 'string' || typeof reviews !== 'string') {
            console.warn('Invalid input data:', { heading, reviews });
            return res.status(400).json({ message: 'Invalid input data' });
          }
  
          try {
            console.log('Checking post ownership...');
            const post = await prisma.post.findUnique({
              where: { id: parseInt(id) },
              select: { userId: true, description: true },
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
              console.warn('Unauthorized update attempt');
              return res.status(403).json({ message: 'You are not authorized to update this post' });
            }
  
            console.log('Updating post...');
            let headingDescription = await getHeadingDescription(heading);
  
            // Append sold-out status to the description
            let updatedDescription = headingDescription;
            if (soldOut === 'true') {
              updatedDescription += '\nThis item is currently sold out.';
            }
  
            // Update the post
            const updatedPost = await prisma.post.update({
              where: { id: parseInt(id) },
              data: {
                heading,
                reviews,
                description: updatedDescription,  // Update description with sold-out status
              },
            });
  
            console.log('Post updated successfully');
            return res.status(200).json(updatedPost);
          } catch (error) {
            console.error('Error updating post:', error);
            return res.status(500).json({ message: 'Error updating post' });
          }
        });
      }*/
  
      console.warn('Unsupported HTTP method');
      return res.status(405).json({ message: 'Method not allowed' });
    });
  }

