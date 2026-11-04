from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
import math


@dataclass
class VehicleTypeProfile:
    name: str
    length_m: float
    width_m: float
    max_speed_ms: float
    max_accel_ms2: float
    comf_decel_ms2: float
    min_gap_s0: float
    time_headway_T: float
    color_hex: str


VEHICLE_PROFILES: Dict[str, VehicleTypeProfile] = {
    "car": VehicleTypeProfile(
        name="car",
        length_m=4.5,
        width_m=2.0,
        max_speed_ms=16.6,  # 60 km/h
        max_accel_ms2=2.5,
        comf_decel_ms2=2.0,
        min_gap_s0=2.0,
        time_headway_T=1.5,
        color_hex="#38bdf8",  # Sky blue
    ),
    "bus": VehicleTypeProfile(
        name="bus",
        length_m=12.0,
        width_m=2.6,
        max_speed_ms=11.1,  # 40 km/h
        max_accel_ms2=1.2,
        comf_decel_ms2=1.5,
        min_gap_s0=3.0,
        time_headway_T=2.2,
        color_hex="#f59e0b",  # Amber
    ),
    "truck": VehicleTypeProfile(
        name="truck",
        length_m=10.0,
        width_m=2.5,
        max_speed_ms=11.1,  # 40 km/h
        max_accel_ms2=1.0,
        comf_decel_ms2=1.2,
        min_gap_s0=3.5,
        time_headway_T=2.5,
        color_hex="#ef4444",  # Red
    ),
    "motorcycle": VehicleTypeProfile(
        name="motorcycle",
        length_m=2.2,
        width_m=1.0,
        max_speed_ms=16.6,  # 60 km/h
        max_accel_ms2=3.5,
        comf_decel_ms2=2.5,
        min_gap_s0=1.5,
        time_headway_T=1.0,
        color_hex="#a855f7",  # Purple
    ),
    "emergency": VehicleTypeProfile(
        name="emergency",
        length_m=5.5,
        width_m=2.2,
        max_speed_ms=22.2,  # 80 km/h
        max_accel_ms2=3.0,
        comf_decel_ms2=2.5,
        min_gap_s0=1.5,
        time_headway_T=1.0,
        color_hex="#10b981",  # Emerald / siren green
    ),
    "pedestrian": VehicleTypeProfile(
        name="pedestrian",
        length_m=0.8,
        width_m=0.8,
        max_speed_ms=2.5,  # 9 km/h walking/running
        max_accel_ms2=1.5,
        comf_decel_ms2=1.5,
        min_gap_s0=0.5,
        time_headway_T=0.8,
        color_hex="#ec4899",  # Vibrant Pink / Human dot
    ),
    "agv": VehicleTypeProfile(
        name="agv",
        length_m=2.0,
        width_m=1.2,
        max_speed_ms=4.0,  # 14 km/h warehouse robot
        max_accel_ms2=1.8,
        comf_decel_ms2=2.0,
        min_gap_s0=1.0,
        time_headway_T=1.0,
        color_hex="#eab308",  # Industrial Yellow
    ),
    "drone": VehicleTypeProfile(
        name="drone",
        length_m=1.5,
        width_m=1.5,
        max_speed_ms=20.0,  # 72 km/h flight speed
        max_accel_ms2=4.0,
        comf_decel_ms2=3.0,
        min_gap_s0=3.0,
        time_headway_T=1.2,
        color_hex="#06b6d4",  # Cyan airspace beacon
    ),
    "train": VehicleTypeProfile(
        name="train",
        length_m=28.0,
        width_m=3.0,
        max_speed_ms=25.0,  # 90 km/h transit
        max_accel_ms2=1.0,
        comf_decel_ms2=1.2,
        min_gap_s0=8.0,
        time_headway_T=3.0,
        color_hex="#6366f1",  # Indigo rail
    ),
    "ship": VehicleTypeProfile(
        name="ship",
        length_m=35.0,
        width_m=6.0,
        max_speed_ms=8.0,  # 28 km/h nautical
        max_accel_ms2=0.5,
        comf_decel_ms2=0.8,
        min_gap_s0=12.0,
        time_headway_T=4.0,
        color_hex="#14b8a6",  # Teal maritime
    ),
}


def get_or_create_profile(vehicle_type: str) -> VehicleTypeProfile:
    vt = (vehicle_type or "car").lower().strip()
    if vt in VEHICLE_PROFILES:
        return VEHICLE_PROFILES[vt]

    # Keyword-based matching
    if any(k in vt for k in ["pedestrian", "person", "crowd", "human", "walker", "passenger", "fan", "patient", "student", "shopper"]):
        return VEHICLE_PROFILES["pedestrian"]
    if any(k in vt for k in ["agv", "robot", "forklift", "bot", "cart", "pallet", "trolley"]):
        return VEHICLE_PROFILES["agv"]
    if any(k in vt for k in ["drone", "uav", "air", "plane", "flight", "quadcopter"]):
        return VEHICLE_PROFILES["drone"]
    if any(k in vt for k in ["cycle", "bike", "scooter", "motorcycle", "rickshaw", "auto", "tuk"]):
        return VEHICLE_PROFILES["motorcycle"]
    if any(k in vt for k in ["bus", "van", "shuttle", "transit", "coach", "tram"]):
        return VEHICLE_PROFILES["bus"]
    if any(k in vt for k in ["train", "metro", "rail", "monorail"]):
        return VEHICLE_PROFILES["train"]
    if any(k in vt for k in ["ship", "boat", "vessel", "ferry", "barge"]):
        return VEHICLE_PROFILES["ship"]
    if any(k in vt for k in ["truck", "freight", "cargo", "lorry", "container", "semi"]):
        return VEHICLE_PROFILES["truck"]
    if any(k in vt for k in ["emergency", "ambulance", "police", "fire", "paramedic", "siren"]):
        return VEHICLE_PROFILES["emergency"]

    # Dynamic deterministic color generation
    import hashlib
    color_hex = "#" + hashlib.md5(vt.encode()).hexdigest()[:6]
    return VehicleTypeProfile(
        name=vt,
        length_m=4.5,
        width_m=2.0,
        max_speed_ms=15.0,
        max_accel_ms2=2.5,
        comf_decel_ms2=2.0,
        min_gap_s0=2.0,
        time_headway_T=1.5,
        color_hex=color_hex,
    )


@dataclass
class VehicleState:
    id: str
    vehicle_type: str
    profile: VehicleTypeProfile
    current_road_id: str
    current_lane: int
    distance_along_road_m: float
    speed_ms: float
    acceleration_ms2: float = 0.0
    route_road_ids: List[str] = field(default_factory=list)
    spawn_time: float = 0.0
    wait_time_seconds: float = 0.0
    is_completed: bool = False
    is_queued: bool = False

    # 2D coordinates for rendering
    x: float = 0.0
    y: float = 0.0
    angle_rad: float = 0.0


@dataclass
class RoadGeometry:
    id: str
    source_id: str
    target_id: str
    source_x: float
    source_y: float
    target_x: float
    target_y: float
    length_m: float
    lanes: int
    speed_limit_ms: float
    is_closed: bool = False
    angle_rad: float = 0.0

    def compute_position(self, distance_m: float, lane: int) -> Tuple[float, float, float]:
        fraction = max(0.0, min(1.0, distance_m / max(1.0, self.length_m)))
        # Base position along road centerline
        bx = self.source_x + fraction * (self.target_x - self.source_x)
        by = self.source_y + fraction * (self.target_y - self.source_y)

        # Lateral lane offset perpendicular to road direction (3.5m standard lane width scaled)
        lane_width = 4.0
        # Normal vector: (-sin(angle), cos(angle))
        nx = -math.sin(self.angle_rad)
        ny = math.cos(self.angle_rad)
        lane_offset = (lane - (self.lanes - 1) / 2.0) * lane_width

        x = bx + nx * lane_offset
        y = by + ny * lane_offset
        return x, y, self.angle_rad
