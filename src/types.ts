export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  engine: string;
  position: number;
}

export interface NewsResult extends SearchResult {
  pubDate?: string;
  source?: string;
}

export interface VideoResult extends SearchResult {
  duration?: string;
  thumbnail?: string;
  views?: string;
}

export interface ImageResult extends SearchResult {
  width?: number;
  height?: number;
  source_url?: string;
  thumbnail?: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  totalResults: number;
  engines: string[];
  responseTime: number;
}

export interface SearchEngine {
  name: string;
  search(query: string): Promise<SearchResult[]>;
}
