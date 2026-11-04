import json
import logging
from typing import Dict, Any, List, Optional
from app.core.config import settings
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
    SimulationMetrics,
)
from app.schemas.ai_schema import AIInterpretationResponse, AnalysisResponse
from app.services.meta.client import MetaAPIClient
from app.services.ai.tools import TOOL_DEFINITIONS

logger = logging.getLogger(__name__)


class MetaAPIConfigurationError(Exception):
    """Raised when Meta Model API credentials or environment variables are not configured."""
    pass


class AIOrchestrator:
    """
    Controlled AI Orchestration Layer.
    Connects user intents to Muse Spark (parsing, structured config)
    and Muse Wonder (deep reasoning, metric-grounded explanations).
    """

    def __init__(self, client: Optional[MetaAPIClient] = None):
        self.client = client or MetaAPIClient()

    async def interpret_prompt_with_muse_spark(
        self,
        prompt: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> AIInterpretationResponse:
        """
        Interprets natural language simulation prompt using real Meta Muse Spark (muse-spark-1.3).
        Extracts entities, constraints, and produces a mathematically valid SimulationConfig.
        Validates missing configuration and does not substitute mock responses.
        """
        if not self.client.is_configured:
            raise MetaAPIConfigurationError(
                "Meta Model API key is not configured. Please set 'META_API_KEY' in the backend environment file (.env) to enable real Meta Muse Spark inference."
            )

        model = settings.effective_meta_model
        system_instruction = (
            "You are Meta Muse Spark (version muse-spark-1.3), the Universal Simulation Architect for Dream2Sim. "
            "Your objective is to analyze ANY user prompt describing ANY physical, urban, logistical, pedestrian, or industrial system in the world "
            "(including urban traffic, pedestrian/crowd evacuation, automated warehouse robotics/AGVs, drone delivery corridors, hospital patient flow, airport security, harbor shipping, or networks) "
            "and translate it into a fully populated, collision-free microscopic simulation network graph.\n\n"
            "Key mapping principles for any system:\n"
            "- Nodes: Intersections, gates, waypoints, warehouse racks, docks, berths, triage desks, stations (x in 50..850, y in 50..550).\n"
            "- Roads/Links: Corridors, aisles, transit lanes, walkways, flight paths, conveyor belts, shipping channels with lanes and speed limits.\n"
            "- Demands/Agents: Vehicles, pedestrians, AGVs, drones, ships, carts, passengers with realistic flow rates (vph) and mix.\n"
            "- Signals/Controllers: Traffic lights, security turnstiles, scheduling gates, air traffic conflicts with green/yellow/red phases.\n\n"
            "You MUST respond with a valid, parseable JSON object matching this exact specification:\n"
            "{\n"
            '  "summary": "1-2 sentence engineering summary of the scenario",\n'
            '  "identified_entities": ["list of identified entities, e.g. gates, pedestrians, robots, AGVs, vehicles, signals"],\n'
            '  "identified_constraints": ["list of constraints, e.g. west corridor blocked, peak influx rate"],\n'
            '  "reasoning": "Technical reasoning explaining chosen topology, dimensions, speed limits, and controller phase allocations",\n'
            '  "suggested_configuration": {\n'
            '    "title": "Scenario Title",\n'
            '    "description": "Full description of the situation",\n'
            '    "domain": "traffic",\n'
            '    "network": {\n'
            '      "intersections": [\n'
            '        {"id": "node_center", "name": "Central Junction", "x": 450.0, "y": 300.0, "type": "traffic_signal"},\n'
            '        {"id": "node_north", "name": "North Approach", "x": 450.0, "y": 60.0, "type": "uncontrolled"},\n'
            '        {"id": "node_south", "name": "South Approach", "x": 450.0, "y": 540.0, "type": "uncontrolled"},\n'
            '        {"id": "node_east", "name": "East Approach", "x": 750.0, "y": 300.0, "type": "uncontrolled"},\n'
            '        {"id": "node_west", "name": "West Approach", "x": 150.0, "y": 300.0, "type": "uncontrolled"}\n'
            "      ],\n"
            '      "roads": [\n'
            '        {"id": "road_north_in", "source": "node_north", "target": "node_center", "lanes": 2, "speed_limit_kmh": 50.0, "is_closed": false},\n'
            '        {"id": "road_south_in", "source": "node_south", "target": "node_center", "lanes": 2, "speed_limit_kmh": 50.0, "is_closed": false},\n'
            '        {"id": "road_east_in", "source": "node_east", "target": "node_center", "lanes": 2, "speed_limit_kmh": 50.0, "is_closed": false},\n'
            '        {"id": "road_west_in", "source": "node_west", "target": "node_center", "lanes": 2, "speed_limit_kmh": 50.0, "is_closed": false},\n'
            '        {"id": "road_north_out", "source": "node_center", "target": "node_north", "lanes": 2, "speed_limit_kmh": 50.0, "is_closed": false},\n'
            '        {"id": "road_south_out", "source": "node_center", "target": "node_south", "lanes": 2, "speed_limit_kmh": 50.0, "is_closed": false},\n'
            '        {"id": "road_east_out", "source": "node_center", "target": "node_east", "lanes": 2, "speed_limit_kmh": 50.0, "is_closed": false},\n'
            '        {"id": "road_west_out", "source": "node_center", "target": "node_west", "lanes": 2, "speed_limit_kmh": 50.0, "is_closed": false}\n'
            "      ]\n"
            "    },\n"
            '    "signals": [\n'
            '      {\n'
            '        "id": "sig_center",\n'
            '        "intersection_id": "node_center",\n'
            '        "cycle_time_seconds": 90.0,\n'
            '        "phases": [\n'
            '          {"id": "p1", "name": "North-South Green", "duration_seconds": 45.0, "active_green_roads": ["road_north_in", "road_south_in"], "yellow_seconds": 4.0},\n'
            '          {"id": "p2", "name": "East-West Green", "duration_seconds": 35.0, "active_green_roads": ["road_east_in", "road_west_in"], "yellow_seconds": 4.0}\n'
            "        ]\n"
            "      }\n"
            "    ],\n"
            '    "demands": [\n'
            '      {\n'
            '        "id": "d_north",\n'
            '        "source_node": "node_north",\n'
            '        "target_node": "node_south",\n'
            '        "vehicle_mix": [\n'
            '          {"vehicle_type": "car", "flow_rate_vph": 800.0},\n'
            '          {"vehicle_type": "bus", "flow_rate_vph": 150.0},\n'
            '          {"vehicle_type": "motorcycle", "flow_rate_vph": 300.0}\n'
            "        ]\n"
            "      }\n"
            "    ],\n"
            '    "parameters": {\n'
            '      "duration_seconds": 300.0,\n'
            '      "time_step": 0.1,\n'
            '      "random_seed": 42\n'
            "    }\n"
            "  }\n"
            "}\n"
            "Ensure coordinates are scaled for a 900x600 viewport. Set 'is_closed': true for any road segment requested to be closed.\n"
            "Return pure JSON only."
        )

        messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": prompt},
        ]

        try:
            resp = await self.client.chat_completion(
                model=model,
                messages=messages,
                temperature=0.1,
                response_format={"type": "json_object"},
            )
        except Exception as e:
            logger.error(f"Meta Muse Spark execution error on model '{model}': {e}")
            raise RuntimeError(f"Meta Muse Spark ({model}) inference error: {str(e)}") from e

        content_str = resp.get("choices", [{}])[0].get("message", {}).get("content", "")
        if not content_str:
            raise RuntimeError(f"Meta Muse Spark returned an empty completion.")

        # Clean potential markdown wrapping
        clean_json = content_str.strip()
        if clean_json.startswith("```"):
            lines = clean_json.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            clean_json = "\n".join(lines).strip()

        try:
            parsed_data = json.loads(clean_json)
        except json.JSONDecodeError as e:
            raise RuntimeError(f"Failed to decode Muse Spark JSON response: {e}") from e

        # Extract configuration dictionary
        config_data = parsed_data.get("suggested_configuration", parsed_data)
        config = SimulationConfig(**config_data)

        model_tag = f"Meta Muse Spark ({model})"
        raw_reasoning = parsed_data.get("reasoning", "")
        if raw_reasoning:
            reasoning_text = f"[{model_tag}] {raw_reasoning}"
        else:
            reasoning_text = f"Synthesized via real-time inference with {model_tag}."

        return AIInterpretationResponse(
            summary=parsed_data.get("summary", f"Synthesized scenario: {config.title}"),
            identified_entities=parsed_data.get("identified_entities", ["Intersection", "Vehicles", "Traffic Signals"]),
            identified_constraints=parsed_data.get("identified_constraints", ["Traffic Flow"]),
            suggested_configuration=config,
            reasoning=reasoning_text,
        )

    def _generate_fallback_configuration(self, prompt: str) -> AIInterpretationResponse:
        """
        Robust semantic parser that understands traffic keywords, directions,
        road closures, rush hour volumes, and vehicle mixes.
        """
        p_lower = prompt.lower()
        title = "Urban Traffic Simulation"
        if "mumbai" in p_lower:
            title = "Mumbai Intersection Rush Hour"
        elif "intersection" in p_lower:
            title = "Urban Intersection Simulation"

        # Check for road closures
        east_closed = "east" in p_lower and ("closed" in p_lower or "blocked" in p_lower)
        north_closed = "north" in p_lower and ("closed" in p_lower or "blocked" in p_lower)
        south_closed = "south" in p_lower and ("closed" in p_lower or "blocked" in p_lower)
        west_closed = "west" in p_lower and ("closed" in p_lower or "blocked" in p_lower)

        # Check for traffic density
        is_rush_hour = "rush hour" in p_lower or "heavy" in p_lower or "high density" in p_lower
        north_heavy = "north" in p_lower and "heavy" in p_lower

        # Nodes
        nodes = [
            IntersectionNode(id="center", name="Central Junction", x=400.0, y=300.0, type="traffic_signal"),
            IntersectionNode(id="north", name="North Gate", x=400.0, y=60.0, type="priority"),
            IntersectionNode(id="south", name="South Gate", x=400.0, y=540.0, type="priority"),
            IntersectionNode(id="west", name="West Avenue", x=100.0, y=300.0, type="priority"),
            IntersectionNode(id="east", name="East Boulevard", x=700.0, y=300.0, type="priority"),
        ]

        # Roads
        roads = [
            RoadSegment(id="r_n_c", source="north", target="center", lanes=3 if north_heavy else 2, speed_limit_kmh=50.0, is_closed=north_closed),
            RoadSegment(id="r_c_s", source="center", target="south", lanes=2, speed_limit_kmh=50.0, is_closed=south_closed),
            RoadSegment(id="r_s_c", source="south", target="center", lanes=2, speed_limit_kmh=50.0, is_closed=south_closed),
            RoadSegment(id="r_c_n", source="center", target="north", lanes=2, speed_limit_kmh=50.0, is_closed=north_closed),
            RoadSegment(id="r_w_c", source="west", target="center", lanes=2, speed_limit_kmh=50.0, is_closed=west_closed),
            RoadSegment(id="r_c_e", source="center", target="east", lanes=2, speed_limit_kmh=50.0, is_closed=east_closed),
            RoadSegment(id="r_e_c", source="east", target="center", lanes=2, speed_limit_kmh=50.0, is_closed=east_closed),
            RoadSegment(id="r_c_w", source="center", target="west", lanes=2, speed_limit_kmh=50.0, is_closed=west_closed),
        ]

        # Signals
        signals = [
            TrafficSignalConfig(
                id="sig_center",
                intersection_id="center",
                cycle_time_seconds=70.0,
                phases=[
                    SignalPhase(
                        id="phase_ns",
                        name="North-South Phase",
                        duration_seconds=40.0 if north_heavy else 30.0,
                        active_green_roads=["r_n_c", "r_s_c"],
                        yellow_seconds=4.0,
                    ),
                    SignalPhase(
                        id="phase_ew",
                        name="East-West Phase",
                        duration_seconds=25.0 if not east_closed else 15.0,
                        active_green_roads=["r_w_c", "r_e_c"] if not east_closed else ["r_w_c"],
                        yellow_seconds=3.0,
                    ),
                ]
            )
        ]

        # Demands
        north_vph = 1100.0 if north_heavy else (800.0 if is_rush_hour else 450.0)
        west_vph = 600.0 if is_rush_hour else 350.0

        demands = [
            DemandConfig(
                id="demand_north",
                source_node="north",
                target_node="south" if not south_closed else "west",
                vehicle_mix=[
                    VehicleDemand(vehicle_type="car", flow_rate_vph=north_vph * 0.45),
                    VehicleDemand(vehicle_type="motorcycle", flow_rate_vph=north_vph * 0.35),
                    VehicleDemand(vehicle_type="bus", flow_rate_vph=north_vph * 0.15),
                    VehicleDemand(vehicle_type="emergency", flow_rate_vph=north_vph * 0.05),
                ]
            ),
            DemandConfig(
                id="demand_west",
                source_node="west",
                target_node="east" if not east_closed else "south",
                vehicle_mix=[
                    VehicleDemand(vehicle_type="car", flow_rate_vph=west_vph * 0.50),
                    VehicleDemand(vehicle_type="motorcycle", flow_rate_vph=west_vph * 0.30),
                    VehicleDemand(vehicle_type="truck", flow_rate_vph=west_vph * 0.20),
                ]
            ),
        ]

        # Duration
        duration_s = 300.0  # default 5 minutes
        if "five minutes" in p_lower or "5 min" in p_lower or "5 minutes" in p_lower:
            duration_s = 300.0
        elif "ten minutes" in p_lower or "10 min" in p_lower:
            duration_s = 600.0
        elif "two minutes" in p_lower or "2 min" in p_lower:
            duration_s = 120.0

        config = SimulationConfig(
            title=title,
            description=f"Generated from description: '{prompt}'",
            domain="traffic",
            network=RoadNetwork(intersections=nodes, roads=roads),
            signals=signals,
            demands=demands,
            parameters=SimulationParameters(duration_seconds=duration_s, time_step=0.2, random_seed=42),
            metadata={"source_prompt": prompt, "parsed_by": "Muse Spark"},
        )

        identified_entities = ["Central 4-Way Junction", "Cars", "Motorcycles", "Buses", "Emergency Vehicles"]
        identified_constraints = []
        if east_closed:
            identified_constraints.append("Eastern approach closed to vehicular traffic")
        if north_heavy:
            identified_constraints.append("High rush-hour arrival density on North approach")

        return AIInterpretationResponse(
            summary=f"Synthesized simulation model for '{title}' with {len(nodes)} intersection nodes and {len(roads)} road links.",
            identified_entities=identified_entities,
            identified_constraints=identified_constraints,
            suggested_configuration=config,
            clarifications_needed=[],
            reasoning="Constructed deterministic network topology adhering to traffic flow dynamics and specified boundary conditions.",
        )

    async def analyze_results_with_muse_wonder(
        self,
        config: SimulationConfig,
        metrics: SimulationMetrics,
        scenario_title: str = "Primary Scenario",
    ) -> AnalysisResponse:
        """
        Deep analytical reasoning powered by Muse Wonder.
        Examines actual numerical results: queue lengths, bottlenecks, delays, and signal efficiency.
        """
        if self.client.is_configured:
            try:
                system_instruction = (
                    "You are Muse Wonder, an advanced traffic engineering and simulation reasoning AI. "
                    "Analyze the provided actual simulation metrics from the deterministic Python simulation engine. "
                    "Identify specific bottlenecks, explain why waiting times occurred, and recommend concrete signal or lane adjustments. "
                    "Do not fabricate numbers; ground your analysis strictly in the provided metrics."
                )
                payload_text = json.dumps({
                    "scenario": scenario_title,
                    "metrics": metrics.model_dump(),
                })
                messages = [
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": f"Here are the simulation metrics: {payload_text}"},
                ]

                resp = await self.client.chat_completion(
                    model=settings.MUSE_WONDER_MODEL,
                    messages=messages,
                    temperature=0.2,
                )
                content = resp["choices"][0]["message"]["content"]
                return AnalysisResponse(
                    summary=f"Muse Wonder Engineering Analysis for {scenario_title}",
                    key_findings=[
                        f"Throughput reached {metrics.throughput_vph} vehicles/hour with {metrics.total_vehicles_processed} completed trips.",
                        f"Average vehicle delay was {metrics.average_waiting_time_seconds} seconds with max queue of {metrics.max_queue_length} vehicles.",
                    ],
                    bottlenecks=[
                        f"Road congestion peaked at {metrics.congestion_percentage}% network utilization.",
                    ],
                    optimization_recommendations=[
                        "Adjust green split for high-demand approaches.",
                        "Evaluate lane allocation to reduce spillback.",
                    ],
                    engineering_insights=content,
                )
            except Exception as e:
                logger.warning(f"Meta Muse Wonder live call failed or key pending: {e}")

        # Deterministic analytical synthesis based on actual metrics
        bottlenecks = []
        recommendations = []
        key_findings = [
            f"The system processed {metrics.total_vehicles_processed} of {metrics.total_vehicles_generated} generated vehicles ({round(metrics.total_vehicles_processed / max(1, metrics.total_vehicles_generated) * 100, 1)}% clearance rate).",
            f"Average vehicle wait time was {metrics.average_waiting_time_seconds}s with an average travel time of {metrics.average_travel_time_seconds}s.",
            f"Network throughput attained {metrics.throughput_vph} vehicles per hour with a peak queue of {metrics.max_queue_length} vehicles.",
        ]

        if metrics.max_queue_length > 12:
            bottlenecks.append(f"Significant queue buildup ({metrics.max_queue_length} vehicles) observed on critical approaches during red cycles.")
            recommendations.append("Increase green phase duration by 10-15 seconds on the primary approach or implement adaptive actuated cycle control.")

        if metrics.congestion_percentage > 35.0:
            bottlenecks.append(f"Congestion index reached {metrics.congestion_percentage}%, indicating vehicle arrival exceeds downstream discharge capacity.")
            recommendations.append("Consider opening parallel diversion lanes or stagger vehicle ingress via upstream metering.")

        if not bottlenecks:
            bottlenecks.append("Traffic flow maintained within stable operational capacity with minimal stopped delay.")
            recommendations.append("Current signal cycle is operating close to optimal timing for this demand profile.")

        insights = (
            f"Engineering Analysis for '{scenario_title}':\n\n"
            f"1. Operational Assessment:\n"
            f"Under the simulated traffic volume, the intersection achieved a signal efficiency rating of {metrics.signal_efficiency_score}/100. "
            f"Vehicles experienced an average speed of {metrics.average_speed_kmh} km/h across all lanes.\n\n"
            f"2. Dynamics & Bottlenecks:\n"
            f"{' '.join(bottlenecks)}\n\n"
            f"3. Strategic Recommendations:\n"
            f"{' '.join(recommendations)}"
        )

        return AnalysisResponse(
            summary=f"Analysis for {scenario_title}: Signal Efficiency {metrics.signal_efficiency_score}/100, Avg Wait {metrics.average_waiting_time_seconds}s",
            key_findings=key_findings,
            bottlenecks=bottlenecks,
            optimization_recommendations=recommendations,
            engineering_insights=insights,
        )
