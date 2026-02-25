import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchResult, SearchEngine } from '../types';

export class QwantEngine implements SearchEngine {
  name = 'Qwant';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const response = await axios.get(`https://www.qwant.com/?q=${encodeURIComponent(query)}&t=web`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Referer': 'https://www.qwant.com/'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const results: SearchResult[] = [];

      $('.result, .web, .result-item, div[data-testid="webResult"]').each((index: number, element: any) => {
        const $result = $(element);
        const title = $result.find('a').first().text().trim();
        const url = $result.find('a').first().attr('href');
        let snippet = $result.find('.desc, .description, .snippet, p').text().trim();

        if (!snippet) {
          snippet = $result.find('div[class*="desc"]').text().trim();
        }

        if (title && url && url.startsWith('http')) {
          results.push({
            title,
            url,
            snippet: snippet || `${title} - Qwant search result for ${query}`,
            engine: this.name,
            position: results.length + 1
          });
        }
      });

      return results.slice(0, 10);
    } catch (error) {
      console.error(`Qwant search error:`, error);
      return [];
    }
  }
}
