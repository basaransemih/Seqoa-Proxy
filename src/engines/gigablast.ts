import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchEngine, SearchResult } from '../types';

export class GigablastEngine implements SearchEngine {
  name = 'Gigablast';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const response = await axios.get(`https://gigablast.com/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        },
        timeout: 5000
      });

      const $ = cheerio.load(response.data);
      const results: SearchResult[] = [];

      // Gigablast has a very simple HTML structure from the 2000s
      $('.result, .search-result, td[height="120"]').each((index: number, element: any) => {
        const $result = $(element);
        const title = $result.find('a[href*="http"]').first().text().trim();
        const url = $result.find('a[href*="http"]').first().attr('href');
        const snippet = $result.text().replace(title, '').trim();

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
      console.error(`Gigablast search error:`, error);
      return [];
    }
  }
}
