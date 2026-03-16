import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchEngine, SearchResult, ImageResult } from '../../types';

export class QwantImagesEngine implements SearchEngine {
  name = 'Qwant Images';

  async search(query: string): Promise<SearchResult[]> {
    try {
      const response = await axios.get(`https://www.qwant.com/?q=${encodeURIComponent(query)}&t=images`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        },
        timeout: 5000
      });

      const $ = cheerio.load(response.data);
      const results: SearchResult[] = [];

      // Try to extract JSON data from script tags first
      const scriptTags = $('script').toArray();
      for (const script of scriptTags) {
        const scriptContent = $(script).html();
        if (scriptContent && scriptContent.includes('window.__INITIAL_STATE__')) {
          try {
            const jsonMatch = scriptContent.match(/window\.__INITIAL_STATE__\s*=\s*({.*?});/s);
            if (jsonMatch) {
              const jsonData = JSON.parse(jsonMatch[1]);
              const imageResults = this.extractImagesFromJSON(jsonData);
              results.push(...imageResults);
            }
          } catch (e) {
            // Continue with HTML parsing if JSON extraction fails
          }
        }
      }

      // Fallback to HTML parsing
      if (results.length === 0) {
        $('.images-result, .image-result, .result').each((index: number, element: any) => {
          const $result = $(element);
          const title = $result.find('img').attr('alt') || $result.find('.title').text().trim();
          const url = $result.find('a').attr('href') || $result.find('img').attr('src');
          const snippet = `Image: ${title}`;

          if (url && title) {
            const finalUrl = url.startsWith('http') ? url : `https://www.qwant.com${url}`;
            results.push({
              title,
              url: finalUrl,
              snippet,
              engine: this.name,
              position: results.length + 1
            });
          }
        });
      }

      return results.slice(0, 10);
    } catch (error) {
      console.error(`Qwant Images search error:`, error);
      return [];
    }
  }

  private extractImagesFromJSON(jsonData: any): SearchResult[] {
    const results: SearchResult[] = [];
    
    try {
      // Navigate through Qwant's JSON structure for images
      if (jsonData && jsonData.images && jsonData.images.results) {
        const imageResults = jsonData.images.results;
        
        imageResults.forEach((item: any, index: number) => {
          if (item.title && item.media) {
            results.push({
              title: item.title,
              url: item.media,
              snippet: `Width: ${item.width || 'Unknown'} | Height: ${item.height || 'Unknown'}`,
              engine: this.name,
              position: index + 1
            });
          }
        });
      }
    } catch (e) {
      // JSON parsing failed, return empty array
    }
    
    return results;
  }
}
