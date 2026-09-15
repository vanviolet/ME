import React from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  ArrowUp,
  ArrowDown,
  Type,
  Image as ImageIcon,
  Square,
  Smile,
  X,
} from 'lucide-react';
import { FabricObject } from 'fabric';

interface LayerItem {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  object: FabricObject;
}

interface LayersPanelProps {
  layers: LayerItem[];
  activeLayerId: string | null;
  onSelectLayer: (layer: LayerItem) => void;
  onToggleVisibility: (layer: LayerItem) => void;
  onToggleLock: (layer: LayerItem) => void;
  onMoveUp: (layer: LayerItem) => void;
  onMoveDown: (layer: LayerItem) => void;
  onDeleteLayer: (layer: LayerItem) => void;
  onClose?: () => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  activeLayerId,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onMoveUp,
  onMoveDown,
  onDeleteLayer,
  onClose,
}) => {
  const getIcon = (type: string) => {
    if (type === 'textbox' || type === 'i-text' || type === 'text') return <Type size={14} className="text-purple-400" />;
    if (type === 'image') return <ImageIcon size={14} className="text-blue-400" />;
    if (type === 'rect' || type === 'circle' || type === 'triangle' || type === 'polygon') return <Square size={14} className="text-emerald-400" />;
    return <Smile size={14} className="text-amber-400" />;
  };

  return (
    <div className="w-full md:w-80 lg:w-88 bg-zinc-900 md:border-r border-zinc-800 flex flex-col h-full shrink-0 z-10 select-none overflow-y-auto custom-scrollbar">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-purple-400" />
          <h2 className="text-sm font-bold text-zinc-100">Canvas Layers</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">{layers.length} items</span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Close panel"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="p-3 space-y-1.5 flex-1">
        {layers.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            No objects on canvas yet.
          </div>
        ) : (
          [...layers].reverse().map((layer) => {
            const isSelected = layer.id === activeLayerId;
            return (
              <div
                key={layer.id}
                onClick={() => onSelectLayer(layer)}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600/20 border-purple-500 shadow-md ring-1 ring-purple-500/40'
                    : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0">
                    {getIcon(layer.type)}
                  </div>
                  <span className="text-xs font-semibold text-zinc-200 truncate">
                    {layer.name}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveUp(layer);
                    }}
                    title="Bring forward"
                    className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveDown(layer);
                    }}
                    title="Send backward"
                    className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(layer);
                    }}
                    title={layer.visible ? 'Hide' : 'Show'}
                    className={`p-1 rounded-md transition-colors ${
                      layer.visible ? 'text-zinc-400 hover:text-white' : 'text-zinc-400'
                    }`}
                  >
                    {layer.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLock(layer);
                    }}
                    title={layer.locked ? 'Unlock' : 'Lock'}
                    className={`p-1 rounded-md transition-colors ${
                      layer.locked ? 'text-amber-400' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {layer.locked ? <Lock size={13} /> : <Unlock size={13} />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteLayer(layer);
                    }}
                    title="Delete layer"
                    className="p-1 rounded-md text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
