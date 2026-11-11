-- =========================================================================
-- STREAMPOST: PRODUCTION-READY SUPABASE DATABASE, USERS & STORAGE SETUP
-- Target Database: PostgreSQL 15+ (Supabase)
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project -> Go to "SQL Editor" in the left sidebar
-- 3. Click "+ New query", paste this entire script, and click "RUN" (Ctrl+Enter)
-- =========================================================================

-- 1. CREATE USERS TABLE (Linked to Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'admin',
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS FOR USERS TABLE
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access to users" ON public.users;
CREATE POLICY "Public read access to users" ON public.users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- TRIGGER TO AUTO-CREATE USER RECORD ON SUPABASE AUTH SIGN UP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, full_name)
  VALUES (new.id, new.email, 'admin', new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. CREATE POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  video_type TEXT NOT NULL DEFAULT 'youtube',
  video_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  duration TEXT DEFAULT '10:00',
  file_size TEXT DEFAULT '500 MB',
  download_url TEXT,
  download_quality TEXT[] DEFAULT '{"1080p Full HD", "720p HD"}',
  adsterra_smartlink_override TEXT,
  adsterra_enabled BOOLEAN DEFAULT TRUE,
  views BIGINT DEFAULT 0,
  likes BIGINT DEFAULT 0,
  published_at DATE DEFAULT CURRENT_DATE,
  author TEXT DEFAULT 'Admin',
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CREATE INDEXES FOR OPTIMAL QUERY PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_views ON public.posts(views DESC);

-- 3. CREATE SITE SETTINGS TABLE (Single row configuration)
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'current',
  site_title TEXT NOT NULL DEFAULT 'StreamPost',
  site_tagline TEXT DEFAULT 'Curated Video Releases & High-Speed Mirror',
  logo_text TEXT DEFAULT 'StreamPost',
  adsterra_smartlink_url TEXT,
  adsterra_enabled BOOLEAN DEFAULT TRUE,
  adsterra_height INT DEFAULT 340,
  adsterra_aspect_ratio TEXT DEFAULT '1:1',
  adsterra_notice_text TEXT DEFAULT 'Sponsored Announcement • Support Our Free High-Speed Video Mirror',
  download_button_text TEXT DEFAULT 'DOWNLOAD VIDEO NOW',
  download_button_subtext TEXT DEFAULT 'Ultra Fast Mirror • 1080p 60fps Full HD • Direct Download',
  download_countdown_seconds INT DEFAULT 3,
  categories TEXT[] DEFAULT '{"Entertainment & Dramas", "Tech & AI", "Cinematic 4K", "Game Trailers", "Tutorials", "Music & Beats"}',
  top_nav_links JSONB DEFAULT '[
    {"id": "1", "label": "Home", "path": "/"},
    {"id": "2", "label": "Trending", "path": "/trending"},
    {"id": "3", "label": "Entertainment & Dramas", "path": "/category/entertainment-dramas"},
    {"id": "4", "label": "Tech & AI", "path": "/category/tech-ai"},
    {"id": "5", "label": "Cinematic 4K", "path": "/category/cinematic-4k"}
  ]'::jsonb,
  footer_text TEXT DEFAULT '© 2026 StreamPost Media Network. All videos and multimedia assets are curated for high-speed streaming.',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STORED FUNCTION: INCREMENT POST VIEWS SAFELY
CREATE OR REPLACE FUNCTION public.increment_post_views(post_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET views = views + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. ROW LEVEL SECURITY (RLS) POLICIES FOR POSTS & SETTINGS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all visitors
DROP POLICY IF EXISTS "Public read access to posts" ON public.posts;
CREATE POLICY "Public read access to posts" ON public.posts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access to settings" ON public.settings;
CREATE POLICY "Public read access to settings" ON public.settings
  FOR SELECT USING (true);

-- Allow authenticated users (Admin) full insert, update, delete
DROP POLICY IF EXISTS "Authenticated users manage posts" ON public.posts;
CREATE POLICY "Authenticated users manage posts" ON public.posts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users manage settings" ON public.settings;
CREATE POLICY "Authenticated users manage settings" ON public.settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow anonymous key write access for initial app configuration & demo fallback
DROP POLICY IF EXISTS "Anon manage posts" ON public.posts;
CREATE POLICY "Anon manage posts" ON public.posts
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anon manage settings" ON public.settings;
CREATE POLICY "Anon manage settings" ON public.settings
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- 6. STORAGE BUCKETS SETUP ('videos' and 'thumbnails')
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies for media objects
DROP POLICY IF EXISTS "Public View Videos & Thumbnails" ON storage.objects;
CREATE POLICY "Public View Videos & Thumbnails" ON storage.objects
  FOR SELECT USING (bucket_id IN ('videos', 'thumbnails'));

DROP POLICY IF EXISTS "Allow Upload Videos & Thumbnails" ON storage.objects;
CREATE POLICY "Allow Upload Videos & Thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id IN ('videos', 'thumbnails'));

DROP POLICY IF EXISTS "Allow Manage Videos & Thumbnails" ON storage.objects;
CREATE POLICY "Allow Manage Videos & Thumbnails" ON storage.objects
  FOR ALL USING (bucket_id IN ('videos', 'thumbnails'));

-- 7. INITIAL SETTINGS SEED ROW
INSERT INTO public.settings (
  id,
  site_title,
  site_tagline,
  logo_text,
  adsterra_smartlink_url,
  adsterra_enabled,
  adsterra_height,
  adsterra_aspect_ratio,
  adsterra_notice_text,
  download_button_text,
  download_button_subtext,
  download_countdown_seconds,
  categories,
  footer_text
) VALUES (
  'current',
  'StreamPost',
  'Curated Video Releases, High-Speed Downloads & Guides',
  'StreamPost',
  'https://beta.publishers.adsterra.com/direct-link-preview-demo',
  true,
  340,
  '1:1',
  'Sponsored Announcement • Support Our Free High-Speed Video Mirror',
  'DOWNLOAD VIDEO NOW',
  'Ultra Fast Mirror • 1080p 60fps Full HD • Direct Download',
  3,
  ARRAY['Entertainment & Dramas', 'Tech & AI', 'Cinematic 4K', 'Game Trailers', 'Tutorials', 'Music & Beats'],
  '© 2026 StreamPost Media Network. All videos and multimedia assets are curated for high-speed streaming.'
) ON CONFLICT (id) DO NOTHING;
