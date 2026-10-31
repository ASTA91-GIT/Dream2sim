import math
import random
from typing import List, Dict, Optional, Tuple, Any
from app.schemas.simulation_schema import SimulationConfig, SimulationMetrics
from app.simulation.models import VEHICLE_PROFILES, VehicleTypeProfile, VehicleState, RoadGeometry


class SimulationEngine:
    def __init__(self, config: SimulationConfig):
        self.config = config
        self.dt = config.parameters.time_step
        self.duration = config.parameters.duration_seconds
        self.seed = config.parameters.random_seed
        self.rng = random.Random(self.seed)

        # Build road network
        self.nodes = {node.id: node for node in config.network.intersections}
        self.roads: Dict[str, RoadGeometry] = {}
        self._build_road_geometries()

        # Build signal controllers
        self.signals = {sig.id: sig for sig in config.signals}
        self.signal_states: Dict[str, Dict[str, str]] = {}  # {intersection_id: {road_id: "GREEN"|"YELLOW"|"RED"}}
        self.signal_timers: Dict[str, float] = {sig.id: 0.0 for sig in config.signals}
        self.signal_current_phase: Dict[str, int] = {sig.id: 0 for sig in config.signals}

        # Simulation runtime state
        self.current_time: float = 0.0
        self.vehicles: Dict[str, VehicleState] = {}
        self.completed_vehicles: List[VehicleState] = []
        self.next_vehicle_id: int = 1

        # Spawning accumulators (Poisson / rate-based)
        self.spawn_accumulators: Dict[str, float] = {}

        # Trajectory snapshots for frontend visualizer
        self.snapshots: List[Dict[str, Any]] = []
        self.snapshot_interval = 0.5  # Keyframe every 0.5 seconds
        self.last_snapshot_time = -1.0

        # Metrics collection
        self.time_series_metrics: List[Dict[str, Any]] = []
        self.road_vehicle_counts: Dict[str, int] = {r_id: 0 for r_id in self.roads}

    def _build_road_geometries(self):
        for road in self.config.network.roads:
            src = self.nodes.get(road.source)
            tgt = self.nodes.get(road.target)
            if not src or not tgt:
                continue

            dx = tgt.x - src.x
            dy = tgt.y - src.y
            dist = math.hypot(dx, dy)
            length = road.length_m if road.length_m is not None else max(10.0, dist)
            angle = math.atan2(dy, dx)

            self.roads[road.id] = RoadGeometry(
                id=road.id,
                source_id=road.source,
                target_id=road.target,
                source_x=src.x,
                source_y=src.y,
                target_x=tgt.x,
                target_y=tgt.y,
                length_m=length,
                lanes=road.lanes,
                speed_limit_ms=road.speed_limit_kmh / 3.6,
                is_closed=road.is_closed,
                angle_rad=angle,
            )

    def _update_signals(self, dt: float):
        for sig_id, sig in self.signals.items():
            if not sig.phases:
                continue

            timer = self.signal_timers[sig_id] + dt
            current_phase_idx = self.signal_current_phase[sig_id]
            phase = sig.phases[current_phase_idx]

            phase_total_time = phase.duration_seconds
            yellow_time = phase.yellow_seconds

            if timer >= phase_total_time:
                # Advance to next phase
                self.signal_timers[sig_id] = 0.0
                current_phase_idx = (current_phase_idx + 1) % len(sig.phases)
                self.signal_current_phase[sig_id] = current_phase_idx
                phase = sig.phases[current_phase_idx]
            else:
                self.signal_timers[sig_id] = timer

            # Determine signal lights for roads entering this intersection
            intersection_id = sig.intersection_id
            if intersection_id not in self.signal_states:
                self.signal_states[intersection_id] = {}

            # All roads entering this intersection
            incoming_roads = [r_id for r_id, r in self.roads.items() if r.target_id == intersection_id]

            for r_id in incoming_roads:
                if r_id in phase.active_green_roads:
                    # In green phase: check if in yellow tail
                    if phase_total_time - self.signal_timers[sig_id] <= yellow_time:
                        self.signal_states[intersection_id][r_id] = "YELLOW"
                    else:
                        self.signal_states[intersection_id][r_id] = "GREEN"
                else:
                    self.signal_states[intersection_id][r_id] = "RED"

    def _spawn_vehicles(self, dt: float):
        for demand in self.config.demands:
            # Find candidate route
            source_node = demand.source_node
            target_node = demand.target_node

            # Find connecting road(s)
            candidate_roads = [
                r_id for r_id, r in self.roads.items()
                if r.source_id == source_node and not r.is_closed
            ]
            if not candidate_roads:
                continue

            for v_mix in demand.vehicle_mix:
                # Rate in vehicles per second
                rate_vps = v_mix.flow_rate_vph / 3600.0
                acc_key = f"{demand.id}_{v_mix.vehicle_type}"
                acc = self.spawn_accumulators.get(acc_key, 0.0) + rate_vps * dt

                while acc >= 1.0:
                    acc -= 1.0
                    road_id = self.rng.choice(candidate_roads)
                    road = self.roads[road_id]
                    lane = self.rng.randint(0, road.lanes - 1)

                    # Check entry headway: ensure no car is within min safe gap at the road start
                    vehicles_in_lane = [
                        v for v in self.vehicles.values()
                        if v.current_road_id == road_id and v.current_lane == lane
                    ]
                    can_spawn = True
                    for v in vehicles_in_lane:
                        if v.distance_along_road_m < 15.0:
                            can_spawn = False
                            break

                    if can_spawn:
                        prof = VEHICLE_PROFILES.get(v_mix.vehicle_type, VEHICLE_PROFILES["car"])
                        v_id = f"veh_{self.next_vehicle_id}"
                        self.next_vehicle_id += 1

                        # Simple route discovery: road from source to target or intermediate
                        route = self._plan_route(road_id, target_node)

                        new_veh = VehicleState(
                            id=v_id,
                            vehicle_type=v_mix.vehicle_type,
                            profile=prof,
                            current_road_id=road_id,
                            current_lane=lane,
                            distance_along_road_m=0.0,
                            speed_ms=min(prof.max_speed_ms, road.speed_limit_ms * 0.7),
                            route_road_ids=route,
                            spawn_time=self.current_time,
                        )
                        x, y, angle = road.compute_position(0.0, lane)
                        new_veh.x = x
                        new_veh.y = y
                        new_veh.angle_rad = angle
                        self.vehicles[v_id] = new_veh

                self.spawn_accumulators[acc_key] = acc

    def _plan_route(self, start_road_id: str, dest_node_id: str) -> List[str]:
        # Breadth-first / Dijkstra pathfinder over open roads
        start_road = self.roads[start_road_id]
        if start_road.target_id == dest_node_id:
            return [start_road_id]

        queue = [([start_road_id], start_road.target_id)]
        visited = {start_road.source_id, start_road.target_id}

        while queue:
            path, curr_node = queue.pop(0)
            if curr_node == dest_node_id:
                return path

            for next_road_id, next_road in self.roads.items():
                if next_road.is_closed:
                    continue
                if next_road.source_id == curr_node and next_road.target_id not in visited:
                    visited.add(next_road.target_id)
                    queue.append((path + [next_road_id], next_road.target_id))

        return [start_road_id]

    def _compute_idm_acceleration(
        self,
        v: float,
        v0: float,
        s: float,
        delta_v: float,
        a_max: float,
        b_comf: float,
        s0: float,
        T: float
    ) -> float:
        """
        Intelligent Driver Model (IDM) Kinematics:
        a_idm = a_max * [ 1 - (v / v0)^4 - (s* / s)^2 ]
        where s* = s0 + max(0, v * T + (v * delta_v) / (2 * sqrt(a_max * b_comf)))
        """
        if s <= 0.1:
            return -b_comf * 3.0

        v_safe = max(0.0, v)
        term1 = 1.0 - (v_safe / max(1.0, v0)) ** 4.0

        s_star = s0 + max(0.0, v_safe * T + (v_safe * delta_v) / (2.0 * math.sqrt(max(0.1, a_max * b_comf))))
        term2 = (s_star / s) ** 2.0

        accel = a_max * (term1 - term2)
        # Limit deceleration
        return max(-8.0, min(a_max, accel))

    def _step(self):
        dt = self.dt
        self._update_signals(dt)
        self._spawn_vehicles(dt)

        # Sort vehicles by road and distance to compute leader interactions
        vehicles_by_road_lane: Dict[Tuple[str, int], List[VehicleState]] = {}
        for v in self.vehicles.values():
            key = (v.current_road_id, v.current_lane)
            vehicles_by_road_lane.setdefault(key, []).append(v)

        for key in vehicles_by_road_lane:
            vehicles_by_road_lane[key].sort(key=lambda x: x.distance_along_road_m, reverse=True)

        to_remove = []

        for v_id, v in list(self.vehicles.items()):
            road = self.roads.get(v.current_road_id)
            if not road:
                to_remove.append(v_id)
                continue

            v0 = min(v.profile.max_speed_ms, road.speed_limit_ms)

            # Find leader in the same lane
            same_lane_vehs = vehicles_by_road_lane.get((v.current_road_id, v.current_lane), [])
            leader: Optional[VehicleState] = None
            for other in same_lane_vehs:
                if other.distance_along_road_m > v.distance_along_road_m:
                    leader = other
                    break  # closest ahead

            # Check signal at end of road
            dist_to_end = max(0.0, road.length_m - v.distance_along_road_m)
            intersection_signals = self.signal_states.get(road.target_id, {})
            signal_color = intersection_signals.get(road.id, "GREEN")

            # Acceleration from IDM
            accel = 0.0

            if leader is not None:
                s_leader = max(0.5, leader.distance_along_road_m - v.distance_along_road_m - leader.profile.length_m)
                dv_leader = v.speed_ms - leader.speed_ms
                accel_leader = self._compute_idm_acceleration(
                    v.speed_ms, v0, s_leader, dv_leader,
                    v.profile.max_accel_ms2, v.profile.comf_decel_ms2,
                    v.profile.min_gap_s0, v.profile.time_headway_T
                )
            else:
                accel_leader = v.profile.max_accel_ms2 * (1.0 - (v.speed_ms / max(1.0, v0)) ** 4.0)

            # Red or Yellow light acts as a virtual obstacle at the stop line
            accel_signal = accel_leader
            if signal_color in ["RED", "YELLOW"] and dist_to_end < 60.0:
                s_stop = max(0.5, dist_to_end - 2.0)
                dv_stop = v.speed_ms  # relative to stationary stop line (v=0)
                accel_signal = self._compute_idm_acceleration(
                    v.speed_ms, v0, s_stop, dv_stop,
                    v.profile.max_accel_ms2, v.profile.comf_decel_ms2,
                    v.profile.min_gap_s0, v.profile.time_headway_T
                )

            # Pick the most restrictive acceleration
            v.acceleration_ms2 = min(accel_leader, accel_signal)

            # Update speed and position
            v.speed_ms = max(0.0, v.speed_ms + v.acceleration_ms2 * dt)
            v.distance_along_road_m += v.speed_ms * dt

            # Update waiting time
            if v.speed_ms < 1.0:
                v.wait_time_seconds += dt
                v.is_queued = True
            else:
                v.is_queued = False

            # Update 2D coordinates
            x, y, angle = road.compute_position(v.distance_along_road_m, v.current_lane)
            v.x = x
            v.y = y
            v.angle_rad = angle

            # Check if reached end of current road
            if v.distance_along_road_m >= road.length_m:
                # Transition to next road in route if available and signal permits
                if signal_color == "RED" and dist_to_end <= 0.0:
                    # Stopped at red
                    v.distance_along_road_m = road.length_m - 0.5
                    v.speed_ms = 0.0
                    continue

                # Transition to next road
                curr_idx = -1
                if v.current_road_id in v.route_road_ids:
                    curr_idx = v.route_road_ids.index(v.current_road_id)

                if curr_idx >= 0 and curr_idx + 1 < len(v.route_road_ids):
                    next_road_id = v.route_road_ids[curr_idx + 1]
                    next_road = self.roads.get(next_road_id)
                    if next_road and not next_road.is_closed:
                        v.current_road_id = next_road_id
                        v.distance_along_road_m = 0.0
                        v.current_lane = min(v.current_lane, next_road.lanes - 1)
                    else:
                        v.is_completed = True
                        self.completed_vehicles.append(v)
                        to_remove.append(v_id)
                else:
                    v.is_completed = True
                    self.completed_vehicles.append(v)
                    to_remove.append(v_id)

        for v_id in to_remove:
            self.vehicles.pop(v_id, None)

        # Snapshot capture for rendering
        if self.current_time - self.last_snapshot_time >= self.snapshot_interval:
            self.last_snapshot_time = self.current_time
            self._capture_snapshot()

        self.current_time += dt

    def _capture_snapshot(self):
        active_veh_list = []
        for v in self.vehicles.values():
            active_veh_list.append({
                "id": v.id,
                "type": v.vehicle_type,
                "x": round(v.x, 2),
                "y": round(v.y, 2),
                "angle": round(v.angle_rad, 3),
                "speed": round(v.speed_ms * 3.6, 1),  # km/h
                "color": v.profile.color_hex,
                "is_queued": v.is_queued,
                "road": v.current_road_id,
            })

        # Capture signal states
        signals_snap = {}
        for sig_id, sig in self.signals.items():
            intersection_id = sig.intersection_id
            signals_snap[intersection_id] = self.signal_states.get(intersection_id, {})

        snapshot = {
            "time": round(self.current_time, 1),
            "vehicles": active_veh_list,
            "signals": signals_snap,
            "active_count": len(active_veh_list),
            "completed_count": len(self.completed_vehicles),
        }
        self.snapshots.append(snapshot)

        # Time series record for charts
        queued_count = sum(1 for v in self.vehicles.values() if v.is_queued)
        avg_speed = (
            sum(v.speed_ms * 3.6 for v in self.vehicles.values()) / max(1, len(self.vehicles))
            if self.vehicles else 0.0
        )
        self.time_series_metrics.append({
            "time": round(self.current_time, 1),
            "active_vehicles": len(active_veh_list),
            "queued_vehicles": queued_count,
            "average_speed_kmh": round(avg_speed, 1),
            "completed_vehicles": len(self.completed_vehicles),
        })

    def run(self) -> Tuple[SimulationMetrics, List[Dict[str, Any]]]:
        """
        Executes the deterministic simulation from t=0 to duration.
        Returns calculated metrics and visualizer trajectory snapshots.
        """
        total_steps = int(self.duration / self.dt)
        for _ in range(total_steps):
            self._step()

        metrics = self._calculate_metrics()
        return metrics, self.snapshots

    def _calculate_metrics(self) -> SimulationMetrics:
        all_vehicles = list(self.vehicles.values()) + self.completed_vehicles
        total_gen = len(all_vehicles)
        total_proc = len(self.completed_vehicles)

        if all_vehicles:
            avg_wait = sum(v.wait_time_seconds for v in all_vehicles) / total_gen
            travel_times = [
                (self.current_time - v.spawn_time) for v in self.completed_vehicles
            ]
            avg_travel = sum(travel_times) / max(1, len(travel_times)) if travel_times else 0.0
            avg_speed = sum(v.speed_ms * 3.6 for v in all_vehicles) / total_gen
        else:
            avg_wait = 0.0
            avg_travel = 0.0
            avg_speed = 0.0

        # Queue analysis
        queue_lengths = [snap["active_count"] - sum(1 for v in snap["vehicles"] if not v["is_queued"]) for snap in self.snapshots]
        avg_queue = sum(queue_lengths) / max(1, len(queue_lengths)) if queue_lengths else 0.0
        max_queue = max(queue_lengths) if queue_lengths else 0

        # Throughput in vehicles per hour (VPH)
        throughput_vph = (total_proc / max(1.0, self.duration)) * 3600.0

        # Congestion percentage
        congestion_pct = 0.0
        if self.snapshots:
            congestion_samples = [
                (q / max(1, s["active_count"])) * 100.0
                for q, s in zip(queue_lengths, self.snapshots)
                if s["active_count"] > 0
            ]
            congestion_pct = sum(congestion_samples) / max(1, len(congestion_samples)) if congestion_samples else 0.0

        # Road utilization percentage (active road length vs total network capacity)
        total_capacity_length = sum(r.length_m * r.lanes for r in self.roads.values())
        avg_active_veh = sum(s["active_count"] for s in self.snapshots) / max(1, len(self.snapshots)) if self.snapshots else 0.0
        road_utilization_pct = min(100.0, (avg_active_veh * 8.0 / max(1.0, total_capacity_length)) * 100.0)

        # Signal efficiency score: 100 - penalties for queue delay and stopped time
        signal_penalty = min(90.0, avg_wait * 1.5 + (max_queue * 2.0))
        signal_efficiency = max(10.0, round(100.0 - signal_penalty, 1))

        # Metrics by road segment
        metrics_by_road: Dict[str, Dict[str, float]] = {}
        for r_id, road in self.roads.items():
            vehs_on_road = [v for v in all_vehicles if v.current_road_id == r_id]
            cnt = len(vehs_on_road)
            road_wait = sum(v.wait_time_seconds for v in vehs_on_road) / max(1, cnt) if cnt else 0.0
            road_spd = sum(v.speed_ms * 3.6 for v in vehs_on_road) / max(1, cnt) if cnt else road.speed_limit_ms * 3.6
            metrics_by_road[r_id] = {
                "vehicle_count": cnt,
                "average_wait_s": round(road_wait, 1),
                "average_speed_kmh": round(road_spd, 1),
                "is_closed": 1.0 if road.is_closed else 0.0,
            }

        return SimulationMetrics(
            total_vehicles_generated=total_gen,
            total_vehicles_processed=total_proc,
            average_waiting_time_seconds=round(avg_wait, 2),
            average_travel_time_seconds=round(avg_travel, 2),
            average_queue_length=round(avg_queue, 2),
            max_queue_length=int(max_queue),
            average_speed_kmh=round(avg_speed, 2),
            throughput_vph=round(throughput_vph, 1),
            congestion_percentage=round(congestion_pct, 1),
            road_utilization_percentage=round(road_utilization_pct, 1),
            signal_efficiency_score=signal_efficiency,
            metrics_by_road=metrics_by_road,
            time_series=self.time_series_metrics,
        )
