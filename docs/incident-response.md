# BATUTV Incident Response & Standard Operating Procedures (INC-01 to INC-10)

## Incident Classification Matrix
- **SEV-1 (Critical)**: Complete outage or security breach. RTO target: < 15m. Postmortem mandatory.
- **SEV-2 (High)**: Degraded performance, backup SLA risk, or capacity warning. RTO target: < 30m.
- **SEV-3 (Medium)**: Transient warning or isolated component failure.
- **SEV-4 (Low)**: Minor non-blocking telemetry irregularity.

## Operational Procedures Summary
1. **INC-01: Firestore Service Outage or Degradation** (SEV-1)
   - Containment: Public readers fallback to read-through LocalStorage cache. Hold CMS mutations.
   - Verification: `npm run audit:integrity`
2. **INC-02: Firebase Authentication Outage** (SEV-1)
   - Containment: Public reader access remains open. Graceful auth maintenance banner on login.
   - Verification: `npm run audit:security`
3. **INC-03: Accidental Document Deletion / Corruption** (SEV-1)
   - Containment: Lock CMS writes to prevent cascade; identify verified snapshot (RPO <= 24h).
   - Verification: `npm run backup:verify` && `npm run audit:integrity`
4. **INC-04: Credential or API Key Exposure** (SEV-1)
   - Containment: Immediately revoke key in GCP IAM; rotate credentials and redeploy.
   - Verification: `npm run audit:security`
5. **INC-05: Backup SLA Breach (RPO Risk)** (SEV-2)
   - Trigger on-demand manual export and check Cloud Scheduler.
6. **INC-06: SLO Availability Drop Below 99.9%** (SEV-1)
   - Scale Cloud Run instances and inspect container errors.
7. **INC-07: p95 Response Latency Spike > 500ms** (SEV-2)
   - Check hot queries, enforce pagination limits, verify composite index presence.
8. **INC-08: Document Capacity Breach > 85%** (SEV-2)
   - Execute data retention lifecycle policy (dryRun verified).
9. **INC-09: Security Rules Drift Detected** (SEV-1)
   - Block release pipeline; re-deploy audited `firestore.rules`.
10. **INC-10: Configuration or Schema Drift** (SEV-2)
    - Reconcile TypeScript types and `.env.example`.
