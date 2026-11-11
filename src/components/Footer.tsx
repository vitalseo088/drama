import React from 'react';
import { Video, ShieldCheck, Heart } from 'lucide-react';
import { SiteSettings } from '../types';

interface FooterProps {
  settings: SiteSettings;
  onNavigateHome: () => void;
  onNavigateCategory: (category: string) => void;
  onNavigateAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onNavigateHome,
  onNavigateCategory,
  onNavigateAdmin,
}) => {
  return (
    <footer className="border-t border-slate-200 bg-[#fafbfc] px-4 sm:px-6 py-8 text-xs text-slate-500 mt-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-slate-900 font-extrabold text-sm tracking-tight hover:text-orange-600 transition-colors cursor-pointer"
        >
          <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white">
            <Video className="w-3.5 h-3.5" />
          </div>
          <span>{settings.logoText || 'StreamPost'}</span>
        </button>

        <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-600">
          <button
            onClick={onNavigateHome}
            className="hover:text-slate-900 cursor-pointer"
          >
            All Videos
          </button>
          {settings.categories.slice(0, 4).map((cat) => (
            <button
              key={cat}
              onClick={() => onNavigateCategory(cat)}
              className="hover:text-orange-600 cursor-pointer"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-400">
        <p className="max-w-xl leading-relaxed">
          {settings.footerText ||
            '© 2026 StreamPost Media Network. All videos and multimedia assets are curated for high-speed streaming.'}
        </p>
        <span className="shrink-0 flex items-center gap-1 text-slate-400">
          Boxed 960px • Pure White Theme
        </span>
      </div>
    </footer>
  );
};
