import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchResult, SearchEngine } from '../types';

export class SearxEngine implements SearchEngine {
  name = 'SearX';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const instances = [
        'https://searx.be',
        'https://search.brave.com/searx',
        'https://searx.thegreenplace.info'
      ];

      for (const instance of instances) {
        try {
          const url = `${instance}/search?q=${encodeURIComponent(query)}&format=json&engines=duckduckgo,google,startpage`;
          
          const response = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5'
            },
            timeout: 8000
          });

          if (response.headers['content-type']?.includes('application/json')) {
            const data = response.data;
            const results: SearchResult[] = [];

            if (data.results && Array.isArray(data.results)) {
              data.results.forEach((item: any, index: number) => {
                if (item.title && item.url && item.content) {
                  results.push({
                    title: item.title,
                    url: item.url,
                    snippet: item.content,
                    engine: this.name,
                    position: index + 1
                  });
                }
              });
            }

            if (results.length > 0) {
              return results.slice(0, 10);
            }
          } else {
            const $ = cheerio.load(response.data);
            const results: SearchResult[] = [];

            $('.result').each((index: number, element: any) => {
              const $result = $(element);
              const title = $result.find('h3 a').text().trim();
              const url = $result.find('h3 a').attr('href');
              const snippet = $result.find('.content').text().trim();

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

            if (results.length > 0) {
              return results.slice(0, 10);
            }
          }
        } catch (err) {
          continue;
        }
      }

      return [];
    } catch (error) {
      console.error(`SearX search error:`, error);
      return [];
    }
  }
}
