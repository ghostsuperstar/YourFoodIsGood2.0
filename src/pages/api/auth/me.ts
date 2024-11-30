import authenticate, { UpdateRequest } from '../auth/authenticate';
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/db';

export default async function handler(req: UpdateRequest, res: NextApiResponse) {
  authenticate(req, res, async () => {
    if (req.method === 'GET') {
      try {
        if (!req.userId) {
          return res.status(401).json({ message: 'User not authenticated' });
        }
        if(typeof req.userId==="string"){
          return res.status(404);
        }
        const user = await prisma.user.findUnique({
          where: { id: req.userId },
          select: { username: true },
        });

        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        return res.json({ username: user.username });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
      }
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  });
}
