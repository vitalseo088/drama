import React, { useState } from 'react';
import { ExternalLink, ShieldAlert, Sparkles, RefreshCw, Maximize2 } from 'lucide-react';

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
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Validate or construct display URL
  const targetUrl = smartlinkUrl && smartlinkUrl.trim() !== ''
    ? smartlinkUrl.trim()
    : 'https://beta.publishers.adsterra.com/direct-link-preview-demo';

  const handleOpenDirect = () => {
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleReload = () => {
    setIframeLoaded(false);
    setHasError(false);
    setRefreshKey((prev) => prev + 1);
  };

  const isSquare = aspectRatio === '1:1';

  return (
    <div className="w-full bg-slate-50 border-b border-slate-200 overflow-hidden">
      {/* Ad Notice Bar */}
      <div className="px-4 py-2 bg-slate-100/90 border-b border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-block px-1.5 py-0.5 bg-orange-600 text-white font-bold rounded text-[10px] uppercase tracking-wider">
            AD
          </span>
          <span className="truncate max-w-[240px] sm:max-w-md">{noticeText}</span>
          {isSquare && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-600 font-mono bg-slate-200/80 px-1.5 py-0.2 rounded">
              <Maximize2 className="w-2.5 h-2.5 text-orange-600" />
              1:1 Equal Ratio Fit
            </span>
          )}
          {isOverride && (
            <span className="hidden sm:inline text-orange-600 font-medium">
              (Post Smartlink)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleReload}
            className="hover:text-slate-800 transition-colors p-1 rounded hover:bg-slate-200 cursor-pointer"
            title="Reload Ad Frame"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleOpenDirect}
            className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Open Link</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Iframe Container (1:1 Equal Size Fit to All Screens) */}
      <div
        className={`relative w-full bg-white flex items-center justify-center overflow-hidden ${
          isSquare ? 'aspect-square' : ''
        }`}
        style={!isSquare ? { minHeight: `${height}px`, height: `${height}px` } : undefined}
      >
        {/* Loading Spinner */}
        {!iframeLoaded && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/95 z-10 text-slate-500 p-4 text-center">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-2.5"></div>
            <span className="text-xs font-bold text-slate-800">Connecting to Adsterra Smartlink (1:1 Equal Fit)...</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Responsive square aspect fitting all screen resolutions</span>
          </div>
        )}

        {/* The Direct Full-Width & Full-Height 1:1 Iframe */}
        <iframe
          key={refreshKey}
          src={targetUrl}
          title="Adsterra Smartlink Ad Stream"
          className="w-full h-full absolute inset-0 border-0 transition-opacity duration-300"
          style={{
            opacity: iframeLoaded ? 1 : 0.4,
          }}
          onLoad={() => setIframeLoaded(true)}
          onError={() => setHasError(true)}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"
        />

        {/* Fallback Banner if external ad network denies iframe embedding via X-Frame-Options */}
        {hasError && (
          <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-6 text-center z-20">
            <ShieldAlert className="w-10 h-10 text-amber-500 mb-2.5" />
            <h4 className="text-sm font-bold text-slate-800 mb-1">Sponsored Adsterra Smartlink Offer</h4>
            <p className="text-xs text-slate-500 max-w-md mb-4 leading-relaxed">
              This ad provider restricts direct in-page iframe embedding from this preview domain. Click below to view the sponsor announcement directly.
            </p>
            <button
              onClick={handleOpenDirect}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-transform hover:scale-102"
            >
              <span>Visit Sponsored Offer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Subtle indicator bar */}
      <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3 h-3 text-orange-500" />
          Adsterra 1:1 Smartlink Ad Active • Fit to Screen Width
        </span>
        <span className="font-mono text-[9px] truncate max-w-[220px] sm:max-w-xs">{targetUrl}</span>
      </div>
    </div>
  );
};
