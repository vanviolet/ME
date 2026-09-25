import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Wrench, Home, LucideIcon } from 'lucide-react';

interface DesktopOnlyNoticeProps {
  toolName: string;
  badgeText?: string;
  description: string;
  icon?: LucideIcon;
  accentColor?: 'rose' | 'emerald' | 'blue' | 'purple' | 'amber';
  children: React.ReactNode;
}

export const DesktopOnlyNotice: React.FC<DesktopOnlyNoticeProps> = ({
  toolName,
  badgeText = 'Desktop Studio Only',
  description,
  icon: CustomIcon,
  accentColor = 'rose',
  children,
}) => {
  const [bypassMobile, setBypassMobile] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobileScreen && !bypassMobile) {
    const IconComponent = CustomIcon || Monitor;

    const accentClasses = {
      rose: {
        ring: 'bg-rose-500/15 border-rose-500/30 text-rose-400 shadow-rose-500/10',
        badge: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        btn: 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25',
      },
      blue: {
        ring: 'bg-blue-500/15 border-blue-500/30 text-blue-400 shadow-blue-500/10',
        badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        btn: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/25',
      },
      emerald: {
        ring: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10',
        badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        btn: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25',
      },
      purple: {
        ring: 'bg-purple-500/15 border-purple-500/30 text-purple-400 shadow-purple-500/10',
        badge: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        btn: 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/25',
      },
      amber: {
        ring: 'bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-amber-500/10',
        badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        btn: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/25',
      },
    }[accentColor];

    return (
      <div className="fixed inset-0 bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-6 z-50 select-none text-center font-sans overflow-y-auto">
        <div className="w-full max-w-md bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center space-y-6 animate-in fade-in backdrop-blur-md">
          {/* Main Icon in colored ring */}
          <div
            className={`w-16 h-16 rounded-2xl border flex items-center justify-center shadow-lg ${accentClasses.ring}`}
          >
            <IconComponent size={32} />
          </div>

          <div className="space-y-2.5">
            <span
              className={`inline-block text-[11px] font-mono font-semibold uppercase tracking-wider px-3 py-1 rounded-full border ${accentClasses.badge}`}
            >
              {badgeText}
            </span>
            <h2 className="text-xl font-bold text-stone-100">
              Buka di Layar Desktop / Laptop
            </h2>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm mx-auto">
              <strong className="text-stone-200">{toolName}</strong> {description}
            </p>
          </div>

          {/* Navigation buttons */}
          <div className="w-full space-y-2.5 pt-2">
            <Link
              to="/tools"
              className={`w-full py-3 px-4 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer ${accentClasses.btn}`}
            >
              <Wrench size={15} />
              <span>Lihat Perkakas Lainnya</span>
            </Link>

            <Link
              to="/"
              className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer border border-stone-700/60"
            >
              <Home size={14} />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>

          {/* Bypass button */}
          <div className="pt-2 border-t border-stone-800/80 w-full text-center">
            <button
              type="button"
              onClick={() => setBypassMobile(true)}
              className="text-[11px] text-stone-500 hover:text-stone-300 underline underline-offset-4 transition-colors cursor-pointer"
            >
              Tetap Buka {toolName} di HP (Mode Eksperimental)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
