import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Seo } from '../Seo';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Sparkles,
  PenTool,
  Palette,
  Box,
  Brush,
  Tv,
  Grid,
  Layers,
  Compass,
  Film,
  Download,
  Copy,
  Check,
  RefreshCw,
  X,
  Sliders,
  Image as ImageIcon,
  History,
  Trash2,
  Maximize2,
  Dice5,
  Info,
  CheckCircle2,
  Wand2,
} from 'lucide-react';

export interface StylePreset {
  id: string;
  name: string;
  badge: string;
  descriptionEn: string;
  descriptionId: string;
  icon: any;
  category: 'vector' | '3d' | 'artistic' | 'retro';
  modifiers: string;
  negativePrompt: string;
  color: string;
  samplePrompts: { en: string; id: string }[];
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'ink-drawing-v4',
    name: 'Ink Drawing v4',
    badge: 'Sumi-e & Fine Linework',
    descriptionEn: 'Intricate black ink cross-hatching, Japanese sumi-e wash accents, paper texture, and high-contrast linework.',
    descriptionId: 'Arsiran pena tinta hitam presisi, sapuan kuas sumi-e Jepang, tekstur kertas berpori, dan garis ilustrasi kontras tinggi.',
    icon: PenTool,
    category: 'artistic',
    color: 'stone',
    modifiers: 'masterpiece ink drawing style, fine delicate line art, black ink hatching, sumi-e brush wash accents, high-contrast paper texture, crisp vector linework, clean graphic novel illustration',
    negativePrompt: 'blurry, soft airbrush, photorealistic, 3d render, messy blotches, color bleed, low quality',
    samplePrompts: [
      {
        en: 'A solitary samurai in traditional armor sitting beneath a blooming sakura tree in the autumn wind',
        id: 'Seorang samurai berzirah tradisional duduk tenang di bawah pohon sakura mekar tertiup angin musim gugur',
      },
      {
        en: 'An intricate steampunk mechanical owl with visible brass clockwork gears perching on an antique street lamp',
        id: 'Burung hantu mekanis steampunk dengan roda gigi kuningan rumit bertengger di lampu jalan antik',
      },
      {
        en: 'A quiet rainy alleyway in Kyoto at night with traditional wooden facades and glowing paper lanterns',
        id: 'Gang sunyi di Kyoto saat hujan malam hari dengan deretan kedai kayu dan lentera kertas hangat',
      },
    ],
  },
  {
    id: 'flat-vector',
    name: 'Flat Vector',
    badge: 'Modern Editorial & Tech',
    descriptionEn: 'Clean minimalist vector art, geometric silhouettes, vibrant corporate Memphis color schemes, and sharp curves.',
    descriptionId: 'Ilustrasi vektor minimalis modern, bentuk geometris rapi, palet warna vibran elegan, dan kurva tajam tanpa pecah.',
    icon: Palette,
    category: 'vector',
    color: 'indigo',
    modifiers: 'modern flat vector illustration, clean geometric shapes, minimalist graphic design, vibrant harmonious editorial palette, smooth bezier curves, SVG aesthetics, professional UI brand illustration',
    negativePrompt: 'photorealistic, noisy texture, 3d render, muddy shading, gradients clutter, low resolution',
    samplePrompts: [
      {
        en: 'A creative software engineer coding on a laptop with holographic code widgets floating in a lush plant-filled workspace',
        id: 'Seorang software engineer sedang coding di laptop dengan widget kode melayang di ruang kerja penuh tanaman',
      },
      {
        en: 'An astronaut happily floating in deep space drinking coffee while watching planet earth rotate',
        id: 'Astronot melayang santai di luar angkasa menyeruput kopi sambil memandangi bumi berputar',
      },
      {
        en: 'A modern autonomous delivery drone flying gracefully above a vibrant green eco smart city at sunrise',
        id: 'Drone kurir futuristik terbang lincah di atas kota ramah lingkungan berteknologi tinggi saat matahari terbit',
      },
    ],
  },
  {
    id: '3d-isometric',
    name: '3D Isometric',
    badge: 'Voxel & Clay Diorama',
    descriptionEn: 'Orthographic camera diorama, miniature clay and plasticine aesthetic, soft studio clay shading, and Blender 3D look.',
    descriptionId: 'Diorama sudut isometrik miniatur, estetika tanah liat halus (clay), pencahayaan studio lembut, dan rendering 3D Blender.',
    icon: Box,
    category: '3d',
    color: 'blue',
    modifiers: '3D isometric diorama, orthographic camera projection, cute miniature aesthetic, soft studio clay lighting, subtle ambient occlusion, Blender 3d render, highly detailed voxel diorama scene, 4k render',
    negativePrompt: 'perspective camera distortion, flat 2d, sketch, watermark, distorted shapes, messy background',
    samplePrompts: [
      {
        en: 'A miniature cyberpunk street food ramen stall with glowing neon signboards, stool chairs, and steam rising',
        id: 'Kedai ramen jalanan miniatur bernuansa cyberpunk dengan plang neon menyala, kursi kayu kecil, dan kepulan asap',
      },
      {
        en: 'A cozy secluded island cottage with a tiny stone lighthouse, wooden bridge, and pine trees surrounded by clear water',
        id: 'Pondok pulau terpencil yang nyaman dengan mercusuar batu kecil, jembatan kayu, dan pohon pinus di atas air jernih',
      },
      {
        en: 'A modern cloud server room with illuminated glowing server racks, glass panels, and cute miniature network cables',
        id: 'Ruang server cloud modern dengan rak server menyala biru, dinding kaca, dan kabel jaringan miniatur rapi',
      },
    ],
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neo-Tokyo',
    badge: 'Neon & Retro-Future',
    descriptionEn: 'Futuristic nightscapes with glowing neon signs, rain-slicked reflective pavement, and high-tech cinematic contrast.',
    descriptionId: 'Kota futuristik malam hari berhias lampu neon berpendar, pantulan aspal basah hujan, dan kontras sinematik sci-fi.',
    icon: Sparkles,
    category: '3d',
    color: 'fuchsia',
    modifiers: 'cyberpunk neo-tokyo aesthetic, glowing vibrant neon lights, rain-slicked reflective asphalt, cinematic volumetric fog, chromatic aberration, synthwave dark atmosphere, ultra-detailed futuristic concept art',
    negativePrompt: 'sunny daytime, rustic vintage, muted washed out colors, low contrast, simplistic',
    samplePrompts: [
      {
        en: 'A futuristic cybernetic cyborg in a high-tech glowing trench coat standing under torrential neon rain in Neo-Shinjuku',
        id: 'Karakter cyborg berjaket teknologi tinggi berdiri di tengah hujan neon deras di jalanan kota masa depan Neo-Shinjuku',
      },
      {
        en: 'A sleek flying hovercar zooming between towering holographic glass skyscrapers at midnight',
        id: 'Mobil terbang futuristik melesat di antara gedung pencakar langit kaca dengan billboard hologram raksasa di malam hari',
      },
    ],
  },
  {
    id: 'watercolor',
    name: 'Watercolor Dream',
    badge: 'Painterly & Organic Washes',
    descriptionEn: 'Gentle translucent watercolor bleeding, cold-press paper grain, delicate pastel pigments, and artistic paint splashes.',
    descriptionId: 'Sapuan cat air lembut tembus pandang, tekstur kertas lukis berserat, pigmen pastel menawan, dan cipratan cat artistik.',
    icon: Brush,
    category: 'artistic',
    color: 'teal',
    modifiers: 'delicate watercolor painting, wet-on-wet watercolor washes, organic paint drips and splatters, cold press textured paper grain, soft pastel color palette, whimsical painterly strokes, poetic art',
    negativePrompt: 'harsh black outlines, sharp digital vector, 3d plastic render, glossy, dark muddy colors',
    samplePrompts: [
      {
        en: 'A tranquil mountain lake reflecting misty pine forests and pastel orange sunrise clouds',
        id: 'Danau pegunungan yang tenang memantulkan kabut hutan pinus dan awan fajar berwarna jingga lembut',
      },
      {
        en: 'A glass vase filled with blooming lavender and wild poppies with subtle watercolor bleed onto parchment',
        id: 'Vas kaca berisi bunga lavender ungu mekar dan mawar liar dengan sapuan cat air lembut memudar di atas kanvas',
      },
    ],
  },
  {
    id: 'retro-anime',
    name: 'Retro 90s Anime',
    badge: 'Classic Cel-Shaded Animation',
    descriptionEn: 'Golden era 1990s Japanese anime cel-shading, vintage film grain, hand-drawn aesthetic, and nostalgic color grading.',
    descriptionId: 'Gaya animasi anime klasik Jepang era 90-an, pewarnaan cel-shading tradisional, butiran film vintage, dan nuansa nostalgia hangat.',
    icon: Tv,
    category: 'retro',
    color: 'rose',
    modifiers: 'classic 1990s anime aesthetic, hand-drawn cel-shaded animation still, retro film grain filter, nostalgic color grading, screentone shading, vintage OVA style, evocative atmospheric lighting',
    negativePrompt: 'modern 3d CGI, photorealistic, plastic uncanny valley, western comic style, oversaturated modern digital',
    samplePrompts: [
      {
        en: 'A teenage girl sitting by a train window looking out at the glittering Tokyo sunset bay, warm evening breeze',
        id: 'Gadis muda duduk di dekat jendela kereta memandangi teluk kota saat senja berkilauan dengan angin sore hangat',
      },
      {
        en: 'A giant mecha robot inside a dimly lit maintenance hangar surrounded by scaffolding and glowing control screens',
        id: 'Robot mecha raksasa di dalam hanggar pemeliharaan berlampu temaram dikelilingi tangga kerja dan layar kontrol',
      },
    ],
  },
  {
    id: 'pixel-art',
    name: 'Pixel Art 16-Bit',
    badge: 'Retro Arcade Nostalgia',
    descriptionEn: 'Authentic 16-bit arcade sprite art, crisp pixel grid, dithered shading, and nostalgic SNES/Genesis color palette.',
    descriptionId: 'Seni piksel 16-bit bergaya game retro klasik, kisi piksel tajam, teknik arsiran dithering, dan palet warna nostalgia.',
    icon: Grid,
    category: 'retro',
    color: 'emerald',
    modifiers: '16-bit pixel art, crisp pixel grid, authentic retro arcade game aesthetic, carefully crafted dithering, vibrant limited color palette, clean sprite work, nostalgic 90s video game graphics',
    negativePrompt: 'high resolution vector, blur, anti-aliased soft gradients, photorealistic, 3d render',
    samplePrompts: [
      {
        en: 'A bustling medieval fantasy tavern with a crackling fireplace, wooden mugs, and adventurers laughing',
        id: 'Kedai petualang abad pertengahan yang ramai dengan perapian menyala hangat, cangkir kayu, dan tawa para kesatria',
      },
      {
        en: 'A futuristic neon cyber arcade shop on a starship deck looking out into deep purple space nebulae',
        id: 'Toko game arcade bernuansa neon futuristik di dek kapal luar angkasa dengan pemandangan nebula ungu mempesona',
      },
    ],
  },
  {
    id: 'low-poly',
    name: 'Low Poly 3D Origami',
    badge: 'Faceted Geometric Meshes',
    descriptionEn: 'Faceted polygon geometry, paper-fold origami aesthetic, crisp planar lighting, and clean contemporary forms.',
    descriptionId: 'Geometri poligon berbidang faset, estetika lipatan kertas origami, pencahayaan bayangan terdefinisi, dan bentuk modern minimalis.',
    icon: Layers,
    category: '3d',
    color: 'amber',
    modifiers: 'low poly 3D art, faceted polygon geometric shapes, clean paper-fold origami aesthetic, soft diffuse ambient lighting, pastel color palette, minimal modern 3D render, sharp polygon edges',
    negativePrompt: 'smooth curved organic mesh, hyperrealistic textures, noise, blurry details, messy topology',
    samplePrompts: [
      {
        en: 'A majestic geometric low-poly stag standing proudly in a misty autumn forest with golden leaves',
        id: 'Rusa jantan megah bergaya low-poly geometris berdiri anggun di hutan musim gugur berkabut dengan dedaunan emas',
      },
      {
        en: 'A low-poly supersonic passenger jet gliding smoothly through geometric faceted clouds at sunset',
        id: 'Pesawat jet supersonik geometris terbang membelah awan-awan origami berbidang faset saat senja',
      },
    ],
  },
  {
    id: 'vintage-botanical',
    name: 'Vintage Botanical',
    badge: 'Antique Engraving & Etching',
    descriptionEn: 'Meticulous 19th-century scientific lithograph, copperplate hatching, aged parchment sepia tones, and antique plates.',
    descriptionId: 'Litografi sains abad ke-19 yang teliti, arsiran tembaga (copperplate), warna kertas perkamen antik sepia, dan estetika ensiklopedia klasik.',
    icon: Compass,
    category: 'artistic',
    color: 'yellow',
    modifiers: 'vintage 19th-century scientific illustration, intricate copperplate engraving, fine cross-hatching linework, aged parchment sepia paper, antique encyclopedia lithograph, botanical plate, museum artifact',
    negativePrompt: 'modern digital art, neon colors, 3d render, plastic look, blurry, oversaturated colors',
    samplePrompts: [
      {
        en: 'Detailed biological botanical study of an exotic orchid flower and wild hummingbird drinking nectar',
        id: 'Studi botani biologis terperinci mengenai bunga anggrek eksotis dan burung kolibri yang sedang meminum nektar',
      },
      {
        en: 'An antique celestial astronomical map showing constellations, planetary orbits, and decorative compass roses',
        id: 'Peta astronomi langit antik yang menggambarkan rasi bintang, orbit planet, dan hiasan kompas kuno',
      },
    ],
  },
  {
    id: 'cinematic-concept',
    name: 'Cinematic Concept Art',
    badge: 'Epic Scale & Matte Painting',
    descriptionEn: 'Sweeping widescreen landscapes, volumetric fog and god rays, breathtaking scale, and digital matte painting mastery.',
    descriptionId: 'Lanskap epik berskala luas, kabut volumetrik dan sinar dewa (god rays), kedalaman visual mendalam, dan seni digital matte painting.',
    icon: Film,
    category: '3d',
    color: 'purple',
    modifiers: 'epic cinematic concept art, atmospheric volumetric lighting, dramatic cinematic composition, digital matte painting, hyper-detailed environment, ArtStation trending quality, 8k resolution wallpaper',
    negativePrompt: 'flat cartoon, low resolution, amateur sketch, oversaturated colors, blurry foreground',
    samplePrompts: [
      {
        en: 'An colossal ancient stone colossus overgrown with moss and waterfalls towering over a misty valley',
        id: 'Patung raksasa batu kuno berlumut dengan air terjun mengalir di tubuhnya menjulang tinggi di atas lembah berkabut',
      },
      {
        en: 'A mysterious futuristic research base perched on the rim of a glowing crystalline canyon on an alien world',
        id: 'Pangkalan riset futuristik misterius bertengger di tebing ngarai kristal menyala di planet antariksa asing',
      },
    ],
  },
];

export const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 Square', width: 1024, height: 1024, desc: 'Instagram, Avatars, Icons' },
  { id: '16:9', label: '16:9 Landscape', width: 1280, height: 720, desc: 'Web banners, Desktop' },
  { id: '9:16', label: '9:16 Portrait', width: 720, height: 1280, desc: 'Stories, Mobile wallpapers' },
  { id: '4:3', label: '4:3 Classic', width: 1024, height: 768, desc: 'Editorial & Presentations' },
  { id: '3:4', label: '3:4 Vertical', width: 768, height: 1024, desc: 'Cards & Posters' },
];

export interface GeneratedImageItem {
  id: string;
  imageUrl: string;
  prompt: string;
  enhancedPrompt?: string;
  stylePresetId: string;
  stylePresetName: string;
  width: number;
  height: number;
  seed: number;
  model: string;
  timestamp: string;
}

export const AiIllustrationPage: React.FC = () => {
  const { language } = usePortfolio();

  // State
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ink-drawing-v4');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'vector' | '3d' | 'artistic' | 'retro'>('all');
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [modelType, setModelType] = useState<string>('flux');
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 1000000));
  const [isSeedLocked, setIsSeedLocked] = useState<boolean>(false);

  // Enhancement & Generation state
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [enhancedResult, setEnhancedResult] = useState<{
    enhancedPrompt: string;
    styleModifiers: string;
    negativePrompt: string;
    explanation: string;
  } | null>(null);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<GeneratedImageItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // History gallery
  const [history, setHistory] = useState<GeneratedImageItem[]>(() => {
    try {
      const saved = localStorage.getItem('van_ai_illustrations_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [backgroundTone, setBackgroundTone] = useState<'checker' | 'dark' | 'light'>('checker');

  const selectedPreset = STYLE_PRESETS.find(p => p.id === selectedPresetId) || STYLE_PRESETS[0];

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('van_ai_illustrations_history', JSON.stringify(history.slice(0, 16)));
    } catch (e) {
      console.warn('Failed to save illustration history', e);
    }
  }, [history]);

  // Filter presets
  const filteredPresets = STYLE_PRESETS.filter(p => {
    if (categoryFilter === 'all') return true;
    return p.category === categoryFilter;
  });

  // Copy helper
  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // AI Prompt Enhancement with Gemini
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      setErrorMessage(
        language === 'en'
          ? 'Please enter a prompt idea first before enhancing.'
          : 'Ketikkan ide prompt terlebih dahulu sebelum ditingkatkan dengan AI.'
      );
      return;
    }

    setErrorMessage(null);
    setIsEnhancing(true);

    try {
      const res = await fetch('/api/ai/enhance-illustration-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          stylePreset: selectedPreset.id,
          presetName: selectedPreset.name,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to enhance prompt');
      }

      const info = data.data;
      setEnhancedResult({
        enhancedPrompt: info.enhancedPrompt,
        styleModifiers: info.styleModifiers,
        negativePrompt: info.negativePrompt,
        explanation: language === 'en' ? info.explanationEn : info.explanationId,
      });

      // Optional: automatically apply enhanced prompt
      setPrompt(info.enhancedPrompt);
    } catch (err: any) {
      console.error('Enhancement error:', err);
      setErrorMessage(err.message || 'Error enhancing prompt with AI.');
    } finally {
      setIsEnhancing(false);
    }
  };

  // Trigger Generation
  const handleGenerate = async () => {
    const finalPromptText = prompt.trim();
    if (!finalPromptText) {
      setErrorMessage(
        language === 'en'
          ? 'Please enter a description or pick a sample prompt.'
          : 'Silakan masukkan deskripsi ide ilustrasi atau pilih contoh prompt.'
      );
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);

    const targetRatio = ASPECT_RATIOS.find(r => r.id === aspectRatio) || ASPECT_RATIOS[0];
    const currentSeed = isSeedLocked ? seed : Math.floor(Math.random() * 1000000);
    if (!isSeedLocked) {
      setSeed(currentSeed);
    }

    try {
      const res = await fetch('/api/ai/generate-illustration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPromptText,
          stylePreset: selectedPreset.id,
          styleModifiers: selectedPreset.modifiers,
          negativePrompt: selectedPreset.negativePrompt,
          width: targetRatio.width,
          height: targetRatio.height,
          seed: currentSeed,
          model: modelType,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate illustration');
      }

      const item: GeneratedImageItem = {
        id: `img-${Date.now()}`,
        imageUrl: data.data.imageUrl,
        prompt: finalPromptText,
        enhancedPrompt: enhancedResult?.enhancedPrompt,
        stylePresetId: selectedPreset.id,
        stylePresetName: selectedPreset.name,
        width: targetRatio.width,
        height: targetRatio.height,
        seed: currentSeed,
        model: modelType,
        timestamp: new Date().toLocaleTimeString(),
      };

      // Preload image to make sure it loads smoothly before stopping loading state
      const img = new Image();
      img.src = item.imageUrl;
      img.onload = () => {
        setCurrentResult(item);
        setHistory(prev => [item, ...prev.filter(h => h.id !== item.id)]);
        setIsGenerating(false);
      };
      img.onerror = () => {
        // Still set result so user can view or retry
        setCurrentResult(item);
        setHistory(prev => [item, ...prev.filter(h => h.id !== item.id)]);
        setIsGenerating(false);
      };
    } catch (err: any) {
      console.error('Generate illustration error:', err);
      setErrorMessage(err.message || 'Gagal memproses gambar ilustrasi.');
      setIsGenerating(false);
    }
  };

  // Download image helper
  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      // Use proxy to avoid canvas taint / CORS download issues
      const proxyUrl = `/api/ai/image-proxy?url=${encodeURIComponent(imageUrl)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${filename}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback: direct window download
      const a = document.createElement('a');
      a.href = imageUrl;
      a.target = '_blank';
      a.download = `${filename}.png`;
      a.click();
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <Seo
        title={
          language === 'en'
            ? 'AI Illustration Studio — Muchamad Irvan'
            : 'Studio Ilustrasi AI — Muchamad Irvan'
        }
        description={
          language === 'en'
            ? 'Free AI Illustration & Image Generator with stylized presets like Ink Drawing v4, Flat Vector, 3D Isometric, and Gemini prompt enhancement.'
            : 'Generator ilustrasi AI gratis dengan preset gaya siap pakai seperti Ink Drawing v4, Flat Vector, 3D Isometric, dan optimasi prompt AI.'
        }
        url="/tools/ai-illustration"
      />

      {/* Top Breadcrumb & Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-zinc-400">
          <Link
            to="/tools"
            className="hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <Wrench size={13} />
            <span>{language === 'en' ? 'Tools Hub' : 'Pusat Perkakas'}</span>
          </Link>
          <span>/</span>
          <span className="text-stone-900 dark:text-zinc-200 font-semibold flex items-center gap-1">
            <Sparkles size={13} className="text-rose-500" />
            <span>{language === 'en' ? 'AI Illustration Studio' : 'Studio Ilustrasi AI'}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={12} />
            <span>{language === 'en' ? 'Free Limit Model' : 'Model Limit Gratis'}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <Sparkles size={12} />
            <span>FLUX.1 + Gemini 3.8</span>
          </span>
        </div>
      </div>

      {/* Main Hero Header */}
      <div className="space-y-3 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20 shadow-xs">
          <Wand2 size={14} />
          <span>{language === 'en' ? 'Creative Diffusion Engine' : 'Mesin Difusi Ilustrasi Kreatif'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-zinc-100">
          {language === 'en' ? 'AI Illustration & Art Studio' : 'Studio Ilustrasi & Seni AI'}
        </h1>
        <p className="text-sm text-stone-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          {language === 'en'
            ? 'Generate high-resolution illustrations in stylized aesthetics: select your preferred artistic preset, enhance your idea with Gemini prompt engineering, and export crisp PNGs.'
            : 'Buat ilustrasi beresolusi tinggi dengan berbagai gaya artistik: pilih preset gaya favorit Anda (Ink Drawing v4, Flat Vector, 3D Isometric), percantik prompt dengan AI, dan unduh hasil PNG siap pakai.'}
        </p>
      </div>

      {/* STEP 1: PRESET SELECTION SECTION (PILIH PRESET GAYA DULU) */}
      <div className="space-y-4 bg-white dark:bg-zinc-900/80 p-5 sm:p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold font-mono">
              1
            </span>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
                <span>{language === 'en' ? 'Choose Style Preset' : 'Pilih Preset Gaya Ilustrasi'}</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                {language === 'en'
                  ? 'Select the artistic foundation for your illustration before composing your prompt.'
                  : 'Pilih fondasi gaya artistik sebelum memasukkan ide atau prompt Anda.'}
              </p>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
            {[
              { id: 'all', label: language === 'en' ? 'All Styles' : 'Semua Gaya' },
              { id: 'vector', label: 'Vector & Flat' },
              { id: '3d', label: '3D & Diorama' },
              { id: 'artistic', label: 'Artistic & Ink' },
              { id: 'retro', label: 'Retro & Arcade' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all shrink-0 ${
                  categoryFilter === tab.id
                    ? 'bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold shadow-xs'
                    : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Presets Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {filteredPresets.map(preset => {
            const Icon = preset.icon;
            const isSelected = selectedPresetId === preset.id;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setSelectedPresetId(preset.id);
                  // Clear previous enhanced result if switching preset to avoid mismatched modifiers
                  setEnhancedResult(null);
                }}
                className={`relative text-left p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 group ${
                  isSelected
                    ? 'border-rose-500 dark:border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 ring-2 ring-rose-500/20 shadow-sm'
                    : 'border-stone-200 dark:border-zinc-800/80 bg-stone-50/50 dark:bg-zinc-900 hover:border-stone-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-rose-600 text-white'
                          : 'bg-stone-200/70 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 group-hover:bg-rose-500/10 group-hover:text-rose-600 dark:group-hover:text-rose-400'
                      }`}
                    >
                      <Icon size={18} />
                    </div>

                    {isSelected ? (
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-600 text-white">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400 border border-stone-200/50 dark:border-zinc-700/50">
                        {preset.category}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3
                      className={`text-sm font-bold transition-colors ${
                        isSelected
                          ? 'text-rose-900 dark:text-rose-100'
                          : 'text-stone-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400'
                      }`}
                    >
                      {preset.name}
                    </h3>
                    <p className="text-[11px] text-stone-500 dark:text-zinc-400 line-clamp-2 mt-0.5 leading-relaxed">
                      {language === 'en' ? preset.descriptionEn : preset.descriptionId}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200/60 dark:border-zinc-800 flex items-center justify-between text-[10px] text-stone-400 dark:text-zinc-500">
                  <span className="font-mono">{preset.badge}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: PROMPT & STUDIO CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prompt Input & Generator Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-zinc-900/80 p-5 sm:p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-xs space-y-5">
            {/* Step 2 Header */}
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold font-mono">
                  2
                </span>
                <div>
                  <h2 className="text-base font-bold text-stone-900 dark:text-zinc-100">
                    {language === 'en' ? 'Describe Your Illustration' : 'Tuliskan Deskripsi Ide Ilustrasi'}
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-zinc-400">
                    {language === 'en'
                      ? `Active preset: ${selectedPreset.name}`
                      : `Preset aktif: ${selectedPreset.name}`}
                  </p>
                </div>
              </div>

              {/* Random Idea Button */}
              <button
                type="button"
                onClick={() => {
                  const samples = selectedPreset.samplePrompts;
                  const random = samples[Math.floor(Math.random() * samples.length)];
                  setPrompt(language === 'en' ? random.en : random.id);
                  setEnhancedResult(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-600 dark:text-zinc-400 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors"
                title="Random prompt idea"
              >
                <Dice5 size={14} />
                <span>{language === 'en' ? 'Inspire Me' : 'Inspirasi Acak'}</span>
              </button>
            </div>

            {/* Prompt Textarea */}
            <div className="space-y-2">
              <div className="relative">
                <textarea
                  id="illustration-prompt-input"
                  rows={4}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder={
                    language === 'en'
                      ? `e.g. A solitary samurai resting under a blooming cherry blossom tree...`
                      : `misal: Seorang samurai beristirahat di bawah pohon sakura mekar tertiup angin musim gugur...`
                  }
                  className="w-full p-4 rounded-2xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 text-sm text-stone-900 dark:text-zinc-100 placeholder-stone-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none transition-all leading-relaxed"
                />

                {prompt && (
                  <button
                    type="button"
                    onClick={() => {
                      setPrompt('');
                      setEnhancedResult(null);
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-stone-200/60 dark:hover:bg-zinc-800 transition-colors"
                    title="Clear prompt"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Sample Prompt Chips for the active preset */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-stone-500 dark:text-zinc-400 flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-500" />
                  <span>
                    {language === 'en'
                      ? `Quick examples for ${selectedPreset.name}:`
                      : `Contoh cepat gaya ${selectedPreset.name}:`}
                  </span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPreset.samplePrompts.map((s, idx) => {
                    const text = language === 'en' ? s.en : s.id;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPrompt(text);
                          setEnhancedResult(null);
                        }}
                        className="text-left px-2.5 py-1 rounded-xl text-xs bg-stone-100 dark:bg-zinc-800/90 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-stone-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 border border-stone-200/50 dark:border-zinc-700/50 transition-all truncate max-w-full sm:max-w-md"
                      >
                        {text}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* AI Prompt Enhancement Action Card */}
            <div className="p-3.5 rounded-2xl bg-linear-to-r from-rose-500/10 via-amber-500/10 to-purple-500/10 border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300">
                  <Sparkles size={14} />
                  <span>{language === 'en' ? 'Gemini Prompt Enhancer' : 'AI Prompt Enhancer (Gemini)'}</span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-zinc-400">
                  {language === 'en'
                    ? 'Turn your simple sentence into a rich, camera-angle & lighting optimized diffusion prompt.'
                    : 'Ubah kalimat sederhana menjadi deskripsi visual mendalam dengan pencahayaan dan detail artistik.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={isEnhancing || !prompt.trim()}
                className="w-full sm:w-auto shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                {isEnhancing ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>{language === 'en' ? 'Enhancing...' : 'Mempercantik...'}</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={13} />
                    <span>{language === 'en' ? 'Enhance with AI' : 'Percantik dengan AI'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Enhanced Prompt Details Banner (if active) */}
            {enhancedResult && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2 text-xs">
                <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>{language === 'en' ? 'Prompt Enhanced Successfully' : 'Prompt Berhasil Ditingkatkan'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(enhancedResult.enhancedPrompt, 'enhanced')}
                    className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {copiedKey === 'enhanced' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedKey === 'enhanced' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-stone-600 dark:text-zinc-300 italic text-[11px] leading-relaxed">
                  "{enhancedResult.explanation}"
                </p>
              </div>
            )}

            {/* STEP 3: FORMAT & CANVAS SETTINGS */}
            <div className="border-t border-stone-100 dark:border-zinc-800 pt-4 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-zinc-100">
                <Sliders size={14} className="text-rose-500" />
                <span>{language === 'en' ? 'Aspect Ratio & Render Specs' : 'Rasio Aspek & Spesifikasi Render'}</span>
              </div>

              {/* Aspect Ratio Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {ASPECT_RATIOS.map(ratio => {
                  const isSelected = aspectRatio === ratio.id;
                  return (
                    <button
                      key={ratio.id}
                      type="button"
                      onClick={() => setAspectRatio(ratio.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold shadow-xs'
                          : 'border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 text-stone-600 dark:text-zinc-400 hover:border-stone-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{ratio.id}</div>
                      <div className="text-[10px] text-stone-400 dark:text-zinc-500 mt-0.5 truncate">
                        {ratio.width}x{ratio.height}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Model & Seed Advanced Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Diffusion Engine Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-500 dark:text-zinc-400 flex items-center justify-between">
                    <span>{language === 'en' ? 'AI Diffusion Model' : 'Model Mesin AI'}</span>
                    <span className="text-emerald-500 font-normal">Free Limit</span>
                  </label>
                  <select
                    value={modelType}
                    onChange={e => setModelType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 text-xs text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option value="flux">FLUX.1 Schnell (Highest Fidelity & Vector Details)</option>
                    <option value="turbo">SDXL Turbo (Ultra-Fast 2s Render)</option>
                  </select>
                </div>

                {/* Seed Control */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500 dark:text-zinc-400">
                    <span>Seed</span>
                    <label className="flex items-center gap-1 cursor-pointer font-normal">
                      <input
                        type="checkbox"
                        checked={isSeedLocked}
                        onChange={e => setIsSeedLocked(e.target.checked)}
                        className="rounded text-rose-600 focus:ring-rose-500/20"
                      />
                      <span>{language === 'en' ? 'Lock Seed' : 'Kunci Seed'}</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={seed}
                      onChange={e => setSeed(Number(e.target.value))}
                      disabled={!isSeedLocked}
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 text-xs text-stone-900 dark:text-zinc-100 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setSeed(Math.floor(Math.random() * 1000000))}
                      className="px-2.5 py-2 rounded-xl bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-600 dark:text-zinc-400 text-xs transition-colors"
                      title="Generate new random seed"
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center justify-between gap-2">
                <span>{errorMessage}</span>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="p-1 hover:bg-rose-500/20 rounded"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* MAIN ACTION BUTTON: GENERATE ILLUSTRATION */}
            <div className="pt-2">
              <button
                type="button"
                id="generate-illustration-btn"
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>
                      {language === 'en'
                        ? 'Synthesizing Illustration with AI...'
                        : 'Menghasilkan Ilustrasi dengan AI...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>
                      {language === 'en'
                        ? `Generate in "${selectedPreset.name}" Style`
                        : `Buat Ilustrasi Gaya "${selectedPreset.name}"`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Result & Canvas Stage (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-zinc-900/80 p-5 sm:p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
            {/* Header Stage */}
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-rose-500" />
                <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">
                  {language === 'en' ? 'Canvas & Output' : 'Kanvas & Hasil Ilustrasi'}
                </h3>
              </div>

              {/* Background Tone Switcher */}
              <div className="flex items-center gap-1 bg-stone-100 dark:bg-zinc-800 p-1 rounded-lg">
                {(['checker', 'dark', 'light'] as const).map(tone => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setBackgroundTone(tone)}
                    className={`px-2 py-0.5 rounded text-[10px] capitalize transition-colors ${
                      backgroundTone === tone
                        ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 font-bold shadow-xs'
                        : 'text-stone-500 dark:text-zinc-400'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Canvas Area */}
            <div
              className={`relative rounded-2xl overflow-hidden border border-stone-200 dark:border-zinc-800 flex items-center justify-center min-h-[360px] sm:min-h-[420px] transition-colors ${
                backgroundTone === 'dark'
                  ? 'bg-zinc-950'
                  : backgroundTone === 'light'
                  ? 'bg-stone-100'
                  : 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] bg-[size:16px_16px] bg-stone-50 dark:bg-zinc-900'
              }`}
            >
              {isGenerating ? (
                <div className="p-8 text-center space-y-4 max-w-xs mx-auto animate-pulse">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                    <RefreshCw size={28} className="animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-stone-900 dark:text-zinc-100">
                      {language === 'en' ? 'Drawing Vector Details...' : 'Melukis Detail Ilustrasi...'}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-zinc-400">
                      {language === 'en'
                        ? `Applying ${selectedPreset.name} stylistic weights.`
                        : `Menerapkan komposisi gaya ${selectedPreset.name}.`}
                    </p>
                  </div>
                </div>
              ) : currentResult ? (
                <div className="relative group w-full h-full flex items-center justify-center p-2">
                  <img
                    src={currentResult.imageUrl}
                    alt={currentResult.prompt}
                    className="max-h-[480px] w-auto max-w-full object-contain rounded-xl shadow-md cursor-pointer transition-transform duration-300 group-hover:scale-[1.01]"
                    onClick={() => setLightboxOpen(true)}
                  />

                  {/* Hover Overlay Button */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setLightboxOpen(true)}
                      className="p-2 rounded-xl bg-black/70 hover:bg-black text-white text-xs backdrop-blur-md transition-all shadow-md"
                      title="Fullscreen preview"
                    >
                      <Maximize2 size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center space-y-3 max-w-xs mx-auto text-stone-400 dark:text-zinc-500">
                  <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-stone-400 dark:text-zinc-500 border border-stone-200/60 dark:border-zinc-700/60">
                    <Sparkles size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-stone-600 dark:text-zinc-300">
                      {language === 'en' ? 'No illustration generated yet' : 'Belum ada ilustrasi yang dibuat'}
                    </p>
                    <p className="text-[11px] text-stone-400 dark:text-zinc-500 leading-relaxed">
                      {language === 'en'
                        ? 'Select a preset style above, type an idea, and click Generate to see live results.'
                        : 'Pilih preset gaya di atas, ketikkan ide Anda, lalu klik Buat Ilustrasi untuk melihat hasilnya.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar (when result is available) */}
            {currentResult && (
              <div className="space-y-3 pt-1">
                {/* Meta details */}
                <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-zinc-400 font-mono">
                  <span>{currentResult.stylePresetName}</span>
                  <span>
                    {currentResult.width}x{currentResult.height} • Seed: {currentResult.seed}
                  </span>
                </div>

                {/* Main Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownload(currentResult.imageUrl, currentResult.stylePresetId)}
                    className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download size={14} />
                    <span>{language === 'en' ? 'Download PNG' : 'Unduh PNG'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSeed(Math.floor(Math.random() * 1000000));
                      handleGenerate();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-800 dark:text-zinc-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                  >
                    <Dice5 size={14} />
                    <span>{language === 'en' ? 'Variation (New Seed)' : 'Variasi (Seed Baru)'}</span>
                  </button>
                </div>

                {/* Secondary Actions */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100 dark:border-zinc-800 text-xs">
                  <button
                    type="button"
                    onClick={() => handleCopyText(currentResult.imageUrl, 'url')}
                    className="flex items-center gap-1 text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                  >
                    {copiedKey === 'url' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copiedKey === 'url' ? 'Copied URL' : 'Copy Image Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyText(currentResult.prompt, 'prompt')}
                    className="flex items-center gap-1 text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                  >
                    {copiedKey === 'prompt' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copiedKey === 'prompt' ? 'Copied Prompt' : 'Copy Prompt'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RECENT GENERATIONS HISTORY GALLERY */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-zinc-900/80 p-5 sm:p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <History size={16} className="text-rose-500" />
              <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">
                {language === 'en' ? 'Recent Generations (Session History)' : 'Riwayat Ilustrasi Sesi Ini'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-stone-100 dark:bg-zinc-800 text-stone-500">
                {history.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.confirm(language === 'en' ? 'Clear history?' : 'Hapus semua riwayat?')) {
                  setHistory([]);
                  localStorage.removeItem('van_ai_illustrations_history');
                }
              }}
              className="text-xs text-stone-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
            >
              <Trash2 size={12} />
              <span>{language === 'en' ? 'Clear' : 'Hapus'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {history.map(item => (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 flex flex-col justify-between"
              >
                <div
                  className="aspect-square w-full overflow-hidden cursor-pointer"
                  onClick={() => setCurrentResult(item)}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.prompt}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="p-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-zinc-400 font-mono">
                    <span className="truncate max-w-[80px]">{item.stylePresetName}</span>
                    <button
                      type="button"
                      onClick={() => handleDownload(item.imageUrl, item.stylePresetId)}
                      className="text-stone-400 hover:text-rose-500 transition-colors"
                      title="Download"
                    >
                      <Download size={12} />
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-700 dark:text-zinc-300 line-clamp-1">
                    {item.prompt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {lightboxOpen && currentResult && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 sm:p-8 flex flex-col items-center justify-center animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-10 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close"
            >
              <X size={20} />
            </button>

            <img
              src={currentResult.imageUrl}
              alt={currentResult.prompt}
              className="max-h-[80vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain"
            />

            <div className="mt-4 text-center space-y-1 max-w-2xl text-white">
              <p className="text-sm font-semibold">{currentResult.prompt}</p>
              <p className="text-xs text-stone-400 font-mono">
                Preset: {currentResult.stylePresetName} • Seed: {currentResult.seed} • {currentResult.width}x{currentResult.height}
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDownload(currentResult.imageUrl, currentResult.stylePresetId)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg"
                >
                  <Download size={14} />
                  <span>{language === 'en' ? 'Download Full Res PNG' : 'Unduh PNG Resolusi Penuh'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Information & Free Limit Explainer Note */}
      <div className="p-4 rounded-2xl bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-xs text-stone-600 dark:text-zinc-400 flex items-start gap-3">
        <Info size={18} className="text-rose-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-stone-900 dark:text-zinc-100">
            {language === 'en' ? 'About Model Limits & Privacy' : 'Mengenai Limit Model & Privasi'}
          </p>
          <p className="leading-relaxed">
            {language === 'en'
              ? 'This tool runs on public zero-auth diffusion clusters (FLUX.1 and SDXL Turbo) combined with Gemini 3.8 Flash for prompt optimization. It is 100% free with generous rate limits, requires no credit card, and stores no personal data.'
              : 'Tool ini ditenagai klaster difusi terbuka gratis (FLUX.1 & SDXL Turbo) yang dikombinasikan dengan Gemini 3.8 Flash untuk optimasi prompt. Sepenuhnya gratis tanpa kartu kredit, memiliki limit kuota besar, dan tidak menyimpan data pribadi Anda.'}
          </p>
        </div>
      </div>
    </div>
  );
};
