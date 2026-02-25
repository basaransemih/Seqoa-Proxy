export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  engine: string;
  position: number;
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
