import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  Youtube,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Sparkles,
  Film
} from 'lucide-react';
import { VideoPost, VideoSourceType, SupabaseConfig } from '../../types';
import { extractYouTubeId, getYouTubeThumbnail, slugify } from '../../lib/storage';
import { uploadMediaToSupabase } from '../../lib/supabase';
import { resolveVideoSource } from '../../lib/videoProviders';

interface PostEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: VideoPost) => void;
  initialPost?: VideoPost | null;
  categories: string[];
  supabaseConfig: SupabaseConfig;
}

export const PostEditorModal: React.FC<PostEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPost,
  categories,
  supabaseConfig,
}) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Tech & AI');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [videoType, setVideoType] = useState<VideoSourceType>('youtube');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [duration, setDuration] = useState('10:00');
  const [fileSize, setFileSize] = useState('650 MB');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [qualityTags, setQualityTags] = useState('1080p Full HD, 720p HD, 480p SD');
  const [adsterraOverride, setAdsterraOverride] = useState('');
  const [adsterraEnabled, setAdsterraEnabled] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [tags, setTags] = useState('video, 4k, hd');
  const [author, setAuthor] = useState('Admin');

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPost) {
      setTitle(initialPost.title);
      setSlug(initialPost.slug);
      setCategory(initialPost.category);
      setVideoType(initialPost.videoType || 'youtube');
      setVideoUrl(initialPost.videoUrl);
      setThumbnailUrl(initialPost.thumbnailUrl);
      setExcerpt(initialPost.excerpt);
      setContent(initialPost.content);
      setDuration(initialPost.duration);
      setFileSize(initialPost.fileSize);
      setDownloadUrl(initialPost.downloadUrl || initialPost.videoUrl);
      setQualityTags(initialPost.downloadQuality?.join(', ') || '1080p Full HD, 720p HD');
      setAdsterraOverride(initialPost.adsterraSmartlinkOverride || '');
      setAdsterraEnabled(initialPost.adsterraEnabled ?? true);
      setIsFeatured(Boolean(initialPost.isFeatured));
      setTags(initialPost.tags?.join(', ') || '');
      setAuthor(initialPost.author || 'Admin');
    } else {
      // Default new post
      setTitle('');
      setSlug('');
      setCategory(categories[0] || 'Tech & AI');
      setVideoType('youtube');
      setVideoUrl('https://www.youtube.com/watch?v=');
      setThumbnailUrl('https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1200&auto=format&fit=crop');
      setExcerpt('');
      setContent('');
      setDuration('12:30');
      setFileSize('850 MB');
      setDownloadUrl('');
      setQualityTags('4K Ultra HD, 1080p Full HD, 720p HD');
      setAdsterraOverride('');
      setAdsterraEnabled(true);
      setIsFeatured(false);
      setTags('video, streaming, 4k');
      setAuthor('Admin');
    }
    setUploadError(null);
  }, [initialPost, categories, isOpen]);

  if (!isOpen) return null;

  // Auto-fill slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialPost) {
      setSlug(slugify(val));
    }
  };

  // Universal Video Link Auto-Fetch (YouTube, ARY Plus TV, Vimeo, Dailymotion, MP4, etc.)
  const handleAutoFetchVideoInfo = () => {
    if (!videoUrl || !videoUrl.trim()) {
      setUploadError('Please enter a video URL first.');
      return;
    }

    const info = resolveVideoSource(videoUrl);

    if (info.embedUrl) {
      if (info.thumbnailUrl && (!thumbnailUrl || thumbnailUrl.includes('unsplash.com'))) {
        setThumbnailUrl(info.thumbnailUrl);
      }
      if (!title && info.titleSuggestion) {
        setTitle(info.titleSuggestion);
        setSlug(slugify(info.titleSuggestion));
      }
      if (info.durationSuggestion && (duration === '10:00' || duration === '12:30')) {
        setDuration(info.durationSuggestion);
      }
      if (!downloadUrl) {
        setDownloadUrl(videoUrl);
      }
      // Set appropriate videoType
      if (info.provider === 'youtube') {
        setVideoType('youtube');
      } else if (info.provider === 'aryplus') {
        setVideoType('aryplus');
      } else if (info.provider === 'direct_stream') {
        setVideoType('url');
      } else {
        setVideoType('web_embed');
      }
      setUploadError(null);
      setUploadProgress(`Detected ${info.providerName} stream! Ready for responsive embedding.`);
    } else {
      setUploadError('Could not process video URL. Please check the link format.');
    }
  };

  // Video File Upload handler (Supabase Storage or Local Object URL)
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(`Processing video file "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);
    setUploadError(null);

    // Auto set file size
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    setFileSize(file.size > 1024 * 1024 * 1024 ? `${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB` : `${sizeMB} MB`);

    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      setSlug(slugify(cleanName));
    }

    // Check if Supabase client is configured
    if (supabaseConfig.url && supabaseConfig.anonKey) {
      setUploadProgress('Uploading video to Supabase Storage bucket...');
      const res = await uploadMediaToSupabase(file, supabaseConfig.storageBucket || 'videos', supabaseConfig);
      if (res.url) {
        setVideoUrl(res.url);
        setDownloadUrl(res.url);
        setUploadProgress('Video uploaded to Supabase Storage successfully!');
      } else {
        // Fallback to local URL if Supabase bucket doesn't exist
        const objectUrl = URL.createObjectURL(file);
        setVideoUrl(objectUrl);
        setDownloadUrl(objectUrl);
        setUploadProgress(`Stored locally for preview (Supabase note: ${res.error})`);
      }
    } else {
      // Local Object URL
      const objectUrl = URL.createObjectURL(file);
      setVideoUrl(objectUrl);
      setDownloadUrl(objectUrl);
      setUploadProgress('Loaded video file into local storage player.');
    }

    setIsUploading(false);
  };

  // Custom Thumbnail upload handler
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (supabaseConfig.url && supabaseConfig.anonKey) {
      const res = await uploadMediaToSupabase(file, 'thumbnails', supabaseConfig);
      if (res.url) {
        setThumbnailUrl(res.url);
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setThumbnailUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) {
      setUploadError('Title and Video Link/File are required.');
      return;
    }

    const finalCategory = showAddCategory && newCategoryInput.trim() ? newCategoryInput.trim() : category;

    const postToSave: VideoPost = {
      id: initialPost ? initialPost.id : `post-${Date.now()}`,
      title: title.trim(),
      slug: slug.trim() || slugify(title),
      excerpt: excerpt.trim() || title.trim(),
      content: content.trim() || `## ${title}\n\nHigh-definition video release and direct mirror download.`,
      category: finalCategory,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      videoType,
      videoUrl: videoUrl.trim(),
      thumbnailUrl: thumbnailUrl.trim() || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1200&auto=format&fit=crop',
      duration: duration.trim() || '10:00',
      fileSize: fileSize.trim() || '500 MB',
      downloadUrl: (downloadUrl.trim() || videoUrl.trim()),
      downloadQuality: qualityTags
        .split(',')
        .map((q) => q.trim())
        .filter(Boolean),
      adsterraSmartlinkOverride: adsterraOverride.trim() || undefined,
      adsterraEnabled,
      views: initialPost ? initialPost.views : 120,
      likes: initialPost ? initialPost.likes : 15,
      publishedAt: initialPost ? initialPost.publishedAt : new Date().toISOString().split('T')[0],
      author: author.trim() || 'Admin',
      isFeatured,
    };

    onSave(postToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-orange-500" />
            <h3 className="text-base font-bold">
              {initialPost ? 'Edit Video Post' : 'Create New Video Post'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {uploadError && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {uploadProgress && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{uploadProgress}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Post Title */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Post Title <span className="text-orange-600">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. 4K Drone Flight Over Alpine Mountains"
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
            />
          </div>

          {/* Category & Slug Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-bold text-slate-800">Category</label>
                <button
                  type="button"
                  onClick={() => setShowAddCategory(!showAddCategory)}
                  className="text-xs text-orange-600 font-bold hover:underline cursor-pointer"
                >
                  {showAddCategory ? 'Use existing' : '+ Add new'}
                </button>
              </div>

              {showAddCategory ? (
                <input
                  type="text"
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  placeholder="Enter new category name..."
                  className="w-full px-4 py-2.5 text-sm border border-orange-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white font-medium"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="post-url-slug"
                className="w-full px-4 py-2.5 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-700"
              />
            </div>
          </div>

          {/* VIDEO SOURCE TYPE SWITCHER (YouTube/Link vs Upload File) */}
          <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
            <label className="block text-sm font-bold text-slate-900">
              Video Source Method <span className="text-orange-600">*</span>
            </label>

            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-200/70 rounded-lg">
              <button
                type="button"
                onClick={() => setVideoType('url')}
                className={`py-2.5 px-3 text-xs sm:text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  videoType !== 'upload'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LinkIcon className="w-4 h-4 text-orange-600" />
                <span>Fetch from Link (YouTube, ARY Plus, Vimeo, Web Video)</span>
              </button>

              <button
                type="button"
                onClick={() => setVideoType('upload')}
                className={`py-2.5 px-3 text-xs sm:text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  videoType === 'upload'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-4 h-4 text-orange-600" />
                <span>Upload Video File</span>
              </button>
            </div>

            {/* Fetch from Link Input */}
            {videoType !== 'upload' ? (
              <div className="space-y-2.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="e.g. https://aryplus.tv/video/v2/... or https://youtube.com/watch?v=..."
                      className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFetchVideoInfo}
                    className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-bold rounded-lg flex items-center gap-2 shrink-0 shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Auto Fetch</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 flex-wrap gap-1">
                  <span>Supports ARY Plus TV, YouTube, Vimeo, Dailymotion, direct MP4/WebM, or any web video link.</span>
                  <button
                    type="button"
                    onClick={() => {
                      const sampleAry = 'https://aryplus.tv/video/v2/3/6a6e0b1e9bc4b079859bc14b/6a57868b5bf57c474cc00a50';
                      setVideoUrl(sampleAry);
                      const info = resolveVideoSource(sampleAry);
                      setTitle(info.titleSuggestion || 'ARY Plus TV Video Stream');
                      setSlug(slugify(info.titleSuggestion || 'ary-plus-video-stream'));
                      setThumbnailUrl(info.thumbnailUrl);
                      setVideoType('aryplus');
                      setDuration('38:40');
                      setDownloadUrl(sampleAry);
                      setUploadProgress('Loaded ARY Plus TV sample link! Click Auto Fetch or Save.');
                    }}
                    className="text-orange-600 hover:text-orange-700 underline font-bold cursor-pointer"
                  >
                    + Try ARY Plus Example
                  </button>
                </div>
              </div>
            ) : (
              /* Upload File Area */
              <div className="space-y-2">
                <label className="border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-xl p-5 text-center block cursor-pointer bg-white transition-colors">
                  <Upload className="w-7 h-7 text-orange-500 mx-auto mb-2" />
                  <span className="text-sm font-bold text-slate-800 block">
                    {isUploading ? 'Uploading file...' : 'Click to select or drop video file (MP4, WebM)'}
                  </span>
                  <span className="text-xs text-slate-500 block mt-1">
                    {supabaseConfig.url
                      ? 'Will upload directly to Supabase Storage bucket'
                      : 'Will load into local video player for immediate streaming'}
                  </span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    onChange={handleVideoFileUpload}
                    className="hidden"
                  />
                </label>

                {videoUrl && videoType === 'upload' && (
                  <div className="text-xs text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-lg border border-emerald-200 flex items-center justify-between font-medium">
                    <span className="truncate max-w-[300px]">Video ready: {videoUrl}</span>
                    <span className="font-mono font-bold">{fileSize}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Thumbnail Image */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Thumbnail Image URL or Upload
            </label>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://... or upload custom image"
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg cursor-pointer shrink-0 border border-slate-300">
                <span>Upload Img</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Duration, File Size, Author */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="14:30"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">File Size</label>
              <input
                type="text"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                placeholder="850 MB"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5">Author / Channel</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Studio Master"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Download Button Target URL & Quality Options */}
          <div className="p-4 bg-orange-50/60 border border-orange-200 rounded-xl space-y-3.5">
            <h4 className="text-sm font-bold text-slate-900">
              Download Mirror & Quality Settings
            </h4>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Custom Download Link (Leave blank to use video URL or Global Setting)
              </label>
              <input
                type="text"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder="https://mirror.cdn.com/download/file.mp4"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Quality Options (Comma separated)
              </label>
              <input
                type="text"
                value={qualityTags}
                onChange={(e) => setQualityTags(e.target.value)}
                placeholder="4K Ultra HD, 1080p Full HD, 720p HD, Audio MP3"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Post Excerpt */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Short Blog Excerpt (Shown on Homepage Card)
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief 1-2 sentence description shown on post cards..."
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Full Content / Article */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Full Post Description & Details (Markdown / Text)
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detailed video breakdown, release notes, and timestamps..."
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
            />
          </div>

          {/* Post-Specific Adsterra Override */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900">
                Adsterra Smartlink Ad for this Post
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adsterraEnabled}
                  onChange={(e) => setAdsterraEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                />
                <span>Enable Ad Iframe</span>
              </label>
            </div>
            <input
              type="text"
              value={adsterraOverride}
              onChange={(e) => setAdsterraOverride(e.target.value)}
              placeholder="Custom Smartlink URL for this post (optional override)"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
            />
            <p className="text-xs text-slate-500">
              Leave blank to use the global site-wide Adsterra smartlink configured in settings.
            </p>
          </div>

          {/* Featured & Tags */}
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
              />
              <span>Mark as Featured Post</span>
            </label>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                {initialPost ? 'Update Post' : 'Publish Video Post'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
