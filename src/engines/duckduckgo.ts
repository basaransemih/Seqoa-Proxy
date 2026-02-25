import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchResult, SearchEngine } from '../types';

export class DuckDuckGoEngine implements SearchEngine {
  name = 'DuckDuckGo';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const urls = [
        `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
        `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`
      ];

      for (const url of urls) {
        try {
          const response = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Accept-Encoding': 'gzip, deflate, br',
              'Connection': 'keep-alive',
              'DNT': '1',
              'Upgrade-Insecure-Requests': '1'
            },
            timeout: 10000
          });

          const $ = cheerio.load(response.data);
          const results: SearchResult[] = [];

          $('.result').each((index: number, element: any) => {
            const $result = $(element);
            const title = $result.find('.result__a').text().trim();
            const url = $result.find('.result__a').attr('href');
            const snippet = $result.find('.result__snippet').text().trim();

            if (title && url) {
              let cleanUrl = url;
              if (url.startsWith('/l/?uddg=')) {
                cleanUrl = decodeURIComponent(url.split('uddg=')[1].split('&')[0]);
              } else if (url.startsWith('//')) {
                cleanUrl = 'https:' + url;
              } else if (url.startsWith('/')) {
                cleanUrl = 'https://duckduckgo.com' + url;
              }

              const finalSnippet = snippet || `${title} - Find more information about ${title}`;

              results.push({
                title,
                url: cleanUrl,
                snippet: finalSnippet,
                engine: this.name,
                position: index + 1
              });
            }
          });

          if (results.length > 0) {
            return results.slice(0, 10);
          }
        } catch (err) {
          continue;
        }
      }

      return [];
    } catch (error) {
      console.error(`DuckDuckGo search error:`, error);
      return [];
    }
  }
}
