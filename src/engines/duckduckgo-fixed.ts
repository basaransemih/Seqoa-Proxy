import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchResult, SearchEngine } from '../types';

export class DuckDuckGoFixedEngine implements SearchEngine {
  name = 'DuckDuckGo';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const response = await axios.get(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&pretty=1`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MetaSearchProxy/1.0)'
        },
        timeout: 8000
      });

      const results: SearchResult[] = [];
      
      if (response.data.RelatedTopics && Array.isArray(response.data.RelatedTopics)) {
        response.data.RelatedTopics.forEach((item: any, index: number) => {
          if (item.Text && item.FirstURL) {
            const title = item.Text.split(' - ')[0] || item.Text;
            const url = item.FirstURL;
            const snippet = item.Text;

            if (url.startsWith('http') && title) {
              results.push({
                title: title.trim(),
                url,
                snippet: snippet || `${title} - DuckDuckGo search result`,
                engine: this.name,
                position: index + 1
              });
            }
          }
        });
      }

      if (results.length === 0 && response.data.Abstract) {
        results.push({
          title: response.data.Heading || query,
          url: response.data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
          snippet: response.data.Abstract,
          engine: this.name,
          position: 1
        });
      }

      return results.slice(0, 10);
    } catch (error) {
      console.error(`DuckDuckGo search error:`, error);
      return [];
    }
  }
}
