# Habit Bank - Session Context & Handoff

## 1. Project Overview
**Product:** Habit Bank (A ledger-based habit tracker focused on Time Debt).
**Core Philosophy:** Habits are atomic. Missed days accrue "Time Debt." Logs are facts. All activities are reducible to **Seconds** as a universal currency.

## 2. Current Status (April 2026)
We have completed **Phase 1-4**, encompassing the Ledger Engine, Priority Dashboard, UI/UX Polish, and Advanced Temporal Protocols. The application is now a fully functional, mobile-responsive "PRO" identity node.

### Recent Major Updates:
- **Unified Documentation**: Consolidated redundant and stale files into a coherent set (Product Spec, Architecture, Development, User Guide).
- **Temporal Stability**: Robust handling of timezones and logical dates for global consistency.
- **Deep Logging**: Integrated AOP-based tracing for complex engine debugging.

## 3. Key Documentation
- **`README.md`**: High-level overview and quick start.
- **`docs/PRODUCT_SPEC.md`**: Vision, logic, and feature definitions.
- **`docs/ARCHITECTURE.md`**: Data models, algorithms, and technical specs.
- **`docs/DEVELOPMENT.md`**: Engineering standards, setup, and deep logging.
- **`docs/USER_GUIDE.md`**: Comprehensive guide for master users.
- **`docs/DEPLOYMENT.md`**: Production deployment protocols.

## 4. Logical Foundations
1.  **Waterfall Allocation:** Logs satisfy *Today* first -> *Oldest Past Deficit* second -> *Future Buffer* third.
2.  **Universal Currency:** Every habit resolves recursively to **Seconds**.
3.  **Ambiguity Rejection:** Unit hierarchies must resolve to a single time value.
4.  **Temporal Integrity:** Mutations are restricted to the current "logical" date.

## 5. Next Steps
1.  **Mobile Protocol**: Native mobile applications.
2.  **Social Ledger**: Public identity profiles and competitive leagues.
3.  **AI Auditor**: Advanced personalized habit suggestions.
4.  **Biometric Sync**: Automated log entry from external health providers.
