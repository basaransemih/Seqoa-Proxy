import axios from 'axios';
import { SearchEngine, SearchResult, VideoResult } from '../../types';

export class InvidiousEngine implements SearchEngine {
  name = 'Invidious (YouTube)';
  private instanceUrl = 'https://invidious.io'; // You can change this to any Invidious instance

  async search(query: string): Promise<SearchResult[]> {
    try {
      const response = await axios.get(`${this.instanceUrl}/api/v1/search`, {
        params: {
          q: query,
          type: 'video'
        },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json'
        },
        timeout: 5000
      });

      const results: SearchResult[] = [];
      const data = response.data;

      if (Array.isArray(data)) {
        data.forEach((item: any, index: number) => {
          if (item.title && item.videoId) {
            const url = `${this.instanceUrl}/watch?v=${item.videoId}`;
            const snippet = item.description || `Duration: ${item.lengthText || 'Unknown'} | Views: ${item.viewCount || 'Unknown'}`;
            
            results.push({
              title: item.title,
              url,
              snippet,
              engine: this.name,
              position: index + 1
            });
          }
        });
      }

      return results.slice(0, 10);
    } catch (error) {
      console.error(`Invidious search error:`, error);
      return [];
    }
  }
}
