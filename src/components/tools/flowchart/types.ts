export type NodeType =
  | 'start'
  | 'end'
  | 'process'
  | 'decision'
  | 'input'
  | 'output'
  | 'database'
  | 'subroutine'
  | 'cloud'
  | 'document'
  | 'note'
  | 'actor';

export type HandlePosition = 'top' | 'right' | 'bottom' | 'left' | 'auto';

export type EdgeStyle = 'orthogonal' | 'curved' | 'straight';
export type EdgeLineStyle = 'solid' | 'dashed' | 'dotted';

export interface FlowchartNode {
  id: string;
  type: NodeType;
  label: string;
  description?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  bgColor: string;
  borderColor: string;
  textColor: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  fontSize?: number;
  icon?: string;
}

export interface FlowchartEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: HandlePosition;
  targetHandle?: HandlePosition;
  label?: string;
  style?: EdgeStyle;
  lineStyle?: EdgeLineStyle;
  color?: string;
  animated?: boolean;
  arrowEnd?: boolean;
  arrowStart?: boolean;
}

export type CanvasDirection = 'TD' | 'LR' | 'BT' | 'RL';

export interface FlowchartTheme {
  id: string;
  name: string;
  bgCanvas: string;
  gridColor: string;
  nodeBg: string;
  nodeBorder: string;
  nodeText: string;
  edgeColor: string;
  accentColor: string;
}

export interface FlowchartProject {
  id: string;
  title: string;
  description?: string;
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  direction: CanvasDirection;
  themeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SimulationStep {
  nodeId: string;
  edgeId?: string;
  message: string;
  isDecision?: boolean;
  choices?: { label: string; targetNodeId: string; edgeId: string }[];
}
