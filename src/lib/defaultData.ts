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

export const INITIAL_POSTS: VideoPost[] = [
  {
    id: 'post-ary-1',
    title: 'ARY Plus Special Broadcast: Full HD Episode Stream & Direct Mirror',
    slug: 'ary-plus-special-broadcast-full-hd-episode',
    excerpt: 'Stream official high-definition television broadcast fetched directly from ARY Plus TV with responsive video player and high-speed mirror download.',
    content: `## Official ARY Plus TV Broadcast Release

Watch the full high-definition episode stream fetched directly from the ARY Plus TV network. Available for in-page streaming and high-speed mirror download.

### Broadcast Information:
- **Network**: ARY Digital Network / ARY Plus TV
- **Format**: 1080p Full HD Web Stream
- **Source Link**: https://aryplus.tv/video/v2/3/6a6e0b1e9bc4b079859bc14b/6a57868b5bf57c474cc00a50

Use the big orange gradient download button below to secure the high-speed mirror file.`,
    category: 'Entertainment & Dramas',
    tags: ['aryplus', 'drama', 'hd', 'broadcast', 'streaming'],
    videoType: 'aryplus',
    videoUrl: 'https://aryplus.tv/video/v2/3/6a6e0b1e9bc4b079859bc14b/6a57868b5bf57c474cc00a50',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578022761797-b8636ac1773c?q=80&w=1200&auto=format&fit=crop',
    duration: '42:15',
    fileSize: '750 MB',
    downloadUrl: 'https://aryplus.tv/video/v2/3/6a6e0b1e9bc4b079859bc14b/6a57868b5bf57c474cc00a50',
    downloadQuality: ['1080p Full HD', '720p HD', '480p SD'],
    adsterraEnabled: true,
    views: 52400,
    likes: 3890,
    publishedAt: '2026-04-15',
    author: 'ARY Plus Network',
    isFeatured: true,
  },
  {
    id: 'post-1',
    title: 'Cosmos Odyssey: 4K HDR Deep Space Expedition & Nebula Render',
    slug: 'cosmos-odyssey-4k-hdr-deep-space-expedition',
    excerpt: 'Explore breathtaking ultra-high-definition space imagery featuring stellar nebulae, orbiting planets, and particle simulations captured in pristine 60FPS.',
    content: `## About This Ultra HD Release

Welcome to the **Cosmos Odyssey** master edition. This release features over twelve minutes of computationally rendered nebulae and simulated astrophysical phenomena based on real James Webb Space Telescope and Hubble spectral datasets.

### Highlights & Production Notes:
- **Render Engine**: Octane Render + Houdini particle dynamics (over 45 million simulation voxels).
- **Audio Mix**: Binaural immersive ambient soundscape engineered at 24-bit 96kHz.
- **Color Grading**: Rec.2020 HDR mastered with peak luminance of 1,200 nits.

### Chapter Timestamps:
- **00:00** - Ignition & Departure from Low Earth Orbit
- **02:45** - Traversing the Carina Nebula Dust Pillars
- **06:12** - Gravitational Lensing around Supermassive Singularity
- **09:30** - Return Vector and Final Solar Flare

Download the uncompressed offline master using our high-speed mirror button below. Compatible with VLC, QuickTime, smart TVs, and all modern 4K/8K displays.`,
    category: 'Cinematic 4K',
    tags: ['4k', 'space', 'cinematic', 'hdr', 'astronomy'],
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=libKVRa01L8',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    duration: '11:28',
    fileSize: '1.45 GB',
    downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    downloadQuality: ['4K Ultra HD (2160p)', '1080p 60fps Master', '720p Mobile', 'FLAC Audio Only'],
    adsterraEnabled: true,
    views: 38420,
    likes: 1940,
    publishedAt: '2026-03-28',
    author: 'Alex Vance',
    isFeatured: true,
  },
  {
    id: 'post-2',
    title: 'Next-Gen Robotics & Autonomous AI Agents: Full 2026 Keynote Showcase',
    slug: 'next-gen-robotics-autonomous-ai-agents-2026-keynote',
    excerpt: 'Detailed demonstration of humanoid spatial awareness, bipedal terrain navigation, and multi-modal neural network pathfinding in action.',
    content: `## Autonomous Robotics Revolution

In this comprehensive engineering breakdown, leading research teams demonstrate real-time physical AI running on low-power edge compute units.

### Key Innovations Covered:
1. **Zero-Shot Terrain Adaptation**: Watch the humanoid platform traverse slick inclines, gravel slopes, and unstructured outdoor obstacle courses without pre-mapped coordinates.
2. **Tactile Grip Feedback**: Millisecond force feedback sensors allow the end-effector to manipulate delicate glassware and industrial torque wrenches interchangeably.
3. **Vision-Language-Action Models (VLA)**: Real-time verbal command parsing with situational reasoning.

Download the full presentation archive including slide transcripts and benchmark figures below.`,
    category: 'Tech & AI',
    tags: ['robotics', 'ai', 'engineering', 'hardware', 'future'],
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=fn3KWM1kuAw',
    thumbnailUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200&auto=format&fit=crop',
    duration: '18:45',
    fileSize: '890 MB',
    downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    downloadQuality: ['1080p Full HD', '720p Web Stream', 'Audio Podcast MP3'],
    adsterraEnabled: true,
    views: 29150,
    likes: 1420,
    publishedAt: '2026-04-02',
    author: 'Elena Rostova',
    isFeatured: true,
  },
  {
    id: 'post-3',
    title: 'Cyberpunk Cybercity Unreal Engine 5.6: Real-Time Raytracing Tech Demo',
    slug: 'cyberpunk-cybercity-ue5-realtime-raytracing-demo',
    excerpt: 'High-density rain-soaked metropolitan scene rendered at 120 FPS using Nanite 2 geometry and Lumen hardware accelerated reflections.',
    content: `## Unreal Engine 5.6 Architectural Showcase

Experience the peak of contemporary real-time rendering. This demo highlights over 2.4 billion active micro-polygons in an interactive cyberpunk cityscape.

### Technical Specifications:
- **Geometry Processing**: UE 5.6 Nanite geometry virtualized streaming.
- **Lighting Model**: Hardware Lumen Path Tracing with 3-bounce global illumination.
- **Volumetrics**: Heterogeneous volume fog simulation with dynamic neon light refraction.
- **Resolution**: Native 3840x2160 rendered with Temporal Super Resolution (TSR).

Get the video master capture at 120,000 kbps bitrate or download the interactive standalone benchmark project via the orange download button below.`,
    category: 'Game Trailers',
    tags: ['unrealengine', 'raytracing', 'gaming', '4k', 'ue5'],
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=qC5KtatMcUw',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    duration: '07:15',
    fileSize: '1.12 GB',
    downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    downloadQuality: ['4K ProRes 422', '1080p 60fps MP4', '720p MP4'],
    adsterraEnabled: true,
    views: 47200,
    likes: 3105,
    publishedAt: '2026-04-08',
    author: 'Marcus Vance',
    isFeatured: false,
  },
  {
    id: 'post-4',
    title: 'Mastering Modern Full-Stack Web Development in 2026: Speed Guide',
    slug: 'mastering-modern-full-stack-web-development-2026',
    excerpt: 'From reactive component architecture to scalable serverless databases: how modern web apps are architected and deployed today.',
    content: `## Complete Full-Stack Architecture Guide

Building performant, resilient web applications in 2026 requires understanding reactive state, edge middleware, and real-time database synchronizations.

### What is covered:
- **Client Architecture**: Clean UI tree organization and zero-overhead styles.
- **Backend Services**: Real-time subscriptions and role-based row-level security.
- **Storage & Delivery**: CDN edge caching and chunked media pipelines.

Download the offline video package and source bundle below.`,
    category: 'Tutorials',
    tags: ['coding', 'webdev', 'typescript', 'react', 'guide'],
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
    duration: '24:10',
    fileSize: '620 MB',
    downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    downloadQuality: ['1080p HD', '720p HD', 'MP3 Audio Lecture'],
    adsterraEnabled: true,
    views: 18450,
    likes: 985,
    publishedAt: '2026-04-10',
    author: 'DevStudio Pro',
    isFeatured: false,
  },
  {
    id: 'post-5',
    title: 'Alpine Glaciers & Nordic Fjords: Aerial 4K Drone Expedition',
    slug: 'alpine-glaciers-nordic-fjords-aerial-drone-4k',
    excerpt: 'Spectacular drone cinematography soaring over Arctic ice shelves, crystalline mountain lakes, and misty Norwegian fjords.',
    content: `## Arctic Aerial Masterwork

Filmed across seven weeks in northern Scandinavia and the Swiss Alps using custom heavy-lift cinema drones carrying Hasselblad medium-format sensor cameras.

### Production Highlights:
- **Zero Jitter Stabilization**: Triple-axis optical stabilization engineered for gale-force alpine crosswinds.
- **Pure Color**: Captured in 12-bit RAW with custom cinematic color calibration.
- **Audio Experience**: Natural wilderness sounds recorded with omnidirectional boundary microphones.

Click below to acquire the high-bitrate offline master file.`,
    category: 'Cinematic 4K',
    tags: ['drone', 'aerial', 'nature', '4k', 'travel'],
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=6rPPU05X_ps',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop',
    duration: '09:50',
    fileSize: '1.80 GB',
    downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    downloadQuality: ['4K Ultra HD (2160p)', '1080p 60fps Master', '1080p Mobile'],
    adsterraEnabled: true,
    views: 22100,
    likes: 1670,
    publishedAt: '2026-04-12',
    author: 'Nordic Visuals',
    isFeatured: false,
  },
  {
    id: 'post-6',
    title: 'Synthesizer Odyssey: Ambient Electronic Live Studio Session',
    slug: 'synthesizer-odyssey-ambient-electronic-live-session',
    excerpt: 'An uninterrupted live analog synthesizer jam utilizing modular EuroRack synthesizers, vintage tape delays, and generative step sequencers.',
    content: `## Live Studio Analog Performance

Recorded live in a single take without digital quantization or post-production edits.

### Gear List:
- Moog Subsequent 37
- Roland Juno-106 (Chorused pads)
- Eurorack Modular Complex (Make Noise Maths, Mutable Instruments Rings)
- Space Echo RE-201 hardware tape delay

Download the high-fidelity lossless FLAC audio and direct 1080p video master below.`,
    category: 'Music & Beats',
    tags: ['synth', 'ambient', 'music', 'live', 'analog'],
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
    duration: '16:32',
    fileSize: '510 MB',
    downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    downloadQuality: ['1080p Studio Video', 'Lossless 24-bit FLAC', '320kbps MP3'],
    adsterraEnabled: true,
    views: 14200,
    likes: 890,
    publishedAt: '2026-04-14',
    author: 'Analog Dreamer',
    isFeatured: false,
  },
];
