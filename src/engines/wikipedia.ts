import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchResult, SearchEngine } from '../types';

export class WikipediaEngine implements SearchEngine {
  name = 'Wikipedia';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=10`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'MetaSearchProxy/1.0'
        },
        timeout: 5000
      });

      const results: SearchResult[] = [];
      
      if (response.data.query && response.data.query.search) {
        response.data.query.search.forEach((item: any, index: number) => {
          const title = item.title;
          const snippet = item.snippet.replace(/<[^>]*>/g, '');
          const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;

          results.push({
            title,
            url,
            snippet,
            engine: this.name,
            position: index + 1
          });
        });
      }

      return results;
    } catch (error) {
      console.error(`Wikipedia search error:`, error);
      return [];
    }
  }
}
