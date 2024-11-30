import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/db';
import authenticate, { UpdateRequest } from '../auth/authenticate';
import formidable, { IncomingForm, Fields, Files } from 'formidable';
import cloudinary from 'cloudinary';
import { OpenAI } from 'openai';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadImageToCloudinary = async (filePath: string): Promise<string> => {
  try {
    console.log('Uploading image to Cloudinary...');
    const result = await cloudinary.v2.uploader.upload(filePath, {
      folder: 'uploads',
      width: 300,
      height: 200,
      crop: "fill",
    });
    console.log('Image uploaded to Cloudinary:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Error uploading image to Cloudinary');
  }
};

export const getHeadingDescription = async (heading: string): Promise<string> => {
  try {
    console.log('Fetching description from OpenAI for heading:', heading);
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an assistant who describes the nutritional content based on the given heading.',
        },
        {
          role: 'user',
          content: `Please describe the nutritional content based on the following heading: ${heading}`,
        },
      ],
    });
    console.log('Received description from OpenAI:', response);
    return response.choices[0]?.message?.content || "No description available";
  } catch (error: any) {
    console.error('Error getting description from OpenAI:', error);

    if (error.code === 'insufficient_quota') {
      console.warn('Using a placeholder due to OpenAI quota error.');
      return `Default description for heading: ${heading}`;
    }
    throw new Error('Error getting description from OpenAI');
  }
};

export default async function handler(req: UpdateRequest, res: NextApiResponse) {
  authenticate(req, res, async () => {
    const userId = req.userId;
    console.log('Authenticated userId:', userId);

    // GET route to fetch posts
    if (req.method === 'GET') {
      try {
        if (!userId) {
          console.warn('User not authenticated for GET');
          return res.status(401).json({ message: 'User not authenticated' });
        }

        console.log('Fetching posts from database...');
        const posts = await prisma.post.findMany({
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

        console.log('Posts fetched successfully');
        return res.status(200).json(formattedPosts);
      } catch (error) {
        console.error('Error retrieving posts:', error);
        return res.status(500).json({ message: 'Error retrieving posts' });
      }
    }

    // POST route to create a post
    if (req.method === 'POST') {
      const form = new IncomingForm();
      console.log('Parsing incoming form data...');
      form.parse(req, async (err: any, fields: Fields, files: Files) => {
        if (err) {
          console.error('Error parsing form data:', err);
          return res.status(500).json({ message: 'Error parsing form data' });
        }

        console.log('Parsed form fields:', fields);
        console.log('Parsed form files:', files);

        const heading = Array.isArray(fields.heading) ? fields.heading[0] : fields.heading;
        const reviews = Array.isArray(fields.reviews) ? fields.reviews[0] : fields.reviews;
        const address = Array.isArray(fields.address) ? fields.address[0] : fields.address;
        const latitude = Array.isArray(fields.latitude) ? parseFloat(fields.latitude[0]) : parseFloat(fields.latitude || '0');
        const longitude = Array.isArray(fields.longitude) ? parseFloat(fields.longitude[0]) : parseFloat(fields.longitude || '0');

        if (typeof heading !== 'string' || typeof reviews !== 'string') {
          console.warn('Invalid input data:', { heading, reviews });
          return res.status(400).json({ message: 'Invalid input data' });
        }

        const file = files.file instanceof Array ? files.file[0] : files.file;
        let imageUrl = '';
        if (file?.filepath) {
          try {
            imageUrl = await uploadImageToCloudinary(file.filepath);
          } catch (error) {
            console.error('Error during Cloudinary upload:', error);
            return res.status(500).json({ message: 'Error uploading image to Cloudinary' });
          }
        }

        let headingDescription = '';
        try {
          headingDescription = await getHeadingDescription(heading);
        } catch (error) {
          console.error('Error during OpenAI request:', error);
          return res.status(500).json({ message: 'Error getting description from OpenAI' });
        }

        try {
          if (!userId || typeof userId !== 'number') {
            console.warn('User not authenticated for POST:', userId);
            return res.status(401).json({ message: 'User not authenticated' });
          }

          console.log('Creating location if required...');
          let location = null;
          if (address || !isNaN(latitude) || !isNaN(longitude)) {
            location = await prisma.location.create({
              data: {
                address: address || null,
                latitude: !isNaN(latitude) ? latitude : undefined,
                longitude: !isNaN(longitude) ? longitude : undefined,
              },
            });
            console.log('Location created:', location);
          }

          console.log('Creating new post...');
          const newPost = await prisma.post.create({
            data: {
              heading,
              imagelink: imageUrl,
              reviews,
              description: headingDescription,
              locationId: location?.id || null,
              userId,
            },
            include: {
              user: { select: { username: true } },
              location: true,
            },
          });

          const response = {
            id: newPost.id,
            heading: newPost.heading,
            imagelink: newPost.imagelink,
            reviews: newPost.reviews,
            description: newPost.description,
            location: newPost.location
              ? {
                  address: newPost.location.address,
                  latitude: newPost.location.latitude,
                  longitude: newPost.location.longitude,
                }
              : null,
            createdAt: newPost.createdAt,
            createdBy: newPost.user.username,
          };

          console.log('New post created successfully:', response);
          return res.status(201).json(response);
        } catch (error) {
          console.error('Error saving post to database:', error);
          return res.status(500).json({ message: 'Error saving post to database' });
        }
      });
      return;
    }

    console.warn('Unsupported HTTP method');
    return res.status(405).json({ message: 'Method not allowed' });
  });
}
