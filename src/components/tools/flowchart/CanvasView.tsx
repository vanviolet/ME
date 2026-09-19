import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { FlowchartNode, FlowchartEdge, HandlePosition, NodeType } from './types';
import {
  Play,
  Square,
  Diamond,
  Database,
  Cloud,
  FileText,
  User,
  Plus,
  Trash2,
  Copy,
  Zap,
  RotateCcw,
} from 'lucide-react';

interface CanvasViewProps {
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  activeSimNodeId?: string | null;
  activeSimEdgeId?: string | null;
  snapToGrid: boolean;
  gridSize: number;
  canvasBg: 'dots' | 'grid' | 'blank';
  onSelectNode: (id: string | null) => void;
  onSelectEdge: (id: string | null) => void;
  onUpdateNode: (node: FlowchartNode) => void;
  onUpdateNodes: (nodes: FlowchartNode[]) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onQuickAddChild: (sourceId: string, type?: NodeType) => void;
  onAddEdge: (edge: Omit<FlowchartEdge, 'id'>) => void;
  onUpdateEdge: (edge: FlowchartEdge) => void;
  onDeleteEdge: (id: string) => void;
  scale: number;
  pan: { x: number; y: number };
  onChangeScale: (newScale: number) => void;
  onChangePan: (newPan: { x: number; y: number }) => void;
}

export const CanvasView: React.FC<CanvasViewProps> = ({
  nodes,
  edges,
  selectedNodeId,
  selectedEdgeId,
  activeSimNodeId,
  activeSimEdgeId,
  snapToGrid,
  gridSize,
  canvasBg,
  onSelectNode,
  onSelectEdge,
  onUpdateNode,
  onUpdateNodes,
  onDeleteNode,
  onDuplicateNode,
  onQuickAddChild,
  onAddEdge,
  onUpdateEdge,
  onDeleteEdge,
  scale,
  pan,
  onChangeScale,
  onChangePan,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Panning State
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Dragging Node State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Connecting Edge State
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectSource, setConnectSource] = useState<{
    nodeId: string;
    handle: HandlePosition;
    startPoint: { x: number; y: number };
  } | null>(null);
  const [connectCurrentPos, setConnectCurrentPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredPort, setHoveredPort] = useState<{ nodeId: string; handle: HandlePosition } | null>(null);

  // Inline Editing
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [editingEdgeText, setEditingEdgeText] = useState('');

  // Convert client coordinates to canvas world coordinates
  const clientToWorld = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      return {
        x: (clientX - rect.left - pan.x) / scale,
        y: (clientY - rect.top - pan.y) / scale,
      };
    },
    [pan, scale]
  );

  // Calculate Handle Center Position in World coordinates
  const getHandlePosition = useCallback((node: FlowchartNode, handle: HandlePosition): { x: number; y: number } => {
    switch (handle) {
      case 'top':
        return { x: node.x + node.width / 2, y: node.y };
      case 'right':
        return { x: node.x + node.width, y: node.y + node.height / 2 };
      case 'bottom':
        return { x: node.x + node.width / 2, y: node.y + node.height };
      case 'left':
        return { x: node.x, y: node.y + node.height / 2 };
      case 'auto':
      default:
        return { x: node.x + node.width / 2, y: node.y + node.height };
    }
  }, []);

  // Compute best automatic ports if set to 'auto'
  const getBestHandles = useCallback(
    (sourceNode: FlowchartNode, targetNode: FlowchartNode): { sourceHandle: HandlePosition; targetHandle: HandlePosition } => {
      const srcCenter = { x: sourceNode.x + sourceNode.width / 2, y: sourceNode.y + sourceNode.height / 2 };
      const tgtCenter = { x: targetNode.x + targetNode.width / 2, y: targetNode.y + targetNode.height / 2 };

      const dx = tgtCenter.x - srcCenter.x;
      const dy = tgtCenter.y - srcCenter.y;

      if (Math.abs(dy) >= Math.abs(dx)) {
        // Vertical priority
        return dy > 0
          ? { sourceHandle: 'bottom', targetHandle: 'top' }
          : { sourceHandle: 'top', targetHandle: 'bottom' };
      } else {
        // Horizontal priority
        return dx > 0
          ? { sourceHandle: 'right', targetHandle: 'left' }
          : { sourceHandle: 'left', targetHandle: 'right' };
      }
    },
    []
  );

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = 1.1;
      const newScale = e.deltaY < 0 ? Math.min(2.5, scale * zoomFactor) : Math.max(0.3, scale / zoomFactor);
      onChangeScale(newScale);
    } else {
      // Pan with trackpad / wheel
      onChangePan({
        x: pan.x - e.deltaX,
        y: pan.y - e.deltaY,
      });
    }
  };

  // Mouse Down on Canvas Background -> Start Pan
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // If middle click or space key or clicking empty space
    if (e.button === 1 || e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      onSelectNode(null);
      onSelectEdge(null);
    }
  };

  // Global Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    // 1. Panning Canvas
    if (isPanning) {
      onChangePan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    // 2. Dragging Node
    if (draggingNodeId) {
      const worldPos = clientToWorld(e.clientX, e.clientY);
      let newX = worldPos.x - dragOffset.x;
      let newY = worldPos.y - dragOffset.y;

      if (snapToGrid) {
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }

      const node = nodes.find(n => n.id === draggingNodeId);
      if (node) {
        onUpdateNode({
          ...node,
          x: Math.max(0, newX),
          y: Math.max(0, newY),
        });
      }
      return;
    }

    // 3. Connecting Wire
    if (isConnecting) {
      const worldPos = clientToWorld(e.clientX, e.clientY);
      setConnectCurrentPos(worldPos);
    }
  };

  // Global Mouse Up
  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }

    if (draggingNodeId) {
      setDraggingNodeId(null);
    }

    // Complete connection if dropped on valid port
    if (isConnecting && connectSource) {
      if (hoveredPort && hoveredPort.nodeId !== connectSource.nodeId) {
        // Create edge
        onAddEdge({
          source: connectSource.nodeId,
          target: hoveredPort.nodeId,
          sourceHandle: connectSource.handle,
          targetHandle: hoveredPort.handle,
          style: 'orthogonal',
          lineStyle: 'solid',
          arrowEnd: true,
          color: '#64748b',
        });
      }
      setIsConnecting(false);
      setConnectSource(null);
      setHoveredPort(null);
    }
  };

  // Start Node Drag
  const handleNodeMouseDown = (e: React.MouseEvent, node: FlowchartNode) => {
    e.stopPropagation();
    onSelectNode(node.id);
    onSelectEdge(null);

    const worldPos = clientToWorld(e.clientX, e.clientY);
    setDraggingNodeId(node.id);
    setDragOffset({
      x: worldPos.x - node.x,
      y: worldPos.y - node.y,
    });
  };

  // Start Connecting from Port
  const handlePortMouseDown = (e: React.MouseEvent, node: FlowchartNode, handle: HandlePosition) => {
    e.stopPropagation();
    const portPos = getHandlePosition(node, handle);
    setIsConnecting(true);
    setConnectSource({
      nodeId: node.id,
      handle,
      startPoint: portPos,
    });
    setConnectCurrentPos(portPos);
  };

  // Finish editing node label
  const handleFinishEditingNode = () => {
    if (editingNodeId) {
      const node = nodes.find(n => n.id === editingNodeId);
      if (node && editingText.trim()) {
        onUpdateNode({ ...node, label: editingText.trim() });
      }
      setEditingNodeId(null);
    }
  };

  // Finish editing edge label
  const handleFinishEditingEdge = () => {
    if (editingEdgeId) {
      const edge = edges.find(e => e.id === editingEdgeId);
      if (edge) {
        onUpdateEdge({ ...edge, label: editingEdgeText.trim() || undefined });
      }
      setEditingEdgeId(null);
    }
  };

  // Draw Path for Edge
  const computeEdgePath = (edge: FlowchartEdge): { path: string; labelPos: { x: number; y: number } } => {
    const srcNode = nodes.find(n => n.id === edge.source);
    const tgtNode = nodes.find(n => n.id === edge.target);

    if (!srcNode || !tgtNode) return { path: '', labelPos: { x: 0, y: 0 } };

    let srcHandle = edge.sourceHandle || 'auto';
    let tgtHandle = edge.targetHandle || 'auto';

    if (srcHandle === 'auto' || tgtHandle === 'auto') {
      const best = getBestHandles(srcNode, tgtNode);
      if (srcHandle === 'auto') srcHandle = best.sourceHandle;
      if (tgtHandle === 'auto') tgtHandle = best.targetHandle;
    }

    const p1 = getHandlePosition(srcNode, srcHandle as HandlePosition);
    const p2 = getHandlePosition(tgtNode, tgtHandle as HandlePosition);

    const style = edge.style || 'orthogonal';

    if (style === 'straight') {
      return {
        path: `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`,
        labelPos: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 },
      };
    }

    if (style === 'curved') {
      const dx = Math.abs(p2.x - p1.x);
      const dy = Math.abs(p2.y - p1.y);
      const offset = Math.max(30, Math.min(dx, dy) * 0.7);

      let c1 = { ...p1 };
      let c2 = { ...p2 };

      if (srcHandle === 'bottom') c1.y += offset;
      else if (srcHandle === 'top') c1.y -= offset;
      else if (srcHandle === 'right') c1.x += offset;
      else if (srcHandle === 'left') c1.x -= offset;

      if (tgtHandle === 'top') c2.y -= offset;
      else if (tgtHandle === 'bottom') c2.y += offset;
      else if (tgtHandle === 'left') c2.x -= offset;
      else if (tgtHandle === 'right') c2.x += offset;

      return {
        path: `M ${p1.x} ${p1.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`,
        labelPos: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 },
      };
    }

    // Default: Orthogonal (stepped flowchart connector)
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;

    let path = '';
    if (srcHandle === 'bottom' && tgtHandle === 'top') {
      path = `M ${p1.x} ${p1.y} L ${p1.x} ${midY} L ${p2.x} ${midY} L ${p2.x} ${p2.y}`;
    } else if (srcHandle === 'right' && tgtHandle === 'left') {
      path = `M ${p1.x} ${p1.y} L ${midX} ${p1.y} L ${midX} ${p2.y} L ${p2.x} ${p2.y}`;
    } else if (srcHandle === 'bottom' || srcHandle === 'top') {
      path = `M ${p1.x} ${p1.y} L ${p1.x} ${p2.y} L ${p2.x} ${p2.y}`;
    } else {
      path = `M ${p1.x} ${p1.y} L ${p2.x} ${p1.y} L ${p2.x} ${p2.y}`;
    }

    return {
      path,
      labelPos: { x: midX, y: midY },
    };
  };

  // Selected Node Reference
  const selectedNode = useMemo(() => nodes.find(n => n.id === selectedNodeId), [nodes, selectedNodeId]);

  return (
    <div
      ref={containerRef}
      id="flowchart-canvas-container"
      className={`relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing ${
        canvasBg === 'dots'
          ? 'bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] bg-[size:24px_24px]'
          : canvasBg === 'grid'
          ? 'bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px]'
          : 'bg-stone-100/70 dark:bg-zinc-950'
      }`}
      onWheel={handleWheel}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Transformable Canvas Layer */}
      <div
        className="absolute top-0 left-0 origin-top-left transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          width: '5000px',
          height: '5000px',
        }}
      >
        {/* SVG Layer for Edges, Arrows, and Connection Wire */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 overflow-visible">
          <defs>
            {/* Standard Arrow Marker */}
            <marker id="arrowhead" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto">
              <polygon points="0 0, 10 4, 0 8" fill="#64748b" />
            </marker>
            <marker id="arrowhead-selected" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto">
              <polygon points="0 0, 10 4, 0 8" fill="#f43f5e" />
            </marker>
            <marker id="arrowhead-active" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto">
              <polygon points="0 0, 10 4, 0 8" fill="#10b981" />
            </marker>
          </defs>

          {/* Render Existing Edges */}
          {edges.map(edge => {
            const { path, labelPos } = computeEdgePath(edge);
            if (!path) return null;

            const isSelected = edge.id === selectedEdgeId;
            const isSimActive = edge.id === activeSimEdgeId;

            return (
              <g key={edge.id} className="pointer-events-auto group">
                {/* Thick Invisible Click Target for easy selection */}
                <path
                  d={path}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={20}
                  className="cursor-pointer"
                  onClick={e => {
                    e.stopPropagation();
                    onSelectEdge(edge.id);
                    onSelectNode(null);
                  }}
                  onDoubleClick={e => {
                    e.stopPropagation();
                    setEditingEdgeId(edge.id);
                    setEditingEdgeText(edge.label || '');
                  }}
                />

                {/* Visible Path */}
                <path
                  d={path}
                  fill="none"
                  stroke={isSimActive ? '#10b981' : isSelected ? '#f43f5e' : edge.color || '#64748b'}
                  strokeWidth={isSimActive ? 3.5 : isSelected ? 3 : 2}
                  strokeDasharray={
                    isSimActive
                      ? '6,6'
                      : edge.lineStyle === 'dashed'
                      ? '6,6'
                      : edge.lineStyle === 'dotted'
                      ? '2,4'
                      : undefined
                  }
                  markerEnd={
                    isSimActive
                      ? 'url(#arrowhead-active)'
                      : isSelected
                      ? 'url(#arrowhead-selected)'
                      : 'url(#arrowhead)'
                  }
                  className={`transition-colors duration-150 ${isSimActive ? 'animate-pulse' : ''}`}
                />

                {/* Edge Label Badge */}
                {edge.label && editingEdgeId !== edge.id && (
                  <g
                    transform={`translate(${labelPos.x}, ${labelPos.y})`}
                    className="cursor-pointer pointer-events-auto"
                    onClick={e => {
                      e.stopPropagation();
                      onSelectEdge(edge.id);
                    }}
                    onDoubleClick={e => {
                      e.stopPropagation();
                      setEditingEdgeId(edge.id);
                      setEditingEdgeText(edge.label || '');
                    }}
                  >
                    <rect
                      x={-(edge.label.length * 4.2 + 10)}
                      y={-12}
                      width={edge.label.length * 8.4 + 20}
                      height={24}
                      rx={6}
                      fill={isSelected ? '#ffe4e6' : '#ffffff'}
                      stroke={isSelected ? '#f43f5e' : '#cbd5e1'}
                      strokeWidth={1.5}
                      className="shadow-xs dark:fill-zinc-800 dark:stroke-zinc-700"
                    />
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      className={`text-[11px] font-medium font-sans select-none ${
                        isSelected ? 'fill-rose-700 font-semibold' : 'fill-stone-700 dark:fill-zinc-300'
                      }`}
                    >
                      {edge.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Rubberband Wire when Connecting */}
          {isConnecting && connectSource && (
            <path
              d={`M ${connectSource.startPoint.x} ${connectSource.startPoint.y} C ${
                (connectSource.startPoint.x + connectCurrentPos.x) / 2
              } ${connectSource.startPoint.y}, ${(connectSource.startPoint.x + connectCurrentPos.x) / 2} ${
                connectCurrentPos.y
              }, ${connectCurrentPos.x} ${connectCurrentPos.y}`}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={2.5}
              strokeDasharray="6,4"
              className="animate-pulse"
              markerEnd="url(#arrowhead)"
            />
          )}
        </svg>

        {/* HTML Layer for Flowchart Nodes */}
        {nodes.map(node => {
          const isSelected = node.id === selectedNodeId;
          const isSimActive = node.id === activeSimNodeId;
          const isEditing = editingNodeId === node.id;

          return (
            <div
              key={node.id}
              id={`flow-node-${node.id}`}
              className={`absolute group cursor-move select-none transition-shadow ${
                isSelected ? 'ring-2 ring-rose-500 ring-offset-2 dark:ring-offset-zinc-900 shadow-xl z-30' : 'z-20'
              } ${isSimActive ? 'ring-4 ring-emerald-500 shadow-2xl scale-105 z-40' : ''}`}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${node.width}px`,
                height: `${node.height}px`,
              }}
              onMouseDown={e => handleNodeMouseDown(e, node)}
              onDoubleClick={e => {
                e.stopPropagation();
                setEditingNodeId(node.id);
                setEditingText(node.label);
              }}
            >
              {/* Node Geometry Renderer based on Type */}
              <div
                className="w-full h-full relative flex flex-col items-center justify-center p-2.5 text-center transition-colors shadow-sm"
                style={{
                  backgroundColor: node.bgColor,
                  borderColor: isSelected ? '#f43f5e' : node.borderColor,
                  color: node.textColor,
                  borderWidth: `${node.borderWidth || 2}px`,
                  borderStyle: node.borderStyle || 'solid',
                  borderRadius:
                    node.type === 'start' || node.type === 'end'
                      ? '9999px'
                      : node.type === 'database'
                      ? '8px'
                      : node.type === 'decision'
                      ? '10px'
                      : '12px',
                  transform: node.type === 'decision' ? 'rotate(45deg)' : undefined,
                }}
              >
                {/* Content Wrapper (Counter-rotate text for Decision diamond so text is horizontal) */}
                <div
                  className="w-full flex flex-col items-center justify-center gap-0.5 overflow-hidden"
                  style={{
                    transform: node.type === 'decision' ? 'rotate(-45deg)' : undefined,
                  }}
                >
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingText}
                      autoFocus
                      onChange={e => setEditingText(e.target.value)}
                      onBlur={handleFinishEditingNode}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleFinishEditingNode();
                        if (e.key === 'Escape') setEditingNodeId(null);
                      }}
                      className="w-full bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded text-xs font-semibold text-center border border-rose-400 outline-none"
                    />
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 max-w-full">
                        {node.type === 'database' && <Database size={13} className="shrink-0 opacity-80" />}
                        {node.type === 'cloud' && <Cloud size={13} className="shrink-0 opacity-80" />}
                        {node.type === 'document' && <FileText size={13} className="shrink-0 opacity-80" />}
                        {node.type === 'actor' && <User size={13} className="shrink-0 opacity-80" />}
                        <span
                          className="font-semibold leading-tight truncate text-xs sm:text-[13px]"
                          style={{ fontSize: node.fontSize ? `${node.fontSize}px` : undefined }}
                        >
                          {node.label}
                        </span>
                      </div>
                      {node.description && (
                        <span className="text-[10px] opacity-75 leading-tight truncate max-w-full">
                          {node.description}
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Subroutine Double Border Effect */}
                {node.type === 'subroutine' && (
                  <>
                    <div className="absolute top-0 bottom-0 left-2.5 w-[2px] bg-current opacity-60" />
                    <div className="absolute top-0 bottom-0 right-2.5 w-[2px] bg-current opacity-60" />
                  </>
                )}
              </div>

              {/* 4 Directional Magnetic Connector Ports (Top, Right, Bottom, Left) */}
              {(['top', 'right', 'bottom', 'left'] as HandlePosition[]).map(handle => {
                const isHovered = hoveredPort?.nodeId === node.id && hoveredPort?.handle === handle;

                let handleStyle = '';
                if (handle === 'top') handleStyle = 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2';
                if (handle === 'right') handleStyle = 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2';
                if (handle === 'bottom') handleStyle = 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2';
                if (handle === 'left') handleStyle = 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2';

                return (
                  <div
                    key={handle}
                    className={`absolute z-30 ${handleStyle} w-4 h-4 flex items-center justify-center cursor-crosshair group/port transition-transform ${
                      isSelected || isHovered || isConnecting ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                    onMouseDown={e => handlePortMouseDown(e, node, handle)}
                    onMouseEnter={() => setHoveredPort({ nodeId: node.id, handle })}
                    onMouseLeave={() => {
                      if (hoveredPort?.nodeId === node.id && hoveredPort?.handle === handle) {
                        setHoveredPort(null);
                      }
                    }}
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full border-2 transition-all ${
                        isHovered
                          ? 'bg-rose-500 border-white scale-125 shadow-md'
                          : 'bg-white dark:bg-zinc-900 border-blue-500 shadow-xs group-hover/port:scale-125'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Selected Node Floating Action Toolbar */}
        {selectedNode && !isConnecting && !draggingNodeId && (
          <div
            className="absolute z-40 flex items-center gap-1 p-1 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg shadow-lg"
            style={{
              left: `${selectedNode.x + selectedNode.width / 2}px`,
              top: `${selectedNode.y - 42}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <button
              title="Add Next Child Process"
              onClick={() => onQuickAddChild(selectedNode.id, 'process')}
              className="p-1 text-stone-600 dark:text-zinc-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded text-xs flex items-center gap-1 font-medium"
            >
              <Plus size={13} />
              <Square size={12} />
            </button>
            <button
              title="Add Decision Branch"
              onClick={() => onQuickAddChild(selectedNode.id, 'decision')}
              className="p-1 text-stone-600 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded text-xs flex items-center gap-1 font-medium"
            >
              <Plus size={13} />
              <Diamond size={12} />
            </button>
            <div className="w-[1px] h-4 bg-stone-200 dark:bg-zinc-700" />
            <button
              title="Duplicate Node"
              onClick={() => onDuplicateNode(selectedNode.id)}
              className="p-1 text-stone-600 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800 rounded"
            >
              <Copy size={13} />
            </button>
            <button
              title="Delete Node (Del)"
              onClick={() => onDeleteNode(selectedNode.id)}
              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}

        {/* Selected Edge Floating Delete Toolbar */}
        {selectedEdgeId && !selectedNodeId && (
          <div
            className="absolute z-40 flex items-center gap-1 p-1 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg shadow-lg"
            style={{
              left: `${pan.x + 200}px`,
              top: `${pan.y + 100}px`,
            }}
          >
            <button
              onClick={() => onDeleteEdge(selectedEdgeId)}
              className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded flex items-center gap-1 font-medium"
            >
              <Trash2 size={13} />
              <span>Hapus Garis</span>
            </button>
          </div>
        )}
      </div>

      {/* Inline Edge Edit Input Floating Modal */}
      {editingEdgeId && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-zinc-900 border border-rose-300 dark:border-rose-700 p-2 rounded-xl shadow-xl flex items-center gap-2">
          <span className="text-xs font-medium text-stone-600 dark:text-zinc-400">Label Cabang:</span>
          <input
            type="text"
            value={editingEdgeText}
            placeholder="Contoh: Ya / Tidak / Sukses"
            autoFocus
            onChange={e => setEditingEdgeText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleFinishEditingEdge();
              if (e.key === 'Escape') setEditingEdgeId(null);
            }}
            className="px-2 py-1 text-xs bg-stone-50 dark:bg-zinc-800 border rounded outline-none w-48 font-semibold"
          />
          <button
            onClick={handleFinishEditingEdge}
            className="px-2.5 py-1 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg"
          >
            Simpan
          </button>
        </div>
      )}

      {/* Bottom Right MiniMap & Navigation Legend */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-1.5 rounded-xl border border-stone-200 dark:border-zinc-800 shadow-md text-xs text-stone-600 dark:text-zinc-400">
        <span className="px-1.5 font-mono font-medium">{Math.round(scale * 100)}%</span>
        <div className="w-[1px] h-3.5 bg-stone-200 dark:bg-zinc-700" />
        <span className="hidden sm:inline text-[11px] text-stone-400 dark:text-zinc-500">
          Tarik titik port untuk menghubungkan garis
        </span>
      </div>
    </div>
  );
};
