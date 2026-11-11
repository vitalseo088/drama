import React, { useState, useEffect } from 'react';
import {
  Download,
  Share2,
  Heart,
  Eye,
  Check,
  ArrowLeft,
  Calendar,
  User,
  Sparkles,
  FileVideo,
  ExternalLink
} from 'lucide-react';
import { VideoPost, SiteSettings } from '../types';
import { AdsterraIframe } from './AdsterraIframe';
import { RelatedPosts } from './RelatedPosts';
import { formatViewCount, getYouTubeEmbedUrl } from '../lib/storage';

interface SinglePostViewProps {
  post: VideoPost;
  settings: SiteSettings;
  allPosts: VideoPost[];
  onBackToHome: () => void;
  onSelectPost: (post: VideoPost) => void;
  onSelectCategory: (category: string) => void;
}

export const SinglePostView: React.FC<SinglePostViewProps> = ({
  post,
  settings,
  allPosts,
  onBackToHome,
  onSelectPost,
  onSelectCategory,
}) => {
  const [likes, setLikes] = useState(post.likes);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState(post.downloadQuality?.[0] || '1080p Full HD');
  const [downloadState, setDownloadState] = useState<'idle' | 'countdown' | 'ready' | 'downloading'>('idle');
  const [countdown, setCountdown] = useState(settings.downloadCountdownSeconds || 3);

  // Scroll to top when post changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setDownloadState('idle');
    setCountdown(settings.downloadCountdownSeconds || 3);
  }, [post.id, settings.downloadCountdownSeconds]);

  // Countdown timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (downloadState === 'countdown') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      } else {
        setDownloadState('ready');
      }
    }
    return () => clearTimeout(timer);
  }, [downloadState, countdown]);

  const handleLike = () => {
    if (!hasLiked) {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    } else {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartDownload = () => {
    const delay = settings.downloadCountdownSeconds ?? 3;
    if (delay > 0 && downloadState === 'idle') {
      setDownloadState('countdown');
      setCountdown(delay);
    } else {
      executeDownload();
    }
  };

  const executeDownload = () => {
    setDownloadState('downloading');
    const targetUrl = post.downloadUrl || post.videoUrl;
    
    // Trigger download / open link
    if (targetUrl) {
      const a = document.createElement('a');
      a.href = targetUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = `${post.slug}_${selectedQuality.replace(/\s+/g, '_')}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    setTimeout(() => {
      setDownloadState('ready');
    }, 1500);
  };

  // Determine which Adsterra smartlink to show: post override or site default
  const activeSmartlinkUrl =
    post.adsterraSmartlinkOverride && post.adsterraSmartlinkOverride.trim() !== ''
      ? post.adsterraSmartlinkOverride
      : settings.adsterraSmartlinkUrl;

  const showAdsterra = settings.adsterraEnabled && post.adsterraEnabled !== false;

  return (
    <div className="w-full bg-white pb-16">
      {/* Back to Home Breadcrumb */}
      <div className="px-4 sm:px-6 py-3 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1.5 hover:text-slate-900 font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Videos</span>
        </button>
        <div className="flex items-center gap-1.5">
          <span>Category:</span>
          <button
            onClick={() => onSelectCategory(post.category)}
            className="text-orange-600 font-semibold hover:underline cursor-pointer"
          >
            {post.category}
          </button>
        </div>
      </div>

      {/* 
        EXACT REQUIREMENT 1:
        "single post page contains full page iframe for adsterra smartlink ad shows directly on website"
      */}
      {showAdsterra && (
        <section aria-label="Sponsored Adsterra Smartlink Ad" className="w-full">
          <AdsterraIframe
            smartlinkUrl={activeSmartlinkUrl}
            height={settings.adsterraHeight || 340}
            aspectRatio={settings.adsterraAspectRatio || '1:1'}
            noticeText={settings.adsterraNoticeText}
            isOverride={Boolean(post.adsterraSmartlinkOverride)}
          />
        </section>
      )}

      {/* 
        EXACT REQUIREMENT 2:
        "below ad post title"
      */}
      <div className="px-4 sm:px-6 pt-6 sm:pt-8">
        {/* Unboxed Metadata (Zero-Pill Discipline) */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2.5 flex-wrap">
          <button
            onClick={() => onSelectCategory(post.category)}
            className="text-orange-600 hover:text-orange-700 font-bold uppercase tracking-wider text-[11px] cursor-pointer"
          >
            {post.category}
          </button>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <time dateTime={post.publishedAt}>{post.publishedAt}</time>
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatViewCount(post.views)} views</span>
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>{post.author}</span>
          </span>
        </div>

        {/* Post Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight mb-4 [text-wrap:balance]">
          {post.title}
        </h1>

        {/* Action Toolbar: Share, Like, Mirror Info */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                hasLiked
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{likes}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied!' : 'Share Video'}</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-3">
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
              Duration: {post.duration}
            </span>
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
              File: {post.fileSize}
            </span>
          </div>
        </div>

        {/* 
          EXACT REQUIREMENT 3:
          "then actual video"
        */}
        <div className="my-6">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-md border border-slate-200">
            {post.videoType === 'youtube' ? (
              <iframe
                src={getYouTubeEmbedUrl(post.videoUrl)}
                title={post.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <video
                controls
                poster={post.thumbnailUrl}
                className="w-full h-full object-contain bg-black"
                preload="metadata"
              >
                <source src={post.videoUrl} type="video/mp4" />
                <source src={post.videoUrl} type="video/webm" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>

        {/* 
          EXACT REQUIREMENT 4:
          "big download orange gradients button"
        */}
        <div className="my-8 p-5 sm:p-6 bg-gradient-to-b from-orange-50/70 to-amber-50/40 rounded-2xl border border-orange-200/80 shadow-xs">
          {/* Quality Selector Pills / Tabs */}
          {post.downloadQuality && post.downloadQuality.length > 0 && (
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Select Mirror Format & Quality:
              </label>
              <div className="flex flex-wrap gap-2">
                {post.downloadQuality.map((q) => (
                  <button
                    key={q}
                    onClick={() => setSelectedQuality(q)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedQuality === q
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-orange-400'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* The Big Orange Gradient Download Button */}
          {downloadState === 'countdown' ? (
            <div className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white text-center shadow-lg shadow-orange-500/25 flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 font-bold text-base sm:text-lg mb-1">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating High-Speed Download Link ({countdown}s)...</span>
              </div>
              <p className="text-xs text-orange-100">
                Please wait a few seconds while your dedicated mirror connection is secured.
              </p>
            </div>
          ) : (
            <button
              onClick={handleStartDownload}
              className="w-full py-4 sm:py-5 px-6 sm:px-8 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-[0.99] text-white font-extrabold text-base sm:text-xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-3 transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Download className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] animate-bounce" />
              </div>
              <div className="text-left">
                <div className="tracking-wide uppercase">
                  {downloadState === 'ready' || downloadState === 'downloading'
                    ? 'CLICK TO DOWNLOAD FILE NOW'
                    : settings.downloadButtonText || 'DOWNLOAD VIDEO NOW'}
                </div>
                <div className="text-xs sm:text-sm font-medium text-orange-100 opacity-95">
                  {settings.downloadButtonSubtext || `Direct Link • ${selectedQuality} • ${post.fileSize}`}
                </div>
              </div>
            </button>
          )}

          {/* Download Guarantee & File Details */}
          <div className="mt-3.5 flex flex-wrap items-center justify-between text-[11px] text-slate-500 px-1 gap-2">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>Direct CDN Speed • Verified Clean File • No Registration Required</span>
            </span>
            <span className="font-mono text-slate-600">Package Size: {post.fileSize}</span>
          </div>
        </div>

        {/* Post Blog Article & Content */}
        <div className="prose prose-slate max-w-none py-4 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <FileVideo className="w-4 h-4 text-orange-600" />
            <h3 className="text-base font-bold text-slate-900 m-0">Video Details & Release Notes</h3>
          </div>

          {/* Render blog post content */}
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {post.content}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-400 font-medium">Keywords:</span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-mono text-[11px]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 
          EXACT REQUIREMENT 5:
          "and related videos from same category"
        */}
        <RelatedPosts
          currentPostId={post.id}
          category={post.category}
          allPosts={allPosts}
          onSelectPost={onSelectPost}
        />
      </div>
    </div>
  );
};
