import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchEngine, SearchResult } from '../types';

export class BraveEngine implements SearchEngine {
  name = 'Brave';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const url = `https://search.brave.com/search?q=${encodeURIComponent(query)}`;
      const response = await axios.get(url, {
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

      const $ = cheerio.load(response.data);
      const results: SearchResult[] = [];

      $('.web-result, .result').each((index: number, element: any) => {
        const $result = $(element);
        const title = $result.find('h3 a, .title a').text().trim();
        const url = $result.find('h3 a, .title a').attr('href');
        const snippet = $result.find('.description, .snippet').text().trim();

        if (title && url && snippet && url.startsWith('http')) {
          results.push({
            title,
            url,
            snippet,
            engine: this.name,
            position: results.length + 1
          });
        }
      });

      return results.slice(0, 10);
    } catch (error) {
      console.error(`Brave search error:`, error);
      return [];
    }
  }
}
