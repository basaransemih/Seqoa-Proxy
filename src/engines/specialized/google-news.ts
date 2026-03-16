import axios from 'axios';
import * as xml2js from 'xml2js';
import { SearchEngine, SearchResult, NewsResult } from '../../types';

export class GoogleNewsEngine implements SearchEngine {
  name = 'Google News RSS';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=tr&gl=TR&ceid=TR:tr`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml'
        },
        timeout: 5000
      });

      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(response.data);
      const results: SearchResult[] = [];

      if (result.rss && result.rss.channel && result.rss.channel[0] && result.rss.channel[0].item) {
        const items = result.rss.channel[0].item;
        
        items.forEach((item: any, index: number) => {
          const title = item.title[0];
          const link = item.link[0];
          const description = item.description[0];
          const pubDate = item.pubDate ? item.pubDate[0] : undefined;
          const source = item.source ? item.source[0]._ || item.source[0] : undefined;

          if (title && link) {
            const cleanDescription = description.replace(/<[^>]*>/g, '').trim();
            results.push({
              title,
              url: link,
              snippet: cleanDescription,
              engine: this.name,
              position: index + 1
            });
          }
        });
      }

      return results.slice(0, 10);
    } catch (error) {
      console.error(`Google News RSS error:`, error);
      return [];
    }
  }
}
