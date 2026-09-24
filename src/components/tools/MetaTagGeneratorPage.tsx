import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import {
  Share2,
  Copy,
  Check,
  RotateCcw,
  ArrowLeft,
  Download,
  Eye,
  Sparkles,
  Globe,
  Smartphone,
  Monitor,
  Code2,
  Image as ImageIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShadcnSelect } from '../ui/select';

const PRESETS = [
  {
    name: 'Tech Portfolio & Dev Hub',
    nameId: 'Portofolio & Hub Developer',
    title: 'Muchamad Irvan — Senior Fullstack Engineer & Creative Tech Hub',
    description:
      'Explore high-performance web applications, developer utility tools, system architecture case studies, and engineering insights.',
    url: 'https://muchamadirvan.dev',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&auto=format&fit=crop&q=80',
    type: 'website',
  },
  {
    name: 'SaaS Product / Startup',
    nameId: 'Produk Startup SaaS',
    title: 'CloudFlow — Automated Continuous Delivery & Infrastructure Observability',
    description:
      'Deploy modern web services across multiple cloud providers with automated rollbacks, latency tracing, and live logs.',
    url: 'https://cloudflow.io',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&auto=format&fit=crop&q=80',
    type: 'website',
  },
  {
    name: 'Technical Blog Post',
    nameId: 'Artikel Blog Teknis',
    title: 'Optimizing Node.js Event Loop for High-Throughput Microservices',
    description:
      'A deep dive into asynchronous libuv thread pooling, backpressure handling, and memory profiling in production containers.',
    url: 'https://muchamadirvan.dev/blog/nodejs-eventloop',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=630&auto=format&fit=crop&q=80',
    type: 'article',
  },
];

export const MetaTagGeneratorPage: React.FC = () => {
  const { language } = usePortfolio();

  const [title, setTitle] = useState<string>(PRESETS[0].title);
  const [description, setDescription] = useState<string>(PRESETS[0].description);
  const [pageUrl, setPageUrl] = useState<string>(PRESETS[0].url);
  const [imageUrl, setImageUrl] = useState<string>(PRESETS[0].image);
  const [siteName, setSiteName] = useState<string>('Muchamad Irvan');
  const [author, setAuthor] = useState<string>('Muchamad Irvan');
  const [ogType, setOgType] = useState<string>('website');
  const [twitterCard, setTwitterCard] = useState<'summary_large_image' | 'summary'>('summary_large_image');
  const [keywords, setKeywords] = useState<string>('developer, software engineer, fullstack, portfolio, tools');
  const [robots, setRobots] = useState<string>('index, follow');

  const [previewTab, setPreviewTab] = useState<'google' | 'twitter' | 'facebook' | 'discord'>('google');
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [googleDevice, setGoogleDevice] = useState<'mobile' | 'desktop'>('desktop');
  const [copied, setCopied] = useState<boolean>(false);

  // Generate HTML tags
  const generatedTags = useMemo(() => {
    const cleanTitle = title.trim();
    const cleanDesc = description.trim();
    const cleanUrl = pageUrl.trim();
    const cleanImg = imageUrl.trim();

    return `<!-- Primary Meta Tags -->
<title>${cleanTitle}</title>
<meta name="title" content="${cleanTitle}">
<meta name="description" content="${cleanDesc}">
<meta name="keywords" content="${keywords.trim()}">
<meta name="author" content="${author.trim()}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${cleanUrl}">

<!-- Open Graph / Facebook / LinkedIn -->
<meta property="og:type" content="${ogType}">
<meta property="og:url" content="${cleanUrl}">
<meta property="og:title" content="${cleanTitle}">
<meta property="og:description" content="${cleanDesc}">
<meta property="og:image" content="${cleanImg}">
<meta property="og:site_name" content="${siteName.trim()}">

<!-- Twitter / X -->
<meta property="twitter:card" content="${twitterCard}">
<meta property="twitter:url" content="${cleanUrl}">
<meta property="twitter:title" content="${cleanTitle}">
<meta property="twitter:description" content="${cleanDesc}">
<meta property="twitter:image" content="${cleanImg}">`;
  }, [title, description, pageUrl, imageUrl, siteName, author, ogType, twitterCard, keywords, robots]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedTags);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedTags], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meta-tags.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const domain = useMemo(() => {
    try {
      const parsed = new URL(pageUrl.startsWith('http') ? pageUrl : `https://${pageUrl}`);
      return parsed.hostname;
    } catch {
      return 'example.com';
    }
  }, [pageUrl]);

  return (
    <div className="min-h-screen pt-24 pb-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <Seo
        title={language === 'en' ? 'Meta Tag & Open Graph Social Card Previewer — Muchamad Irvan' : 'Generator Meta Tag & Pratinjau Open Graph — Muchamad Irvan'}
        description={
          language === 'en'
            ? 'Generate SEO meta tags, OpenGraph social share cards, and Twitter Cards with real-time visual simulations for Google, Facebook, Twitter, and Discord.'
            : 'Buat tag meta SEO, kartu share media sosial OpenGraph, dan Twitter Card dengan pratinjau visual langsung untuk Google, Facebook, Twitter, dan Discord.'
        }
        url="/tools/meta-tag-generator"
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              to="/tools"
              className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
              title="Back to Tools"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
              <Share2 size={13} />
              <span>SEO & Social Sharing</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            {language === 'en' ? 'Meta Tag & Open Graph Previewer' : 'Generator Meta Tag & Pratinjau Media Sosial'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400">
            {language === 'en'
              ? 'Craft complete SEO and social sharing meta tags with live visual card previews for Google, X, and Facebook.'
              : 'Susun tag meta SEO & Open Graph dengan simulasi tampilan kartu sosial asli di Google, X/Twitter, dan Facebook.'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-xs"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? (language === 'en' ? 'Copied Tags' : 'Tersalin') : (language === 'en' ? 'Copy HTML' : 'Salin Tag')}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 transition-colors"
            title="Download meta-tags.html"
          >
            <Download size={14} />
            <span className="hidden sm:inline">{language === 'en' ? 'Download' : 'Unduh'}</span>
          </button>
        </div>
      </div>

      {/* Preset Selectors */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-stone-500 dark:text-zinc-400 font-medium whitespace-nowrap flex items-center gap-1">
          <Sparkles size={13} /> {language === 'en' ? 'Presets:' : 'Contoh:'}
        </span>
        {PRESETS.map(preset => (
          <button
            key={preset.name}
            onClick={() => {
              setTitle(preset.title);
              setDescription(preset.description);
              setPageUrl(preset.url);
              setImageUrl(preset.image);
              setOgType(preset.type);
            }}
            className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-400 text-stone-700 dark:text-zinc-300 whitespace-nowrap transition-colors"
          >
            {language === 'en' ? preset.name : preset.nameId}
          </button>
        ))}
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex sm:hidden rounded-xl bg-stone-100 dark:bg-zinc-800 p-1">
        <button
          onClick={() => setMobileView('editor')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
            mobileView === 'editor'
              ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-stone-600 dark:text-zinc-400'
          }`}
        >
          {language === 'en' ? 'Tag Form Editor' : 'Form Pengaturan'}
        </button>
        <button
          onClick={() => setMobileView('preview')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
            mobileView === 'preview'
              ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-stone-600 dark:text-zinc-400'
          }`}
        >
          {language === 'en' ? 'Live Social Previews' : 'Pratinjau Sosial'}
        </button>
      </div>

      {/* Main Grid: Form Inputs (Left) and Social Previews + Code (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs (Left 5 cols) */}
        <div
          className={`lg:col-span-5 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-xs ${
            mobileView === 'preview' ? 'hidden sm:block' : 'block'
          }`}
        >
          <h2 className="text-sm font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Globe size={15} className="text-indigo-500" />
            <span>{language === 'en' ? 'Metadata Configuration' : 'Konfigurasi Metadata'}</span>
          </h2>

          {/* Title */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-stone-700 dark:text-zinc-300">
                {language === 'en' ? 'Page Title' : 'Judul Halaman (Title)'}
              </label>
              <span
                className={`text-[11px] font-mono ${
                  title.length > 60 ? 'text-amber-500 font-bold' : 'text-stone-400'
                }`}
              >
                {title.length}/60 chars
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/80 text-xs text-stone-900 dark:text-zinc-100"
              placeholder="e.g. My Website Title"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-stone-700 dark:text-zinc-300">
                {language === 'en' ? 'Meta Description' : 'Deskripsi (Description)'}
              </label>
              <span
                className={`text-[11px] font-mono ${
                  description.length > 160 ? 'text-amber-500 font-bold' : 'text-stone-400'
                }`}
              >
                {description.length}/160 chars
              </span>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/80 text-xs text-stone-900 dark:text-zinc-100 resize-none leading-relaxed"
              placeholder="Brief description for search engines and social cards..."
            />
          </div>

          {/* URL & Image */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                {language === 'en' ? 'Canonical URL' : 'URL Halaman'}
              </label>
              <input
                type="text"
                value={pageUrl}
                onChange={e => setPageUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/80 text-xs text-stone-900 dark:text-zinc-100 font-mono"
                placeholder="https://example.com/page"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                {language === 'en' ? 'Social Share Image (OG Image)' : 'URL Gambar Pratinjau (1200x630)'}
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/80 text-xs text-stone-900 dark:text-zinc-100 font-mono"
                placeholder="https://example.com/og-image.jpg"
              />
            </div>
          </div>

          {/* Brand & Type */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-zinc-300">Site Name</label>
              <input
                type="text"
                value={siteName}
                onChange={e => setSiteName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-zinc-100"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-zinc-300">OG Type</label>
              <ShadcnSelect
                value={ogType}
                onChange={(val) => setOgType(String(val))}
                size="sm"
                options={[
                  { value: 'website', label: 'website' },
                  { value: 'article', label: 'article' },
                  { value: 'profile', label: 'profile' },
                  { value: 'product', label: 'product' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Live Social Previews & HTML Markup (Right 7 cols) */}
        <div
          className={`lg:col-span-7 space-y-4 ${
            mobileView === 'editor' ? 'hidden sm:block' : 'block'
          }`}
        >
          {/* Social Card Preview Box */}
          <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
            {/* Social Tabs */}
            <div className="px-4 py-3 bg-stone-50 dark:bg-zinc-800/60 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-1">
                {(['google', 'twitter', 'facebook', 'discord'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setPreviewTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      previewTab === tab
                        ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                        : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    {tab === 'google' ? 'Google Search' : tab === 'twitter' ? 'X / Twitter' : tab === 'facebook' ? 'Facebook / LinkedIn' : 'Discord'}
                  </button>
                ))}
              </div>

              {previewTab === 'google' && (
                <div className="hidden sm:flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setGoogleDevice('desktop')}
                    className={`p-1 rounded ${googleDevice === 'desktop' ? 'text-rose-500' : 'text-stone-400'}`}
                    title="Desktop SERP"
                  >
                    <Monitor size={15} />
                  </button>
                  <button
                    onClick={() => setGoogleDevice('mobile')}
                    className={`p-1 rounded ${googleDevice === 'mobile' ? 'text-rose-500' : 'text-stone-400'}`}
                    title="Mobile SERP"
                  >
                    <Smartphone size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* Preview Canvas */}
            <div className="p-6 bg-stone-100/50 dark:bg-zinc-950 flex items-center justify-center min-h-[260px]">
              {/* Google SERP */}
              {previewTab === 'google' && (
                <div className={`p-4 rounded-xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 space-y-1.5 ${googleDevice === 'mobile' ? 'max-w-xs' : 'w-full max-w-lg'}`}>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-6 h-6 rounded-full bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-stone-600 dark:text-zinc-300">
                      G
                    </div>
                    <div className="flex flex-col text-[11px] leading-tight overflow-hidden">
                      <span className="font-medium text-stone-800 dark:text-zinc-200 truncate">{siteName || domain}</span>
                      <span className="text-stone-400 truncate">{pageUrl}</span>
                    </div>
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-blue-700 dark:text-blue-400 hover:underline cursor-pointer leading-snug line-clamp-1">
                    {title || 'Your Page Title'}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {description || 'Your meta description text will appear here in Google search engine result snippets.'}
                  </p>
                </div>
              )}

              {/* Twitter Card */}
              {previewTab === 'twitter' && (
                <div className="w-full max-w-md rounded-2xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-black overflow-hidden shadow-xs">
                  <div className="h-44 w-full bg-stone-200 dark:bg-zinc-800 relative overflow-hidden flex items-center justify-center">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Card preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-stone-400" size={36} />
                    )}
                  </div>
                  <div className="p-3.5 space-y-1">
                    <div className="text-[11px] text-stone-400 uppercase tracking-wider">{domain}</div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-zinc-100 line-clamp-1">{title}</h4>
                    <p className="text-xs text-stone-500 dark:text-zinc-400 line-clamp-2">{description}</p>
                  </div>
                </div>
              )}

              {/* Facebook Card */}
              {previewTab === 'facebook' && (
                <div className="w-full max-w-md rounded-lg border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900 overflow-hidden shadow-xs">
                  <div className="h-44 w-full bg-stone-200 dark:bg-zinc-800 relative overflow-hidden flex items-center justify-center">
                    {imageUrl ? (
                      <img src={imageUrl} alt="OG Card preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-stone-400" size={36} />
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <div className="text-[10px] text-stone-400 uppercase tracking-wider">{domain}</div>
                    <h4 className="text-sm font-semibold text-stone-900 dark:text-zinc-100 line-clamp-1">{title}</h4>
                    <p className="text-xs text-stone-500 dark:text-zinc-400 line-clamp-1">{description}</p>
                  </div>
                </div>
              )}

              {/* Discord Embed */}
              {previewTab === 'discord' && (
                <div className="w-full max-w-md rounded-md bg-[#2f3136] text-[#dcddde] p-3 border-l-4 border-indigo-500 space-y-2 text-xs">
                  <div className="text-[11px] text-[#b9bbbe] font-medium">{siteName || domain}</div>
                  <div className="font-bold text-sm text-white hover:underline cursor-pointer">{title}</div>
                  <div className="text-xs text-[#b9bbbe] leading-relaxed">{description}</div>
                  {imageUrl && (
                    <div className="rounded overflow-hidden max-h-36">
                      <img src={imageUrl} alt="Embed" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Generated HTML Code Block */}
          <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
            <div className="px-4 py-2.5 bg-stone-50 dark:bg-zinc-800/60 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Code2 size={13} className="text-indigo-500" />
                <span>Generated HTML Meta Tags</span>
              </span>
              <button
                onClick={handleCopy}
                className="text-xs text-rose-600 dark:text-rose-400 font-medium hover:underline flex items-center gap-1"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-4 bg-stone-900 dark:bg-black/90 text-zinc-100 font-mono text-xs overflow-auto max-h-[220px] leading-relaxed">
              <pre className="text-indigo-300 whitespace-pre">{generatedTags}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
