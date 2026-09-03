# BATUTV Production Release Governance & 70-Point Gate

## Release Gate Matrix
All deployments must pass the automated 70-point release gate:
- Command: `npm run audit:release`
- Passing Criteria: 100% PASS on critical gates (Exit Code: 0).
- Blocking Criteria: Any critical failure yields Exit Code: 2 (`RELEASE_BLOCKED`).
