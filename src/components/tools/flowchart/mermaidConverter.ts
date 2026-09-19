import { FlowchartNode, FlowchartEdge, CanvasDirection, NodeType } from './types';

/**
 * Escapes characters for Mermaid string literal safely.
 */
function sanitizeMermaidText(text: string): string {
  if (!text) return '';
  return text.replace(/"/g, "'").replace(/\n/g, '<br/>').trim();
}

/**
 * Sanitizes node ID so it's a valid Mermaid identifier.
 */
function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, '_');
}

/**
 * Convert Canvas Nodes and Edges into a clean Mermaid flowchart string.
 */
export function flowchartToMermaid(
  nodes: FlowchartNode[],
  edges: FlowchartEdge[],
  direction: CanvasDirection = 'TD',
  title?: string
): string {
  const lines: string[] = [];

  if (title) {
    lines.push(`---`);
    lines.push(`title: ${title}`);
    lines.push(`---`);
  }

  lines.push(`flowchart ${direction}`);

  // Add Nodes
  if (nodes.length > 0) {
    lines.push(`    %% Nodes`);
    for (const node of nodes) {
      const sId = sanitizeId(node.id);
      const label = sanitizeMermaidText(node.label);
      const desc = node.description ? `<br/><small>${sanitizeMermaidText(node.description)}</small>` : '';
      const fullLabel = `"${label}${desc}"`;

      let nodeDef = '';
      switch (node.type) {
        case 'start':
        case 'end':
          nodeDef = `${sId}([${fullLabel}])`;
          break;
        case 'decision':
          nodeDef = `${sId}{${fullLabel}}`;
          break;
        case 'input':
        case 'output':
          nodeDef = `${sId}[/${fullLabel}/]`;
          break;
        case 'database':
          nodeDef = `${sId}[(${fullLabel})]`;
          break;
        case 'subroutine':
          nodeDef = `${sId}[[${fullLabel}]]`;
          break;
        case 'document':
          nodeDef = `${sId}[>${fullLabel}]`;
          break;
        case 'cloud':
          nodeDef = `${sId}["☁️ ${label}${desc}"]`;
          break;
        case 'actor':
          nodeDef = `${sId}["👤 ${label}${desc}"]`;
          break;
        case 'note':
          nodeDef = `${sId}>"${label}${desc}"]`;
          break;
        case 'process':
        default:
          nodeDef = `${sId}[${fullLabel}]`;
          break;
      }
      lines.push(`    ${nodeDef}`);
    }
  }

  // Add Edges
  if (edges.length > 0) {
    lines.push(`\n    %% Connections`);
    for (const edge of edges) {
      const srcId = sanitizeId(edge.source);
      const tgtId = sanitizeId(edge.target);
      const rawLabel = edge.label ? sanitizeMermaidText(edge.label) : '';

      let arrow = '-->';
      if (edge.lineStyle === 'dashed' || edge.lineStyle === 'dotted') {
        arrow = '-.->';
      }

      if (rawLabel) {
        if (arrow === '-.->') {
          lines.push(`    ${srcId} -. "${rawLabel}" .-> ${tgtId}`);
        } else {
          lines.push(`    ${srcId} -->|${rawLabel}| ${tgtId}`);
        }
      } else {
        lines.push(`    ${srcId} ${arrow} ${tgtId}`);
      }
    }
  }

  // Add Custom Styles
  lines.push(`\n    %% Styling`);
  for (const node of nodes) {
    const sId = sanitizeId(node.id);
    if (node.bgColor || node.borderColor || node.textColor) {
      const fill = node.bgColor || '#ffffff';
      const stroke = node.borderColor || '#3b82f6';
      const color = node.textColor || '#1e293b';
      lines.push(`    style ${sId} fill:${fill},stroke:${stroke},stroke-width:2px,color:${color}`);
    }
  }

  return lines.join('\n');
}

/**
 * Parses Mermaid flowchart code and generates FlowchartNode[] and FlowchartEdge[].
 */
export function mermaidToFlowchart(mermaidCode: string): {
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  direction: CanvasDirection;
} {
  const nodesMap = new Map<string, FlowchartNode>();
  const edges: FlowchartEdge[] = [];
  let direction: CanvasDirection = 'TD';

  const cleaned = mermaidCode
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('%%') && !line.startsWith('---'));

  // Detect direction (flowchart TD / graph LR)
  for (const line of cleaned) {
    const dirMatch = line.match(/(?:flowchart|graph)\s+(TD|TB|LR|BT|RL)/i);
    if (dirMatch) {
      const d = dirMatch[1].toUpperCase();
      direction = d === 'TB' ? 'TD' : (d as CanvasDirection);
      break;
    }
  }

  // Helper to get or create node
  const getOrCreateNode = (id: string, label?: string, type: NodeType = 'process'): FlowchartNode => {
    const cleanId = id.trim();
    if (nodesMap.has(cleanId)) {
      const existing = nodesMap.get(cleanId)!;
      if (label && label !== cleanId) {
        existing.label = label;
      }
      if (type !== 'process') {
        existing.type = type;
      }
      return existing;
    }

    const defaultColors = getNodeDefaultColors(type);
    const newNode: FlowchartNode = {
      id: cleanId,
      type,
      label: label || cleanId,
      x: 100 + (nodesMap.size % 4) * 220,
      y: 100 + Math.floor(nodesMap.size / 4) * 160,
      width: type === 'decision' ? 140 : 160,
      height: type === 'decision' ? 90 : 70,
      bgColor: defaultColors.bg,
      borderColor: defaultColors.border,
      textColor: defaultColors.text,
    };
    nodesMap.set(cleanId, newNode);
    return newNode;
  };

  // Node detection regexes for shapes
  // 1. Stadium/Pill: id(["label"]) or id([label])
  // 2. Subroutine: id[["label"]]
  // 3. Cylinder/DB: id[("label")]
  // 4. Parallelogram: id[/"label"/] or id[\"label"\]
  // 5. Asymmetric/Document: id[>"label"] or id>"label"]
  // 6. Diamond/Decision: id{"label"} or id{label}
  // 7. Circle: id(("label"))
  // 8. Standard Box: id["label"] or id[label]

  const parseNodeDef = (str: string): { id: string; label: string; type: NodeType } | null => {
    // Stadium / Terminator
    const stadium = str.match(/^([a-zA-Z0-9_-]+)\s*\(\[\s*["']?([\s\S]*?)["']?\s*\]\)$/);
    if (stadium) {
      return { id: stadium[1], label: sanitizeExtractedText(stadium[2]), type: 'start' };
    }

    // Subroutine
    const sub = str.match(/^([a-zA-Z0-9_-]+)\s*\[\[\s*["']?([\s\S]*?)["']?\s*\]\]$/);
    if (sub) {
      return { id: sub[1], label: sanitizeExtractedText(sub[2]), type: 'subroutine' };
    }

    // Database
    const db = str.match(/^([a-zA-Z0-9_-]+)\s*\[\(\s*["']?([\s\S]*?)["']?\s*\)\]$/);
    if (db) {
      return { id: db[1], label: sanitizeExtractedText(db[2]), type: 'database' };
    }

    // Parallelogram / IO
    const io = str.match(/^([a-zA-Z0-9_-]+)\s*\[\/\s*["']?([\s\S]*?)["']?\s*\/\]$/);
    if (io) {
      return { id: io[1], label: sanitizeExtractedText(io[2]), type: 'input' };
    }

    // Diamond / Decision
    const diamond = str.match(/^([a-zA-Z0-9_-]+)\s*\{\s*["']?([\s\S]*?)["']?\s*\}$/);
    if (diamond) {
      return { id: diamond[1], label: sanitizeExtractedText(diamond[2]), type: 'decision' };
    }

    // Document / Flag
    const doc = str.match(/^([a-zA-Z0-9_-]+)\s*(?:\[>|>)\s*["']?([\s\S]*?)["']?\s*\]$/);
    if (doc) {
      return { id: doc[1], label: sanitizeExtractedText(doc[2]), type: 'document' };
    }

    // Standard Box
    const box = str.match(/^([a-zA-Z0-9_-]+)\s*\[\s*["']?([\s\S]*?)["']?\s*\]$/);
    if (box) {
      let lbl = sanitizeExtractedText(box[2]);
      let type: NodeType = 'process';
      if (lbl.includes('☁️')) {
        type = 'cloud';
        lbl = lbl.replace('☁️', '').trim();
      } else if (lbl.includes('👤')) {
        type = 'actor';
        lbl = lbl.replace('👤', '').trim();
      }
      return { id: box[1], label: lbl, type };
    }

    // Plain identifier alone
    const plain = str.match(/^([a-zA-Z0-9_-]+)$/);
    if (plain) {
      return { id: plain[1], label: plain[1], type: 'process' };
    }

    return null;
  };

  // Process line by line
  for (const line of cleaned) {
    if (line.startsWith('flowchart') || line.startsWith('graph')) continue;

    // Check for style line: style id fill:...
    const styleMatch = line.match(/^style\s+([a-zA-Z0-9_-]+)\s+(.+)$/i);
    if (styleMatch) {
      const targetNode = nodesMap.get(styleMatch[1]);
      if (targetNode) {
        const styleTokens = styleMatch[2].split(',');
        for (const token of styleTokens) {
          const [k, v] = token.split(':').map(s => s?.trim());
          if (k === 'fill') targetNode.bgColor = v;
          if (k === 'stroke') targetNode.borderColor = v;
          if (k === 'color') targetNode.textColor = v;
        }
      }
      continue;
    }

    // Check for connections: e.g. A --> B, A -->|label| B, A -.->|label| B, A ==> B
    // Matches: (sourceDef) (arrow + label) (targetDef)
    const arrowRegex = /(-->|-.->|==>|---|--\s*["']?([^"'-]+)["']?\s*-->|-->\|([^|]+)\||-\.\s*["']?([^"'-]+)["']?\s*\.->)/;
    const arrowMatch = line.match(arrowRegex);

    if (arrowMatch && arrowMatch.index !== undefined) {
      const leftPart = line.substring(0, arrowMatch.index).trim();
      const rightPart = line.substring(arrowMatch.index + arrowMatch[0].length).trim();
      const fullArrow = arrowMatch[0];

      let edgeLabel = '';
      if (arrowMatch[2]) edgeLabel = arrowMatch[2].trim();
      else if (arrowMatch[3]) edgeLabel = arrowMatch[3].trim();
      else if (arrowMatch[4]) edgeLabel = arrowMatch[4].trim();

      const leftNodeInfo = parseNodeDef(leftPart) || { id: leftPart, label: leftPart, type: 'process' as NodeType };
      const rightNodeInfo = parseNodeDef(rightPart) || { id: rightPart, label: rightPart, type: 'process' as NodeType };

      if (leftNodeInfo.id && rightNodeInfo.id) {
        const src = getOrCreateNode(leftNodeInfo.id, leftNodeInfo.label, leftNodeInfo.type);
        const tgt = getOrCreateNode(rightNodeInfo.id, rightNodeInfo.label, rightNodeInfo.type);

        const edgeId = `edge_${src.id}_${tgt.id}_${edges.length}`;
        const isDashed = fullArrow.includes('-.') || fullArrow.includes('.-');
        edges.push({
          id: edgeId,
          source: src.id,
          target: tgt.id,
          label: edgeLabel || undefined,
          lineStyle: isDashed ? 'dashed' : 'solid',
          style: 'orthogonal',
          color: '#64748b',
          arrowEnd: true,
        });
      }
    } else {
      // Might be standalone node declaration: A[Label]
      const nodeInfo = parseNodeDef(line);
      if (nodeInfo) {
        getOrCreateNode(nodeInfo.id, nodeInfo.label, nodeInfo.type);
      }
    }
  }

  const nodes = Array.from(nodesMap.values());
  return { nodes, edges, direction };
}

function sanitizeExtractedText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<small>[\s\S]*?<\/small>/gi, '')
    .trim();
}

export function getNodeDefaultColors(type: NodeType): { bg: string; border: string; text: string } {
  switch (type) {
    case 'start':
      return { bg: '#ecfdf5', border: '#10b981', text: '#065f46' }; // Emerald
    case 'end':
      return { bg: '#fef2f2', border: '#ef4444', text: '#991b1b' }; // Rose / Red
    case 'decision':
      return { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' }; // Amber
    case 'input':
    case 'output':
      return { bg: '#f0fdf4', border: '#22c55e', text: '#166534' }; // Green
    case 'database':
      return { bg: '#f5f3ff', border: '#8b5cf6', text: '#5b21b6' }; // Purple
    case 'cloud':
      return { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' }; // Sky / Blue
    case 'subroutine':
      return { bg: '#f8fafc', border: '#64748b', text: '#334155' }; // Slate
    case 'document':
      return { bg: '#fdf4ff', border: '#d946ef', text: '#86198f' }; // Fuchsia
    case 'note':
      return { bg: '#fefce8', border: '#eab308', text: '#713f12' }; // Yellow sticky
    case 'actor':
      return { bg: '#f0f9ff', border: '#0284c7', text: '#075985' }; // Sky Cyan
    case 'process':
    default:
      return { bg: '#ffffff', border: '#3b82f6', text: '#0f172a' }; // Clean White/Blue
  }
}
