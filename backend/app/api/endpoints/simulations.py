from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Response, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import json
import asyncio

from app.database.session import get_db
from app.models.models import Simulation, SimulationRun, Scenario, User
from app.schemas.simulation_schema import SimulationConfig, SimulationMetrics
from app.simulation.engine import SimulationEngine
from app.simulation.optimizer import SignalOptimizer
from app.services.reports.generator import ReportGenerator
from app.api.deps import get_current_user_optional

router = APIRouter(prefix="/simulations", tags=["Simulations"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_simulation(
    config: SimulationConfig,
    project_id: Optional[str] = None,
    natural_prompt: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_optional),
):
    sim = Simulation(
        project_id=project_id,
        user_id=current_user.id,
        title=config.title,
        natural_prompt=natural_prompt or config.description,
        domain=config.domain,
        status="ready",
        configuration=config.model_dump(),
    )
    db.add(sim)
    await db.commit()
    await db.refresh(sim)

    # Create baseline scenario record
    scenario = Scenario(
        simulation_id=sim.id,
        title=f"{sim.title} (Baseline)",
        description="Initial configuration baseline",
        configuration_delta={},
        is_baseline=True,
    )
    db.add(scenario)
    await db.commit()

    return {
        "id": sim.id,
        "title": sim.title,
        "status": sim.status,
        "configuration": sim.configuration,
        "created_at": sim.created_at,
    }


@router.post("/validate")
async def validate_simulation(config: SimulationConfig):
    """
    Validates network connectivity and parameters.
    """
    node_ids = {node.id for node in config.network.intersections}
    unconnected_roads = []
    for road in config.network.roads:
        if road.source not in node_ids or road.target not in node_ids:
            unconnected_roads.append(road.id)

    if unconnected_roads:
        raise HTTPException(
            status_code=400,
            detail=f"Road segments {unconnected_roads} connect to non-existent nodes.",
        )

    return {
        "valid": True,
        "nodes_count": len(config.network.intersections),
        "roads_count": len(config.network.roads),
        "signals_count": len(config.signals),
        "message": "Simulation configuration passed all structural validation tests.",
    }


@router.post("/run")
async def run_simulation(
    payload: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_optional),
):
    """
    Executes the deterministic simulation engine.
    Computes numerical metrics and generates trajectory keyframes for rendering.
    """
    sim_id = payload.get("simulation_id")
    config_dict = payload.get("configuration")

    if sim_id:
        result = await db.execute(select(Simulation).where(Simulation.id == sim_id))
        sim = result.scalar_one_or_none()
        if not sim:
            raise HTTPException(status_code=404, detail="Simulation not found")
        # If updated config passed in payload, use it, else use stored config
        cfg = SimulationConfig(**(config_dict or sim.configuration))
    elif config_dict:
        cfg = SimulationConfig(**config_dict)
        # Create a transient simulation in database
        sim = Simulation(
            user_id=current_user.id,
            title=cfg.title,
            natural_prompt=cfg.description,
            domain=cfg.domain,
            status="running",
            configuration=cfg.model_dump(),
        )
        db.add(sim)
        await db.commit()
        await db.refresh(sim)
    else:
        raise HTTPException(status_code=400, detail="Must provide simulation_id or configuration.")

    # Override parameters if provided
    if "duration_seconds" in payload:
        cfg.parameters.duration_seconds = float(payload["duration_seconds"])
    if "random_seed" in payload:
        cfg.parameters.random_seed = int(payload["random_seed"])

    # Run deterministic simulation engine
    engine = SimulationEngine(cfg)
    metrics, snapshots = engine.run()

    # Save run record
    run_record = SimulationRun(
        simulation_id=sim.id,
        seed=cfg.parameters.random_seed,
        duration_seconds=cfg.parameters.duration_seconds,
        time_step=cfg.parameters.time_step,
        status="completed",
        metrics=metrics.model_dump(),
        trajectory_data=snapshots,
    )
    db.add(run_record)
    sim.status = "completed"
    await db.commit()
    await db.refresh(run_record)

    return {
        "simulation_id": sim.id,
        "run_id": run_record.id,
        "metrics": metrics.model_dump(),
        "snapshots_count": len(snapshots),
        "snapshots": snapshots,  # Visualizer consumes snapshots
    }


@router.get("/{sim_id}")
async def get_simulation(
    sim_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_optional),
):
    result = await db.execute(select(Simulation).where(Simulation.id == sim_id))
    sim = result.scalar_one_or_none()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")

    # Latest run
    run_res = await db.execute(
        select(SimulationRun)
        .where(SimulationRun.simulation_id == sim_id)
        .order_by(SimulationRun.created_at.desc())
    )
    latest_run = run_res.scalar_one_or_none()

    return {
        "id": sim.id,
        "title": sim.title,
        "status": sim.status,
        "configuration": sim.configuration,
        "created_at": sim.created_at,
        "latest_run": {
            "id": latest_run.id,
            "metrics": latest_run.metrics,
            "snapshots": latest_run.trajectory_data,
            "ai_analysis": latest_run.ai_analysis,
        } if latest_run else None,
    }


@router.post("/optimize")
async def optimize_simulation_signals(
    payload: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_optional),
):
    """
    Executes multiple simulation trials with alternative signal timings
    to minimize queue lengths and average vehicle waiting times.
    """
    sim_id = payload.get("simulation_id")
    config_dict = payload.get("configuration")

    if sim_id:
        result = await db.execute(select(Simulation).where(Simulation.id == sim_id))
        sim = result.scalar_one_or_none()
        if not sim:
            raise HTTPException(status_code=404, detail="Simulation not found")
        cfg = SimulationConfig(**(config_dict or sim.configuration))
    elif config_dict:
        cfg = SimulationConfig(**config_dict)
    else:
        raise HTTPException(status_code=400, detail="Must provide simulation_id or configuration")

    optimizer = SignalOptimizer(cfg)
    results = optimizer.optimize_cycle()
    return results


@router.get("/{sim_id}/export/csv")
async def export_csv(
    sim_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SimulationRun)
        .where(SimulationRun.simulation_id == sim_id)
        .order_by(SimulationRun.created_at.desc())
    )
    latest_run = result.scalar_one_or_none()
    if not latest_run or not latest_run.metrics:
        raise HTTPException(status_code=404, detail="No run metrics found to export")

    csv_data = ReportGenerator.generate_csv_metrics(latest_run.metrics)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=simulation_{sim_id}_metrics.csv"},
    )


@router.get("/{sim_id}/export/pdf")
async def export_pdf(
    sim_id: str,
    db: AsyncSession = Depends(get_db),
):
    sim_res = await db.execute(select(Simulation).where(Simulation.id == sim_id))
    sim = sim_res.scalar_one_or_none()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")

    run_res = await db.execute(
        select(SimulationRun)
        .where(SimulationRun.simulation_id == sim_id)
        .order_by(SimulationRun.created_at.desc())
    )
    latest_run = run_res.scalar_one_or_none()
    if not latest_run or not latest_run.metrics:
        raise HTTPException(status_code=404, detail="No run metrics found to export")

    pdf_bytes = ReportGenerator.generate_pdf_report(
        simulation_title=sim.title,
        metrics=latest_run.metrics,
        ai_analysis=latest_run.ai_analysis or "",
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=simulation_{sim_id}_report.pdf"},
    )


@router.websocket("/ws/{sim_id}")
async def simulation_websocket(websocket: WebSocket, sim_id: str):
    """
    WebSocket endpoint for live real-time simulation streaming.
    Sends step snapshots frame by frame.
    """
    await websocket.accept()
    try:
        # Wait for start command from client
        data_text = await websocket.receive_text()
        req = json.loads(data_text)
        config = SimulationConfig(**req["configuration"])

        engine = SimulationEngine(config)
        steps_total = int(config.parameters.duration_seconds / config.parameters.time_step)

        for step_idx in range(steps_total):
            engine._step()
            # Send snapshot whenever captured
            if engine.snapshots and engine.last_snapshot_time == engine.current_time - engine.dt:
                latest_snap = engine.snapshots[-1]
                await websocket.send_json({
                    "type": "snapshot",
                    "snapshot": latest_snap,
                    "progress": round((step_idx + 1) / steps_total * 100, 1),
                })
                # Yield control to prevent event loop choking
                await asyncio.sleep(0.01)

        metrics = engine._calculate_metrics()
        await websocket.send_json({
            "type": "completed",
            "metrics": metrics.model_dump(),
        })
    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_json({"type": "error", "error": str(e)})
    finally:
        await websocket.close()
