import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { SAMPLE_CHORDS, playChordSound, ChordDefinition } from '../utils/audioSynth';
import { Volume2, ExternalLink, Music2, Eye, Sparkles, Sliders } from 'lucide-react';

export const InteractiveNoteLogicDemo: React.FC = () => {
  const { language } = usePortfolio();
  const [selectedChord, setSelectedChord] = useState<ChordDefinition>(SAMPLE_CHORDS[0]);
  const [activeTab, setActiveTab] = useState<'demo' | 'screens'>('demo');
  const [activeScreenshot, setActiveScreenshot] = useState<string>('/images/notelogic-landing.jpg');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handlePlayChord = (chord: ChordDefinition) => {
    setSelectedChord(chord);
    setIsPlaying(true);
    playChordSound(chord);
    setTimeout(() => setIsPlaying(false), 800);
  };

  const screenshots = [
    {
      title: language === 'en' ? 'Landing & Overview' : 'Beranda & Fitur',
      image: '/images/notelogic-landing.jpg',
      caption: language === 'en' ? 'Interactive 8 modules overview and navigation.' : 'Ikhtisar 8 modul interaktif dan navigasi aplikasi.',
    },
    {
      title: language === 'en' ? 'Chord Explorer' : 'Chord Explorer',
      image: '/images/notelogic-chords.jpg',
      caption: language === 'en' ? '954+ chords with guitar fretboard and piano voicing.' : '954+ chord dengan fretboard gitar dan voicing tuts piano.',
    },
    {
      title: language === 'en' ? 'Tab Studio Draft' : 'Tab Studio Draft',
      image: '/images/notelogic-tab.jpg',
      caption: language === 'en' ? 'In-browser DAW sequencer with live staff score and measures.' : 'Sequencer tablatur gitar in-browser dengan partitur not balok.',
    },
  ];

  return (
    <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-stone-50/70 dark:bg-zinc-900/60 overflow-hidden shadow-sm">
      {/* Header Bar */}
      <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 dark:bg-zinc-900/90">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
            <Music2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-stone-900 dark:text-zinc-100">
                NoteLogic
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold">
                Featured Product
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-zinc-400 font-mono mt-0.5">
              van-theory.vercel.app · Web Audio API · 954+ Chords
            </p>
          </div>
        </div>

        {/* View Switcher & Live Link */}
        <div className="flex items-center gap-2">
          <div className="flex bg-stone-100 dark:bg-zinc-800 p-1 rounded-lg border border-stone-200 dark:border-zinc-700/60 text-xs font-mono">
            <button
              onClick={() => setActiveTab('demo')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'demo'
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 font-semibold shadow-xs'
                  : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
              }`}
            >
              {language === 'en' ? 'Live Synthesizer' : 'Sintesis Audio'}
            </button>
            <button
              onClick={() => setActiveTab('screens')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'screens'
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 font-semibold shadow-xs'
                  : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
              }`}
            >
              {language === 'en' ? 'Screenshots' : 'Tangkapan Layar'}
            </button>
          </div>

          <a
            href="https://van-theory.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors shadow-xs"
          >
            <span>{language === 'en' ? 'Open App' : 'Buka App'}</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Main Body */}
      {activeTab === 'demo' ? (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono text-stone-500 dark:text-zinc-400">
                {language === 'en'
                  ? 'Click any chord below to trigger the built-in harmonic Web Audio synthesizer:'
                  : 'Pilih chord di bawah untuk mendengarkan sintesis harmoni Web Audio API:'}
              </span>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-mono text-stone-500 dark:text-zinc-400 bg-stone-200/50 dark:bg-zinc-800/50 px-2 py-1 rounded">
              <Volume2 size={12} className={isPlaying ? 'text-rose-500 animate-pulse' : ''} />
              <span>{language === 'en' ? 'Web Audio Engine Active' : 'Mesin Audio Aktif'}</span>
            </div>
          </div>

          {/* Chord Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {SAMPLE_CHORDS.map(chord => {
              const isSelected = selectedChord.name === chord.name;

              return (
                <button
                  key={chord.name}
                  onClick={() => handlePlayChord(chord)}
                  className={`relative p-3 sm:p-4 rounded-xl text-left border transition-all duration-200 ${
                    isSelected
                      ? 'border-rose-500 bg-rose-500/10 dark:bg-rose-500/15 ring-2 ring-rose-500/20 shadow-xs'
                      : 'border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 hover:border-stone-400 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
                      {chord.name}
                    </span>
                    <Volume2
                      size={16}
                      className={isSelected ? 'text-rose-600 dark:text-rose-400' : 'text-stone-400 dark:text-zinc-600'}
                    />
                  </div>
                  <div className="text-[11px] font-mono text-stone-500 dark:text-zinc-400 mt-1 truncate">
                    {chord.type}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Chord Analysis Box */}
          <div className="p-5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/70 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-rose-500 font-semibold">
                  {selectedChord.name} — {selectedChord.type}
                </span>
                <p className="text-xs text-stone-600 dark:text-zinc-400 mt-0.5">
                  {selectedChord.description[language] || selectedChord.description.en}
                </p>
              </div>
              <div className="font-mono text-xs bg-stone-100 dark:bg-zinc-800 px-2.5 py-1 rounded text-stone-700 dark:text-zinc-300">
                Formula: {selectedChord.formula}
              </div>
            </div>

            {/* Interactive representation: Piano Keys & Guitar frets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-stone-100 dark:border-zinc-800">
              {/* Piano Keyboard Diagram */}
              <div className="p-3 rounded-lg bg-stone-100/70 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800">
                <div className="text-[11px] font-mono text-stone-500 dark:text-zinc-400 mb-2 flex items-center justify-between">
                  <span>Piano Voicing</span>
                  <span className="text-rose-500 font-semibold">
                    {selectedChord.pianoKeys.join(' - ')}
                  </span>
                </div>
                <div className="flex h-16 w-full rounded border border-stone-300 dark:border-zinc-700 overflow-hidden bg-stone-200 dark:bg-zinc-800 relative">
                  {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((whiteKey) => {
                    const isLit = selectedChord.pianoKeys.includes(whiteKey);
                    return (
                      <div
                        key={whiteKey}
                        className={`flex-1 border-r border-stone-300 dark:border-zinc-700 flex flex-col justify-end items-center pb-1 text-[10px] font-mono font-semibold transition-colors ${
                          isLit
                            ? 'bg-rose-500 text-white'
                            : 'bg-white dark:bg-zinc-900 text-stone-700 dark:text-zinc-300'
                        }`}
                      >
                        {whiteKey}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Guitar Fret diagram */}
              <div className="p-3 rounded-lg bg-stone-100/70 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800">
                <div className="text-[11px] font-mono text-stone-500 dark:text-zinc-400 mb-2 flex items-center justify-between">
                  <span>Guitar Fretboard (6 to 1)</span>
                  <span className="text-rose-500 font-semibold font-mono">
                    [{selectedChord.guitarFrets}]
                  </span>
                </div>
                <div className="flex items-center justify-around h-16 bg-stone-900 text-stone-100 dark:bg-zinc-950 rounded border border-stone-700 dark:border-zinc-800 px-3">
                  {selectedChord.guitarFrets.split(' ').map((fret, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className="text-[9px] text-stone-400 font-mono">Str {6 - i}</span>
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold mt-1 ${
                          fret === 'x'
                            ? 'text-stone-500'
                            : fret === '0'
                            ? 'border border-emerald-400 text-emerald-400'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {fret}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {screenshots.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveScreenshot(item.image)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  activeScreenshot === item.image
                    ? 'border-rose-500 bg-rose-500/10'
                    : 'border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-stone-400'
                }`}
              >
                <div className="text-xs font-semibold text-stone-900 dark:text-zinc-100">
                  {item.title}
                </div>
                <div className="text-[11px] text-stone-500 dark:text-zinc-400 mt-1 line-clamp-1">
                  {item.caption}
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-xl overflow-hidden border border-stone-200 dark:border-zinc-800 bg-stone-900">
            <img
              src={activeScreenshot}
              alt="NoteLogic UI Interface Screenshot"
              className="w-full h-auto object-cover max-h-[440px]"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
