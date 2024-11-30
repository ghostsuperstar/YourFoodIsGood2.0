import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import prisma from '../../../../lib/db';

export default async function SignUp(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { username, email, password } = req.body;
        console.log(req.body);
        console.log(password);

        const existingUser = await prisma.user.findFirst({
            where: { username },
        });

        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const user = await prisma.user.create({
            data: { username, email, password },
        });

        const JWT_SECRET = process.env.JWT_SECRET;

        if (!JWT_SECRET) {
            return res.status(500).json({ message: 'JWT_SECRET is not defined' });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
        return res.status(200).json({ message: 'Sign-Up successful' });
    }
    return res.status(405).json({ message: 'Method not allowed' });
}
