import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchResult, SearchEngine } from '../types';

export class EcosiaEngine implements SearchEngine {
  name = 'Ecosia';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const response = await axios.get(`https://www.ecosia.org/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Referer': 'https://www.ecosia.org/'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const results: SearchResult[] = [];

      $('.result, .web-result, .search-result').each((index: number, element: any) => {
        const $result = $(element);
        const title = $result.find('h2 a, .result-title a').text().trim();
        const url = $result.find('h2 a, .result-title a').attr('href');
        let snippet = $result.find('.result-snippet, .description, .snippet').text().trim();

        if (!snippet) {
          snippet = $result.find('p').text().trim();
        }

        if (title && url && url.startsWith('http')) {
          results.push({
            title,
            url,
            snippet: snippet || `${title} - Ecosia search result for ${query}`,
            engine: this.name,
            position: results.length + 1
          });
        }
      });

      return results.slice(0, 10);
    } catch (error) {
      console.error(`Ecosia search error:`, error);
      return [];
    }
  }
}
