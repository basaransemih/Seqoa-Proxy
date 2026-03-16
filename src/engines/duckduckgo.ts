import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchEngine, SearchResult } from '../types';
import { cleanHtml, cleanUrl, validateResult } from '../utils/html-cleaner';

export class DuckDuckGoEngine implements SearchEngine {
  name = 'DuckDuckGo';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        },
        timeout: 5000
      });

      const $ = cheerio.load(response.data);
      const results: SearchResult[] = [];

      $('.result').each((index: number, element: any) => {
        if (results.length >= 50) return false;
        
        const $result = $(element);
        const titleElement = $result.find('h2 a').first();
        const title = cleanHtml(titleElement.text());
        const rawUrl = titleElement.attr('href');
        const url = cleanUrl(rawUrl);
        const snippet = cleanHtml($result.find('.result__snippet').first().text());

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

      return results.slice(0, 50);
    } catch (error) {
      console.error(`DuckDuckGo search error:`, error);
      return [];
    }
  }
}
