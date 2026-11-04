import copy
from typing import Dict, Any, List, Tuple, Optional
from app.schemas.simulation_schema import SimulationConfig, SimulationMetrics
from app.simulation.engine import SimulationEngine


class SignalOptimizer:
    """
    Evaluates alternative signal phase splits using actual simulation runs
    to find the timing configuration that minimizes average waiting time and queue length.
    """

    def __init__(self, base_config: SimulationConfig):
        self.base_config = base_config

    def optimize_cycle(
        self,
        candidate_splits: Optional[List[Tuple[float, float]]] = None,
        test_duration_seconds: float = 120.0,
    ) -> Dict[str, Any]:
        """
        Tests multiple signal phase timings against actual simulation executions.
        """
        if not self.base_config.signals or not self.base_config.signals[0].phases:
            return {"status": "no_signals_to_optimize", "trials": []}

        if candidate_splits is None:
            # Test different phase splits (Phase 1 s, Phase 2 s)
            candidate_splits = [
                (20.0, 40.0),
                (30.0, 30.0),
                (45.0, 25.0),
                (55.0, 20.0),
                (60.0, 15.0),
            ]

        trials: List[Dict[str, Any]] = []
        best_score = float("inf")
        best_config: Optional[SimulationConfig] = None
        best_metrics: Optional[SimulationMetrics] = None
        best_split: Tuple[float, float] = (30.0, 30.0)

        for p1_time, p2_time in candidate_splits:
            cfg = copy.deepcopy(self.base_config)
            cfg.parameters.duration_seconds = test_duration_seconds

            if len(cfg.signals[0].phases) >= 2:
                cfg.signals[0].phases[0].duration_seconds = p1_time
                cfg.signals[0].phases[1].duration_seconds = p2_time
            elif len(cfg.signals[0].phases) == 1:
                cfg.signals[0].phases[0].duration_seconds = p1_time

            engine = SimulationEngine(cfg)
            metrics, _ = engine.run()

            # Objective: minimize wait time + penalty for max queue length
            score = metrics.average_waiting_time_seconds + (metrics.max_queue_length * 0.5)

            trial_result = {
                "split": {"phase_1_seconds": p1_time, "phase_2_seconds": p2_time},
                "average_wait_seconds": metrics.average_waiting_time_seconds,
                "max_queue_length": metrics.max_queue_length,
                "throughput_vph": metrics.throughput_vph,
                "congestion_percentage": metrics.congestion_percentage,
                "objective_score": round(score, 2),
            }
            trials.append(trial_result)

            if score < best_score:
                best_score = score
                best_config = cfg
                best_metrics = metrics
                best_split = (p1_time, p2_time)

        # Baseline evaluation
        baseline_engine = SimulationEngine(self.base_config)
        baseline_metrics, _ = baseline_engine.run()

        wait_reduction = max(
            0.0,
            round(
                (baseline_metrics.average_waiting_time_seconds - (best_metrics.average_waiting_time_seconds if best_metrics else 0.0)),
                2
            )
        )

        return {
            "best_split": {"phase_1_seconds": best_split[0], "phase_2_seconds": best_split[1]},
            "trials": trials,
            "wait_time_reduction_seconds": wait_reduction,
            "optimized_config": best_config.model_dump() if best_config else None,
            "optimized_metrics": best_metrics.model_dump() if best_metrics else None,
        }
