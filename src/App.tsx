import React, { useState, useEffect } from 'react';
import {
  VideoPost,
  SiteSettings,
  ActivePage,
} from './types';
import {
  getStoredPosts,
  savePosts,
  getStoredSettings,
  saveSettings,
  getAdminSession,
  setAdminSession,
  clearAdminSession,
} from './lib/storage';
import { Header } from './components/Header';
import { PostCard } from './components/PostCard';
import { SinglePostView } from './components/SinglePostView';
import { AdminPanel } from './components/admin/AdminPanel';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { SupabaseSettingsModal } from './components/admin/SupabaseSettingsModal';
import { Footer } from './components/Footer';
import { Sparkles, SlidersHorizontal, Flame, Clock } from 'lucide-react';

export default function App() {
  const [posts, setPosts] = useState<VideoPost[]>(getStoredPosts);
  const [settings, setSettings] = useState<SiteSettings>(getStoredSettings);
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [selectedPost, setSelectedPost] = useState<VideoPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'views' | 'trending'>('latest');

  // Admin auth
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | undefined>(undefined);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Initialize admin session check
  useEffect(() => {
    const session = getAdminSession();
    if (session.isAuthenticated) {
      setIsAdminLoggedIn(true);
      setAdminEmail(session.userEmail);
    }
  }, []);

  // Save posts on update
  const handleUpdatePosts = (newPosts: VideoPost[]) => {
    setPosts(newPosts);
    savePosts(newPosts);
  };

  // Save settings on update
  const handleUpdateSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Navigation handlers
  const handleNavigateHome = () => {
    setSelectedCategory(null);
    setSelectedPost(null);
    setSearchQuery('');
    setActivePage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateCategory = (cat: string) => {
    if (cat === 'Trending') {
      setSelectedCategory(null);
      setSortBy('views');
    } else {
      setSelectedCategory(cat);
    }
    setSelectedPost(null);
    setActivePage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPost = (post: VideoPost) => {
    // Increment view count
    const updated = posts.map((p) =>
      p.id === post.id ? { ...p, views: p.views + 1 } : p
    );
    handleUpdatePosts(updated);
    setSelectedPost({ ...post, views: post.views + 1 });
    setActivePage('post');
  };

  const handleOpenAdmin = () => {
    if (isAdminLoggedIn) {
      setActivePage('admin');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleAdminLoginSuccess = (email: string, _isSupabase: boolean) => {
    setIsAdminLoggedIn(true);
    setAdminEmail(email);
    setAdminSession({ isAuthenticated: true, userEmail: email, role: 'admin' });
    setActivePage('admin');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminEmail(undefined);
    clearAdminSession();
    setActivePage('home');
  };

  // Filter posts
  let displayedPosts = posts.filter((post) => {
    const matchesCategory =
      !selectedCategory ||
      post.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Sort posts
  if (sortBy === 'views' || sortBy === 'trending') {
    displayedPosts = [...displayedPosts].sort((a, b) => b.views - a.views);
  } else {
    // Latest
    displayedPosts = [...displayedPosts].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center">
      {/* 
        MANDATORY REQUIREMENT:
        "simple layout website single column boxed 960px max width white background no dark mode top menu admin can manage"
      */}
      <div className="w-full max-w-[960px] bg-white min-h-screen border-x border-slate-200/80 shadow-xs flex flex-col">
        {/* Top Header Menu managed by Admin */}
        <Header
          settings={settings}
          activePage={activePage}
          selectedCategory={selectedCategory}
          onNavigateHome={handleNavigateHome}
          onNavigateCategory={handleNavigateCategory}
          onNavigateAdmin={handleOpenAdmin}
          isAdminLoggedIn={isAdminLoggedIn}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* MAIN BODY AREA */}
        <main className="flex-1 w-full">
          {/* VIEW 1: ADMIN PANEL */}
          {activePage === 'admin' && (
            <AdminPanel
              posts={posts}
              settings={settings}
              onUpdatePosts={handleUpdatePosts}
              onUpdateSettings={handleUpdateSettings}
              onViewPost={handleSelectPost}
              onBackToSite={handleNavigateHome}
              onLogout={handleAdminLogout}
              adminEmail={adminEmail}
            />
          )}

          {/* VIEW 2: SINGLE POST PAGE */}
          {activePage === 'post' && selectedPost && (
            <SinglePostView
              post={selectedPost}
              settings={settings}
              allPosts={posts}
              onBackToHome={handleNavigateHome}
              onSelectPost={handleSelectPost}
              onSelectCategory={handleNavigateCategory}
            />
          )}

          {/* VIEW 3: HOMEPAGE (SIMPLE VIDEO POST CARDS AS BLOG POSTS) */}
          {activePage === 'home' && (
            <div className="px-4 sm:px-6 py-6 sm:py-8">
              {/* Lead Kicker / Filter Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-2 border-b border-slate-200 gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                    {selectedCategory
                      ? `${selectedCategory} Releases`
                      : searchQuery
                      ? `Search Results for "${searchQuery}"`
                      : settings.siteTagline || 'Curated Video Releases & High-Speed Mirror'}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Showing {displayedPosts.length} video blog {displayedPosts.length === 1 ? 'post' : 'posts'}
                    {selectedCategory && (
                      <button
                        onClick={handleNavigateHome}
                        className="ml-2 text-orange-600 hover:underline cursor-pointer"
                      >
                        (Clear filter)
                      </button>
                    )}
                  </p>
                </div>

                {/* Filter and Sort tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold self-start sm:self-auto">
                  <button
                    onClick={() => setSortBy('latest')}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                      sortBy === 'latest'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Latest</span>
                  </button>
                  <button
                    onClick={() => setSortBy('trending')}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                      sortBy === 'trending' || sortBy === 'views'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-orange-600" />
                    <span>Popular</span>
                  </button>
                </div>
              </div>

              {/* Video Post Cards as Blog Posts */}
              {displayedPosts.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">No video posts found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Try clearing your search query or category filter to browse our full video library.
                  </p>
                  <button
                    onClick={handleNavigateHome}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-0">
                  {displayedPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onSelectPost={handleSelectPost}
                      onSelectCategory={handleNavigateCategory}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Global Footer */}
        <Footer
          settings={settings}
          onNavigateHome={handleNavigateHome}
          onNavigateCategory={handleNavigateCategory}
          onNavigateAdmin={handleOpenAdmin}
        />
      </div>

      {/* Admin Login Modal (with Supabase Auth & Instant Demo Mode) */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleAdminLoginSuccess}
        supabaseConfig={settings.supabaseConfig}
        onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
      />

      {/* Supabase Settings Modal */}
      <SupabaseSettingsModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        config={settings.supabaseConfig}
        onSave={(newCfg) => {
          handleUpdateSettings({ ...settings, supabaseConfig: newCfg });
        }}
      />
    </div>
  );
}
