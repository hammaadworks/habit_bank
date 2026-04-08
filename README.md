<div align="center">
  <br />
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/hammaadworks/HabitBank/main/assets/logo-dark.png">
    <img alt="Habit Bank Logo" width="180px" src="https://raw.githubusercontent.com/hammaadworks/HabitBank/main/assets/logo-light.png">
  </picture>
  <br />
  <h1>Habit Bank <span style="opacity: 0.5;">PRO</span></h1>
  <p><strong>The ultimate financial ledger for your temporal identity.</strong></p>
  <p>Stop tracking streaks. Start managing your time debt.</p>
</div>

<br />

<div align="center">
  <img src="https://img.shields.io/github/license/hammaadworks/HabitBank?style=for-the-badge&color=000000" alt="License">
  <img src="https://img.shields.io/github/last-commit/hammaadworks/HabitBank?style=for-the-badge&color=000000" alt="Last Commit">
  <img src="https://img.shields.io/github/stars/hammaadworks/HabitBank?style=for-the-badge&color=000000" alt="GitHub Stars">
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge&color=000000" alt="PRs Welcome">
</div>

<br />

<div align="center">
  <img src="https://raw.githubusercontent.com/hammaadworks/HabitBank/main/shots/home.png" alt="Habit Bank Dashboard" style="border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.3);">
</div>

---

## 📺 Watch Us Build This (Livestream Series)

[![Watch the Series](https://img.shields.io/badge/YouTube-Watch%20Livestream-red?style=for-the-badge&logo=youtube)](https://www.youtube.com/watch?v=dTBmzfqOz_U&list=PLakFdD-pYBdzU5o4QDx40LGmP4a78YzXb&index=1)

We are building Habit Bank **live** on YouTube! Follow along as we implement the Ledger Engine, design the "PRO" aesthetic, and solve complex temporal logic in real-time. 

---

## ⚡ The Philosophy

> "Identity is nothing but a collection of habits. We are what we do."

Most trackers treat habits as binary: you did it or you didn't. **Habit Bank** rejects the "streak" paradigm. We believe missed days shouldn't just reset a counter—they should accrue **Time Debt**. 

By converting every habit into a universal currency (**Seconds**), Habit Bank allows you to manage your life like a high-frequency trading floor. You have a 24-hour daily quota, a historical backlog of "Past Horrors," and a "Critical Path" of active deliverables.

## 🚀 Key Features

- **🏦 Universal Currency Engine**: Convert any metric (`Juz`, `Pages`, `Reps`, `Laps`) into `Seconds`. Native unit hierarchy support handles all the math.
- **🌊 Waterfall Allocation**: Effort flows from **Today** -> **Past Debt** -> **Future Buffer**. Never wonder where your hard work went.
- **📈 Tiered Dashboard**: Dynamic agenda sorting that prioritizes "Today's Deficit" over "Historical Debt."
- **⏳ Time Travel View**: Peek into the past to see exactly what your "temporal ledger" looked like on any given day.
- **🛡️ Temporal Protocols**: Deep configuration for day-start hours, week-start days, and automated timezone synchronization.
- **📊 Advanced Analytics**: Real-time velocity tracking, debt amortization forecasts, and Github-style intensity heatmaps.
- **🎨 Industrial Aesthetic**: A high-performance, dark-mode-first UI built with React 19 and Framer Motion for buttery-smooth interaction.

---

## 📽️ Interactive Demo

### High-Fidelity Ledger Engine
Watch the waterfall allocation in action as we log a habit and see the debt clear in real-time.

<div align="center">
  <!-- Replace with your Loom/YouTube video embed link -->
  <a href="https://www.youtube.com/watch?v=dTBmzfqOz_U&list=PLakFdD-pYBdzU5o4QDx40LGmP4a78YzXb&index=1">
    <img src="https://raw.githubusercontent.com/hammaadworks/HabitBank/main/shots/home.png" alt="Habit Bank Demo" width="600px" style="border-radius: 12px;">
  </a>
  <p><i>Click the image above to watch the walkthrough video.</i></p>
</div>

### Visualizing Your Temporal Debt
Every log is a fact. See how your consistency maps to a GitHub-style heatmap.

<div align="center">
  <img src="https://raw.githubusercontent.com/hammaadworks/HabitBank/main/shots/home.png" width="45%" style="border-radius: 10px; margin-right: 2%;">
  <img src="https://raw.githubusercontent.com/hammaadworks/HabitBank/main/shots/home.png" width="45%" style="border-radius: 10px;">
  <p><i>Left: Dashboard Agenda | Right: Analytics Breakdown</i></p>
</div>

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | [Next.js 15+](https://nextjs.org/), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://www.motion.dev/) |
| **Backend** | [FastAPI](https://fastapi.tiangolo.com/), [Python 3.12+](https://www.python.org/) |
| **Database** | [SQLModel](https://sqlmodel.tiangolo.com/) (SQLAlchemy + Pydantic), SQLite/PostgreSQL |
| **Tooling** | [uv](https://github.com/astral-sh/uv), [pnpm](https://pnpm.io/) |

### 🛠️ Engineering Excellence

- **🔍 High-Fidelity Tracing (Deep Logging)**: Built-in AOP-based logging for the Ledger Engine. Activate with `--deeplogged` to see high-precision waterfall simulations and unit resolution traces in real-time.
- **🛡️ Ambiguity Rejection**: The `UnitConverter` uses recursive path-finding to detect and reject conflicting unit hierarchies, ensuring your temporal data remains mathematically sound.
- **⚡ O(N) Ledger Simulation**: A highly optimized chronological engine that simulates years of habit history in milliseconds.

---

## 🏁 Getting Started

### Prerequisites

- **Node.js** v20+
- **Python** v3.12+
- **uv** (Fastest Python package manager: `pip install uv`)

### 1. Clone & Initialize

```bash
git clone https://github.com/hammaadworks/HabitBank.git
cd HabitBank
```

### 2. Backend Ignition

```bash
cd backend
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -r requirements.txt
uvicorn app.main:app --reload
```
*API running at: `http://localhost:8000`*

### 3. Frontend Deployment

```bash
cd frontend
pnpm install  # or npm install
pnpm dev
```
*UI running at: `http://localhost:3000`*

---

## 🗺️ Roadmap

- [x] **SaaS Selling Machine**: High-conversion landing page with Time-Loss Calculator.
- [x] **Social Proof Engine**: Backend CRUD for testimonials and waitlist management.
- [ ] **Mobile Protocol**: Native iOS/Android apps for on-the-go logging.
- [ ] **Social Ledger**: Public profiles to showcase your "habit solvency" and compete in leagues.
- [ ] **Biometric Sync**: Automatic debt clearance via Apple Health & Google Fit.
- [ ] **AI Auditor**: Personalized habit suggestions based on your historical velocity and capacity.
- [ ] **Unit Testing Suite**: Full E2E and Unit test coverage for the Ledger Engine.

---

## 🤝 How to Contribute

We are building the future of temporal management, and we'd love your help!

1. **Find an Issue**: Browse our [issues](https://github.com/hammaadworks/HabitBank/issues) or create a new one.
2. **Fork & Branch**: Create a feature branch (`git checkout -b feature/cool-new-thing`).
3. **Code with Style**: Adhere to the existing "Industrial/PRO" aesthetic and type safety.
4. **Test Your Changes**: Ensure your ledger logic doesn't bankrupt the user!
5. **Open a PR**: Submit your changes for review.

**Huge thanks to all our contributors!** Your commits are the capital that grows this bank. 🚀

---

<div align="center">
  <p>Built with 🖤 by <a href="https://github.com/hammaadworks">hammaadworks</a></p>
  <img src="https://forthebadge.com/images/badges/built-with-love.svg" height="25">
  <img src="https://forthebadge.com/images/badges/made-with-python.svg" height="25">
  <img src="https://forthebadge.com/images/badges/uses-js.svg" height="25">
</div>
