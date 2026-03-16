import axios from 'axios';
import { SearchEngine, SearchResult } from '../types';

export class BraveSearchEngine implements SearchEngine {
  name = 'Brave Search';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const response = await axios.get(`https://search.brave.com/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 5000
      });

      const results: SearchResult[] = [];
      const html = response.data;
      
      // Extract results from HTML using regex patterns
      const resultRegex = /<div[^>]*class="[^"]*result[^"]*"[^>]*>.*?<\/div>/gs;
      const matches = html.match(resultRegex) || [];

      matches.forEach((match: string, index: number) => {
        const titleMatch = match.match(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/s);
        const urlMatch = match.match(/<a[^>]*href="([^"]*)"/);
        const snippetMatch = match.match(/<div[^>]*class="[^"]*snippet[^"]*"[^>]*>(.*?)<\/div>/s);

        if (titleMatch && urlMatch) {
          const url = urlMatch[1];
          const title = titleMatch[2].replace(/<[^>]*>/g, '').trim();
          const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]*>/g, '').trim() : '';

          if (url && title) {
            results.push({
              title,
              url: url.startsWith('http') ? url : `https://search.brave.com${url}`,
              snippet,
              engine: this.name,
              position: index + 1
            });
          }
        }
      });

      return results.slice(0, 10);
    } catch (error) {
      console.error(`Brave Search error:`, error);
      return [];
    }
  }
}
