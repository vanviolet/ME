import React, { useState, useEffect, useRef, useMemo } from 'react';
import QRCode from 'qrcode';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import { ShadcnSelect } from '../ui/select';
import {
  QrCode,
  Copy,
  Check,
  RotateCcw,
  ArrowLeft,
  Download,
  Link as LinkIcon,
  Type,
  Wifi,
  Mail,
  User,
  Coins,
  Palette,
  Sliders,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Share2,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  FileCode,
} from 'lucide-react';
import { Link } from 'react-router-dom';

type ContentType = 'url' | 'text' | 'wifi' | 'email' | 'vcard' | 'crypto';
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

const PRESET_PALETTES = [
  { name: 'Monochrome Dark', fg: '#09090b', bg: '#ffffff' },
  { name: 'Rose & Slate', fg: '#e11d48', bg: '#ffffff' },
  { name: 'Midnight Navy', fg: '#1e3a8a', bg: '#f8fafc' },
  { name: 'Emerald Forest', fg: '#065f46', bg: '#f0fdf4' },
  { name: 'Violet Cyber', fg: '#6d28d9', bg: '#faf5ff' },
  { name: 'Amber Glow', fg: '#b45309', bg: '#fffbeb' },
  { name: 'Dark Mode Invert', fg: '#f4f4f5', bg: '#18181b' },
];

export const QrCodeGeneratorPage: React.FC = () => {
  const { language } = usePortfolio();

  // Mode & Content states
  const [contentType, setContentType] = useState<ContentType>('url');
  
  // Inputs per type
  const [urlInput, setUrlInput] = useState<string>('https://muchamadirvan.dev');
  const [textInput, setTextInput] = useState<string>('Hello from Muchamad Irvan Developer Tools!');
  
  // Wifi
  const [wifiSsid, setWifiSsid] = useState<string>('Office_HighSpeed_5G');
  const [wifiPassword, setWifiPassword] = useState<string>('SuperSecretPass123');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState<boolean>(false);

  // Email
  const [emailTo, setEmailTo] = useState<string>('vanviolet.js@gmail.com');
  const [emailSubject, setEmailSubject] = useState<string>('Project Collaboration Inquiry');
  const [emailBody, setEmailBody] = useState<string>('Hi Irvan, I would love to discuss a project with you.');

  // VCard
  const [vcardName, setVcardName] = useState<string>('Muchamad Irvan');
  const [vcardPhone, setVcardPhone] = useState<string>('+62 812-3456-7890');
  const [vcardEmail, setVcardEmail] = useState<string>('vanviolet.js@gmail.com');
  const [vcardCompany, setVcardCompany] = useState<string>('Tech Studio');
  const [vcardTitle, setVcardTitle] = useState<string>('Senior Fullstack Engineer');
  const [vcardUrl, setVcardUrl] = useState<string>('https://muchamadirvan.dev');

  // Crypto
  const [cryptoCoin, setCryptoCoin] = useState<'bitcoin' | 'ethereum' | 'solana'>('ethereum');
  const [cryptoAddress, setCryptoAddress] = useState<string>('0x71C...4399b');
  const [cryptoAmount, setCryptoAmount] = useState<string>('0.05');

  // Styling & Options
  const [fgColor, setFgColor] = useState<string>('#09090b');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [isTransparentBg, setIsTransparentBg] = useState<boolean>(false);
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>('H');
  const [margin, setMargin] = useState<number>(2);
  const [resolution, setResolution] = useState<number>(1024);

  // Center logo
  const [centerLogo, setCenterLogo] = useState<string | null>(null);
  const [logoSizePercent, setLogoSizePercent] = useState<number>(20);

  // UI state
  const [mobileTab, setMobileTab] = useState<'config' | 'preview'>('config');
  const [copied, setCopied] = useState<'image' | 'dataurl' | 'svg' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [svgString, setSvgString] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Compute final payload string based on type
  const payloadString = useMemo(() => {
    switch (contentType) {
      case 'url':
        return urlInput.trim();
      case 'text':
        return textInput.trim();
      case 'wifi': {
        const h = wifiHidden ? 'H:true;' : '';
        const enc = wifiEncryption === 'nopass' ? 'nopass' : wifiEncryption;
        const pass = wifiEncryption === 'nopass' ? '' : `P:${wifiPassword};`;
        return `WIFI:T:${enc};S:${wifiSsid};${pass}${h};`;
      }
      case 'email': {
        const query: string[] = [];
        if (emailSubject) query.push(`subject=${encodeURIComponent(emailSubject)}`);
        if (emailBody) query.push(`body=${encodeURIComponent(emailBody)}`);
        const qStr = query.length > 0 ? `?${query.join('&')}` : '';
        return `mailto:${emailTo}${qStr}`;
      }
      case 'vcard':
        return [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `FN:${vcardName}`,
          `ORG:${vcardCompany}`,
          `TITLE:${vcardTitle}`,
          `TEL:${vcardPhone}`,
          `EMAIL:${vcardEmail}`,
          `URL:${vcardUrl}`,
          'END:VCARD',
        ].join('\n');
      case 'crypto':
        return cryptoAmount
          ? `${cryptoCoin}:${cryptoAddress}?amount=${cryptoAmount}`
          : `${cryptoCoin}:${cryptoAddress}`;
      default:
        return 'https://muchamadirvan.dev';
    }
  }, [
    contentType,
    urlInput,
    textInput,
    wifiSsid,
    wifiPassword,
    wifiEncryption,
    wifiHidden,
    emailTo,
    emailSubject,
    emailBody,
    vcardName,
    vcardPhone,
    vcardEmail,
    vcardCompany,
    vcardTitle,
    vcardUrl,
    cryptoCoin,
    cryptoAddress,
    cryptoAmount,
  ]);

  // Generate QR Code on canvas
  useEffect(() => {
    if (!payloadString) {
      setErrorMsg(language === 'en' ? 'Please enter content to encode' : 'Harap masukkan konten untuk dienkode');
      return;
    }

    setErrorMsg(null);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const actualBg = isTransparentBg ? '#00000000' : bgColor;

    // First generate the base QR code on canvas
    QRCode.toCanvas(
      canvas,
      payloadString,
      {
        width: resolution,
        margin: margin,
        errorCorrectionLevel: errorLevel,
        color: {
          dark: fgColor,
          light: actualBg,
        },
      },
      err => {
        if (err) {
          setErrorMsg(err.message || 'Error generating QR Code');
          return;
        }

        // If a center logo is set, draw it on the canvas
        if (centerLogo) {
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const logoDimension = (canvas.width * (logoSizePercent / 100));
            const x = (canvas.width - logoDimension) / 2;
            const y = (canvas.height - logoDimension) / 2;
            const radius = 16 * (canvas.width / 512);

            // Draw rounded white background container for the logo for readability
            ctx.save();
            ctx.fillStyle = isTransparentBg ? '#ffffff' : bgColor;
            ctx.beginPath();
            ctx.roundRect(x - 8, y - 8, logoDimension + 16, logoDimension + 16, radius);
            ctx.fill();
            ctx.strokeStyle = fgColor + '20';
            ctx.lineWidth = 2 * (canvas.width / 512);
            ctx.stroke();

            // Clip to rounded shape and draw image
            ctx.beginPath();
            ctx.roundRect(x, y, logoDimension, logoDimension, radius);
            ctx.clip();
            ctx.drawImage(img, x, y, logoDimension, logoDimension);
            ctx.restore();
          };
          img.src = centerLogo;
        }
      }
    );

    // Generate SVG string
    QRCode.toString(
      payloadString,
      {
        type: 'svg',
        margin: margin,
        errorCorrectionLevel: errorLevel,
        color: {
          dark: fgColor,
          light: actualBg,
        },
      },
      (err, svg) => {
        if (!err && svg) {
          setSvgString(svg);
        }
      }
    );
  }, [
    payloadString,
    fgColor,
    bgColor,
    isTransparentBg,
    errorLevel,
    margin,
    resolution,
    centerLogo,
    logoSizePercent,
    language,
  ]);

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(language === 'en' ? 'Please select a valid image file.' : 'Harap pilih berkas gambar yang valid.');
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      setCenterLogo(ev.target?.result as string);
      // Automatically enforce High error correction level when adding logo
      setErrorLevel('H');
    };
    reader.readAsDataURL(file);
  };

  // Download Handlers
  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleDownloadJpeg = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  const handleDownloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async blob => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied('image');
        setTimeout(() => setCopied(null), 2000);
      });
    } catch {
      // Fallback copy data url
      navigator.clipboard.writeText(canvas.toDataURL('image/png'));
      setCopied('dataurl');
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleCopySvg = () => {
    if (!svgString) return;
    navigator.clipboard.writeText(svgString);
    setCopied('svg');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <Seo
        title={language === 'en' ? 'High-Resolution QR Code Studio — Muchamad Irvan' : 'Generator Kode QR Resolusi Tinggi — Muchamad Irvan'}
        description={
          language === 'en'
            ? 'Free online high-resolution QR code generator for developers and designers. Create custom QR codes for URLs, Wi-Fi, vCard, emails, with center logos, custom colors, and SVG/PNG vector exports.'
            : 'Generator kode QR resolusi tinggi gratis untuk pengembang dan desainer. Buat QR code kustom untuk URL, Wi-Fi, kontak vCard, logo di tengah, warna kustom, serta ekspor PNG & SVG.'
        }
        url="/tools/qr-generator"
      />

      {/* Header Navigation */}
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              <QrCode size={13} />
              <span>Developer & Design Utility</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
            {language === 'en' ? 'High-Resolution QR Code Studio' : 'Studio Pembuat Kode QR Resolusi Tinggi'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400">
            {language === 'en'
              ? 'Generate customizable, print-ready, high-resolution QR codes in PNG & SVG with live canvas rendering and center logos.'
              : 'Buat kode QR kustom resolusi tinggi siap cetak format PNG & SVG dengan pratinjau kanvas langsung dan sematan logo.'}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              setUrlInput('https://muchamadirvan.dev');
              setFgColor('#09090b');
              setBgColor('#ffffff');
              setIsTransparentBg(false);
              setCenterLogo(null);
              setMargin(2);
              setResolution(1024);
              setErrorLevel('H');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 transition-colors"
          >
            <RotateCcw size={14} />
            <span>{language === 'en' ? 'Reset All' : 'Atur Ulang'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex sm:hidden rounded-xl bg-stone-100 dark:bg-zinc-800 p-1">
        <button
          onClick={() => setMobileTab('config')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            mobileTab === 'config'
              ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-stone-600 dark:text-zinc-400'
          }`}
        >
          <Sliders size={14} />
          <span>{language === 'en' ? 'Content & Styles' : 'Konten & Gaya'}</span>
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            mobileTab === 'preview'
              ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-stone-600 dark:text-zinc-400'
          }`}
        >
          <QrCode size={14} />
          <span>{language === 'en' ? 'Preview & Download' : 'Pratinjau & Unduh'}</span>
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Content Type & Customization Controls (7 cols) */}
        <div className={`lg:col-span-7 space-y-5 ${mobileTab === 'preview' ? 'hidden sm:block' : 'block'}`}>
          {/* Content Type Selector */}
          <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sparkles size={14} className="text-rose-500" />
                <span>{language === 'en' ? 'Select QR Code Type' : 'Pilih Jenis Kode QR'}</span>
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { id: 'url', label: 'URL', icon: LinkIcon },
                { id: 'text', label: 'Text', icon: Type },
                { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
                { id: 'email', label: 'Email', icon: Mail },
                { id: 'vcard', label: 'vCard', icon: User },
                { id: 'crypto', label: 'Crypto', icon: Coins },
              ].map(item => {
                const Icon = item.icon;
                const isActive = contentType === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setContentType(item.id as ContentType)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-semibold transition-all ${
                      isActive
                        ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-xs'
                        : 'border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-800/40 text-stone-600 dark:text-zinc-400 hover:border-stone-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Inputs according to contentType */}
            <div className="pt-2 border-t border-stone-100 dark:border-zinc-800/80">
              {/* URL */}
              {contentType === 'url' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300 flex items-center gap-1">
                    <LinkIcon size={13} /> {language === 'en' ? 'Target Website URL' : 'Tautan Web Target'}
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/80 text-xs sm:text-sm text-stone-900 dark:text-zinc-100 font-mono focus:outline-rose-500"
                  />
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400">
                    {language === 'en'
                      ? 'Scanners will immediately open this link in the mobile browser.'
                      : 'Pemindai akan langsung membuka tautan ini di browser ponsel.'}
                  </p>
                </div>
              )}

              {/* Text */}
              {contentType === 'text' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300 flex items-center gap-1">
                    <Type size={13} /> {language === 'en' ? 'Plain Text Content' : 'Teks Bebas'}
                  </label>
                  <textarea
                    rows={4}
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    placeholder="Enter any text, message, or notes..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/80 text-xs sm:text-sm text-stone-900 dark:text-zinc-100 resize-none focus:outline-rose-500 leading-relaxed"
                  />
                </div>
              )}

              {/* Wi-Fi */}
              {contentType === 'wifi' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                        {language === 'en' ? 'Network Name (SSID)' : 'Nama Jaringan (SSID)'}
                      </label>
                      <input
                        type="text"
                        value={wifiSsid}
                        onChange={e => setWifiSsid(e.target.value)}
                        placeholder="MyHomeWifi"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs text-stone-900 dark:text-zinc-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                        {language === 'en' ? 'Password' : 'Kata Sandi'}
                      </label>
                      <input
                        type="text"
                        value={wifiPassword}
                        onChange={e => setWifiPassword(e.target.value)}
                        placeholder="Password123"
                        disabled={wifiEncryption === 'nopass'}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs text-stone-900 dark:text-zinc-100 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-stone-600 dark:text-zinc-400 font-medium">Encryption:</span>
                      {(['WPA', 'WEP', 'nopass'] as const).map(enc => (
                        <button
                          key={enc}
                          onClick={() => setWifiEncryption(enc)}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                            wifiEncryption === enc
                              ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : 'border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-400'
                          }`}
                        >
                          {enc === 'nopass' ? 'None' : enc}
                        </button>
                      ))}
                    </div>

                    <label className="flex items-center gap-1.5 text-stone-600 dark:text-zinc-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wifiHidden}
                        onChange={e => setWifiHidden(e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-rose-600"
                      />
                      <span>Hidden Network</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Email */}
              {contentType === 'email' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">Recipient Email</label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={e => setEmailTo(e.target.value)}
                      placeholder="hello@example.com"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs text-stone-900 dark:text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">Subject</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={e => setEmailSubject(e.target.value)}
                      placeholder="Meeting follow-up"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs text-stone-900 dark:text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">Body</label>
                    <textarea
                      rows={2}
                      value={emailBody}
                      onChange={e => setEmailBody(e.target.value)}
                      placeholder="Write your email body..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs text-stone-900 dark:text-zinc-100 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* vCard */}
              {contentType === 'vcard' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">Full Name</label>
                    <input
                      type="text"
                      value={vcardName}
                      onChange={e => setVcardName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs text-stone-900 dark:text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">Phone</label>
                    <input
                      type="text"
                      value={vcardPhone}
                      onChange={e => setVcardPhone(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs text-stone-900 dark:text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">Email</label>
                    <input
                      type="email"
                      value={vcardEmail}
                      onChange={e => setVcardEmail(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs text-stone-900 dark:text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">Company / Studio</label>
                    <input
                      type="text"
                      value={vcardCompany}
                      onChange={e => setVcardCompany(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs text-stone-900 dark:text-zinc-100"
                    />
                  </div>
                </div>
              )}

              {/* Crypto */}
              {contentType === 'crypto' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">Coin / Network</label>
                      <ShadcnSelect
                        value={cryptoCoin}
                        onChange={val => setCryptoCoin(val as any)}
                        options={[
                          { value: 'ethereum', label: 'Ethereum (ETH)' },
                          { value: 'bitcoin', label: 'Bitcoin (BTC)' },
                          { value: 'solana', label: 'Solana (SOL)' },
                        ]}
                        size="sm"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">Wallet Address</label>
                      <input
                        type="text"
                        value={cryptoAddress}
                        onChange={e => setCryptoAddress(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 font-mono text-xs text-stone-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Color & Visual Styling */}
          <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-5 space-y-4 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Palette size={14} className="text-rose-500" />
              <span>{language === 'en' ? 'Colors & Theme Palettes' : 'Warna & Palet Tema'}</span>
            </span>

            {/* Quick Palettes */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-stone-500 dark:text-zinc-400">{language === 'en' ? 'One-Click Palettes:' : 'Palet Cepat:'}</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_PALETTES.map(p => (
                  <button
                    key={p.name}
                    onClick={() => {
                      setFgColor(p.fg);
                      setBgColor(p.bg);
                      setIsTransparentBg(false);
                    }}
                    className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-zinc-800 text-xs hover:border-stone-400 dark:hover:border-zinc-600 transition-colors"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: p.fg }} />
                    <span className="text-[11px] text-stone-700 dark:text-zinc-300">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl border border-stone-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-stone-800 dark:text-zinc-200 block">
                    {language === 'en' ? 'Foreground (Code)' : 'Warna Kode QR'}
                  </span>
                  <span className="text-[11px] font-mono text-stone-500">{fgColor}</span>
                </div>
                <input
                  type="color"
                  value={fgColor}
                  onChange={e => setFgColor(e.target.value)}
                  className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                />
              </div>

              <div className="p-3 rounded-xl border border-stone-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/40 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-800 dark:text-zinc-200">
                      {language === 'en' ? 'Background' : 'Latar Belakang'}
                    </span>
                    <label className="text-[10px] text-rose-500 cursor-pointer flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={isTransparentBg}
                        onChange={e => setIsTransparentBg(e.target.checked)}
                        className="w-3 h-3 rounded accent-rose-600"
                      />
                      <span>Transparent</span>
                    </label>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500">
                    {isTransparentBg ? 'Transparent' : bgColor}
                  </span>
                </div>
                {!isTransparentBg && (
                  <input
                    type="color"
                    value={bgColor}
                    onChange={e => setBgColor(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Center Logo & Advanced Options */}
          <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-5 space-y-4 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Sliders size={14} className="text-rose-500" />
              <span>{language === 'en' ? 'Center Logo & Precision Tuning' : 'Logo Tengah & Pengaturan Lanjut'}</span>
            </span>

            {/* Logo Upload Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-700 dark:text-zinc-300 flex items-center gap-1">
                  <ImageIcon size={13} />
                  <span>{language === 'en' ? 'Center Brand Logo (Optional)' : 'Logo Merek di Tengah (Opsional)'}</span>
                </span>
                {centerLogo && (
                  <button
                    onClick={() => setCenterLogo(null)}
                    className="text-[11px] text-rose-600 hover:underline"
                  >
                    {language === 'en' ? 'Remove Logo' : 'Hapus Logo'}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-800 text-xs font-medium text-stone-700 dark:text-zinc-200 flex items-center gap-2 transition-colors"
                >
                  <Upload size={14} />
                  <span>{language === 'en' ? 'Upload Custom Logo' : 'Unggah Logo Kustom'}</span>
                </button>

                {centerLogo && (
                  <div className="flex items-center gap-2">
                    <img src={centerLogo} alt="Logo preview" className="w-8 h-8 rounded-lg object-contain border p-0.5" />
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Active
                    </span>
                  </div>
                )}
              </div>

              {centerLogo && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs text-stone-500">
                    <span>Logo Size: {logoSizePercent}%</span>
                    <span>Safe limit: 20-25%</span>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={26}
                    value={logoSizePercent}
                    onChange={e => setLogoSizePercent(Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Resolution & Margin */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                  {language === 'en' ? 'Resolution (Print Quality)' : 'Resolusi Ekspor'}
                </label>
                <ShadcnSelect
                  value={resolution}
                  onChange={val => setResolution(Number(val))}
                  options={[
                    { value: 512, label: '512 x 512 px (Standard)' },
                    { value: 1024, label: '1024 x 1024 px (HD Print)' },
                    { value: 2048, label: '2048 x 2048 px (Ultra UHD)' },
                  ]}
                  size="sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                  {language === 'en' ? 'Quiet Zone (Margin)' : 'Batas Tepi (Margin)'}
                </label>
                <ShadcnSelect
                  value={margin}
                  onChange={val => setMargin(Number(val))}
                  options={[
                    { value: 0, label: '0 (No margin / Flush)' },
                    { value: 1, label: '1 module' },
                    { value: 2, label: '2 modules (Recommended)' },
                    { value: 4, label: '4 modules (Standard)' },
                  ]}
                  size="sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                  {language === 'en' ? 'Error Correction' : 'Koreksi Error (ECC)'}
                </label>
                <ShadcnSelect
                  value={errorLevel}
                  onChange={val => setErrorLevel(val as ErrorCorrectionLevel)}
                  options={[
                    { value: 'L', label: 'L — 7% recovery' },
                    { value: 'M', label: 'M — 15% recovery' },
                    { value: 'Q', label: 'Q — 25% recovery' },
                    { value: 'H', label: 'H — 30% recovery (Best)' },
                  ]}
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live High-Resolution Preview & Export Actions (5 cols) */}
        <div className={`lg:col-span-5 space-y-4 ${mobileTab === 'config' ? 'hidden sm:block' : 'block'}`}>
          <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-xs sticky top-24">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Maximize2 size={14} className="text-rose-500" />
                <span>{language === 'en' ? 'Live Canvas Preview' : 'Pratinjau Kanvas Langsung'}</span>
              </span>

              <span className="text-[11px] font-mono text-stone-400">
                {resolution}px • ECC: {errorLevel}
              </span>
            </div>

            {/* QR Canvas Render Container */}
            <div className="p-6 rounded-2xl bg-stone-100/70 dark:bg-zinc-950 border border-stone-200/80 dark:border-zinc-800 flex flex-col items-center justify-center min-h-[280px]">
              {errorMsg ? (
                <div className="text-center space-y-2 text-rose-500 p-4">
                  <AlertCircle size={28} className="mx-auto" />
                  <p className="text-xs">{errorMsg}</p>
                </div>
              ) : (
                <div className="relative group max-w-full flex items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full h-auto max-h-[260px] sm:max-h-[300px] rounded-xl shadow-md transition-transform"
                    style={{ aspectRatio: '1/1' }}
                  />
                </div>
              )}

              <div className="mt-4 text-center">
                <p className="text-[11px] text-stone-500 dark:text-zinc-400 font-mono truncate max-w-[280px] sm:max-w-xs mx-auto">
                  {payloadString}
                </p>
              </div>
            </div>

            {/* Export & Download Buttons */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDownloadPng}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Download size={14} />
                  <span>Download PNG</span>
                </button>

                <button
                  onClick={handleDownloadSvg}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-900 dark:bg-zinc-100 hover:bg-stone-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold shadow-xs transition-colors"
                >
                  <FileCode size={14} />
                  <span>Download SVG</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={handleCopyImage}
                  className="p-2 rounded-xl border border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-300 flex items-center justify-center gap-1 transition-colors"
                  title="Copy PNG image to clipboard"
                >
                  {copied === 'image' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>{copied === 'image' ? 'Copied' : 'Copy Image'}</span>
                </button>

                <button
                  onClick={handleCopySvg}
                  className="p-2 rounded-xl border border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-300 flex items-center justify-center gap-1 transition-colors"
                  title="Copy SVG markup code"
                >
                  {copied === 'svg' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  <span>{copied === 'svg' ? 'Copied' : 'Copy SVG'}</span>
                </button>

                <button
                  onClick={handleDownloadJpeg}
                  className="p-2 rounded-xl border border-stone-200 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800 text-stone-700 dark:text-zinc-300 flex items-center justify-center gap-1 transition-colors"
                >
                  <Download size={13} />
                  <span>JPEG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
