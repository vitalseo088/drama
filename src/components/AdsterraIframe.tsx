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

  // Ensure clean target URL with protocol
  let targetUrl = (smartlinkUrl && smartlinkUrl.trim() !== '')
    ? smartlinkUrl.trim()
    : 'https://beta.publishers.adsterra.com/direct-link-preview-demo';

  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  // Timeout detector for ad networks that set X-Frame-Options: DENY
  React.useEffect(() => {
    setIframeLoaded(false);
    setHasError(false);
    const timer = setTimeout(() => {
      // If after 2.5s the iframe didn't signal clean load, treat as X-Frame-Options blocked
      setHasError(true);
    }, 2800);
    return () => clearTimeout(timer);
  }, [targetUrl, refreshKey]);

  const handleOpenDirect = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleReload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIframeLoaded(false);
    setHasError(false);
    setRefreshKey((prev) => prev + 1);
  };

  const isSquare = aspectRatio === '1:1';

  return (
    <div
      onClick={handleOpenDirect}
      className="w-full bg-slate-50 border-b border-slate-200 overflow-hidden cursor-pointer group select-none"
    >
      {/* Ad Notice Bar */}
      <div className="px-4 py-2 bg-slate-100/90 border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-block px-2 py-0.5 bg-orange-600 text-white font-extrabold rounded text-[10px] uppercase tracking-wider">
            AD
          </span>
          <span className="truncate max-w-[240px] sm:max-w-md font-semibold text-slate-800">{noticeText}</span>
          {isSquare && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-600 font-mono bg-slate-200/80 px-1.5 py-0.5 rounded font-semibold">
              <Maximize2 className="w-3 h-3 text-orange-600" />
              1:1 Equal Ratio Fit
            </span>
          )}
          {isOverride && (
            <span className="hidden sm:inline text-orange-600 font-bold text-xs">
              (Post Custom Smartlink)
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
            <span>Open Smartlink</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Iframe Container (1:1 Equal Size Fit to All Screens) */}
      <div
        className={`relative w-full bg-slate-900 flex items-center justify-center overflow-hidden ${
          isSquare ? 'aspect-square' : ''
        }`}
        style={!isSquare ? { minHeight: `${height}px`, height: `${height}px` } : undefined}
      >
        {/* Loading / Connecting Overlay */}
        {!iframeLoaded && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white z-10 p-4 text-center">
            <div className="w-9 h-9 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <span className="text-sm font-bold text-white">Connecting to Adsterra Smartlink Stream...</span>
            <span className="text-xs text-slate-400 mt-1">Responsive 1:1 square aspect ratio</span>
          </div>
        )}

        {/* The Direct Full-Width & Full-Height 1:1 Iframe */}
        {!hasError && (
          <iframe
            key={refreshKey}
            src={targetUrl}
            title="Adsterra Smartlink Ad Stream"
            className="w-full h-full absolute inset-0 border-0 transition-opacity duration-300"
            style={{
              opacity: iframeLoaded ? 1 : 0,
            }}
            onLoad={() => setIframeLoaded(true)}
            onError={() => setHasError(true)}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads allow-top-navigation-by-user-activation"
          />
        )}

        {/* High-Converting Clickable Fallback Card when ad network blocks X-Frame-Options */}
        {hasError && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 flex flex-col items-center justify-center p-6 text-center z-20 text-white space-y-3">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-orange-400 mb-1">
              <Sparkles className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h4 className="text-base sm:text-lg font-black text-white tracking-wide uppercase">
              Sponsored Adsterra Smartlink Announcement
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
              This ad provider link is active. Click below to view the official sponsor offer directly in a new tab.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleOpenDirect}
                className="px-6 py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-sm rounded-xl shadow-lg shadow-orange-500/30 flex items-center gap-2.5 cursor-pointer transition-all transform group-hover:scale-102"
              >
                <span>CLICK HERE TO VISIT SPONSORED OFFER</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
            <span className="text-[11px] font-mono text-slate-400 truncate max-w-sm pt-1">
              {targetUrl}
            </span>
          </div>
        )}
      </div>

      {/* Subtle indicator bar */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5 font-bold text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          Adsterra 1:1 Smartlink Ad Active • Fit to Screen Width
        </span>
      </div>
    </div>
  );
};
