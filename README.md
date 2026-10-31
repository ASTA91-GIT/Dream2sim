# Dream2Sim — AI-Powered Simulation Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![Python](https://img.shields.io/badge/Python-3.12%2B-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16%20App%20Router-black)](https://nextjs.org/)
[![PixiJS](https://img.shields.io/badge/PixiJS-60%20FPS%20Canvas-E72264)](https://pixijs.com/)
[![Meta Model API](https://img.shields.io/badge/Meta%20AI-Muse%20%7C%20SAM%203.1-0668E1)](https://dev.meta.ai/)

> **Describe your imagination. Generate a simulation. Experiment with possibilities. Understand the results.**

Dream2Sim transforms natural language scenario descriptions into configurable, interactive, data-driven simulations. Developed for the **Meta Global AI Developer Hackathon**, it fuses Meta's foundational models (**Muse Spark**, **Muse Wonder**, **Muse Voice Transcribe**, and **SAM 3.1**) with a deterministic, microscopic physics engine in pure Python and high-performance WebGL rendering in PixiJS.

---

## ⚡ 3-Minute Hackathon Demo Workflow

1. **Natural Language Scenario Description**:
   - The user inputs: *"Create a four-way intersection in Mumbai during evening rush hour. There are cars, buses, motorcycles, and pedestrians. The north road has heavy traffic, and the eastern road is closed. Simulate traffic for five minutes and suggest better signal timings."*
2. **AI Comprehension (Muse Spark)**:
   - Muse Spark extracts physical entities (4-way intersection, vehicle categories) and boundary conditions (eastern road closure, heavy north flow rate).
   - Generates structured `SimulationConfig` validated against Pydantic schemas.
3. **Deterministic Physics Simulation**:
   - The Python simulation engine executes microscopic car-following kinematics (Intelligent Driver Model), multi-phase signals, and road closures over discrete time steps.
4. **Interactive Hardware-Accelerated Visualization**:
   - PixiJS visualizes the road network, animated vehicles, and signal states at 60 FPS with scrubbing, stepping, and play/pause controls.
5. **Numerical Metrics & AI Reasoning (Muse Wonder)**:
   - True numerical metrics (Throughput: 1,416 VPH, Avg Wait: 18.42s, Peak Queue: 14 veh) are displayed in KPI cards and Recharts time-series.
   - Muse Wonder provides deep engineering explanations of bottlenecks.
6. **Signal Timing Optimization & Scenario Comparison**:
   - User clicks **"Execute Optimization"** — the engine runs multi-split trials and identifies an optimal timing allocation (55s / 20s) that reduces average delay by **4.22 seconds**.
   - Side-by-side comparison displays metrics deltas and generates a downloadable PDF engineering report.

---

## 🏗️ Architecture

```
Dream2Sim
├── frontend/             # Next.js 16 App Router, TypeScript, Tailwind CSS, PixiJS, Recharts
│   ├── app/              # Routes: / (Landing), /workspace, /dashboard, /analytics, /settings
│   ├── components/       # PixiSimulationCanvas, PromptEditor, MetricsPanel, AIAnalysisPanel
│   └── lib/api.ts        # Typed client calling FastAPI endpoints
├── backend/              # FastAPI, Pydantic v2, SQLAlchemy 2, Alembic
│   ├── app/
│   │   ├── api/          # Routers: auth, ai, simulations, scenarios, media, system
│   │   ├── simulation/   # Deterministic Python Engine (IDM kinematics, signals, optimizer)
│   │   ├── services/     # Meta Model API client (Muse Spark, Wonder, Image, Voice, SAM 3.1)
│   │   └── models/       # SQLAlchemy database models
│   ├── tests/            # Automated Pytest suite (8 unit & API integration tests)
│   └── alembic/          # Database migration revisions
├── docs/                 # Architecture, Meta AI, and Simulation Engine documentation
└── docker-compose.yml    # PostgreSQL, Redis, Backend, and Frontend orchestration
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.12+
- Node.js 20+
- (Optional) Docker & Docker Compose

### 1. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

To enable live Meta AI calls, supply your `MODEL_API_KEY`:

```env
MODEL_API_KEY=your_meta_model_api_key_here
META_API_BASE_URL=https://api.meta.ai/v1
```

*(Note: If `MODEL_API_KEY` is not provided, Dream2Sim automatically operates in high-fidelity deterministic engine mode, allowing full evaluation without missing key errors).*

---

### 2. Run Locally

#### Backend (FastAPI):
```bash
cd backend
python -m venv .venv
# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```
*Backend Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)*

#### Frontend (Next.js):
```bash
cd frontend
npm install
npm run dev
```
*Frontend Application: [http://localhost:3000](http://localhost:3000)*

---

### 3. Run with Docker Compose

```bash
docker-compose up --build
```

---

## 🧪 Testing and Verification

To run the full backend automated test suite:

```bash
cd backend
.\.venv\Scripts\pytest
```

**Results:**
- `tests/test_api_endpoints.py`:
  - `test_health_check_endpoint` ✅ PASSED
  - `test_meta_status_endpoint` ✅ PASSED
  - `test_ai_interpret_endpoint` ✅ PASSED
  - `test_simulation_run_endpoint` ✅ PASSED
  - `test_simulation_optimization_endpoint` ✅ PASSED
- `tests/test_simulation_engine.py`:
  - `test_simulation_engine_runs_and_calculates_metrics` ✅ PASSED
  - `test_simulation_engine_is_strictly_deterministic` ✅ PASSED
  - `test_simulation_engine_road_closure_impact` ✅ PASSED

---

## 🔒 Security & Safe AI Safeguards

- **Zero Arbitrary Execution**: AI models output structured configuration schemas validated by Pydantic; the LLM cannot execute arbitrary code.
- **Secure Secret Management**: API keys and tokens are restricted to server-side execution and never exposed in browser JavaScript.
- **Password Hashing**: Salting and hashing powered by bcrypt with rounds=12.
- **Session Tokens**: JWT HS256 tokens with configurable expiration.

---

## 📄 License
MIT License. Built for the Meta Global AI Developer Hackathon.
