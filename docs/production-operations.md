# BATUTV News Portal & CMS — Continuous Production Operations

## 1. Overview & Architecture
BATUTV operates on a robust full-stack architecture running Node.js Express server on Google Cloud Run with Google Cloud Firestore as the **Single Source of Truth (SSoT)** and Firebase Authentication for administrative CMS access.

```
                  ┌──────────────────────────┐
                  │   Production Runtime     │
                  │ Node.js / React / CMS    │
                  └────────────┬─────────────┘
                               │
               ┌───────────────▼───────────────┐
               │ Production Observability      │
               │ logger / metrics / telemetry  │
               └───────────────┬───────────────┘
                               │
      ┌────────────────────────▼────────────────────────┐
      │       Continuous Governance Engine              │
      │                                                 │
      │  Health Audit        Cost Audit                 │
      │  Security Audit      Capacity Audit             │
      │  Backup Audit        Dependency Audit           │
      │  Integrity Audit     SLO/SLA Audit              │
      └────────────────────────┬────────────────────────┘
                               │
                  ┌────────────▼────────────┐
                  │ Operational Controls    │
                  │ Release Gate & Runbooks │
                  └─────────────────────────┘
```

## 2. Standard Operational Commands
- `npm run audit:operations`: Continuous operations health and telemetry evaluation.
- `npm run audit:alerts`: Evaluates 8 automated alert policies against active thresholds.
- `npm run audit:drift`: Verifies Schema, Rules, Composite Index, RBAC, and Environment parity.
- `npm run audit:release`: Master 70-point release gate check.
- `npm run audit:all`: Executes the complete scheduled governance audit.
