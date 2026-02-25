import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchResult, SearchEngine } from '../types';

export class MarginaliaEngine implements SearchEngine {
  name = 'Marginalia';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const url = `https://search.marginalia.nu/search?q=${encodeURIComponent(query)}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 5000
      });

      const $ = cheerio.load(response.data);
      const results: SearchResult[] = [];

      '.result, .search-result, .entry'.split(',').forEach(selector => {
        $(selector).each((index: number, element: any) => {
          const $result = $(element);
          const title = $result.find('h2 a, .title a, h3 a').text().trim();
          const url = $result.find('h2 a, .title a, h3 a').attr('href');
          const snippet = $result.find('.description, .snippet, .summary').text().trim();

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
      });

      return results.slice(0, 10);
    } catch (error) {
      console.error(`Marginalia search error:`, error);
      return [];
    }
  }
}
