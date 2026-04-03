# Habit Bank - User Guide

Welcome to **Habit Bank**, the only tracker that treats your time with the same rigor as a financial ledger. This guide will help you master your "Time Debt" and achieve temporal solvency.

---

## 1. Core Concepts

### 1.1 The Ledger (Universal Currency)
In Habit Bank, everything—from reading a book to doing pushups—is reduced to **Seconds**. This allows us to calculate how much of your 24-hour day is committed and how much "debt" you owe to your past self.

### 1.2 The Waterfall (Allocation Logic)
When you log progress, the system allocates your effort in a strict priority order:
1.  **Fill Today:** First, it satisfies today's target to prevent new debt.
2.  **Repay the Past:** Any surplus effort automatically pays off your oldest missed days (starting from the habit's `Genesis`).
3.  **Bank the Future:** If you're all caught up, extra effort becomes a "buffer" for tomorrow.

---

## 2. Managing Your Habits

### 2.1 Setting the Genesis (Start Date)
The `startDate` is the "Genesis" of your habit.
- **Accruing Debt:** If you set a past date, the system immediately calculates debt for every day missed.
- **Fresh Start:** If you're overwhelmed, you can "Bankrupt" your old debt by moving the `startDate` to today.

### 2.2 Chronological Targets (Phases)
You can change your goals over time.
- **Dynamic Goals:** Increase or decrease your target (e.g., move from 10 reps/day to 20 reps/day).
- **Accurate History:** The system calculates debt based on the specific goal that was active on each historical day.

### 2.3 Unit Hierarchies
Don't just track "seconds." Track what matters.
- **Reading:** `1 Juz` = `20 Pages`, `1 Page` = `1.5 Minutes`.
- **Exercise:** `1 Rep` = `5 Seconds`.
- **Validation:** Every unit must eventually resolve to a time-based duration (seconds, minutes, etc.).

---

## 3. The Dashboard

### 3.1 Recommended Next (Temporal Affinity)
The dashboard uses AI to analyze your historical logs and identify your "Temporal Affinity"—the time of day you usually complete each habit.
- **Optimal Schedule:** Look for the "Usually @ [Time]" badge to align with your natural rhythm.

### 3.2 Tiered Agenda
- **Tier 1: Today's Deliverables:** These are your targets for **Today**. Complete these first to maintain your current status.
- **Tier 2: Debt Amortization (The Backlog):** These are habits where you've met today's goal but still owe time to the past.

---

## 4. Advanced Features

### 4.1 Time Travel View
Click the **Calendar** icon to inspect your ledger's state on any past date. This view re-simulates the waterfall for that specific day, allowing you to audit your consistency and see exactly how your effort was allocated.

### 4.2 Temporal Protocols
- **Day Start Hour:** Night owl? Set your day start to `4:00 AM` so your late-night sessions count towards the previous day.
- **Timezone Sync:** Habit Bank automatically detects your timezone, ensuring your logs stay anchored to your local "logical date."

### 4.3 Daily Buffers
Define "Non-Negotiable" time blocks (e.g., Sleep, Work, Commute). These are deducted from your **Daily Capacity**, helping you see how much "discretionary time" you actually have for your habits.

---

## 5. Troubleshooting & Tips

- **Why is my Clearance Date "N/A"?** The system only predicts a clearance date if you are currently **outperforming** your target (i.e., you have a surplus).
- **Stackable Modules:** Use the "Stackable" toggle for habits that don't take up "real-world time" (like "No Sugar" or "Early Wakeup"). These won't count against your 24-hour daily quota.
