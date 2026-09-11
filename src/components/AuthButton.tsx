import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePortfolio } from '../context/PortfolioContext';
import { ShieldCheck, LogOut, User as UserIcon, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AuthButton: React.FC = () => {
  const { user, isAdmin, loading, signInWithGoogle, logout } = useAuth();
  const { language } = usePortfolio();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full border border-stone-200 dark:border-zinc-800 animate-pulse bg-stone-200/50 dark:bg-zinc-800/50" />
    );
  }

  if (!user) {
    return (
      <button
        id="google-signin-btn"
        onClick={signInWithGoogle}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-300/80 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-stone-50 dark:hover:bg-zinc-800 text-xs font-mono font-medium text-stone-800 dark:text-zinc-200 transition-colors shadow-2xs"
        title="Sign in with Google"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{language === 'en' ? 'Sign In' : 'Masuk'}</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5">
        {isAdmin && (
          <Link
            to="/admin"
            id="admin-hub-badge"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[11px] font-mono font-semibold hover:bg-rose-500/20 transition-colors"
            title="Moderation & Verification Center"
          >
            <ShieldCheck size={13} />
            <span>Admin</span>
          </Link>
        )}

        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1.5 p-1 rounded-full border border-stone-200 dark:border-zinc-800 hover:border-stone-400 dark:hover:border-zinc-600 transition-colors focus:outline-hidden"
          title={user.displayName || user.email || 'User profile'}
        >
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'Avatar'}
              className="w-7 h-7 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-rose-600 text-white font-mono text-xs font-bold flex items-center justify-center">
              {(user.displayName || user.email || 'U')[0].toUpperCase()}
            </div>
          )}
        </button>
      </div>

      {dropdownOpen && (
        <div
          className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 p-2 shadow-xl z-50 text-xs font-mono"
          onClick={() => setDropdownOpen(false)}
        >
          <div className="p-2.5 border-b border-stone-100 dark:border-zinc-800">
            <div className="font-semibold text-stone-900 dark:text-zinc-100 truncate">
              {user.displayName}
            </div>
            <div className="text-[11px] text-stone-500 dark:text-zinc-400 truncate">
              {user.email}
            </div>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">
                <ShieldCheck size={11} />
                Administrator (Moderator)
              </span>
            )}
          </div>

          <div className="py-1">
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <ShieldCheck size={14} />
                <span>{language === 'en' ? 'Admin Verification Portal' : 'Pusat Verifikasi Admin'}</span>
              </Link>
            )}

            <Link
              to="/articles"
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <span>{language === 'en' ? 'Explore Articles' : 'Jelajahi Artikel'}</span>
            </Link>

            <Link
              to="/issues"
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <span>{language === 'en' ? 'Community Q&A' : 'Tanya Jawab Komunitas'}</span>
            </Link>
          </div>

          <div className="pt-1 border-t border-stone-100 dark:border-zinc-800">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-stone-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors text-left"
            >
              <LogOut size={14} />
              <span>{language === 'en' ? 'Sign Out' : 'Keluar'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
