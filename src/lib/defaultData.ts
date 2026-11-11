import { VideoPost, SiteSettings } from '../types';

export const INITIAL_SETTINGS: SiteSettings = {
  siteTitle: 'StreamPost',
  siteTagline: 'Curated Video Releases, High-Speed Downloads & Guides',
  logoText: 'StreamPost',
  adsterraSmartlinkUrl: 'https://beta.publishers.adsterra.com/direct-link-preview-demo',
  adsterraEnabled: true,
  adsterraHeight: 340,
  adsterraAspectRatio: '1:1',
  adsterraNoticeText: 'Sponsored Announcement • Support Our Free High-Speed Video Mirror',
  adsterraSandboxBypassMode: 'interactive_preview',
  downloadButtonText: 'DOWNLOAD VIDEO NOW',
  downloadButtonSubtext: 'Ultra Fast Mirror • 1080p 60fps Full HD • Direct Download',
  downloadCountdownSeconds: 3,
  globalDownloadUrl: '',
  globalDownloadUrlOverride: false,
  categories: ['Entertainment & Dramas', 'Tech & AI', 'Cinematic 4K', 'Game Trailers', 'Tutorials', 'Music & Beats'],
  topNavLinks: [
    { id: '1', label: 'Home', path: '/' },
    { id: '2', label: 'Trending', path: '/trending' },
    { id: '3', label: 'Entertainment & Dramas', path: '/category/entertainment-dramas' },
    { id: '4', label: 'Tech & AI', path: '/category/tech-ai' },
    { id: '5', label: 'Cinematic 4K', path: '/category/cinematic-4k' },
  ],
  footerText: '© 2026 StreamPost Media Network. All videos and multimedia assets are curated for high-speed streaming and educational review.',
  supabaseConfig: {
    url: '',
    anonKey: '',
    storageBucket: 'videos',
    connected: false,
  },
};

export const INITIAL_POSTS: VideoPost[] = [];
