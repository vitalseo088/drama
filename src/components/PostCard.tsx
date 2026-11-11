import React from 'react';
import { Play, Eye, Download, Clock } from 'lucide-react';
import { VideoPost } from '../types';
import { formatViewCount } from '../lib/storage';

interface PostCardProps {
  post: VideoPost;
  onSelectPost: (post: VideoPost) => void;
  onSelectCategory: (category: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onSelectPost,
  onSelectCategory,
}) => {
  return (
    <article className="border-b border-slate-200 py-6 sm:py-8 first:pt-4 last:border-b-0 group">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
        {/* Video Thumbnail with Play Overlay */}
        <div
          onClick={() => onSelectPost(post)}
          className="relative w-full sm:w-72 sm:shrink-0 aspect-video rounded-lg overflow-hidden bg-slate-100 cursor-pointer border border-slate-200/80 group-hover:border-orange-500/50 transition-colors shadow-xs"
        >
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Fallback placeholder image
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=800&auto=format&fit=crop';
            }}
          />

          {/* Scrim Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-85 transition-opacity" />

          {/* Central Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-11 h-11 rounded-full bg-white/95 text-slate-900 flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 fill-slate-900 ml-0.5" />
            </div>
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-[11px] font-mono rounded font-medium flex items-center gap-1 backdrop-blur-xs">
            <Clock className="w-3 h-3" />
            <span>{post.duration}</span>
          </div>

          {/* Quality Tag */}
          <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-orange-600/90 text-white text-[10px] uppercase font-bold rounded tracking-wider shadow-xs">
            {post.downloadQuality?.[0] || '1080p HD'}
          </div>
        </div>

        {/* Post Content & Blog Metadata */}
        <div className="flex-1 min-w-0">
          {/* Unboxed Metadata (Zero-Pill Discipline: clean typography separated by '·') */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 flex-wrap">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectCategory(post.category);
              }}
              className="text-orange-600 hover:text-orange-700 font-semibold cursor-pointer"
            >
              {post.category}
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <time dateTime={post.publishedAt}>{post.publishedAt}</time>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatViewCount(post.views)} views</span>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>By {post.author}</span>
          </div>

          {/* Post Title */}
          <h2
            onClick={() => onSelectPost(post)}
            className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors leading-snug cursor-pointer mb-2.5 [text-wrap:balance]"
          >
            {post.title}
          </h2>

          {/* Blog Excerpt */}
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {post.excerpt}
          </p>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={() => onSelectPost(post)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 group-hover:translate-x-0.5 transition-all cursor-pointer"
            >
              <span>Watch Video & Download</span>
              <span aria-hidden="true">→</span>
            </button>

            {/* Mirror / Download Indicator */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>{post.fileSize}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
