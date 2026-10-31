from typing import Dict, Any, List

TOOL_DEFINITIONS: List[Dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": "validate_simulation_config",
            "description": "Validates the road network connectivity, lane configurations, signal phases, and vehicle demand parameters.",
            "parameters": {
                "type": "object",
                "properties": {
                    "network_nodes_count": {"type": "integer"},
                    "network_roads_count": {"type": "integer"},
                    "signals_count": {"type": "integer"},
                    "total_flow_rate_vph": {"type": "number"},
                },
                "required": ["network_nodes_count", "network_roads_count"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "run_simulation",
            "description": "Triggers the Python deterministic simulation engine for the specified duration and returns calculated metrics and snapshots.",
            "parameters": {
                "type": "object",
                "properties": {
                    "simulation_id": {"type": "string"},
                    "duration_seconds": {"type": "number", "description": "Simulation duration (default 300s)"},
                    "random_seed": {"type": "integer", "description": "Random seed for determinism"},
                },
                "required": ["simulation_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "compare_scenarios",
            "description": "Compares numerical metrics between two or more scenarios (e.g. baseline vs optimized signal timings or road closure).",
            "parameters": {
                "type": "object",
                "properties": {
                    "baseline_scenario_id": {"type": "string"},
                    "target_scenario_id": {"type": "string"},
                },
                "required": ["baseline_scenario_id", "target_scenario_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "optimize_signal_timing",
            "description": "Runs multiple simulated signal timing splits to identify optimal green phase allocations that minimize average queue length.",
            "parameters": {
                "type": "object",
                "properties": {
                    "simulation_id": {"type": "string"},
                    "target_intersection_id": {"type": "string"},
                    "objective": {"type": "string", "enum": ["minimize_waiting_time", "maximize_throughput", "balanced"]},
                },
                "required": ["simulation_id", "target_intersection_id"],
            },
        },
    },
]
