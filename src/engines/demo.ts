import { SearchResult, SearchEngine } from '../types';

export class DemoEngine implements SearchEngine {
  name = 'Demo';

  async search(query: string): Promise<SearchResult[]> {
    const demoResults: SearchResult[] = [
      {
        title: `${query} - Wikipedia`,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
        snippet: `Information about ${query} from Wikipedia. This is a comprehensive resource covering various aspects of ${query} including history, geography, culture, and more.`,
        engine: this.name,
        position: 1
      },
      {
        title: `${query} - Official Website`,
        url: `https://www.${query.toLowerCase().replace(/\s+/g, '')}.com`,
        snippet: `Official website for ${query}. Find the latest news, updates, and official information about ${query}.`,
        engine: this.name,
        position: 2
      },
      {
        title: `${query} News and Updates`,
        url: `https://news.google.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Latest news and updates about ${query}. Stay informed with recent developments and breaking news related to ${query}.`,
        engine: this.name,
        position: 3
      },
      {
        title: `${query} - Travel Guide`,
        url: `https://www.tripadvisor.com/Search?q=${encodeURIComponent(query)}`,
        snippet: `Travel guide and tourism information for ${query}. Find attractions, hotels, restaurants, and travel tips for visiting ${query}.`,
        engine: this.name,
        position: 4
      },
      {
        title: `${query} - Maps and Location`,
        url: `https://www.google.com/maps/search/${encodeURIComponent(query)}`,
        snippet: `Interactive map showing the location of ${query}. Get directions, nearby places, and geographical information about ${query}.`,
        engine: this.name,
        position: 5
      }
    ];

    return demoResults;
  }
}
