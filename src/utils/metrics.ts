import { logger } from './logger.js';
import type { Request, Response, NextFunction } from 'express';

// Interface para métricas de performance
interface PerformanceMetric {
  path: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
}

/**
 * Classe para gerenciar métricas de performance
 */
export class PerformanceMetricsManager {
  private static instance: PerformanceMetricsManager;
  private metricsLogger = logger.child({ service: 'performance' });
  private metrics: PerformanceMetric[] = [];

  private constructor() {
    // Limpa métricas antigas a cada hora
    setInterval(() => this.cleanOldMetrics(), 60 * 60 * 1000);
  }

  public static getInstance(): PerformanceMetricsManager {
    if (!PerformanceMetricsManager.instance) {
      PerformanceMetricsManager.instance = new PerformanceMetricsManager();
    }
    return PerformanceMetricsManager.instance;
  }

  /**
   * Registra uma métrica de performance
   */
  public recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    this.metricsLogger.info('Métrica de performance', metric);
  }

  /**
   * Obtém métricas de performance
   */
  public getMetrics(): PerformanceMetric[] {
    return this.metrics;
  }

  /**
   * Obtém métricas de performance por rota
   */
  public getMetricsByRoute(path: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.path === path);
  }

  /**
   * Calcula estatísticas de performance
   */
  public getPerformanceStats(): {
    avgResponseTime: number;
    maxResponseTime: number;
    minResponseTime: number;
    totalRequests: number;
    requestsByStatus: Record<number, number>;
  } {
    if (this.metrics.length === 0) {
      return {
        avgResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: 0,
        totalRequests: 0,
        requestsByStatus: {}
      };
    }

    const responseTimes = this.metrics.map(m => m.responseTime);
    const statusCounts = this.metrics.reduce((acc, m) => {
      acc[m.statusCode] = (acc[m.statusCode] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      maxResponseTime: Math.max(...responseTimes),
      minResponseTime: Math.min(...responseTimes),
      totalRequests: this.metrics.length,
      requestsByStatus: statusCounts
    };
  }

  /**
   * Limpa métricas antigas (mais de 24 horas)
   */
  private cleanOldMetrics(): void {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > oneDayAgo);
  }
}

/**
 * Middleware para coletar métricas de performance
 */
export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - startTime;

    PerformanceMetricsManager.getInstance().recordMetric({
      path: req.path,
      method: req.method,
      responseTime,
      statusCode: res.statusCode,
      timestamp: new Date()
    });
  });

  next();
}; 