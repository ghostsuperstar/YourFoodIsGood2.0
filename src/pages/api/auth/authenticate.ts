// middleware/authenticate.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export interface UpdateRequest extends NextApiRequest {
  userId?: string;
}

export default function authenticate(req: UpdateRequest, res: NextApiResponse, next: Function) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!);
    if(!user){
      return res.status(404);
    }
    if(typeof user==="string"){
      return res.status(404);
    }
    req.userId = user.userId;
    console.log('Authenticated User ID:', req.userId);
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(403).json({ message: 'Forbidden' });
  }
}
