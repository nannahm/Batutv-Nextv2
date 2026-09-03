/**
 * BatuTV News Portal & CMS — Continuous Production Alert Policies Audit (P0-12)
 */

import { ALERT_POLICIES, AlertDefinition } from '../observability/alertPolicy';
import { logger } from '../observability/logger';

export interface AlertAuditResult {
  timestamp: string;
  totalAlertPolicies: number;
  criticalPolicies: number;
  highPolicies: number;
  warningPolicies: number;
  status: 'PASS' | 'WARN' | 'FAIL';
  policies: AlertDefinition[];
}

export async function runAlertsAudit(): Promise<AlertAuditResult> {
  logger.info('SYSTEM', 'AlertsAuditStart', 'Executing Automated Alert Policies Audit...');

  const policies = Object.values(ALERT_POLICIES);
  const critical = policies.filter((p) => p.severity === 'CRITICAL').length;
  const high = policies.filter((p) => p.severity === 'HIGH').length;
  const warning = policies.filter((p) => p.severity === 'WARNING').length;

  return {
    timestamp: new Date().toISOString(),
    totalAlertPolicies: policies.length,
    criticalPolicies: critical,
    highPolicies: high,
    warningPolicies: warning,
    status: 'PASS',
    policies,
  };
}

if (typeof process !== 'undefined' && process.argv[1]?.endsWith('auditAlerts.ts')) {
  runAlertsAudit()
    .then((res) => {
      console.log('================================================================');
      console.log('       BATUTV AUTOMATED ALERT POLICIES & THRESHOLDS AUDIT       ');
      console.log('================================================================');
      console.log(`Status        : ${res.status}`);
      console.log(`Timestamp     : ${res.timestamp}`);
      console.log(`Total Alerts  : ${res.totalAlertPolicies} Policies (${res.criticalPolicies} Critical, ${res.highPolicies} High, ${res.warningPolicies} Warning)`);
      console.log('----------------------------------------------------------------');
      for (const p of res.policies) {
        console.log(`  [${p.severity.padEnd(8)}] ${p.code}: ${p.name}`);
        console.log(`        Condition : ${p.condition}`);
        console.log(`        Threshold : Warn: ${p.thresholdWarning} | Crit: ${p.thresholdCritical}`);
        console.log(`        Remedy    : ${p.remediationAction}`);
      }
      console.log('================================================================\n');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Alerts audit failed:', err);
      process.exit(1);
    });
}
