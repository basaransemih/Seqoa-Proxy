import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchEngine, SearchResult } from '../types';
import { cleanHtml, cleanUrl, validateResult } from '../utils/html-cleaner';

export class BraveEngine implements SearchEngine {
  name = 'Brave';

  async search(query: string): Promise<SearchResult[]> {
    try {
      // Remove Turkish language parameters
      const url = `https://search.brave.com/search?q=${encodeURIComponent(query)}&count=50`;
      console.log(`Brave searching: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        },
        timeout: 15000
      });

      console.log(`Brave web response status: ${response.status}`);
      const $ = cheerio.load(response.data);
      const results: SearchResult[] = [];

      // Very basic selector for JS-rendered content
      const selectors = [
        'a[href*="http"]',
        '.web-result a',
        '[data-type="web"] a',
        'h3 a',
        '.result a'
      ];

      for (const selector of selectors) {
        $(selector).each((index: number, element: any) => {
          if (results.length >= 50) return false;
          
          const $result = $(element);
          const title = cleanHtml($result.text());
          const rawUrl = $result.attr('href');
          const url = cleanUrl(rawUrl);
          
          // Use title as snippet if no description available
          const snippet = title;

          if (validateResult(title, url, snippet)) {
            console.log(`Adding scraped result: ${title} - ${url}`);
            results.push({
              title,
              url: url || '',
              snippet,
              engine: this.name,
              position: results.length + 1
            });
          }
        });
        
        if (results.length > 0) {
          console.log(`Found ${results.length} results with selector: ${selector}`);
          break;
        }
      }

      console.log(`Brave total results: ${results.length}`);
      return results.slice(0, 50);
    } catch (error) {
      console.error(`Brave search error:`, error);
      return [];
    }
  }
}
