// Types for Interactive/Multiruta Stories

// ============================================
// ENUMS
// ============================================

export type NodeType = 'CONTENT' | 'DECISION' | 'ENDING';

// ============================================
// DATABASE MODELS
// ============================================

export interface StoryNode {
  id: string;
  storyId: string;
  title: string;
  content: string;
  nodeType: NodeType;
  position: number;
  isStart: boolean;
  isEnding: boolean;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  // Relations (populated)
  outgoingChoices?: Choice[];
  incomingChoices?: Choice[];
}

export interface Choice {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  text: string;
  emoji?: string | null;
  position: number;
  timesChosen: number;
  createdAt: string;
  // Relations (populated)
  fromNode?: StoryNode;
  toNode?: StoryNode;
}

export interface InteractiveStory {
  id: string;
  title: string;
  isInteractive: boolean;
  published: boolean;
  coverImageUrl?: string | null;
  author?: {
    id: string;
    name: string | null;
  };
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

// GET /api/stories/[id]/structure
export interface StoryStructureResponse {
  success: boolean;
  story: InteractiveStory;
  nodes: StoryNode[];
  choices: Choice[];
  stats: {
    totalNodes: number;
    totalEndings: number;
    totalChoices: number;
    totalWords: number;
  };
}

// POST /api/stories/[id]/nodes
export interface CreateNodeRequest {
  title: string;
  content: string;
  nodeType?: NodeType;
  isStart?: boolean;
  isEnding?: boolean;
  position?: number;
}

export interface CreateNodeResponse {
  success: boolean;
  node: StoryNode;
}

// PUT /api/stories/[id]/nodes/[nodeId]
export interface UpdateNodeRequest {
  title?: string;
  content?: string;
  nodeType?: NodeType;
  isStart?: boolean;
  isEnding?: boolean;
  position?: number;
}

// POST /api/stories/[id]/choices
export interface CreateChoiceRequest {
  fromNodeId: string;
  toNodeId: string;
  text: string;
  emoji?: string;
  position?: number;
}

export interface CreateChoiceResponse {
  success: boolean;
  choice: Choice;
}

// POST /api/stories/[id]/convert
export interface ConvertToInteractiveResponse {
  success: boolean;
  startNode: StoryNode;
}

// ============================================
// READER STATE
// ============================================

export interface ReaderState {
  currentNodeId: string;
  visitedNodes: string[];
  choicesMade: Array<{
    choiceId: string;
    nodeId: string;
    timestamp: Date;
  }>;
  startedAt: Date;
}

// ============================================
// UI COMPONENT PROPS
// ============================================

export interface InteractiveReaderProps {
  storyId: string;
}

export interface ChoiceButtonsProps {
  choices: Choice[];
  onChoose: (choice: Choice) => void;
  disabled?: boolean;
}

export interface NodeContentProps {
  node: StoryNode;
  isEnding?: boolean;
}

// ============================================
// HELPER TYPES
// ============================================

export interface StoryPath {
  nodes: StoryNode[];
  choices: Choice[];
  endingType?: 'good' | 'bad' | 'neutral';
}

// Simplified node for graph visualization
export interface GraphNode {
  id: string;
  title: string;
  type: NodeType;
  isStart: boolean;
  isEnding: boolean;
  position: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}
