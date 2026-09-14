import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Canvas,
  FabricImage,
  IText,
  Textbox,
  Rect,
  Circle,
  Triangle,
  Polygon,
  Path,
  Line,
  Shadow,
  Point,
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

export const PhotoEditor: React.FC = () => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Tool Tab & Sub-Panel
  const [activeTab, setActiveTab] = useState<ToolTab | null>('text');

  // Canvas Dimensions
  const [canvasWidth, setCanvasWidth] = useState<number>(1200);
  const [canvasHeight, setCanvasHeight] = useState<number>(900);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeTemplate, setActiveTemplate] = useState<PhotoTemplate>(SAMPLE_TEMPLATES[0]);

  // Selected Object Properties
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const [selectedType, setSelectedType] = useState<'text' | 'image' | 'shape' | 'sticker' | null>('text');

  // Text Advanced State
  const [fontFamily, setFontFamily] = useState<string>("'Archivo', sans-serif");
  const [fontSize, setFontSize] = useState<number>(57);
  const [fontWeight, setFontWeight] = useState<string | number>('900');
  const [fontStyle, setFontStyle] = useState<string>('italic');
  const [underline, setUnderline] = useState<boolean>(false);
  const [linethrough, setLinethrough] = useState<boolean>(false);
  const [textAlign, setTextAlign] = useState<string>('left');
  const [fillColor, setFillColor] = useState<string>('#ffffff');
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(0);
  const [backgroundColor, setBackgroundColor] = useState<string>('transparent');
  const [opacity, setOpacity] = useState<number>(1);
  const [hasShadow, setHasShadow] = useState<boolean>(false);
  const [letterSpacing, setLetterSpacing] = useState<number>(120);
  const [lineHeight, setLineHeight] = useState<number>(1);
  const [paragraphSpacing, setParagraphSpacing] = useState<number>(0);
  const [letterCase, setLetterCase] = useState<'none' | 'uppercase' | 'lowercase' | 'capitalize'>('uppercase');
  const [listStyle, setListStyle] = useState<'none' | 'disc' | 'decimal'>('none');
  const [verticalAlign, setVerticalAlign] = useState<'top' | 'middle' | 'bottom'>('top');
  const [frameBehavior, setFrameBehavior] = useState<'auto' | 'fixed'>('fixed');
  const [clipping, setClipping] = useState<boolean>(true);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Image Adjustments & Filter
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(DEFAULT_ADJUSTMENTS);
  const [activeFilterId, setActiveFilterId] = useState<string>('normal');
  const [bgRemovalProcessing, setBgRemovalProcessing] = useState<boolean>(false);

  // Drawing mode
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [brushColor, setBrushColor] = useState<string>('#ffffff');
  const [brushWidth, setBrushWidth] = useState<number>(6);
  const [brushType, setBrushType] = useState<'pencil' | 'marker' | 'highlighter' | 'eraser'>('pencil');

  // Layers
  const [layers, setLayers] = useState<any[]>([]);

  // History for Undo/Redo
  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const isHistoryAction = useRef<boolean>(false);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState<boolean>(false);
  const [exportPreviewUrl, setExportPreviewUrl] = useState<string | null>(null);

  // Update layers list from canvas objects
  const refreshLayers = useCallback((canvas: Canvas) => {
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

      return {
        id: (obj as any).id || `layer-${i}-${Date.now()}`,
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
    if (!canvas || isHistoryAction.current) return;
    try {
      const json = JSON.stringify(canvas.toJSON());
      setHistoryStack((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        return [...next, json];
      });
      setHistoryIndex((prev) => prev + 1);
      refreshLayers(canvas);
    } catch (err) {
      console.error('History state save error:', err);
    }
  }, [historyIndex, refreshLayers]);

  // Sync state when selection changes
  const handleSelection = useCallback((obj: FabricObject | null) => {
    if (!obj) {
      setSelectedObject(null);
      setSelectedType(null);
      return;
    }

    setSelectedObject(obj);
    setIsLocked(obj.lockMovementX === true);
    setOpacity(obj.opacity ?? 1);

    const type = obj.type;
    if (type === 'textbox' || type === 'i-text' || type === 'text') {
      setSelectedType('text');
      const textObj = obj as Textbox;
      setFontFamily(textObj.fontFamily || "'Archivo', sans-serif");
      setFontSize(textObj.fontSize || 48);
      setFontWeight(textObj.fontWeight || 'normal');
      setFontStyle(textObj.fontStyle || 'normal');
      setUnderline(!!textObj.underline);
      setLinethrough(!!textObj.linethrough);
      setTextAlign(textObj.textAlign || 'left');
      setFillColor(typeof textObj.fill === 'string' ? textObj.fill : '#ffffff');
      setStrokeColor(typeof textObj.stroke === 'string' ? textObj.stroke : '#000000');
      setStrokeWidth(textObj.strokeWidth || 0);
      setBackgroundColor(typeof textObj.backgroundColor === 'string' ? textObj.backgroundColor : 'transparent');
      setLetterSpacing(textObj.charSpacing || 0);
      setLineHeight(textObj.lineHeight || 1);
      setHasShadow(!!textObj.shadow);
    } else if (type === 'image') {
      setSelectedType('image');
    } else {
      setSelectedType('shape');
      setFillColor(typeof obj.fill === 'string' ? obj.fill : '#8b5cf6');
      setStrokeColor(typeof obj.stroke === 'string' ? obj.stroke : '#ffffff');
      setStrokeWidth(obj.strokeWidth || 0);
      setHasShadow(!!obj.shadow);
    }
  }, []);

  // Load a full template into the canvas
  const loadTemplate = useCallback(
    async (template: PhotoTemplate, targetCanvas?: Canvas) => {
      const canvas = targetCanvas || fabricRef.current;
      if (!canvas) return;

      canvas.clear();
      setCanvasWidth(template.width);
      setCanvasHeight(template.height);
      setActiveTemplate(template);

      canvas.setDimensions({ width: template.width, height: template.height });

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
          // Scale image to fit template dimensions exactly
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

      // 2. Add template overlay objects (Text, Badges, etc.)
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

      canvas.renderAll();
      refreshLayers(canvas);

      // Auto select the main hero text like in screenshot
      const allObjs = canvas.getObjects();
      const heroText = allObjs.find((o) => (o as any).text === 'FASHION') || allObjs[1];
      if (heroText) {
        canvas.setActiveObject(heroText);
        handleSelection(heroText);
      }

      saveStateToHistory();
    },
    [handleSelection, refreshLayers, saveStateToHistory]
  );

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!canvasElRef.current || fabricRef.current) return;

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

    // Selection listeners
    canvas.on('selection:created', (e) => {
      if (e.selected && e.selected[0]) handleSelection(e.selected[0]);
    });
    canvas.on('selection:updated', (e) => {
      if (e.selected && e.selected[0]) handleSelection(e.selected[0]);
    });
    canvas.on('selection:cleared', () => {
      handleSelection(null);
    });

    // Modification listeners
    canvas.on('object:modified', () => {
      saveStateToHistory();
      if (canvas.getActiveObject()) {
        handleSelection(canvas.getActiveObject());
      }
    });

    canvas.on('object:added', () => refreshLayers(canvas));
    canvas.on('object:removed', () => refreshLayers(canvas));

    // Load initial Fashion Editorial Template matching the user screenshot!
    loadTemplate(SAMPLE_TEMPLATES[0], canvas);

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [handleSelection, loadTemplate, refreshLayers, saveStateToHistory]);

  // Responsive Zoom & Scale Calculation
  const autoFitZoom = useCallback(() => {
    if (!canvasContainerRef.current) return;
    const container = canvasContainerRef.current;
    const padding = 60;
    const availWidth = container.clientWidth - padding;
    const availHeight = container.clientHeight - padding;

    const scaleX = availWidth / canvasWidth;
    const scaleY = availHeight / canvasHeight;
    const fitScale = Math.min(scaleX, scaleY, 1);
    setZoomLevel(Math.max(0.2, fitScale));
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    autoFitZoom();
    const handleResize = () => autoFitZoom();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [autoFitZoom]);

  // Undo / Redo implementation
  const handleUndo = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || historyIndex <= 0) return;
    isHistoryAction.current = true;
    const prevIndex = historyIndex - 1;
    const json = historyStack[prevIndex];
    canvas.loadFromJSON(JSON.parse(json)).then(() => {
      canvas.renderAll();
      setHistoryIndex(prevIndex);
      refreshLayers(canvas);
      handleSelection(canvas.getActiveObject());
      isHistoryAction.current = false;
    });
  }, [historyIndex, historyStack, handleSelection, refreshLayers]);

  const handleRedo = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || historyIndex >= historyStack.length - 1) return;
    isHistoryAction.current = true;
    const nextIndex = historyIndex + 1;
    const json = historyStack[nextIndex];
    canvas.loadFromJSON(JSON.parse(json)).then(() => {
      canvas.renderAll();
      setHistoryIndex(nextIndex);
      refreshLayers(canvas);
      handleSelection(canvas.getActiveObject());
      isHistoryAction.current = false;
    });
  }, [historyIndex, historyStack, handleSelection, refreshLayers]);

  // Keyboard Shortcuts (Del, Backspace, Ctrl+Z, Ctrl+Y, Ctrl+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
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
          canvas.discardActiveGroup ? (canvas as any).discardActiveGroup() : canvas.discardActiveObject();
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

    if (prop === 'fontFamily') {
      setFontFamily(value);
      active.set({ fontFamily: value });
    } else if (prop === 'fontSize') {
      setFontSize(value);
      active.set({ fontSize: value });
    } else if (prop === 'fontWeight') {
      setFontWeight(value);
      active.set({ fontWeight: value });
    } else if (prop === 'fontStyle') {
      setFontStyle(value);
      active.set({ fontStyle: value });
    } else if (prop === 'underline') {
      setUnderline(value);
      active.set({ underline: value });
    } else if (prop === 'linethrough') {
      setLinethrough(value);
      active.set({ linethrough: value });
    } else if (prop === 'textAlign') {
      setTextAlign(value);
      active.set({ textAlign: value });
    } else if (prop === 'fill') {
      setFillColor(value);
      active.set({ fill: value });
    } else if (prop === 'backgroundColor') {
      setBackgroundColor(value);
      active.set({ backgroundColor: value === 'transparent' ? '' : value });
    } else if (prop === 'charSpacing') {
      setLetterSpacing(value);
      active.set({ charSpacing: value });
    } else if (prop === 'lineHeight') {
      setLineHeight(value);
      active.set({ lineHeight: value });
    } else if (prop === 'opacity') {
      setOpacity(value);
      active.set({ opacity: value });
    } else if (prop === 'shadow') {
      setHasShadow(!!value);
      active.set({ shadow: value ? new Shadow(value) : undefined });
    } else if (prop === 'textCase') {
      setLetterCase(value);
      const current = active.text || '';
      if (value === 'uppercase') active.set({ text: current.toUpperCase() });
      else if (value === 'lowercase') active.set({ text: current.toLowerCase() });
      else if (value === 'capitalize') {
        active.set({
          text: current.replace(/\b\w/g, (c: string) => c.toUpperCase()),
        });
      }
    } else if (prop === 'paragraphSpacing') {
      setParagraphSpacing(value);
    } else if (prop === 'clipping') {
      setClipping(value);
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
      setFillColor(value);
      active.set({ fill: value });
    } else if (prop === 'stroke') {
      setStrokeColor(value);
      active.set({ stroke: value });
    } else if (prop === 'strokeWidth') {
      setStrokeWidth(value);
      active.set({ strokeWidth: value });
    } else if (prop === 'opacity') {
      setOpacity(value);
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
      left: canvas.width / 2 - 150,
      top: canvas.height / 2 - 40,
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
      left: canvas.width / 2 - 120,
      top: canvas.height / 2,
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
      left: canvas.width / 2 - 100,
      top: canvas.height / 2 + 40,
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
      left: canvas.width / 2 - 140,
      top: canvas.height / 2 - 40,
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
    const center = { x: canvas.width / 2, y: canvas.height / 2 };
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
      left: canvas.width / 2 - 30,
      top: canvas.height / 2 - 30,
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

  // Adjustments & Filters
  const handleAdjustmentChange = async (key: keyof ImageAdjustments, value: number) => {
    const nextAdjustments = { ...adjustments, [key]: value };
    setAdjustments(nextAdjustments);
    setActiveFilterId('custom');

    const canvas = fabricRef.current;
    if (!canvas) return;
    const bgImage = canvas.getObjects().find((o) => o instanceof FabricImage) as FabricImage;
    if (bgImage) {
      await applyImageAdjustments(bgImage, nextAdjustments);
      canvas.renderAll();
    }
  };

  const handleApplyFilterPreset = async (preset: FilterPreset) => {
    const next = { ...DEFAULT_ADJUSTMENTS, ...preset.adjustments };
    setAdjustments(next);
    setActiveFilterId(preset.id);

    const canvas = fabricRef.current;
    if (!canvas) return;
    const bgImage = canvas.getObjects().find((o) => o instanceof FabricImage) as FabricImage;
    if (bgImage) {
      await applyImageAdjustments(bgImage, next);
      canvas.renderAll();
      saveStateToHistory();
    }
  };

  const handleResetAdjustments = async () => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setActiveFilterId('normal');
    const canvas = fabricRef.current;
    if (!canvas) return;
    const bgImage = canvas.getObjects().find((o) => o instanceof FabricImage) as FabricImage;
    if (bgImage) {
      await applyImageAdjustments(bgImage, DEFAULT_ADJUSTMENTS);
      canvas.renderAll();
      saveStateToHistory();
    }
  };

  // Visual Effects
  const handleApplyEffect = (effectName: string, params: any) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;

    if (effectName === 'shadow') {
      active.set({
        shadow: new Shadow({
          color: params.color,
          blur: params.blur,
          offsetX: params.offsetX,
          offsetY: params.offsetY,
        }),
      });
      setHasShadow(true);
    } else if (effectName === 'stroke') {
      active.set({
        stroke: params.color,
        strokeWidth: params.width,
      });
    } else if (effectName === 'neon-cyan') {
      active.set({
        fill: '#00f0ff',
        shadow: new Shadow({ color: '#00f0ff', blur: 30, offsetX: 0, offsetY: 0 }),
      });
    } else if (effectName === 'neon-pink') {
      active.set({
        fill: '#ff007f',
        shadow: new Shadow({ color: '#ff007f', blur: 30, offsetX: 0, offsetY: 0 }),
      });
    } else if (effectName === 'soft-shadow') {
      active.set({
        shadow: new Shadow({ color: 'rgba(0,0,0,0.4)', blur: 25, offsetX: 0, offsetY: 12 }),
      });
    }

    canvas.renderAll();
    saveStateToHistory();
  };

  // Background Removal
  const handleRemoveBackground = async (tolerance: number, keyColorHex: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const bgImage = canvas.getObjects().find((o) => o instanceof FabricImage) as FabricImage;
    if (!bgImage) return;

    setBgRemovalProcessing(true);
    try {
      // Parse Hex
      const r = parseInt(keyColorHex.slice(1, 3), 16) || 255;
      const g = parseInt(keyColorHex.slice(3, 5), 16) || 255;
      const b = parseInt(keyColorHex.slice(5, 7), 16) || 255;

      const element = (bgImage as any)._element as HTMLImageElement;
      if (element) {
        const transparentUrl = await removeImageBackground(element, { r, g, b }, tolerance);
        const newImg = await FabricImage.fromURL(transparentUrl, { crossOrigin: 'anonymous' });
        newImg.set({
          left: bgImage.left,
          top: bgImage.top,
          scaleX: bgImage.scaleX,
          scaleY: bgImage.scaleY,
        });
        applyCustomControlStyles(newImg);
        const idx = canvas.getObjects().indexOf(bgImage);
        canvas.remove(bgImage);
        canvas.insertAt(idx, newImg);
        canvas.renderAll();
        saveStateToHistory();
      }
    } catch (err) {
      console.error('BG removal failed:', err);
    } finally {
      setBgRemovalProcessing(false);
    }
  };

  // Drawing Mode
  const handleToggleDrawingMode = (enabled: boolean) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.isDrawingMode = enabled;
    setIsDrawingMode(enabled);
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

  // Flip & Arrange
  const handleFlipH = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    active.set({ flipX: !active.flipX });
    canvas.renderAll();
    saveStateToHistory();
  };

  const handleFlipV = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    active.set({ flipY: !active.flipY });
    canvas.renderAll();
    saveStateToHistory();
  };

  const handleBringForward = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    canvas.bringObjectForward(active);
    canvas.renderAll();
    refreshLayers(canvas);
    saveStateToHistory();
  };

  const handleSendBackward = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    canvas.sendObjectBackwards(active);
    canvas.renderAll();
    refreshLayers(canvas);
    saveStateToHistory();
  };

  const handleDuplicate = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    active.clone().then((cloned) => {
      cloned.set({
        left: (active.left || 0) + 20,
        top: (active.top || 0) + 20,
      });
      applyCustomControlStyles(cloned);
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      saveStateToHistory();
    });
  };

  const handleDelete = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    canvas.remove(active);
    canvas.renderAll();
    saveStateToHistory();
  };

  const handleToggleLock = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;
    const lock = !active.lockMovementX;
    active.set({
      lockMovementX: lock,
      lockMovementY: lock,
      lockRotation: lock,
      lockScalingX: lock,
      lockScalingY: lock,
    });
    setIsLocked(lock);
    canvas.renderAll();
    saveStateToHistory();
  };

  // Upload Photo File
  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async () => {
        const url = reader.result as string;
        const canvas = fabricRef.current;
        if (!canvas) return;
        try {
          const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
          img.set({
            left: 50,
            top: 50,
          });
          img.scaleToWidth(Math.min(canvas.width * 0.8, 600));
          applyCustomControlStyles(img);
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
          saveStateToHistory();
        } catch (err) {
          console.error(err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Export handlers
  const handleOpenExport = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 0.5 });
      setExportPreviewUrl(dataUrl);
    } catch (e) {
      console.error(e);
    }
    setIsExportOpen(true);
  };

  const handleExportDownload = async (settings: ExportSettings) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (settings.format === 'pdf') {
      const imgData = canvas.toDataURL({
        format: 'jpeg',
        multiplier: settings.scale,
        quality: settings.quality,
      });
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width * settings.scale, canvas.height * settings.scale],
      });
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width * settings.scale, canvas.height * settings.scale);
      pdf.save(`${settings.fileName}.pdf`);
      return;
    }

    if (settings.format === 'svg') {
      const svgStr = canvas.toSVG();
      const blob = new Blob([svgStr], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${settings.fileName}.svg`;
      link.href = url;
      link.click();
      return;
    }

    const dataUrl = canvas.toDataURL({
      format: settings.format === 'jpeg' ? 'jpeg' : settings.format === 'webp' ? 'webp' : 'png',
      multiplier: settings.scale,
      quality: settings.quality,
    });

    const link = document.createElement('a');
    link.download = `${settings.fileName}.${settings.format}`;
    link.href = dataUrl;
    link.click();
  };

  const handleExportClipboard = async (settings: ExportSettings): Promise<boolean> => {
    const canvas = fabricRef.current;
    if (!canvas) return false;
    try {
      const dataUrl = canvas.toDataURL({ format: 'png', multiplier: settings.scale });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      return true;
    } catch (err) {
      console.warn('Clipboard write failed:', err);
      return false;
    }
  };

  const handleExportBase64 = async (settings: ExportSettings): Promise<string> => {
    const canvas = fabricRef.current;
    if (!canvas) return '';
    return canvas.toDataURL({
      format: settings.format === 'jpeg' ? 'jpeg' : settings.format === 'webp' ? 'webp' : 'png',
      multiplier: settings.scale,
      quality: settings.quality,
    });
  };

  return (
    <div className="w-full h-[100dvh] pt-14 flex flex-col bg-zinc-950 text-zinc-100 select-none font-sans overflow-hidden">
      {/* 1. TOP STUDIO NAVBAR */}
      <TopNavbar
        canUndo={historyIndex > 0}
        canRedo={historyIndex < historyStack.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        zoomLevel={zoomLevel}
        onZoomIn={() => setZoomLevel((z) => Math.min(3, z + 0.15))}
        onZoomOut={() => setZoomLevel((z) => Math.max(0.2, z - 0.15))}
        onZoomFit={autoFitZoom}
        onOpenExport={handleOpenExport}
        onUploadImage={() => fileInputRef.current?.click()}
        onResetCanvas={() => loadTemplate(activeTemplate)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        activeTemplateName={activeTemplate.name}
      />

      {/* Hidden file input for photo uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUploadFile}
        accept="image/*"
        className="hidden"
      />

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="w-full flex-1 flex overflow-hidden min-h-0 relative">
        {/* 2A. LEFT ICON TOOLBAR */}
        <LeftSidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab((prev) => (prev === tab ? null : tab));
            if (tab === 'draw') {
              handleToggleDrawingMode(true);
            } else if (isDrawingMode) {
              handleToggleDrawingMode(false);
            }
          }}
        />

        {/* 2B. SUB-PANEL DRAWER (MATCHES SCREENSHOT) */}
        {activeTab === 'text' && (
          <TextPanel
            onAddHeading={handleAddHeading}
            onAddSubheading={handleAddSubheading}
            onAddBodyText={handleAddBodyText}
            onApplyPreset={handleApplyTextPreset}
            hasSelection={selectedType === 'text'}
            letterCase={letterCase}
            letterSpacing={letterSpacing}
            listStyle={listStyle}
            underline={underline}
            linethrough={linethrough}
            verticalAlign={verticalAlign}
            lineHeight={lineHeight}
            paragraphSpacing={paragraphSpacing}
            frameBehavior={frameBehavior}
            clipping={clipping}
            onUpdateProp={updateTextProp}
            onClose={() => setActiveTab(null)}
          />
        )}

        {activeTab === 'crop' && (
          <CropPanel
            onApplyCrop={(aspect, shape) => {
              const canvas = fabricRef.current;
              if (!canvas) return;
              if (aspect) {
                const newHeight = Math.round(canvasWidth / aspect);
                setCanvasHeight(newHeight);
                canvas.setDimensions({ width: canvasWidth, height: newHeight });
              }
              canvas.renderAll();
              saveStateToHistory();
            }}
            onRotate={(deg) => {
              const canvas = fabricRef.current;
              if (!canvas) return;
              const active = canvas.getActiveObject();
              if (active) {
                active.rotate((active.angle || 0) + deg);
                canvas.renderAll();
                saveStateToHistory();
              }
            }}
            onFlipH={handleFlipH}
            onFlipV={handleFlipV}
            onResetCrop={() => loadTemplate(activeTemplate)}
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
            onClearEffects={() => {
              const canvas = fabricRef.current;
              if (!canvas) return;
              const active = canvas.getActiveObject();
              if (active) {
                active.set({ shadow: undefined, stroke: '', strokeWidth: 0 });
                canvas.renderAll();
                saveStateToHistory();
              }
            }}
          />
        )}

        {activeTab === 'bg-removal' && (
          <BgRemovalPanel
            onRemoveBackground={handleRemoveBackground}
            onSetBackgroundColor={(color) => {
              const canvas = fabricRef.current;
              if (canvas) {
                canvas.backgroundColor = color;
                canvas.renderAll();
                saveStateToHistory();
              }
            }}
            onSetTransparentBackground={() => {
              const canvas = fabricRef.current;
              if (canvas) {
                canvas.backgroundColor = '';
                canvas.renderAll();
                saveStateToHistory();
              }
            }}
            isProcessing={bgRemovalProcessing}
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
            activeLayerId={(selectedObject as any)?.id || null}
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
              refreshLayers(fabricRef.current!);
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
              refreshLayers(fabricRef.current!);
            }}
            onMoveUp={(l) => {
              fabricRef.current?.bringObjectForward(l.object);
              fabricRef.current?.renderAll();
              refreshLayers(fabricRef.current!);
            }}
            onMoveDown={(l) => {
              fabricRef.current?.sendObjectBackwards(l.object);
              fabricRef.current?.renderAll();
              refreshLayers(fabricRef.current!);
            }}
            onDeleteLayer={(l) => {
              fabricRef.current?.remove(l.object);
              fabricRef.current?.renderAll();
              refreshLayers(fabricRef.current!);
            }}
          />
        )}

        {/* 2C. CENTER CANVAS STAGE */}
        <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-hidden relative">
          {/* FLOATING / TOP CONTEXT PROPERTY BAR */}
          <ContextToolbar
            selectedType={selectedType}
            fontFamily={fontFamily}
            fontSize={fontSize}
            fontWeight={fontWeight}
            fontStyle={fontStyle}
            underline={underline}
            textAlign={textAlign}
            fillColor={fillColor}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            backgroundColor={backgroundColor}
            opacity={opacity}
            hasShadow={hasShadow}
            isLocked={isLocked}
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
            className="flex-1 overflow-auto flex items-center justify-center p-6 bg-zinc-950 custom-scrollbar relative"
            style={{
              backgroundImage:
                'radial-gradient(circle, #27272a 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          >
            {/* Centered Canvas Container with CSS Zoom */}
            <div
              className="relative shadow-2xl rounded-sm transition-transform duration-75 origin-center border border-zinc-800"
              style={{
                width: canvasWidth,
                height: canvasHeight,
                transform: `scale(${zoomLevel})`,
              }}
            >
              <canvas ref={canvasElRef} width={canvasWidth} height={canvasHeight} />
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
