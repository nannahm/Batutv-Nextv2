/**
 * BatuTV News Portal & CMS — Advanced Disaster Recovery Runbooks (DR-01 to DR-10) (P0-13)
 */

export interface DisasterRecoveryRunbook {
  code: string;
  title: string;
  severity: 'SEV-1' | 'SEV-2' | 'SEV-3';
  trigger: string;
  detection: string;
  impact: string;
  immediateContainment: string;
  rpoTargetHours: number;
  rtoTargetMinutes: number;
  recoveryDependencyGraph: string[];
  steps: Array<{
    stepNumber: number;
    action: string;
    responsibleRole: string;
    commandOrVerification?: string;
  }>;
  validation: string;
  rollback: string;
  escalation: string;
  postIncidentVerification: string;
}

export const DR_RUNBOOKS: Record<string, DisasterRecoveryRunbook> = {
  'DR-01': {
    code: 'DR-01',
    title: 'Disaster Recovery: Regional Cloud Failure & Multi-Region Failover',
    severity: 'SEV-1',
    trigger: 'Primary region (asia-southeast1) Cloud Run or network failure > 60s',
    detection: 'Cloud Load Balancing synthetic probe fails or /health returns 503/timeout',
    impact: 'Primary region ingress unavailable; traffic reroutes to secondary standby region',
    immediateContainment: 'Cloud DNS / Multi-Region Load Balancer directs 100% traffic to asia-southeast2',
    rpoTargetHours: 0,
    rtoTargetMinutes: 5,
    recoveryDependencyGraph: ['Cloud DNS / Load Balancer', 'Secondary Cloud Run', 'Firestore', 'Firebase Auth'],
    steps: [
      { stepNumber: 1, action: 'Detect primary outage via Global Health Check', responsibleRole: 'SRE On-Call', commandOrVerification: 'npm run audit:dr' },
      { stepNumber: 2, action: 'Activate regional failover routing in Cloud DNS / Cloud Load Balancing', responsibleRole: 'Cloud Architect' },
      { stepNumber: 3, action: 'Verify secondary Cloud Run instance receives traffic and executes SSR', responsibleRole: 'DevOps Lead' },
      { stepNumber: 4, action: 'Verify Firestore realtime listeners reattach to secondary region smoothly', responsibleRole: 'Backend Lead' },
      { stepNumber: 5, action: 'Conduct sanity checks on public feed and admin CMS login', responsibleRole: 'QA Lead' },
    ],
    validation: 'Public readers successfully load articles with p95 < 500ms; zero data loss',
    rollback: 'Revert traffic to primary region once primary health checks succeed for > 5 minutes',
    escalation: 'Notify VP of Engineering & Head of Infrastructure',
    postIncidentVerification: 'Generate automated regional failover postmortem within 24 hours',
  },

  'DR-02': {
    code: 'DR-02',
    title: 'Disaster Recovery: Firestore Service Disruption or Database Outage',
    severity: 'SEV-1',
    trigger: 'Firestore global API error rate > 0.5% or persistent connection timeouts',
    detection: 'Structured logger records Firestore error code 14 (UNAVAILABLE) or /ready probe fails',
    impact: 'CMS administrative mutations blocked; readers serve from LocalStorage read-through cache',
    immediateContainment: 'Activate client-side read-through cache fallback; suspend admin write actions with UI banner',
    rpoTargetHours: 0,
    rtoTargetMinutes: 15,
    recoveryDependencyGraph: ['Google Cloud Status', 'Firestore Repositories', 'Client Cache Fallback'],
    steps: [
      { stepNumber: 1, action: 'Inspect Google Cloud Service Health dashboard for Firestore outages', responsibleRole: 'SRE Lead' },
      { stepNumber: 2, action: 'Ensure all 14 repository services switch to LocalStorage offline read-through fallback', responsibleRole: 'Frontend Lead' },
      { stepNumber: 3, action: 'CMS mutation UI displays non-destructive retry banner', responsibleRole: 'Product Lead' },
      { stepNumber: 4, action: 'Once Google resolves Firestore, trigger automatic listener re-synchronization', responsibleRole: 'Backend Lead' },
      { stepNumber: 5, action: 'Execute integrity audit to confirm 0 corrupt records', responsibleRole: 'DBA', commandOrVerification: 'npm run audit:integrity' },
    ],
    validation: 'All 14 collections synchronized and 0 orphan foreign keys detected',
    rollback: 'Not applicable (cloud service provider outage recovery)',
    escalation: 'Open Google Cloud Enterprise Support P1 ticket',
    postIncidentVerification: 'Run data integrity & reconciliation audit across all collections',
  },

  'DR-03': {
    code: 'DR-03',
    title: 'Disaster Recovery: Firebase Authentication Service Outage',
    severity: 'SEV-1',
    trigger: 'Google Identity Platform / Firebase Auth failure rate > 1% on admin login',
    detection: 'Repeated auth/internal-error or auth/network-request-failed in logger',
    impact: 'CMS login blocked; public news reading unaffected (public content is unauthenticated)',
    immediateContainment: 'Public traffic uninterrupted; CMS display maintenance notice on /login',
    rpoTargetHours: 0,
    rtoTargetMinutes: 15,
    recoveryDependencyGraph: ['Google Identity Platform', 'Auth Route Guards', 'Firebase Auth SDK'],
    steps: [
      { stepNumber: 1, action: 'Detect auth degradation via /ready probe', responsibleRole: 'SRE' },
      { stepNumber: 2, action: 'Confirm public news readers have 100% read access unaffected', responsibleRole: 'QA' },
      { stepNumber: 3, action: 'Display maintenance notification on CMS login view', responsibleRole: 'Frontend' },
      { stepNumber: 4, action: 'Verify Google Cloud Identity Platform service restoration', responsibleRole: 'DevOps' },
      { stepNumber: 5, action: 'Re-authenticate administrative sessions and verify RBAC permissions', responsibleRole: 'Security Lead', commandOrVerification: 'npm run audit:enterprise-security' },
    ],
    validation: 'Admin login succeeds with valid role token and zero privilege escalation',
    rollback: 'Not applicable',
    escalation: 'Escalate to IAM & Security Lead',
    postIncidentVerification: 'Verify RBAC audit trail in activity_logs',
  },

  'DR-04': {
    code: 'DR-04',
    title: 'Disaster Recovery: Cloud Run Container Crash Loop or Unhandled Exception',
    severity: 'SEV-1',
    trigger: 'Container restart count > 3 in 5 minutes or /live probe failure',
    detection: 'Cloud Run memory/CPU alert or container termination logs with exit code != 0',
    impact: 'Public requests receive 502/503 bad gateway from proxy',
    immediateContainment: 'Cloud Run auto-heals by spawning fresh instances; rollback revision if new deployment',
    rpoTargetHours: 0,
    rtoTargetMinutes: 5,
    recoveryDependencyGraph: ['Cloud Run Revision Manager', 'Node.js Express Process', 'Vite Middleware'],
    steps: [
      { stepNumber: 1, action: 'Analyze container stderr logs for unhandledRejection or uncaughtException', responsibleRole: 'DevOps' },
      { stepNumber: 2, action: 'If caused by recent release, immediately rollback to previous stable revision', responsibleRole: 'Release Manager', commandOrVerification: 'npm run audit:deployment' },
      { stepNumber: 3, action: 'Verify new container boots within < 3000ms and /health returns 200 OK', responsibleRole: 'SRE' },
      { stepNumber: 4, action: 'Run smoke test on home feed, article detail, and CMS routes', responsibleRole: 'QA' },
    ],
    validation: 'Container uptime stable > 15m with 0 crashes and error rate < 0.01%',
    rollback: 'Revert to last verified immutable Cloud Run revision tag',
    escalation: 'Notify Application Tech Lead',
    postIncidentVerification: 'Log exception details to issue tracker and audit history buffer',
  },

  'DR-05': {
    code: 'DR-05',
    title: 'Disaster Recovery: Document Schema or Referential Corruption',
    severity: 'SEV-1',
    trigger: 'Multiple foreign key lookup failures or broken schema validation on published articles',
    detection: 'Integrity audit failure or 404 spike on published article slugs',
    impact: 'Reader navigation broken; missing author/category references',
    immediateContainment: 'Lock CMS editorial mutation interface; freeze new publish actions',
    rpoTargetHours: 24,
    rtoTargetMinutes: 30,
    recoveryDependencyGraph: ['Cloud Storage Backup Bucket', 'Firestore Import Tool', 'Integrity Validator'],
    steps: [
      { stepNumber: 1, action: 'Identify affected collections using full integrity audit', responsibleRole: 'DBA', commandOrVerification: 'npm run audit:integrity' },
      { stepNumber: 2, action: 'Locate latest verified snapshot from Cloud Storage (RPO <= 24h)', responsibleRole: 'Backup Admin', commandOrVerification: 'npm run backup:verify' },
      { stepNumber: 3, action: 'Execute non-destructive targeted document restoration', responsibleRole: 'DBA' },
      { stepNumber: 4, action: 'Validate that 0 orphan references and 0 duplicate singletons remain', responsibleRole: 'QA', commandOrVerification: 'npm run audit:integrity' },
      { stepNumber: 5, action: 'Re-enable CMS publishing with editorial broadcast', responsibleRole: 'Product Lead' },
    ],
    validation: 'Integrity audit returns 100% PASS with 0 orphan references',
    rollback: 'Restore snapshot to isolated staging sandbox before committing production changes',
    escalation: 'Notify Engineering Lead & Chief Data Officer',
    postIncidentVerification: 'Execute full database consistency audit and store run artifact',
  },

  'DR-06': {
    code: 'DR-06',
    title: 'Disaster Recovery: Accidental Document Deletion (Articles / Singletons)',
    severity: 'SEV-1',
    trigger: 'Accidental deletion of critical singleton (e.g. site_settings) or published articles batch',
    detection: 'Audit log records DELETE operation or missing singleton error on home page',
    impact: 'Home page header/footer broken or missing article content',
    immediateContainment: 'Fallback to default runtime singleton configurations; prevent further deletes',
    rpoTargetHours: 24,
    rtoTargetMinutes: 15,
    recoveryDependencyGraph: ['Cloud Storage Backup', 'Firestore Singleton Store', 'Runtime Defaults'],
    steps: [
      { stepNumber: 1, action: 'Identify deleted document IDs from activity_logs trail', responsibleRole: 'Security SRE' },
      { stepNumber: 2, action: 'Extract target documents from latest Cloud Storage backup snapshot', responsibleRole: 'DBA', commandOrVerification: 'npm run backup:verify' },
      { stepNumber: 3, action: 'Restore target documents with original IDs and timestamps intact', responsibleRole: 'DBA' },
      { stepNumber: 4, action: 'Verify singletons (site_settings, footer, system_settings) contain exactly 1 document each', responsibleRole: 'QA' },
      { stepNumber: 5, action: 'Verify public pages render correctly', responsibleRole: 'QA' },
    ],
    validation: 'Singleton documents present and public home page renders complete header/footer',
    rollback: 'Revert to runtime default settings if restore data is ambiguous',
    escalation: 'Notify Editorial Director & Lead DBA',
    postIncidentVerification: 'Verify activity_logs for root-cause user and update RBAC deletion permissions',
  },

  'DR-07': {
    code: 'DR-07',
    title: 'Disaster Recovery: Faulty Deployment Rollback Procedure',
    severity: 'SEV-1',
    trigger: 'Post-deployment error rate spike > 1% or critical regression detected in production release',
    detection: 'Automated release gate failure or SRE alert ALERT-SLO-001',
    impact: 'Degraded user experience on newly deployed version',
    immediateContainment: 'Halt deployment rollout; route 100% traffic to previous stable revision',
    rpoTargetHours: 0,
    rtoTargetMinutes: 2,
    recoveryDependencyGraph: ['Cloud Run Traffic Splitter', 'Git Tag / Release Registry', 'Health Probe'],
    steps: [
      { stepNumber: 1, action: 'Execute immediate traffic shift to previous immutable revision', responsibleRole: 'Release Manager', commandOrVerification: 'npm run audit:deployment' },
      { stepNumber: 2, action: 'Confirm /health and /ready on previous revision return 200 OK', responsibleRole: 'SRE' },
      { stepNumber: 3, action: 'Drain and terminate faulty revision instances gracefully', responsibleRole: 'DevOps' },
      { stepNumber: 4, action: 'Verify error rate drops to < 0.01% and p95 latency < 500ms', responsibleRole: 'QA' },
    ],
    validation: 'Application successfully serving traffic from previous stable revision with 0 downtime',
    rollback: 'Rollback is the primary containment action',
    escalation: 'Notify Engineering Director & Release Gate Auditor',
    postIncidentVerification: 'Archive build failure logs and update CI/CD test gates',
  },

  'DR-08': {
    code: 'DR-08',
    title: 'Disaster Recovery: Secret or API Credential Compromise Response',
    severity: 'SEV-1',
    trigger: 'Secret scan detection or unauthorized administrative activity in logs',
    detection: 'Automated security scan flag in CI/CD or log analyzer (ALERT-SECURITY-001)',
    impact: 'Potential risk of unauthorized data access',
    immediateContainment: 'Immediately revoke compromised API keys or service accounts in GCP IAM',
    rpoTargetHours: 0,
    rtoTargetMinutes: 20,
    recoveryDependencyGraph: ['GCP Secret Manager', 'GCP IAM', 'Cloud Run Environment', 'Client Bundle'],
    steps: [
      { stepNumber: 1, action: 'Identify compromised credential (e.g. Firebase Admin key or API key)', responsibleRole: 'Security Lead', commandOrVerification: 'npm run audit:enterprise-security' },
      { stepNumber: 2, action: 'Generate fresh credential in GCP IAM / Secret Manager', responsibleRole: 'Cloud Architect' },
      { stepNumber: 3, action: 'Update Cloud Run secret bindings and trigger rolling deployment', responsibleRole: 'DevOps' },
      { stepNumber: 4, action: 'Revoke and delete compromised credential in GCP IAM', responsibleRole: 'Security Lead' },
      { stepNumber: 5, action: 'Verify client dist bundle contains 0 exposed credentials', responsibleRole: 'DevSecOps', commandOrVerification: 'npm run audit:secrets' },
    ],
    validation: 'All production endpoints operational with fresh credentials; compromised key fully revoked',
    rollback: 'Do not rollback to old credentials under any circumstances',
    escalation: 'Notify CISO, Legal, and Executive Incident Committee',
    postIncidentVerification: 'Perform forensic log audit of activity_logs for the compromised period',
  },

  'DR-09': {
    code: 'DR-09',
    title: 'Disaster Recovery: Configuration or Environment Variable Corruption',
    severity: 'SEV-2',
    trigger: 'Missing required environment variable or malformed system settings document',
    detection: 'Server boot crash or system_settings schema validation failure',
    impact: 'Applet fails to boot or defaults to fallback maintenance mode',
    immediateContainment: 'Fall back to hardcoded safe defaults; block external mutation of configuration',
    rpoTargetHours: 0,
    rtoTargetMinutes: 10,
    recoveryDependencyGraph: ['.env.example', 'system_settings Singleton', 'Runtime Defaults'],
    steps: [
      { stepNumber: 1, action: 'Audit environment variables against .env.example', responsibleRole: 'DevOps', commandOrVerification: 'npm run audit:drift' },
      { stepNumber: 2, action: 'Restore system_settings singleton document from verified defaults', responsibleRole: 'DBA' },
      { stepNumber: 3, action: 'Restart container with verified environment variables', responsibleRole: 'DevOps' },
      { stepNumber: 4, action: 'Verify /ready probe returns 200 OK', responsibleRole: 'SRE' },
    ],
    validation: 'Server boots cleanly with all required configs loaded without error',
    rollback: 'Revert to last known valid environment configuration template',
    escalation: 'Notify Tech Lead',
    postIncidentVerification: 'Add automated CI/CD environment parity check',
  },

  'DR-10': {
    code: 'DR-10',
    title: 'Disaster Recovery: Complete Disaster Service Reconstruction & Cold-Start',
    severity: 'SEV-1',
    trigger: 'Total loss of primary infrastructure or catastrophic data center destruction',
    detection: 'Complete unreachability of all primary services across all monitoring probes',
    impact: 'Total system offline until secondary infrastructure is provisioned and restored',
    immediateContainment: 'Declare catastrophic disaster; activate Secondary Standby Region',
    rpoTargetHours: 24,
    rtoTargetMinutes: 30,
    recoveryDependencyGraph: [
      'Cloud DNS',
      'Secondary Cloud Run',
      'Cloud Storage Backup Bucket',
      'Firestore Secondary Instance',
      'Firebase Auth',
      'Observability',
    ],
    steps: [
      { stepNumber: 1, action: 'Declare Disaster Recovery Level 1 and activate DR Incident Team', responsibleRole: 'Incident Commander' },
      { stepNumber: 2, action: 'Provision secondary Firestore instance and import latest verified Cloud Storage backup', responsibleRole: 'DBA', commandOrVerification: 'npm run backup:verify' },
      { stepNumber: 3, action: 'Deploy latest immutable container artifact to secondary Cloud Run (asia-southeast2)', responsibleRole: 'DevOps' },
      { stepNumber: 4, action: 'Update Cloud DNS / Load Balancing to point domain to secondary region', responsibleRole: 'Network Lead' },
      { stepNumber: 5, action: 'Run full 70-point release gate audit and data integrity check', responsibleRole: 'SRE Lead', commandOrVerification: 'npm run audit:enterprise' },
      { stepNumber: 6, action: 'Verify public traffic and CMS functionality is 100% restored', responsibleRole: 'QA Lead' },
    ],
    validation: 'System 100% restored in secondary region with 0 orphan data and RPO <= 24h, RTO < 30m',
    rollback: 'Remain in secondary region until primary region is certified clean and rebuilt',
    escalation: 'Notify Board of Directors, Executive Management, and Key Stakeholders',
    postIncidentVerification: 'Conduct enterprise-wide disaster recovery postmortem and review SLA compliance',
  },
};
