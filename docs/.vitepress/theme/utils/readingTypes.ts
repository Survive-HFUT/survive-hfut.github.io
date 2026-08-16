export type ReadingStatus = 'unread' | 'reading' | 'read' | 'updated';

export type ArticleBlockType =
  | 'heading'
  | 'paragraph'
  | 'list'
  | 'table'
  | 'blockquote'
  | 'code'
  | 'image'
  | 'container';

export interface ArticleBlock {
  id: string;
  type: ArticleBlockType;
  headingPath: string[];
  text: string;
  raw?: string;
  level?: number;
  anchor?: string;
}

export interface ArticleSnapshot {
  path: string;
  version: string;
  savedAt: number;
  blocks: ArticleBlock[];
}

export interface ArticleChange {
  type: 'added' | 'modified' | 'deleted';
  section: string;
  anchor?: string;
  oldBlock?: ArticleBlock;
  newBlock?: ArticleBlock;
  oldIndex?: number;
  newIndex?: number;
  similarity?: number;
}

export interface ArticleReadingState {
  readVersion?: string;
  readAt?: number;
  lastOpenedAt?: number;
  scrollProgress?: number;
  lastHeading?: string;
  lastAnchor?: string;
  headingProgress?: number;
}

export interface ReadingState {
  version: 1;
  lastVisited?: string;
  articles: Record<string, ArticleReadingState>;
}

export interface ArticleVersionInfo {
  version: string;
}

export type ArticleVersionsData = Record<string, ArticleVersionInfo>;
