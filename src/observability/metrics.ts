/**
 * Long-Term Production Capacity & Operational Metrics Thresholds for BatuTV (P0-12).
 */

export interface CapacityThresholds {
  warningPercent: number;
  criticalPercent: number;
  maxRecommendedDocuments: Record<string, number>;
  maxDailyActiveSubscriptions: number;
  maxP95LatencyMs: number;
  maxErrorRatePercent: number;
}

export const PRODUCTION_CAPACITY_CONFIG: CapacityThresholds = {
  warningPercent: 70,
  criticalPercent: 85,
  maxRecommendedDocuments: {
    articles: 100000,
    videos: 50000,
    categories: 500,
    tags: 10000,
    authors: 1000,
    media: 500000,
    pages: 200,
    navigation: 100,
    footer: 10,
    site_settings: 10,
    system_settings: 10,
    users: 500,
    admins: 100,
    activity_logs: 1000000,
  },
  maxDailyActiveSubscriptions: 200,
  maxP95LatencyMs: 500,
  maxErrorRatePercent: 1.0,
};

export interface RetentionPolicy {
  hotDays: number;
  warmDays: number;
  archiveDays: number;
  purgeDays: number;
  dryRun: boolean;
}

export const DATA_RETENTION_POLICY: RetentionPolicy = {
  hotDays: 30,
  warmDays: 90,
  archiveDays: 365,
  purgeDays: 730,
  dryRun: true,
};

export interface CollectionCapacityReport {
  collectionName: string;
  currentCount: number;
  maxThreshold: number;
  utilizationPercent: number;
  status: 'GREEN' | 'WARNING' | 'CRITICAL';
  projection30Days: number;
  projection90Days: number;
  projection180Days: number;
  projection365Days: number;
  capacityRisk365: boolean;
}

export function calculateCollectionProjections(
  collectionName: string,
  currentCount: number,
  monthlyGrowthRate = 0.15
): CollectionCapacityReport {
  const maxThreshold = PRODUCTION_CAPACITY_CONFIG.maxRecommendedDocuments[collectionName] || 10000;
  const utilizationPercent = Number(((currentCount / maxThreshold) * 100).toFixed(2));

  let status: 'GREEN' | 'WARNING' | 'CRITICAL' = 'GREEN';
  if (utilizationPercent >= PRODUCTION_CAPACITY_CONFIG.criticalPercent) {
    status = 'CRITICAL';
  } else if (utilizationPercent >= PRODUCTION_CAPACITY_CONFIG.warningPercent) {
    status = 'WARNING';
  }

  const projection30Days = Math.round(currentCount * (1 + monthlyGrowthRate));
  const projection90Days = Math.round(currentCount * Math.pow(1 + monthlyGrowthRate, 3));
  const projection180Days = Math.round(currentCount * Math.pow(1 + monthlyGrowthRate, 6));
  const projection365Days = Math.round(currentCount * Math.pow(1 + monthlyGrowthRate, 12));

  const capacityRisk365 = projection365Days > maxThreshold * 0.85;

  return {
    collectionName,
    currentCount,
    maxThreshold,
    utilizationPercent,
    status,
    projection30Days,
    projection90Days,
    projection180Days,
    projection365Days,
    capacityRisk365,
  };
}
