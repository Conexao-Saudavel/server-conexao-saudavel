import { logger } from '../utils/logger.js';
import type { Request } from 'express';

// Tipos de eventos de auditoria
export enum AuditEventType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ACCESS = 'ACCESS',
  CONFIGURATION_CHANGE = 'CONFIGURATION_CHANGE',
  SECURITY_EVENT = 'SECURITY_EVENT'
}

// Interface para eventos de auditoria
interface AuditEvent {
  type: AuditEventType;
  userId?: string;
  action: string;
  resource?: string;
  details?: any;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
  status: 'SUCCESS' | 'FAILURE';
  error?: string;
}

/**
 * Serviço de auditoria para registrar ações importantes do sistema
 */
export class AuditService {
  private static instance: AuditService;
  private auditLogger = logger.child({ service: 'audit' });

  private constructor() {}

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  /**
   * Registra um evento de auditoria
   */
  public async logEvent(event: Omit<AuditEvent, 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      ...event,
      timestamp: new Date()
    };

    this.auditLogger.info('Evento de auditoria', auditEvent);
  }

  /**
   * Registra um evento de auditoria a partir de uma requisição HTTP
   */
  public async logHttpEvent(
    req: Request,
    type: AuditEventType,
    action: string,
    status: 'SUCCESS' | 'FAILURE',
    details?: any,
    error?: string
  ): Promise<void> {
    await this.logEvent({
      type,
      userId: req.user?.id,
      action,
      resource: req.path,
      details,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      status,
      error
    });
  }

  /**
   * Registra um evento de segurança
   */
  public async logSecurityEvent(
    req: Request,
    action: string,
    status: 'SUCCESS' | 'FAILURE',
    details?: any,
    error?: string
  ): Promise<void> {
    await this.logHttpEvent(
      req,
      AuditEventType.SECURITY_EVENT,
      action,
      status,
      details,
      error
    );
  }

  /**
   * Registra um evento de acesso
   */
  public async logAccessEvent(
    req: Request,
    action: string,
    status: 'SUCCESS' | 'FAILURE',
    details?: any,
    error?: string
  ): Promise<void> {
    await this.logHttpEvent(
      req,
      AuditEventType.ACCESS,
      action,
      status,
      details,
      error
    );
  }
} 