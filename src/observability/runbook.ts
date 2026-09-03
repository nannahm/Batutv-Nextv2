/**
 * BatuTV News Portal & CMS — Continuous Production Operational Runbooks (P0-12)
 * Standard Operating Procedures (SOP) & Incident Response Protocols (INC-01 to INC-10).
 */

export type IncidentSeverity = 'SEV-1' | 'SEV-2' | 'SEV-3' | 'SEV-4';

export type IncidentPhase =
  | 'DETECTED'
  | 'TRIAGED'
  | 'CONTAINED'
  | 'MITIGATED'
  | 'RECOVERED'
  | 'VERIFIED'
  | 'CLOSED';

export interface IncidentProcedure {
  incidentId: string;
  title: string;
  severity: IncidentSeverity;
  trigger: string;
  detectionSignal: string;
  impact: string;
  containment: string;
  mitigation: string;
  recovery: string;
  verification: string;
  escalation: string;
  postmortemRequired: boolean;
  rtoTargetMinutes: number;
  steps: Array<{
    stepNumber: number;
    phase: 'DETECT' | 'ISOLATE' | 'MITIGATE' | 'RECOVER' | 'VERIFY';
    action: string;
    commandOrTool?: string;
  }>;
}

export const OPERATIONAL_RUNBOOKS: Record<string, IncidentProcedure> = {
  FIRESTORE_OUTAGE: {
    incidentId: 'INC-01',
    title: 'Incident: Firestore Service Outage or High Latency Degradation',
    severity: 'SEV-1',
    trigger: 'Firestore error rate > 0.1%, query timeout spikes, or /ready probe fails on database',
    detectionSignal: 'HTTP 503 spike or Firestore connectivity error in structured logs',
    impact: 'CMS editorial mutation halts; public reads switch to read-through LocalStorage cache',
    containment: 'Automated fallback to client read-through cache; hold CMS writes with user notification',
    mitigation: 'Monitor Google Cloud Service Health dashboard; activate maintenance banners if outage > 15m',
    recovery: 'Re-establish realtime subscriptions upon cloud service restoration; run consistency check',
    verification: 'Execute npm run audit:integrity and confirm read/write success rate >= 99.9%',
    escalation: 'Notify Lead SRE & Principal Cloud Architect if cloud outage persists > 10m',
    postmortemRequired: true,
    rtoTargetMinutes: 15,
    steps: [
      { stepNumber: 1, phase: 'DETECT', action: 'Inspect /health and /ready endpoints for Firestore status', commandOrTool: 'curl -s https://[APP_DOMAIN]/health' },
      { stepNumber: 2, phase: 'ISOLATE', action: 'System isolates public readers to read-through LocalStorage fallback' },
      { stepNumber: 3, phase: 'MITIGATE', action: 'Administrative writes pause with retry banner; prevent cascading timeouts' },
      { stepNumber: 4, phase: 'RECOVER', action: 'Initiate resynchronization once Firestore connectivity returns', commandOrTool: 'npm run audit:integrity' },
      { stepNumber: 5, phase: 'VERIFY', action: 'Verify all 14 repository listeners re-attach with zero duplicate subscriptions' },
    ],
  },

  AUTH_SERVICE_DOWN: {
    incidentId: 'INC-02',
    title: 'Incident: Firebase Authentication Service Outage',
    severity: 'SEV-1',
    trigger: 'Auth failure rate > 0.5%, token verification timeouts, or ID token refresh failures',
    detectionSignal: 'Recurring auth/network-request-failed or auth/internal-error in logger',
    impact: 'CMS administrators unable to log in; existing public readers unaffected',
    containment: 'Maintain public reader cache access; present graceful auth maintenance notification',
    mitigation: 'Verify Google Cloud Identity Platform status; avoid forceful session clears',
    recovery: 'Prompt re-authentication of admin sessions upon Firebase Auth restoration',
    verification: 'Execute RBAC validation suite to verify token claims and role permissions',
    escalation: 'Escalate to IAM / Security Lead if tokens fail to verify across multiple regions',
    postmortemRequired: true,
    rtoTargetMinutes: 15,
    steps: [
      { stepNumber: 1, phase: 'DETECT', action: 'Detect auth errors in logs without leaking credentials' },
      { stepNumber: 2, phase: 'ISOLATE', action: 'Preserve reader view; lock admin panel login' },
      { stepNumber: 3, phase: 'MITIGATE', action: 'Display maintenance notification on /login route' },
      { stepNumber: 4, phase: 'RECOVER', action: 'Re-authenticate administrative sessions upon service recovery' },
      { stepNumber: 5, phase: 'VERIFY', action: 'Run RBAC security check', commandOrTool: 'npm run audit:security' },
    ],
  },

  DATA_CORRUPTION_OR_LOSS: {
    incidentId: 'INC-03',
    title: 'Incident: Accidental Document Deletion or Schema Corruption',
    severity: 'SEV-1',
    trigger: 'Missing collections, orphan foreign keys, or failed singleton validation',
    detectionSignal: 'Integrity audit failure or 404 spike on published article slugs',
    impact: 'Reader navigation broken; missing relational references',
    containment: 'Temporarily lock administrative write access to prevent cascade corruption',
    mitigation: 'Identify latest verified snapshot from Cloud Storage backup bucket (RPO <= 24h)',
    recovery: 'Restore affected collections using non-destructive Firestore import procedure',
    verification: 'Run full integrity audit to verify 0 orphan references and singletons intact',
    escalation: 'Database Administrator & Engineering Lead immediately notified',
    postmortemRequired: true,
    rtoTargetMinutes: 30,
    steps: [
      { stepNumber: 1, phase: 'DETECT', action: 'Run backup & collection verification', commandOrTool: 'npm run backup:verify' },
      { stepNumber: 2, phase: 'ISOLATE', action: 'Lock admin mutations' },
      { stepNumber: 3, phase: 'MITIGATE', action: 'Verify backup snapshot age and collection coverage' },
      { stepNumber: 4, phase: 'RECOVER', action: 'Restore affected collections via Cloud Storage export' },
      { stepNumber: 5, phase: 'VERIFY', action: 'Run full integrity audit', commandOrTool: 'npm run audit:integrity' },
    ],
  },

  CREDENTIAL_LEAK_RESPONSE: {
    incidentId: 'INC-04',
    title: 'Incident: Potential Secret or API Credential Exposure',
    severity: 'SEV-1',
    trigger: 'Secret scan detection or unauthorized administrative activity in logs',
    detectionSignal: 'Automated security scan flag in CI/CD or log analyzer',
    impact: 'Potential risk of unauthorized data access',
    containment: 'Immediately revoke compromised API keys or service accounts in GCP IAM',
    mitigation: 'Rotate Firebase Admin keys, update environment configuration, and force token revocation',
    recovery: 'Redeploy application with rotated keys and verify artifact isolation',
    verification: 'Verify that dist bundle contains 0 exposed credentials',
    escalation: 'Chief Information Security Officer (CISO) & DevOps Lead notified immediately',
    postmortemRequired: true,
    rtoTargetMinutes: 20,
    steps: [
      { stepNumber: 1, phase: 'DETECT', action: 'Scan codebase and bundle artifacts', commandOrTool: 'npm run audit:security' },
      { stepNumber: 2, phase: 'ISOLATE', action: 'Revoke compromised key in Google Cloud IAM' },
      { stepNumber: 3, phase: 'MITIGATE', action: 'Rotate service account credentials' },
      { stepNumber: 4, phase: 'RECOVER', action: 'Redeploy application with clean environment' },
      { stepNumber: 5, phase: 'VERIFY', action: 'Run security audit and bundle scan', commandOrTool: 'npm run audit:security' },
    ],
  },

  BACKUP_SLA_BREACH: {
    incidentId: 'INC-05',
    title: 'Incident: Automated Backup Schedule Failure (RPO Breach Risk)',
    severity: 'SEV-2',
    trigger: 'Latest verified snapshot older than 24 hours (RPO > 24h)',
    detectionSignal: 'ALERT-BACKUP-001 or npm run backup:verify warning/failure',
    impact: 'Increased potential data loss window in disaster recovery scenarios',
    containment: 'Assess last successful backup metadata and storage bucket access permissions',
    mitigation: 'Trigger immediate on-demand manual Firestore export to Cloud Storage',
    recovery: 'Validate fresh backup creation and confirm metadata coverage of 14 collections',
    verification: 'Execute npm run backup:verify to confirm RPO <= 24h and status RESTORE_READY',
    escalation: 'Notify Backup Administrator & DevOps Lead',
    postmortemRequired: false,
    rtoTargetMinutes: 30,
    steps: [
      { stepNumber: 1, phase: 'DETECT', action: 'Verify backup snapshot age and metadata', commandOrTool: 'npm run backup:verify' },
      { stepNumber: 2, phase: 'ISOLATE', action: 'Confirm GCP Cloud Scheduler and export permissions' },
      { stepNumber: 3, phase: 'MITIGATE', action: 'Trigger emergency export' },
      { stepNumber: 4, phase: 'RECOVER', action: 'Verify export completion' },
      { stepNumber: 5, phase: 'VERIFY', action: 'Run backup verification', commandOrTool: 'npm run backup:verify' },
    ],
  },

  SLO_AVAILABILITY_BREACH: {
    incidentId: 'INC-06',
    title: 'Incident: System Availability Drop Below 99.9% Target',
    severity: 'SEV-1',
    trigger: 'Public HTTP 5xx error rate > 0.1% over a 5-minute rolling window',
    detectionSignal: 'ALERT-SLO-001 or automated health probe failure',
    impact: 'Public readers encounter connection errors or slow article loads',
    containment: 'Scale Cloud Run instance min-instances; check upstream API proxy status',
    mitigation: 'Route traffic through edge CDN cache / LocalStorage read-through fallback',
    recovery: 'Clear transient container bottlenecks and verify node process health',
    verification: 'Run npm run audit:slo and monitor response success rate >= 99.9%',
    escalation: 'Notify Operations Team and On-call SRE Lead',
    postmortemRequired: true,
    rtoTargetMinutes: 10,
    steps: [
      { stepNumber: 1, phase: 'DETECT', action: 'Check /health and /live endpoints' },
      { stepNumber: 2, phase: 'ISOLATE', action: 'Inspect container error logs for unhandled exceptions' },
      { stepNumber: 3, phase: 'MITIGATE', action: 'Auto-scale container replicas' },
      { stepNumber: 4, phase: 'RECOVER', action: 'Restore baseline response rate' },
      { stepNumber: 5, phase: 'VERIFY', action: 'Execute SLO audit', commandOrTool: 'npm run audit:slo' },
    ],
  },

  HIGH_LATENCY_SPIKE: {
    incidentId: 'INC-07',
    title: 'Incident: p95 Response Latency Exceeds 500ms Threshold',
    severity: 'SEV-2',
    trigger: 'p95 latency > 500ms or p99 latency > 1000ms during peak reader traffic',
    detectionSignal: 'ALERT-SLO-002 or load test latency regression flag',
    impact: 'Sluggish reader page navigation and slow search rendering',
    containment: 'Inspect query volume for unbounded getDocs or repeated collection scans',
    mitigation: 'Enforce client-side debounce, verify composite indexes, and leverage cache',
    recovery: 'Optimize hot query paths and verify pagination bounds on list queries',
    verification: 'Run npm run audit:cost and npm run audit:slo to confirm p95 < 500ms',
    escalation: 'Notify Frontend & Backend Performance Engineers',
    postmortemRequired: false,
    rtoTargetMinutes: 20,
    steps: [
      { stepNumber: 1, phase: 'DETECT', action: 'Run SLO audit to measure p95/p99 latency', commandOrTool: 'npm run audit:slo' },
      { stepNumber: 2, phase: 'ISOLATE', action: 'Profile hot Firestore queries in repository layer' },
      { stepNumber: 3, phase: 'MITIGATE', action: 'Ensure all public queries enforce where() and limit()' },
      { stepNumber: 4, phase: 'RECOVER', action: 'Verify composite index presence' },
      { stepNumber: 5, phase: 'VERIFY', action: 'Execute integrity and load audit', commandOrTool: 'npm run audit:integrity' },
    ],
  },

  CAPACITY_THRESHOLD_BREACH: {
    incidentId: 'INC-08',
    title: 'Incident: Document or Resource Utilization Exceeds 85% Critical Threshold',
    severity: 'SEV-2',
    trigger: 'Any canonical collection document count exceeds 85% recommended limit',
    detectionSignal: 'ALERT-CAPACITY-001 or npm run audit:capacity CRITICAL status',
    impact: 'Risk of storage quota limits or degradation of unindexed scans',
    containment: 'Identify collection driving volume (e.g. activity_logs or media items)',
    mitigation: 'Execute data retention archive policy (HOT/WARM/ARCHIVE/PURGE with dryRun safety)',
    recovery: 'Prune orphaned/archived logs safely; verify active references remain intact',
    verification: 'Run npm run audit:capacity and verify utilization drops below 70%',
    escalation: 'Notify Database Administrator & Infrastructure Lead',
    postmortemRequired: false,
    rtoTargetMinutes: 60,
    steps: [
      { stepNumber: 1, phase: 'DETECT', action: 'Execute capacity planning audit', commandOrTool: 'npm run audit:capacity' },
      { stepNumber: 2, phase: 'ISOLATE', action: 'Isolate high-growth collections' },
      { stepNumber: 3, phase: 'MITIGATE', action: 'Run retention lifecycle dryRun verification' },
      { stepNumber: 4, phase: 'RECOVER', action: 'Archive expired activity logs past retention window' },
      { stepNumber: 5, phase: 'VERIFY', action: 'Confirm all collections GREEN', commandOrTool: 'npm run audit:capacity' },
    ],
  },

  SECURITY_RULES_DRIFT: {
    incidentId: 'INC-09',
    title: 'Incident: Firestore Security Rules or RBAC Configuration Drift Detected',
    severity: 'SEV-1',
    trigger: 'Mismatch between firestore.rules, firebase-blueprint.json, and TypeScript schema',
    detectionSignal: 'ALERT-SECURITY-001 or npm run audit:drift FAIL status',
    impact: 'Potential risk of unauthorized document read/write or privilege escalation',
    containment: 'Halt deployment pipeline immediately; block release gate',
    mitigation: 'Reconcile firestore.rules against canonical permission matrix',
    recovery: 'Redeploy audited firestore.rules and re-test negative permission matrix',
    verification: 'Run npm run audit:security and confirm 100% PASS with 0 drift',
    escalation: 'Notify Security Lead & Release Manager',
    postmortemRequired: true,
    rtoTargetMinutes: 15,
    steps: [
      { stepNumber: 1, phase: 'DETECT', action: 'Run drift audit', commandOrTool: 'npm run audit:drift' },
      { stepNumber: 2, phase: 'ISOLATE', action: 'Block CI/CD deployment pipeline' },
      { stepNumber: 3, phase: 'MITIGATE', action: 'Align rules with canonical schema and RBAC matrix' },
      { stepNumber: 4, phase: 'RECOVER', action: 'Deploy reconciled firestore.rules' },
      { stepNumber: 5, phase: 'VERIFY', action: 'Execute security verification', commandOrTool: 'npm run audit:security' },
    ],
  },

  CONFIG_SCHEMA_DRIFT: {
    incidentId: 'INC-10',
    title: 'Incident: Environment Configuration or TypeScript Schema Drift',
    severity: 'SEV-2',
    trigger: 'Missing required environment variables or missing canonical collection properties',
    detectionSignal: 'npm run audit:drift CONFIG_DRIFT or SCHEMA_DRIFT flag',
    impact: 'Application startup failure or unhandled undefined property errors in CMS/SSR',
    containment: 'Prevent container release to production; flag environment mismatch',
    mitigation: 'Update .env.example, verify secret naming parity without logging secrets',
    recovery: 'Sync TypeScript interfaces with database blueprint and deploy fix',
    verification: 'Execute npm run typecheck and npm run audit:drift with 0 warnings',
    escalation: 'Notify Tech Lead & DevOps Engineer',
    postmortemRequired: false,
    rtoTargetMinutes: 20,
    steps: [
      { stepNumber: 1, phase: 'DETECT', action: 'Run configuration drift audit', commandOrTool: 'npm run audit:drift' },
      { stepNumber: 2, phase: 'ISOLATE', action: 'Audit environment variable declaration parity' },
      { stepNumber: 3, phase: 'MITIGATE', action: 'Reconcile schema definitions in /src/types/' },
      { stepNumber: 4, phase: 'RECOVER', action: 'Ensure typecheck and linting succeed' },
      { stepNumber: 5, phase: 'VERIFY', action: 'Execute typecheck', commandOrTool: 'npm run typecheck' },
    ],
  },
};
