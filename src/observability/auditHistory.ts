/**
 * BatuTV News Portal & CMS — Operational Audit History Logger (P0-12)
 *
 * Stores structured operational audit history records safely without secrets, passwords, or tokens.
 */

import { logger, redactSensitiveData } from './logger';

export interface AuditHistoryRecord {
  auditId: string;
  timestamp: string;
  environment: string;
  operation: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  checksPassed: number;
  checksWarned: number;
  checksFailed: number;
  durationMs: number;
  correlationId: string;
  releaseId?: string;
  summaryMetrics?: Record<string, any>;
}

// In-memory operational audit trail ring buffer (last 100 audits)
const AUDIT_HISTORY_BUFFER: AuditHistoryRecord[] = [];
const MAX_BUFFER_SIZE = 100;

export function recordAuditHistory(record: Omit<AuditHistoryRecord, 'timestamp'>): AuditHistoryRecord {
  const safeMetrics = record.summaryMetrics ? redactSensitiveData(record.summaryMetrics) : undefined;
  const entry: AuditHistoryRecord = {
    ...record,
    timestamp: new Date().toISOString(),
    summaryMetrics: safeMetrics,
  };

  AUDIT_HISTORY_BUFFER.unshift(entry);
  if (AUDIT_HISTORY_BUFFER.length > MAX_BUFFER_SIZE) {
    AUDIT_HISTORY_BUFFER.pop();
  }

  logger.info('SYSTEM', 'AuditHistoryRecorded', `Audit ${entry.auditId} [${entry.operation}] -> Status: ${entry.status}`, {
    auditId: entry.auditId,
    status: entry.status,
    durationMs: entry.durationMs,
  });

  return entry;
}

export function getRecentAuditHistory(limit = 20): AuditHistoryRecord[] {
  return AUDIT_HISTORY_BUFFER.slice(0, limit);
}
