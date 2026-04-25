# Habit Bank - Technical Review Documentation

This document provides a comprehensive technical overview of the Habit Bank system architecture, design philosophy, and advanced AI integration, specifically tailored for deep technical review.

---

## 1. Executive Summary
Habit Bank is a high-performance temporal ledger system designed for precise tracking of human effort. It treats time as a currency, utilizing a chronological waterfall simulation to manage "habit debt" and "buffer credits." The system recently underwent a full "Reborn" cycle, transitioning to an **Obsidian Dark & Premium** aesthetic and integrating a state-of-the-art **Pydantic AI** voice assistant with a Bring Your Own Key (BYOK) security model.

---

## 2. Design System: Obsidian Dark & Premium
The design philosophy reflects an elite, focused environment for "high-profile individuals aiming for victory."

### 2.1 Visual Language
- **Palette:** Obsidian blacks (`#0A0A0B`), Gold accents (`#F59E0B`), and Emerald success states (`#10B981`).
- **Typography:** Precise and authoritative (Outfit for headings, DM Sans for body).
- **Layout:** Seamless "Zero-Friction" dashboard. All primary actions (Agenda, Metrics, AI) are accessible within a single viewport, eliminating hierarchical cognitive load.

### 2.2 Adaptive Responsiveness
The UI utilizes a fluid grid system optimized for:
- **Small Screens (Watch/Phone):** High touch-target logging buttons (min 60px).
- **Large Screens (Desktop/TV):** Massive typographic metrics and 70/30 spatial partitioning.

---

## 3. Core Engine: Temporal Waterfall Simulation
The backend core (FastAPI) executes a simulation algorithm to resolve the state of every habit from its inception.

### 3.1 Chronological Waterfall (O(N))
The `LedgerEngine` iterates through time in linear complexity:
1. **Target Identification:** Resolves `TargetPhase` intervals.
2. **Effort Allocation:** Applies physical logs to satisfy daily targets.
3. **Debt/Buffer Cascading:** If a habit is `is_stacked`, surplus effort flows backward to fill historical debt or forward to bank future buffers.
4. **Logical Boundaries:** All time calculations are anchored to the user's `day_start_hour` and `timezone_offset`, ensuring the ledger remains consistent regardless of real-world UTC transitions.

---

## 4. AI Architecture: Pydantic AI Voice Assistant
The "Assistant" subsystem is the most advanced layer of the platform, enabling natural language command and control.

### 4.1 Bring Your Own Key (BYOK) Security
To ensure absolute privacy and zero maintenance cost for the platform:
- **Client-Side Storage:** Provider API Keys are stored exclusively in the user's browser `localStorage`.
- **Stateless Proxy:** The FastAPI backend intercepts the key via secure headers (`X-AI-Key`), initializes the agent in memory, and discards the key after the request lifecycle.

### 4.2 Backend Agent (Pydantic AI)
The system uses the `pydantic-ai` framework to build a strict, tool-equipped agent.
- **Dynamic Tool Injection:** The agent has access to `query_agenda`, `create_habit`, and `log_habit` tools.
- **SSE Streaming:** Responses are streamed via Server-Sent Events (SSE). This includes both text chunks for the UI and structured JSON for tool calls.

### 4.3 Generative UI & Interaction
The chat interface implements **Generative UI Action Cards**:
1. **Intent Detection:** The LLM identifies an action (e.g., "Log 20 mins").
2. **Staging:** The AI streams a `tool_call` event.
3. **Interactive Interception:** The React frontend intercepts the tool call and renders an **inline interactive card** instead of raw text.
4. **Manual Confirmation:** The user can adjust parameters on the card and click "Execute" to commit the change to the database.

### 4.4 Voice Subsystem (Native Web Speech)
- **Speech-to-Text (STT):** Uses the browser's `webkitSpeechRecognition` for real-time dictation.
- **Text-to-Speech (TTS):** Uses `speechSynthesis` to read AI responses aloud. Conversational text is stripped of system markers and tool payloads before synthesis.

---

## 5. Performance & Scalability
- **Batch Querying:** The Dashboard API uses O(1) batch-fetching for all habit phases and logs, preventing N+1 database performance degradation.
- **Zero-Latency Target:** Typical dashboard payload generation for 20+ habits across 365 days of history is sub-10ms.
- **Next.js Turbopack:** Optimized frontend compilation for instant navigation and minimal bundle size.

---

## 6. Engineering Standards
- **TDD:** Core engines (Converter, Ledger) are covered by a comprehensive `pytest` suite.
- **Type Safety:** Strict TypeScript interfaces on the frontend and Pydantic models on the backend ensure data integrity across the wire.
- **Observability:** Backend functions are decorated with `@deeplog` for high-fidelity trace analysis during technical audits.
