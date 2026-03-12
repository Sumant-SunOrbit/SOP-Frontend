import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Search, Bell, Moon, Sun, Menu } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    // FIX APPLIED: 
    // 1. Removed "/90" and "backdrop-blur-md" to make background solid (opaque).
    // 2. Increased z-index to "z-50" to ensure header stays strictly on top of all scrolling content.
    <header className="h-20 mx-8 mt-4 py-4 px-4 md:px-8 flex items-center justify-between sticky top-4 z-50 bg-[var(--sys-glass-surface)] rounded-2xl shadow-sm border border-[var(--sys-glass-border)]/50 transition-colors duration-300">
      
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-4 flex-1">
        {/* Toggle Button: Visible on Mobile Only (lg:hidden) */}
        <button 
          onClick={toggleSidebar} 
          className="lg:hidden p-2 -ml-2 text-[var(--sys-text-muted)] hover:bg-[var(--sys-bg)]/50 rounded-full transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search Bar
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--sys-text-muted)]" />
          <input 
            type="text" 
            placeholder="Search departments, courses..." 
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[var(--sys-bg)] border border-[var(--sys-secondary)]/30 text-sm focus:ring-2 focus:ring-[var(--sys-secondary)]/20 focus:border-[var(--sys-secondary)] outline-none transition-all shadow-sm placeholder:text-[var(--sys-text-muted)]/70"
          />
        </div> */}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* <button onClick={toggleTheme} className="p-2.5 rounded-full hover:bg-[var(--sys-bg)]/50 text-[var(--sys-text-muted)] transition-colors">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button> */}

        {/* <button className="p-2.5 rounded-full hover:bg-[var(--sys-bg)]/50 text-[var(--sys-text-muted)] transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-[var(--sys-primary)] rounded-full border border-[var(--sys-glass-surface)]"></span>
        </button> */}

        {/* <div className="h-8 w-[1px] bg-[var(--sys-text-muted)]/20 mx-1 md:mx-2"></div> */}

        <div className="flex items-center gap-3 cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[var(--sys-text)]">{user?.name || 'Admin'}</p>
          </div>
          
          {/* Profile Circle */}
          <div className="w-10 h-10 rounded-full border border-[var(--sys-primary)] bg-[var(--sys-bg)] flex items-center justify-center shadow-sm">
             <span className="font-bold text-[var(--sys-primary)]">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
             </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
