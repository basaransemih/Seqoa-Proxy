import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { MetaSearch } from './meta-search';
import { SearchResponse, NewsResponse, VideoResponse, ImageResponse } from './types';
import { StatusService } from './services/status-service';

const app = express();
const port = process.env.PORT || 3000;
const metaSearch = new MetaSearch();
const statusService = new StatusService();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.static('public'));

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

    const maxResults = Math.max(parseInt(limit as string) || 70, 70);
    
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

// News search endpoint
app.get('/api/news', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { q: query, engines, limit = '50' } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query parameter "q" is required',
        timestamp: new Date().toISOString()
      });
    }

    const maxResults = Math.max(parseInt(limit as string) || 50, 50);
    
    let searchResult;
    if (engines && typeof engines === 'string') {
      const engineList = engines.split(',').map(e => e.trim());
      searchResult = await metaSearch.searchNewsByEngine(query, engineList);
    } else {
      searchResult = await metaSearch.searchAllNews(query, maxResults);
    }

    const responseTime = Date.now() - startTime;
    
    const response: NewsResponse = {
      query,
      results: searchResult.results,
      totalResults: searchResult.totalResults,
      engines: searchResult.engines,
      responseTime,
      searchType: 'news'
    };

    res.json(response);
  } catch (error) {
    console.error('News search error:', error);
    res.status(500).json({
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Video search endpoint
app.get('/api/video', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { q: query, engines, limit = '50' } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query parameter "q" is required',
        timestamp: new Date().toISOString()
      });
    }

    const maxResults = Math.max(parseInt(limit as string) || 50, 50);
    
    let searchResult;
    if (engines && typeof engines === 'string') {
      const engineList = engines.split(',').map(e => e.trim());
      searchResult = await metaSearch.searchVideoByEngine(query, engineList);
    } else {
      searchResult = await metaSearch.searchAllVideo(query, maxResults);
    }

    const responseTime = Date.now() - startTime;
    
    const response: VideoResponse = {
      query,
      results: searchResult.results,
      totalResults: searchResult.totalResults,
      engines: searchResult.engines,
      responseTime,
      searchType: 'video'
    };

    res.json(response);
  } catch (error) {
    console.error('Video search error:', error);
    res.status(500).json({
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Images search endpoint
app.get('/api/images', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { q: query, engines, limit = '50' } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query parameter "q" is required',
        timestamp: new Date().toISOString()
      });
    }

    const maxResults = Math.max(parseInt(limit as string) || 50, 50);
    
    let searchResult;
    if (engines && typeof engines === 'string') {
      const engineList = engines.split(',').map(e => e.trim());
      searchResult = await metaSearch.searchImageByEngine(query, engineList);
    } else {
      searchResult = await metaSearch.searchAllImages(query, maxResults);
    }

    const responseTime = Date.now() - startTime;
    
    const response: ImageResponse = {
      query,
      results: searchResult.results,
      totalResults: searchResult.totalResults,
      engines: searchResult.engines,
      responseTime,
      searchType: 'image'
    };

    res.json(response);
  } catch (error) {
    console.error('Images search error:', error);
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

app.get('/api/status', async (req, res) => {
  try {
    const systemStatus = await statusService.getSystemStatus();
    
    // Format the response as detailed JSON with widgets data
    const response = {
      timestamp: new Date().toISOString(),
      system: {
        overall: systemStatus.overall,
        totalRequests: systemStatus.totalRequests,
        averageResponseTime: Math.round(systemStatus.averageResponseTime),
        uptime: systemStatus.uptime,
        uptimeFormatted: formatUptime(systemStatus.uptime),
        lastUpdate: systemStatus.lastUpdate
      },
      health: {
        healthy: systemStatus.engines.filter(e => e.status === 'healthy').length,
        degraded: systemStatus.engines.filter(e => e.status === 'degraded').length,
        offline: systemStatus.engines.filter(e => e.status === 'offline').length,
        total: systemStatus.engines.length
      },
      performance: {
        fastest: getFastestEngine(systemStatus.engines),
        slowest: getSlowestEngine(systemStatus.engines),
        successRate: calculateSuccessRate(systemStatus.engines),
        errorRate: calculateErrorRate(systemStatus.engines)
      },
      engines: systemStatus.engines.map(engine => ({
        name: engine.name,
        status: engine.status,
        responseTime: engine.responseTime,
        responseTimeFormatted: `${engine.responseTime}ms`,
        lastCheck: engine.lastCheck,
        uptime: engine.uptime,
        uptimeFormatted: `${engine.uptime.toFixed(1)}%`,
        errorCount: engine.errorCount,
        successCount: engine.successCount,
        recentResults: engine.recentResults,
        totalRequests: engine.successCount + engine.errorCount
      }))
    };
    
    res.json(response);
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({
      error: 'Failed to get system status',
      timestamp: new Date().toISOString()
    });
  }
});

// Helper functions for formatting
function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function getFastestEngine(engines: any[]): any {
  if (engines.length === 0) return null;
  return engines.reduce((fastest, current) => 
    current.responseTime < fastest.responseTime ? current : fastest
  );
}

function getSlowestEngine(engines: any[]): any {
  if (engines.length === 0) return null;
  return engines.reduce((slowest, current) => 
    current.responseTime > slowest.responseTime ? current : slowest
  );
}

function calculateSuccessRate(engines: any[]): number {
  const totalSuccess = engines.reduce((sum, e) => sum + e.successCount, 0);
  const totalRequests = engines.reduce((sum, e) => sum + e.successCount + e.errorCount, 0);
  return totalRequests > 0 ? Math.round((totalSuccess / totalRequests) * 100 * 10) / 10 : 0;
}

function calculateErrorRate(engines: any[]): number {
  const totalError = engines.reduce((sum, e) => sum + e.errorCount, 0);
  const totalRequests = engines.reduce((sum, e) => sum + e.successCount + e.errorCount, 0);
  return totalRequests > 0 ? Math.round((totalError / totalRequests) * 100 * 10) / 10 : 0;
}

app.get('/api/status/:engine', async (req, res) => {
  try {
    const { engine } = req.params;
    const engineStatus = await statusService.checkEngineHealth(engine);
    res.json({
      ...engineStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Engine status error:', error);
    res.status(500).json({
      error: 'Failed to get engine status',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/status/:engine/history', (req, res) => {
  try {
    const { engine } = req.params;
    const { limit = 50 } = req.query;
    const history = statusService.getEngineHistory(engine, parseInt(limit as string));
    res.json({
      engine,
      history,
      count: history.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Engine history error:', error);
    res.status(500).json({
      error: 'Failed to get engine history',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    name: 'Seqoa Meta Proxy',
    version: '1.0.0',
    description: 'Fast meta search proxy with multiple search engine scraping',
    endpoints: {
      '/api/search': 'Search across multiple engines (web)',
      '/api/news': 'Search news across multiple engines',
      '/api/video': 'Search videos across multiple engines', 
      '/api/images': 'Search images across multiple engines',
      '/api/engines': 'List available search engines',
      '/api/health': 'Health check',
      '/api/status': 'System status dashboard (JSON format)',
      '/api/status/:engine': 'Individual engine status',
      '/api/status/:engine/history': 'Engine status history'
    },
    usage: {
      search: '/api/search?q=your+query',
      news: '/api/news?q=your+query',
      video: '/api/video?q=your+query',
      images: '/api/images?q=your+query',
      selective: '/api/search?q=your+query&engines=Brave%20Search,DuckDuckGo%20HTML',
      limited: '/api/search?q=your+query&limit=20',
      status: '/api/status',
      engineStatus: '/api/status/Brave%20Search'
    },
    statusResponse: {
      description: 'Detailed status information in JSON format',
      structure: {
        timestamp: 'ISO timestamp',
        system: {
          overall: 'healthy|degraded|offline',
          totalRequests: 'number',
          averageResponseTime: 'milliseconds',
          uptime: 'milliseconds',
          uptimeFormatted: 'human readable'
        },
        health: {
          healthy: 'count',
          degraded: 'count', 
          offline: 'count',
          total: 'count'
        },
        performance: {
          fastest: 'engine object',
          slowest: 'engine object',
          successRate: 'percentage',
          errorRate: 'percentage'
        },
        engines: [
          {
            name: 'engine name',
            status: 'healthy|degraded|offline',
            responseTime: 'milliseconds',
            uptime: 'percentage',
            errorCount: 'number',
            successCount: 'number',
            recentResults: 'number'
          }
        ]
      }
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 Seqoa Meta Proxy running on port ${port}`);
  console.log(`📊 Available engines: ${metaSearch.getAvailableEngines().join(', ')}`);
  console.log(`🔗 Health check: http://localhost:${port}/api/health`);
  console.log(`📈 Status API: http://localhost:${port}/api/status`);
  console.log(`📖 API docs: http://localhost:${port}/`);
});

export default app;
