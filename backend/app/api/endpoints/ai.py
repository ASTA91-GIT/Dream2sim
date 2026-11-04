import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

logger = logging.getLogger(__name__)
from app.database.session import get_db
from app.models.models import Simulation, SimulationRun, User
from app.schemas.ai_schema import (
    NaturalPromptRequest,
    AIInterpretationResponse,
    AnalysisRequest,
    AnalysisResponse,
    AIChatRequest,
)
from app.schemas.simulation_schema import SimulationConfig, SimulationMetrics
from pydantic import ValidationError
from app.services.ai.orchestrator import AIOrchestrator, MetaAPIConfigurationError
from app.api.deps import get_current_user_optional

router = APIRouter(prefix="/ai", tags=["AI Engine (Meta Model API)"])
orchestrator = AIOrchestrator()


@router.post("/interpret", response_model=AIInterpretationResponse)
async def interpret_prompt(
    request: NaturalPromptRequest,
    current_user: User = Depends(get_current_user_optional),
):
    """
    Invokes Muse Spark to parse natural language scenario description
    into structured entities, constraints, and valid simulation geometry.
    """
    if not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    try:
        result = await orchestrator.interpret_prompt_with_muse_spark(
            prompt=request.prompt,
            context=request.context,
        )
        return result
    except MetaAPIConfigurationError as e:
        # Clear error for missing configuration
        raise HTTPException(status_code=503, detail=str(e))
    except ValidationError as e:
        # Clear error for schema mismatch
        raise HTTPException(status_code=502, detail=f"Muse Spark output failed schema validation: {str(e)}")
    except (RuntimeError, ValueError) as e:
        # Clear error for upstream API failure
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_results(
    request: AnalysisRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_optional),
):
    """
    Invokes Muse Wonder for deep reasoning over actual deterministic simulation metrics.
    """
    result = await db.execute(
        select(Simulation).where(Simulation.id == request.simulation_id)
    )
    sim = result.scalar_one_or_none()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")

    # Fetch latest run
    run_query = select(SimulationRun).where(SimulationRun.simulation_id == sim.id)
    if request.run_id:
        run_query = run_query.where(SimulationRun.id == request.run_id)
    else:
        run_query = run_query.order_by(SimulationRun.created_at.desc())

    run_res = await db.execute(run_query)
    sim_run = run_res.scalar_one_or_none()

    if not sim_run or not sim_run.metrics:
        raise HTTPException(
            status_code=400,
            detail="No completed simulation run metrics available for this simulation.",
        )

    cfg = SimulationConfig(**sim.configuration)
    metrics = SimulationMetrics(**sim_run.metrics)

    analysis = await orchestrator.analyze_results_with_muse_wonder(
        config=cfg,
        metrics=metrics,
        scenario_title=sim.title,
    )

    # Persist analysis
    sim_run.ai_analysis = analysis.engineering_insights
    await db.commit()

    return analysis


def _generate_expert_chat_response(query: str) -> str:
    """
    Provides authoritative, domain-grounded engineering answers for Dream2Sim.
    Covers platform architecture, physics models (IDM/Social Force), signal optimization,
    multi-domain swarms (drones, AGVs, crowds), and workflow usage.
    """
    q = query.lower().strip()

    # 0. Conversational Greetings & Social Pleasantries
    greetings = ["hi", "hii", "hiii", "hello", "hey", "heyy", "good morning", "good afternoon", "good evening", "howdy", "yo", "sup"]
    words = [w.strip("!?,.") for w in q.split()]
    if any(w in greetings for w in words) or q in greetings or q.startswith("hello") or q.startswith("hey"):
        return (
            "Hello! 👋 I'm your **Dream2Sim Engineering Assistant**.\n\n"
            "I'm here to help you design, test, and understand microscopic multi-agent simulations. Here are a few things you can ask me:\n\n"
            "• **Physics & Equations**: *\"Explain the IDM car-following formula\"*\n"
            "• **Signal Timing**: *\"How does Webster's formula optimize traffic lights?\"*\n"
            "• **Bottleneck Analysis**: *\"How do I simulate a corridor chokepoint?\"*\n"
            "• **Multi-Domain Swarms**: *\"Tell me about drone airspaces or warehouse AGVs\"*\n"
            "• **Exports**: *\"How do I export PDF reports and raw telemetry CSVs?\"*\n\n"
            "How can I assist you with your project today?"
        )

    # 0.1 Gratitude & Pleasantries
    if any(k in q for k in ["thank you", "thanks", "thx", "awesome", "great job", "perfect"]):
        return (
            "You're very welcome! 😊 Feel free to ask whenever you need help tuning simulation parameters, "
            "inspecting bottlenecks, or comparing traffic scenarios."
        )

    # 1. Platform & Mission Overview
    if any(k in q for k in ["what is dream2sim", "about", "project", "what does this do", "overview"]):
        return (
            "**Dream2Sim** is a multimodal microscopic simulation platform that translates natural language "
            "descriptions into validated, deterministic physical digital twins.\n\n"
            "Key Platform Capabilities:\n"
            "• **Microscopic Determinism**: Sub-second kinematic vehicle tracking using the Intelligent Driver Model (IDM) and Social Force pedestrian/AGV dynamics.\n"
            "• **Multi-Domain Simulation**: Simulates urban traffic junctions, medical delivery drone airspaces, high-bay automated warehouse AGVs, and stadium crowd evacuations.\n"
            "• **AI Reasoning**: Synthesizes spatial networks via Meta Muse Spark and diagnoses bottlenecks via Meta Muse Wonder.\n"
            "• **Real-Time Telemetry**: Live canvas visualization with congestion heatmaps, velocity vectors, timeline scrubbing, and PDF/CSV reporting."
        )

    # 2. Physics & Kinematics (IDM / Social Force)
    if any(k in q for k in ["idm", "intelligent driver", "car following", "physics", "kinematic", "collision"]):
        return (
            "**Deterministic Microscopic Kinematics (IDM):**\n\n"
            "Dream2Sim uses the **Intelligent Driver Model (IDM)** to calculate collision-free acceleration for every agent:\n\n"
            "$$\\dot{v} = a \\left[ 1 - \\left(\\frac{v}{v_0}\\right)^\\delta - \\left(\\frac{s^*(v, \\Delta v)}{s}\\right)^2 \\right]$$\n\n"
            "Where:\n"
            "• **$v_0$**: Desired free-flow speed (e.g. 50 km/h).\n"
            "• **$s_0$**: Minimum safe bumper-to-bumper standstill distance (typically 2.0m).\n"
            "• **$T$**: Safe time headway (typically 1.5 seconds).\n"
            "• **$a, b$**: Maximum acceleration and comfortable braking deceleration limits.\n"
            "• **$\\delta = 4$**: Acceleration exponent governing velocity decay near capacity.\n\n"
            "For pedestrian and AGV domains, Dream2Sim integrates the **Helbing Social Force model** to simulate repulsive collision barriers and goal-directed heading vectors."
        )

    # 3. Traffic Signals & Optimization
    if any(k in q for k in ["signal", "traffic light", "optimize", "optimization", "timing", "green wave", "cycle"]):
        return (
            "**Traffic Signal Control & Adaptive Optimization:**\n\n"
            "Dream2Sim supports both pre-timed fixed signal controllers and adaptive controllers:\n\n"
            "• **Cycle Splits**: Total cycle duration (typically 60s–120s) divided into North-South and East-West green phases with yellow clearance (3s–4s).\n"
            "• **Webster's Optimal Timing**: Dynamically computes optimal cycle length based on critical lane saturation flow:\n"
            "  $$C_{opt} = \\frac{1.5L + 5}{1 - Y}$$\n"
            "  where $L$ is total lost time per cycle and $Y$ is the sum of critical lane volume ratios.\n"
            "• **Adaptive RL Dispatch**: Minimizes queue spillback by adjusting green duration proportionally to incoming vehicular demand (VPH)."
        )

    # 4. Multi-Domain & Agent Types (Drones, AGVs, Crowds)
    if any(k in q for k in ["domain", "drone", "agv", "warehouse", "crowd", "pedestrian", "robot"]):
        return (
            "**Multi-Domain Simulation Swarms in Dream2Sim:**\n\n"
            "Dream2Sim extends beyond 2D roads into 6 microscopic domains:\n\n"
            "1. **Autonomous Medical Drones**: 3D spatial airway networks between hospital rooftop helipads with altitude separation and wind turbulence resistance.\n"
            "2. **High-Bay Warehouse AGVs**: Multi-robot sorting facilities where Automated Guided Vehicles navigate pallet aisles with collision avoidance grid locks.\n"
            "3. **Pedestrian Crowd Egress**: High-density stadium or transit hub evacuations using Social Force repulsive fields and turnstile bottlenecks.\n"
            "4. **Arterial Urban Roads**: Complex multi-lane intersections with crosswalks, emergency corridors, and mixed vehicle types (cars, buses, trucks, motorcycles).\n"
            "5. **Maritime & Ports**: Container berths, tugboat channels, and crane queue scheduling.\n"
            "6. **Multi-Track Rail**: Block signaling and passenger junction merges."
        )

    # 5. Workflow & How-To Questions
    if any(k in q for k in ["how to", "how do i", "export", "pdf", "csv", "run", "start"]):
        return (
            "**How to Use Dream2Sim:**\n\n"
            "1. **Synthesize a Scenario**: In the **Simulation Workspace**, type any scenario prompt in the bottom bar (e.g., *'High-volume 4-way junction with emergency vehicle priority'*), or select a Quick-Start template from the Dashboard.\n"
            "2. **Real-Time Playback**: Use the floating HUD controls to pause, rewind, scrub through the timeline ($T=0s$ to $300s$), or speed up simulation up to $10\\times$.\n"
            "3. **Telemetry & Heatmaps**: Toggle congestion heatmaps and velocity vectors to visualize spillback in real time.\n"
            "4. **Export Results**: Click **PDF** in the top bar for an engineering dossier, or **CSV** for raw trajectory time-series datasets."
        )

    # Default contextual response
    return (
        f"Regarding **'{query}'**:\n\n"
        "Dream2Sim executes deterministic microscopic simulations using physical kinematics (IDM & Social Force). "
        "You can configure road links, signal cycle splits, and arrival volume rates directly via natural language prompts in the **Simulation Workspace**. "
        "Feel free to ask about specific kinematics formulas, signal timing strategies, multi-domain swarms, or scenario exports!"
    )


@router.post("/chat")
async def chat_with_assistant(
    request: AIChatRequest,
    current_user: User = Depends(get_current_user_optional),
):
    """
    Conversational assistant for answering technical questions about Dream2Sim,
    physics kinematics, signal optimization, and scenario designs.
    """
    user_msg = request.messages[-1].content.strip() if request.messages else ""
    if not user_msg:
        return {"reply": "How can I assist you with your simulation today?"}

    # 1. Try querying Meta Model API if configured with a short timeout
    if orchestrator.client.is_configured:
        try:
            import asyncio
            system_prompt = (
                "You are the official Dream2Sim Engineering AI Assistant. You specialize in microscopic multi-agent "
                "physics simulations, the Intelligent Driver Model (IDM), Social Force crowd dynamics, autonomous drone airspaces, "
                "automated warehouse AGVs, signal cycle optimization, and spatial graph analysis. "
                "Answer questions thoroughly, accurately, and professionally with clear formatting."
            )
            chat_messages = [{"role": "system", "content": system_prompt}]
            for m in request.messages[-6:]:
                chat_messages.append({"role": m.role, "content": m.content})

            resp = await asyncio.wait_for(
                orchestrator.client.chat_completion(
                    model="muse-spark-1.3",
                    messages=chat_messages,
                    temperature=0.3,
                ),
                timeout=1.5,
            )
            if resp and "choices" in resp and resp["choices"]:
                llm_reply = resp["choices"][0]["message"]["content"]
                return {"reply": llm_reply}
        except Exception as e:
            logger.info(f"Meta API chat completion bypassed/timed out ({e}). Using expert simulation knowledge base.")

    # 2. Resilient fallback to Dream2Sim's comprehensive domain knowledge engine
    expert_reply = _generate_expert_chat_response(user_msg)
    return {"reply": expert_reply}
