export type VideoSourceType = 'youtube' | 'upload' | 'url' | 'aryplus' | 'vimeo' | 'dailymotion' | 'web_embed';

export interface VideoPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  videoType: VideoSourceType;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  fileSize: string;
  downloadUrl: string;
  downloadQuality: string[];
  adsterraSmartlinkOverride?: string;
  adsterraEnabled: boolean;
  views: number;
  likes: number;
  publishedAt: string;
  author: string;
  isFeatured?: boolean;
}

export interface TopNavLink {
  id: string;
  label: string;
  path: string;
  isCustom?: boolean;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  storageBucket: string;
  connected: boolean;
}

export interface SiteSettings {
  siteTitle: string;
  siteTagline: string;
  logoText: string;
  adsterraSmartlinkUrl: string;
  adsterraEnabled: boolean;
  adsterraHeight: number;
  adsterraAspectRatio: '1:1' | 'custom';
  adsterraNoticeText: string;
  adsterraSandboxBypassMode: 'iframe' | 'interactive_preview' | 'direct';
  downloadButtonText: string;
  downloadButtonSubtext: string;
  downloadCountdownSeconds: number;
  categories: string[];
  topNavLinks: TopNavLink[];
  footerText: string;
  supabaseConfig: SupabaseConfig;
}

export type ActivePage = 'home' | 'post' | 'admin' | 'category';
