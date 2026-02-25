import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchResult, SearchEngine } from '../types';

export class BraveEngine implements SearchEngine {
  name = 'Brave';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const url = `https://search.brave.com/search?q=${encodeURIComponent(query)}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const results: SearchResult[] = [];

      $('.web-result, .result, .snippet').each((index: number, element: any) => {
        const $result = $(element);
        const title = $result.find('.title, h3 a, h4 a').text().trim();
        const url = $result.find('.title a, h3 a, h4 a').attr('href');
        let snippet = $result.find('.description, .snippet, .result-description').text().trim();

        if (!snippet) {
          snippet = $result.find('.result-snippet').text().trim();
        }

        if (!snippet) {
          snippet = $result.find('p').first().text().trim();
        }

        if (title && url && url.startsWith('http')) {
          const finalSnippet = snippet || `${title} - Brave search result for ${query}`;
          
          results.push({
            title,
            url,
            snippet: finalSnippet,
            engine: this.name,
            position: results.length + 1
          });
        }
      });

      if (results.length === 0) {
        $('div[data-type="web"]').each((index: number, element: any) => {
          const $result = $(element);
          const title = $result.find('h3 a').text().trim();
          const url = $result.find('h3 a').attr('href');
          const snippet = $result.find('div[class*="snippet"]').text().trim();

          if (title && url && url.startsWith('http')) {
            results.push({
              title,
              url,
              snippet: snippet || `${title} - Brave search result`,
              engine: this.name,
              position: results.length + 1
            });
          }
        });
      }

      return results.slice(0, 10);
    } catch (error) {
      console.error(`Brave search error:`, error);
      return [];
    }
  }
}
