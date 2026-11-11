import React from 'react';
import { Play, Clock, Eye } from 'lucide-react';
import { VideoPost } from '../types';
import { formatViewCount } from '../lib/storage';

interface RelatedPostsProps {
  currentPostId: string;
  category: string;
  allPosts: VideoPost[];
  onSelectPost: (post: VideoPost) => void;
}

export const RelatedPosts: React.FC<RelatedPostsProps> = ({
  currentPostId,
  category,
  allPosts,
  onSelectPost,
}) => {
  // Find posts from the same category excluding current post
  let related = allPosts.filter(
    (p) => p.id !== currentPostId && p.category.toLowerCase() === category.toLowerCase()
  );

  // If few related posts in same category, supplement with recent posts
  if (related.length < 3) {
    const others = allPosts.filter(
      (p) => p.id !== currentPostId && !related.some((r) => r.id === p.id)
    );
    related = [...related, ...others].slice(0, 4);
  } else {
    related = related.slice(0, 4);
  }

  if (related.length === 0) return null;

  return (
    <section className="mt-10 pt-8 border-t border-slate-200">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          Related Videos in {category}
        </h3>
        <span className="text-xs text-slate-500 font-medium">
          {related.length} recommended
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {related.map((post) => (
          <div
            key={post.id}
            onClick={() => {
              onSelectPost(post);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex gap-3 group cursor-pointer p-2.5 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
          >
            {/* Mini thumbnail */}
            <div className="relative w-28 sm:w-32 aspect-video rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60">
              <img
                src={post.thumbnailUrl}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/80 text-white text-[9px] font-mono rounded">
                {post.duration}
              </div>
            </div>

            {/* Post info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug mb-1">
                  {post.title}
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span>{post.category}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <Eye className="w-3 h-3 text-slate-400" />
                    <span>{formatViewCount(post.views)}</span>
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-orange-600 font-medium mt-1">
                Watch & Download →
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
