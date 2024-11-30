import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
  const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;
  const SCOPE = 'profile email';  // Scope for the information we want from Google
  const RESPONSE_TYPE = 'code';
  const ACCESS_TYPE = 'offline';
  
  // Construct the Google OAuth URL
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${CLIENT_ID}&` +
    `redirect_uri=${REDIRECT_URI}&` +
    `scope=${SCOPE}&` +
    `response_type=${RESPONSE_TYPE}&` +
    `access_type=${ACCESS_TYPE}`;
  
  // Redirect the user to Google's OAuth URL
  console.log(googleAuthUrl);
  res.redirect(googleAuthUrl);
}
