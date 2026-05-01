# MedField CRM — AI-Powered HCP Interaction Logger

A full-stack AI-first CRM module for field representatives in life sciences, featuring both structured form-based and conversational AI-powered HCP (Healthcare Professional) interaction logging.

![Tech Stack](https://img.shields.io/badge/React-19-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green) ![LangGraph](https://img.shields.io/badge/LangGraph-Agent-purple) ![Groq](https://img.shields.io/badge/Groq-gemma2--9b--it-orange)

---

## 🌟 Features

- **Dual-mode interaction logging**: Structured form OR conversational AI chat
- **LangGraph AI Agent** with 7 tools (5+ required) for HCP workflow automation
- **Real-time entity extraction** from natural language into structured CRM records
- **Sentiment analysis** for HCP interactions
- **Smart follow-up suggestions** based on interaction context
- **Compliance validation** ensuring complete interaction records
- **Redux Toolkit** state management with full form/chat/interaction state
- **Modern responsive UI** with Inter font and enterprise-grade design
- **FastAPI backend** with SQLAlchemy ORM and Pydantic validation
- **PostgreSQL** database with full CRUD operations

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Redux Toolkit, TanStack Start, Tailwind CSS |
| Backend | Python, FastAPI, Pydantic, SQLAlchemy, Alembic |
| AI | LangGraph, Groq API (gemma2-9b-it), LLM tool orchestration |
| Database | PostgreSQL (SQLAlchemy ORM, database-agnostic) |
| Fonts | Google Inter |

---

## 📁 Project Structure

```
/
├── src/                          # Frontend (React + TanStack Start)
│   ├── components/
│   │   ├── CrmHeader.tsx         # Top navigation bar
│   │   ├── InteractionForm.tsx   # Structured form panel
│   │   ├── ChatPanel.tsx         # AI assistant chat panel
│   │   ├── InteractionList.tsx   # Saved interactions list
│   │   └── Notifications.tsx     # Toast notifications
│   ├── store/
│   │   ├── index.ts              # Redux store configuration
│   │   ├── interactionSlice.ts   # Interaction state (form, items, CRUD)
│   │   ├── chatSlice.ts          # Chat state (messages, processing)
│   │   └── hooks.ts              # Typed Redux hooks
│   ├── server/
│   │   └── ai.functions.ts       # Server function for AI processing
│   ├── routes/
│   │   ├── __root.tsx            # Root layout
│   │   └── index.tsx             # Main CRM page
│   └── styles.css                # Design system tokens
│
├── backend/                      # Python FastAPI Backend
│   ├── app/
│   │   ├── main.py               # FastAPI app entry point
│   │   ├── core/
│   │   │   └── config.py         # Settings and environment vars
│   │   ├── db/
│   │   │   ├── base.py           # SQLAlchemy base
│   │   │   └── session.py        # Database session management
│   │   ├── models/
│   │   │   └── interaction.py    # SQLAlchemy Interaction model
│   │   ├── schemas/
│   │   │   └── interaction.py    # Pydantic schemas
│   │   ├── routers/
│   │   │   ├── interactions.py   # CRUD endpoints
│   │   │   └── ai.py             # AI/LangGraph endpoints
│   │   ├── services/
│   │   │   └── interaction_service.py  # Business logic
│   │   ├── agents/
│   │   │   └── hcp_agent.py      # LangGraph agent definition
│   │   └── tools/
│   │       ├── log_interaction.py      # Tool 1: Log Interaction
│   │       ├── edit_interaction.py     # Tool 2: Edit Interaction
│   │       ├── summarize.py            # Tool 3: Summarize Interaction
│   │       ├── extract_entities.py     # Tool 4: Extract Entities
│   │       ├── suggest_followup.py     # Tool 5: Suggest Follow-up
│   │       ├── sentiment_analysis.py   # Tool 6: Sentiment Analysis
│   │       └── compliance_check.py     # Tool 7: Compliance Validation
│   ├── alembic/
│   │   └── versions/             # Database migrations
│   ├── alembic.ini
│   ├── requirements.txt
│   └── .env.example
│
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js 18+** and **Bun** (for frontend)
- **Python 3.10+** (for backend)
- **PostgreSQL** (or SQLite for local dev)
- **Groq API key** (free at https://console.groq.com)

### Environment Variables

Create `backend/.env`:

```env
# Required
GROQ_API_KEY=your_groq_api_key_here

# Database (PostgreSQL recommended, SQLite fallback)
DATABASE_URL=postgresql://user:password@localhost:5432/medfield_crm
# For local dev without PostgreSQL:
# DATABASE_URL=sqlite:///./medfield_crm.db

# Optional
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
```

### Frontend Setup

```bash
# From project root
bun install
bun run dev
# Frontend runs at http://localhost:5173
```

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### PostgreSQL Setup

```bash
# Create database
createdb medfield_crm

# Or with psql
psql -c "CREATE DATABASE medfield_crm;"

# Update DATABASE_URL in backend/.env
```

---

## 🤖 LangGraph Agent Architecture

The AI agent is built with **LangGraph** and uses **Groq's gemma2-9b-it** model. It follows a tool-calling architecture:

```
User Input → Agent Router → Tool Selection → Tool Execution → Response
                ↑                                    |
                └────────── State Update ←──────────┘
```

### Agent Graph Flow

1. **Input Node**: Receives user message
2. **Router Node**: Determines intent (log, edit, summarize, etc.)
3. **Tool Node**: Executes the selected tool with LLM-extracted parameters
4. **Response Node**: Formats the result for the user

### The 7 Tools

| # | Tool | Description |
|---|------|-------------|
| 1 | **Log Interaction** | Parses free text → structured fields → saves to DB |
| 2 | **Edit Interaction** | Finds interaction by ID/name → modifies fields → returns diff |
| 3 | **Summarize Interaction** | Generates CRM-style meeting summary |
| 4 | **Extract Entities** | Pulls HCP name, product, sentiment, dates from text |
| 5 | **Suggest Follow-up** | Recommends next best actions with priority/timeline |
| 6 | **Sentiment Analysis** | Classifies HCP sentiment with confidence score |
| 7 | **Compliance Validation** | Checks for missing required fields |

---

## 💬 Example Chat Prompts to Test

```
"Met Dr. Sharma today, discussed Product X, positive response, shared brochure, follow up next week."

"Called Dr. Kumar about Product Y side effects, he was skeptical, needs more safety data."

"Summarize my interaction with Dr. Sharma."

"Suggest follow-up actions for Dr. Kumar."

"Check if the interaction with Dr. Patel has all required fields."

"Update Dr. Sharma's interaction — change sentiment to neutral."

"What was Dr. Kumar's reaction to Product Y?"
```

---

## 🎬 Demo Checklist

For your assignment video, demonstrate:

1. **Form-based logging**: Fill out the structured form and save
2. **Chat-based logging**: Type a natural language description → see AI extract entities → confirm and save
3. **Edit via chat**: Ask the AI to update an existing interaction
4. **Summarize**: Click Summarize or ask the AI to summarize
5. **Follow-up suggestions**: Ask for next best actions
6. **Sentiment analysis**: Show sentiment detection from text
7. **Compliance check**: Show validation of missing fields
8. **Interaction list**: Show saved records with sentiment badges
9. **Form auto-fill**: Show how AI populates the form from chat

---

## 📡 Backend API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/interactions` | List all interactions |
| GET | `/interactions/{id}` | Get single interaction |
| POST | `/interactions` | Create interaction |
| PUT | `/interactions/{id}` | Update interaction |
| DELETE | `/interactions/{id}` | Delete interaction |
| POST | `/ai/chat` | General AI chat |
| POST | `/ai/log` | Log interaction via AI |
| POST | `/ai/edit` | Edit interaction via AI |
| POST | `/ai/summarize` | Summarize interaction |
| POST | `/ai/followup` | Suggest follow-ups |
| POST | `/ai/extract` | Extract entities |
| POST | `/ai/sentiment` | Analyze sentiment |

---

## 🔧 Key Files to Inspect

1. `src/routes/index.tsx` — Main CRM page layout
2. `src/components/ChatPanel.tsx` — AI chat interface with quick actions
3. `src/store/interactionSlice.ts` — Redux state for interactions
4. `src/server/ai.functions.ts` — Server-side AI processing (with built-in demo mode)
5. `backend/app/agents/hcp_agent.py` — LangGraph agent definition
6. `backend/app/tools/` — All 7 LangGraph tools
7. `backend/app/main.py` — FastAPI app with all endpoints

---

## 📝 Notes

- The frontend includes a **built-in demo mode** that works without the Python backend — the AI processing logic is replicated in the TanStack server function for immediate testing.
- When the Python backend is running, the frontend automatically connects to it for full LangGraph + Groq API integration.
- The database is configured with SQLAlchemy for database-agnostic operation — works with both PostgreSQL and SQLite.
