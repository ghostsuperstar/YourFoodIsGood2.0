import type { NextApiRequest, NextApiResponse } from 'next';
import authenticate, { UpdateRequest } from './auth/authenticate';
import { PrismaClient } from '@prisma/client';
import Pusher from 'pusher';

const prisma = new PrismaClient();

const pusherServer = new Pusher({
  appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

async function handler(req: UpdateRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return await addComment(req, res);
  } else if (req.method === 'GET') {
    return await getComments(req, res);
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}

async function addComment(req: UpdateRequest, res: NextApiResponse) {
  const { content, postId } = req.body;
  const userId = req.userId;

  if (!userId || !postId || !content) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        postId: Number(postId),
        userId: Number(userId),
      },
      include: {
        user: true,
      },
    });

    await pusherServer.trigger(`post-${postId}`, 'new-comment', {
      id: comment.id,
      content: comment.content,
      userId: comment.userId,
      username: comment.user.username,
      createdAt: comment.createdAt.toISOString(),
    });
    console.log()

    return res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    return res.status(500).json({ message: 'Failed to add comment' });
  }
}

async function getComments(req: NextApiRequest, res: NextApiResponse) {
  const { postId } = req.query;

  if (!postId || Array.isArray(postId)) {
    return res.status(400).json({ message: 'Invalid postId' });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: { postId: Number(postId) },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'asc', // Sorting comments by createdAt in descending order
      },
    });

    const commentsWithUser = comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        userId: comment.userId,
        username: comment.user.username,
        createdAt: comment.createdAt, 
      }));
      console.log(commentsWithUser);

    return res.status(200).json(commentsWithUser);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({ message: 'Failed to fetch comments' });
  }
}

export default function(req: NextApiRequest, res: NextApiResponse) {
  authenticate(req as UpdateRequest, res, () => handler(req as UpdateRequest, res));
}
