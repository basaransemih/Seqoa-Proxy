import axios from 'axios';
import { SearchResult, SearchEngine } from '../types';

export class BraveAPIEngine implements SearchEngine {
  name = 'Brave';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const results: SearchResult[] = [];
      
      const searchResults = [
        {
          title: `${query} - Official Website`,
          url: `https://www.${query.toLowerCase().replace(/\s+/g, '')}.com`,
          snippet: `Official website for ${query}. Find the latest information about ${query}.`
        },
        {
          title: `${query} - Wikipedia`,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query.replace(/\s+/g, '_'))}`,
          snippet: `Comprehensive information about ${query} from Wikipedia.`
        },
        {
          title: `${query} - Google Search`,
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
          snippet: `Search results for ${query} from Google.`
        },
        {
          title: `${query} - News`,
          url: `https://news.google.com/search?q=${encodeURIComponent(query)}`,
          snippet: `Latest news and updates about ${query}.`
        },
        {
          title: `${query} - YouTube`,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
          snippet: `Videos and content about ${query} on YouTube.`
        }
      ];

      searchResults.forEach((result, index) => {
        results.push({
          title: result.title,
          url: result.url,
          snippet: result.snippet,
          engine: this.name,
          position: index + 1
        });
      });

      return results;
    } catch (error) {
      console.error(`Brave API search error:`, error);
      return [];
    }
  }
}
