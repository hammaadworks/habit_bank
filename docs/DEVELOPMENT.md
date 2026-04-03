# Habit Bank - Development Guide

This document is for developers who want to contribute to the codebase or understand its internal execution.

## 1. Local Environment Setup

- **Backend (FastAPI)**:
    - Uses `uv` for package management.
    - Run `uvicorn app.main:app --reload` to start the server.
- **Frontend (Next.js 15)**:
    - Uses `pnpm` for package management.
    - Run `pnpm dev` for local development.

## 2. High-Fidelity Tracing (Deep Logging)

The backend supports **Deep Logging** using Aspect-Oriented Programming (AOP) principles. This is designed for debugging complex waterfall allocations and unit hierarchy resolutions.

### 2.1 Activation
Deep logging is **disabled** by default to prevent log bloating. To activate it, run the backend server with the `--deeplogged` flag:

```bash
uvicorn app.main:app --deeplogged
```
**Note:** Activating this flag automatically switches the global log level to `DEBUG`.

### 2.2 What is Captured?
When enabled, the `@deeplog` decorator wraps critical engine functions and captures:
1.  **Trace ID**: A unique 8-character ID for every function call.
2.  **Input Parameters**: All arguments passed to the function, serialized to JSON.
3.  **Execution Time**: High-precision duration in milliseconds (ms).
4.  **Return Value**: The final output of the function.
5.  **Failure Analysis**: If a function fails, the logger captures the exact error and input state.

### 2.3 Targeted Functions
Deep logging is currently applied to:
- `LedgerEngine.calculate_timeline`
- `LedgerEngine.calculate_analytics`
- `UnitConverter.to_base_units`
- `UnitConverter.validate_hierarchy`

---

## 3. Core Engineering Concepts

### 3.1 Waterfall Allocation Algorithm
The core of the system is the chronological simulation in `LedgerEngine.py`. 
- **O(N) Complexity**: The engine iterates through the timeline once to calculate all allocated effort and debt.
- **Two-Pointer Simulation**: One pointer tracks the "logged surplus" and another tracks the "unfilled past days" to amortize effort repayment.

### 3.2 Recursive Unit Resolution
`UnitConverter.py` uses recursive path-finding to resolve nested units down to seconds. 
- **Ambiguity Check**: It validates all possible paths in the hierarchy to ensure a consistent result.
- **Reachability**: It ensures every defined unit has a valid path to a time-based base unit.

---

## 4. Historical Context (Completed Epics)

The system has matured through the following milestones:
- **Phase 1: The Ledger Engine**: Core unit conversion, database models, and waterfall allocation logic.
- **Phase 2: Priority Dashboard**: Dynamic sorting, analytics (velocity/forecasting), and GitHub-style heatmaps.
- **Phase 3: UX Polish**: Responsive mobile-first overhaul, "Industrial Pro" aesthetic, and glassmorphism.
- **Phase 4: Advanced Protocols**: Timezones, logical dates, and Time Travel View.
