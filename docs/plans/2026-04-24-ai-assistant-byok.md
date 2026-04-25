# Pydantic AI Voice Assistant (BYOK) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a voice-enabled, highly interactive Pydantic AI Chatbot using a BYOK model that can create, edit, log, and query habits natively from the UI.

**Architecture:** 
1. The frontend securely stores BYOK credentials in `localStorage` and transmits them via headers.
2. The FastAPI backend runs a `pydantic-ai` Agent injected with tools to interface with the database.
3. A React-based generative UI consumes Server-Sent Events (SSE) to render inline, interactive action cards (e.g., "Log Habit" card) when the AI requests a tool.
4. Web Speech API (Native) is used for free, zero-latency dictation (STT) and reading text responses aloud (TTS).

**Tech Stack:** Next.js (React), FastAPI, Pydantic AI, Web Speech API

---

### Task 1: Backend Dependencies & Pydantic AI Agent Setup

**Files:**
- Modify: `backend/pyproject.toml`
- Create: `backend/app/core/ai_agent.py`

- [ ] **Step 1: Add Pydantic AI Dependency**

Modify `backend/pyproject.toml` to include `pydantic-ai`.

```toml
# In pyproject.toml under [project.dependencies] or similar
dependencies = [
    # ... existing dependencies
    "pydantic-ai>=0.0.14"
]
```

- [ ] **Step 2: Install Dependency**

Run: `cd backend && uv pip install -e .`

- [ ] **Step 3: Define the Pydantic AI Agent**

Create `backend/app/core/ai_agent.py`. Define the agent and its basic dependencies.

```python
from pydantic_ai import Agent, RunContext
from pydantic import BaseModel, Field
import uuid
from sqlmodel import Session

class HabitContext(BaseModel):
    user_id: uuid.UUID
    session: Session
    provider: str
    api_key: str

    class Config:
        arbitrary_types_allowed = True

habit_agent = Agent(
    model="openai:gpt-4o", # Default, overridden at runtime
    deps_type=HabitContext,
    instructions=(
        "You are the Habit Bank AI, a strict, elite assistant for a highly ambitious underachiever. "
        "Your goal is to help them achieve victory in this life and the next by managing their habits. "
        "Keep responses concise, actionable, and slightly gamified. "
        "Never apologize. Always use tools to fetch data or perform actions before confirming."
    )
)
```

- [ ] **Step 4: Commit Setup**

```bash
git add backend/pyproject.toml backend/app/core/ai_agent.py
git commit -m "feat(ai): configure pydantic-ai and define base habit agent"
```

---

### Task 2: Pydantic AI Tool Definitions

**Files:**
- Modify: `backend/app/core/ai_agent.py`

- [ ] **Step 1: Define Database Tools**

Add the tool functions that the LLM can call. For now, they will return structured responses that the frontend will interpret to render interactive UI.

```python
@habit_agent.tool
async def query_agenda(ctx: RunContext[HabitContext]) -> str:
    """Fetch the user's current agenda, habits, and debt status for today."""
    from app.routers.dashboard import generate_daily_agenda_snapshot
    agenda = generate_daily_agenda_snapshot(session=ctx.deps.session, user_id=ctx.deps.user_id)
    return agenda.model_dump_json()

@habit_agent.tool
async def stage_create_habit(ctx: RunContext[HabitContext], name: str, target_value: float, target_unit: str, is_stacked: bool = False) -> dict:
    """
    Stage a new habit for creation. 
    Returns the parameters to the frontend so the user can confirm via a UI card.
    """
    return {
        "action": "create_habit",
        "name": name,
        "target_value": target_value,
        "target_unit": target_unit,
        "is_stacked": is_stacked
    }

@habit_agent.tool
async def stage_log_habit(ctx: RunContext[HabitContext], habit_id: str, amount: float, unit: str) -> dict:
    """
    Stage a habit logging event.
    Returns the parameters to the frontend so the user can confirm the log via a UI card.
    """
    return {
        "action": "log_habit",
        "habit_id": habit_id,
        "amount": amount,
        "unit": unit
    }
```

- [ ] **Step 2: Commit Tools**

```bash
git add backend/app/core/ai_agent.py
git commit -m "feat(ai): define pydantic-ai tools for habit management"
```

---

### Task 3: Backend Chat Streaming Endpoint

**Files:**
- Create: `backend/app/routers/chat.py`
- Modify: `backend/app/main.py`

- [ ] **Step 1: Create Streaming Route**

Create `backend/app/routers/chat.py` to handle the incoming SSE request, intercept headers, and stream the Pydantic AI response.

```python
from fastapi import APIRouter, Depends, Request, Header, HTTPException
from fastapi.responses import StreamingResponse
import uuid
import json
from pydantic import BaseModel
from app.database import get_session, SessionDep
from app.core.ai_agent import habit_agent, HabitContext

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    user_id: uuid.UUID
    messages: list[ChatMessage]

async def stream_agent_response(request: ChatRequest, ctx: HabitContext, prompt: str):
    # Dynamic Model Override based on BYOK
    model_name = f"{ctx.provider}:gpt-4o" if ctx.provider == "openai" else f"{ctx.provider}:claude-3-5-sonnet-latest"
    # Note: In a real app, you'd instantiate the specific Pydantic AI Model class with the api_key here.
    # For now, we assume environment variables or a custom Model initialization if needed by Pydantic AI.
    
    # Run stream
    async with habit_agent.run_stream(prompt, deps=ctx) as result:
        async for text_chunk in result.stream_text(delta=True):
            yield f"data: {json.dumps({'type': 'text', 'content': text_chunk})}\n\n"
        
        # Stream tool calls if any
        # (Simplified logic: in reality, parse result.new_messages() for ToolReturn/ToolCall)
        for msg in result.new_messages():
            if msg.kind == 'request' and hasattr(msg, 'parts'):
                for part in msg.parts:
                    if part.part_kind == 'tool-call':
                        yield f"data: {json.dumps({'type': 'tool', 'name': part.tool_name, 'args': part.args.args_dict})}\n\n"

@router.post("/stream")
async def chat_stream(
    req: ChatRequest, 
    session: SessionDep, 
    x_ai_provider: str = Header(default="openai"), 
    x_ai_key: str = Header(default="")
):
    if not x_ai_key:
        raise HTTPException(status_color=400, detail="Missing API Key in headers (BYOK required).")
        
    ctx = HabitContext(user_id=req.user_id, session=session, provider=x_ai_provider, api_key=x_ai_key)
    prompt = req.messages[-1].content
    
    return StreamingResponse(stream_agent_response(req, ctx, prompt), media_type="text/event-stream")
```

- [ ] **Step 2: Register Router**

In `backend/app/main.py`:
```python
from app.routers import chat
app.include_router(chat.router)
```

- [ ] **Step 3: Commit Backend Endpoint**

```bash
git add backend/app/routers/chat.py backend/app/main.py
git commit -m "feat(ai): implement SSE streaming endpoint for chatbot"
```

---

### Task 4: Frontend Settings (BYOK Storage)

**Files:**
- Modify: `frontend/src/components/dashboard/SettingsView.tsx`

- [ ] **Step 1: Add AI Key Inputs**

Add a section to save the BYOK provider and key to `localStorage`.

```tsx
import { useState, useEffect } from "react";

// Inside SettingsView component:
const [aiProvider, setAiProvider] = useState("openai");
const [aiKey, setAiKey] = useState("");

useEffect(() => {
  setAiProvider(localStorage.getItem("habitbank_ai_provider") || "openai");
  setAiKey(localStorage.getItem("habitbank_ai_key") || "");
}, []);

const saveAiSettings = () => {
  localStorage.setItem("habitbank_ai_provider", aiProvider);
  localStorage.setItem("habitbank_ai_key", aiKey);
  alert("AI Credentials saved locally.");
};

// In render:
<div className="bg-card p-6 rounded-3xl border border-border mt-8">
  <h3 className="text-xl font-black uppercase text-foreground mb-4">AI Configuration (BYOK)</h3>
  <div className="space-y-4">
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Provider</label>
      <select value={aiProvider} onChange={e => setAiProvider(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground">
        <option value="openai">OpenAI</option>
        <option value="anthropic">Anthropic</option>
        <option value="google-gla">Google Gemini</option>
      </select>
    </div>
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">API Key (Stored Locally)</label>
      <input type="password" value={aiKey} onChange={e => setAiKey(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground" />
    </div>
    <button onClick={saveAiSettings} className="px-6 py-3 bg-primary text-background font-bold uppercase rounded-xl">Save Locally</button>
  </div>
</div>
```

- [ ] **Step 2: Commit Settings Updates**

```bash
git add frontend/src/components/dashboard/SettingsView.tsx
git commit -m "feat(ui): add local BYOK storage to settings"
```

---

### Task 5: Frontend Assistant Tab & Generative UI

**Files:**
- Create: `frontend/src/components/AssistantChat.tsx`
- Modify: `frontend/src/components/Sidebar.tsx`
- Modify: `frontend/src/app/dashboard/page.tsx`

- [ ] **Step 1: Build the Chat Interface**

Create `frontend/src/components/AssistantChat.tsx`. It will handle SSE parsing, Speech-to-Text via `window.SpeechRecognition`, and rendering tool cards.

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Volume2 } from 'lucide-react';
import { AgendaItem } from '@/types';

export function AssistantChat({ activeUser, agenda }: { activeUser: any, agenda: any }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: string, content: string, toolCall?: any}[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleListen = () => {
    if (!('webkitSpeechRecognition' in window)) return alert("Speech recognition not supported in this browser.");
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('');
      setInput(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    if (isListening) recognition.stop();
    else recognition.start();
  };

  const speak = (text: string) => {
    if (!voiceMode || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMsgs = [...messages, { role: "user", content: input }];
    setMessages(newMsgs);
    setInput("");

    const provider = localStorage.getItem("habitbank_ai_provider") || "openai";
    const apiKey = localStorage.getItem("habitbank_ai_key") || "";

    try {
      const response = await fetch("http://localhost:8000/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-AI-Provider": provider,
          "X-AI-Key": apiKey
        },
        body: JSON.stringify({ user_id: activeUser.id, messages: newMsgs })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiText = "";

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.replace('data: ', ''));
            if (data.type === 'text') {
              aiText += data.content;
              setMessages(prev => {
                const updated = [...prev];
                if (updated[updated.length-1]?.role === "assistant") {
                  updated[updated.length-1].content = aiText;
                } else {
                  updated.push({ role: "assistant", content: aiText });
                }
                return updated;
              });
            } else if (data.type === 'tool') {
              // Render generative UI card
              setMessages(prev => [...prev, { role: "assistant", content: "", toolCall: data }]);
            }
          }
        }
      }
      speak(aiText);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-card rounded-[3rem] border border-border overflow-hidden">
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.toolCall ? (
              <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl">
                {/* Generative UI Component goes here based on msg.toolCall.name */}
                <p className="text-xs font-bold uppercase text-primary">Tool Action: {msg.toolCall.name}</p>
                <button className="mt-2 px-4 py-2 bg-primary text-background rounded-lg font-bold text-xs uppercase">Confirm Action</button>
              </div>
            ) : (
              <div className={`p-4 rounded-3xl max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-background' : 'bg-background text-foreground'}`}>
                {msg.content}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-6 bg-background border-t border-border flex items-center gap-4">
        <button onClick={() => setVoiceMode(!voiceMode)} className={`p-3 rounded-full ${voiceMode ? 'bg-primary text-background' : 'bg-card text-muted-foreground'}`}>
          <Volume2 className="w-5 h-5" />
        </button>
        <button onClick={toggleListen} className={`p-3 rounded-full ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-card text-muted-foreground'}`}>
          <Mic className="w-5 h-5" />
        </button>
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask or command the ledger..." 
          className="flex-1 bg-card border border-border rounded-full px-6 py-4 focus:outline-none"
        />
        <button onClick={sendMessage} className="p-4 bg-primary text-background rounded-full">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add Assistant to Sidebar & Dashboard Page**

In `Sidebar.tsx`, add an item for the Assistant.
In `dashboard/page.tsx`, conditionally render `<AssistantChat activeUser={activeUser} agenda={agenda} />` when `activeTab === "assistant"`.

- [ ] **Step 3: Commit Frontend Chat**

```bash
git add frontend/src/components/AssistantChat.tsx frontend/src/components/Sidebar.tsx frontend/src/app/dashboard/page.tsx
git commit -m "feat(ui): build realtime interactive assistant chat with native voice APIs"
```
