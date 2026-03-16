import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchEngine, SearchResult } from '../types';
import { cleanHtml, cleanUrl, validateResult } from '../utils/html-cleaner';

export class MarginaliaEngine implements SearchEngine {
  name = 'Marginalia';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const url = `https://search.marginalia.nu/search?q=${encodeURIComponent(query)}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      const results: SearchResult[] = [];

      // Enhanced selectors for Marginalia results
      const selectors = [
        '.result',
        '.search-result',
        '.entry',
        'div[class*="result"]',
        'article',
        'div[class*="entry"]',
        '.post',
        'div[class*="post"]'
      ];

      for (const selector of selectors) {
        $(selector).each((index: number, element: any) => {
          if (results.length >= 50) return false;
          
          const $result = $(element);
          const titleElement = $result.find('h2 a, .title a, h3 a, a[href*="http"]').first();
          const title = cleanHtml(titleElement.text());
          const rawUrl = titleElement.attr('href');
          const url = cleanUrl(rawUrl);
          
          // Try multiple snippet selectors
          const snippetElement = $result.find('.description, .snippet, .summary, p, .content').first();
          const snippet = cleanHtml(snippetElement.text());

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

      return results.slice(0, 50);
    } catch (error) {
      console.error(`Marginalia search error:`, error);
      return [];
    }
  }
}
