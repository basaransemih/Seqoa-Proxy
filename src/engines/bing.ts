import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchResult, SearchEngine } from '../types';

export class BingEngine implements SearchEngine {
  name = 'Bing';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&count=10`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const results: SearchResult[] = [];

      $('.b_algo').each((index: number, element: any) => {
        const $result = $(element);
        const title = $result.find('h2 a').text().trim();
        const url = $result.find('h2 a').attr('href');
        let snippet = $result.find('.b_caption p').text().trim();

        if (!snippet) {
          snippet = $result.find('.b_snippet').text().trim();
        }

        if (!snippet) {
          snippet = $result.find('.b_attribution').next().text().trim();
        }

        if (title && url && url.startsWith('http')) {
          const finalSnippet = snippet || `${title} - Bing search result for ${query}`;
          
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
        $('.b_something').each((index: number, element: any) => {
          const $result = $(element);
          const title = $result.find('h2 a').text().trim();
          const url = $result.find('h2 a').attr('href');
          const snippet = $result.find('.b_caption p').text().trim();

          if (title && url && url.startsWith('http')) {
            results.push({
              title,
              url,
              snippet: snippet || `${title} - Bing search result`,
              engine: this.name,
              position: results.length + 1
            });
          }
        });
      }

      return results.slice(0, 10);
    } catch (error) {
      console.error(`Bing search error:`, error);
      return [];
    }
  }
}
