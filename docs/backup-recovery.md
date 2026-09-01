# BATUTV Disaster Recovery & Automated Backup Procedures

## 1. SLA Contracts
- **Recovery Point Objective (RPO)**: <= 24 Hours.
- **Recovery Time Objective (RTO)**: < 30 Minutes.
- **Coverage**: All 14 canonical Firestore collections (`articles`, `videos`, `categories`, `tags`, `authors`, `media`, `pages`, `navigation`, `footer`, `site_settings`, `system_settings`, `activity_logs`, `users`, `admins`).

## 2. Automated Backup Verification
Execute `npm run backup:verify` regularly to verify snapshot freshness, schema completeness, and non-destructive restore integrity.
