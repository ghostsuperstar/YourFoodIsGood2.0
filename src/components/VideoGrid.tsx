// VideoGrid.tsx
import { VideoCard, Video } from './VideoCard';

export function VideoGrid({ videos, isViewingYourPost }: { videos: Video[], isViewingYourPost: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {videos.map((video) => (
        <VideoCard 
          key={video.id} 
          {...video} 
          isViewingYourPost={isViewingYourPost}
        />
      ))}
    </div>
  );
}
