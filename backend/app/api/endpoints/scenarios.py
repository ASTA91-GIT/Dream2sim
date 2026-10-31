from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.session import get_db
from app.models.models import Scenario, Simulation, SimulationRun, User
from app.schemas.simulation_schema import ScenarioCompareRequest, ScenarioCompareResult, SimulationConfig
from app.simulation.engine import SimulationEngine
from app.api.deps import get_current_user_optional

router = APIRouter(prefix="/scenarios", tags=["Scenarios"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_scenario(
    payload: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_optional),
):
    sim_id = payload.get("simulation_id")
    title = payload.get("title", "Alternative Scenario")
    description = payload.get("description", "")
    delta = payload.get("configuration_delta", {})

    result = await db.execute(select(Simulation).where(Simulation.id == sim_id))
    sim = result.scalar_one_or_none()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")

    scenario = Scenario(
        simulation_id=sim_id,
        title=title,
        description=description,
        configuration_delta=delta,
        is_baseline=payload.get("is_baseline", False),
    )
    db.add(scenario)
    await db.commit()
    await db.refresh(scenario)

    return scenario


@router.get("")
async def list_scenarios(
    simulation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_optional),
):
    result = await db.execute(
        select(Scenario)
        .where(Scenario.simulation_id == simulation_id)
        .order_by(Scenario.created_at.asc())
    )
    return result.scalars().all()


@router.post("/compare")
async def compare_scenarios(
    request: ScenarioCompareRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_optional),
):
    """
    Compares metrics across multiple scenarios.
    If runs don't exist yet, automatically executes the simulation engine for each scenario.
    """
    if not request.scenario_ids:
        raise HTTPException(status_code=400, detail="Must provide at least one scenario ID to compare.")

    comparison_table = []
    key_differences = []

    for sc_id in request.scenario_ids:
        sc_res = await db.execute(select(Scenario).where(Scenario.id == sc_id))
        scenario = sc_res.scalar_one_or_none()
        if not scenario:
            continue

        sim_res = await db.execute(select(Simulation).where(Simulation.id == scenario.simulation_id))
        sim = sim_res.scalar_one_or_none()
        if not sim:
            continue

        # Check existing run
        run_res = await db.execute(
            select(SimulationRun)
            .where(SimulationRun.scenario_id == sc_id)
            .order_by(SimulationRun.created_at.desc())
        )
        sim_run = run_res.scalar_one_or_none()

        if not sim_run or not sim_run.metrics:
            # Build merged config and execute engine
            base_cfg_dict = dict(sim.configuration)
            # Apply delta
            if scenario.configuration_delta:
                base_cfg_dict.update(scenario.configuration_delta)

            cfg = SimulationConfig(**base_cfg_dict)
            engine = SimulationEngine(cfg)
            metrics, snapshots = engine.run()

            sim_run = SimulationRun(
                simulation_id=sim.id,
                scenario_id=sc_id,
                metrics=metrics.model_dump(),
                trajectory_data=snapshots,
            )
            db.add(sim_run)
            await db.commit()
            await db.refresh(sim_run)

        m = sim_run.metrics
        comparison_table.append({
            "scenario_id": scenario.id,
            "title": scenario.title,
            "is_baseline": scenario.is_baseline,
            "average_waiting_time_s": m.get("average_waiting_time_seconds", 0.0),
            "average_travel_time_s": m.get("average_travel_time_seconds", 0.0),
            "throughput_vph": m.get("throughput_vph", 0.0),
            "max_queue_length": m.get("max_queue_length", 0),
            "congestion_percentage": m.get("congestion_percentage", 0.0),
            "signal_efficiency_score": m.get("signal_efficiency_score", 0.0),
        })

    if len(comparison_table) >= 2:
        base = comparison_table[0]
        alt = comparison_table[1]
        wait_delta = round(alt["average_waiting_time_s"] - base["average_waiting_time_s"], 2)
        tp_delta = round(alt["throughput_vph"] - base["throughput_vph"], 1)

        if wait_delta < 0:
            key_differences.append(f"Scenario '{alt['title']}' reduced average waiting delay by {abs(wait_delta)} seconds ({round(abs(wait_delta)/max(0.1, base['average_waiting_time_s'])*100, 1)}% improvement).")
        else:
            key_differences.append(f"Scenario '{alt['title']}' increased waiting delay by {wait_delta} seconds.")

        if tp_delta > 0:
            key_differences.append(f"Throughput increased by {tp_delta} vehicles/hour under '{alt['title']}'.")

    return {
        "comparison_table": comparison_table,
        "key_differences": key_differences,
    }
