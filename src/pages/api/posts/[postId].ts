import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { ImageAnnotatorClient } from '@google-cloud/vision';

const prisma = new PrismaClient();

// Initialize Google Vision client with API key (using `apiKey` in the URL)
const visionClient = new ImageAnnotatorClient({
  // The API key should be passed as a query parameter in the URL
  apiEndpoint: 'https://vision.googleapis.com',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { postId } = req.query;

    // Validate that the postId is a valid number
    if (!postId || isNaN(Number(postId))) {
      return res.status(400).json({ error: 'Invalid or missing post ID' });
    }

    // Fetch the post from the database
    const post = await prisma.post.findUnique({
      where: { id: Number(postId) },
      include: { user: true },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Use Google Cloud Vision API to get image description
    const [result] = await visionClient.labelDetection({
      image: {
        source: { imageUri: post.imagelink }, // Image URL
      },
    });
    const labels = result.labelAnnotations;

    if(!labels){
        return res.status(500);
    }

    if (labels.length === 0) {
      return res.status(404).json({ error: 'No labels found for the image' });
    }

    // Get the most relevant label or description
    const description = labels.map(label => label.description).join(', ');

    // Send the response back to the client
    res.status(200).json({
      id: post.id,
      heading: post.heading,
      imageUrl: post.imagelink,
      description,
    });
  } catch (error: any) {
    // Handle any errors that occurred during processing
    res.status(500).json({ error: error.message });
  }
}
