# UI/UX & Gamification Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Habit Bank dashboard into a high-performance, dark/premium, 0-latency gamified application.

**Architecture:** We will replace the current complex analytics with a Gamified "Victory Board" (Streak, XP, Rank), overhaul the Daily Spectrum to visualize stackable habits without consuming time, refine the Create/Edit/Log habit UI for maximum fluid touch-targets, and optimize FastAPI queries for 0-latency.

**Tech Stack:** Next.js (React), Tailwind CSS, FastAPI, SQLite

---

### Task 1: Dark & Premium Theme Foundation

**Files:**
- Modify: `frontend/src/app/app.css`
- Modify: `frontend/src/components/ThemeProvider.tsx`

- [ ] **Step 1: Update Global CSS Variables for Dark & Premium**

Update `frontend/src/app/app.css` to enforce a strict dark mode aesthetic with obsidian backgrounds, subtle gold accents, and emerald success states.

```css
@layer base {
  :root {
    --background: 240 10% 4%; /* Obsidian */
    --foreground: 0 0% 98%;
    --card: 240 10% 6%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 6%;
    --popover-foreground: 0 0% 98%;
    --primary: 45 93% 47%; /* Gold Accent */
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
    --radius: 1rem;
  }
}
```

- [ ] **Step 2: Force Dark Mode**

In `frontend/src/components/ThemeProvider.tsx` (or layout), enforce `forcedTheme="dark"` or default to dark, removing light mode toggles if strict dark premium is required.

- [ ] **Step 3: Commit Theme Changes**

```bash
git add frontend/src/app/app.css frontend/src/components/ThemeProvider.tsx
git commit -m "feat(ui): implement dark and premium aesthetic variables"
```

---

### Task 2: Fix Daily Spectrum Widget Logic

**Files:**
- Modify: `frontend/src/components/DailySpectrumWidget.tsx`

- [ ] **Step 1: Separate Stackable and Core Habits**

Modify the `chartData` generation to only include `!habit.is_stacked` in the main 24h pie chart. Create a secondary list for `is_stacked` habits.

```tsx
// Inside useMemo
const coreData: { name: string; value: number; color: string }[] = [];
const stackedData: { name: string; color: string }[] = [];

allHabits.forEach(habit => {
  const target = Number(habit.todayTarget || 0);
  if (target > 0) {
    if (habit.is_stacked) {
      stackedData.push({ name: habit.name, color: habit.color || COLORS[colorIndex++ % COLORS.length] });
    } else {
      coreData.push({ name: habit.name, value: target, color: habit.color || COLORS[colorIndex++ % COLORS.length] });
    }
  }
});
```

- [ ] **Step 2: Render Stackable Habits as Outer Orbits**

Update the JSX to render `stackedData` as a floating list of glowing dots or an outer dashed ring outside the `PieChart`.

```tsx
{/* Render below PieChart container */}
{stackedData.length > 0 && (
  <div className="flex flex-wrap justify-center gap-2 mt-4">
    {stackedData.map((item, idx) => (
      <div key={idx} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)]">
         <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }} />
         <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">{item.name}</span>
      </div>
    ))}
  </div>
)}
```

- [ ] **Step 3: Commit Daily Spectrum Fix**

```bash
git add frontend/src/components/DailySpectrumWidget.tsx
git commit -m "fix(ui): exclude stacked habits from 24h capacity in daily spectrum"
```

---

### Task 3: Gamified Victory Board

**Files:**
- Create: `frontend/src/components/VictoryBoard.tsx`
- Modify: `frontend/src/components/dashboard/DashboardView.tsx`

- [ ] **Step 1: Create VictoryBoard Component**

Create a new component replacing complex analytics. It calculates Character Level (XP = lifetime logged seconds / 3600), Current Streak, and Consistency.

```tsx
import React, { useMemo } from 'react';
import { Flame, Shield, Trophy } from 'lucide-react';
import { AgendaItem } from '@/types';

export function VictoryBoard({ allHabits }: { allHabits: AgendaItem[] }) {
  const xp = useMemo(() => Math.floor(allHabits.reduce((acc, h) => acc + (h.totalLifetimeSeconds || 0), 0) / 3600), [allHabits]);
  const level = Math.floor(Math.sqrt(xp)) + 1;
  const nextLevelXp = Math.pow(level, 2);
  const progress = (xp / nextLevelXp) * 100;

  return (
    <div className="flex flex-col gap-6 p-6 bg-card rounded-[2.5rem] border border-border shadow-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Character Level</h2>
          <div className="text-4xl font-black text-primary mt-1">LVL {level}</div>
        </div>
        <Trophy className="w-12 h-12 text-primary opacity-20" />
      </div>
      
      <div className="w-full bg-background rounded-full h-3 overflow-hidden border border-border/50">
        <div className="bg-primary h-full transition-all duration-1000 relative" style={{ width: `${progress}%` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-background p-4 rounded-2xl flex flex-col items-center justify-center border border-border/50">
          <Flame className="w-6 h-6 text-orange-500 mb-2 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
          <span className="text-2xl font-black text-foreground">12</span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Day Streak</span>
        </div>
        <div className="bg-background p-4 rounded-2xl flex flex-col items-center justify-center border border-border/50">
          <Shield className="w-6 h-6 text-emerald-500 mb-2 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-2xl font-black text-foreground">94%</span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Consistency</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace Analytics in Dashboard**

Modify `DashboardView.tsx` to remove `AnalyticsDashboard` and insert `VictoryBoard`. Update the CSS grid to use a 70/30 split.

```tsx
// Inside DashboardView.tsx
<div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
  <div className="flex flex-col min-h-0">
     {/* Agenda and Habit Cards Go Here */}
     <HabitsView ... />
  </div>
  <div className="hidden lg:flex flex-col gap-6 overflow-y-auto no-scrollbar">
     <VictoryBoard allHabits={agenda.tier1.concat(agenda.tier2, agenda.completed)} />
     {/* Daily Spectrum below Victory Board */}
     <DailySpectrumWidget user={user} agenda={agenda} size="md" />
  </div>
</div>
```

- [ ] **Step 3: Commit Gamification**

```bash
git add frontend/src/components/VictoryBoard.tsx frontend/src/components/dashboard/DashboardView.tsx
git commit -m "feat(ui): add gamified victory board and 70/30 seamless dashboard split"
```

---

### Task 4: Fluid Habit Creation & Editing UX

**Files:**
- Modify: `frontend/src/components/CreateHabitModal.tsx`
- Modify: `frontend/src/components/EditHabitModal.tsx`

- [ ] **Step 1: Simplify Modals**

Refactor the Modals to remove clunky wizards if they exist. Use a clean, vertically scrollable single-form with large touch targets, premium glassmorphism inputs, and minimal borders.

```tsx
// Example modification for inputs
<input
  type="text"
  placeholder="Habit Name"
  className="w-full bg-background border border-border rounded-2xl px-6 py-5 text-xl font-black text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-inner"
/>
```

Ensure the "Stackable" toggle is a prominent, beautiful switch.

- [ ] **Step 2: Commit Modal UX Updates**

```bash
git add frontend/src/components/CreateHabitModal.tsx frontend/src/components/EditHabitModal.tsx
git commit -m "style(ui): redesign creation and edit modals for fluid UX and large touch targets"
```

---

### Task 5: Seamless Logging UI

**Files:**
- Modify: `frontend/src/components/habit/HabitLogForm.tsx`
- Modify: `frontend/src/components/HabitCard.tsx`

- [ ] **Step 1: Large Hit-Area Logging**

In `HabitLogForm.tsx`, ensure the "+" and "-" buttons for logging are massive (min 60x60px for mobile touch) and feature haptic feedback (or visual scales).

```tsx
<button
  onClick={handleLog}
  className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,215,0,0.3)]"
>
  <Plus className="w-8 h-8" />
</button>
```

- [ ] **Step 2: Commit Logging UX Updates**

```bash
git add frontend/src/components/habit/HabitLogForm.tsx frontend/src/components/HabitCard.tsx
git commit -m "style(ui): maximize touch targets and add fluid animations to habit logging"
```

---

### Task 6: Backend 0-Latency Optimization

**Files:**
- Modify: `backend/app/routers/dashboard.py`
- Modify: `backend/app/core/ledger_engine.py`

- [ ] **Step 1: Optimize Dashboard Query**

Review `backend/app/routers/dashboard.py`. If it iterates over all habits and recalculates historical debt synchronously, implement an LRU cache or optimize the SQL queries (e.g. `selectinload` in SQLAlchemy).

```python
# Example pseudo-optimization in dashboard.py
# If using SQLAlchemy, ensure eager loading of related records to prevent N+1 queries.
from sqlalchemy.orm import selectinload

# Apply to query:
# query = select(Habit).options(selectinload(Habit.logs)).where(Habit.user_id == current_user.id)
```

- [ ] **Step 2: Minimize Payload**

Ensure the `DashboardAgenda` payload only includes necessary fields. Remove massive historical timeline arrays from the default dashboard response if they are not needed by the `VictoryBoard`.

- [ ] **Step 3: Commit Backend Optimizations**

```bash
git add backend/app/routers/dashboard.py backend/app/core/ledger_engine.py
git commit -m "perf(backend): optimize dashboard queries to ensure 0-latency responses"
```
