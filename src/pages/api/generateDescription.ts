import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  try {
    // Use the image URL provided in the request body or fallback to a default testing URL
    const { image } = req.body || { image: 'C:/FullStackDevelopment/foodguide3/public/foodguide1.jpg' };

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content:`Please describe the following image: ${image}` ,
        },
      ],
    });

    const description = response.choices[0]?.message?.content || 'No description available';
    return res.status(200).json({ description });
  } catch (error) {
    console.error('Error generating description:', error);
    return res.status(500).json({ message: 'Error generating description' });
  }
};

export default handler;