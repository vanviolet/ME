import { FlowchartNode, FlowchartEdge, CanvasDirection } from './types';

/**
 * Arranges nodes hierarchically into clean layers (Top-Down or Left-to-Right)
 * using topological layer assignment and barycentric centering.
 */
export function computeAutoLayout(
  nodes: FlowchartNode[],
  edges: FlowchartEdge[],
  direction: CanvasDirection = 'TD',
  spacingX: number = 80,
  spacingY: number = 100
): FlowchartNode[] {
  if (nodes.length === 0) return [];

  const nodeMap = new Map<string, FlowchartNode>();
  nodes.forEach(n => nodeMap.set(n.id, { ...n }));

  // Build adjacency
  const inDegree = new Map<string, number>();
  const outEdges = new Map<string, string[]>();
  const inEdges = new Map<string, string[]>();

  nodes.forEach(n => {
    inDegree.set(n.id, 0);
    outEdges.set(n.id, []);
    inEdges.set(n.id, []);
  });

  edges.forEach(e => {
    if (nodeMap.has(e.source) && nodeMap.has(e.target) && e.source !== e.target) {
      outEdges.get(e.source)!.push(e.target);
      inEdges.get(e.target)!.push(e.source);
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    }
  });

  // Assign ranks (layers) using BFS/longest path, handling cycles
  const ranks = new Map<string, number>();
  const visited = new Set<string>();

  // Find roots (in-degree 0 or nodes of type 'start')
  let roots = nodes.filter(n => (inDegree.get(n.id) || 0) === 0).map(n => n.id);
  if (roots.length === 0 && nodes.length > 0) {
    // If graph has a loop, pick the 'start' node or just the first node
    const startNode = nodes.find(n => n.type === 'start');
    roots = [startNode ? startNode.id : nodes[0].id];
  }

  // Assign roots rank 0
  roots.forEach(r => {
    ranks.set(r, 0);
  });

  // BFS / Relaxation to find max depth for each node
  const queue = [...roots];
  while (queue.length > 0) {
    const current = queue.shift()!;
    visited.add(current);
    const currentRank = ranks.get(current) || 0;

    const children = outEdges.get(current) || [];
    for (const child of children) {
      const childRank = ranks.get(child);
      if (childRank === undefined || childRank < currentRank + 1) {
        ranks.set(child, currentRank + 1);
        if (!visited.has(child) || !queue.includes(child)) {
          queue.push(child);
        }
      }
    }
  }

  // Handle any orphan / unvisited nodes
  nodes.forEach(n => {
    if (!ranks.has(n.id)) {
      ranks.set(n.id, 0);
    }
  });

  // Group nodes by layer
  const layers = new Map<number, string[]>();
  ranks.forEach((rank, id) => {
    if (!layers.has(rank)) layers.set(rank, []);
    layers.get(rank)!.push(id);
  });

  const sortedLayerRanks = Array.from(layers.keys()).sort((a, b) => a - b);

  // Position computation
  const startX = 120;
  const startY = 120;

  if (direction === 'TD' || direction === 'BT') {
    // Top-to-Bottom (Y is layer, X is position in layer)
    const isReverse = direction === 'BT';
    const ranksOrder = isReverse ? [...sortedLayerRanks].reverse() : sortedLayerRanks;

    let currentY = startY;

    ranksOrder.forEach(rank => {
      const layerNodes = layers.get(rank) || [];
      const totalLayerWidth =
        layerNodes.reduce((acc, id) => acc + (nodeMap.get(id)?.width || 160), 0) +
        (layerNodes.length - 1) * spacingX;

      let currentX = startX;
      // Find max height in this layer
      const maxHeight = Math.max(...layerNodes.map(id => nodeMap.get(id)?.height || 70));

      layerNodes.forEach(id => {
        const node = nodeMap.get(id)!;
        node.x = currentX;
        node.y = currentY + (maxHeight - node.height) / 2;
        currentX += node.width + spacingX;
      });

      currentY += maxHeight + spacingY;
    });

    // Center layers relative to each other
    let maxLayerWidth = 0;
    ranksOrder.forEach(rank => {
      const layerNodes = layers.get(rank) || [];
      const w =
        layerNodes.reduce((acc, id) => acc + (nodeMap.get(id)?.width || 160), 0) +
        (layerNodes.length - 1) * spacingX;
      if (w > maxLayerWidth) maxLayerWidth = w;
    });

    ranksOrder.forEach(rank => {
      const layerNodes = layers.get(rank) || [];
      const w =
        layerNodes.reduce((acc, id) => acc + (nodeMap.get(id)?.width || 160), 0) +
        (layerNodes.length - 1) * spacingX;
      const offset = (maxLayerWidth - w) / 2;
      layerNodes.forEach(id => {
        const node = nodeMap.get(id)!;
        node.x += offset;
      });
    });
  } else {
    // Left-to-Right (X is layer, Y is position in layer)
    const isReverse = direction === 'RL';
    const ranksOrder = isReverse ? [...sortedLayerRanks].reverse() : sortedLayerRanks;

    let currentX = startX;

    ranksOrder.forEach(rank => {
      const layerNodes = layers.get(rank) || [];
      const maxWidth = Math.max(...layerNodes.map(id => nodeMap.get(id)?.width || 160));

      let currentY = startY;
      layerNodes.forEach(id => {
        const node = nodeMap.get(id)!;
        node.x = currentX + (maxWidth - node.width) / 2;
        node.y = currentY;
        currentY += node.height + spacingY;
      });

      currentX += maxWidth + spacingX;
    });

    // Center columns vertically relative to each other
    let maxLayerHeight = 0;
    ranksOrder.forEach(rank => {
      const layerNodes = layers.get(rank) || [];
      const h =
        layerNodes.reduce((acc, id) => acc + (nodeMap.get(id)?.height || 70), 0) +
        (layerNodes.length - 1) * spacingY;
      if (h > maxLayerHeight) maxLayerHeight = h;
    });

    ranksOrder.forEach(rank => {
      const layerNodes = layers.get(rank) || [];
      const h =
        layerNodes.reduce((acc, id) => acc + (nodeMap.get(id)?.height || 70), 0) +
        (layerNodes.length - 1) * spacingY;
      const offset = (maxLayerHeight - h) / 2;
      layerNodes.forEach(id => {
        const node = nodeMap.get(id)!;
        node.y += offset;
      });
    });
  }

  return Array.from(nodeMap.values());
}
