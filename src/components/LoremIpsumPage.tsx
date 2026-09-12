import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Seo } from './Seo';
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
    element.download = `lorem-ipsum-${type}-${count}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      <Seo
        title={language === 'en' ? 'Lorem Ipsum Generator — Tools' : 'Generator Lorem Ipsum — Tool Pengembang'}
        description={
          language === 'en'
            ? 'Clean and minimalist online Lorem Ipsum generator tool.'
            : 'Tool generator Lorem Ipsum minimalis dan bersih.'
        }
        url="/tools/lorem-ipsum"
      />

      {/* Breadcrumb & Sleek Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-zinc-500 font-mono">
          <Link to="/" className="hover:text-stone-900 dark:hover:text-zinc-200 transition-colors">
            {language === 'en' ? 'Home' : 'Beranda'}
          </Link>
          <span>/</span>
          <Link to="/tools" className="hover:text-stone-900 dark:hover:text-zinc-200 transition-colors">
            {language === 'en' ? 'Tools' : 'Perkakas'}
          </Link>
          <span>/</span>
          <span className="text-stone-900 dark:text-zinc-100 font-medium">Lorem Ipsum</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-zinc-800 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
              Lorem Ipsum Generator
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400">
              {language === 'en'
                ? 'Minimalist dummy text generator for design mockups, prototypes, and developers.'
                : 'Generator teks dummy minimalis untuk maket desain, prototipe, dan pengembang.'}
            </p>
          </div>

          <Link
            to="/tools"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-stone-700 dark:text-zinc-300 hover:text-stone-950 dark:hover:text-white text-xs font-medium transition-colors shadow-xs self-start sm:self-auto"
          >
            <ArrowLeft size={13} />
            <span>{language === 'en' ? 'All Tools' : 'Semua Perkakas'}</span>
          </Link>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Minimal Controls Panel */}
        <div className="lg:col-span-5 space-y-6 bg-white dark:bg-zinc-900/90 p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500 pb-3 border-b border-stone-100 dark:border-zinc-800">
            <Sliders size={14} />
            <span>{language === 'en' ? 'Configuration' : 'Konfigurasi'}</span>
          </div>

          {/* Preset Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300 block">
              {language === 'en' ? 'Vocabulary Preset' : 'Preset Kosakata'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'latin', label: 'Classic Latin' },
                { id: 'tech', label: 'Tech & Dev Jargon' },
                { id: 'indonesian', label: 'Nusantara / Bahasa' },
                { id: 'startup', label: 'Startup & SaaS' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setPreset(item.id as any)}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium text-left transition-all ${
                    preset === item.id
                      ? 'border-stone-900 dark:border-zinc-100 bg-stone-900 text-stone-50 dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-xs'
                      : 'border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-800/40 text-stone-700 dark:text-zinc-300 hover:border-stone-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generation Unit */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300 block">
              {language === 'en' ? 'Generate Unit' : 'Satuan'}
            </label>
            <div className="grid grid-cols-4 gap-1 bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl border border-stone-200 dark:border-zinc-700">
              {[
                { id: 'paragraphs', label: language === 'en' ? 'Paragraph' : 'Paragraf' },
                { id: 'sentences', label: language === 'en' ? 'Sentence' : 'Kalimat' },
                { id: 'words', label: language === 'en' ? 'Words' : 'Kata' },
                { id: 'lists', label: language === 'en' ? 'Lists' : 'Daftar' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setType(item.id as any)}
                  className={`py-1.5 text-[11px] font-medium rounded-lg transition-all text-center ${
                    type === item.id
                      ? 'bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 font-bold shadow-xs'
                      : 'text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
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
              <span className="font-mono text-stone-900 dark:text-zinc-100 font-bold">
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
                className="flex-1 accent-stone-900 dark:accent-zinc-100 cursor-pointer h-1.5 bg-stone-200 dark:bg-zinc-700 rounded-lg"
              />
              <input
                type="number"
                min={1}
                max={500}
                value={count}
                onChange={e => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2 py-1 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs font-mono text-stone-900 dark:text-zinc-100 text-center focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
            </div>
          </div>

          {/* HTML Wrapper */}
          <div className="space-y-4 pt-2 border-t border-stone-100 dark:border-zinc-800">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300 block">
                HTML Wrapper
              </label>
              <select
                value={wrapper}
                onChange={e => setWrapper(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs font-medium text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-stone-400"
              >
                <option value="none">{language === 'en' ? 'Plain Text (No HTML)' : 'Teks Biasa (Tanpa HTML)'}</option>
                <option value="p">{language === 'en' ? 'Paragraphs <p>' : 'Paragraf <p>'}</option>
                <option value="div">{language === 'en' ? 'Containers <div>' : 'Kontainer <div>'}</option>
                <option value="ul">{language === 'en' ? 'List Items <ul> <li>' : 'Item Daftar <ul> <li>'}</option>
              </select>
            </div>

            {/* Checkbox */}
            {preset === 'latin' && (
              <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700 dark:text-zinc-300 select-none">
                <input
                  type="checkbox"
                  checked={startWithLorem}
                  onChange={e => setStartWithLorem(e.target.checked)}
                  className="w-4 h-4 rounded text-stone-900 focus:ring-stone-400 border-stone-300 dark:border-zinc-700 accent-stone-900 dark:accent-zinc-100"
                />
                <span>{language === 'en' ? 'Start with "Lorem ipsum..."' : 'Mulai dengan "Lorem ipsum..."'}</span>
              </label>
            )}

            {/* Casing */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300 block">
                {language === 'en' ? 'Capitalization' : 'Huruf Kapital'}
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
                        ? 'bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 font-bold shadow-xs'
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

        {/* Right Output Area */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-zinc-900/90 rounded-2xl border border-stone-200 dark:border-zinc-800 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl border border-stone-200 dark:border-zinc-700">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                      activeTab === 'preview'
                        ? 'bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 font-semibold shadow-xs'
                        : 'text-stone-500 dark:text-zinc-400'
                    }`}
                  >
                    <FileText size={13} />
                    <span>{language === 'en' ? 'Preview' : 'Pratinjau'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('code')}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                      activeTab === 'code'
                        ? 'bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 font-semibold shadow-xs'
                        : 'text-stone-500 dark:text-zinc-400'
                    }`}
                  >
                    <Code size={13} />
                    <span>{language === 'en' ? 'Raw Code' : 'Kode Mentah'}</span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500 dark:text-zinc-400 font-mono ml-2">
                  <span><strong>{stats.wordCount}</strong> words</span>
                  <span>•</span>
                  <span><strong>{stats.charCount}</strong> chars</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 hover:opacity-90 transition-opacity shadow-xs"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? (language === 'en' ? 'Copied' : 'Tersalin') : (language === 'en' ? 'Copy' : 'Salin')}</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="p-1.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-white transition-colors"
                  title={language === 'en' ? 'Download TXT' : 'Unduh TXT'}
                >
                  <Download size={13} />
                </button>
              </div>
            </div>

            {/* Output Display */}
            {activeTab === 'preview' ? (
              <div className="p-4 sm:p-5 rounded-xl bg-stone-50 dark:bg-zinc-950/70 border border-stone-200/80 dark:border-zinc-800 text-stone-800 dark:text-zinc-200 text-sm leading-relaxed max-h-[500px] overflow-y-auto space-y-4 font-reading-sans">
                {generatedText.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <textarea
                readOnly
                value={generatedText}
                rows={14}
                className="w-full p-4 rounded-xl bg-zinc-950 text-zinc-100 text-xs font-mono leading-relaxed border border-zinc-800 focus:outline-none"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
