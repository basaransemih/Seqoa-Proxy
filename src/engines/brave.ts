import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchEngine, SearchResult } from '../types';
import { cleanHtml, cleanUrl, validateResult } from '../utils/html-cleaner';

export class BraveEngine implements SearchEngine {
  name = 'Brave';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const url = `https://search.brave.com/search?q=${encodeURIComponent(query)}&hl=tr&gl=TR`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none'
        },
        timeout: 8000
      });

      const $ = cheerio.load(response.data);
      const results: SearchResult[] = [];

      // Updated selectors for Brave's current HTML structure
      const selectors = [
        '#results .web-result',
        '.web-result',
        '[data-type="web"]',
        '.result',
        'div[class*="result"]',
        'div[class*="web"]'
      ];

      for (const selector of selectors) {
        $(selector).each((index: number, element: any) => {
          if (results.length >= 25) return false; // Limit per engine
          
          const $result = $(element);
          const titleElement = $result.find('h3 a, .title a, a[href*="http"]').first();
          const title = cleanHtml(titleElement.text());
          const rawUrl = titleElement.attr('href') || $result.find('a[href*="http"]').first().attr('href');
          const url = cleanUrl(rawUrl);
          const snippet = cleanHtml($result.find('.description, .snippet, .web-snippet, p').first().text());

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
        
        if (results.length > 0) break; // Stop if we found results with this selector
      }

      return results.slice(0, 25);
    } catch (error) {
      console.error(`Brave search error:`, error);
      return [];
    }
  }
}
