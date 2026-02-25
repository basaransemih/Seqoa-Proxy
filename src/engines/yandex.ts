import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchResult, SearchEngine } from '../types';

export class YandexEngine implements SearchEngine {
  name = 'Yandex';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const url = `https://yandex.com/search/?text=${encodeURIComponent(query)}&numdoc=10`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate'
        },
        timeout: 8000
      });

      const $ = cheerio.load(response.data);
      const results: SearchResult[] = [];

      '.organic, .serp-item, .b-serp-item'.split(',').forEach(selector => {
        $(selector).each((index: number, element: any) => {
          const $result = $(element);
          const title = $result.find('h2 a, .organic__title a').text().trim();
          const url = $result.find('h2 a, .organic__title a').attr('href');
          const snippet = $result.find('.text-container, .organic__content').text().trim();

          if (title && url && snippet && url.startsWith('http')) {
            results.push({
              title,
              url,
              snippet,
              engine: this.name,
              position: results.length + 1
            });
          }
        });
      });

      return results.slice(0, 10);
    } catch (error) {
      console.error(`Yandex search error:`, error);
      return [];
    }
  }
}
