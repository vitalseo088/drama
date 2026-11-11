import React, { useState } from 'react';
import { Video, ShieldCheck, Search, X } from 'lucide-react';
import { SiteSettings, ActivePage } from '../types';

interface HeaderProps {
  settings: SiteSettings;
  activePage: ActivePage;
  selectedCategory: string | null;
  onNavigateHome: () => void;
  onNavigateCategory: (category: string) => void;
  onNavigateAdmin: () => void;
  isAdminLoggedIn: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activePage,
  selectedCategory,
  onNavigateHome,
  onNavigateCategory,
  onNavigateAdmin,
  isAdminLoggedIn,
  searchQuery,
  onSearchChange,
}) => {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
      {/* Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (Nav links) - Zone 3 (Primary Action) */}
      <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 text-left text-slate-900 hover:text-orange-600 transition-colors shrink-0 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-sm">
            <Video className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight block leading-tight">
              {settings.logoText || 'StreamPost'}
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links managed by Admin */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
          <button
            onClick={onNavigateHome}
            className={`cursor-pointer whitespace-nowrap transition-colors hover:text-orange-600 ${
              activePage === 'home' && !selectedCategory ? 'text-orange-600 font-semibold' : ''
            }`}
          >
            Home
          </button>

          {/* Dynamically managed navigation items */}
          {settings.topNavLinks
            .filter((link) => link.label !== 'Home')
            .slice(0, 4)
            .map((link) => {
              const isSelected = selectedCategory === link.label;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    if (link.path.includes('category/')) {
                      onNavigateCategory(link.label);
                    } else if (link.label === 'Trending') {
                      onNavigateCategory('Trending');
                    } else {
                      onNavigateHome();
                    }
                  }}
                  className={`cursor-pointer whitespace-nowrap transition-colors hover:text-orange-600 ${
                    isSelected ? 'text-orange-600 font-semibold' : ''
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
        </nav>

        {/* Zone 3: Search & Admin Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Search videos"
            aria-label="Toggle search"
          >
            {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>

          {/* Admin Panel button */}
          <button
            onClick={onNavigateAdmin}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activePage === 'admin'
                ? 'bg-orange-600 text-white shadow-sm'
                : isAdminLoggedIn
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isAdminLoggedIn ? 'Admin Panel' : 'Admin Login'}</span>
          </button>
        </div>
      </div>

      {/* Expandable Search Input */}
      {showSearch && (
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by video title, keyword, or tag..."
            className="w-full text-sm bg-transparent border-0 outline-none placeholder:text-slate-400 text-slate-800"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Categories sub-bar for single column navigation */}
      <div className="px-4 sm:px-6 py-2 bg-[#fcfcfd] border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
        <span className="text-slate-400 font-medium shrink-0">Topics:</span>
        <button
          onClick={onNavigateHome}
          className={`px-2.5 py-1 rounded-md shrink-0 transition-colors cursor-pointer ${
            !selectedCategory && activePage !== 'admin'
              ? 'bg-slate-900 text-white font-medium'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          All Releases
        </button>
        {settings.categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onNavigateCategory(cat)}
            className={`px-2.5 py-1 rounded-md shrink-0 transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-orange-600 text-white font-medium'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </header>
  );
};
