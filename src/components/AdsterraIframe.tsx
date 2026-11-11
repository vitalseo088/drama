import React, { useState } from 'react';
import { ExternalLink, RefreshCw, Maximize2, Sparkles } from 'lucide-react';

interface AdsterraIframeProps {
  smartlinkUrl: string;
  height?: number;
  aspectRatio?: '1:1' | 'custom';
  noticeText?: string;
  isOverride?: boolean;
}

export const AdsterraIframe: React.FC<AdsterraIframeProps> = ({
  smartlinkUrl,
  height = 340,
  aspectRatio = '1:1',
  noticeText = 'Sponsored Announcement • Support Our Free High-Speed Video Mirror',
  isOverride = false,
}) => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Ensure clean target URL with protocol
  let targetUrl = (smartlinkUrl && smartlinkUrl.trim() !== '')
    ? smartlinkUrl.trim()
    : 'https://beta.publishers.adsterra.com/direct-link-preview-demo';

  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  const handleOpenDirect = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleReload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRefreshKey((prev) => prev + 1);
  };

  const isSquare = aspectRatio === '1:1';

  return (
    <div className="w-full bg-slate-50 border-b border-slate-200 overflow-hidden">
      {/* Ad Notice Bar */}
      <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-block px-2 py-0.5 bg-orange-600 text-white font-extrabold rounded text-[10px] uppercase tracking-wider">
            AD
          </span>
          <span className="truncate max-w-[240px] sm:max-w-md font-semibold text-slate-800">{noticeText}</span>
          {isSquare && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-600 font-mono bg-slate-200 px-1.5 py-0.5 rounded font-semibold">
              <Maximize2 className="w-3 h-3 text-orange-600" />
              1:1 Equal Ratio
            </span>
          )}
          {isOverride && (
            <span className="hidden sm:inline text-orange-600 font-bold text-xs">
              (Post Smartlink)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleReload}
            className="hover:text-slate-900 transition-colors p-1 rounded hover:bg-slate-200 cursor-pointer"
            title="Reload Ad Frame"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleOpenDirect}
            className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 transition-colors cursor-pointer text-xs"
          >
            <span>Open Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Iframe Container displaying live ad directly on website post page */}
      <div
        className={`relative w-full bg-white flex items-center justify-center overflow-hidden ${
          isSquare ? 'aspect-square' : ''
        }`}
        style={!isSquare ? { minHeight: `${height}px`, height: `${height}px` } : undefined}
      >
        <iframe
          key={refreshKey}
          src={targetUrl}
          title="Adsterra Smartlink Ad Stream"
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads allow-top-navigation-by-user-activation"
        />
      </div>

      {/* Footer bar */}
      <div className="px-4 py-1.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5 font-bold text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          Adsterra Smartlink Ad Active
        </span>
        <span className="font-mono text-xs text-slate-400 truncate max-w-[220px] sm:max-w-xs">{targetUrl}</span>
      </div>
    </div>
  );
};
