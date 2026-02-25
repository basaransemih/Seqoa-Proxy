import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchResult, SearchEngine } from '../types';

export class BraveFixedEngine implements SearchEngine {
  name = 'Brave';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const response = await axios.get(`https://search.brave.com/search?q=${encodeURIComponent(query)}&source=web`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Referer': 'https://search.brave.com/'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const results: SearchResult[] = [];

      $('[data-type="web"], .web-result, .result').each((index: number, element: any) => {
        const $result = $(element);
        const title = $result.find('h3 a, h4 a, .title a').text().trim();
        const url = $result.find('h3 a, h4 a, .title a').attr('href');
        let snippet = '';

        const snippetSelectors = [
          '.snippet',
          '.description', 
          '.result-description',
          'div[class*="snippet"]',
          'p',
          '.content'
        ];

        for (const selector of snippetSelectors) {
          snippet = $result.find(selector).text().trim();
          if (snippet && snippet.length > 20) break;
        }

        if (title && url && url.startsWith('http')) {
          results.push({
            title,
            url,
            snippet: snippet || `${title} - Brave search result for ${query}`,
            engine: this.name,
            position: results.length + 1
          });
        }
      });

      return results.slice(0, 10);
    } catch (error) {
      console.error(`Brave search error:`, error);
      return [];
    }
  }
}
