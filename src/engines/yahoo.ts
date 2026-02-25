import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchResult, SearchEngine } from '../types';

export class YahooEngine implements SearchEngine {
  name = 'Yahoo';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const url = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}&n=10`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 5000
      });

      const $ = cheerio.load(response.data);
      const results: SearchResult[] = [];

      $('.algo-sr').each((index: number, element: any) => {
        const $result = $(element);
        const title = $result.find('h3 a').text().trim();
        const url = $result.find('h3 a').attr('href');
        const snippet = $result.find('.compText').text().trim();

        if (title && url && snippet) {
          results.push({
            title,
            url,
            snippet,
            engine: this.name,
            position: index + 1
          });
        }
      });

      return results.slice(0, 10);
    } catch (error) {
      console.error(`Yahoo search error:`, error);
      return [];
    }
  }
}
