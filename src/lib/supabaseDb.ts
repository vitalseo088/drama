import { VideoPost, SiteSettings, SupabaseConfig, VideoSourceType } from '../types';
import { getSupabaseClient } from './supabase';

export interface DbPostRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  video_type: VideoSourceType;
  video_url: string;
  thumbnail_url: string;
  duration: string;
  file_size: string;
  download_url: string;
  download_quality: string[];
  adsterra_smartlink_override?: string | null;
  adsterra_enabled: boolean;
  views: number;
  likes: number;
  published_at: string;
  author: string;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export function mapRowToPost(row: DbPostRow): VideoPost {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt || '',
    content: row.content || '',
    category: row.category,
    tags: Array.isArray(row.tags) ? row.tags : [],
    videoType: row.video_type || 'youtube',
    videoUrl: row.video_url,
    thumbnailUrl: row.thumbnail_url,
    duration: row.duration || '10:00',
    fileSize: row.file_size || '500 MB',
    downloadUrl: row.download_url || row.video_url,
    downloadQuality: Array.isArray(row.download_quality) ? row.download_quality : ['1080p Full HD'],
    adsterraSmartlinkOverride: row.adsterra_smartlink_override || undefined,
    adsterraEnabled: row.adsterra_enabled ?? true,
    views: Number(row.views) || 0,
    likes: Number(row.likes) || 0,
    publishedAt: row.published_at || new Date().toISOString().split('T')[0],
    author: row.author || 'Admin',
    isFeatured: Boolean(row.is_featured),
  };
}

export function mapPostToRow(post: VideoPost): DbPostRow {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    tags: post.tags || [],
    video_type: post.videoType || 'youtube',
    video_url: post.videoUrl,
    thumbnail_url: post.thumbnailUrl,
    duration: post.duration,
    file_size: post.fileSize,
    download_url: post.downloadUrl || post.videoUrl,
    download_quality: post.downloadQuality || ['1080p Full HD'],
    adsterra_smartlink_override: post.adsterraSmartlinkOverride || null,
    adsterra_enabled: post.adsterraEnabled ?? true,
    views: post.views,
    likes: post.likes,
    published_at: post.publishedAt,
    author: post.author,
    is_featured: Boolean(post.isFeatured),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Fetch all posts from Supabase database
 */
export async function fetchPostsFromSupabase(config?: SupabaseConfig): Promise<{ data: VideoPost[] | null; error: string | null }> {
  const client = getSupabaseClient(config);
  if (!client) {
    return { data: null, error: 'Supabase client not initialized' };
  }

  try {
    const { data, error } = await client
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data || data.length === 0) {
      return { data: [], error: null };
    }

    const posts = data.map((r: any) => mapRowToPost(r as DbPostRow));
    return { data: posts, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Unknown network error' };
  }
}

/**
 * Upsert a post to Supabase database
 */
export async function upsertPostToSupabase(post: VideoPost, config?: SupabaseConfig): Promise<{ success: boolean; error: string | null }> {
  const client = getSupabaseClient(config);
  if (!client) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const row = mapPostToRow(post);
    const { error } = await client.from('posts').upsert(row, { onConflict: 'id' });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save post in Supabase' };
  }
}

/**
 * Delete a post from Supabase database
 */
export async function deletePostFromSupabase(postId: string, config?: SupabaseConfig): Promise<{ success: boolean; error: string | null }> {
  const client = getSupabaseClient(config);
  if (!client) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const { error } = await client.from('posts').delete().eq('id', postId);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete post in Supabase' };
  }
}

/**
 * Increment view count in Supabase
 */
export async function incrementPostViewsInSupabase(postId: string, currentViews: number, config?: SupabaseConfig): Promise<void> {
  const client = getSupabaseClient(config);
  if (!client) return;

  try {
    // Try RPC first if created
    const { error: rpcErr } = await client.rpc('increment_post_views', { post_id: postId });
    if (rpcErr) {
      // Fallback to update
      await client.from('posts').update({ views: currentViews + 1 }).eq('id', postId);
    }
  } catch {
    // Silent catch for views counter
  }
}

/**
 * Fetch settings from Supabase database
 */
export async function fetchSettingsFromSupabase(config?: SupabaseConfig): Promise<{ data: Partial<SiteSettings> | null; error: string | null }> {
  const client = getSupabaseClient(config);
  if (!client) {
    return { data: null, error: 'Supabase client not initialized' };
  }

  try {
    const { data, error } = await client
      .from('settings')
      .select('*')
      .eq('id', 'current')
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data) return { data: null, error: null };

    const mapped: Partial<SiteSettings> = {
      siteTitle: data.site_title,
      siteTagline: data.site_tagline,
      logoText: data.logo_text,
      adsterraSmartlinkUrl: data.adsterra_smartlink_url,
      adsterraEnabled: data.adsterra_enabled,
      adsterraHeight: data.adsterra_height,
      adsterraAspectRatio: data.adsterra_aspect_ratio || '1:1',
      adsterraNoticeText: data.adsterra_notice_text,
      downloadButtonText: data.download_button_text,
      downloadButtonSubtext: data.download_button_subtext,
      downloadCountdownSeconds: data.download_countdown_seconds,
      globalDownloadUrl: data.global_download_url || '',
      globalDownloadUrlOverride: Boolean(data.global_download_url_override),
      categories: Array.isArray(data.categories) ? data.categories : undefined,
      topNavLinks: Array.isArray(data.top_nav_links) ? data.top_nav_links : undefined,
      footerText: data.footer_text,
    };

    return { data: mapped, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/**
 * Save settings to Supabase database
 */
export async function saveSettingsToSupabase(settings: SiteSettings, config?: SupabaseConfig): Promise<{ success: boolean; error: string | null }> {
  const client = getSupabaseClient(config);
  if (!client) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const payload = {
      id: 'current',
      site_title: settings.siteTitle,
      site_tagline: settings.siteTagline,
      logo_text: settings.logoText,
      adsterra_smartlink_url: settings.adsterraSmartlinkUrl,
      adsterra_enabled: settings.adsterraEnabled,
      adsterra_height: settings.adsterraHeight,
      adsterra_aspect_ratio: settings.adsterraAspectRatio,
      adsterra_notice_text: settings.adsterraNoticeText,
      download_button_text: settings.downloadButtonText,
      download_button_subtext: settings.downloadButtonSubtext,
      download_countdown_seconds: settings.downloadCountdownSeconds,
      global_download_url: settings.globalDownloadUrl || '',
      global_download_url_override: settings.globalDownloadUrlOverride || false,
      categories: settings.categories,
      top_nav_links: settings.topNavLinks,
      footer_text: settings.footerText,
      updated_at: new Date().toISOString(),
    };

    const { error } = await client.from('settings').upsert(payload, { onConflict: 'id' });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Seed initial sample data to Supabase if tables are newly created and empty
 */
export async function seedInitialDataToSupabase(posts: VideoPost[], settings: SiteSettings, config?: SupabaseConfig): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient(config);
  if (!client) {
    return { success: false, message: 'Supabase client not initialized' };
  }

  try {
    // 1. Seed settings
    await saveSettingsToSupabase(settings, config);

    // 2. Seed posts
    const rows = posts.map(mapPostToRow);
    const { error } = await client.from('posts').upsert(rows, { onConflict: 'id' });
    if (error) {
      return { success: false, message: `Failed to seed posts: ${error.message}` };
    }

    return { success: true, message: `Successfully seeded ${posts.length} video posts and site settings to Supabase!` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Seeding error' };
  }
}
