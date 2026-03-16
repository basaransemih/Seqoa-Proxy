import axios from 'axios';
import { SearchEngine, SearchResult } from '../types';

export class SearXNGEngine implements SearchEngine {
  name = 'SearXNG';
  private instanceUrl = 'https://searx.be'; // You can change this to any SearXNG instance

  async search(query: string): Promise<SearchResult[]> {
    try {
      const response = await axios.get(`${this.instanceUrl}/search`, {
        params: {
          q: query,
          format: 'json',
          engines: 'google,duckduckgo,brave,wikipedia'
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.5'
        },
        timeout: 5000
      });

      const results: SearchResult[] = [];
      const data = response.data;

      if (data && data.results) {
        data.results.forEach((item: any, index: number) => {
          if (item.title && item.url && item.content) {
            results.push({
              title: item.title,
              url: item.url,
              snippet: item.content,
              engine: `${this.name} (${item.engine || 'unknown'})`,
              position: index + 1
            });
          }
        });
      }

      return results.slice(0, 10);
    } catch (error) {
      console.error(`SearXNG search error:`, error);
      return [];
    }
  }
}
