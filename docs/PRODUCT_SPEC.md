# Habit Bank - Product Specification

## 1. Core Philosophy

> "Identity is nothing but a collection of habits. We are what we do."

Habit Bank is a ledger-based system where daily habits accrue as **Time Debt**. It fundamentally rejects the "streak" paradigm. Missed days do not reset progress; they accumulate as work owed. All effort is mathematically converted into time (seconds/minutes/hours), allowing the system to natively compare and prioritize vastly different activities.

## 2. Universal Currency: Time

Every habit is defined by a unit hierarchy that bottoms out at a standard time value. This "Universal Currency" allows the system to:
- Compare the weight of different habits (e.g., 100 pushups vs. 1 hour of reading).
- Calculate total daily commitment.
- Track "Time Debt" as a tangible, repayable value.

### Examples:
*   **Physical Exercise:** 1 Pushup = 15 seconds. Target = 100/day = 25 mins/day.
*   **Knowledge Acquisition:** 1 Line = 10s, 1 Page = 15 Lines, 1 Juz = 20 Pages. Target = 1 Juz/day = 50 mins/day.

## 3. Habit Granularity & Units

### 3.1 Multilevel Granularity
Habits can have multiple levels of nested units (e.g., `juz` -> `pages` -> `lines`), where the lowest non-time level must eventually resolve to an estimated time duration (seconds).

### 3.2 Daily Usage Quota
Every habit's target is translated into an internal time requirement. This is deducted from the user's daily total 24-hour quota. The system tracks remaining daily capacity to help users avoid over-commitment.

### 3.3 Logging Rules
- **Strict Mark-Off Metrics:** Users log progress using a specific `mark_off_unit` defined for the habit. 
- **Unit Flexibility:** While logging is restricted to one unit, the UI can display progress in multiple units from the hierarchy (e.g., showing progress in "Pages" even if you log in "Juz").
- **Quantity vs. Time:** If a habit is quantity-based (e.g., pushups), users log quantity. If it's pure time (e.g., meditation), they log time.

## 4. Key Mechanisms

### 4.1 The Waterfall Allocation (Today -> Past -> Future)
When effort is logged, it flows through the timeline in a strict priority order:
1.  **Fill Today:** First, it satisfies today's target.
2.  **Repay the Past:** Any surplus spills over to pay off historical deficits.
3.  **Bank the Future:** If all debt is cleared, surplus banks forward as a "buffer" for future days.

### 4.2 Fill Direction & Stacked Habits
- **Fill Direction:** Users can choose whether surplus effort fills deficits starting from the **Start Date** (oldest first) or from **Today** (most recent first).
- **Stacked Toggle:** Habits can be marked as "Stacked." If disabled, the habit behaves like a traditional tracker where debt and buffers do not accumulate.

### 4.3 The LJF + Priority Queue Engine
The dashboard is a dynamic agenda that sorts habits to maximize impact:
*   **Tier 1: Today's Deliverables:** Active targets for the current day. Sorted by `User Priority` (1 is highest) then `Today's Deficit` (Descending).
*   **Tier 2: The Historical Backlog ("Past Horrors"):** Habits with cleared today-targets but remaining historical debt. Sorted exclusively by `Historical Debt` (Descending).

### 4.4 Time Travel & Immutability
- **Today-Only Mutations:** To maintain the integrity of the ledger, users can only add or delete logs for the current logical date.
- **Historical Snapshots:** Users can "Time Travel" to view the state of their ledger on any past date, seeing exactly how the Waterfall allocated their effort at that time.

## 5. Analytics & Visualization

*   **Contribution Heatmaps:** GitHub-style grids showing daily effort intensity.
- **Normalized Velocity:** A ratio of `Actual / Expected` performance for the active period.
*   **Time to Zero:** An AI-driven forecast of the date when historical debt will be cleared, based on recent moving average velocity (7-day or lifetime fallback).
- **Temporal Affinity (Recommended Next):** Identifying the "peak hour" when a user usually completes a specific habit to suggest it at the optimal time.
