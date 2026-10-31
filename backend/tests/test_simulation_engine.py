import pytest
from app.schemas.simulation_schema import (
    SimulationConfig,
    RoadNetwork,
    IntersectionNode,
    RoadSegment,
    TrafficSignalConfig,
    SignalPhase,
    DemandConfig,
    VehicleDemand,
    SimulationParameters,
)
from app.simulation.engine import SimulationEngine


def create_sample_4way_intersection(east_road_closed: bool = False, seed: int = 42) -> SimulationConfig:
    nodes = [
        IntersectionNode(id="center", name="Central Junction", x=400.0, y=300.0, type="traffic_signal"),
        IntersectionNode(id="north", name="North Gate", x=400.0, y=50.0, type="priority"),
        IntersectionNode(id="south", name="South Gate", x=400.0, y=550.0, type="priority"),
        IntersectionNode(id="west", name="West Avenue", x=100.0, y=300.0, type="priority"),
        IntersectionNode(id="east", name="East Boulevard", x=700.0, y=300.0, type="priority"),
    ]

    roads = [
        RoadSegment(id="r_n_c", source="north", target="center", lanes=2, speed_limit_kmh=50.0),
        RoadSegment(id="r_c_s", source="center", target="south", lanes=2, speed_limit_kmh=50.0),
        RoadSegment(id="r_s_c", source="south", target="center", lanes=2, speed_limit_kmh=50.0),
        RoadSegment(id="r_c_n", source="center", target="north", lanes=2, speed_limit_kmh=50.0),
        RoadSegment(id="r_w_c", source="west", target="center", lanes=2, speed_limit_kmh=50.0),
        RoadSegment(id="r_c_e", source="center", target="east", lanes=2, speed_limit_kmh=50.0, is_closed=east_road_closed),
        RoadSegment(id="r_e_c", source="east", target="center", lanes=2, speed_limit_kmh=50.0, is_closed=east_road_closed),
        RoadSegment(id="r_c_w", source="center", target="west", lanes=2, speed_limit_kmh=50.0),
    ]

    signals = [
        TrafficSignalConfig(
            id="sig_center",
            intersection_id="center",
            phases=[
                SignalPhase(id="p1", name="North-South Green", duration_seconds=30.0, active_green_roads=["r_n_c", "r_s_c"], yellow_seconds=3.0),
                SignalPhase(id="p2", name="East-West Green", duration_seconds=30.0, active_green_roads=["r_w_c", "r_e_c"], yellow_seconds=3.0),
            ]
        )
    ]

    demands = [
        DemandConfig(
            id="d_n_s",
            source_node="north",
            target_node="south",
            vehicle_mix=[
                VehicleDemand(vehicle_type="car", flow_rate_vph=600.0),
                VehicleDemand(vehicle_type="bus", flow_rate_vph=50.0),
                VehicleDemand(vehicle_type="motorcycle", flow_rate_vph=300.0),
            ]
        ),
        DemandConfig(
            id="d_w_e",
            source_node="west",
            target_node="east",
            vehicle_mix=[
                VehicleDemand(vehicle_type="car", flow_rate_vph=500.0),
                VehicleDemand(vehicle_type="truck", flow_rate_vph=40.0),
            ]
        )
    ]

    params = SimulationParameters(
        duration_seconds=60.0,  # 60s test run
        time_step=0.2,
        random_seed=seed,
    )

    return SimulationConfig(
        title="Mumbai 4-Way Junction",
        network=RoadNetwork(intersections=nodes, roads=roads),
        signals=signals,
        demands=demands,
        parameters=params,
    )


def test_simulation_engine_runs_and_calculates_metrics():
    config = create_sample_4way_intersection(seed=42)
    engine = SimulationEngine(config)
    metrics, snapshots = engine.run()

    assert metrics.total_vehicles_generated > 0
    assert metrics.average_speed_kmh >= 0.0
    assert metrics.throughput_vph >= 0.0
    assert len(snapshots) > 0
    assert len(metrics.time_series) > 0
    assert "r_n_c" in metrics.metrics_by_road


def test_simulation_engine_is_strictly_deterministic():
    config1 = create_sample_4way_intersection(seed=123)
    engine1 = SimulationEngine(config1)
    metrics1, snapshots1 = engine1.run()

    config2 = create_sample_4way_intersection(seed=123)
    engine2 = SimulationEngine(config2)
    metrics2, snapshots2 = engine2.run()

    assert metrics1.total_vehicles_generated == metrics2.total_vehicles_generated
    assert metrics1.total_vehicles_processed == metrics2.total_vehicles_processed
    assert metrics1.average_waiting_time_seconds == metrics2.average_waiting_time_seconds
    assert metrics1.average_speed_kmh == metrics2.average_speed_kmh
    assert len(snapshots1) == len(snapshots2)


def test_simulation_engine_road_closure_impact():
    config_open = create_sample_4way_intersection(east_road_closed=False, seed=42)
    engine_open = SimulationEngine(config_open)
    metrics_open, _ = engine_open.run()

    config_closed = create_sample_4way_intersection(east_road_closed=True, seed=42)
    engine_closed = SimulationEngine(config_closed)
    metrics_closed, _ = engine_closed.run()

    # Closed road should be marked as closed in metrics
    assert metrics_closed.metrics_by_road["r_c_e"]["is_closed"] == 1.0
    assert metrics_open.metrics_by_road["r_c_e"]["is_closed"] == 0.0
