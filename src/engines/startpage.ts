import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchEngine, SearchResult } from '../types';

export class StartPageEngine implements SearchEngine {
  name = 'StartPage';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const url = `https://www.startpage.com/do/search?query=${encodeURIComponent(query)}&cat=web&pl=ext-ff&extVersion=1.3.0`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        },
        timeout: 5000
      });

      const $ = cheerio.load(response.data);
      const results: SearchResult[] = [];

      // Try different selectors for StartPage results
      const selectors = [
        '.w-gl__result',
        '.search-result',
        '.result',
        '.web-result',
        'div[class*="result"]'
      ];

      for (const selector of selectors) {
        $(selector).each((index: number, element: any) => {
          const $result = $(element);
          const title = $result.find('h3 a, .w-gl__result-title a, a[href*="http"]').first().text().trim();
          const url = $result.find('h3 a, .w-gl__result-title a, a[href*="http"]').first().attr('href');
          const snippet = $result.find('.w-gl__description, .description, .snippet, p').first().text().trim();

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
      }

      return results.slice(0, 10);
    } catch (error) {
      console.error(`StartPage search error:`, error);
      return [];
    }
  }
}
