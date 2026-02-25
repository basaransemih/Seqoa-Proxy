# Seqoa Meta Proxy

Fast and simple TypeScript meta search proxy that scrapes data from multiple search engines.

## Features

- **Multiple Search Engines**: DuckDuckGo, Google, Yahoo, Brave, Startpage, Qwant, Ecosia, Mojeek, Ask, Marginalia
- **Fast Performance**: Parallel requests with timeout protection
- **Deduplication**: Smart duplicate removal and result ranking
- **RESTful API**: Clean `/api/search` endpoint
- **TypeScript**: Full type safety
- **Lightweight**: Minimal dependencies, fast startup

## Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

For development:
```bash
npm run dev
```

## API Endpoints

### Search all engines
```
GET /api/search?q=your+query
```

### Search specific engines
```
GET /api/search?q=your+query&engines=Google,DuckDuckGo,Brave
```

### Limit results
```
GET /api/search?q=your+query&limit=20
```

### List available engines
```
GET /api/engines
```

### Health check
```
GET /api/health
```

## Response Format

```json
{
  "query": "typescript",
  "results": [
    {
      "title": "TypeScript: JavaScript With Syntax For Types",
      "url": "https://www.typescriptlang.org/",
      "snippet": "TypeScript is a strongly typed programming language...",
      "engine": "DuckDuckGo",
      "position": 1
    }
  ],
  "totalResults": 45,
  "engines": ["DuckDuckGo", "Google", "Brave"],
  "responseTime": 1234
}
```

## Available Engines

- DuckDuckGo
- Google
- Yahoo
- Brave
- Startpage
- Qwant
- Ecosia
- Mojeek
- Ask
- Marginalia

## Environment Variables

- `PORT`: Server port (default: 3000)

## Performance

- Parallel search across all engines
- 5-second timeout per engine
- Automatic deduplication
- Result ranking by relevance
- Compression enabled
- CORS support

## License

MIT
