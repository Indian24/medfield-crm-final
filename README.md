# MedField CRM — AI-Powered HCP Interaction Logger

An AI-first CRM module for life-science field representatives to log, manage, and analyze Healthcare Professional (HCP) interactions. Features a dual-interface: structured form entry and a conversational AI agent powered by LangGraph.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TanStack Start, Redux Toolkit, Tailwind CSS 4 |
| **AI Agent** | LangGraph, LangChain, Groq (gemma2-9b-it / llama-3.3-70b-versatile) |
| **Backend API** | FastAPI, Pydantic v2, SQLAlchemy 2.0 |
| **Database** | PostgreSQL (prod) / SQLite (dev) |
| **Styling** | Tailwind CSS with semantic design tokens, Google Inter font |

---

## Architecture

```
┌──────────────────────────────────────────────┐
│                  Frontend                     │
│  React + Redux Toolkit + TanStack Start       │
│  ┌─────────────┐  ┌──────────────────┐       │
│  │ Form Panel  │  │  Chat Panel (AI) │       │
│  └──────┬──────┘  └────────┬─────────┘       │
│         │                  │                  │
│         └────────┬─────────┘                  │
│                  ▼                            │
│        Server Function (RPC)                  │
│        src/server/ai.functions.ts             │
│                  │                            │
│                  ▼                            │
│   ┌─── Python Backend Available? ──┐         │
│   │ YES: Forward to FastAPI        │         │
│   │ NO:  Built-in demo AI logic    │         │
│   └────────────────────────────────┘         │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│              Python Backend                   │
│  FastAPI + LangGraph Agent                    │
│                                              │
│  /ai/chat ──► LangGraph Agent                │
│               ┌─────────┐                    │
│               │ Router  │ (LLM intent)       │
│               └────┬────┘                    │
│                    ▼                         │
│          ┌── Tool Selection ──┐              │
│          │ 7 Specialized Tools│              │
│          └────────┬───────────┘              │
│                   ▼                          │
│            Response Formatter                │
│                   ▼                          │
│            Structured JSON                   │
└──────────────────────────────────────────────┘
```

---

## Features

- **Structured Form**: Full CRM form with HCP name, interaction type, date/time, attendees, topics, materials, samples, sentiment, outcomes, follow-ups
- **AI Chat Panel**: Natural language input auto-extracts structured fields
- **7 AI Agent Tools**: Log, Edit, Summarize, Sentiment, Follow-up, Extract Entities, Compliance Check
- **Dashboard Stats**: Real-time metrics (total interactions, unique HCPs, sentiment distribution)
- **CRUD Operations**: Create, read, update, delete interactions
- **Demo Mode**: Built-in AI simulation works without Python backend

---

## Setup & Run

### Frontend Only (Demo Mode)

```bash
# Install dependencies
bun install

# Start dev server
bun run dev
```

The app runs at `http://localhost:5173` with built-in demo AI (no Python backend needed).

### Full Stack (with LangGraph Backend)

```bash
# 1. Frontend
bun install && bun run dev

# 2. Backend (in separate terminal)
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env and set your GROQ_API_KEY

# 4. Start backend
uvicorn app.main:app --reload --port 8000
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes (backend) | Groq API key for LLM calls |
| `DATABASE_URL` | No | DB connection string (default: SQLite) |
| `BACKEND_URL` | No | Backend URL for frontend (default: `http://localhost:8000`) |
| `PRIMARY_MODEL` | No | LLM model (default: `gemma2-9b-it`) |
| `FALLBACK_MODEL` | No | Fallback model (default: `llama-3.3-70b-versatile`) |

---

## How LangGraph Works

The agent is defined in `backend/app/agents/hcp_agent.py` using a **StateGraph**:

1. **Router Node**: Receives user message, uses LLM (Groq) to understand intent and select the appropriate tool via function calling
2. **Tool Node**: Executes the selected tool (each tool makes its own LLM call for specialized processing)
3. **Response Node**: Formats tool output into structured JSON with `reply`, `tool_used`, and `structured_data`

```
Entry → Router (LLM decides) → [Tools | Respond]
         ↓                         ↓
   Tool Execution              Direct Response
         ↓
    Response Formatter → END
```

---

## 7 Agent Tools Explained

| # | Tool | File | Description |
|---|------|------|-------------|
| 1 | `log_interaction` | `tools/log_interaction.py` | Extracts structured CRM fields from natural language using LLM |
| 2 | `edit_interaction` | `tools/edit_interaction.py` | Identifies fields to update in an existing interaction record |
| 3 | `summarize_interaction` | `tools/summarize.py` | Generates concise CRM-style meeting summaries |
| 4 | `analyze_sentiment` | `tools/sentiment_analysis.py` | Classifies HCP reaction as Positive/Neutral/Negative with confidence |
| 5 | `suggest_followup` | `tools/suggest_followup.py` | Recommends prioritized next-best-actions |
| 6 | `extract_entities` | `tools/extract_entities.py` | Identifies HCP names, products, dates, and medical terms |
| 7 | `compliance_check` | `tools/compliance_check.py` | Validates interaction records against mandatory field requirements |

---

## Example Test Prompts

Use these in the AI Chat Panel to demo each tool:

| Tool | Prompt |
|------|--------|
| **Log** | "Met Dr. Sharma today to discuss Product X, she was very interested and requested samples" |
| **Edit** | "Update the interaction with Dr. Kumar — change sentiment to Positive" |
| **Summarize** | "Summarize my meeting with Dr. Sharma about Product X clinical trials" |
| **Sentiment** | "Dr. Desai seemed skeptical about the pricing but open to a trial" |
| **Follow-up** | "What should I do next after meeting Dr. Patel about elderly dosing?" |
| **Extract** | "Extract entities: Called Dr. Singh on Monday, discussed Product Y side effects, left brochure" |
| **Validate** | "Check if my interaction with Dr. Sharma is compliant" |

---

## Key Files to Inspect

| File | Purpose |
|------|---------|
| `src/routes/index.tsx` | Main page layout with form + chat + stats |
| `src/components/ChatPanel.tsx` | AI chat UI with quick actions |
| `src/components/InteractionForm.tsx` | Structured CRM form |
| `src/components/DashboardStats.tsx` | Real-time dashboard metrics |
| `src/store/interactionSlice.ts` | Redux state management + CRUD |
| `src/server/ai.functions.ts` | Server function with demo AI + backend proxy |
| `backend/app/agents/hcp_agent.py` | LangGraph agent definition |
| `backend/app/tools/*.py` | 7 individual agent tools |
| `backend/app/main.py` | FastAPI entry point |

---

## Demo Checklist

- [ ] **Form logging**: Fill in HCP name + fields → Save → Appears in list
- [ ] **Chat logging**: Type "Met Dr. Sharma today, discussed Product X, positive response" → Form auto-fills
- [ ] **AI extraction**: Observe structured data extracted from natural language
- [ ] **Edit interaction**: Click a record in list → Edit in form → Update
- [ ] **Delete**: Click ✕ on a record to remove it
- [ ] **Summarize**: Use Summarize quick action with interaction text
- [ ] **Sentiment**: Use Sentiment quick action to analyze HCP reaction
- [ ] **Follow-up**: Use Follow-up quick action for next-best-actions
- [ ] **Extract entities**: Use Extract quick action to pull structured data
- [ ] **Validate**: Use Validate quick action to check compliance
- [ ] **Dashboard stats**: Verify counters update after adding/deleting records
