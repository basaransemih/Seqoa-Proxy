import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchResult, SearchEngine } from '../types';

export class YandexEngine implements SearchEngine {
  name = 'Yandex';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const response = await axios.get(`https://yandex.com/search/?text=${encodeURIComponent(query)}&numdoc=10`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Referer': 'https://yandex.com/'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const results: SearchResult[] = [];

      $('.organic, .serp-item, .b-serp-item').each((index: number, element: any) => {
        const $result = $(element);
        const title = $result.find('h2 a, .organic__title a, h3 a').text().trim();
        const url = $result.find('h2 a, .organic__title a, h3 a').attr('href');
        let snippet = $result.find('.text-container, .organic__content, .b-serp-item__text').text().trim();

        if (!snippet) {
          snippet = $result.find('.snippet, .description').text().trim();
        }

        if (title && url && url.startsWith('http')) {
          results.push({
            title,
            url,
            snippet: snippet || `${title} - Yandex search result for ${query}`,
            engine: this.name,
            position: results.length + 1
          });
        }
      });

      return results.slice(0, 10);
    } catch (error) {
      console.error(`Yandex search error:`, error);
      return [];
    }
  }
}
