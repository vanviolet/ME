import React from 'react';
import {
  Sliders,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Volume2,
  VolumeX,
  Sparkles,
  Type,
  Maximize2,
  Layers,
  Trash2,
  Copy,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Scissors,
  Radio,
  Move,
  Eye,
  Disc,
} from 'lucide-react';
import { Clip, Project, BlendMode, MaskShape, MotionPreset, EqPreset } from './types';
import { LUT_PRESETS } from './sampleMedia';

interface RightInspectorProps {
  selectedClip: Clip | null;
  project: Project;
  onUpdateClip: (clipId: string, updates: Partial<Clip>) => void;
  onDeleteClip: (clipId: string) => void;
  onDuplicateClip: (clipId: string) => void;
  onDeselectClip: () => void;
  onDetachAudio?: (clipId: string) => void;
}

export const RightInspector: React.FC<RightInspectorProps> = ({
  selectedClip,
  project,
  onUpdateClip,
  onDeleteClip,
  onDuplicateClip,
  onDeselectClip,
  onDetachAudio,
}) => {
  if (!selectedClip) {
    return (
      <aside className="w-72 bg-zinc-900 border-l border-zinc-800 p-4 flex flex-col justify-between text-zinc-100 select-none shrink-0 z-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <Layers size={16} className="text-zinc-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Project Settings
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-zinc-400 block mb-1">Title</span>
              <div className="p-2 rounded-lg bg-zinc-800/80 font-medium text-zinc-200 truncate">
                {project.title}
              </div>
            </div>

            <div>
              <span className="text-zinc-400 block mb-1">Aspect Ratio</span>
              <div className="p-2 rounded-lg bg-zinc-800/80 font-medium text-zinc-200">
                {project.aspectRatio}
              </div>
            </div>

            <div>
              <span className="text-zinc-400 block mb-1">Total Tracks</span>
              <div className="p-2 rounded-lg bg-zinc-800/80 font-medium text-zinc-200">
                {project.tracks.length} active tracks
              </div>
            </div>

            <div>
              <span className="text-zinc-400 block mb-1">Total Clips</span>
              <div className="p-2 rounded-lg bg-zinc-800/80 font-medium text-zinc-200">
                {project.clips.length} clips on timeline
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/60 text-center">
          <p className="text-[11px] text-zinc-400">
            💡 Select any clip on the timeline or canvas to customize transform, text, speed, and filters.
          </p>
        </div>
      </aside>
    );
  }

  const isVisual = selectedClip.type === 'video' || selectedClip.type === 'image';
  const isAudio = selectedClip.type === 'audio';
  const isText = selectedClip.type === 'text';
  const isSticker = selectedClip.type === 'sticker';

  return (
    <aside className="w-72 bg-zinc-900 border-l border-zinc-800 flex flex-col text-zinc-100 select-none shrink-0 z-10">
      {/* Inspector Header */}
      <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Sliders size={15} className="text-rose-400 shrink-0" />
          <span className="text-xs font-bold text-zinc-200 truncate">{selectedClip.name}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onDuplicateClip(selectedClip.id)}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Duplicate clip"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={() => onDeleteClip(selectedClip.id)}
            className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Delete clip"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Inspector Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs custom-scrollbar">
        {/* Timing Controls (Duration & Offset) */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
            Timing & Speed
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-zinc-400 block mb-1">Duration (s)</span>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={selectedClip.duration}
                onChange={(e) =>
                  onUpdateClip(selectedClip.id, {
                    duration: Math.max(0.5, parseFloat(e.target.value) || 1),
                  })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-xs text-zinc-200 outline-none"
              />
            </div>

            <div>
              <span className="text-[10px] text-zinc-400 block mb-1">Speed</span>
              <select
                value={selectedClip.speed}
                onChange={(e) =>
                  onUpdateClip(selectedClip.id, { speed: parseFloat(e.target.value) })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-xs text-zinc-200 outline-none cursor-pointer"
              >
                <option value="0.25">0.25x</option>
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1.0x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2.0x</option>
              </select>
            </div>
          </div>
        </div>

        {/* 1. VISUAL TRANSFORM & FIT */}
        {isVisual && (
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Transform & Fit
            </span>

            {/* Scale Slider */}
            <div>
              <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                <span>Scale / Zoom</span>
                <span>{((selectedClip.scale || 1) * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.05"
                value={selectedClip.scale || 1}
                onChange={(e) => onUpdateClip(selectedClip.id, { scale: parseFloat(e.target.value) })}
                className="w-full h-1 accent-rose-500 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Opacity Slider */}
            <div>
              <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                <span>Opacity</span>
                <span>{((selectedClip.opacity ?? 1) * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={selectedClip.opacity ?? 1}
                onChange={(e) => onUpdateClip(selectedClip.id, { opacity: parseFloat(e.target.value) })}
                className="w-full h-1 accent-rose-500 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Rotation & Flip Controls */}
            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={() =>
                  onUpdateClip(selectedClip.id, {
                    rotation: ((selectedClip.rotation || 0) + 90) % 360,
                  })
                }
                className="flex-1 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center gap-1 text-[11px] transition-colors cursor-pointer"
                title="Rotate 90 degrees"
              >
                <RotateCw size={13} />
                <span>Rotate</span>
              </button>

              <button
                onClick={() => onUpdateClip(selectedClip.id, { flipH: !selectedClip.flipH })}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  selectedClip.flipH
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                }`}
                title="Flip Horizontal"
              >
                <FlipHorizontal size={14} />
              </button>

              <button
                onClick={() => onUpdateClip(selectedClip.id, { flipV: !selectedClip.flipV })}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  selectedClip.flipV
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                }`}
                title="Flip Vertical"
              >
                <FlipVertical size={14} />
              </button>
            </div>

            {/* Fit mode */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onUpdateClip(selectedClip.id, { fit: 'contain' })}
                className={`py-1.5 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
                  selectedClip.fit === 'contain'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                }`}
              >
                Fit (Contain)
              </button>
              <button
                onClick={() => onUpdateClip(selectedClip.id, { fit: 'cover' })}
                className={`py-1.5 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
                  selectedClip.fit === 'cover'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                }`}
              >
                Fill (Cover)
              </button>
            </div>
          </div>
        )}

        {/* 2. AUDIO & EQUALIZER PROPERTIES */}
        {(isVisual || isAudio) && (
          <div className="space-y-3 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Audio & Equalizer
              </span>
              {selectedClip.audioSettings && (
                <button
                  onClick={() =>
                    onUpdateClip(selectedClip.id, {
                      audioSettings: {
                        eqPreset: 'flat',
                        bass: 0,
                        mid: 0,
                        treble: 0,
                        pan: 0,
                        noiseGate: false,
                        pitch: 0,
                      },
                    })
                  }
                  className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                >
                  Reset Audio
                </button>
              )}
            </div>

            {/* Detach Audio Button for Video Clips */}
            {onDetachAudio && selectedClip.type === 'video' && selectedClip.src && (
              <button
                onClick={() => onDetachAudio(selectedClip.id)}
                className="w-full py-1.5 px-3 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-600/40 hover:border-emerald-500 text-emerald-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-emerald-950/50"
                title="Separate video audio into its own independent editable audio track"
              >
                <Scissors size={13} className="text-emerald-400" />
                <span>Detach Audio to Track</span>
              </button>
            )}

            {/* Volume */}
            <div>
              <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                <span>Volume</span>
                <span>{Math.round((selectedClip.volume ?? 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.05"
                value={selectedClip.volume ?? 1}
                onChange={(e) => onUpdateClip(selectedClip.id, { volume: parseFloat(e.target.value) })}
                className="w-full h-1 accent-rose-500 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Fade In & Out */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-zinc-400 block mb-1">Fade In (s)</span>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.2"
                  value={selectedClip.fadeIn || 0}
                  onChange={(e) =>
                    onUpdateClip(selectedClip.id, { fadeIn: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 outline-none"
                />
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 block mb-1">Fade Out (s)</span>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.2"
                  value={selectedClip.fadeOut || 0}
                  onChange={(e) =>
                    onUpdateClip(selectedClip.id, { fadeOut: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 outline-none"
                />
              </div>
            </div>

            {/* EQ Presets */}
            <div>
              <span className="text-[10px] text-zinc-400 block mb-1">EQ Preset</span>
              <div className="grid grid-cols-3 gap-1">
                {(
                  [
                    { id: 'flat', label: 'Flat', b: 0, m: 0, t: 0 },
                    { id: 'voice-boost', label: 'Voice Boost', b: -2, m: 4, t: 3 },
                    { id: 'bass-boost', label: 'Bass Boost', b: 6, m: 0, t: -1 },
                    { id: 'treble-boost', label: 'Treble Boost', b: -1, m: 1, t: 6 },
                    { id: 'radio', label: 'Radio Lo-Fi', b: -8, m: 6, t: -6 },
                    { id: 'warm', label: 'Warm Glow', b: 4, m: 2, t: -2 },
                  ] as { id: EqPreset; label: string; b: number; m: number; t: number }[]
                ).map((preset) => {
                  const isActive = (selectedClip.audioSettings?.eqPreset || 'flat') === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() =>
                        onUpdateClip(selectedClip.id, {
                          audioSettings: {
                            eqPreset: preset.id,
                            bass: preset.b,
                            mid: preset.m,
                            treble: preset.t,
                            pan: selectedClip.audioSettings?.pan || 0,
                            noiseGate: selectedClip.audioSettings?.noiseGate || false,
                            pitch: selectedClip.audioSettings?.pitch || 0,
                          },
                        })
                      }
                      className={`py-1 px-1.5 rounded text-[10px] font-medium border text-center transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3-Band Equalizer Sliders */}
            <div className="space-y-2 pt-1 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-800">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
                3-Band EQ Sliders (dB)
              </span>

              {/* Bass */}
              <div>
                <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                  <span>Bass (180 Hz)</span>
                  <span className="font-mono">
                    {(selectedClip.audioSettings?.bass || 0) > 0 ? '+' : ''}
                    {selectedClip.audioSettings?.bass || 0} dB
                  </span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={selectedClip.audioSettings?.bass || 0}
                  onChange={(e) =>
                    onUpdateClip(selectedClip.id, {
                      audioSettings: {
                        eqPreset: 'flat',
                        bass: parseInt(e.target.value),
                        mid: selectedClip.audioSettings?.mid || 0,
                        treble: selectedClip.audioSettings?.treble || 0,
                        pan: selectedClip.audioSettings?.pan || 0,
                        noiseGate: selectedClip.audioSettings?.noiseGate || false,
                        pitch: selectedClip.audioSettings?.pitch || 0,
                      },
                    })
                  }
                  className="w-full h-1 accent-emerald-500 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Mid */}
              <div>
                <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                  <span>Mid (1.2 kHz)</span>
                  <span className="font-mono">
                    {(selectedClip.audioSettings?.mid || 0) > 0 ? '+' : ''}
                    {selectedClip.audioSettings?.mid || 0} dB
                  </span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={selectedClip.audioSettings?.mid || 0}
                  onChange={(e) =>
                    onUpdateClip(selectedClip.id, {
                      audioSettings: {
                        eqPreset: 'flat',
                        bass: selectedClip.audioSettings?.bass || 0,
                        mid: parseInt(e.target.value),
                        treble: selectedClip.audioSettings?.treble || 0,
                        pan: selectedClip.audioSettings?.pan || 0,
                        noiseGate: selectedClip.audioSettings?.noiseGate || false,
                        pitch: selectedClip.audioSettings?.pitch || 0,
                      },
                    })
                  }
                  className="w-full h-1 accent-emerald-500 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Treble */}
              <div>
                <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                  <span>Treble (5.5 kHz)</span>
                  <span className="font-mono">
                    {(selectedClip.audioSettings?.treble || 0) > 0 ? '+' : ''}
                    {selectedClip.audioSettings?.treble || 0} dB
                  </span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={selectedClip.audioSettings?.treble || 0}
                  onChange={(e) =>
                    onUpdateClip(selectedClip.id, {
                      audioSettings: {
                        eqPreset: 'flat',
                        bass: selectedClip.audioSettings?.bass || 0,
                        mid: selectedClip.audioSettings?.mid || 0,
                        treble: parseInt(e.target.value),
                        pan: selectedClip.audioSettings?.pan || 0,
                        noiseGate: selectedClip.audioSettings?.noiseGate || false,
                        pitch: selectedClip.audioSettings?.pitch || 0,
                      },
                    })
                  }
                  className="w-full h-1 accent-emerald-500 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Stereo Pan & Pitch */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                  <span>Stereo Pan</span>
                  <span className="font-mono">
                    {Math.round((selectedClip.audioSettings?.pan || 0) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.1"
                  value={selectedClip.audioSettings?.pan || 0}
                  onChange={(e) =>
                    onUpdateClip(selectedClip.id, {
                      audioSettings: {
                        eqPreset: selectedClip.audioSettings?.eqPreset || 'flat',
                        bass: selectedClip.audioSettings?.bass || 0,
                        mid: selectedClip.audioSettings?.mid || 0,
                        treble: selectedClip.audioSettings?.treble || 0,
                        pan: parseFloat(e.target.value),
                        noiseGate: selectedClip.audioSettings?.noiseGate || false,
                        pitch: selectedClip.audioSettings?.pitch || 0,
                      },
                    })
                  }
                  className="w-full h-1 accent-emerald-500 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                  <span>Pitch Shift</span>
                  <span className="font-mono">
                    {(selectedClip.audioSettings?.pitch || 0) > 0 ? '+' : ''}
                    {selectedClip.audioSettings?.pitch || 0}st
                  </span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={selectedClip.audioSettings?.pitch || 0}
                  onChange={(e) =>
                    onUpdateClip(selectedClip.id, {
                      audioSettings: {
                        eqPreset: selectedClip.audioSettings?.eqPreset || 'flat',
                        bass: selectedClip.audioSettings?.bass || 0,
                        mid: selectedClip.audioSettings?.mid || 0,
                        treble: selectedClip.audioSettings?.treble || 0,
                        pan: selectedClip.audioSettings?.pan || 0,
                        noiseGate: selectedClip.audioSettings?.noiseGate || false,
                        pitch: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full h-1 accent-emerald-500 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. MULTI-TRACK COMPOSITING (BLENDING, MASKING & MOTION) */}
        {isVisual && (
          <div className="space-y-3 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Compositing & Blending
              </span>
              {selectedClip.compositing && (
                <button
                  onClick={() =>
                    onUpdateClip(selectedClip.id, {
                      compositing: undefined,
                    })
                  }
                  className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Blend Mode Selection */}
            <div>
              <span className="text-[10px] text-zinc-400 block mb-1">Blend Mode</span>
              <select
                value={selectedClip.compositing?.blendMode || 'source-over'}
                onChange={(e) =>
                  onUpdateClip(selectedClip.id, {
                    compositing: {
                      ...selectedClip.compositing,
                      blendMode: e.target.value as BlendMode,
                    },
                  })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1.5 text-xs text-zinc-200 outline-none cursor-pointer"
              >
                <option value="source-over">Normal (Source Over)</option>
                <option value="multiply">Multiply (Shadows)</option>
                <option value="screen">Screen (Highlights)</option>
                <option value="overlay">Overlay (High Contrast)</option>
                <option value="darken">Darken</option>
                <option value="lighten">Lighten</option>
                <option value="color-dodge">Color Dodge</option>
                <option value="color-burn">Color Burn</option>
                <option value="hard-light">Hard Light</option>
                <option value="soft-light">Soft Light</option>
                <option value="difference">Difference</option>
                <option value="exclusion">Exclusion</option>
              </select>
            </div>

            {/* Shape Masking */}
            <div className="space-y-2 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                  Shape Masking
                </span>
                {selectedClip.compositing?.mask?.shape && selectedClip.compositing.mask.shape !== 'none' && (
                  <span className="text-[9px] text-rose-400 font-semibold">Active</span>
                )}
              </div>

              <div>
                <select
                  value={selectedClip.compositing?.mask?.shape || 'none'}
                  onChange={(e) => {
                    const shape = e.target.value as MaskShape;
                    onUpdateClip(selectedClip.id, {
                      compositing: {
                        blendMode: selectedClip.compositing?.blendMode || 'source-over',
                        motion: selectedClip.compositing?.motion,
                        mask:
                          shape === 'none'
                            ? undefined
                            : {
                                shape,
                                sizeX: selectedClip.compositing?.mask?.sizeX || 60,
                                sizeY: selectedClip.compositing?.mask?.sizeY || 60,
                                posX: selectedClip.compositing?.mask?.posX ?? 50,
                                posY: selectedClip.compositing?.mask?.posY ?? 50,
                                feather: selectedClip.compositing?.mask?.feather || 0,
                                inverted: selectedClip.compositing?.mask?.inverted || false,
                              },
                      },
                    });
                  }}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-xs text-zinc-200 outline-none cursor-pointer"
                >
                  <option value="none">No Mask</option>
                  <option value="circle">Circle Mask</option>
                  <option value="rectangle">Rectangle Mask</option>
                  <option value="ellipse">Ellipse Mask</option>
                  <option value="rounded-rect">Rounded Rect Mask</option>
                  <option value="vignette">Soft Vignette</option>
                </select>
              </div>

              {selectedClip.compositing?.mask && selectedClip.compositing.mask.shape !== 'none' && (
                <div className="space-y-2 pt-1 text-[10px]">
                  {/* Mask Size */}
                  <div>
                    <div className="flex justify-between text-zinc-400 mb-0.5">
                      <span>Mask Scale</span>
                      <span>{selectedClip.compositing.mask.sizeX}%</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="100"
                      value={selectedClip.compositing.mask.sizeX}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        onUpdateClip(selectedClip.id, {
                          compositing: {
                            ...selectedClip.compositing!,
                            blendMode: selectedClip.compositing?.blendMode || 'source-over',
                            mask: {
                              ...selectedClip.compositing!.mask!,
                              sizeX: val,
                              sizeY: val,
                            },
                          },
                        });
                      }}
                      className="w-full h-1 accent-rose-500 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Mask Position X / Y */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-zinc-400 block mb-0.5">Center X</span>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={selectedClip.compositing.mask.posX ?? 50}
                        onChange={(e) =>
                          onUpdateClip(selectedClip.id, {
                            compositing: {
                              ...selectedClip.compositing!,
                              blendMode: selectedClip.compositing?.blendMode || 'source-over',
                              mask: {
                                ...selectedClip.compositing!.mask!,
                                posX: parseInt(e.target.value),
                              },
                            },
                          })
                        }
                        className="w-full h-1 accent-rose-500 bg-zinc-800 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="text-zinc-400 block mb-0.5">Center Y</span>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={selectedClip.compositing.mask.posY ?? 50}
                        onChange={(e) =>
                          onUpdateClip(selectedClip.id, {
                            compositing: {
                              ...selectedClip.compositing!,
                              blendMode: selectedClip.compositing?.blendMode || 'source-over',
                              mask: {
                                ...selectedClip.compositing!.mask!,
                                posY: parseInt(e.target.value),
                              },
                            },
                          })
                        }
                        className="w-full h-1 accent-rose-500 bg-zinc-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Invert Mask Checkbox */}
                  <label className="flex items-center gap-2 text-zinc-300 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={selectedClip.compositing.mask.inverted}
                      onChange={(e) =>
                        onUpdateClip(selectedClip.id, {
                          compositing: {
                            ...selectedClip.compositing!,
                            blendMode: selectedClip.compositing?.blendMode || 'source-over',
                            mask: {
                              ...selectedClip.compositing!.mask!,
                              inverted: e.target.checked,
                            },
                          },
                        })
                      }
                      className="accent-rose-500 rounded"
                    />
                    <span>Invert Mask (Cutout Hole)</span>
                  </label>
                </div>
              )}
            </div>

            {/* Motion & Tracking Simulation */}
            <div className="space-y-2 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                  Motion Tracking & Path
                </span>
                {selectedClip.compositing?.motion?.preset && selectedClip.compositing.motion.preset !== 'none' && (
                  <span className="text-[9px] text-cyan-400 font-semibold">Animated</span>
                )}
              </div>

              <div>
                <select
                  value={selectedClip.compositing?.motion?.preset || 'none'}
                  onChange={(e) => {
                    const preset = e.target.value as MotionPreset;
                    onUpdateClip(selectedClip.id, {
                      compositing: {
                        blendMode: selectedClip.compositing?.blendMode || 'source-over',
                        mask: selectedClip.compositing?.mask,
                        motion:
                          preset === 'none'
                            ? undefined
                            : {
                                preset,
                                intensity: selectedClip.compositing?.motion?.intensity || 50,
                              },
                      },
                    });
                  }}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-xs text-zinc-200 outline-none cursor-pointer"
                >
                  <option value="none">Static (No Animation)</option>
                  <option value="zoom-in">Slow Zoom In (Ken Burns)</option>
                  <option value="zoom-out">Slow Zoom Out</option>
                  <option value="pan-left">Pan Smooth Left</option>
                  <option value="pan-right">Pan Smooth Right</option>
                  <option value="float">Handheld Float & Shake</option>
                  <option value="spin">Gradual Spin</option>
                </select>
              </div>

              {selectedClip.compositing?.motion && selectedClip.compositing.motion.preset !== 'none' && (
                <div className="pt-1">
                  <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
                    <span>Motion Intensity</span>
                    <span>{selectedClip.compositing.motion.intensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={selectedClip.compositing.motion.intensity}
                    onChange={(e) =>
                      onUpdateClip(selectedClip.id, {
                        compositing: {
                          ...selectedClip.compositing!,
                          blendMode: selectedClip.compositing?.blendMode || 'source-over',
                          motion: {
                            ...selectedClip.compositing!.motion!,
                            intensity: parseInt(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-full h-1 accent-cyan-500 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. COLOR & FILTER ADJUSTMENTS */}
        {isVisual && (
          <div className="space-y-3 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Color Adjustments
              </span>
              <button
                onClick={() =>
                  onUpdateClip(selectedClip.id, {
                    filters: {
                      brightness: 0,
                      contrast: 0,
                      saturation: 0,
                      sepia: 0,
                      grayscale: 0,
                      invert: 0,
                      blur: 0,
                      hueRotate: 0,
                      vignette: 0,
                      lutPreset: 'none',
                    },
                  })
                }
                className="text-[10px] text-rose-400 hover:underline cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Brightness */}
            <div>
              <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                <span>Brightness</span>
                <span>{selectedClip.filters?.brightness || 0}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={selectedClip.filters?.brightness || 0}
                onChange={(e) =>
                  onUpdateClip(selectedClip.id, {
                    filters: { ...selectedClip.filters, brightness: parseInt(e.target.value) },
                  })
                }
                className="w-full h-1 accent-rose-500 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div>
              <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                <span>Contrast</span>
                <span>{selectedClip.filters?.contrast || 0}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={selectedClip.filters?.contrast || 0}
                onChange={(e) =>
                  onUpdateClip(selectedClip.id, {
                    filters: { ...selectedClip.filters, contrast: parseInt(e.target.value) },
                  })
                }
                className="w-full h-1 accent-rose-500 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Saturation */}
            <div>
              <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                <span>Saturation</span>
                <span>{selectedClip.filters?.saturation || 0}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={selectedClip.filters?.saturation || 0}
                onChange={(e) =>
                  onUpdateClip(selectedClip.id, {
                    filters: { ...selectedClip.filters, saturation: parseInt(e.target.value) },
                  })
                }
                className="w-full h-1 accent-rose-500 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Vignette */}
            <div>
              <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                <span>Vignette Edge</span>
                <span>{selectedClip.filters?.vignette || 0}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={selectedClip.filters?.vignette || 0}
                onChange={(e) =>
                  onUpdateClip(selectedClip.id, {
                    filters: { ...selectedClip.filters, vignette: parseInt(e.target.value) },
                  })
                }
                className="w-full h-1 accent-rose-500 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* 4. TEXT & CAPTION PROPERTIES */}
        {isText && selectedClip.textData && (
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Text & Typography
            </span>

            {/* Text input */}
            <div>
              <span className="text-[10px] text-zinc-400 block mb-1">Text Content</span>
              <textarea
                rows={2}
                value={selectedClip.textData.text}
                onChange={(e) =>
                  onUpdateClip(selectedClip.id, {
                    textData: { ...selectedClip.textData!, text: e.target.value },
                  })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-xs text-zinc-200 outline-none resize-none"
              />
            </div>

            {/* Font Family */}
            <div>
              <span className="text-[10px] text-zinc-400 block mb-1">Font Family</span>
              <select
                value={selectedClip.textData.fontFamily}
                onChange={(e) =>
                  onUpdateClip(selectedClip.id, {
                    textData: { ...selectedClip.textData!, fontFamily: e.target.value },
                  })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1.5 text-xs text-zinc-200 outline-none cursor-pointer"
              >
                <option value="Montserrat">Montserrat (Modern Clean)</option>
                <option value="Bebas Neue">Bebas Neue (Bold Display)</option>
                <option value="Playfair Display">Playfair Display (Serif Elegance)</option>
                <option value="Syne">Syne (Ultra Geometric)</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                <option value="Cinzel">Cinzel (Epic Classical)</option>
                <option value="Newsreader">Newsreader (Editorial)</option>
              </select>
            </div>

            {/* Font Size & Alignment */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-zinc-400 block mb-1">Font Size</span>
                <input
                  type="number"
                  min="12"
                  max="120"
                  value={selectedClip.textData.fontSize}
                  onChange={(e) =>
                    onUpdateClip(selectedClip.id, {
                      textData: {
                        ...selectedClip.textData!,
                        fontSize: parseInt(e.target.value) || 24,
                      },
                    })
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 outline-none"
                />
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 block mb-1">Alignment</span>
                <div className="flex border border-zinc-700 rounded overflow-hidden">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() =>
                        onUpdateClip(selectedClip.id, {
                          textData: { ...selectedClip.textData!, align },
                        })
                      }
                      className={`flex-1 py-1 flex items-center justify-center transition-colors cursor-pointer ${
                        selectedClip.textData?.align === align
                          ? 'bg-rose-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {align === 'left' ? (
                        <AlignLeft size={13} />
                      ) : align === 'center' ? (
                        <AlignCenter size={13} />
                      ) : (
                        <AlignRight size={13} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-zinc-400 block mb-1">Text Color</span>
                <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded p-1">
                  <input
                    type="color"
                    value={selectedClip.textData.color || '#ffffff'}
                    onChange={(e) =>
                      onUpdateClip(selectedClip.id, {
                        textData: { ...selectedClip.textData!, color: e.target.value },
                      })
                    }
                    className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-zinc-300">
                    {selectedClip.textData.color}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 block mb-1">Box Color</span>
                <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded p-1">
                  <input
                    type="color"
                    value={
                      selectedClip.textData.backgroundColor === 'transparent'
                        ? '#000000'
                        : selectedClip.textData.backgroundColor || '#000000'
                    }
                    onChange={(e) =>
                      onUpdateClip(selectedClip.id, {
                        textData: { ...selectedClip.textData!, backgroundColor: e.target.value },
                      })
                    }
                    className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                  />
                  <button
                    onClick={() =>
                      onUpdateClip(selectedClip.id, {
                        textData: {
                          ...selectedClip.textData!,
                          backgroundColor:
                            selectedClip.textData?.backgroundColor === 'transparent'
                              ? '#000000'
                              : 'transparent',
                        },
                      })
                    }
                    className="text-[9px] text-zinc-400 hover:text-white"
                  >
                    {selectedClip.textData.backgroundColor === 'transparent' ? 'Add Box' : 'Clear'}
                  </button>
                </div>
              </div>
            </div>

            {/* Animation type */}
            <div>
              <span className="text-[10px] text-zinc-400 block mb-1">Entrance Animation</span>
              <select
                value={selectedClip.textData.animation || 'none'}
                onChange={(e) =>
                  onUpdateClip(selectedClip.id, {
                    textData: {
                      ...selectedClip.textData!,
                      animation: e.target.value as 'none' | 'fade' | 'typewriter' | 'slide-up' | 'bounce',
                    },
                  })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1.5 text-xs text-zinc-200 outline-none cursor-pointer"
              >
                <option value="none">None (Static)</option>
                <option value="fade">Fade In</option>
                <option value="bounce">Bounce Pop</option>
                <option value="slide-up">Slide Up</option>
                <option value="typewriter">Typewriter</option>
              </select>
            </div>
          </div>
        )}

        {/* 5. STICKER PROPERTIES */}
        {isSticker && selectedClip.stickerData && (
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Sticker Size & Rotation
            </span>

            <div>
              <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                <span>Scale</span>
                <span>{((selectedClip.stickerData.scale || 1) * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.5"
                step="0.1"
                value={selectedClip.stickerData.scale || 1}
                onChange={(e) =>
                  onUpdateClip(selectedClip.id, {
                    stickerData: {
                      ...selectedClip.stickerData!,
                      scale: parseFloat(e.target.value),
                    },
                  })
                }
                className="w-full h-1 accent-rose-500 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
