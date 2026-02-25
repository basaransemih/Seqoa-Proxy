import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchResult, SearchEngine } from '../types';

export class QwantEngine implements SearchEngine {
  name = 'Qwant';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const url = `https://www.qwant.com/?q=${encodeURIComponent(query)}&t=web`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 5000
      });

      const $ = cheerio.load(response.data);
      const results: SearchResult[] = [];

      '.result, .web, .result-item'.split(',').forEach(selector => {
        $(selector).each((index: number, element: any) => {
          const $result = $(element);
          const title = $result.find('a').first().text().trim();
          const url = $result.find('a').first().attr('href');
          const snippet = $result.find('.desc, .description, .snippet').text().trim();

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
      console.error(`Qwant search error:`, error);
      return [];
    }
  }
}
