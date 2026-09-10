import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { profileData } from '../data/portfolioData';
import { ArrowDown, ArrowUpRight, Github, Mail, Instagram, MapPin, Sparkles } from 'lucide-react';

export const Hero: React.FC = () => {
  const { language, t } = usePortfolio();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-[92vh] flex flex-col justify-center pt-28 pb-16 px-6 sm:px-8 max-w-6xl mx-auto"
    >
      {/* Editorial Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Typography & Intent */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-6">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full border border-stone-200 dark:border-zinc-800 bg-stone-100/80 dark:bg-zinc-900/80 text-[12px] text-stone-700 dark:text-zinc-300 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{t(profileData.status)}</span>
          </div>

          {/* Main Hero Headline */}
          <div className="space-y-3">
            <p className="text-sm sm:text-base font-mono font-medium text-stone-500 dark:text-zinc-400">
              {language === 'en' ? "Hi, I'm Muchamad Irvan —" : 'Halo, saya Muchamad Irvan —'}
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-stone-900 dark:text-zinc-50 leading-[1.1]">
              {language === 'en' ? (
                <>
                  Fullstack Engineer building <span className="text-rose-600 dark:text-rose-400 underline decoration-rose-500/30 underline-offset-8">thoughtful</span> digital systems.
                </>
              ) : (
                <>
                  Fullstack Engineer perancang <span className="text-rose-600 dark:text-rose-400 underline decoration-rose-500/30 underline-offset-8">sistem digital</span> yang presisi.
                </>
              )}
            </h1>
          </div>

          {/* Subtext description */}
          <p className="text-base sm:text-lg text-stone-600 dark:text-zinc-400 max-w-xl leading-relaxed">
            {t(profileData.bio)}
          </p>

          {/* CTAs and Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-cta-work"
              onClick={() => scrollTo('projects')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 text-sm font-medium hover:bg-stone-800 dark:hover:bg-white transition-all shadow-xs active:scale-[0.98]"
            >
              <span>{language === 'en' ? 'View Selected Work' : 'Lihat Karya Pilihan'}</span>
              <ArrowDown size={15} />
            </button>

            <button
              id="hero-cta-talk"
              onClick={() => scrollTo('contact')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-stone-300 dark:border-zinc-700 bg-transparent text-stone-900 dark:text-zinc-100 text-sm font-medium hover:bg-stone-100 dark:hover:bg-zinc-900 transition-colors active:scale-[0.98]"
            >
              <span>{language === 'en' ? "Let's Talk" : 'Hubungi Saya'}</span>
              <ArrowUpRight size={15} />
            </button>
          </div>

          {/* Socials & Location Strip */}
          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-stone-200 dark:border-zinc-800/80 w-full text-xs text-stone-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-rose-500" />
              <span>{language === 'en' ? 'Based in Indonesia' : 'Berbasis di Indonesia'}</span>
            </div>

            <div className="h-3 w-px bg-stone-300 dark:bg-zinc-700" />

            <div className="flex items-center gap-4">
              <a
                id="hero-social-github"
                href={profileData.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-stone-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1"
                aria-label="GitHub Profile"
              >
                <Github size={15} />
                <span>GitHub</span>
              </a>

              <a
                id="hero-social-instagram"
                href={profileData.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-stone-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1"
                aria-label="Instagram Profile"
              >
                <Instagram size={15} />
                <span>Instagram</span>
              </a>

              <a
                id="hero-social-email"
                href={`mailto:${profileData.email}`}
                className="hover:text-stone-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1"
                aria-label="Direct Email"
              >
                <Mail size={15} />
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Editorial Portrait Card */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-sm group">
            {/* Subtle decorative frame */}
            <div className="relative rounded-2xl overflow-hidden border border-stone-200/90 dark:border-zinc-800 bg-stone-100 dark:bg-zinc-900 shadow-md">
              <img
                id="hero-profile-photo"
                src="/images/irvan-portrait.jpg"
                alt="Muchamad Irvan - Fullstack Software Engineer"
                className="w-full aspect-[4/5] object-cover object-top transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              {/* Editorial Caption Tag */}
              <div className="absolute bottom-3 left-3 right-3 bg-stone-900/85 dark:bg-zinc-950/85 backdrop-blur-md rounded-xl p-3 text-white border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-zinc-100">Muchamad Irvan</div>
                  <div className="text-[11px] text-zinc-400 font-mono">
                    {language === 'en' ? 'Fullstack Dev @ University' : 'Fullstack Dev @ Universitas'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-rose-400 flex items-center gap-1 justify-end">
                    <Sparkles size={11} />
                    <span>5+ Yrs</span>
                  </div>
                  <div className="text-[11px] text-zinc-300 font-mono">
                    {language === 'en' ? 'Production Scale' : 'Skala Produksi'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Metrics Strip */}
      <div className="mt-14 pt-8 border-t border-stone-200 dark:border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-6">
        {profileData.quickStats.map((stat, i) => (
          <div key={i} className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 dark:text-zinc-100">
              {stat.value}
            </span>
            <span className="text-xs font-mono text-stone-500 dark:text-zinc-400 mt-1">
              {t(stat.label)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
