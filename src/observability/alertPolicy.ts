/**
 * BatuTV News Portal & CMS — Continuous Production Alert Policies & Thresholds (P0-12)
 */

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';

export interface AlertDefinition {
  code: string;
  name: string;
  category: 'SLO' | 'BACKUP' | 'SECURITY' | 'COST' | 'CAPACITY' | 'AUTH' | 'FIRESTORE';
  severity: AlertSeverity;
  condition: string;
  thresholdWarning: string;
  thresholdCritical: string;
  remediationAction: string;
}

export const ALERT_POLICIES: Record<string, AlertDefinition> = {
  'ALERT-SLO-001': {
    code: 'ALERT-SLO-001',
    name: 'SLO Availability Breach Risk',
    category: 'SLO',
    severity: 'CRITICAL',
    condition: 'Public HTTP 5xx error rate > 0.1% or availability < 99.9%',
    thresholdWarning: 'Availability < 99.95%',
    thresholdCritical: 'Availability < 99.90%',
    remediationAction: 'Check Cloud Run container logs, restart stale workers, inspect upstream Firestore connectivity.',
  },
  'ALERT-SLO-002': {
    code: 'ALERT-SLO-002',
    name: 'SLO Response Latency Degradation',
    category: 'SLO',
    severity: 'HIGH',
    condition: 'Public response p95 latency > 500ms or p99 > 1000ms',
    thresholdWarning: 'p95 > 400ms',
    thresholdCritical: 'p95 > 500ms or p99 > 1000ms',
    remediationAction: 'Audit hot queries for missing limits, verify composite index coverage, optimize payload sizes.',
  },
  'ALERT-BACKUP-001': {
    code: 'ALERT-BACKUP-001',
    name: 'Automated Backup Age & Freshness (RPO)',
    category: 'BACKUP',
    severity: 'CRITICAL',
    condition: 'Latest verified snapshot older than RPO SLA target (24h)',
    thresholdWarning: 'Backup age > 18 hours',
    thresholdCritical: 'Backup age > 24 hours',
    remediationAction: 'Trigger manual Firestore export to Cloud Storage and inspect Cloud Scheduler job logs.',
  },
  'ALERT-SECURITY-001': {
    code: 'ALERT-SECURITY-001',
    name: 'Security Secret or Permission Drift Detected',
    category: 'SECURITY',
    severity: 'CRITICAL',
    condition: 'Private key detected in client bundle or RBAC / Firestore rules drift identified',
    thresholdWarning: 'Untracked role in route guard',
    thresholdCritical: 'Secret exposed or unauthorized rule mutation detected',
    remediationAction: 'Halt deployment pipeline, rotate compromised credentials, re-deploy audited rules.',
  },
  'ALERT-COST-001': {
    code: 'ALERT-COST-001',
    name: 'Uncontrolled Query or Read Amplification Risk',
    category: 'COST',
    severity: 'HIGH',
    condition: 'Unbounded getDocs scan, un-debounced listener, or duplicate subscription loop',
    thresholdWarning: 'Uncached singleton read detected',
    thresholdCritical: 'Full collection scan without limit() in public repository',
    remediationAction: 'Enforce where() and limit() constraints on query, enable LocalStorage read-through cache.',
  },
  'ALERT-CAPACITY-001': {
    code: 'ALERT-CAPACITY-001',
    name: 'Document Capacity / Quota Utilization Warning',
    category: 'CAPACITY',
    severity: 'HIGH',
    condition: 'Canonical collection document count exceeds warning/critical threshold',
    thresholdWarning: 'Utilization >= 70%',
    thresholdCritical: 'Utilization >= 85%',
    remediationAction: 'Trigger automated data retention lifecycle archive (dryRun verified) for old logs/media.',
  },
  'ALERT-AUTH-001': {
    code: 'ALERT-AUTH-001',
    name: 'Firebase Authentication Failure Spike',
    category: 'AUTH',
    severity: 'HIGH',
    condition: 'CMS login failure rate > 5% in 5 minutes',
    thresholdWarning: 'Failure rate > 2%',
    thresholdCritical: 'Failure rate > 5%',
    remediationAction: 'Inspect Identity Platform error telemetry, check origin CORS and API key quotas.',
  },
  'ALERT-FIRESTORE-001': {
    code: 'ALERT-FIRESTORE-001',
    name: 'Firestore Database Degradation / Timeout',
    category: 'FIRESTORE',
    severity: 'CRITICAL',
    condition: 'Firestore error rate > 0.1% or timeout rate > 0.05%',
    thresholdWarning: 'Latency > 300ms',
    thresholdCritical: 'Error rate > 0.1%',
    remediationAction: 'Activate client-side LocalStorage cache fallback and notify Database Administrator.',
  },
};
