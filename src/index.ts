import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { MetaSearch } from './meta-search';
import { SearchResponse } from './types';

const app = express();
const port = process.env.PORT || 3000;
const metaSearch = new MetaSearch();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

app.get('/api/search', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { q: query, engines, limit = '50' } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query parameter "q" is required',
        timestamp: new Date().toISOString()
      });
    }

    const maxResults = Math.min(parseInt(limit as string) || 50, 100);
    
    let searchResult;
    if (engines && typeof engines === 'string') {
      const engineList = engines.split(',').map(e => e.trim());
      searchResult = await metaSearch.searchByEngine(query, engineList);
    } else {
      searchResult = await metaSearch.searchAll(query, maxResults);
    }

    const responseTime = Date.now() - startTime;
    
    const response: SearchResponse = {
      query,
      results: searchResult.results,
      totalResults: searchResult.totalResults,
      engines: searchResult.engines,
      responseTime
    };

    res.json(response);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/engines', (req, res) => {
  try {
    const engines = metaSearch.getAvailableEngines();
    res.json({
      engines,
      count: engines.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Engines error:', error);
    res.status(500).json({
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Seqoa Meta Proxy',
    version: '1.0.0',
    description: 'Fast meta search proxy with multiple search engine scraping',
    endpoints: {
      '/api/search': 'Search across multiple engines',
      '/api/engines': 'List available search engines',
      '/api/health': 'Health check'
    },
    usage: {
      search: '/api/search?q=your+query',
      selective: '/api/search?q=your+query&engines=Google,DuckDuckGo',
      limited: '/api/search?q=your+query&limit=20'
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 Seqoa Meta Proxy running on port ${port}`);
  console.log(`📊 Available engines: ${metaSearch.getAvailableEngines().join(', ')}`);
  console.log(`🔗 Health check: http://localhost:${port}/api/health`);
});

export default app;
