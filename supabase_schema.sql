-- =========================================================================
-- STREAMPOST: PRODUCTION-READY SUPABASE DATABASE & STORAGE SETUP
-- Target Database: PostgreSQL 15+ (Supabase)
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project -> Go to "SQL Editor" in the left sidebar
-- 3. Click "+ New query", paste this entire script, and click "RUN" (Ctrl+Enter)
-- =========================================================================

-- 1. CREATE POSTS TABLE
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

-- 2. CREATE SITE SETTINGS TABLE (Single row configuration)
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
  categories TEXT[] DEFAULT '{"Tech & AI", "Cinematic 4K", "Game Trailers", "Tutorials", "Music & Beats"}',
  top_nav_links JSONB DEFAULT '[
    {"id": "1", "label": "Home", "path": "/"},
    {"id": "2", "label": "Trending", "path": "/trending"},
    {"id": "3", "label": "Tech & AI", "path": "/category/tech-ai"},
    {"id": "4", "label": "Cinematic 4K", "path": "/category/cinematic-4k"},
    {"id": "5", "label": "Game Trailers", "path": "/category/game-trailers"}
  ]'::jsonb,
  footer_text TEXT DEFAULT '© 2026 StreamPost Media Network. All videos and multimedia assets are curated for high-speed streaming.',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STORED FUNCTION: INCREMENT POST VIEWS SAFELY
CREATE OR REPLACE FUNCTION public.increment_post_views(post_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET views = views + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
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

-- 5. STORAGE BUCKETS SETUP ('videos' and 'thumbnails')
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

-- 6. INITIAL SETTINGS SEED ROW
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
  ARRAY['Tech & AI', 'Cinematic 4K', 'Game Trailers', 'Tutorials', 'Music & Beats'],
  '© 2026 StreamPost Media Network. All videos and multimedia assets are curated for high-speed streaming.'
) ON CONFLICT (id) DO NOTHING;

-- 7. INITIAL SAMPLE VIDEO POST SEED
INSERT INTO public.posts (
  id, title, slug, excerpt, content, category, tags,
  video_type, video_url, thumbnail_url, duration, file_size,
  download_url, download_quality, adsterra_enabled, views, likes, published_at, author, is_featured
) VALUES
(
  'post-1',
  'Cosmos Odyssey: 4K HDR Deep Space Expedition & Nebula Render',
  'cosmos-odyssey-4k-hdr-deep-space-expedition',
  'Explore breathtaking ultra-high-definition space imagery featuring stellar nebulae, orbiting planets, and particle simulations captured in pristine 60FPS.',
  '## About This Ultra HD Release\n\nWelcome to the Cosmos Odyssey master edition. This release features over twelve minutes of computationally rendered nebulae and simulated astrophysical phenomena based on real James Webb Space Telescope and Hubble spectral datasets.\n\n### Chapter Timestamps:\n- 00:00 - Ignition & Low Earth Orbit\n- 02:45 - Carina Nebula Pillars\n- 06:12 - Supermassive Singularity Lensing',
  'Cinematic 4K',
  ARRAY['4k', 'space', 'cinematic', 'hdr', 'astronomy'],
  'youtube',
  'https://www.youtube.com/watch?v=libKVRa01L8',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
  '11:28',
  '1.45 GB',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  ARRAY['4K Ultra HD (2160p)', '1080p 60fps Master', '720p Mobile', 'FLAC Audio Only'],
  true,
  38420,
  1940,
  CURRENT_DATE,
  'Alex Vance',
  true
),
(
  'post-2',
  'Next-Gen Robotics & Autonomous AI Agents: Full 2026 Keynote Showcase',
  'next-gen-robotics-autonomous-ai-agents-2026-keynote',
  'Detailed demonstration of humanoid spatial awareness, bipedal terrain navigation, and multi-modal neural network pathfinding in action.',
  '## Autonomous Robotics Revolution\n\nIn this comprehensive engineering breakdown, leading research teams demonstrate real-time physical AI running on low-power edge compute units.',
  'Tech & AI',
  ARRAY['robotics', 'ai', 'engineering', 'hardware', 'future'],
  'youtube',
  'https://www.youtube.com/watch?v=fn3KWM1kuAw',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200&auto=format&fit=crop',
  '18:45',
  '890 MB',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  ARRAY['1080p Full HD', '720p Web Stream', 'Audio Podcast MP3'],
  true,
  29150,
  1420,
  CURRENT_DATE,
  'Elena Rostova',
  true
),
(
  'post-3',
  'Cyberpunk Cybercity Unreal Engine 5.6: Real-Time Raytracing Tech Demo',
  'cyberpunk-cybercity-ue5-realtime-raytracing-demo',
  'High-density rain-soaked metropolitan scene rendered at 120 FPS using Nanite 2 geometry and Lumen hardware accelerated reflections.',
  '## Unreal Engine 5.6 Architectural Showcase\n\nExperience the peak of contemporary real-time rendering. This demo highlights over 2.4 billion active micro-polygons in an interactive cyberpunk cityscape.',
  'Game Trailers',
  ARRAY['unrealengine', 'raytracing', 'gaming', '4k', 'ue5'],
  'youtube',
  'https://www.youtube.com/watch?v=qC5KtatMcUw',
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
  '07:15',
  '1.12 GB',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  ARRAY['4K ProRes 422', '1080p 60fps MP4', '720p MP4'],
  true,
  47200,
  3105,
  CURRENT_DATE,
  'Marcus Vance',
  false
) ON CONFLICT (id) DO NOTHING;
