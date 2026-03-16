import { SearchEngine, SearchResult, NewsResult, VideoResult, ImageResult } from './types';
import { DuckDuckGoEngine } from './engines/duckduckgo';
import { BraveEngine } from './engines/brave';
import { QwantEngine } from './engines/qwant';
import { MojeekEngine } from './engines/mojeek';
import { AskEngine } from './engines/ask';
import { MarginaliaEngine } from './engines/marginalia';

export class MetaSearch {
  private engines: SearchEngine[] = [
    new DuckDuckGoEngine(),
    new BraveEngine(),
    new QwantEngine(),
    new MojeekEngine(),
    new AskEngine(),
    new MarginaliaEngine()
  ];

  async searchAll(query: string, maxResults: number = 70): Promise<{
    results: SearchResult[];
    engines: string[];
    totalResults: number;
  }> {
    const startTime = Date.now();
    
    // Ensure minimum 70 results
    const targetResults = Math.max(maxResults, 70);
    
    const searchPromises = this.engines.map(async (engine) => {
      try {
        const results = await Promise.race([
          engine.search(query),
          new Promise<SearchResult[]>((resolve) => 
            setTimeout(() => resolve([]), 12000)
          )
        ]);
        return { engine: engine.name, results };
      } catch (error) {
        console.error(`Error in ${engine.name}:`, error);
        return { engine: engine.name, results: [] };
      }
    });

    const searchResults = await Promise.all(searchPromises);
    const allResults: SearchResult[] = [];
    const successfulEngines: string[] = [];

    searchResults.forEach(({ engine, results }) => {
      if (results.length > 0) {
        successfulEngines.push(engine);
        allResults.push(...results);
      }
    });

    const uniqueResults = this.deduplicateResults(allResults, query);
    const finalResults = uniqueResults.slice(0, targetResults);

    return {
      results: finalResults,
      engines: successfulEngines,
      totalResults: finalResults.length
    };
  }

  private deduplicateResults(results: SearchResult[], query: string): SearchResult[] {
    const seen = new Set<string>();
    const unique: SearchResult[] = [];

    for (const result of results) {
      // More flexible deduplication - only exact URL matches
      const key = result.url.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(result);
      }
    }

    return unique.sort((a, b) => {
      const scoreA = this.calculateScore(a, query);
      const scoreB = this.calculateScore(b, query);
      return scoreB - scoreA;
    });
  }

  private calculateScore(result: SearchResult, query: string): number {
    let score = 10;
    
    if (result.title.toLowerCase().includes(query.toLowerCase())) score += 5;
    if (result.snippet.toLowerCase().includes(query.toLowerCase())) score += 3;
    if (result.url.includes('wikipedia.org')) score += 2;
    if (result.url.includes('.edu')) score += 2;
    if (result.url.includes('.gov')) score += 2;
    
    score -= result.position * 0.1;
    
    return score;
  }

  async searchByEngine(query: string, engineNames: string[]): Promise<{
    results: SearchResult[];
    engines: string[];
    totalResults: number;
  }> {
    const selectedEngines = this.engines.filter(engine => 
      engineNames.includes(engine.name)
    );

    if (selectedEngines.length === 0) {
      return { results: [], engines: [], totalResults: 0 };
    }

    const searchPromises = selectedEngines.map(async (engine) => {
      try {
        const results = await Promise.race([
          engine.search(query),
          new Promise<SearchResult[]>((resolve) => 
            setTimeout(() => resolve([]), 12000)
          )
        ]);
        return { engine: engine.name, results };
      } catch (error) {
        console.error(`Error in ${engine.name}:`, error);
        return { engine: engine.name, results: [] };
      }
    });

    const searchResults = await Promise.all(searchPromises);
    const allResults: SearchResult[] = [];
    const successfulEngines: string[] = [];

    searchResults.forEach(({ engine, results }) => {
      if (results.length > 0) {
        successfulEngines.push(engine);
        allResults.push(...results);
      }
    });

    const uniqueResults = this.deduplicateResults(allResults, query);

    return {
      results: uniqueResults,
      engines: successfulEngines,
      totalResults: uniqueResults.length
    };
  }

  getAvailableEngines(): string[] {
    return this.engines.map(engine => engine.name);
  }

  // News search methods
  async searchAllNews(query: string, maxResults: number = 50): Promise<{
    results: NewsResult[];
    engines: string[];
    totalResults: number;
  }> {
    const startTime = Date.now();
    const targetResults = Math.max(maxResults, 50);
    
    const searchPromises = this.engines.map(async (engine) => {
      try {
        if (engine.searchNews) {
          const results = await Promise.race([
            engine.searchNews(query),
            new Promise<NewsResult[]>((resolve) => 
              setTimeout(() => resolve([]), 8000)
            )
          ]);
          return { engine: engine.name, results };
        }
        return { engine: engine.name, results: [] };
      } catch (error) {
        console.error(`Error in ${engine.name} news search:`, error);
        return { engine: engine.name, results: [] };
      }
    });

    const searchResults = await Promise.all(searchPromises);
    const allResults: NewsResult[] = [];
    const successfulEngines: string[] = [];

    searchResults.forEach(({ engine, results }) => {
      if (results.length > 0) {
        successfulEngines.push(engine);
        allResults.push(...results);
      }
    });

    const uniqueResults = this.deduplicateNewsResults(allResults, query);
    const finalResults = uniqueResults.slice(0, targetResults);

    return {
      results: finalResults,
      engines: successfulEngines,
      totalResults: finalResults.length
    };
  }

  async searchNewsByEngine(query: string, engineNames: string[]): Promise<{
    results: NewsResult[];
    engines: string[];
    totalResults: number;
  }> {
    const selectedEngines = this.engines.filter(engine => 
      engineNames.includes(engine.name) && engine.searchNews
    );

    if (selectedEngines.length === 0) {
      return { results: [], engines: [], totalResults: 0 };
    }

    const searchPromises = selectedEngines.map(async (engine) => {
      try {
        const results = await Promise.race([
          engine.searchNews!(query),
          new Promise<NewsResult[]>((resolve) => 
            setTimeout(() => resolve([]), 8000)
          )
        ]);
        return { engine: engine.name, results };
      } catch (error) {
        console.error(`Error in ${engine.name} news search:`, error);
        return { engine: engine.name, results: [] };
      }
    });

    const searchResults = await Promise.all(searchPromises);
    const allResults: NewsResult[] = [];
    const successfulEngines: string[] = [];

    searchResults.forEach(({ engine, results }) => {
      if (results.length > 0) {
        successfulEngines.push(engine);
        allResults.push(...results);
      }
    });

    const uniqueResults = this.deduplicateNewsResults(allResults, query);

    return {
      results: uniqueResults,
      engines: successfulEngines,
      totalResults: uniqueResults.length
    };
  }

  // Video search methods
  async searchAllVideo(query: string, maxResults: number = 50): Promise<{
    results: VideoResult[];
    engines: string[];
    totalResults: number;
  }> {
    const targetResults = Math.max(maxResults, 50);
    
    const searchPromises = this.engines.map(async (engine) => {
      try {
        if (engine.searchVideo) {
          const results = await Promise.race([
            engine.searchVideo(query),
            new Promise<VideoResult[]>((resolve) => 
              setTimeout(() => resolve([]), 8000)
            )
          ]);
          return { engine: engine.name, results };
        }
        return { engine: engine.name, results: [] };
      } catch (error) {
        console.error(`Error in ${engine.name} video search:`, error);
        return { engine: engine.name, results: [] };
      }
    });

    const searchResults = await Promise.all(searchPromises);
    const allResults: VideoResult[] = [];
    const successfulEngines: string[] = [];

    searchResults.forEach(({ engine, results }) => {
      if (results.length > 0) {
        successfulEngines.push(engine);
        allResults.push(...results);
      }
    });

    const uniqueResults = this.deduplicateVideoResults(allResults, query);
    const finalResults = uniqueResults.slice(0, targetResults);

    return {
      results: finalResults,
      engines: successfulEngines,
      totalResults: finalResults.length
    };
  }

  async searchVideoByEngine(query: string, engineNames: string[]): Promise<{
    results: VideoResult[];
    engines: string[];
    totalResults: number;
  }> {
    const selectedEngines = this.engines.filter(engine => 
      engineNames.includes(engine.name) && engine.searchVideo
    );

    if (selectedEngines.length === 0) {
      return { results: [], engines: [], totalResults: 0 };
    }

    const searchPromises = selectedEngines.map(async (engine) => {
      try {
        const results = await Promise.race([
          engine.searchVideo!(query),
          new Promise<VideoResult[]>((resolve) => 
            setTimeout(() => resolve([]), 8000)
          )
        ]);
        return { engine: engine.name, results };
      } catch (error) {
        console.error(`Error in ${engine.name} video search:`, error);
        return { engine: engine.name, results: [] };
      }
    });

    const searchResults = await Promise.all(searchPromises);
    const allResults: VideoResult[] = [];
    const successfulEngines: string[] = [];

    searchResults.forEach(({ engine, results }) => {
      if (results.length > 0) {
        successfulEngines.push(engine);
        allResults.push(...results);
      }
    });

    const uniqueResults = this.deduplicateVideoResults(allResults, query);

    return {
      results: uniqueResults,
      engines: successfulEngines,
      totalResults: uniqueResults.length
    };
  }

  // Images search methods
  async searchAllImages(query: string, maxResults: number = 50): Promise<{
    results: ImageResult[];
    engines: string[];
    totalResults: number;
  }> {
    const targetResults = Math.max(maxResults, 50);
    
    const searchPromises = this.engines.map(async (engine) => {
      try {
        if (engine.searchImage) {
          const results = await Promise.race([
            engine.searchImage(query),
            new Promise<ImageResult[]>((resolve) => 
              setTimeout(() => resolve([]), 8000)
            )
          ]);
          return { engine: engine.name, results };
        }
        return { engine: engine.name, results: [] };
      } catch (error) {
        console.error(`Error in ${engine.name} image search:`, error);
        return { engine: engine.name, results: [] };
      }
    });

    const searchResults = await Promise.all(searchPromises);
    const allResults: ImageResult[] = [];
    const successfulEngines: string[] = [];

    searchResults.forEach(({ engine, results }) => {
      if (results.length > 0) {
        successfulEngines.push(engine);
        allResults.push(...results);
      }
    });

    const uniqueResults = this.deduplicateImageResults(allResults, query);
    const finalResults = uniqueResults.slice(0, targetResults);

    return {
      results: finalResults,
      engines: successfulEngines,
      totalResults: finalResults.length
    };
  }

  async searchImageByEngine(query: string, engineNames: string[]): Promise<{
    results: ImageResult[];
    engines: string[];
    totalResults: number;
  }> {
    const selectedEngines = this.engines.filter(engine => 
      engineNames.includes(engine.name) && engine.searchImage
    );

    if (selectedEngines.length === 0) {
      return { results: [], engines: [], totalResults: 0 };
    }

    const searchPromises = selectedEngines.map(async (engine) => {
      try {
        const results = await Promise.race([
          engine.searchImage!(query),
          new Promise<ImageResult[]>((resolve) => 
            setTimeout(() => resolve([]), 8000)
          )
        ]);
        return { engine: engine.name, results };
      } catch (error) {
        console.error(`Error in ${engine.name} image search:`, error);
        return { engine: engine.name, results: [] };
      }
    });

    const searchResults = await Promise.all(searchPromises);
    const allResults: ImageResult[] = [];
    const successfulEngines: string[] = [];

    searchResults.forEach(({ engine, results }) => {
      if (results.length > 0) {
        successfulEngines.push(engine);
        allResults.push(...results);
      }
    });

    const uniqueResults = this.deduplicateImageResults(allResults, query);

    return {
      results: uniqueResults,
      engines: successfulEngines,
      totalResults: uniqueResults.length
    };
  }

  // Deduplication methods for different result types
  private deduplicateNewsResults(results: NewsResult[], query: string): NewsResult[] {
    const seen = new Set<string>();
    const unique: NewsResult[] = [];

    for (const result of results) {
      const key = result.url.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(result);
      }
    }

    return unique.sort((a, b) => {
      const scoreA = this.calculateScore(a, query);
      const scoreB = this.calculateScore(b, query);
      return scoreB - scoreA;
    });
  }

  private deduplicateVideoResults(results: VideoResult[], query: string): VideoResult[] {
    const seen = new Set<string>();
    const unique: VideoResult[] = [];

    for (const result of results) {
      const key = result.url.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(result);
      }
    }

    return unique.sort((a, b) => {
      const scoreA = this.calculateScore(a, query);
      const scoreB = this.calculateScore(b, query);
      return scoreB - scoreA;
    });
  }

  private deduplicateImageResults(results: ImageResult[], query: string): ImageResult[] {
    const seen = new Set<string>();
    const unique: ImageResult[] = [];

    for (const result of results) {
      const key = result.url.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(result);
      }
    }

    return unique.sort((a, b) => {
      const scoreA = this.calculateScore(a, query);
      const scoreB = this.calculateScore(b, query);
      return scoreB - scoreA;
    });
  }
}
