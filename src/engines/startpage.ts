import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchEngine, SearchResult } from '../types';
import { cleanHtml, cleanUrl, validateResult } from '../utils/html-cleaner';

export class StartPageEngine implements SearchEngine {
  name = 'StartPage';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const url = `https://www.startpage.com/do/search?query=${encodeURIComponent(query)}&cat=web&pl=ext-ff&extVersion=1.3.0&with_date=y`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 12000
      });

      const $ = cheerio.load(response.data);
      const results: SearchResult[] = [];

      // Enhanced selectors for StartPage results
      const selectors = [
        '.w-gl__result',
        '.w-gl__result[data-ns="web"]',
        '.search-result',
        '.result',
        '.web-result',
        'div[class*="result"]',
        'article[data-ns="web"]',
        '.w-gl'
      ];

      for (const selector of selectors) {
        $(selector).each((index: number, element: any) => {
          if (results.length >= 50) return false;
          
          const $result = $(element);
          const titleElement = $result.find('h3 a, .w-gl__result-title a, a[href*="http"]').first();
          const title = cleanHtml(titleElement.text());
          const rawUrl = titleElement.attr('href');
          const url = cleanUrl(rawUrl);
          
          // Try multiple snippet selectors
          const snippetElement = $result.find('.w-gl__description, .description, .snippet, p').first();
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
      console.error(`StartPage search error:`, error);
      return [];
    }
  }
}
