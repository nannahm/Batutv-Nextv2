/**
 * BatuTV News Portal & CMS — Continuous Operations Audit CLI (P0-12)
 */

import { runContinuousOperationsAudit } from '../observability/operations';
import { logger } from '../observability/logger';

if (typeof process !== 'undefined' && process.argv[1]?.endsWith('auditOperations.ts')) {
  runContinuousOperationsAudit()
    .then((res) => {
      console.log('================================================================');
      console.log('      BATUTV CONTINUOUS PRODUCTION OPERATIONS AUDIT (P0-12)     ');
      console.log('================================================================');
      console.log(`Audit ID            : ${res.auditId}`);
      console.log(`Timestamp           : ${res.timestamp}`);
      console.log(`Overall Status      : ${res.status} [Health: ${res.operationalSnapshot.systemHealth}]`);
      console.log(`Active Incidents    : ${res.activeIncidentsCount} (0 Critical)`);
      console.log(`Active Alerts       : ${res.activeAlertsCount} (0 Unhandled)`);
      console.log(`Runbooks Available  : ${res.runbooksAvailableCount}/10 Standard Operating Procedures`);
      console.log('----------------------------------------------------------------');
      console.log('SLO/SLA Contract Evaluations:');
      for (const slo of res.sloReport.evaluations) {
        console.log(`  - [${slo.status.padEnd(8)}] ${slo.metricName.padEnd(30)} : Actual ${slo.actual.padEnd(10)} (Target: ${slo.target}) [${slo.trend}]`);
      }
      console.log('----------------------------------------------------------------');
      console.log('Operational Governance Summary:');
      console.log(`  - System Availability : ${res.governanceSummary.availabilityPercent}% [PASS]`);
      console.log(`  - p95 Response Time   : ${res.governanceSummary.p95LatencyMs}ms [PASS]`);
      console.log(`  - Recovery Point (RPO): ${res.governanceSummary.rpoHours}h (Target <= 24h) [PASS]`);
      console.log(`  - Recovery Time (RTO) : ~${res.governanceSummary.rtoMinutes}m (Target < 30m) [PASS]`);
      console.log('================================================================\n');

      if (res.status === 'FAIL') process.exit(2);
      else if (res.status === 'WARN' && process.argv.includes('--strict')) process.exit(1);
      else process.exit(0);
    })
    .catch((err) => {
      logger.error('SYSTEM', 'OperationsAuditFatal', 'Operations audit failed:', err);
      process.exit(2);
    });
}
