import { VideoPost, SiteSettings } from '../types';
import { INITIAL_POSTS, INITIAL_SETTINGS } from './defaultData';

const STORAGE_POSTS_KEY = 'streampost_posts_v1';
const STORAGE_SETTINGS_KEY = 'streampost_settings_v1';
const STORAGE_ADMIN_SESSION_KEY = 'streampost_admin_session_v1';

export function getStoredPosts(): VideoPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_POSTS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(INITIAL_POSTS));
      return INITIAL_POSTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure initial demo posts like ARY Plus TV are accessible
      const hasAryPost = parsed.some((p: any) => p.id === 'post-ary-1');
      if (!hasAryPost && INITIAL_POSTS[0]) {
        const merged = [INITIAL_POSTS[0], ...parsed];
        localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    }
    return INITIAL_POSTS;
  } catch (e) {
    console.error('Failed to parse posts from localStorage', e);
    return INITIAL_POSTS;
  }
}

export function savePosts(posts: VideoPost[]): void {
  try {
    localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(posts));
  } catch (e) {
    console.error('Failed to save posts to localStorage', e);
  }
}

export function getStoredSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return { ...INITIAL_SETTINGS, ...parsed };
  } catch (e) {
    console.error('Failed to parse settings from localStorage', e);
    return INITIAL_SETTINGS;
  }
}

export function saveSettings(settings: SiteSettings): void {
  try {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

export function getAdminSession(): { isAuthenticated: boolean; userEmail?: string; role?: string } {
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_SESSION_KEY);
    if (!raw) return { isAuthenticated: false };
    return JSON.parse(raw);
  } catch {
    return { isAuthenticated: false };
  }
}

export function setAdminSession(session: { isAuthenticated: boolean; userEmail?: string; role?: string }): void {
  try {
    localStorage.setItem(STORAGE_ADMIN_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save admin session', e);
  }
}

export function clearAdminSession(): void {
  localStorage.removeItem(STORAGE_ADMIN_SESSION_KEY);
}

/**
 * YouTube and Video Helpers
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function getYouTubeEmbedUrl(url: string): string {
  const videoId = extractYouTubeId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
  }
  return url;
}

export function getYouTubeThumbnail(url: string): string | null {
  const videoId = extractYouTubeId(url);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return null;
}

export function formatViewCount(views: number): string {
  if (views >= 1_000_000) {
    return (views / 1_000_000).toFixed(1) + 'M';
  }
  if (views >= 1_000) {
    return (views / 1_000).toFixed(1) + 'K';
  }
  return views.toString();
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}
