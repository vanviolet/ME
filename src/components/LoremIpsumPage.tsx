import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Seo } from './Seo';
import {
  Wrench,
  FileText,
  Copy,
  Check,
  RefreshCw,
  Download,
  Code,
  Sparkles,
  Sliders,
  Type,
  List,
  Layers,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Preset Dictionaries
const DICTIONARIES = {
  latin: [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'ut', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea',
    'commodo', 'consequat', 'duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit',
    'in', 'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla',
    'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident',
    'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id',
    'est', 'laborum', 'curabitur', 'pretium', 'tincidunt', 'lacus', 'nulla', 'gravida',
    'orci', 'a', 'odio', 'nullam', 'varius', 'turpis', 'et', 'commodo', 'pharetra',
    'eros', 'bibendum', 'dictum', 'sapien', 'nisl', 'aliquam', 'erat', 'volutpat'
  ],
  tech: [
    'react', 'typescript', 'vite', 'tailwind', 'javascript', 'frontend', 'backend',
    'node', 'express', 'docker', 'kubernetes', 'cloud', 'serverless', 'api', 'graphql',
    'rest', 'database', 'firestore', 'postgresql', 'redis', 'devops', 'pipeline',
    'ci-cd', 'architecture', 'microservices', 'async', 'await', 'promise', 'hook',
    'component', 'state', 'props', 'context', 'redux', 'zustand', 'router', 'deployment',
    'git', 'repository', 'commit', 'branch', 'pull-request', 'agile', 'sprint',
    'refactor', 'debugging', 'performance', 'optimization', 'latency', 'cache',
    'security', 'authentication', 'jwt', 'oauth', 'token', 'payload', 'middleware'
  ],
  indonesian: [
    'nusantara', 'gotong', 'royong', 'bhinneka', 'tunggal', 'ika', 'batik', 'rendang',
    'wayang', 'gamelan', 'angklung', 'pancasila', 'merdeka', 'garuda', 'samudra',
    'katulistiwa', 'rempah', 'borobudur', 'prambanan', 'komodo', 'sederhana', 'ramah',
    'keindahan', 'budaya', 'tradisi', 'warisan', 'alam', 'harmoni', 'sejahtera',
    'kreativitas', 'semangat', 'persatuan', 'inovasi', 'pemuda', 'bangsa', 'wawasan',
    'karya', 'perjuangan', 'aspirasi', 'kemajuan', 'nusantara', 'kearifan', 'lokal'
  ],
  startup: [
    'synergy', 'disrupt', 'paradigm', 'pivot', 'leverage', 'scale', 'growth',
    'hack', 'mvp', 'roadmap', 'freemium', 'monetization', 'traction', 'b2b',
    'saas', 'roi', 'kpi', 'churn', 'retention', 'onboarding', 'runway', 'pitch',
    'deck', 'angel', 'investor', 'venture', 'capital', 'bootstrap', 'ecosystem',
    'valuation', 'exit', 'unicorn', 'bandwidth', 'deliverable', 'actionable',
    'value-add', 'thought-leadership', 'stakeholder', 'bandwidth', 'omnichannel'
  ]
};

const START_LOREM_PREFIX = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

export const LoremIpsumPage: React.FC = () => {
  const { language } = usePortfolio();

  // Generator Options
  const [count, setCount] = useState<number>(3);
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words' | 'lists'>('paragraphs');
  const [preset, setPreset] = useState<'latin' | 'tech' | 'indonesian' | 'startup'>('latin');
  const [startWithLorem, setStartWithLorem] = useState<boolean>(true);
  const [wrapper, setWrapper] = useState<'none' | 'p' | 'div' | 'ul'>('none');
  const [uppercaseMode, setUppercaseMode] = useState<'normal' | 'uppercase' | 'lowercase'>('normal');

  // UI state
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');

  // Helper random choice generator
  const generatedText = useMemo(() => {
    const dict = DICTIONARIES[preset] || DICTIONARIES.latin;

    const getRandomWord = () => dict[Math.floor(Math.random() * dict.length)];

    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    const generateSentence = (minWords = 6, maxWords = 14) => {
      const len = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
      const wordsArr: string[] = [];
      for (let i = 0; i < len; i++) {
        wordsArr.push(getRandomWord());
      }
      let sentence = wordsArr.join(' ');
      sentence = capitalize(sentence) + '.';
      return sentence;
    };

    const generateParagraph = (minSentences = 3, maxSentences = 6) => {
      const len = Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences;
      const sentencesArr: string[] = [];
      for (let i = 0; i < len; i++) {
        sentencesArr.push(generateSentence());
      }
      return sentencesArr.join(' ');
    };

    let result = '';

    if (type === 'words') {
      const wordsArr: string[] = [];
      for (let i = 0; i < count; i++) {
        wordsArr.push(getRandomWord());
      }
      let text = wordsArr.join(' ');
      if (startWithLorem && preset === 'latin') {
        text = 'lorem ipsum dolor sit amet ' + text;
        text = text.split(' ').slice(0, count).join(' ');
      }
      result = capitalize(text);
    } else if (type === 'sentences') {
      const sentences: string[] = [];
      for (let i = 0; i < count; i++) {
        if (i === 0 && startWithLorem && preset === 'latin') {
          sentences.push(START_LOREM_PREFIX);
        } else {
          sentences.push(generateSentence());
        }
      }
      result = sentences.join(' ');
    } else if (type === 'lists') {
      const items: string[] = [];
      for (let i = 0; i < count; i++) {
        items.push(generateSentence(4, 10));
      }
      if (wrapper === 'ul') {
        result = `<ul>\n${items.map(item => `  <li>${item}</li>`).join('\n')}\n</ul>`;
      } else {
        result = items.map((item, idx) => `${idx + 1}. ${item}`).join('\n');
      }
    } else {
      // Paragraphs
      const paragraphs: string[] = [];
      for (let i = 0; i < count; i++) {
        let pText = generateParagraph();
        if (i === 0 && startWithLorem && preset === 'latin') {
          pText = START_LOREM_PREFIX + ' ' + pText;
        }
        paragraphs.push(pText);
      }

      if (wrapper === 'p') {
        result = paragraphs.map(p => `<p>${p}</p>`).join('\n\n');
      } else if (wrapper === 'div') {
        result = paragraphs.map(p => `<div>${p}</div>`).join('\n\n');
      } else {
        result = paragraphs.join('\n\n');
      }
    }

    // Apply casing
    if (uppercaseMode === 'uppercase') {
      result = result.toUpperCase();
    } else if (uppercaseMode === 'lowercase') {
      result = result.toLowerCase();
    }

    return result;
  }, [count, type, preset, startWithLorem, wrapper, uppercaseMode]);

  // Statistics
  const stats = useMemo(() => {
    const rawWords = generatedText.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean);
    const charCount = generatedText.length;
    const wordCount = rawWords.length;
    const paragraphCount = generatedText.split(/\n+/).filter(Boolean).length;
    return { charCount, wordCount, paragraphCount };
  }, [generatedText]);

  // Copy handler
  const handleCopy = (contentToCopy = generatedText) => {
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download handler
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `lorem-ipsum-${type}-${count}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      <Seo
        title={language === 'en' ? 'Lorem Ipsum Generator — Online Tools' : 'Generator Lorem Ipsum — Tool Pengembang'}
        description={
          language === 'en'
            ? 'Free online Lorem Ipsum generator tool with customizable paragraph counts, HTML tags, tech jargon, and Indonesian placeholders.'
            : 'Tool generator Lorem Ipsum gratis dengan kustomisasi jumlah paragraf, tag HTML, istilah teknis pengembang, dan placeholder Nusantara.'
        }
        url="/tools/lorem-ipsum"
      />

      {/* Breadcrumb & Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-zinc-400">
          <Link to="/" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
            {language === 'en' ? 'Home' : 'Beranda'}
          </Link>
          <span>/</span>
          <Link to="/tools" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
            {language === 'en' ? 'Tools' : 'Perkakas Tool'}
          </Link>
          <span>/</span>
          <span className="text-stone-900 dark:text-zinc-100 font-medium">Lorem Ipsum Generator</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-zinc-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 shadow-xs">
                <Type size={20} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
                Lorem Ipsum Generator
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400">
              {language === 'en'
                ? 'Generate clean placeholder text for designs, wireframes, HTML mockups, and software prototypes.'
                : 'Buat teks placeholder (dummy text) bersih untuk desain web, wireframe, antarmuka HTML, dan contoh aplikasi.'}
            </p>
          </div>

          <Link
            to="/tools"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-700 dark:text-zinc-300 hover:border-rose-500/50 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold transition-all shadow-xs self-start sm:self-auto"
          >
            <ArrowLeft size={14} />
            <span>{language === 'en' ? 'All Developer Tools' : 'Semua Perkakas Tool'}</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Controls & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Generator Controls Settings */}
        <div className="lg:col-span-5 space-y-6 bg-white dark:bg-zinc-900/90 p-5 sm:p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-zinc-100 pb-3 border-b border-stone-100 dark:border-zinc-800">
            <Sliders size={16} className="text-rose-500" />
            <span>{language === 'en' ? 'Generator Controls' : 'Pengaturan Generator'}</span>
          </div>

          {/* Preset Vocabulary Style */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300 block">
              {language === 'en' ? 'Vocabulary Preset' : 'Gaya Kosakata Teks'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'latin', label: 'Classic Latin', icon: '📜' },
                { id: 'tech', label: 'Tech & Dev Jargon', icon: '💻' },
                { id: 'indonesian', label: 'Indonesian / Nusantara', icon: '🇮🇩' },
                { id: 'startup', label: 'Startup & SaaS', icon: '🚀' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setPreset(item.id as any)}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-medium text-left flex items-center gap-2 transition-all ${
                    preset === item.id
                      ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold shadow-xs'
                      : 'border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-800/40 text-stone-700 dark:text-zinc-300 hover:border-stone-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Type Selector (Paragraphs, Sentences, Words, Lists) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300 block">
              {language === 'en' ? 'Generate Unit' : 'Satuan Generasi'}
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-stone-100 dark:bg-zinc-800/80 p-1 rounded-2xl border border-stone-200 dark:border-zinc-700">
              {[
                { id: 'paragraphs', label: language === 'en' ? 'Paragraph' : 'Paragraf' },
                { id: 'sentences', label: language === 'en' ? 'Sentence' : 'Kalimat' },
                { id: 'words', label: language === 'en' ? 'Words' : 'Kata' },
                { id: 'lists', label: language === 'en' ? 'Lists' : 'Daftar' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setType(item.id as any)}
                  className={`py-2 text-[11px] font-semibold rounded-xl transition-all text-center ${
                    type === item.id
                      ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-xs'
                      : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Count Slider & Number Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-zinc-300">
              <span>{language === 'en' ? 'Quantity Amount' : 'Jumlah Generasi'}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20">
                {count} {type}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={type === 'words' ? 300 : type === 'sentences' ? 30 : 20}
                value={count}
                onChange={e => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 accent-rose-600 cursor-pointer h-2 bg-stone-200 dark:bg-zinc-700 rounded-lg"
              />
              <input
                type="number"
                min={1}
                max={500}
                value={count}
                onChange={e => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs font-bold text-stone-900 dark:text-zinc-100 text-center focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Options Toggles & HTML Wrappers */}
          <div className="space-y-4 pt-2 border-t border-stone-100 dark:border-zinc-800">
            {/* HTML Wrapper Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Code size={13} className="text-rose-500" />
                <span>HTML Markup Wrapper</span>
              </label>
              <select
                value={wrapper}
                onChange={e => setWrapper(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs font-semibold text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="none">{language === 'en' ? 'Plain Text (No HTML tags)' : 'Teks Biasa (Tanpa tag HTML)'}</option>
                <option value="p">{language === 'en' ? 'Wrap in <p> Paragraph tags' : 'Bungkus tag <p> Paragraf'}</option>
                <option value="div">{language === 'en' ? 'Wrap in <div> Containers' : 'Bungkus tag <div> Kontainer'}</option>
                <option value="ul">{language === 'en' ? 'Wrap in <ul> <li> List items' : 'Bungkus tag <ul> <li> Item Daftar'}</option>
              </select>
            </div>

            {/* Start with Lorem Checkbox */}
            {preset === 'latin' && (
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-stone-700 dark:text-zinc-300 select-none">
                <input
                  type="checkbox"
                  checked={startWithLorem}
                  onChange={e => setStartWithLorem(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-stone-300 dark:border-zinc-700 accent-rose-600"
                />
                <span>
                  {language === 'en'
                    ? 'Start with "Lorem ipsum dolor sit amet..."'
                    : 'Mulai dengan "Lorem ipsum dolor sit amet..."'}
                </span>
              </label>
            )}

            {/* Uppercase / Lowercase mode */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300 block">
                {language === 'en' ? 'Text Case' : 'Huruf Kapital'}
              </label>
              <div className="grid grid-cols-3 gap-1 bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl border border-stone-200 dark:border-zinc-700">
                {[
                  { id: 'normal', label: 'Normal' },
                  { id: 'uppercase', label: 'UPPERCASE' },
                  { id: 'lowercase', label: 'lowercase' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setUppercaseMode(item.id as any)}
                    className={`py-1 text-[11px] font-medium rounded-lg transition-all text-center ${
                      uppercaseMode === item.id
                        ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 font-bold shadow-xs'
                        : 'text-stone-500 dark:text-zinc-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Output Preview & Action Bar */}
        <div className="lg:col-span-7 space-y-4">
          {/* Card Header & Controls */}
          <div className="bg-white dark:bg-zinc-900/90 rounded-3xl border border-stone-200 dark:border-zinc-800 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-zinc-800">
              {/* Output Tabs & Stats */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl border border-stone-200 dark:border-zinc-700">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                      activeTab === 'preview'
                        ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-xs'
                        : 'text-stone-500 dark:text-zinc-400'
                    }`}
                  >
                    <FileText size={13} />
                    <span>{language === 'en' ? 'Preview' : 'Pratinjau'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('code')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                      activeTab === 'code'
                        ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-xs'
                        : 'text-stone-500 dark:text-zinc-400'
                    }`}
                  >
                    <Code size={13} />
                    <span>{language === 'en' ? 'Raw Code' : 'Kode Mentah'}</span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-3 text-[11px] text-stone-500 dark:text-zinc-400 font-medium ml-2">
                  <span>
                    <strong className="text-stone-900 dark:text-zinc-200">{stats.wordCount}</strong> {language === 'en' ? 'words' : 'kata'}
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-stone-900 dark:text-zinc-200">{stats.charCount}</strong> {language === 'en' ? 'chars' : 'karakter'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy()}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? (language === 'en' ? 'Copied!' : 'Tersalin!') : (language === 'en' ? 'Copy Text' : 'Salin Teks')}</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="p-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  title={language === 'en' ? 'Download .txt file' : 'Unduh berkas .txt'}
                >
                  <Download size={14} />
                </button>
              </div>
            </div>

            {/* Text Output Box */}
            {activeTab === 'preview' ? (
              <div className="p-4 sm:p-6 rounded-2xl bg-stone-50 dark:bg-zinc-950/70 border border-stone-200/80 dark:border-zinc-800 text-stone-800 dark:text-zinc-200 text-sm leading-relaxed max-h-[500px] overflow-y-auto space-y-4 font-reading-sans selection:bg-rose-500/20">
                {generatedText.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <div className="relative">
                <textarea
                  readOnly
                  value={generatedText}
                  rows={14}
                  className="w-full p-4 rounded-2xl bg-zinc-950 text-zinc-100 text-xs font-mono leading-relaxed border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-rose-500 selection:bg-rose-500/40"
                />
              </div>
            )}

            {/* Footer Stats Mobile */}
            <div className="flex sm:hidden items-center justify-between text-xs text-stone-500 dark:text-zinc-400 pt-2 border-t border-stone-100 dark:border-zinc-800">
              <span>{stats.wordCount} {language === 'en' ? 'words' : 'kata'}</span>
              <span>{stats.charCount} {language === 'en' ? 'characters' : 'karakter'}</span>
              <span>{stats.paragraphCount} {language === 'en' ? 'blocks' : 'blok'}</span>
            </div>
          </div>

          {/* Tips / Info Box */}
          <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex items-start gap-3">
            <Sparkles size={18} className="text-rose-500 shrink-0 mt-0.5" />
            <div className="text-xs text-stone-600 dark:text-zinc-300 space-y-1">
              <strong className="font-semibold text-stone-900 dark:text-zinc-100 block">
                {language === 'en' ? 'Pro Tip for Developers & Designers' : 'Tips Pengembang & Desainer'}
              </strong>
              <p>
                {language === 'en'
                  ? 'Use the HTML markup option to directly inject valid paragraph tags <p> or list items <li> into your code editors, Figma components, or CMS mockups.'
                  : 'Gunakan opsi wrapper HTML untuk memasukkan tag <p> atau <li> langsung ke komponen React, HTML, atau mockup Figma Anda.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
