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
  searchType?: 'web' | 'news' | 'video' | 'image';
}

export interface NewsResponse {
  query: string;
  results: NewsResult[];
  totalResults: number;
  engines: string[];
  responseTime: number;
  searchType: 'news';
}

export interface VideoResponse {
  query: string;
  results: VideoResult[];
  totalResults: number;
  engines: string[];
  responseTime: number;
  searchType: 'video';
}

export interface ImageResponse {
  query: string;
  results: ImageResult[];
  totalResults: number;
  engines: string[];
  responseTime: number;
  searchType: 'image';
}

export interface SearchEngine {
  name: string;
  search(query: string): Promise<SearchResult[]>;
  searchNews?(query: string): Promise<NewsResult[]>;
  searchVideo?(query: string): Promise<VideoResult[]>;
  searchImage?(query: string): Promise<ImageResult[]>;
}
