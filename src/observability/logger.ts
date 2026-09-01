/**
 * Production Observability and Structured Logging System for BatuTV News Portal & CMS.
 *
 * Implements:
 * - Structured JSON logging format
 * - Severity levels: INFO, WARNING, ERROR, CRITICAL
 * - Sensitive credential & token automatic redaction
 * - Request / Operation Correlation ID generator
 * - In-memory ring buffer for telemetry & diagnostics
 * - Realtime active subscription tracker to detect leaks
 */

export type LogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export type LogSource =
  | 'AUTH'
  | 'FIRESTORE_REPOSITORY'
  | 'STORE'
  | 'SSR_RESOLVER'
  | 'SECURITY_RULES'
  | 'BACKUP_ENGINE'
  | 'CACHE_ENGINE'
  | 'SYSTEM';

export interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  source: LogSource;
  operation: string;
  entity?: string;
  entityId?: string;
  errorCode?: string;
  retryable?: boolean;
  correlationId: string;
  userRole?: string;
  environment: 'development' | 'production' | 'test';
  message: string;
  context?: Record<string, any>;
}

// Sensitive keywords to automatically redact in context/payloads
const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'refreshtoken',
  'idtoken',
  'accesstoken',
  'apikey',
  'privatekey',
  'private_key',
  'client_email',
  'secret',
  'authorization',
  'cookie',
  'credential',
  'credentials',
]);

/**
 * Generates a unique, non-sensitive Correlation ID for request tracking.
 * Format: req_<timestamp>_<randomHex>
 */
export function generateCorrelationId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `req_${timestamp}_${randomPart}`;
}

/**
 * Deeply sanitizes objects to prevent secret leakage in logs.
 */
export function redactSensitiveData(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item));
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase().replace(/[-_]/g, '');
    if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes('password') || lowerKey.includes('secret') || lowerKey.includes('token')) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
      sanitized[key] = redactSensitiveData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// Internal Ring Buffer for Telemetry (Stores last 200 log entries in memory)
const MAX_LOG_BUFFER_SIZE = 200;
const logRingBuffer: StructuredLogEntry[] = [];
let activeSubscriptionsCount = 0;

// Metric counters
const metrics = {
  totalLogs: 0,
  infoCount: 0,
  warnCount: 0,
  errorCount: 0,
  criticalCount: 0,
  firestoreErrors: 0,
  authFailures: 0,
  ssrFallbackCount: 0,
};

function pushLog(entry: StructuredLogEntry): void {
  metrics.totalLogs++;
  if (entry.level === 'INFO') metrics.infoCount++;
  if (entry.level === 'WARNING') metrics.warnCount++;
  if (entry.level === 'ERROR') {
    metrics.errorCount++;
    if (entry.source === 'FIRESTORE_REPOSITORY') metrics.firestoreErrors++;
    if (entry.source === 'AUTH') metrics.authFailures++;
  }
  if (entry.level === 'CRITICAL') metrics.criticalCount++;
  if (entry.source === 'SSR_RESOLVER' && entry.level === 'WARNING') metrics.ssrFallbackCount++;

  if (logRingBuffer.length >= MAX_LOG_BUFFER_SIZE) {
    logRingBuffer.shift();
  }
  logRingBuffer.push(entry);

  // Safe console output formatting
  const env = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production' ? 'production' : 'development';
  if (env === 'development' || entry.level === 'ERROR' || entry.level === 'CRITICAL') {
    const formatted = `[${entry.timestamp}] [${entry.level}] [${entry.source}] (${entry.correlationId}) ${entry.operation}: ${entry.message}`;
    if (entry.level === 'ERROR' || entry.level === 'CRITICAL') {
      console.error(formatted, entry.context ? redactSensitiveData(entry.context) : '');
    } else if (entry.level === 'WARNING') {
      console.warn(formatted, entry.context ? redactSensitiveData(entry.context) : '');
    } else {
      console.log(formatted);
    }
  }
}

export const logger = {
  info(
    source: LogSource,
    operation: string,
    message: string,
    context?: Record<string, any>,
    correlationId: string = generateCorrelationId(),
    userRole?: string
  ): void {
    pushLog({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      source,
      operation,
      message,
      context: context ? redactSensitiveData(context) : undefined,
      correlationId,
      userRole,
      environment: typeof process !== 'undefined' && process.env?.NODE_ENV === 'production' ? 'production' : 'development',
    });
  },

  warn(
    source: LogSource,
    operation: string,
    message: string,
    context?: Record<string, any>,
    correlationId: string = generateCorrelationId(),
    userRole?: string
  ): void {
    pushLog({
      timestamp: new Date().toISOString(),
      level: 'WARNING',
      source,
      operation,
      message,
      context: context ? redactSensitiveData(context) : undefined,
      correlationId,
      userRole,
      environment: typeof process !== 'undefined' && process.env?.NODE_ENV === 'production' ? 'production' : 'development',
    });
  },

  error(
    source: LogSource,
    operation: string,
    message: string,
    context?: Record<string, any>,
    errorCode?: string,
    retryable?: boolean,
    correlationId: string = generateCorrelationId(),
    userRole?: string
  ): void {
    pushLog({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      source,
      operation,
      message,
      errorCode,
      retryable,
      context: context ? redactSensitiveData(context) : undefined,
      correlationId,
      userRole,
      environment: typeof process !== 'undefined' && process.env?.NODE_ENV === 'production' ? 'production' : 'development',
    });
  },

  critical(
    source: LogSource,
    operation: string,
    message: string,
    context?: Record<string, any>,
    errorCode?: string,
    correlationId: string = generateCorrelationId(),
    userRole?: string
  ): void {
    pushLog({
      timestamp: new Date().toISOString(),
      level: 'CRITICAL',
      source,
      operation,
      message,
      errorCode,
      retryable: false,
      context: context ? redactSensitiveData(context) : undefined,
      correlationId,
      userRole,
      environment: typeof process !== 'undefined' && process.env?.NODE_ENV === 'production' ? 'production' : 'development',
    });
  },

  // Active Subscription Telemetry
  trackSubscription(subName: string): void {
    activeSubscriptionsCount++;
    this.info('SYSTEM', 'SubscriptionMounted', `Active realtime listener mounted: ${subName}`, {
      activeCount: activeSubscriptionsCount,
    });
  },

  untrackSubscription(subName: string): void {
    activeSubscriptionsCount = Math.max(0, activeSubscriptionsCount - 1);
    this.info('SYSTEM', 'SubscriptionUnmounted', `Active realtime listener unmounted: ${subName}`, {
      activeCount: activeSubscriptionsCount,
    });
  },

  getActiveSubscriptionCount(): number {
    return activeSubscriptionsCount;
  },

  getDiagnosticsSummary(): {
    metrics: typeof metrics;
    activeSubscriptions: number;
    recentErrors: StructuredLogEntry[];
  } {
    return {
      metrics: { ...metrics },
      activeSubscriptions: activeSubscriptionsCount,
      recentErrors: logRingBuffer.filter((l) => l.level === 'ERROR' || l.level === 'CRITICAL').slice(-10),
    };
  },
};
