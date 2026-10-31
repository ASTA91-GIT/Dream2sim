import pytest
import json
from unittest.mock import patch, AsyncMock
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings
from app.api.endpoints.ai import orchestrator

SAMPLE_MUSE_SPARK_RESPONSE = {
    "choices": [
        {
            "message": {
                "content": json.dumps({
                    "summary": "Synthesized Mumbai Worli 4-Way Junction via Muse Spark 1.3",
                    "identified_entities": ["4-way intersection", "cars", "buses", "motorcycles", "traffic signals"],
                    "identified_constraints": ["eastern road closed", "heavy north ingress"],
                    "reasoning": "Constructed 4-way intersection with closed eastern arterial and 90s dual-phase cycle.",
                    "suggested_configuration": {
                        "title": "Mumbai 4-Way Intersection",
                        "description": "Rush hour scenario with eastern road closed.",
                        "domain": "traffic",
                        "network": {
                            "intersections": [
                                {"id": "node_center", "name": "Central Junction", "x": 450.0, "y": 300.0, "type": "traffic_signal"},
                                {"id": "node_north", "name": "North Approach", "x": 450.0, "y": 60.0, "type": "uncontrolled"},
                                {"id": "node_south", "name": "South Approach", "x": 450.0, "y": 540.0, "type": "uncontrolled"},
                                {"id": "node_east", "name": "East Approach", "x": 750.0, "y": 300.0, "type": "uncontrolled"},
                                {"id": "node_west", "name": "West Approach", "x": 150.0, "y": 300.0, "type": "uncontrolled"}
                            ],
                            "roads": [
                                {"id": "road_north_in", "source": "node_north", "target": "node_center", "lanes": 2, "speed_limit_kmh": 50.0, "is_closed": False},
                                {"id": "road_south_in", "source": "node_south", "target": "node_center", "lanes": 2, "speed_limit_kmh": 50.0, "is_closed": False},
                                {"id": "road_east_in", "source": "node_east", "target": "node_center", "lanes": 2, "speed_limit_kmh": 50.0, "is_closed": True},
                                {"id": "road_west_in", "source": "node_west", "target": "node_center", "lanes": 2, "speed_limit_kmh": 50.0, "is_closed": False},
                                {"id": "road_north_out", "source": "node_center", "target": "node_north", "lanes": 2, "speed_limit_kmh": 50.0, "is_closed": False},
                                {"id": "road_south_out", "source": "node_center", "target": "node_south", "lanes": 2, "speed_limit_kmh": 50.0, "is_closed": False},
                                {"id": "road_east_out", "source": "node_center", "target": "node_east", "lanes": 2, "speed_limit_kmh": 50.0, "is_closed": True},
                                {"id": "road_west_out", "source": "node_center", "target": "node_west", "lanes": 2, "speed_limit_kmh": 50.0, "is_closed": False}
                            ]
                        },
                        "signals": [
                            {
                                "id": "sig_center",
                                "intersection_id": "node_center",
                                "cycle_time_seconds": 90.0,
                                "phases": [
                                    {"id": "p1", "name": "North-South Green", "duration_seconds": 45.0, "active_green_roads": ["road_north_in", "road_south_in"], "yellow_seconds": 4.0},
                                    {"id": "p2", "name": "East-West Green", "duration_seconds": 35.0, "active_green_roads": ["road_east_in", "road_west_in"], "yellow_seconds": 4.0}
                                ]
                            }
                        ],
                        "demands": [
                            {
                                "id": "d_north",
                                "source_node": "node_north",
                                "target_node": "node_south",
                                "vehicle_mix": [
                                    {"vehicle_type": "car", "flow_rate_vph": 800.0},
                                    {"vehicle_type": "bus", "flow_rate_vph": 150.0}
                                ]
                            }
                        ],
                        "parameters": {
                            "duration_seconds": 300.0,
                            "time_step": 0.1,
                            "random_seed": 42
                        }
                    }
                })
            }
        }
    ]
}


@pytest.mark.asyncio
async def test_health_check_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Dream2Sim"


@pytest.mark.asyncio
async def test_meta_status_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/meta/status")
    assert response.status_code == 200
    data = response.json()
    assert "configured" in data
    assert "models" in data
    assert data["models"]["primary_engine"] == "muse-spark-1.3"
    # Never expose raw API key in any response
    assert "LLM_" not in json.dumps(data)
    assert "key" not in data or data.get("key") is None


@pytest.mark.asyncio
async def test_ai_interpret_endpoint_validation_when_unconfigured():
    """Validates missing configuration returns clear HTTP 503 error without substituting mock responses."""
    transport = ASGITransport(app=app)
    with patch.object(orchestrator.client, "api_key", ""), \
         patch.object(settings, "META_API_KEY", None), \
         patch.object(settings, "MODEL_API_KEY", None):
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.post("/api/ai/interpret", json={"prompt": "Test scenario"})
        assert response.status_code == 503
        assert "META_API_KEY" in response.json()["detail"]


@pytest.mark.asyncio
async def test_ai_interpret_endpoint_with_muse_spark_mock():
    """Tests complete Muse Spark 1.3 JSON parsing and Pydantic validation offline without live network calls."""
    transport = ASGITransport(app=app)
    with patch.object(orchestrator.client, "api_key", "test_valid_meta_key"), \
         patch.object(orchestrator.client, "chat_completion", new_callable=AsyncMock, return_value=SAMPLE_MUSE_SPARK_RESPONSE):
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            payload = {
                "prompt": "Create a four-way intersection in Mumbai with heavy traffic on the north road and east road closed for five minutes."
            }
            response = await ac.post("/api/ai/interpret", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert "suggested_configuration" in data
    cfg = data["suggested_configuration"]
    assert len(cfg["network"]["intersections"]) == 5
    assert any(r["is_closed"] for r in cfg["network"]["roads"])
    assert "muse-spark-1.3" in data["reasoning"] or "Muse Spark" in data["reasoning"]


@pytest.mark.asyncio
async def test_simulation_run_endpoint():
    transport = ASGITransport(app=app)
    with patch.object(orchestrator.client, "api_key", "test_valid_meta_key"), \
         patch.object(orchestrator.client, "chat_completion", new_callable=AsyncMock, return_value=SAMPLE_MUSE_SPARK_RESPONSE):
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            interp = await ac.post("/api/ai/interpret", json={
                "prompt": "4-way intersection simulation for 30 seconds"
            })
            cfg = interp.json()["suggested_configuration"]
            cfg["parameters"]["duration_seconds"] = 30.0

            run_resp = await ac.post("/api/simulations/run", json={"configuration": cfg})

    assert run_resp.status_code == 200
    run_data = run_resp.json()
    assert "metrics" in run_data
    assert run_data["metrics"]["total_vehicles_generated"] > 0
    assert "snapshots" in run_data
    assert len(run_data["snapshots"]) > 0


@pytest.mark.asyncio
async def test_simulation_optimization_endpoint():
    transport = ASGITransport(app=app)
    with patch.object(orchestrator.client, "api_key", "test_valid_meta_key"), \
         patch.object(orchestrator.client, "chat_completion", new_callable=AsyncMock, return_value=SAMPLE_MUSE_SPARK_RESPONSE):
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            interp = await ac.post("/api/ai/interpret", json={
                "prompt": "Mumbai intersection optimize signals"
            })
            cfg = interp.json()["suggested_configuration"]
            opt_resp = await ac.post("/api/simulations/optimize", json={"configuration": cfg})

    assert opt_resp.status_code == 200
    opt_data = opt_resp.json()
    assert "best_split" in opt_data
    assert "trials" in opt_data
    assert len(opt_data["trials"]) > 0
