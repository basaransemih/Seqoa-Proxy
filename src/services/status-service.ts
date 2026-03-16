import { MetaSearch } from '../meta-search';
import { SearchEngine, SearchResult } from '../types';

export interface EngineStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'offline';
  responseTime: number;
  lastCheck: Date;
  errorCount: number;
  successCount: number;
  recentResults: number;
  uptime: number;
}

export interface SystemStatus {
  overall: 'healthy' | 'degraded' | 'offline';
  engines: EngineStatus[];
  totalRequests: number;
  averageResponseTime: number;
  uptime: number;
  lastUpdate: Date;
}

export class StatusService {
  private metaSearch: MetaSearch;
  private statusHistory: Map<string, EngineStatus[]>;
  private requestCounts: Map<string, { success: number; error: number }>;
  private startTime: Date;

  constructor() {
    this.metaSearch = new MetaSearch();
    this.statusHistory = new Map();
    this.requestCounts = new Map();
    this.startTime = new Date();
  }

  async checkEngineHealth(engineName: string): Promise<EngineStatus> {
    const startTime = Date.now();
    let status: 'healthy' | 'degraded' | 'offline' = 'offline';
    let responseTime = 0;
    let recentResults = 0;
    let error = '';

    try {
      // Test the engine with a simple query
      const result = await this.metaSearch.searchByEngine('test', [engineName]);
      responseTime = Date.now() - startTime;
      recentResults = result.results.length;

      if (recentResults > 0) {
        status = responseTime < 3000 ? 'healthy' : 'degraded';
      } else {
        status = 'degraded';
      }
    } catch (err) {
      responseTime = Date.now() - startTime;
      status = 'offline';
      error = err instanceof Error ? err.message : 'Unknown error';
      
      // Update error count
      const counts = this.requestCounts.get(engineName) || { success: 0, error: 0 };
      counts.error++;
      this.requestCounts.set(engineName, counts);
    }

    // Update success count if successful
    if (status !== 'offline') {
      const counts = this.requestCounts.get(engineName) || { success: 0, error: 0 };
      counts.success++;
      this.requestCounts.set(engineName, counts);
    }

    const engineStatus: EngineStatus = {
      name: engineName,
      status,
      responseTime,
      lastCheck: new Date(),
      errorCount: this.requestCounts.get(engineName)?.error || 0,
      successCount: this.requestCounts.get(engineName)?.success || 0,
      recentResults,
      uptime: this.calculateUptime(engineName)
    };

    // Update history
    const history = this.statusHistory.get(engineName) || [];
    history.push(engineStatus);
    if (history.length > 100) history.shift(); // Keep last 100 checks
    this.statusHistory.set(engineName, history);

    return engineStatus;
  }

  async getSystemStatus(): Promise<SystemStatus> {
    const engines = this.metaSearch.getAvailableEngines();
    const engineStatuses: EngineStatus[] = [];

    // Check all engines in parallel
    const statusPromises = engines.map(engine => this.checkEngineHealth(engine));
    const statuses = await Promise.all(statusPromises);
    engineStatuses.push(...statuses);

    // Calculate overall system status
    const healthyCount = engineStatuses.filter(e => e.status === 'healthy').length;
    const degradedCount = engineStatuses.filter(e => e.status === 'degraded').length;
    const offlineCount = engineStatuses.filter(e => e.status === 'offline').length;

    let overall: 'healthy' | 'degraded' | 'offline' = 'healthy';
    if (offlineCount > 0) overall = 'offline';
    else if (degradedCount > 0 || healthyCount < engines.length / 2) overall = 'degraded';

    const totalRequests = Array.from(this.requestCounts.values())
      .reduce((sum, counts) => sum + counts.success + counts.error, 0);

    const averageResponseTime = engineStatuses.reduce((sum, e) => sum + e.responseTime, 0) / engineStatuses.length;

    return {
      overall,
      engines: engineStatuses,
      totalRequests,
      averageResponseTime,
      uptime: this.getSystemUptime(),
      lastUpdate: new Date()
    };
  }

  private calculateUptime(engineName: string): number {
    const counts = this.requestCounts.get(engineName);
    if (!counts || counts.success + counts.error === 0) return 0;
    return (counts.success / (counts.success + counts.error)) * 100;
  }

  private getSystemUptime(): number {
    return Date.now() - this.startTime.getTime();
  }

  getEngineHistory(engineName: string, limit: number = 50): EngineStatus[] {
    const history = this.statusHistory.get(engineName) || [];
    return history.slice(-limit);
  }
}
