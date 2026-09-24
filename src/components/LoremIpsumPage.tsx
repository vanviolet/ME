import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Seo } from './Seo';
import { ShadcnSelect } from './ui/select';
import {
  FileText,
  Copy,
  Check,
  Download,
  Code,
  Sliders,
  Type,
  ArrowLeft,
  Terminal,
  BookOpen,
  Compass,
  Sparkles,
  Clock,
  Layout,
  FileSpreadsheet,
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
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words' | 'lists' | 'json'>('paragraphs');
  const [preset, setPreset] = useState<'latin' | 'tech' | 'indonesian' | 'startup'>('latin');
  const [startWithLorem, setStartWithLorem] = useState<boolean>(true);
  const [wrapper, setWrapper] = useState<'none' | 'p' | 'div' | 'ul'>('none');
  const [uppercaseMode, setUppercaseMode] = useState<'normal' | 'uppercase' | 'lowercase'>('normal');

  // UI state
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'article' | 'code'>('preview');

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

    if (type === 'json') {
      const mockItems = [];
      for (let i = 1; i <= count; i++) {
        mockItems.push({
          id: i,
          title: capitalize(`${getRandomWord()} ${getRandomWord()} ${getRandomWord()}`),
          body: generateParagraph(2, 4),
          category: getRandomWord(),
          publishedAt: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
        });
      }
      return JSON.stringify(mockItems, null, 2);
    }

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

  // Statistics & Reading metrics
  const stats = useMemo(() => {
    const rawWords = generatedText.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean);
    const charCount = generatedText.length;
    const wordCount = rawWords.length;
    const paragraphCount = generatedText.split(/\n+/).filter(Boolean).length;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
    return { charCount, wordCount, paragraphCount, readTimeMinutes };
  }, [generatedText]);

  // Copy handler
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download handler
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `lorem-ipsum-${type}-${count}.${type === 'json' ? 'json' : 'txt'}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <Seo
        title={
          language === 'en'
            ? 'Interactive Lorem Ipsum Studio & Mock Data Generator — Tools'
            : 'Studio Lorem Ipsum & Generator Data Mock Interaktif — Tools'
        }
        description={
          language === 'en'
            ? 'Generate Latin, tech, and Indonesian placeholder dummy text, test simulated blog article layouts, and export JSON mock data payloads.'
            : 'Hasilkan teks placeholder bahasa Latin, jargon teknologi, dan Nusantara, uji tata letak artikel blog simulasi, serta ekspor format JSON mock.'
        }
        url="/tools/lorem-ipsum"
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-zinc-500 font-mono">
        <Link to="/" className="hover:text-stone-900 dark:hover:text-zinc-200 transition-colors">
          {language === 'en' ? 'Home' : 'Beranda'}
        </Link>
        <span>/</span>
        <Link to="/tools" className="hover:text-stone-900 dark:hover:text-zinc-200 transition-colors">
          {language === 'en' ? 'Tools' : 'Perkakas'}
        </Link>
        <span>/</span>
        <span className="text-stone-900 dark:text-zinc-100 font-semibold">Lorem Ipsum Studio</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20">
            <Type size={14} />
            <span>{language === 'en' ? 'Typography & Content Prototyping' : 'Tipografi & Prototipe Konten'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            Lorem Ipsum & Mock Content Studio
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
            {language === 'en'
              ? 'Generate dummy copy in Classical Latin, Tech Jargon, Nusantara, or Startup Buzzwords. Preview inside an interactive blog simulator or generate structured JSON payloads for frontend APIs.'
              : 'Hasilkan teks dummy bahasa Latin klasik, jargon teknologi, Nusantara, atau istilah startup. Simulasikan langsung pada tata letak artikel atau ekspor format JSON.'}
          </p>
        </div>

        <Link
          to="/tools"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-700 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold transition-colors shadow-xs self-start md:self-auto"
        >
          <ArrowLeft size={13} />
          <span>{language === 'en' ? 'All Tools' : 'Semua Perkakas'}</span>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Configuration Options (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 pb-2 border-b border-stone-100 dark:border-zinc-800 font-mono">
            <Sliders size={14} className="text-rose-500" />
            <span>{language === 'en' ? 'Generator Controls' : 'Pengaturan Konten'}</span>
          </div>

          {/* Preset Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300 block">
              {language === 'en' ? 'Vocabulary Preset' : 'Pilihan Kosakata'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'latin', label: 'Classic Latin', icon: BookOpen },
                { id: 'tech', label: 'Tech & Dev Jargon', icon: Terminal },
                { id: 'indonesian', label: 'Nusantara / Bahasa', icon: Compass },
                { id: 'startup', label: 'Startup & SaaS', icon: Sparkles },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setPreset(item.id as any)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium text-left transition-all ${
                      preset === item.id
                        ? 'border-rose-600 bg-rose-600 text-white font-semibold shadow-xs'
                        : 'border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:border-rose-400'
                    }`}
                  >
                    <Icon size={14} className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generation Unit */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300 block">
              {language === 'en' ? 'Content Structure' : 'Struktur Konten'}
            </label>
            <div className="flex overflow-x-auto scrollbar-none gap-1 bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-medium">
              {[
                { id: 'paragraphs', label: 'Paragraphs' },
                { id: 'sentences', label: 'Sentences' },
                { id: 'words', label: 'Words' },
                { id: 'lists', label: 'Lists' },
                { id: 'json', label: 'JSON API' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setType(item.id as any)}
                  className={`flex-1 sm:flex-none whitespace-nowrap shrink-0 px-2.5 py-1.5 text-[11px] font-medium rounded-lg transition-all text-center ${
                    type === item.id
                      ? 'bg-white dark:bg-zinc-950 text-rose-600 dark:text-rose-400 font-bold shadow-xs'
                      : 'text-stone-500 hover:text-stone-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-zinc-300">
              <span>{language === 'en' ? 'Quantity' : 'Jumlah'}</span>
              <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">
                {count} {type}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={type === 'words' ? 200 : type === 'sentences' ? 30 : 15}
                value={count}
                onChange={e => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 accent-rose-600 cursor-pointer h-2 bg-stone-200 dark:bg-zinc-700 rounded-lg"
              />
              <span className="w-10 text-center font-mono text-xs font-bold text-stone-900 dark:text-zinc-100">
                {count}
              </span>
            </div>
          </div>

          {/* HTML Wrapper */}
          {type !== 'json' && (
            <div className="space-y-4 pt-2 border-t border-stone-100 dark:border-zinc-800">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300 block">
                  HTML Tag Wrapper
                </label>
                <ShadcnSelect
                  value={wrapper}
                  onChange={val => setWrapper(val as any)}
                  options={[
                    { value: 'none', label: language === 'en' ? 'Plain Text (No HTML)' : 'Teks Biasa (Tanpa HTML)' },
                    { value: 'p', label: language === 'en' ? 'Paragraphs <p>' : 'Paragraf <p>' },
                    { value: 'div', label: language === 'en' ? 'Containers <div>' : 'Kontainer <div>' },
                    { value: 'ul', label: language === 'en' ? 'List Items <ul> <li>' : 'Daftar <ul> <li>' },
                  ]}
                  size="sm"
                />
              </div>

              {/* Start with Lorem */}
              {preset === 'latin' && (
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700 dark:text-zinc-300 select-none">
                  <input
                    type="checkbox"
                    checked={startWithLorem}
                    onChange={e => setStartWithLorem(e.target.checked)}
                    className="rounded border-stone-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span>{language === 'en' ? 'Start with "Lorem ipsum..."' : 'Awali "Lorem ipsum..."'}</span>
                </label>
              )}
            </div>
          )}
        </div>

        {/* Right: Output, Metrics & Article Layout Simulator (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-stone-200 dark:border-zinc-800 pb-3">
            {/* View Tabs */}
            <div className="w-full sm:w-auto overflow-x-auto scrollbar-none flex items-center gap-1 p-1 rounded-xl bg-stone-100 dark:bg-zinc-800 text-xs font-medium">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex-1 sm:flex-none justify-center whitespace-nowrap shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 font-bold shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400'
                }`}
              >
                <FileText size={13} />
                <span>{language === 'en' ? 'Formatted' : 'Format'}</span>
              </button>

              <button
                onClick={() => setActiveTab('article')}
                className={`flex-1 sm:flex-none justify-center whitespace-nowrap shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === 'article'
                    ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 font-bold shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400'
                }`}
              >
                <Layout size={13} />
                <span>{language === 'en' ? 'Blog Layout' : 'Simulasi Blog'}</span>
              </button>

              <button
                onClick={() => setActiveTab('code')}
                className={`flex-1 sm:flex-none justify-center whitespace-nowrap shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === 'code'
                    ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 font-bold shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400'
                }`}
              >
                <Code size={13} />
                <span>{language === 'en' ? 'Raw Code' : 'Kode'}</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopy}
                className="flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="p-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-white transition-colors shrink-0"
                title="Download"
              >
                <Download size={13} />
              </button>
            </div>
          </div>

          {/* Reading & Content Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800">
              <span className="text-[10px] text-stone-400 font-mono uppercase tracking-wider block">Words</span>
              <span className="font-mono font-bold text-stone-900 dark:text-zinc-100">{stats.wordCount} words</span>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800">
              <span className="text-[10px] text-stone-400 font-mono uppercase tracking-wider block">Characters</span>
              <span className="font-mono font-bold text-stone-900 dark:text-zinc-100">{stats.charCount} chars</span>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800">
              <span className="text-[10px] text-stone-400 font-mono uppercase tracking-wider block">Reading Time</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <Clock size={12} />
                <span>~{stats.readTimeMinutes} min</span>
              </span>
            </div>
          </div>

          {/* Tab 1: Formatted Paragraphs / JSON */}
          {activeTab === 'preview' && (
            <div className="p-4 sm:p-5 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 text-stone-800 dark:text-zinc-200 text-xs sm:text-sm leading-relaxed max-h-[420px] overflow-y-auto space-y-3 font-sans">
              {type === 'json' ? (
                <pre className="font-mono text-xs whitespace-pre">{generatedText}</pre>
              ) : (
                generatedText.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Simulated Interactive Blog Article Layout */}
          {activeTab === 'article' && (
            <div className="p-6 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 max-h-[420px] overflow-y-auto space-y-4 font-sans text-stone-800 dark:text-zinc-200">
              <div className="space-y-1 border-b border-stone-200 dark:border-zinc-800 pb-3">
                <span className="text-[11px] font-mono font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  Technology & Architecture
                </span>
                <h3 className="text-xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
                  Building Resilient Distributed Microservices in 2026
                </h3>
                <div className="text-[11px] text-stone-400 flex items-center gap-2">
                  <span>By Muchamad Irvan</span>
                  <span>•</span>
                  <span>{stats.readTimeMinutes} min read</span>
                </div>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                {generatedText.split('\n\n').map((paragraph, index) => (
                  <React.Fragment key={index}>
                    <p>{paragraph}</p>
                    {index === 0 && (
                      <blockquote className="p-3 my-2 border-l-4 border-rose-500 bg-white dark:bg-zinc-900 rounded-r-lg italic text-stone-700 dark:text-zinc-300">
                        "Great architecture is not about building complex systems; it is about keeping simplicity alive amidst exponential scale."
                      </blockquote>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Raw Code */}
          {activeTab === 'code' && (
            <textarea
              readOnly
              value={generatedText}
              rows={14}
              className="w-full p-4 rounded-xl bg-stone-50 dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 text-xs font-mono leading-relaxed border border-stone-200 dark:border-zinc-800 focus:outline-hidden resize-none select-all"
            />
          )}
        </div>
      </div>
    </div>
  );
};
