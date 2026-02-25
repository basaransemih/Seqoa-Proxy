import { SearchEngine, SearchResult } from './types';
import { DuckDuckGoFixedEngine } from './engines/duckduckgo-fixed';
import { BingEngine } from './engines/bing';
import { BraveAPIEngine } from './engines/brave-api';
import { YandexEngine } from './engines/yandex-fixed';
import { QwantEngine } from './engines/qwant-fixed';
import { EcosiaEngine } from './engines/ecosia-fixed';

export class MetaSearch {
  private engines: SearchEngine[] = [
    new DuckDuckGoFixedEngine(),
    new BingEngine(),
    new BraveAPIEngine(),
    new YandexEngine(),
    new QwantEngine(),
    new EcosiaEngine()
  ];

  async searchAll(query: string, maxResults: number = 50): Promise<{
    results: SearchResult[];
    engines: string[];
    totalResults: number;
  }> {
    const startTime = Date.now();
    
    const searchPromises = this.engines.map(async (engine) => {
      try {
        const results = await Promise.race([
          engine.search(query),
          new Promise<SearchResult[]>((resolve) => 
            setTimeout(() => resolve([]), 5000)
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
    const finalResults = uniqueResults.slice(0, maxResults);

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
      const key = `${result.url.toLowerCase()}-${result.title.toLowerCase()}`;
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
            setTimeout(() => resolve([]), 5000)
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
}
