import type { NextApiRequest, NextApiResponse } from 'next';

export default async function SignOut(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        res.setHeader('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0');
        return res.status(200).json({ message: 'Sign-out successful' });
    }
    return res.status(405).json({ message: 'Method not allowed' });
}
