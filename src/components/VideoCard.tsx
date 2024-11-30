import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export interface Video {
  id: number;
  imagelink: string;
  heading: string;
  reviews: string;
  createdBy: string;
  createdAt: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  } | null;
  isViewingYourPost: boolean;
}

export function VideoCard(props: Video) {
  const router = useRouter();
  const [isView, setIsView] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false); // State to show modal
  const [postIdToDelete, setPostIdToDelete] = useState<number | null>(null); // Store post ID to delete
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const handleCardClick = () => {
    const latitude = props.location?.latitude || 0;
    const longitude = props.location?.longitude || 0;
    router.push({
      pathname: '/video-details',
      query: {
        id: props.id,
        imagelink: props.imagelink,
        heading: props.heading,
        reviews: props.reviews,
        location: props.location?.address || 'Not available',
        lat: latitude,
        lng: longitude,
      },
    });
  };

  const handleCommentButtonClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    router.push({
      pathname: '/comments',
      query: { postId: props.id, videoHeading: props.heading, createdBy: props.createdBy },
    });
  };

  const handleDeleteButtonClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setPostIdToDelete(props.id); // Set the post ID to delete
    setShowDeleteModal(true); // Show the delete modal
  };

  const confirmDelete = async (postId: number) => {
    try {
      const res = await fetch(`http://localhost:3000/api/verifyUser?id=${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (res.ok) {
        alert('Post deleted successfully');
        setShowDeleteModal(false);
        router.push('yourPostings'); // Redirect after success
      } else {
        alert('Failed to delete post');
        router.push('yourPostings');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const timeDifference = (createdAt: string): string => {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const differenceInMs = now.getTime() - createdDate.getTime();

    const minutes = Math.floor(differenceInMs / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);

    if (months > 0) {
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    } else if (days > 0) {
      return `${days} ${days === 1 ? 'day' : 'days'}`;
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else {
      return `Just now`;
    }
  };

  return (
    <motion.div
      className="p-4 border border-gray-300 rounded-lg shadow-md cursor-pointer bg-white transition-transform transform hover:scale-105"
      style={{ height: 'fit-content', maxHeight: '400px', maxWidth: '320px' }}
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      onClick={handleCardClick}
    >
      <img
        className="rounded-md w-full h-40 object-cover"
        src={props.imagelink}
        alt={props.heading}
        style={{
          width: '100%',
          height: '160px',
          objectFit: 'cover',
        }}
      />
      <div className="font-semibold text-lg text-gray-700 mt-3 truncate">
        {props.heading}
      </div>
      <div className="text-sm text-gray-500 mt-1">{props.reviews}</div>

      <div className="mt-4 text-sm text-gray-700">
        <strong>Location:</strong> {props.location?.address || 'Not provided'}
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-gray-500 space-x-3">
        <span className="font-medium text-gray-700 truncate">Author:{props.createdBy}</span>
        <span className="text-gray-400">Time:{timeDifference(props.createdAt)}</span>
      </div>

      <div className="mt-auto">
        {props.isViewingYourPost ? (
          <>
            <button
              className="w-full py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 mt-2"
              onClick={handleDeleteButtonClick}
            >
              Delete
            </button>
          </>
        ) : (
          <button
            className="w-full py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600"
            onClick={handleCommentButtonClick}
          >
            View Comments
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Are you sure you want to delete this post?</h2>
            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={() => confirmDelete(postIdToDelete!)} // Pass the post ID to confirmDelete
              >
                Yes
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                onClick={cancelDelete}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
