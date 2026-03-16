# Seqoa Meta Proxy

Fast and simple TypeScript meta search proxy that scrapes data from multiple independent search engines.

## Features

- **8 Independent Search Engines**: Brave Search, DuckDuckGo HTML, Mojeek, Marginalia, Qwant, Yep.com, Gigablast, SearXNG
- **Specialized Search**: News (Google News RSS), Videos (Invidious/YouTube), Images (Qwant Images)
- **Fast Performance**: Parallel requests with timeout protection
- **Deduplication**: Smart duplicate removal and result ranking
- **RESTful API**: Clean `/api/search` endpoint
- **TypeScript**: Full type safety
- **Lightweight**: Minimal dependencies, fast startup

## Search Engines

### Main Web Search
1. **Brave Search** - Bağımsız İndeks: Google/Bing bağımlılığı yok, sonuçlar çok güncel
2. **DuckDuckGo HTML** - Karışık (Apple/Kendi): JavaScript'siz, kazıması çok kolay
3. **Mojeek** - Bağımsız İndeks: Gerçekten tarafsız ve reklam odaklı olmayan temiz sonuçlar
4. **Marginalia** - Bağımsız (Small Web): SEO çöplüğünden uzak, blog ve kişisel site odaklı
5. **Qwant** - Bağımsız / Bing Hibrit: Avrupa merkezli, gizlilik odaklı
6. **Yep.com** - Bağımsız (Ahrefs): Backlink devinin motoru, teknik verisi çok güçlü
7. **Gigablast** - Bağımsız İndeks: Çok eski ve stabil, bot engeli düşük
8. **SearXNG** - Çoklu (70+ Kaynak): Tek istekle Google, Wikipedia ve Brave sonuçları

### Specialized Search
- **Google News RSS** - Haberler için XML formatında hızlı erişim
- **Invidious** - YouTube videoları için API alternatifi
- **Qwant Images** - Görsel arama için JSON tabanlı hızlı sonuçlar

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
GET /api/search?q=your+query&engines=Brave%20Search,DuckDuckGo%20HTML,Mojeek
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

### Main Web Search
- Brave Search
- DuckDuckGo HTML
- Mojeek
- Marginalia
- Qwant
- Yep.com
- Gigablast
- SearXNG

### Specialized Search
- Google News RSS (News)
- Invidious (Videos/YouTube)
- Qwant Images (Images)

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
