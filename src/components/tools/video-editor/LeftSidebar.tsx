import React, { useState, useRef, useEffect } from 'react';
import {
  FileVideo,
  Music2,
  Type,
  Smile,
  Sparkles,
  Sliders,
  Maximize2,
  Upload,
  Plus,
  Play,
  Mic,
  MicOff,
  Video,
  Volume2,
  Check,
  Trash2,
} from 'lucide-react';
import { ActiveTab, Clip, MediaAsset, Project, TextPreset } from './types';
import {
  SAMPLE_VIDEOS,
  SOUND_EFFECTS,
  LUT_PRESETS,
  TEXT_PRESETS,
  STICKER_PACKS,
} from './sampleMedia';
import { playSfx, SfxType, createSfxBlobUrl, startVoiceRecorder } from './audioEngine';

interface LeftSidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  project: Project;
  mediaAssets: MediaAsset[];
  onAddMediaAsset: (asset: MediaAsset) => void;
  onAddClipToTimeline: (clipData: Partial<Clip>) => void;
  onApplyLutToSelectedClip: (lutId: string) => void;
  onUpdateProjectBgColor: (color: string) => void;
  onOpenRecordModal: () => void;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTab,
  setActiveTab,
  project,
  mediaAssets,
  onAddMediaAsset,
  onAddClipToTimeline,
  onApplyLutToSelectedClip,
  onUpdateProjectBgColor,
  onOpenRecordModal,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}) => {
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceVolume, setVoiceVolume] = useState(0);
  const voiceRecorderRef = useRef<{
    stop: () => Promise<{ blob: Blob; url: string; duration: number }>;
    getVolumeLevel: () => number;
  } | null>(null);
  const timerRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'media', label: 'Media', icon: <FileVideo size={18} /> },
    { id: 'audio', label: 'Audio', icon: <Music2 size={18} /> },
    { id: 'text', label: 'Text', icon: <Type size={18} /> },
    { id: 'stickers', label: 'Stickers', icon: <Smile size={18} /> },
    { id: 'filters', label: 'Filters', icon: <Sparkles size={18} /> },
    { id: 'canvas', label: 'Canvas', icon: <Sliders size={18} /> },
  ];

  // Handle local media file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const url = URL.createObjectURL(file);
      let type: 'video' | 'audio' | 'image' = 'video';
      if (file.type.startsWith('audio/')) type = 'audio';
      else if (file.type.startsWith('image/')) type = 'image';

      if (type === 'video' || type === 'audio') {
        const tempMedia = document.createElement(type);
        tempMedia.src = url;
        tempMedia.onloadedmetadata = () => {
          const duration = tempMedia.duration || 5;
          const asset: MediaAsset = {
            id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: file.name,
            type,
            url,
            duration,
          };
          onAddMediaAsset(asset);
        };
      } else {
        const asset: MediaAsset = {
          id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          type: 'image',
          url,
          duration: 5,
        };
        onAddMediaAsset(asset);
      }
    });

    if (e.target) e.target.value = '';
  };

  // Mic voiceover toggle
  const toggleVoiceRecording = async () => {
    if (isRecordingVoice) {
      if (voiceRecorderRef.current) {
        if (timerRef.current) clearInterval(timerRef.current);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

        const result = await voiceRecorderRef.current.stop();
        setIsRecordingVoice(false);
        setRecordingSeconds(0);
        setVoiceVolume(0);

        // Add to audio track on timeline
        const targetTrack = project.tracks.find((t) => t.type === 'audio') || project.tracks[0];
        onAddClipToTimeline({
          trackId: targetTrack.id,
          name: `Voiceover ${new Date().toLocaleTimeString()}`,
          type: 'audio',
          src: result.url,
          duration: result.duration,
          offset: 0,
          volume: 1.0,
          muted: false,
        });
      }
    } else {
      try {
        const recorder = await startVoiceRecorder();
        voiceRecorderRef.current = recorder;
        setIsRecordingVoice(true);
        setRecordingSeconds(0);

        timerRef.current = window.setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);

        const checkVolume = () => {
          if (voiceRecorderRef.current) {
            setVoiceVolume(voiceRecorderRef.current.getVolumeLevel());
            animFrameRef.current = requestAnimationFrame(checkVolume);
          }
        };
        animFrameRef.current = requestAnimationFrame(checkVolume);
      } catch (err) {
        alert('Microphone access denied or unavailable.');
        console.error(err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handleAddSfxToTimeline = async (sfxType: SfxType, name: string) => {
    playSfx(sfxType);
    const { url, duration } = await createSfxBlobUrl(sfxType);
    const targetTrack = project.tracks.find((t) => t.type === 'audio') || project.tracks[0];
    onAddClipToTimeline({
      trackId: targetTrack.id,
      name: `SFX: ${name}`,
      type: 'audio',
      src: url,
      duration,
      offset: 0,
      volume: 1.0,
    });
  };

  const handleAddTextPreset = (preset: TextPreset) => {
    const targetTrack = project.tracks.find((t) => t.type === 'overlay') || project.tracks[0];
    onAddClipToTimeline({
      trackId: targetTrack.id,
      name: preset.name,
      type: 'text',
      duration: 4,
      textData: {
        text: preset.data.text || 'YOUR TEXT HERE',
        fontFamily: preset.data.fontFamily || 'Montserrat',
        fontSize: preset.data.fontSize || 36,
        fontWeight: preset.data.fontWeight || 700,
        color: preset.data.color || '#ffffff',
        backgroundColor: preset.data.backgroundColor || 'transparent',
        bgPadding: preset.data.bgPadding || 8,
        textShadow: preset.data.textShadow,
        animation: preset.data.animation || 'fade',
        x: preset.data.x ?? 50,
        y: preset.data.y ?? 50,
        align: preset.data.align || 'center',
      },
    });
  };

  const handleAddSticker = (sticker: { emoji?: string; badgeType?: string; label?: string }) => {
    const targetTrack = project.tracks.find((t) => t.type === 'overlay') || project.tracks[0];
    onAddClipToTimeline({
      trackId: targetTrack.id,
      name: sticker.label || sticker.badgeType || sticker.emoji || 'Sticker',
      type: 'sticker',
      duration: 4,
      stickerData: {
        category: 'general',
        emoji: sticker.emoji,
        badgeType: sticker.badgeType,
        label: sticker.label,
        x: 50,
        y: 40,
        scale: 1,
      },
    });
  };

  return (
    <aside
      className={`${
        isMobileDrawer
          ? 'w-full h-full flex'
          : 'hidden lg:flex w-80 xl:w-88 border-r border-zinc-800'
      } bg-zinc-900 shrink-0 text-zinc-100 select-none z-20 overflow-hidden`}
    >
      {/* Tab Navigation Rail */}
      <div className="w-16 bg-zinc-950/80 border-r border-zinc-800/80 flex flex-col items-center py-3 gap-1.5 shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-rose-500/15 text-rose-400 font-bold border border-rose-500/30 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {tab.icon}
              <span className="leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Drawer */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-900">
        {/* Drawer Header */}
        <div className="px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            {tabs.find((t) => t.id === activeTab)?.label} Studio
          </h2>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
          {/* 1. MEDIA TAB */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              {/* Upload Drop Zone & Record Action */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3.5 rounded-xl border border-dashed border-zinc-700 hover:border-rose-500 bg-zinc-800/40 hover:bg-zinc-800/80 flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer group"
                >
                  <Upload size={18} className="text-zinc-400 group-hover:text-rose-400" />
                  <span className="text-xs font-semibold text-zinc-300 group-hover:text-white">Upload File</span>
                  <span className="text-[10px] text-zinc-500">MP4, WebM, MP3, PNG</span>
                </button>

                <button
                  onClick={onOpenRecordModal}
                  className="p-3.5 rounded-xl border border-zinc-700/80 hover:border-red-500 bg-zinc-800/40 hover:bg-red-950/20 flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer group"
                >
                  <Video size={18} className="text-red-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-zinc-300 group-hover:text-red-300">Record Video</span>
                  <span className="text-[10px] text-zinc-500">Screen or Webcam</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="video/*,audio/*,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Uploaded User Assets */}
              {mediaAssets.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Uploaded Assets ({mediaAssets.length})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {mediaAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="group relative rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700/80 hover:border-rose-500 transition-all p-2 flex flex-col justify-between h-24"
                      >
                        <div className="text-[11px] font-medium text-zinc-200 truncate">{asset.name}</div>
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-auto">
                          <span className="uppercase font-mono">{asset.type}</span>
                          <span>{asset.duration.toFixed(1)}s</span>
                        </div>
                        <button
                          onClick={() => {
                            const trackType = asset.type === 'audio' ? 'audio' : 'video';
                            const targetTrack = project.tracks.find((t) => t.type === trackType) || project.tracks[0];
                            onAddClipToTimeline({
                              trackId: targetTrack.id,
                              name: asset.name,
                              type: asset.type,
                              src: asset.url,
                              duration: asset.duration,
                              sourceDuration: asset.duration,
                              offset: 0,
                            });
                          }}
                          className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 text-xs font-semibold text-white transition-opacity cursor-pointer"
                        >
                          <Plus size={14} /> Add to Timeline
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Media Clips */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Sample Stock Footage
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SAMPLE_VIDEOS.map((sample) => (
                    <div
                      key={sample.id}
                      className="group relative rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700/80 hover:border-rose-500 transition-all aspect-video"
                    >
                      <img
                        src={sample.thumbnail}
                        alt={sample.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        crossOrigin="anonymous"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 flex flex-col justify-end">
                        <span className="text-[11px] font-semibold text-white truncate">{sample.name}</span>
                        <span className="text-[9px] text-zinc-300">{sample.duration}s</span>
                      </div>

                      {/* Add Button Overlay */}
                      <button
                        onClick={() => {
                          const targetTrack = project.tracks.find((t) => t.type === 'video') || project.tracks[0];
                          onAddClipToTimeline({
                            trackId: targetTrack.id,
                            name: sample.name,
                            type: 'video',
                            src: sample.url,
                            thumbnail: sample.thumbnail,
                            duration: sample.duration,
                            sourceDuration: sample.duration,
                            offset: 0,
                          });
                        }}
                        className="absolute inset-0 bg-rose-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs font-bold text-white transition-all cursor-pointer backdrop-blur-2xs"
                      >
                        <Plus size={16} /> Add to Track
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. AUDIO & VOICEOVER TAB */}
          {activeTab === 'audio' && (
            <div className="space-y-5">
              {/* Mic Voiceover Studio */}
              <div className="p-3.5 rounded-xl bg-zinc-800/70 border border-zinc-700/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mic size={16} className={isRecordingVoice ? 'text-red-500 animate-pulse' : 'text-zinc-400'} />
                    <span className="text-xs font-bold text-zinc-200">Voiceover Mic Recording</span>
                  </div>
                  {isRecordingVoice && (
                    <span className="text-xs font-mono font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded-full border border-red-800">
                      00:{recordingSeconds.toString().padStart(2, '0')}
                    </span>
                  )}
                </div>

                {/* Real-time audio waveform visualizer meter */}
                {isRecordingVoice && (
                  <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-red-500 h-full transition-all duration-75"
                      style={{ width: `${Math.min(100, voiceVolume * 250)}%` }}
                    />
                  </div>
                )}

                <button
                  onClick={toggleVoiceRecording}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    isRecordingVoice
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/30'
                      : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-100'
                  }`}
                >
                  {isRecordingVoice ? (
                    <>
                      <MicOff size={14} /> Stop & Insert to Timeline
                    </>
                  ) : (
                    <>
                      <Mic size={14} /> Start Voice Recording
                    </>
                  )}
                </button>
              </div>

              {/* Synthesized Sound Effects (Instant Zero Latency) */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Sound Effects Library</span>
                  <span className="text-[9px] text-zinc-500">Zero-latency SFX</span>
                </div>
                <div className="space-y-1.5">
                  {SOUND_EFFECTS.map((sfx) => (
                    <div
                      key={sfx.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => playSfx(sfx.type)}
                          className="w-7 h-7 rounded-md bg-zinc-700 hover:bg-rose-500 hover:text-white flex items-center justify-center text-zinc-300 transition-colors cursor-pointer"
                          title="Preview sound"
                        >
                          <Play size={12} />
                        </button>
                        <div>
                          <div className="text-xs font-semibold text-zinc-200">{sfx.name}</div>
                          <div className="text-[10px] text-zinc-400 capitalize">{sfx.duration}s • {sfx.category}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddSfxToTimeline(sfx.type, sfx.name)}
                        className="px-2.5 py-1 rounded-md bg-zinc-700 hover:bg-rose-600 text-zinc-200 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus size={12} /> Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. TEXT & TITLES TAB */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <button
                onClick={() => {
                  const targetTrack = project.tracks.find((t) => t.type === 'overlay') || project.tracks[0];
                  onAddClipToTimeline({
                    trackId: targetTrack.id,
                    name: 'Heading Title',
                    type: 'text',
                    duration: 4,
                    textData: {
                      text: 'ADD HEADING HERE',
                      fontFamily: 'Montserrat',
                      fontSize: 42,
                      fontWeight: 800,
                      color: '#ffffff',
                      backgroundColor: 'transparent',
                      textShadow: '0 4px 12px rgba(0,0,0,0.8)',
                      animation: 'fade',
                      x: 50,
                      y: 50,
                      align: 'center',
                    },
                  });
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Plus size={15} /> Add Basic Title
              </button>

              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Animated Title & Caption Presets
                </div>
                <div className="space-y-2">
                  {TEXT_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => handleAddTextPreset(preset)}
                      className="p-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 hover:border-rose-500 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-zinc-200 group-hover:text-rose-400 transition-colors">
                          {preset.name}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-300">
                          {preset.category}
                        </span>
                      </div>
                      <div
                        className="py-2 px-3 rounded bg-zinc-950/80 text-center text-sm truncate"
                        style={{
                          fontFamily: preset.data.fontFamily,
                          color: preset.data.color,
                          fontWeight: preset.data.fontWeight,
                        }}
                      >
                        {preset.data.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. STICKERS & BADGES TAB */}
          {activeTab === 'stickers' && (
            <div className="space-y-5">
              {STICKER_PACKS.map((pack) => (
                <div key={pack.category} className="space-y-2">
                  <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    {pack.category}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {pack.stickers.map((stk) => (
                      <button
                        key={stk.id}
                        onClick={() => handleAddSticker(stk)}
                        className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/60 hover:border-rose-500 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer group"
                      >
                        {stk.emoji ? (
                          <span className="text-2xl group-hover:scale-125 transition-transform">{stk.emoji}</span>
                        ) : (
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white shadow-2xs"
                            style={{ backgroundColor: (stk as { color?: string }).color || '#e11d48' }}
                          >
                            {stk.label}
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-400 truncate max-w-full">{stk.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 5. FILTERS & COLOR GRADING TAB */}
          {activeTab === 'filters' && (
            <div className="space-y-3">
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Cinematic LUT Presets
              </div>
              <p className="text-[11px] text-zinc-400">
                Click any preset to apply color grading directly to the selected clip:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {LUT_PRESETS.map((lut) => (
                  <button
                    key={lut.id}
                    onClick={() => onApplyLutToSelectedClip(lut.id)}
                    className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/80 hover:border-rose-500 transition-all text-left flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div
                      className="w-5 h-5 rounded-full border border-white/20 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: lut.previewColor }}
                    />
                    <div>
                      <div className="text-xs font-bold text-zinc-200">{lut.name}</div>
                      <div className="text-[9px] text-zinc-400 uppercase font-mono">{lut.id}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 6. CANVAS & BACKGROUND TAB */}
          {activeTab === 'canvas' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Canvas Background Color
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Dark Zinc', color: '#09090b' },
                    { label: 'Pure Black', color: '#000000' },
                    { label: 'Slate Gray', color: '#1e293b' },
                    { label: 'Deep Blue', color: '#0f172a' },
                    { label: 'Rose Wine', color: '#4c0519' },
                    { label: 'Emerald Dark', color: '#022c22' },
                    { label: 'White Studio', color: '#ffffff' },
                    { label: 'Warm Stone', color: '#292524' },
                  ].map((bg) => (
                    <button
                      key={bg.color}
                      onClick={() => onUpdateProjectBgColor(bg.color)}
                      className={`p-2 rounded-lg border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        project.backgroundColor === bg.color
                          ? 'border-rose-500 ring-2 ring-rose-500/30'
                          : 'border-zinc-700 hover:border-zinc-500'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-md border border-white/20 shadow-xs"
                        style={{ backgroundColor: bg.color }}
                      />
                      <span className="text-[9px] text-zinc-300 font-medium text-center truncate w-full">
                        {bg.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
