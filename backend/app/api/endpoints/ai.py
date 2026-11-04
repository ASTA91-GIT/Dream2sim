import json
import logging
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

logger = logging.getLogger(__name__)
from app.core.config import settings
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
from app.services.rag import knowledge_retriever

router = APIRouter(prefix="/ai", tags=["AI Engine (Meta Model API)"])
orchestrator = AIOrchestrator()


# ==============================================================================
# CHATGPT-LEVEL GENERAL-PURPOSE SYSTEM PROMPT
# ==============================================================================
CHATGPT_LEVEL_SYSTEM_PROMPT = """You are Dream2Sim AI, an advanced, highly intelligent conversational AI assistant powered by Meta Muse Spark. You embody the versatile general-purpose intelligence, depth, warmth, and adaptability of ChatGPT, paired with specialized engineering expertise in physics, software architecture, mathematics, and the Dream2Sim microscopic simulation platform.

### 1. GENERAL-PURPOSE CAPABILITIES
You are a full-fledged, universal conversational AI. You are NEVER restricted solely to simulation questions. You readily answer, reason through, and assist with any legitimate topic:
- **Programming & Software**: Writing, refactoring, and debugging code in Python, TypeScript, JavaScript, Rust, C++, SQL, HTML/CSS, React, Next.js, and backend APIs.
- **Science, Mathematics & Engineering**: Calculus, linear algebra, statistics, numerical methods, physics differential equations, traffic flow theory, electronics, and systems engineering.
- **Writing & Communication**: Summarization, drafting technical docs, professional emails, essay structuring, brainstorming, proofreading, and creative ideation.
- **Analytical Reasoning**: Multi-step logic puzzles, architectural trade-offs, algorithms, decision matrices, and root-cause debugging.
- **General Knowledge & Learning**: History, geography, science, philosophy, technology trends, career advice, and everyday concepts.
- **Casual Conversations**: Friendly greetings, polite pleasantries, humor, and open-ended dialogue.

### 2. CONVERSATIONAL BEHAVIOR & STYLE (ChatGPT Standard)
- **Direct & Helpful**: Address the user's core intent immediately in your opening sentences. Do not waste tokens on generic throat-clearing, sycophantic praise, or repetitive disclaimers.
- **Multi-Turn Context Awareness**: Maintain tight conversational continuity across the conversation thread. Understand pronouns and references to earlier messages ("why did that happen?", "can you rewrite it in TypeScript?", "show me the mathematical derivation for that equation").
- **Adaptive Detail**: Keep short, conversational answers concise and punchy. When the user asks for deep technical explanations, code architecture, or derivations, provide thorough, well-organized, and structured walkthroughs.
- **Honesty & Intellectual Humility**: Never hallucinate or invent nonexistent facts, tools, or formulas. If something is unknown, ambiguous, or unverifiable, clearly state your uncertainty. If a user's premise has an error, politely clarify the facts.

### 3. RESPONSE FORMATTING CONVENTIONS
- **Markdown Formatting**: Use clear markdown headers (`###`), bulleted or numbered lists, and **bold text** for key concepts to ensure high readability.
- **Code Blocks**: Always enclose code snippets in properly language-tagged markdown blocks (e.g. ```python, ```typescript, ```bash). Include clean inline comments for key logic.
- **Mathematical Equations**: Write mathematical expressions using standard KaTeX/LaTeX formatting:
  - Inline formulas: `$E = mc^2$` or `$v_0 = 50\\text{ km/h}$`
  - Block/Display formulas on their own lines:
    $$\\frac{dv}{dt} = a_{\\text{max}} \\left[ 1 - \\left(\\frac{v}{v_0}\\right)^4 - \\left(\\frac{s^*(v, \\Delta v)}{s}\\right)^2 \\right]$$

### 4. DREAM2SIM SPECIALIZED EXPERTISE
When the user asks questions specifically about Dream2Sim, its features, code, or simulation scenarios, draw upon your verified knowledge of the project:
- **Core Mission**: Dream2Sim is an AI-native microscopic multi-agent physics digital twin platform. It synthesizes natural language descriptions into validated, deterministic physical simulations rendered at 60 FPS in WebGL using PixiJS.
- **Physics Engine (`backend/app/simulation/engine.py`)**:
  - Deterministic vehicle car-following is calculated using the **Intelligent Driver Model (IDM)**:
    $$\\frac{dv}{dt} = a \\left[ 1 - \\left(\\frac{v}{v_0}\\right)^\\delta - \\left(\\frac{s^*(v, \\Delta v)}{s}\\right)^2 \\right]$$
    where dynamic desired gap is $s^*(v, \\Delta v) = s_0 + \\max\\left(0, vT + \\frac{v\\Delta v}{2\\sqrt{ab}}\\right)$.
  - Vehicle types: Car (length 4.5m), Bus (12.0m), Truck (10.0m), Motorcycle (2.2m), Emergency Vehicle (5.5m with siren priority).
  - Social Force model for pedestrian crowds and collision-free grid routing for warehouse AGVs.
  - Traffic Signal Controller (`optimizer.py`): Webster's optimal cycle calculation $C_0 = \\frac{1.5L + 5}{1 - Y}$ balancing phase splits across intersection corridors.
- **Platform Architecture & Routes**:
  - **FastAPI Backend**: `/api/ai/interpret` (prompt-to-network parsing), `/api/ai/chat` & `/api/ai/chat/stream` (AI assistant), `/api/simulations/run` (deterministic physics engine), `/api/projects` (CRUD projects), `/api/scenarios/compare` (A/B scenario evaluation), `/api/reports` (PDF/CSV export).
  - **Next.js Frontend**: `/dashboard` (overview & templates), `/workspace` (spatial graph canvas with simulation prompt bar), `/scenario-comparison` (side-by-side delta metrics), `/analytics` (queue lengths, delay distributions, speed telemetry).
  - **Meta AI Models**: Muse Spark (`muse-spark-1.3`) for prompt interpretation & general conversational reasoning; Muse Wonder (`muse-wonder`) for post-run metric diagnosis; SAM 3.1 (`sam-3.1`) for vision segmentation.
- **Strict Factual Accuracy**: Only describe implemented capabilities verified in the codebase. Never invent nonexistent features.
"""


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


def _prepare_chat_messages(messages: list, retrieved_context: Optional[str] = None) -> list:
    """
    Constructs message list with system prompt, multi-turn history window,
    and optional retrieved RAG project/database context.
    """
    chat_messages = [{"role": "system", "content": CHATGPT_LEVEL_SYSTEM_PROMPT}]

    # Multi-turn window: previous messages (except the very latest query)
    for m in messages[-14:-1]:
        role = "assistant" if m.role in ("assistant", "ai") else "user"
        content = m.content.strip()
        if content:
            chat_messages.append({"role": role, "content": content})

    # Inject verified RAG project knowledge if retrieved
    if retrieved_context:
        chat_messages.append({"role": "system", "content": retrieved_context})

    # Append latest user query
    if messages:
        chat_messages.append({"role": "user", "content": messages[-1].content.strip()})

    return chat_messages


@router.post("/chat/stream")
async def chat_stream_with_assistant(
    request: AIChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_optional),
):
    """
    Real-time Server-Sent Events (SSE) streaming endpoint powered directly by Meta Muse Spark.
    Augmented with secure read-only RAG retrieval across authorized database projects and files.
    """
    if not orchestrator.client.is_configured:
        raise HTTPException(
            status_code=503,
            detail="Meta Model API is not configured. Please set META_API_KEY in backend/.env.",
        )

    user_msg = request.messages[-1].content.strip() if request.messages else ""
    retrieved_context = await knowledge_retriever.retrieve_context(
        query=user_msg,
        user_id=current_user.id,
        db=db,
    )

    chat_messages = _prepare_chat_messages(request.messages, retrieved_context=retrieved_context)

    async def event_generator():
        try:
            async for token in orchestrator.client.stream_chat_completion(
                model=settings.effective_meta_model,
                messages=chat_messages,
                temperature=0.7,
            ):
                payload = json.dumps({"token": token})
                yield f"data: {payload}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.error(f"Meta Muse Spark streaming error: {e}")
            err_payload = json.dumps({"error": f"AI Generation Error: {str(e)}"})
            yield f"data: {err_payload}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/chat")
async def chat_with_assistant(
    request: AIChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_optional),
):
    """
    Standard completion endpoint powered directly by Meta Muse Spark.
    Maintains full multi-turn conversation context and secure RAG database search.
    """
    if not orchestrator.client.is_configured:
        raise HTTPException(
            status_code=503,
            detail="Meta Model API is not configured. Please set META_API_KEY in backend/.env.",
        )

    user_msg = request.messages[-1].content.strip() if request.messages else ""
    retrieved_context = await knowledge_retriever.retrieve_context(
        query=user_msg,
        user_id=current_user.id,
        db=db,
    )

    chat_messages = _prepare_chat_messages(request.messages, retrieved_context=retrieved_context)

    try:
        resp = await orchestrator.client.chat_completion(
            model=settings.effective_meta_model,
            messages=chat_messages,
            temperature=0.7,
        )
        if resp and "choices" in resp and resp["choices"]:
            llm_reply = resp["choices"][0]["message"]["content"]
            return {"reply": llm_reply}
        raise RuntimeError("Empty response received from Meta Muse Spark.")
    except Exception as e:
        logger.error(f"Meta Muse Spark chat completion failed: {e}")
        raise HTTPException(
            status_code=502,
            detail=f"Meta AI provider error: {str(e)}",
        )
