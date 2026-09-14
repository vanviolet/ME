import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Canvas,
  FabricImage,
  Textbox,
  Rect,
  Circle,
  Triangle,
  Polygon,
  Path,
  Line,
  Shadow,
  FabricObject,
  PencilBrush,
} from 'fabric';
import jsPDF from 'jspdf';
import {
  ToolTab,
  ImageAdjustments,
  DEFAULT_ADJUSTMENTS,
  FilterPreset,
  PhotoTemplate,
  ExportSettings,
  TextPreset,
} from './types';
import { SAMPLE_TEMPLATES } from './templateData';
import {
  applyCustomControlStyles,
  applyImageAdjustments,
  createStarPoints,
  removeImageBackground,
  removeImageBackgroundAI,
} from './fabricUtils';
import { TopNavbar } from './TopNavbar';
import { LeftSidebar } from './LeftSidebar';
import { ContextToolbar } from './ContextToolbar';
import { TextPanel } from './SubPanels/TextPanel';
import { CropPanel } from './SubPanels/CropPanel';
import { AdjustPanel } from './SubPanels/AdjustPanel';
import { FilterPanel } from './SubPanels/FilterPanel';
import { EffectsPanel } from './SubPanels/EffectsPanel';
import { BgRemovalPanel } from './SubPanels/BgRemovalPanel';
import { ShapesPanel } from './SubPanels/ShapesPanel';
import { StickersPanel } from './SubPanels/StickersPanel';
import { DrawPanel } from './SubPanels/DrawPanel';
import { LayersPanel } from './SubPanels/LayersPanel';
import { ExportModal } from './ExportModal';
import { TemplatesModal } from './TemplatesModal';

interface SelectedTextState {
  fontFamily: string;
  fontSize: number;
  fontWeight: string | number;
  fontStyle: string;
  underline: boolean;
  linethrough: boolean;
  textAlign: string;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  backgroundColor: string;
  opacity: number;
  hasShadow: boolean;
  letterSpacing: number;
  lineHeight: number;
  paragraphSpacing: number;
  letterCase: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  listStyle: 'none' | 'disc' | 'decimal';
  verticalAlign: 'top' | 'middle' | 'bottom';
  frameBehavior: 'auto' | 'fixed';
  clipping: boolean;
  isLocked: boolean;
}

const DEFAULT_TEXT_STATE: SelectedTextState = {
  fontFamily: "'Archivo', sans-serif",
  fontSize: 140,
  fontWeight: '900',
  fontStyle: 'italic',
  underline: false,
  linethrough: false,
  textAlign: 'left',
  fillColor: '#ffffff',
  strokeColor: '#000000',
  strokeWidth: 0,
  backgroundColor: 'transparent',
  opacity: 1,
  hasShadow: true,
  letterSpacing: 120,
  lineHeight: 1,
  paragraphSpacing: 0,
  letterCase: 'uppercase',
  listStyle: 'none',
  verticalAlign: 'top',
  frameBehavior: 'fixed',
  clipping: true,
  isLocked: false,
};

export const PhotoEditor: React.FC = () => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Tool Tab & Sub-Panel
  const [activeTab, setActiveTab] = useState<ToolTab | null>('text');

  // Canvas Dimensions & Zoom
  const [canvasWidth, setCanvasWidth] = useState<number>(1200);
  const [canvasHeight, setCanvasHeight] = useState<number>(900);
  const [zoomLevel, setZoomLevel] = useState<number>(0.65);
  const [activeTemplate, setActiveTemplate] = useState<PhotoTemplate>(SAMPLE_TEMPLATES[0]);

  // Selected Object Properties
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const [selectedType, setSelectedType] = useState<'text' | 'image' | 'shape' | 'sticker' | null>('text');

  // Consolidated Text & Object State (prevents cascading re-renders)
  const [textState, setTextState] = useState<SelectedTextState>(DEFAULT_TEXT_STATE);

  // Shape state
  const [shapeFill, setShapeFill] = useState<string>('#8b5cf6');
  const [shapeStroke, setShapeStroke] = useState<string>('#ffffff');
  const [shapeStrokeWidth, setShapeStrokeWidth] = useState<number>(0);

  // Image Adjustments & Filter
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(DEFAULT_ADJUSTMENTS);
  const [activeFilterId, setActiveFilterId] = useState<string>('normal');
  const [bgRemovalProcessing, setBgRemovalProcessing] = useState<boolean>(false);
  const [bgRemovalStatus, setBgRemovalStatus] = useState<string>('');

  // Drawing mode
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [brushColor, setBrushColor] = useState<string>('#ffffff');
  const [brushWidth, setBrushWidth] = useState<number>(6);
  const [brushType, setBrushType] = useState<'pencil' | 'marker' | 'highlighter' | 'eraser'>('pencil');

  // Layers
  const [layers, setLayers] = useState<any[]>([]);

  // History for Undo/Redo
  const historyStackRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  const isHistoryAction = useRef<boolean>(false);
  const isInitializingRef = useRef<boolean>(false);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState<boolean>(false);
  const [exportPreviewUrl, setExportPreviewUrl] = useState<string | null>(null);

  // Update layers list from canvas objects
  const refreshLayers = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || isInitializingRef.current) return;
    const objs = canvas.getObjects();
    const list = objs.map((obj, i) => {
      let name = 'Object';
      const type = obj.type;
      if (type === 'textbox' || type === 'i-text' || type === 'text') {
        name = (obj as any).text ? `"${((obj as any).text || '').slice(0, 14)}..."` : 'Text';
      } else if (type === 'image') {
        name = i === 0 ? 'Background Photo' : 'Image Element';
      } else if (type === 'rect') {
        name = 'Rectangle Shape';
      } else if (type === 'circle') {
        name = 'Circle Shape';
      } else if (type === 'triangle') {
        name = 'Triangle Shape';
      } else if (type === 'polygon') {
        name = 'Star Shape';
      } else {
        name = type ? type.toUpperCase() : 'Graphic';
      }

      if (!(obj as any)._layerId) {
        (obj as any)._layerId = `layer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      }

      return {
        id: (obj as any)._layerId,
        name,
        type,
        visible: obj.visible !== false,
        locked: (obj as any).lockMovementX === true,
        object: obj,
      };
    });
    setLayers(list);
  }, []);

  // Save State to Undo History
  const saveStateToHistory = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || isHistoryAction.current || isInitializingRef.current) return;
    try {
      const json = JSON.stringify(canvas.toJSON());
      const newStack = historyStackRef.current.slice(0, historyIndexRef.current + 1);
      newStack.push(json);
      historyStackRef.current = newStack;
      historyIndexRef.current = newStack.length - 1;

      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < newStack.length - 1);
      refreshLayers();
    } catch (err) {
      console.error('History state save error:', err);
    }
  }, [refreshLayers]);

  // Sync state when selection changes
  const handleSelection = useCallback((obj: FabricObject | null) => {
    if (!obj) {
      setSelectedObject(null);
      setSelectedType(null);
      return;
    }

    setSelectedObject(obj);
    const type = obj.type;

    if (type === 'textbox' || type === 'i-text' || type === 'text') {
      setSelectedType('text');
      const textObj = obj as Textbox;
      setTextState((prev) => ({
        ...prev,
        fontFamily: textObj.fontFamily || "'Archivo', sans-serif",
        fontSize: textObj.fontSize || 48,
        fontWeight: textObj.fontWeight || 'normal',
        fontStyle: (textObj.fontStyle as any) || 'normal',
        underline: !!textObj.underline,
        linethrough: !!textObj.linethrough,
        textAlign: textObj.textAlign || 'left',
        fillColor: typeof textObj.fill === 'string' ? textObj.fill : '#ffffff',
        strokeColor: typeof textObj.stroke === 'string' ? textObj.stroke : '#000000',
        strokeWidth: textObj.strokeWidth || 0,
        backgroundColor: typeof textObj.backgroundColor === 'string' && textObj.backgroundColor ? textObj.backgroundColor : 'transparent',
        opacity: textObj.opacity ?? 1,
        hasShadow: !!textObj.shadow,
        letterSpacing: textObj.charSpacing || 0,
        lineHeight: textObj.lineHeight || 1,
        isLocked: textObj.lockMovementX === true,
      }));
    } else if (type === 'image') {
      setSelectedType('image');
    } else {
      setSelectedType('shape');
      setShapeFill(typeof obj.fill === 'string' ? obj.fill : '#8b5cf6');
      setShapeStroke(typeof obj.stroke === 'string' ? obj.stroke : '#ffffff');
      setShapeStrokeWidth(obj.strokeWidth || 0);
    }
  }, []);

  // Stable refs for event handlers inside Canvas
  const handleSelectionRef = useRef(handleSelection);
  handleSelectionRef.current = handleSelection;

  const saveStateRef = useRef(saveStateToHistory);
  saveStateRef.current = saveStateToHistory;

  const refreshLayersRef = useRef(refreshLayers);
  refreshLayersRef.current = refreshLayers;

  // Load a full template into the canvas
  const loadTemplate = useCallback(
    async (template: PhotoTemplate, targetCanvas?: Canvas) => {
      const canvas = targetCanvas || fabricRef.current;
      if (!canvas) return;

      isInitializingRef.current = true;
      canvas.clear();
      setCanvasWidth(template.width);
      setCanvasHeight(template.height);
      setActiveTemplate(template);

      // Reset history for fresh template
      historyStackRef.current = [];
      historyIndexRef.current = -1;

      // 1. Add background image
      if (template.backgroundImage) {
        try {
          const img = await FabricImage.fromURL(template.backgroundImage, {
            crossOrigin: 'anonymous',
          });
          img.set({
            left: 0,
            top: 0,
            originX: 'left',
            originY: 'top',
            selectable: true,
          });
          img.scaleToWidth(template.width);
          if (img.getScaledHeight() < template.height) {
            img.scaleToHeight(template.height);
          }
          applyCustomControlStyles(img);
          canvas.add(img);
          canvas.sendObjectToBack(img);
        } catch (err) {
          console.warn('Could not load template background image:', err);
        }
      }

      // 2. Add template overlay objects
      for (const obj of template.objects) {
        if (obj.type === 'text' && obj.text) {
          const textItem = new Textbox(obj.text, {
            left: obj.left,
            top: obj.top,
            fontFamily: obj.fontFamily || "'Archivo', sans-serif",
            fontSize: obj.fontSize || 48,
            fontWeight: obj.fontWeight || 'normal',
            fontStyle: (obj.fontStyle as any) || 'normal',
            fill: obj.fill || '#ffffff',
            textAlign: obj.textAlign || 'left',
            charSpacing: obj.letterSpacing || 0,
            opacity: obj.opacity ?? 1,
            shadow: obj.shadow ? new Shadow(obj.shadow) : undefined,
          });
          applyCustomControlStyles(textItem);
          canvas.add(textItem);
        }
      }

      isInitializingRef.current = false;
      canvas.renderAll();
      refreshLayersRef.current();

      // Auto select hero text
      const allObjs = canvas.getObjects();
      const heroText = allObjs.find((o) => (o as any).text === 'FASHION') || allObjs[1];
      if (heroText) {
        canvas.setActiveObject(heroText);
        handleSelectionRef.current(heroText);
      }

      saveStateRef.current();
    },
    []
  );

  // Initialize Fabric Canvas strictly ONCE on mount
  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new Canvas(canvasElRef.current, {
      width: 1200,
      height: 900,
      preserveObjectStacking: true,
      backgroundColor: '#09090b',
      selectionColor: 'rgba(168, 85, 247, 0.2)',
      selectionBorderColor: '#a855f7',
      selectionLineWidth: 1.5,
    });

    fabricRef.current = canvas;

    canvas.on('selection:created', (e) => {
      if (e.selected && e.selected[0]) handleSelectionRef.current(e.selected[0]);
    });
    canvas.on('selection:updated', (e) => {
      if (e.selected && e.selected[0]) handleSelectionRef.current(e.selected[0]);
    });
    canvas.on('selection:cleared', () => {
      handleSelectionRef.current(null);
    });

    canvas.on('object:modified', () => {
      saveStateRef.current();
      if (canvas.getActiveObject()) {
        handleSelectionRef.current(canvas.getActiveObject());
      }
    });

    loadTemplate(SAMPLE_TEMPLATES[0], canvas);

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [loadTemplate]);

  // Responsive Zoom & Scale Calculation (Debounced/Guarded to avoid loops)
  const autoFitZoom = useCallback(() => {
    if (!canvasContainerRef.current) return;
    const container = canvasContainerRef.current;
    const padding = 70;
    const availWidth = Math.max(300, container.clientWidth - padding);
    const availHeight = Math.max(300, container.clientHeight - padding);

    const scaleX = availWidth / canvasWidth;
    const scaleY = availHeight / canvasHeight;
    const fitScale = Math.min(scaleX, scaleY, 0.95);
    const targetZoom = Math.max(0.2, Number(fitScale.toFixed(2)));

    setZoomLevel((curr) => (Math.abs(curr - targetZoom) > 0.03 ? targetZoom : curr));
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    const handleResize = () => autoFitZoom();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [autoFitZoom]);

  // Apply Fabric Zoom & Dimensions whenever zoomLevel or canvas dimensions change
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setZoom(zoomLevel);
    canvas.setDimensions({
      width: Math.round(canvasWidth * zoomLevel),
      height: Math.round(canvasHeight * zoomLevel),
    });
    canvas.renderAll();
  }, [zoomLevel, canvasWidth, canvasHeight]);

  // Undo / Redo implementation
  const handleUndo = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || historyIndexRef.current <= 0) return;
    isHistoryAction.current = true;
    const prevIndex = historyIndexRef.current - 1;
    const json = historyStackRef.current[prevIndex];
    canvas.loadFromJSON(JSON.parse(json)).then(() => {
      canvas.renderAll();
      historyIndexRef.current = prevIndex;
      setCanUndo(prevIndex > 0);
      setCanRedo(prevIndex < historyStackRef.current.length - 1);
      refreshLayers();
      handleSelection(canvas.getActiveObject());
      isHistoryAction.current = false;
    });
  }, [handleSelection, refreshLayers]);

  const handleRedo = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || historyIndexRef.current >= historyStackRef.current.length - 1) return;
    isHistoryAction.current = true;
    const nextIndex = historyIndexRef.current + 1;
    const json = historyStackRef.current[nextIndex];
    canvas.loadFromJSON(JSON.parse(json)).then(() => {
      canvas.renderAll();
      historyIndexRef.current = nextIndex;
      setCanUndo(nextIndex > 0);
      setCanRedo(nextIndex < historyStackRef.current.length - 1);
      refreshLayers();
      handleSelection(canvas.getActiveObject());
      isHistoryAction.current = false;
    });
  }, [handleSelection, refreshLayers]);

  // Keyboard Shortcuts (Del, Backspace, Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const canvas = fabricRef.current;
      if (!canvas) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        const active = canvas.getActiveObject();
        if (active && !(active as any).isEditing) {
          canvas.remove(active);
          canvas.discardActiveObject();
          canvas.renderAll();
          saveStateToHistory();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, saveStateToHistory]);

  // Update Text Properties
  const updateTextProp = (prop: string, value: any) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject() as any;
    if (!active || !(active.type === 'textbox' || active.type === 'i-text' || active.type === 'text')) return;

    setTextState((prev) => ({
      ...prev,
      [prop === 'fill' ? 'fillColor' : prop === 'stroke' ? 'strokeColor' : prop === 'charSpacing' ? 'letterSpacing' : prop === 'textCase' ? 'letterCase' : prop]: value,
    }));

    if (prop === 'fontFamily') active.set({ fontFamily: value });
    else if (prop === 'fontSize') active.set({ fontSize: value });
    else if (prop === 'fontWeight') active.set({ fontWeight: value });
    else if (prop === 'fontStyle') active.set({ fontStyle: value });
    else if (prop === 'underline') active.set({ underline: value });
    else if (prop === 'linethrough') active.set({ linethrough: value });
    else if (prop === 'textAlign') active.set({ textAlign: value });
    else if (prop === 'fill') active.set({ fill: value });
    else if (prop === 'backgroundColor') active.set({ backgroundColor: value === 'transparent' ? '' : value });
    else if (prop === 'charSpacing') active.set({ charSpacing: value });
    else if (prop === 'lineHeight') active.set({ lineHeight: value });
    else if (prop === 'opacity') active.set({ opacity: value });
    else if (prop === 'shadow') active.set({ shadow: value ? new Shadow(value) : undefined });
    else if (prop === 'textCase') {
      const current = active.text || '';
      if (value === 'uppercase') active.set({ text: current.toUpperCase() });
      else if (value === 'lowercase') active.set({ text: current.toLowerCase() });
      else if (value === 'capitalize') {
        active.set({
          text: current.replace(/\b\w/g, (c: string) => c.toUpperCase()),
        });
      }
    }

    canvas.renderAll();
    saveStateToHistory();
  };

  // Update Shape Properties
  const updateShapeProp = (prop: string, value: any) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;

    if (prop === 'fill') {
      setShapeFill(value);
      active.set({ fill: value });
    } else if (prop === 'stroke') {
      setShapeStroke(value);
      active.set({ stroke: value });
    } else if (prop === 'strokeWidth') {
      setShapeStrokeWidth(value);
      active.set({ strokeWidth: value });
    } else if (prop === 'opacity') {
      active.set({ opacity: value });
    }

    canvas.renderAll();
    saveStateToHistory();
  };

  // Add Text Handlers
  const handleAddHeading = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const text = new Textbox('ADD HEADING', {
      left: canvasWidth / 2 - 150,
      top: canvasHeight / 2 - 40,
      fontFamily: "'Archivo', sans-serif",
      fontSize: 56,
      fontWeight: '800',
      fill: '#ffffff',
      charSpacing: 80,
    });
    applyCustomControlStyles(text);
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    saveStateToHistory();
  };

  const handleAddSubheading = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const text = new Textbox('Add a subheading here', {
      left: canvasWidth / 2 - 120,
      top: canvasHeight / 2,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: 28,
      fontWeight: '600',
      fill: '#e2e8f0',
    });
    applyCustomControlStyles(text);
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    saveStateToHistory();
  };

  const handleAddBodyText = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const text = new Textbox('Type your body paragraph text details here.', {
      left: canvasWidth / 2 - 100,
      top: canvasHeight / 2 + 40,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontSize: 18,
      fill: '#cbd5e1',
      width: 250,
    });
    applyCustomControlStyles(text);
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    saveStateToHistory();
  };

  const handleApplyTextPreset = (preset: TextPreset) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const text = new Textbox(preset.preview, {
      left: canvasWidth / 2 - 140,
      top: canvasHeight / 2 - 40,
      fontFamily: preset.fontFamily,
      fontSize: preset.fontSize,
      fontWeight: preset.fontWeight,
      fontStyle: (preset.fontStyle as any) || 'normal',
      fill: preset.fill,
      charSpacing: preset.letterSpacing,
      lineHeight: preset.lineHeight,
      shadow: preset.shadow ? new Shadow(preset.shadow) : undefined,
    });
    applyCustomControlStyles(text);
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    saveStateToHistory();
  };

  // Add Shapes
  const handleAddShape = (type: string, fill: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const center = { x: canvasWidth / 2, y: canvasHeight / 2 };
    let shape: FabricObject;

    if (type === 'rect') {
      shape = new Rect({
        left: center.x - 75,
        top: center.y - 50,
        width: 150,
        height: 100,
        fill,
        rx: 0,
        ry: 0,
      });
    } else if (type === 'rounded-rect') {
      shape = new Rect({
        left: center.x - 75,
        top: center.y - 50,
        width: 150,
        height: 100,
        fill,
        rx: 16,
        ry: 16,
      });
    } else if (type === 'circle') {
      shape = new Circle({
        left: center.x - 50,
        top: center.y - 50,
        radius: 50,
        fill,
      });
    } else if (type === 'triangle') {
      shape = new Triangle({
        left: center.x - 50,
        top: center.y - 50,
        width: 100,
        height: 100,
        fill,
      });
    } else if (type === 'star') {
      const points = createStarPoints(5, 60, 30);
      shape = new Polygon(points, {
        left: center.x - 60,
        top: center.y - 60,
        fill,
      });
    } else if (type === 'arrow') {
      shape = new Path(
        'M 0 30 L 60 30 L 60 10 L 100 45 L 60 80 L 60 60 L 0 60 Z',
        {
          left: center.x - 50,
          top: center.y - 45,
          fill,
        }
      );
    } else if (type === 'line') {
      shape = new Line([0, 0, 200, 0], {
        left: center.x - 100,
        top: center.y,
        stroke: fill || '#ffffff',
        strokeWidth: 4,
      });
    } else if (type === 'heart') {
      shape = new Path(
        'M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 Z',
        {
          left: center.x - 45,
          top: center.y - 45,
          fill,
          scaleX: 1.2,
          scaleY: 1.2,
        }
      );
    } else {
      shape = new Rect({
        left: center.x - 60,
        top: center.y - 40,
        width: 120,
        height: 80,
        fill,
        rx: 8,
        ry: 8,
      });
    }

    applyCustomControlStyles(shape);
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
    saveStateToHistory();
  };

  // Add Emoji / Sticker
  const handleAddEmojiSticker = (emoji: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const text = new Textbox(emoji, {
      left: canvasWidth / 2 - 30,
      top: canvasHeight / 2 - 30,
      fontSize: emoji.startsWith('[') ? 22 : 64,
      fontFamily: emoji.startsWith('[') ? "'JetBrains Mono', monospace" : 'sans-serif',
      fill: '#ffffff',
      backgroundColor: emoji.startsWith('[') ? '#ef4444' : '',
      padding: emoji.startsWith('[') ? 8 : 0,
    });
    applyCustomControlStyles(text);
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    saveStateToHistory();
  };

  // Helper to find target image (either selected image or first image in canvas)
  const getTargetImage = useCallback((): FabricImage | null => {
    const canvas = fabricRef.current;
    if (!canvas) return null;
    const active = canvas.getActiveObject();
    if (active && (active instanceof FabricImage || active.type === 'image')) {
      return active as FabricImage;
    }
    const allObjs = canvas.getObjects();
    const found = allObjs.find((o) => o instanceof FabricImage || o.type === 'image');
    return (found as FabricImage) || null;
  }, []);

  // Adjustments & Filters
  const handleAdjustmentChange = async (key: keyof ImageAdjustments, value: number) => {
    const nextAdjustments = { ...adjustments, [key]: value };
    setAdjustments(nextAdjustments);
    setActiveFilterId('custom');

    const canvas = fabricRef.current;
    if (!canvas) return;
    const targetImg = getTargetImage();
    if (targetImg) {
      await applyImageAdjustments(targetImg, nextAdjustments);
      canvas.requestRenderAll();
    }
  };

  const handleApplyFilterPreset = async (preset: FilterPreset) => {
    const next = { ...DEFAULT_ADJUSTMENTS, ...preset.adjustments };
    setAdjustments(next);
    setActiveFilterId(preset.id);

    const canvas = fabricRef.current;
    if (!canvas) return;
    const targetImg = getTargetImage();
    if (targetImg) {
      await applyImageAdjustments(targetImg, next);
      canvas.requestRenderAll();
      saveStateToHistory();
    }
  };

  const handleResetAdjustments = async () => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setActiveFilterId('normal');
    const canvas = fabricRef.current;
    if (!canvas) return;
    const targetImg = getTargetImage();
    if (targetImg) {
      await applyImageAdjustments(targetImg, DEFAULT_ADJUSTMENTS);
      canvas.requestRenderAll();
      saveStateToHistory();
    }
  };

  // Visual Effects
  const handleApplyEffect = (effectName: string, params: any) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    let target = canvas.getActiveObject();
    if (!target) {
      const objs = canvas.getObjects();
      target = objs.find((o) => o.type === 'textbox' || o.type === 'i-text') || objs[objs.length - 1] || null;
      if (target) {
        canvas.setActiveObject(target);
      }
    }

    if (!target) return;

    if (effectName === 'shadow') {
      target.set({
        shadow: new Shadow({
          color: params.color || 'rgba(0,0,0,0.6)',
          blur: params.blur ?? 20,
          offsetX: params.offsetX ?? 0,
          offsetY: params.offsetY ?? 8,
        }),
      });
      setTextState((prev) => ({ ...prev, hasShadow: true }));
    } else if (effectName === 'stroke' || effectName === 'outline') {
      target.set({
        stroke: params.color || '#ffffff',
        strokeWidth: params.width ?? 4,
      });
    } else if (effectName === 'glow') {
      target.set({
        shadow: new Shadow({
          color: params.color || '#a855f7',
          blur: params.blur ?? 25,
          offsetX: 0,
          offsetY: 0,
        }),
      });
    } else if (effectName === 'neon-cyan') {
      target.set({
        shadow: new Shadow({
          color: '#00f0ff',
          blur: 35,
          offsetX: 0,
          offsetY: 0,
        }),
        stroke: '#00f0ff',
        strokeWidth: 2,
        fill: '#ffffff',
      });
    } else if (effectName === 'neon-pink') {
      target.set({
        shadow: new Shadow({
          color: '#ff007f',
          blur: 35,
          offsetX: 0,
          offsetY: 0,
        }),
        stroke: '#ff007f',
        strokeWidth: 2,
        fill: '#ffffff',
      });
    } else if (effectName === 'soft-shadow') {
      target.set({
        shadow: new Shadow({
          color: 'rgba(0,0,0,0.55)',
          blur: 28,
          offsetX: 0,
          offsetY: 14,
        }),
      });
    } else if (effectName === 'vignette') {
      const existingVignette = canvas.getObjects().find((o) => (o as any)._isVignette);
      if (existingVignette) {
        canvas.remove(existingVignette);
      } else {
        const vignette = new Rect({
          left: 0,
          top: 0,
          width: canvasWidth,
          height: canvasHeight,
          fill: 'transparent',
          stroke: 'rgba(0,0,0,0.85)',
          strokeWidth: 80,
          selectable: false,
          evented: false,
          opacity: 0.75,
        });
        (vignette as any)._isVignette = true;
        canvas.add(vignette);
        canvas.bringObjectToFront(vignette);
      }
    }

    canvas.renderAll();
    saveStateToHistory();
  };

  const handleClearEffects = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const active = canvas.getActiveObject();
    if (active) {
      active.set({
        shadow: undefined,
        stroke: undefined,
        strokeWidth: 0,
      });
    } else {
      canvas.getObjects().forEach((obj) => {
        if ((obj as any)._isVignette) {
          canvas.remove(obj);
        } else {
          obj.set({
            shadow: undefined,
            stroke: undefined,
            strokeWidth: 0,
          });
        }
      });
    }

    setTextState((prev) => ({ ...prev, hasShadow: false }));
    canvas.renderAll();
    saveStateToHistory();
  };

  // Background Removal Tool (remove.bg AI Automatic & Chroma)
  const handleAutoRemoveBackgroundAI = async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const bgImage = getTargetImage();
    if (!bgImage) {
      alert('Please upload or select an image on the canvas first.');
      return;
    }

    setBgRemovalProcessing(true);
    setBgRemovalStatus('Analyzing image subject with AI...');
    try {
      const processedUrl = await removeImageBackgroundAI(bgImage, (status) => {
        setBgRemovalStatus(status);
      });
      const newImg = await FabricImage.fromURL(processedUrl);
      newImg.set({
        left: bgImage.left,
        top: bgImage.top,
        scaleX: bgImage.scaleX,
        scaleY: bgImage.scaleY,
        angle: bgImage.angle,
        originX: bgImage.originX,
        originY: bgImage.originY,
      });
      applyCustomControlStyles(newImg);
      canvas.remove(bgImage);
      canvas.add(newImg);
      canvas.sendObjectToBack(newImg);
      canvas.renderAll();
      saveStateToHistory();
    } catch (err) {
      console.error('AI BG Removal failed:', err);
    } finally {
      setBgRemovalProcessing(false);
      setBgRemovalStatus('');
    }
  };

  const handleRemoveBackground = async (tolerance: number, replaceColor: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const bgImage = getTargetImage();
    if (!bgImage) return;

    setBgRemovalProcessing(true);
    setBgRemovalStatus('Processing chroma eraser...');
    try {
      const processedUrl = await removeImageBackground(bgImage, tolerance, replaceColor);
      const newImg = await FabricImage.fromURL(processedUrl);
      newImg.set({
        left: bgImage.left,
        top: bgImage.top,
        scaleX: bgImage.scaleX,
        scaleY: bgImage.scaleY,
        angle: bgImage.angle,
        originX: bgImage.originX,
        originY: bgImage.originY,
      });
      applyCustomControlStyles(newImg);
      canvas.remove(bgImage);
      canvas.add(newImg);
      canvas.sendObjectToBack(newImg);
      canvas.renderAll();
      saveStateToHistory();
    } catch (err) {
      console.error('BG Removal failed:', err);
    } finally {
      setBgRemovalProcessing(false);
      setBgRemovalStatus('');
    }
  };

  const handleSetCanvasBg = (color: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.backgroundColor = color === 'transparent' ? 'transparent' : color;
    canvas.renderAll();
    saveStateToHistory();
  };

  // Freehand Drawing Mode
  const handleToggleDrawingMode = (enabled: boolean) => {
    setIsDrawingMode(enabled);
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.isDrawingMode = enabled;
    if (enabled) {
      canvas.freeDrawingBrush = new PencilBrush(canvas);
      canvas.freeDrawingBrush.color = brushColor;
      canvas.freeDrawingBrush.width = brushWidth;
    }
  };

  const handleSetBrushColor = (color: string) => {
    setBrushColor(color);
    const canvas = fabricRef.current;
    if (canvas && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color;
    }
  };

  const handleSetBrushWidth = (width: number) => {
    setBrushWidth(width);
    const canvas = fabricRef.current;
    if (canvas && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = width;
    }
  };

  // Crop & Transform Handlers
  const [currentAspect, setCurrentAspect] = useState<number | undefined>(4 / 3);

  const handleApplyCrop = (aspectRatio?: number, shape?: 'rect' | 'round') => {
    setCurrentAspect(aspectRatio);
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (!aspectRatio) {
      setCanvasWidth(1200);
      setCanvasHeight(900);
      canvas.clipPath = undefined;
      canvas.renderAll();
      saveStateToHistory();
      return;
    }

    let baseW = 1200;
    let baseH = Math.round(baseW / aspectRatio);
    if (baseH > 1400) {
      baseH = 1200;
      baseW = Math.round(baseH * aspectRatio);
    }
    if (baseW > 1600) {
      baseW = 1600;
      baseH = Math.round(baseW / aspectRatio);
    }

    setCanvasWidth(baseW);
    setCanvasHeight(baseH);

    if (shape === 'round') {
      const radius = Math.min(baseW, baseH) / 2;
      const clipCircle = new Circle({
        radius,
        left: baseW / 2,
        top: baseH / 2,
        originX: 'center',
        originY: 'center',
        absolutePositioned: true,
      });
      canvas.clipPath = clipCircle;
    } else {
      canvas.clipPath = undefined;
    }

    const bgImage = getTargetImage();
    if (bgImage) {
      const scaleX = baseW / (bgImage.width || baseW);
      const scaleY = baseH / (bgImage.height || baseH);
      const scale = Math.max(scaleX, scaleY);
      bgImage.set({
        scaleX: scale,
        scaleY: scale,
        left: (baseW - (bgImage.width || baseW) * scale) / 2,
        top: (baseH - (bgImage.height || baseH) * scale) / 2,
      });
    }

    canvas.renderAll();
    saveStateToHistory();
  };

  const handleResetCrop = () => {
    handleApplyCrop(undefined, 'rect');
  };

  const handleRotate = (angleDelta: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      active.rotate(((active.angle || 0) + angleDelta) % 360);
      canvas.renderAll();
      saveStateToHistory();
    } else {
      const bgImg = getTargetImage();
      if (bgImg) {
        bgImg.rotate(((bgImg.angle || 0) + angleDelta) % 360);
        canvas.renderAll();
        saveStateToHistory();
      }
    }
  };

  const handleFlipH = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      active.set('flipX', !active.flipX);
      canvas.renderAll();
      saveStateToHistory();
    } else {
      const bgImg = getTargetImage();
      if (bgImg) {
        bgImg.set('flipX', !bgImg.flipX);
        canvas.renderAll();
        saveStateToHistory();
      }
    }
  };

  const handleFlipV = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      active.set('flipY', !active.flipY);
      canvas.renderAll();
      saveStateToHistory();
    } else {
      const bgImg = getTargetImage();
      if (bgImg) {
        bgImg.set('flipY', !bgImg.flipY);
        canvas.renderAll();
        saveStateToHistory();
      }
    }
  };

  // Layer Actions
  const handleBringForward = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.bringObjectForward(active);
      canvas.renderAll();
      refreshLayers();
      saveStateToHistory();
    }
  };

  const handleSendBackward = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.sendObjectBackwards(active);
      canvas.renderAll();
      refreshLayers();
      saveStateToHistory();
    }
  };

  const handleDuplicate = async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;

    try {
      const cloned = await active.clone();
      cloned.set({
        left: (active.left || 0) + 24,
        top: (active.top || 0) + 24,
      });
      applyCustomControlStyles(cloned);
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      saveStateToHistory();
    } catch (err) {
      console.error('Clone failed:', err);
    }
  };

  const handleDelete = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (active) {
      canvas.remove(active);
      canvas.discardActiveObject();
      canvas.renderAll();
      saveStateToHistory();
    }
  };

  const handleToggleLock = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    const locked = !active.lockMovementX;
    active.set({
      lockMovementX: locked,
      lockMovementY: locked,
      lockRotation: locked,
      lockScalingX: locked,
      lockScalingY: locked,
    });
    setTextState((prev) => ({ ...prev, isLocked: locked }));
    canvas.renderAll();
    refreshLayers();
    saveStateToHistory();
  };

  // Upload user image
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (f) => {
      const dataUrl = f.target?.result as string;
      const canvas = fabricRef.current;
      if (!canvas) return;

      try {
        const img = await FabricImage.fromURL(dataUrl);
        img.scaleToWidth(Math.min(canvasWidth, 800));
        img.set({
          left: canvasWidth / 2 - img.getScaledWidth() / 2,
          top: canvasHeight / 2 - img.getScaledHeight() / 2,
        });
        applyCustomControlStyles(img);
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        saveStateToHistory();
      } catch (err) {
        console.error('Failed to add image to canvas:', err);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Open Export Dialog
  const handleOpenExport = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL({
        format: 'png',
        multiplier: 1,
      });
      setExportPreviewUrl(dataUrl);
      setIsExportOpen(true);
    } catch (err) {
      console.error('Export preview generation failed:', err);
    }
  };

  // Export File Download
  const handleExportDownload = async (settings: ExportSettings) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const fileName = `${settings.fileName}.${settings.format === 'jpeg' ? 'jpg' : settings.format}`;
    const scaleVal = settings.scale || 1;

    if (settings.format === 'pdf') {
      const dataUrl = canvas.toDataURL({
        format: 'png',
        multiplier: scaleVal,
      });
      const orientation = canvasWidth > canvasHeight ? 'landscape' : 'portrait';
      const pdf = new jsPDF({
        orientation,
        unit: 'px',
        format: [canvasWidth * scaleVal, canvasHeight * scaleVal],
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, canvasWidth * scaleVal, canvasHeight * scaleVal);
      pdf.save(fileName);
      return;
    }

    if (settings.format === 'svg') {
      const svgString = canvas.toSVG();
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }

    const dataUrl = canvas.toDataURL({
      format: settings.format === 'jpeg' ? 'jpeg' : settings.format === 'webp' ? 'webp' : 'png',
      quality: settings.quality,
      multiplier: scaleVal,
    });

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    link.click();
  };

  // Copy to Clipboard
  const handleExportClipboard = async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 2 });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      alert('Photo copied to clipboard as high-res PNG!');
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  // Copy Base64 String
  const handleExportBase64 = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 1 });
    navigator.clipboard.writeText(dataUrl);
    alert('Base64 Data URL copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-40 bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden select-none font-sans">
      {/* Hidden File Input for Image Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* 1. TOP MAIN STUDIO NAVBAR */}
      <TopNavbar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        zoomLevel={zoomLevel}
        onZoomIn={() => setZoomLevel((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
        onZoomOut={() => setZoomLevel((z) => Math.max(0.2, +(z - 0.1).toFixed(2)))}
        onZoomFit={autoFitZoom}
        onOpenExport={handleOpenExport}
        onUploadImage={handleUploadClick}
        onResetCanvas={() => loadTemplate(activeTemplate)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        activeTemplateName={activeTemplate.name}
      />

      {/* 2. MAIN STUDIO WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 2A. LEFT TOOLS BAR */}
        <LeftSidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab((curr) => (curr === tab ? null : tab))}
        />

        {/* 2B. SUB-PANEL DRAWER (Text, Crop, Shapes, Adjust, Filter, etc.) */}
        {activeTab === 'text' && (
          <TextPanel
            onAddHeading={handleAddHeading}
            onAddSubheading={handleAddSubheading}
            onAddBodyText={handleAddBodyText}
            onApplyPreset={handleApplyTextPreset}
            hasSelection={selectedType === 'text'}
            letterCase={textState.letterCase}
            letterSpacing={textState.letterSpacing}
            listStyle={textState.listStyle}
            underline={textState.underline}
            linethrough={textState.linethrough}
            verticalAlign={textState.verticalAlign}
            lineHeight={textState.lineHeight}
            paragraphSpacing={textState.paragraphSpacing}
            frameBehavior={textState.frameBehavior}
            clipping={textState.clipping}
            onUpdateProp={updateTextProp}
            onClose={() => setActiveTab(null)}
          />
        )}

        {activeTab === 'crop' && (
          <CropPanel
            currentAspect={currentAspect}
            onApplyCrop={handleApplyCrop}
            onRotate={handleRotate}
            onFlipH={handleFlipH}
            onFlipV={handleFlipV}
            onResetCrop={handleResetCrop}
          />
        )}

        {activeTab === 'adjust' && (
          <AdjustPanel
            adjustments={adjustments}
            onChangeAdjustment={handleAdjustmentChange}
            onResetAll={handleResetAdjustments}
          />
        )}

        {activeTab === 'filter' && (
          <FilterPanel
            activeFilterId={activeFilterId}
            onApplyFilter={handleApplyFilterPreset}
            onResetFilter={handleResetAdjustments}
          />
        )}

        {activeTab === 'effects' && (
          <EffectsPanel
            onApplyEffect={handleApplyEffect}
            onClearEffects={handleClearEffects}
          />
        )}

        {activeTab === 'bg-removal' && (
          <BgRemovalPanel
            onAutoRemoveAI={handleAutoRemoveBackgroundAI}
            onRemoveBackground={handleRemoveBackground}
            onSetBackgroundColor={handleSetCanvasBg}
            onSetTransparentBackground={() => handleSetCanvasBg('transparent')}
            isProcessing={bgRemovalProcessing}
            statusMessage={bgRemovalStatus}
          />
        )}

        {activeTab === 'shapes' && <ShapesPanel onAddShape={handleAddShape} />}

        {activeTab === 'stickers' && (
          <StickersPanel
            onAddEmojiSticker={handleAddEmojiSticker}
            onAddGraphicSticker={() => {}}
          />
        )}

        {activeTab === 'draw' && (
          <DrawPanel
            isDrawingMode={isDrawingMode}
            brushColor={brushColor}
            brushWidth={brushWidth}
            brushType={brushType}
            onToggleDrawingMode={handleToggleDrawingMode}
            onSetBrushColor={handleSetBrushColor}
            onSetBrushWidth={handleSetBrushWidth}
            onSetBrushType={(type) => {
              setBrushType(type);
              const canvas = fabricRef.current;
              if (!canvas) return;
              if (type === 'eraser') {
                canvas.freeDrawingBrush = new PencilBrush(canvas);
                canvas.freeDrawingBrush.color = '#09090b';
                canvas.freeDrawingBrush.width = brushWidth * 2;
              } else if (type === 'highlighter') {
                canvas.freeDrawingBrush = new PencilBrush(canvas);
                canvas.freeDrawingBrush.color = `${brushColor}55`;
                canvas.freeDrawingBrush.width = 24;
              } else {
                canvas.freeDrawingBrush = new PencilBrush(canvas);
                canvas.freeDrawingBrush.color = brushColor;
                canvas.freeDrawingBrush.width = brushWidth;
              }
            }}
            onClearDrawing={() => {
              const canvas = fabricRef.current;
              if (!canvas) return;
              const pathObjs = canvas.getObjects().filter((o) => o instanceof Path);
              pathObjs.forEach((p) => canvas.remove(p));
              canvas.renderAll();
              saveStateToHistory();
            }}
          />
        )}

        {activeTab === 'layers' && (
          <LayersPanel
            layers={layers}
            activeLayerId={(selectedObject as any)?._layerId || null}
            onSelectLayer={(l) => {
              const canvas = fabricRef.current;
              if (canvas) {
                canvas.setActiveObject(l.object);
                canvas.renderAll();
              }
            }}
            onToggleVisibility={(l) => {
              l.object.set({ visible: !l.object.visible });
              fabricRef.current?.renderAll();
              refreshLayers();
            }}
            onToggleLock={(l) => {
              const lock = !l.object.lockMovementX;
              l.object.set({
                lockMovementX: lock,
                lockMovementY: lock,
                lockRotation: lock,
                lockScalingX: lock,
                lockScalingY: lock,
              });
              fabricRef.current?.renderAll();
              refreshLayers();
            }}
            onMoveUp={(l) => {
              fabricRef.current?.bringObjectForward(l.object);
              fabricRef.current?.renderAll();
              refreshLayers();
            }}
            onMoveDown={(l) => {
              fabricRef.current?.sendObjectBackwards(l.object);
              fabricRef.current?.renderAll();
              refreshLayers();
            }}
            onDeleteLayer={(l) => {
              fabricRef.current?.remove(l.object);
              fabricRef.current?.renderAll();
              refreshLayers();
            }}
          />
        )}

        {/* 2C. CENTER CANVAS STAGE */}
        <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden relative">
          {/* FLOATING / TOP CONTEXT PROPERTY BAR */}
          <ContextToolbar
            selectedType={selectedType}
            fontFamily={textState.fontFamily}
            fontSize={textState.fontSize}
            fontWeight={textState.fontWeight}
            fontStyle={textState.fontStyle}
            underline={textState.underline}
            textAlign={textState.textAlign}
            fillColor={selectedType === 'shape' ? shapeFill : textState.fillColor}
            strokeColor={selectedType === 'shape' ? shapeStroke : textState.strokeColor}
            strokeWidth={selectedType === 'shape' ? shapeStrokeWidth : textState.strokeWidth}
            backgroundColor={textState.backgroundColor}
            opacity={textState.opacity}
            hasShadow={textState.hasShadow}
            isLocked={textState.isLocked}
            onUpdateTextProp={updateTextProp}
            onUpdateShapeProp={updateShapeProp}
            onBringForward={handleBringForward}
            onSendBackward={handleSendBackward}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onToggleLock={handleToggleLock}
            onFlipH={handleFlipH}
            onFlipV={handleFlipV}
            onOpenAdvanced={() => setActiveTab('text')}
          />

          {/* MAIN INTERACTIVE CANVAS VIEWPORT */}
          <div
            ref={canvasContainerRef}
            className="flex-1 overflow-auto flex items-center justify-center p-8 bg-zinc-950 custom-scrollbar relative"
            style={{
              backgroundImage:
                'radial-gradient(circle, #27272a 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          >
            {/* Centered Canvas Container with exact Dimensions */}
            <div
              className="relative shadow-2xl rounded-sm border border-zinc-800 bg-zinc-900"
              style={{
                width: Math.round(canvasWidth * zoomLevel),
                height: Math.round(canvasHeight * zoomLevel),
              }}
            >
              <canvas ref={canvasElRef} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. EXPORT DIALOG MODAL */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        baseWidth={canvasWidth}
        baseHeight={canvasHeight}
        previewUrl={exportPreviewUrl}
        onExportDownload={handleExportDownload}
        onExportClipboard={handleExportClipboard}
        onExportBase64={handleExportBase64}
      />

      {/* 4. TEMPLATES PICKER MODAL */}
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={(tmpl) => loadTemplate(tmpl)}
      />
    </div>
  );
};
