import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchEngine, SearchResult } from '../types';
import { cleanHtml, cleanUrl, validateResult } from '../utils/html-cleaner';

export class QwantEngine implements SearchEngine {
  name = 'Qwant';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const url = `https://www.qwant.com/?q=${encodeURIComponent(query)}&t=web&locale=tr_TR`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        },
        timeout: 5000
      });

      const $ = cheerio.load(response.data);
      const results: SearchResult[] = [];

      // Try different selectors for Qwant results
      const selectors = [
        '.result',
        '.web-result',
        '.search-result',
        'div[class*="result"]',
        'article'
      ];

      for (const selector of selectors) {
        $(selector).each((index: number, element: any) => {
          if (results.length >= 25) return false;
          
          const $result = $(element);
          const titleElement = $result.find('h3 a, .title a, a[href*="http"]').first();
          const title = cleanHtml(titleElement.text());
          const rawUrl = titleElement.attr('href');
          const url = cleanUrl(rawUrl);
          const snippet = cleanHtml($result.find('.description, .snippet, p').first().text());

          if (validateResult(title, url, snippet)) {
            results.push({
              title,
              url: url!,
              snippet,
              engine: this.name,
              position: results.length + 1
            });
          }
        });
        
        if (results.length > 0) break;
      }

      return results.slice(0, 25);
    } catch (error) {
      console.error(`Qwant search error:`, error);
      return [];
    }
  }
}
