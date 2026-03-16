import axios from 'axios';
import { SearchEngine, SearchResult } from '../types';

export class DuckDuckGoHTMLEngine implements SearchEngine {
  name = 'DuckDuckGo HTML';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const response = await axios.get(`https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        },
        timeout: 5000
      });

      const results: SearchResult[] = [];
      const html = response.data;
      
      // Extract results from HTML using regex patterns for DuckDuckGo HTML format
      const resultRegex = /<div[^>]*class="[^"]*result[^"]*"[^>]*>.*?<\/div>/gs;
      const matches = html.match(resultRegex) || [];

      matches.forEach((match: string, index: number) => {
        const titleMatch = match.match(/<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/s);
        const snippetMatch = match.match(/<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>(.*?)<\/a>/s);

        if (titleMatch) {
          const url = titleMatch[1];
          const title = titleMatch[2].replace(/<[^>]*>/g, '').trim();
          const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]*>/g, '').trim() : '';

          if (url && title) {
            results.push({
              title,
              url: url.startsWith('http') ? url : `https://duckduckgo.com${url}`,
              snippet,
              engine: this.name,
              position: index + 1
            });
          }
        }
      });

      return results.slice(0, 10);
    } catch (error) {
      console.error(`DuckDuckGo HTML error:`, error);
      return [];
    }
  }
}
