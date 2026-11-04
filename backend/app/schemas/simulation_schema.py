from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field


class IntersectionNode(BaseModel):
    id: str
    name: str = ""
    x: float
    y: float
    type: str = "traffic_signal"


class LaneConfig(BaseModel):
    lane_id: int
    allowed_turns: List[str] = ["through"]
    width_m: float = 3.5
    is_closed: bool = False


class RoadSegment(BaseModel):
    id: str
    source: str
    target: str
    lanes: int = Field(default=2, ge=1, le=8)
    speed_limit_kmh: float = Field(default=50.0, ge=10.0, le=140.0)
    length_m: Optional[float] = None  # Auto-calculated from node euclidean distance if None
    is_closed: bool = False
    lane_details: Optional[List[LaneConfig]] = None


class SignalPhase(BaseModel):
    id: str
    name: str
    duration_seconds: float = Field(default=30.0, ge=5.0, le=180.0)
    active_green_roads: List[str]  # Road IDs with green signal in this phase
    yellow_seconds: float = 4.0


class TrafficSignalConfig(BaseModel):
    id: str
    intersection_id: str
    cycle_time_seconds: Optional[float] = None
    phases: List[SignalPhase]
    adaptive: bool = False


class VehicleDemand(BaseModel):
    vehicle_type: str = "car"
    flow_rate_vph: float = Field(default=600.0, ge=0.0, le=10000.0)  # Vehicles Per Hour
    priority: int = 1  # Higher for emergency


class DemandConfig(BaseModel):
    id: str
    source_node: str
    target_node: str
    vehicle_mix: List[VehicleDemand] = Field(default_factory=lambda: [
        VehicleDemand(vehicle_type="car", flow_rate_vph=500.0),
        VehicleDemand(vehicle_type="bus", flow_rate_vph=40.0),
        VehicleDemand(vehicle_type="motorcycle", flow_rate_vph=250.0),
        VehicleDemand(vehicle_type="truck", flow_rate_vph=30.0),
    ])


class SimulationParameters(BaseModel):
    duration_seconds: float = Field(default=300.0, ge=30.0, le=3600.0)
    time_step: float = Field(default=0.2, ge=0.05, le=1.0)
    random_seed: int = Field(default=42)
    warm_up_seconds: float = Field(default=10.0, ge=0.0)


class RoadNetwork(BaseModel):
    intersections: List[IntersectionNode]
    roads: List[RoadSegment]


class SimulationConfig(BaseModel):
    title: str = "Urban Traffic Simulation"
    description: str = ""
    domain: str = "traffic"
    network: RoadNetwork
    signals: List[TrafficSignalConfig] = Field(default_factory=list)
    demands: List[DemandConfig] = Field(default_factory=list)
    parameters: SimulationParameters = Field(default_factory=SimulationParameters)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SimulationMetrics(BaseModel):
    total_vehicles_generated: int
    total_vehicles_processed: int
    average_waiting_time_seconds: float
    average_travel_time_seconds: float
    average_queue_length: float
    max_queue_length: int
    average_speed_kmh: float
    throughput_vph: float
    congestion_percentage: float
    road_utilization_percentage: float
    signal_efficiency_score: float  # 0 to 100
    metrics_by_road: Dict[str, Dict[str, float]] = Field(default_factory=dict)
    time_series: List[Dict[str, Any]] = Field(default_factory=list)


class ScenarioCompareRequest(BaseModel):
    scenario_ids: List[str]


class ScenarioCompareResult(BaseModel):
    comparison_table: List[Dict[str, Any]]
    key_differences: List[str]
    ai_summary: Optional[str] = None
