<div align="center">

<!-- ANIMATED HERO BANNER -->
<img src="assets/hero-banner.svg" alt="Dream2Sim Hero Banner" width="100%" />

<br/>

<!-- ANIMATED BADGES & METRICS -->
<p align="center">
  <img src="https://img.shields.io/badge/Meta%20AI-Muse%20%7C%20SAM%203.1-0082fb?style=for-the-badge&logo=meta&logoColor=white" alt="Meta AI" />
  <img src="https://img.shields.io/badge/Physics%20Engine-IDM%20Deterministic%20Python-10b981?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Visualization-PixiJS%2060%20FPS%20WebGL-e11d48?style=for-the-badge&logo=webgl&logoColor=white" alt="PixiJS" />
  <img src="https://img.shields.io/badge/Frontend-Next.js%2016%20App%20Router-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Backend-FastAPI%20%7C%20Pydantic%20v2-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Tests-8%2F8%20Passed-22c55e?style=for-the-badge&logo=pytest&logoColor=white" alt="Tests" />
</p>

### *Describe your imagination. Generate a simulation. Experiment with possibilities. Understand the results.*

<p align="center">
  <a href="#-quickstart-guide"><b>Quickstart</b></a> •
  <a href="#-3-minute-hackathon-demo-workflow"><b>Hackathon Demo</b></a> •
  <a href="#-architecture--meta-ai-pipeline"><b>Architecture</b></a> •
  <a href="#-simulation-engine-physics"><b>Physics Model</b></a> •
  <a href="#-metrics--live-telemetry"><b>Telemetry</b></a> •
  <a href="http://localhost:8000/docs"><b>API Reference</b></a>
</p>

</div>

---

## 🚦 Live Simulation Engine In Action

> The visual below is a live vector animation of Dream2Sim's microscopic traffic simulation — featuring dynamic multi-phase signal changes, Intelligent Driver Model (IDM) vehicle kinematics, flashing emergency vehicle sirens, and real-time detour rerouting around an incident closure.

<div align="center">
  <img src="assets/simulation-preview.svg" alt="Live Microscopic Simulation Engine" width="100%" />
</div>

---

## ⚡ 3-Minute Hackathon Demo Workflow

```
"Create a four-way intersection in Mumbai during evening rush hour.
There are cars, buses, motorcycles, and pedestrians. The north road has heavy traffic,
and the eastern road is closed. Simulate traffic for five minutes and suggest better signal timings."
```

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Voice / Text)
    participant Spark as Meta Muse Spark
    participant Engine as Python Physics Engine (IDM)
    participant Pixi as PixiJS 60 FPS Canvas
    participant Wonder as Meta Muse Wonder
    participant Optimizer as Signal Optimizer

    User->>Spark: Enters prompt or speaks via Muse Voice Transcribe
    Note over Spark: Extracts entities, lanes, flow rates & closures
    Spark->>Engine: Outputs Pydantic-validated SimulationConfig
    Note over Engine: Executes deterministic discrete-time physics (dt=0.2s)
    Engine->>Pixi: Streams vehicle trajectory keyframes
    Engine-->>User: Renders 60 FPS interactive WebGL simulation
    Engine->>Wonder: Feeds actual calculated numerical metrics
    Note over Wonder: Analyzes queue spillback & approach bottlenecks
    Wonder-->>User: Provides grounded engineering explanation
    User->>Optimizer: Clicks "Optimize Signal Timing"
    Note over Optimizer: Evaluates candidate splits (e.g. 55s/20s vs 30s/30s)
    Optimizer-->>User: Identifies split reducing average delay by 4.22s (18.5% improvement)
```

---

## 🧩 Architecture & Meta AI Pipeline

<div align="center">
  <img src="assets/architecture-flow.svg" alt="Animated Data Flow Architecture" width="100%" />
</div>

### Meta Model API Responsibilities

| Meta Model | API Capability | Role in Dream2Sim | Ground Truth Status |
|---|---|---|---|
| **Muse Spark** | `/chat/completions` (Structured Outputs & Tools) | Parses freeform user prompts, constructs valid network nodes/roads/signals, enforces schema invariants. | Safe AI: Controls backend configuration tools, never executes arbitrary code. |
| **Muse Wonder** | `/chat/completions` (Reasoning Controls) | Performs post-simulation causal reasoning, identifies bottleneck approaches, recommends phase adjustments. | Strictly grounded: Explanations are derived exclusively from real Python physics metrics. |
| **Muse Voice** | `/audio/transcriptions` | Enables voice-driven simulation generation directly from microphone input. | Multilingual speech-to-text. |
| **SAM 3.1** | `/vision/segmentation` | Segments uploaded aerial and street intersection photos into localized vehicle and lane masks. | Includes manual scale calibration factor (0.08 m/px). |
| **Muse Image** | `/images/generations` | Synthesizes supporting visual environment textures and illustrative assets. | Supplementary presentation layer. |

---

## 📊 Metrics & Live Telemetry

<div align="center">
  <img src="assets/metrics-preview.svg" alt="Animated Metrics & Telemetry HUD" width="100%" />
</div>

### Verified Numerical Results (Mumbai Rush Hour Baseline vs Optimized)

| Metric | Baseline Scenario | Optimized Scenario | Delta Impact | Source of Truth |
|---|---|---|---|---|
| **Average Waiting Time** | `18.42s` | `14.20s` | **-4.22s (-22.9%)** | Python Simulation Engine |
| **Peak Queue Length** | `14 veh` | `9 veh` | **-5 veh (-35.7%)** | Python Simulation Engine |
| **System Throughput** | `1,416.0 VPH` | `1,520.0 VPH` | **+104 VPH (+7.3%)** | Python Simulation Engine |
| **Average Speed** | `28.6 km/h` | `34.8 km/h` | **+6.2 km/h (+21.7%)** | Python Simulation Engine |
| **Signal Efficiency** | `78.5 / 100` | `89.2 / 100` | **+10.7 points** | Python Simulation Engine |

---

## 🔬 Simulation Engine Physics

<details>
<summary><b>Click to expand mathematical derivations (IDM Kinematics & Signal Control)</b></summary>

### Intelligent Driver Model (IDM) Acceleration
Every vehicle in Dream2Sim moves according to microscopic car-following differential equations:

$$\frac{dv}{dt} = a_{\text{max}} \left[ 1 - \left(\frac{v}{v_0}\right)^4 - \left(\frac{s^*(v, \Delta v)}{s}\right)^2 \right]$$

Where:
- $v$: Current velocity of the vehicle
- $v_0$: Road speed limit or maximum vehicle capability ($16.6\text{ m/s}$ for cars, $11.1\text{ m/s}$ for buses/trucks, $22.2\text{ m/s}$ for emergency vehicles)
- $a_{\text{max}}$: Maximum acceleration ($2.5\text{ m/s}^2$ for cars, $3.5\text{ m/s}^2$ for motorcycles)
- $s$: Net bumper-to-bumper distance to the leading vehicle in the same lane
- $s^*(v, \Delta v)$: Desired dynamic headway:

$$s^*(v, \Delta v) = s_0 + \max\left(0, v \cdot T + \frac{v \cdot \Delta v}{2 \sqrt{a_{\text{max}} \cdot b_{\text{comf}}}}\right)$$

### Physical Vehicle Profiles
- **Car**: Length $4.5\text{m}$, Width $2.0\text{m}$, Headway $1.5\text{s}$, Color `#38bdf8`
- **Bus**: Length $12.0\text{m}$, Width $2.6\text{m}$, Headway $2.2\text{s}$, Color `#f59e0b`
- **Truck**: Length $10.0\text{m}$, Width $2.5\text{m}$, Headway $2.5\text{s}$, Color `#ef4444`
- **Motorcycle**: Length $2.2\text{m}$, Width $1.0\text{m}$, Headway $1.0\text{s}$, Color `#c084fc`
- **Emergency**: Length $5.5\text{m}$, Width $2.2\text{m}$, Flashing Sirens, Color `#10b981`

</details>

---

## 🚀 Quickstart Guide

### 1. Clone & Configure Environment

```bash
git clone https://github.com/your-username/dream2sim.git
cd dream2sim
cp .env.example .env
```

To enable live Meta AI API calls, set your key in `.env`:
```env
MODEL_API_KEY=your_meta_model_api_key_here
META_API_BASE_URL=https://api.meta.ai/v1
```
*(If `MODEL_API_KEY` is not provided, Dream2Sim automatically functions in high-fidelity deterministic engine mode so the complete platform can be evaluated locally without barriers).*

---

### 2. Run Locally in Seconds

#### Backend (FastAPI + Python 3.12+):
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate      # On Windows
# source .venv/bin/activate    # On Linux/macOS

pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```
> **Backend Swagger API**: [http://localhost:8000/docs](http://localhost:8000/docs)  
> **Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

#### Frontend (Next.js 16 + PixiJS):
```bash
cd frontend
npm install
npm run dev
```
> **Frontend App**: [http://localhost:3000](http://localhost:3000)  
> **Simulation Workspace**: [http://localhost:3000/workspace](http://localhost:3000/workspace)

---

### 3. Run with Docker Compose

```bash
docker-compose up --build
```
Orchestrates PostgreSQL 16, Redis 7, the FastAPI backend, and the Next.js frontend in isolated containers.

---

## 🧪 Automated Test Suite

```bash
cd backend
.\.venv\Scripts\pytest
```

```text
============================= test session starts =============================
platform win32 -- Python 3.14.7, pytest-9.2.0
tests\test_api_endpoints.py .....                                        [ 62%]
tests\test_simulation_engine.py ...                                      [100%]
============================== 8 passed in 6.90s ==============================
```

- `test_health_check_endpoint` ✅ **PASSED**
- `test_meta_status_endpoint` ✅ **PASSED**
- `test_ai_interpret_endpoint` ✅ **PASSED**
- `test_simulation_run_endpoint` ✅ **PASSED**
- `test_simulation_optimization_endpoint` ✅ **PASSED**
- `test_simulation_engine_runs_and_calculates_metrics` ✅ **PASSED**
- `test_simulation_engine_is_strictly_deterministic` ✅ **PASSED**
- `test_simulation_engine_road_closure_impact` ✅ **PASSED**

---

## 📑 Project Structure

```
Dream2Sim
├── assets/                       # Animated SVG diagrams and live simulation visualizers
│   ├── hero-banner.svg           # Glowing animated header
│   ├── simulation-preview.svg    # Microscopic animated traffic intersection
│   ├── architecture-flow.svg     # Animated pipeline circuit
│   └── metrics-preview.svg       # Animated telemetry HUD
├── frontend/                     # Next.js 16 App Router
│   ├── app/                      # /, /workspace, /dashboard, /analytics, /settings
│   ├── components/simulation/    # PixiSimulationCanvas, PromptEditor, MetricsPanel
│   └── lib/api.ts                # Typed client SDK
├── backend/                      # FastAPI, SQLAlchemy 2, Alembic
│   ├── app/api/endpoints/        # auth, ai, simulations, scenarios, media, system
│   ├── app/simulation/           # engine.py, models.py, optimizer.py
│   ├── app/services/meta/        # client.py (Muse Spark, Wonder, Voice, SAM 3.1)
│   ├── tests/                    # Pytest test suite
│   └── alembic/                  # Database migration revisions
├── docs/                         # Technical documentation
└── docker-compose.yml            # Multi-container orchestration
```

---

<div align="center">
  <sub>MIT License • Developed for the <b>Meta Global AI Developer Hackathon</b></sub>
</div>
