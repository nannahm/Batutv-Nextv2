/**
 * BatuTV News Portal & CMS — SLO/SLA Tracker & Enforcement Engine (P0-12)
 */

export interface SloConfig {
  availabilityTargetPercent: number;
  maxP95LatencyMs: number;
  maxP99LatencyMs: number;
  maxRpoHours: number;
  maxRtoMinutes: number;
  minApiSuccessPercent: number;
}

export const PRODUCTION_SLO_CONFIG: SloConfig = {
  availabilityTargetPercent: 99.9,
  maxP95LatencyMs: 500,
  maxP99LatencyMs: 1000,
  maxRpoHours: 24,
  maxRtoMinutes: 30,
  minApiSuccessPercent: 99.9,
};

export type SloStatus = 'HEALTHY' | 'WARNING' | 'BREACHED' | 'CRITICAL';
export type SloTrend = 'STABLE' | 'IMPROVING' | 'DEGRADING';

export interface SloMetricEvaluation {
  metricName: string;
  target: string;
  actual: string;
  status: SloStatus;
  trend: SloTrend;
  lastBreach: string | null;
  breachCount: number;
}

export interface SloReport {
  timestamp: string;
  overallStatus: SloStatus;
  evaluations: SloMetricEvaluation[];
}

export function evaluateSlos(actuals: {
  availability: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  rpoHours: number;
  rtoMinutes: number;
  apiSuccessRate: number;
}): SloReport {
  const evaluations: SloMetricEvaluation[] = [];

  // 1. Availability
  let availStatus: SloStatus = 'HEALTHY';
  if (actuals.availability < PRODUCTION_SLO_CONFIG.availabilityTargetPercent) availStatus = 'BREACHED';
  else if (actuals.availability < 99.95) availStatus = 'WARNING';

  evaluations.push({
    metricName: 'System Availability',
    target: `>= ${PRODUCTION_SLO_CONFIG.availabilityTargetPercent}%`,
    actual: `${actuals.availability.toFixed(2)}%`,
    status: availStatus,
    trend: 'STABLE',
    lastBreach: null,
    breachCount: 0,
  });

  // 2. p95 Latency
  let p95Status: SloStatus = 'HEALTHY';
  if (actuals.p95LatencyMs > PRODUCTION_SLO_CONFIG.maxP95LatencyMs) p95Status = 'BREACHED';
  else if (actuals.p95LatencyMs > 400) p95Status = 'WARNING';

  evaluations.push({
    metricName: 'p95 Response Latency',
    target: `< ${PRODUCTION_SLO_CONFIG.maxP95LatencyMs} ms`,
    actual: `${actuals.p95LatencyMs} ms`,
    status: p95Status,
    trend: 'STABLE',
    lastBreach: null,
    breachCount: 0,
  });

  // 3. p99 Latency
  let p99Status: SloStatus = 'HEALTHY';
  if (actuals.p99LatencyMs > PRODUCTION_SLO_CONFIG.maxP99LatencyMs) p99Status = 'CRITICAL';
  else if (actuals.p99LatencyMs > 800) p99Status = 'WARNING';

  evaluations.push({
    metricName: 'p99 Response Latency',
    target: `< ${PRODUCTION_SLO_CONFIG.maxP99LatencyMs} ms`,
    actual: `${actuals.p99LatencyMs} ms`,
    status: p99Status,
    trend: 'STABLE',
    lastBreach: null,
    breachCount: 0,
  });

  // 4. RPO
  let rpoStatus: SloStatus = 'HEALTHY';
  if (actuals.rpoHours > PRODUCTION_SLO_CONFIG.maxRpoHours) rpoStatus = 'CRITICAL';
  else if (actuals.rpoHours > 18) rpoStatus = 'WARNING';

  evaluations.push({
    metricName: 'Recovery Point Objective (RPO)',
    target: `<= ${PRODUCTION_SLO_CONFIG.maxRpoHours} hours`,
    actual: `${actuals.rpoHours} hours`,
    status: rpoStatus,
    trend: 'STABLE',
    lastBreach: null,
    breachCount: 0,
  });

  // 5. RTO
  let rtoStatus: SloStatus = 'HEALTHY';
  if (actuals.rtoMinutes >= PRODUCTION_SLO_CONFIG.maxRtoMinutes) rtoStatus = 'BREACHED';

  evaluations.push({
    metricName: 'Recovery Time Objective (RTO)',
    target: `< ${PRODUCTION_SLO_CONFIG.maxRtoMinutes} minutes`,
    actual: `~${actuals.rtoMinutes} minutes`,
    status: rtoStatus,
    trend: 'STABLE',
    lastBreach: null,
    breachCount: 0,
  });

  // 6. API Success Rate
  let apiStatus: SloStatus = 'HEALTHY';
  if (actuals.apiSuccessRate < PRODUCTION_SLO_CONFIG.minApiSuccessPercent) apiStatus = 'BREACHED';

  evaluations.push({
    metricName: 'API & SSR Success Rate',
    target: `>= ${PRODUCTION_SLO_CONFIG.minApiSuccessPercent}%`,
    actual: `${actuals.apiSuccessRate.toFixed(2)}%`,
    status: apiStatus,
    trend: 'STABLE',
    lastBreach: null,
    breachCount: 0,
  });

  const anyCritical = evaluations.some((e) => e.status === 'CRITICAL');
  const anyBreached = evaluations.some((e) => e.status === 'BREACHED');
  const anyWarning = evaluations.some((e) => e.status === 'WARNING');

  let overallStatus: SloStatus = 'HEALTHY';
  if (anyCritical) overallStatus = 'CRITICAL';
  else if (anyBreached) overallStatus = 'BREACHED';
  else if (anyWarning) overallStatus = 'WARNING';

  return {
    timestamp: new Date().toISOString(),
    overallStatus,
    evaluations,
  };
}
