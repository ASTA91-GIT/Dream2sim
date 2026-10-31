import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


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
    assert data["models"]["primary_engine"] == "muse-spark"


@pytest.mark.asyncio
async def test_ai_interpret_endpoint():
    transport = ASGITransport(app=app)
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


@pytest.mark.asyncio
async def test_simulation_run_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Interpret first
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
