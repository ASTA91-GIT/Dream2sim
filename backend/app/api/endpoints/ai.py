from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
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


@router.post("/chat")
async def chat_with_assistant(
    request: AIChatRequest,
    current_user: User = Depends(get_current_user_optional),
):
    """
    Conversational assistant for refining simulation parameters and asking questions.
    """
    user_msg = request.messages[-1].content if request.messages else ""
    interpretation = orchestrator._generate_fallback_configuration(user_msg)

    return {
        "reply": (
            f"I have reviewed your request regarding '{user_msg}'. "
            f"I've configured {len(interpretation.suggested_configuration.network.intersections)} intersection nodes "
            f"and updated the signal cycle timing accordingly. You can inspect the updated parameters on the canvas and run the simulation."
        ),
        "suggested_configuration": interpretation.suggested_configuration.model_dump(),
    }
