import React, { useState } from 'react';
import {
  Film,
  Plus,
  Settings,
  Globe,
  Radio,
  Download,
  Database,
  Trash2,
  Edit3,
  ExternalLink,
  Search,
  Check,
  LogOut,
  ArrowLeft,
  Youtube,
  Upload,
  Layers,
  Sparkles,
  Eye,
  Sliders
} from 'lucide-react';
import { VideoPost, SiteSettings, TopNavLink, SupabaseConfig } from '../../types';
import { PostEditorModal } from './PostEditorModal';
import { SupabaseSettingsModal } from './SupabaseSettingsModal';
import { formatViewCount } from '../../lib/storage';

interface AdminPanelProps {
  posts: VideoPost[];
  settings: SiteSettings;
  onUpdatePosts: (posts: VideoPost[]) => void;
  onUpdateSettings: (settings: SiteSettings) => void;
  onViewPost: (post: VideoPost) => void;
  onBackToSite: () => void;
  onLogout: () => void;
  adminEmail?: string;
}

type AdminTab = 'posts' | 'menu' | 'adsterra' | 'download_btn' | 'supabase' | 'general';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  posts,
  settings,
  onUpdatePosts,
  onUpdateSettings,
  onViewPost,
  onBackToSite,
  onLogout,
  adminEmail,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('posts');
  const [postSearch, setPostSearch] = useState('');
  const [editingPost, setEditingPost] = useState<VideoPost | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Settings form states
  const [adsterraUrl, setAdsterraUrl] = useState(settings.adsterraSmartlinkUrl);
  const [adsterraEnabled, setAdsterraEnabled] = useState(settings.adsterraEnabled);
  const [adsterraHeight, setAdsterraHeight] = useState(settings.adsterraHeight || 340);
  const [adsterraAspectRatio, setAdsterraAspectRatio] = useState<'1:1' | 'custom'>(settings.adsterraAspectRatio || '1:1');
  const [adsterraNotice, setAdsterraNotice] = useState(settings.adsterraNoticeText);

  const [downloadText, setDownloadText] = useState(settings.downloadButtonText);
  const [downloadSubtext, setDownloadSubtext] = useState(settings.downloadButtonSubtext);
  const [downloadCountdown, setDownloadCountdown] = useState(settings.downloadCountdownSeconds);

  const [siteTitle, setSiteTitle] = useState(settings.siteTitle);
  const [siteTagline, setSiteTagline] = useState(settings.siteTagline);
  const [logoText, setLogoText] = useState(settings.logoText);
  const [footerText, setFooterText] = useState(settings.footerText);

  // Top Nav Link Management State
  const [navLinks, setNavLinks] = useState<TopNavLink[]>(settings.topNavLinks);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkPath, setNewLinkPath] = useState('');

  // Category Management State
  const [categoriesList, setCategoriesList] = useState<string[]>(settings.categories);
  const [newCategoryName, setNewCategoryName] = useState('');

  const showSuccess = (msg: string) => {
    setSavedSuccessMsg(msg);
    setTimeout(() => setSavedSuccessMsg(null), 3000);
  };

  // POST ACTIONS
  const handleCreatePost = () => {
    setEditingPost(null);
    setIsEditorOpen(true);
  };

  const handleEditPost = (post: VideoPost) => {
    setEditingPost(post);
    setIsEditorOpen(true);
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm('Are you sure you want to delete this video post?')) {
      const updated = posts.filter((p) => p.id !== postId);
      onUpdatePosts(updated);
      showSuccess('Post deleted successfully');
    }
  };

  const handleToggleFeatured = (postId: string) => {
    const updated = posts.map((p) =>
      p.id === postId ? { ...p, isFeatured: !p.isFeatured } : p
    );
    onUpdatePosts(updated);
  };

  const handleSavePost = (savedPost: VideoPost) => {
    const exists = posts.some((p) => p.id === savedPost.id);
    let updated: VideoPost[];
    if (exists) {
      updated = posts.map((p) => (p.id === savedPost.id ? savedPost : p));
      showSuccess('Post updated successfully!');
    } else {
      updated = [savedPost, ...posts];
      showSuccess('New video post published successfully!');
    }
    onUpdatePosts(updated);

    // If new category, auto-add to categories list
    if (!categoriesList.includes(savedPost.category)) {
      const newCats = [...categoriesList, savedPost.category];
      setCategoriesList(newCats);
      onUpdateSettings({ ...settings, categories: newCats });
    }
  };

  // SAVE ADSTERRA SETTINGS
  const handleSaveAdsterra = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SiteSettings = {
      ...settings,
      adsterraSmartlinkUrl: adsterraUrl.trim(),
      adsterraEnabled,
      adsterraHeight: Number(adsterraHeight),
      adsterraAspectRatio,
      adsterraNoticeText: adsterraNotice.trim(),
    };
    onUpdateSettings(updated);
    showSuccess('Adsterra Smartlink ad configuration saved!');
  };

  // SAVE DOWNLOAD BUTTON SETTINGS
  const handleSaveDownloadSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SiteSettings = {
      ...settings,
      downloadButtonText: downloadText.trim(),
      downloadButtonSubtext: downloadSubtext.trim(),
      downloadCountdownSeconds: Number(downloadCountdown),
    };
    onUpdateSettings(updated);
    showSuccess('Orange Download Button settings updated!');
  };

  // SAVE SITE IDENTITY
  const handleSaveSiteIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SiteSettings = {
      ...settings,
      siteTitle: siteTitle.trim(),
      siteTagline: siteTagline.trim(),
      logoText: logoText.trim(),
      footerText: footerText.trim(),
    };
    onUpdateSettings(updated);
    showSuccess('Site branding and details updated!');
  };

  // TOP NAV ACTIONS
  const handleAddNavLink = () => {
    if (!newLinkLabel.trim() || !newLinkPath.trim()) return;
    const newLink: TopNavLink = {
      id: `link-${Date.now()}`,
      label: newLinkLabel.trim(),
      path: newLinkPath.trim(),
      isCustom: true,
    };
    const updated = [...navLinks, newLink];
    setNavLinks(updated);
    onUpdateSettings({ ...settings, topNavLinks: updated });
    setNewLinkLabel('');
    setNewLinkPath('');
    showSuccess('Top menu navigation link added!');
  };

  const handleDeleteNavLink = (id: string) => {
    const updated = navLinks.filter((l) => l.id !== id);
    setNavLinks(updated);
    onUpdateSettings({ ...settings, topNavLinks: updated });
    showSuccess('Menu link removed.');
  };

  // CATEGORY ACTIONS
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    if (categoriesList.includes(newCategoryName.trim())) return;
    const updated = [...categoriesList, newCategoryName.trim()];
    setCategoriesList(updated);
    onUpdateSettings({ ...settings, categories: updated });
    setNewCategoryName('');
    showSuccess(`Category "${newCategoryName.trim()}" added!`);
  };

  const handleDeleteCategory = (catName: string) => {
    if (categoriesList.length <= 1) {
      alert('You must have at least one category.');
      return;
    }
    const updated = categoriesList.filter((c) => c !== catName);
    setCategoriesList(updated);
    onUpdateSettings({ ...settings, categories: updated });
    showSuccess(`Category "${catName}" removed.`);
  };

  // Filter posts for table
  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(postSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(postSearch.toLowerCase()) ||
      p.tags?.some((t) => t.toLowerCase().includes(postSearch.toLowerCase()))
  );

  return (
    <div className="w-full bg-white min-h-[85vh]">
      {/* Admin Header Bar */}
      <div className="px-4 sm:px-6 py-4 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToSite}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Return to Website"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">StreamPost Control Center</span>
              <span className="px-2 py-0.5 bg-orange-600 text-white font-mono text-[10px] font-bold rounded uppercase">
                Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Logged in as: <span className="text-slate-200 font-mono">{adminEmail || 'admin@streampost.local'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBackToSite}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Live Site</span>
          </button>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Global Success Banner */}
      {savedSuccessMsg && (
        <div className="px-4 sm:px-6 py-2.5 bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="border-b border-slate-200 bg-slate-50 px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('posts')}
          className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'posts'
              ? 'border-orange-600 text-orange-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Manage Posts ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'menu'
              ? 'border-orange-600 text-orange-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Top Menu & Categories</span>
        </button>

        <button
          onClick={() => setActiveTab('adsterra')}
          className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'adsterra'
              ? 'border-orange-600 text-orange-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Adsterra Smartlink Ad</span>
        </button>

        <button
          onClick={() => setActiveTab('download_btn')}
          className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'download_btn'
              ? 'border-orange-600 text-orange-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Orange Download Button</span>
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'supabase'
              ? 'border-orange-600 text-orange-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Supabase Auth & Storage</span>
        </button>

        <button
          onClick={() => setActiveTab('general')}
          className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'general'
              ? 'border-orange-600 text-orange-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Site Settings</span>
        </button>
      </div>

      {/* TAB 1: MANAGE POSTS */}
      {activeTab === 'posts' && (
        <div className="p-4 sm:p-6 space-y-5">
          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={postSearch}
                onChange={(e) => setPostSearch(e.target.value)}
                placeholder="Search video posts by title, category, or tag..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              onClick={handleCreatePost}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create New Video Post</span>
            </button>
          </div>

          {/* Posts Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Post & Video</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Source</th>
                    <th className="py-3 px-3">Duration & Size</th>
                    <th className="py-3 px-3">Views</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No video posts found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={post.thumbnailUrl}
                              alt=""
                              className="w-14 h-9 object-cover rounded bg-slate-200 shrink-0 border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 max-w-xs sm:max-w-sm">
                              <span className="font-bold text-slate-900 block truncate hover:text-orange-600 cursor-pointer" onClick={() => onViewPost(post)}>
                                {post.title}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono truncate block">
                                /{post.slug}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-slate-700 font-medium">{post.category}</span>
                        </td>
                        <td className="py-3 px-3">
                          {post.videoType === 'upload' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded font-medium">
                              <Upload className="w-3 h-3" /> Upload
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-red-600 bg-red-50 px-2 py-0.5 rounded font-medium">
                              <Youtube className="w-3 h-3" /> YouTube
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                          {post.duration} • {post.fileSize}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {formatViewCount(post.views)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onViewPost(post)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 cursor-pointer"
                              title="Preview Post"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleEditPost(post)}
                              className="p-1.5 text-slate-600 hover:text-orange-600 rounded hover:bg-slate-100 cursor-pointer"
                              title="Edit Post"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                              title="Delete Post"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TOP MENU & CATEGORIES */}
      {activeTab === 'menu' && (
        <div className="p-4 sm:p-6 space-y-8">
          {/* Top Menu Links Manager */}
          <div className="p-5 border border-slate-200 rounded-xl bg-white shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Top Navigation Menu Management</h3>
              <p className="text-xs text-slate-500">
                Manage the links visible in the header menu at the top of the 960px single column layout.
              </p>
            </div>

            {/* Existing Links List */}
            <div className="space-y-2">
              {navLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-800">{link.label}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{link.path}</span>
                  </div>
                  {link.label !== 'Home' ? (
                    <button
                      onClick={() => handleDeleteNavLink(link.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      title="Remove Menu Link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">Default</span>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Link */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Link Label (e.g. 4K Reels)"
                value={newLinkLabel}
                onChange={(e) => setNewLinkLabel(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="text"
                placeholder="Path (e.g. /category/4k-reels)"
                value={newLinkPath}
                onChange={(e) => setNewLinkPath(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
              />
              <button
                type="button"
                onClick={handleAddNavLink}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
              >
                + Add Menu Link
              </button>
            </div>
          </div>

          {/* Categories Management */}
          <div className="p-5 border border-slate-200 rounded-xl bg-white shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Post Categories</h3>
              <p className="text-xs text-slate-500">
                Categories are used for homepage filtering and generating related videos on single post pages.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categoriesList.map((cat) => {
                const count = posts.filter((p) => p.category === cat).length;
                return (
                  <div
                    key={cat}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{cat}</span>
                      <span className="ml-2 text-[11px] text-slate-400">({count} posts)</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder="New Category Name (e.g. Soundtracks & SFX)"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
              >
                + Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ADSTERRA SMARTLINK AD SETTINGS */}
      {activeTab === 'adsterra' && (
        <form onSubmit={handleSaveAdsterra} className="p-4 sm:p-6 max-w-2xl space-y-5">
          <div className="p-4 bg-orange-50/60 border border-orange-200 rounded-xl space-y-1.5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-orange-600" />
              <span>Adsterra Smartlink Ad Integration</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              As requested, the single post page displays a full-width iframe for your Adsterra smartlink ad directly on the website right above the post title.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Global Adsterra Smartlink URL <span className="text-orange-600">*</span>
            </label>
            <input
              type="text"
              required
              value={adsterraUrl}
              onChange={(e) => setAdsterraUrl(e.target.value)}
              placeholder="https://beta.publishers.adsterra.com/direct-link-url"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Your publisher smartlink / direct link code from Adsterra. Posts can also have unique overrides.
            </p>
          </div>

          {/* Ad Size & Aspect Ratio Selector */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-800">
                  Ad Container Sizing & Aspect Ratio
                </label>
                <p className="text-[11px] text-slate-500">
                  Select 1:1 equal size to guarantee a perfect square ad that dynamically scales to fit all screens.
                </p>
              </div>
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 font-bold text-[10px] rounded uppercase font-mono">
                {adsterraAspectRatio === '1:1' ? '1:1 Active' : 'Custom Height'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/60 rounded-lg">
              <button
                type="button"
                onClick={() => setAdsterraAspectRatio('1:1')}
                className={`py-2 px-3 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  adsterraAspectRatio === '1:1'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>1:1 Equal Size (Fit All Screens)</span>
              </button>

              <button
                type="button"
                onClick={() => setAdsterraAspectRatio('custom')}
                className={`py-2 px-3 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  adsterraAspectRatio === 'custom'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Custom Fixed Height</span>
              </button>
            </div>

            {adsterraAspectRatio === '1:1' ? (
              <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>1:1 Square Mode Active (aspect-square)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Height automatically matches 100% of the screen/container width: 360px on mobile, 768px on tablets, and 960px on desktop screens.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Custom Iframe Height (Pixels)
                </label>
                <input
                  type="number"
                  min="200"
                  max="1000"
                  step="20"
                  value={adsterraHeight}
                  onChange={(e) => setAdsterraHeight(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Monetization State
            </label>
            <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer text-xs font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={adsterraEnabled}
                onChange={(e) => setAdsterraEnabled(e.target.checked)}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
              <span>Enable Adsterra Iframe on Single Posts</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ad Notice / Disclaimer Text
            </label>
            <input
              type="text"
              value={adsterraNotice}
              onChange={(e) => setAdsterraNotice(e.target.value)}
              placeholder="Sponsored Announcement • Support Our Free High-Speed Video Mirror"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Save Adsterra Configuration
            </button>
            <button
              type="button"
              onClick={() => window.open(adsterraUrl, '_blank')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Test Smartlink URL</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: ORANGE DOWNLOAD BUTTON SETTINGS */}
      {activeTab === 'download_btn' && (
        <form onSubmit={handleSaveDownloadSettings} className="p-4 sm:p-6 max-w-2xl space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Orange Gradient Download Button Customization</h3>
            <p className="text-xs text-slate-500">
              Customize the prominent orange gradient download CTA rendered beneath each video.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Primary Button Text
            </label>
            <input
              type="text"
              value={downloadText}
              onChange={(e) => setDownloadText(e.target.value)}
              placeholder="DOWNLOAD VIDEO NOW"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Button Subtext / Quality Tagline
            </label>
            <input
              type="text"
              value={downloadSubtext}
              onChange={(e) => setDownloadSubtext(e.target.value)}
              placeholder="Ultra Fast Mirror • 1080p 60fps Full HD • Direct Download"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Countdown Delay in Seconds (0 = Instant Download)
            </label>
            <input
              type="number"
              min="0"
              max="15"
              value={downloadCountdown}
              onChange={(e) => setDownloadCountdown(Number(e.target.value))}
              className="w-32 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Shows a brief "Securing dedicated link..." countdown before unlocking the download file.
            </p>
          </div>

          {/* Interactive Live Button Preview */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Live Button Preview:
            </span>
            <div className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-extrabold text-lg shadow-lg shadow-orange-500/25 flex items-center justify-center gap-3">
              <Download className="w-6 h-6 stroke-[2.5]" />
              <div className="text-left">
                <div className="tracking-wide uppercase text-sm sm:text-base">
                  {downloadText || 'DOWNLOAD VIDEO NOW'}
                </div>
                <div className="text-xs font-medium text-orange-100 opacity-90">
                  {downloadSubtext || 'Ultra Fast Mirror • 1080p Full HD'}
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Save Button Settings
          </button>
        </form>
      )}

      {/* TAB 5: SUPABASE AUTH & STORAGE */}
      {activeTab === 'supabase' && (
        <div className="p-4 sm:p-6 max-w-2xl space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Supabase Auth & Storage</h3>
                <p className="text-xs text-slate-500">
                  Status:{' '}
                  {settings.supabaseConfig.url ? (
                    <span className="text-emerald-600 font-bold">Connected ({settings.supabaseConfig.url})</span>
                  ) : (
                    <span className="text-slate-500 font-medium">Demo Mode active (optional setup)</span>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Configure Credentials
            </button>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="p-4 border border-slate-200 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-800">What Supabase enables:</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>
                  <strong>Supabase Auth</strong>: Real email and password authentication for admin users and team moderators.
                </li>
                <li>
                  <strong>Supabase Storage</strong>: Upload MP4/WebM video releases and custom thumbnails directly to your Supabase storage bucket (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">{settings.supabaseConfig.storageBucket || 'videos'}</code>).
                </li>
                <li>
                  <strong>Direct Public URLs</strong>: Instant CDN delivery of uploaded media files without local size limits.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SITE GENERAL SETTINGS */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveSiteIdentity} className="p-4 sm:p-6 max-w-2xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">General Website Settings</h3>
            <p className="text-xs text-slate-500">
              Control the single column boxed 960px layout title, header wordmark, and footer.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Website Name & Logo Text
            </label>
            <input
              type="text"
              value={logoText}
              onChange={(e) => setLogoText(e.target.value)}
              placeholder="StreamPost"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Website Tagline
            </label>
            <input
              type="text"
              value={siteTagline}
              onChange={(e) => setSiteTagline(e.target.value)}
              placeholder="Curated Video Releases & High-Speed Mirror"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Footer Disclaimer & Copyright
            </label>
            <textarea
              rows={3}
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder="Footer text..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Save General Settings
          </button>
        </form>
      )}

      {/* Post Editor Modal */}
      <PostEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSavePost}
        initialPost={editingPost}
        categories={categoriesList}
        supabaseConfig={settings.supabaseConfig}
      />

      {/* Supabase Config Modal */}
      <SupabaseSettingsModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        config={settings.supabaseConfig}
        onSave={(newCfg) => {
          onUpdateSettings({ ...settings, supabaseConfig: newCfg });
          showSuccess('Supabase configuration saved!');
        }}
      />
    </div>
  );
};
