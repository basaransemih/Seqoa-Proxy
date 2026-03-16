import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchEngine, SearchResult } from '../types';

export class MojeekEngine implements SearchEngine {
  name = 'Mojeek';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const url = `https://www.mojeek.com/search?q=${encodeURIComponent(query)}&lang=tr`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 5000
      });

      const $ = cheerio.load(response.data);
      const results: SearchResult[] = [];

      // Try different selectors for Mojeek results
      const selectors = [
        '.result',
        '.search-result',
        '.standard-result',
        'div[class*="result"]',
        'article'
      ];

      for (const selector of selectors) {
        $(selector).each((index: number, element: any) => {
          const $result = $(element);
          const title = $result.find('h2 a, .title a, h3 a, a[href*="http"]').first().text().trim();
          const url = $result.find('h2 a, .title a, h3 a, a[href*="http"]').first().attr('href');
          const snippet = $result.find('.s, .description, .snippet, p').first().text().trim();

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
      console.error(`Mojeek search error:`, error);
      return [];
    }
  }
}
