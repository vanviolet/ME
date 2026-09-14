import React from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Type,
  Image as ImageIcon,
  Square,
  Smile,
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
}) => {
  const getIconForType = (type: string) => {
    switch (type) {
      case 'i-text':
      case 'textbox':
      case 'text':
        return <Type size={14} className="text-purple-400" />;
      case 'image':
        return <ImageIcon size={14} className="text-blue-400" />;
      case 'rect':
      case 'circle':
      case 'triangle':
      case 'polygon':
        return <Square size={14} className="text-amber-400" />;
      default:
        return <Smile size={14} className="text-pink-400" />;
    }
  };

  return (
    <div className="w-80 sm:w-88 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full shrink-0 z-10 select-none overflow-y-auto custom-scrollbar">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-purple-400" />
          <h2 className="text-sm font-bold text-zinc-100">Layer Stack ({layers.length})</h2>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {layers.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-500">
            No objects on canvas yet.
          </div>
        ) : (
          [...layers].reverse().map((layer, index) => {
            const isSelected = activeLayerId === layer.id;

            return (
              <div
                key={layer.id}
                onClick={() => onSelectLayer(layer)}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-600/20 text-white shadow-xs ring-1 ring-purple-500'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                    {getIconForType(layer.type)}
                  </div>
                  <span className="text-xs font-semibold truncate font-sans">
                    {layer.name}
                  </span>
                </div>

                {/* Layer Quick Actions */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onMoveUp(layer)}
                    className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    title="Bring Forward"
                  >
                    <ArrowUp size={12} />
                  </button>

                  <button
                    onClick={() => onMoveDown(layer)}
                    className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    title="Send Backward"
                  >
                    <ArrowDown size={12} />
                  </button>

                  <button
                    onClick={() => onToggleLock(layer)}
                    className={`p-1 rounded transition-colors ${
                      layer.locked ? 'text-amber-400' : 'text-zinc-500 hover:text-white'
                    }`}
                    title={layer.locked ? 'Unlock' : 'Lock'}
                  >
                    {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                  </button>

                  <button
                    onClick={() => onToggleVisibility(layer)}
                    className={`p-1 rounded transition-colors ${
                      !layer.visible ? 'text-zinc-600' : 'text-zinc-400 hover:text-white'
                    }`}
                    title={layer.visible ? 'Hide' : 'Show'}
                  >
                    {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>

                  <button
                    onClick={() => onDeleteLayer(layer)}
                    className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                    title="Delete Layer"
                  >
                    <Trash2 size={12} />
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
