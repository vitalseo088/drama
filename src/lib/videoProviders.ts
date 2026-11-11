export interface VideoProviderInfo {
  provider: 'youtube' | 'aryplus' | 'vimeo' | 'dailymotion' | 'facebook' | 'direct_stream' | 'web_embed';
  providerName: string;
  embedUrl: string;
  thumbnailUrl: string;
  titleSuggestion?: string;
  durationSuggestion?: string;
  isDirectVideoTag: boolean;
}

/**
 * Universal Video Link Parser
 * Supports YouTube, ARY Plus TV, Vimeo, Dailymotion, Facebook, direct video files, and generic web video players
 */
export function resolveVideoSource(rawUrl: string): VideoProviderInfo {
  if (!rawUrl || rawUrl.trim() === '') {
    return {
      provider: 'web_embed',
      providerName: 'Web Video',
      embedUrl: '',
      thumbnailUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1200&auto=format&fit=crop',
      isDirectVideoTag: false,
    };
  }

  const url = rawUrl.trim();

  // 1. YOUTUBE
  const ytMatch = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/);
  if (ytMatch && ytMatch[2]?.length === 11) {
    const id = ytMatch[2];
    return {
      provider: 'youtube',
      providerName: 'YouTube',
      embedUrl: `https://www.youtube.com/embed/${id}?autoplay=0&rel=0&modestbranding=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      titleSuggestion: `YouTube Video (${id})`,
      durationSuggestion: '12:00',
      isDirectVideoTag: false,
    };
  }

  // 2. ARY PLUS TV (aryplus.tv / aryzap.com)
  if (url.includes('aryplus.tv') || url.includes('aryzap.com')) {
    // Extract video ID or episode hash from path e.g. /video/v2/3/6a6e0b1e9bc4b079859bc14b/6a57868b5bf57c474cc00a50
    const parts = url.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1] || 'episode';
    const shortHash = lastPart.substring(0, 8);

    return {
      provider: 'aryplus',
      providerName: 'ARY Plus TV',
      embedUrl: url,
      thumbnailUrl: 'https://images.unsplash.com/photo-1578022761797-b8636ac1773c?q=80&w=1200&auto=format&fit=crop',
      titleSuggestion: `ARY Plus Exclusive Drama Episode [${shortHash}]`,
      durationSuggestion: '38:40',
      isDirectVideoTag: false,
    };
  }

  // 3. VIMEO
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/);
  if (vimeoMatch && vimeoMatch[3]) {
    const id = vimeoMatch[3];
    return {
      provider: 'vimeo',
      providerName: 'Vimeo',
      embedUrl: `https://player.vimeo.com/video/${id}`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1200&auto=format&fit=crop',
      titleSuggestion: `Vimeo Presentation (${id})`,
      durationSuggestion: '08:15',
      isDirectVideoTag: false,
    };
  }

  // 4. DAILYMOTION
  const dmMatch = url.match(/(?:dailymotion\.com\/(?:video|hub)|dai\.ly)\/([0-9a-z]+)/i);
  if (dmMatch && dmMatch[1]) {
    const id = dmMatch[1];
    return {
      provider: 'dailymotion',
      providerName: 'Dailymotion',
      embedUrl: `https://www.dailymotion.com/embed/video/${id}`,
      thumbnailUrl: `https://www.dailymotion.com/thumbnail/video/${id}`,
      titleSuggestion: `Dailymotion Stream (${id})`,
      durationSuggestion: '15:30',
      isDirectVideoTag: false,
    };
  }

  // 5. FACEBOOK VIDEO
  if (url.includes('facebook.com') && (url.includes('/videos/') || url.includes('/watch/'))) {
    return {
      provider: 'facebook',
      providerName: 'Facebook Video',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`,
      thumbnailUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1200&auto=format&fit=crop',
      titleSuggestion: 'Facebook Video Broadcast',
      durationSuggestion: '05:00',
      isDirectVideoTag: false,
    };
  }

  // 6. DIRECT VIDEO FILES (MP4, WEBM, OGG, M3U8, MOV)
  const isDirectFile = /\.(mp4|webm|ogg|m3u8|mov)(\?.*)?$/i.test(url) || url.startsWith('blob:') || url.startsWith('data:video');
  if (isDirectFile) {
    const fileName = url.split('/').pop()?.split('?')[0] || 'video';
    const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    return {
      provider: 'direct_stream',
      providerName: 'Direct Video Stream',
      embedUrl: url,
      thumbnailUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1200&auto=format&fit=crop',
      titleSuggestion: cleanName ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1) : 'Direct HD Video Stream',
      durationSuggestion: '14:20',
      isDirectVideoTag: true,
    };
  }

  // 7. GENERIC EXTERNAL WEBSITE VIDEO PLAYER (e.g., streaming portals, news broadcasts, OTT platforms)
  let domain = 'Web Video';
  try {
    const parsed = new URL(url);
    domain = parsed.hostname.replace('www.', '');
  } catch {
    // fallback
  }

  return {
    provider: 'web_embed',
    providerName: domain.toUpperCase(),
    embedUrl: url,
    thumbnailUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=1200&auto=format&fit=crop',
    titleSuggestion: `${domain} Stream Release`,
    durationSuggestion: '22:15',
    isDirectVideoTag: false,
  };
}
