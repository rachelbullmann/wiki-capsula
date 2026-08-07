export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface WikiLink {
  sourceId: string;
  targetTitle: string;
  targetId?: string; // Resolved note ID if exists
}

export interface Backlink {
  sourceNoteId: string;
  sourceNoteTitle: string;
  snippet: string;
}

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  type: 'note' | 'concept' | 'orphan';
  val: number; // weight / connection count
  tags: string[];
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  value?: number;
}

export type ViewMode = 'read' | 'edit' | 'graph' | 'split' | 'manage';
