import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: 'Missing code parameter from Google OAuth' });
  }

  try {
    // Exchange the code for an access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: 'authorization_code',
      },
    });

    const { access_token } = tokenResponse.data;

    // Get user info using the access token
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const user = userResponse.data;

    // Create a JWT token for the user
    const JWT_SECRET = process.env.JWT_SECRET!;
    const token = jwt.sign({ userId: user.sub, username: user.name }, JWT_SECRET, {
      expiresIn: '1d', // Token expiration
    });

    // Set JWT token in a cookie
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=86400; Secure; SameSite=Strict`);

    // Redirect the user to the home page or dashboard after successful sign-in
    
    res.redirect('/');
  } catch (error) {
    console.error('Error handling Google OAuth callback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
