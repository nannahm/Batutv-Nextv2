# BATUTV Firestore Cost Control & Capacity Planning

## 1. Capacity Limits & Projections
- Warning Threshold: 70% of recommended document volume.
- Critical Threshold: 85% of recommended document volume.
- Growth Forecasts: 30, 90, 180, and 365-day automated volume tracking.

## 2. Cost Control Rules
- Zero unbounded collection queries in public routes.
- Composite indexes for multi-field queries.
- Read-through caching for repeated document accesses.
- Data Retention Lifecycle:
  - HOT: 0–30 days
  - WARM: 31–90 days
  - ARCHIVE: 91–365 days
  - PURGE: > 730 days
