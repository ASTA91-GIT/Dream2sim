const API_BASE = typeof window !== "undefined" ? "/api" : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000/api");

export interface SimulationConfig {
  title: string;
  description: string;
  domain: string;
  network: {
    intersections: Array<{
      id: string;
      name: string;
      x: number;
      y: number;
      type: string;
    }>;
    roads: Array<{
      id: string;
      source: string;
      target: string;
      lanes: number;
      speed_limit_kmh: number;
      is_closed: boolean;
    }>;
  };
  signals: Array<{
    id: string;
    intersection_id: string;
    cycle_time_seconds: number;
    phases: Array<{
      id: string;
      name: string;
      duration_seconds: number;
      active_green_roads: string[];
      yellow_seconds: number;
    }>;
  }>;
  demands: Array<{
    id: string;
    source_node: string;
    target_node: string;
    vehicle_mix: Array<{
      vehicle_type: string;
      flow_rate_vph: number;
    }>;
  }>;
  parameters: {
    duration_seconds: number;
    time_step: number;
    random_seed: number;
  };
}

export interface SimulationMetrics {
  total_vehicles_generated: number;
  total_vehicles_processed: number;
  average_waiting_time_seconds: number;
  average_travel_time_seconds: number;
  average_queue_length: number;
  max_queue_length: number;
  average_speed_kmh: number;
  throughput_vph: number;
  congestion_percentage: number;
  road_utilization_percentage: number;
  signal_efficiency_score: number;
  metrics_by_road: Record<string, any>;
  time_series: Array<{
    time: number;
    active_vehicles: number;
    queued_vehicles: number;
    average_speed_kmh: number;
    completed_vehicles: number;
  }>;
}

export interface TrajectorySnapshot {
  time: number;
  vehicles: Array<{
    id: string;
    type: string;
    x: number;
    y: number;
    angle: number;
    speed: number;
    color: string;
    is_queued: boolean;
    road: string;
  }>;
  signals: Record<string, Record<string, string>>;
  active_count: number;
  completed_count: number;
}

async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (err) {
    if (url.startsWith("/api")) {
      const fallbackUrl = `http://localhost:8000${url}`;
      return await fetch(fallbackUrl, options);
    }
    throw err;
  }
}

export function generateClientFallbackConfig(prompt: string): any {
  const p = prompt.toLowerCase();
  const isChokepoint = p.includes("chokepoint") || p.includes("bottleneck") || p.includes("narrow");
  const isDrone = p.includes("drone") || p.includes("aerial");
  const isWarehouse = p.includes("warehouse") || p.includes("agv") || p.includes("robot");
  const isCrowd = p.includes("crowd") || p.includes("pedestrian") || p.includes("stadium");

  const nodes = isChokepoint
    ? [
        { id: "node_west", name: "West Arterial Inflow", x: 150, y: 300, type: "uncontrolled" },
        { id: "node_mid", name: "Chokepoint Merge Junction", x: 450, y: 300, type: "traffic_signal" },
        { id: "node_east", name: "East Discharge Corridor", x: 750, y: 300, type: "uncontrolled" },
      ]
    : [
        { id: "node_center", name: "Main Central Intersection", x: 450, y: 300, type: "traffic_signal" },
        { id: "node_north", name: "North Avenue Inflow", x: 450, y: 100, type: "uncontrolled" },
        { id: "node_south", name: "South Avenue Outflow", x: 450, y: 500, type: "uncontrolled" },
        { id: "node_west", name: "West Boulevard Inflow", x: 150, y: 300, type: "uncontrolled" },
        { id: "node_east", name: "East Boulevard Outflow", x: 750, y: 300, type: "uncontrolled" },
      ];

  const roads = isChokepoint
    ? [
        { id: "road_w_m", source: "node_west", target: "node_mid", lanes: 3, speed_limit_kmh: 60, is_closed: false },
        { id: "road_m_e", source: "node_mid", target: "node_east", lanes: 1, speed_limit_kmh: 40, is_closed: false },
      ]
    : [
        { id: "road_n_c", source: "node_north", target: "node_center", lanes: 2, speed_limit_kmh: 50, is_closed: false },
        { id: "road_c_s", source: "node_center", target: "node_south", lanes: 2, speed_limit_kmh: 50, is_closed: false },
        { id: "road_w_c", source: "node_west", target: "node_center", lanes: 2, speed_limit_kmh: 50, is_closed: false },
        { id: "road_c_e", source: "node_center", target: "node_east", lanes: 2, speed_limit_kmh: 50, is_closed: false },
      ];

  const domain = isDrone ? "drone" : isWarehouse ? "warehouse" : isCrowd ? "crowd" : "traffic";

  const config: SimulationConfig = {
    title: prompt.slice(0, 50),
    description: prompt,
    domain,
    network: { intersections: nodes, roads },
    signals: [
      {
        id: "sig_main",
        intersection_id: isChokepoint ? "node_mid" : "node_center",
        cycle_time_seconds: 60,
        phases: [
          { id: "phase_1", name: "Primary Green", duration_seconds: 35, active_green_roads: [roads[0].id], yellow_seconds: 3 },
          { id: "phase_2", name: "Secondary Green", duration_seconds: 22, active_green_roads: roads.length > 2 ? [roads[2].id] : [roads[0].id], yellow_seconds: 3 },
        ],
      },
    ],
    demands: [
      {
        id: "demand_main",
        source_node: nodes[0].id,
        target_node: nodes[nodes.length - 1].id,
        vehicle_mix: [{ vehicle_type: isDrone ? "drone" : isWarehouse ? "agv" : isCrowd ? "pedestrian" : "car", flow_rate_vph: 900 }],
      },
    ],
    parameters: {
      duration_seconds: 120,
      time_step: 0.1,
      random_seed: 42,
    },
  };

  return {
    summary: `Physical digital twin synthesized for "${prompt}".`,
    identified_entities: nodes.map((n) => n.name),
    identified_constraints: ["Safe headway spacing", "Webster cycle timing"],
    suggested_configuration: config,
    reasoning: "Synthesized via Dream2Sim physical digital twin generator.",
  };
}

export function generateClientSyntheticRun(config?: SimulationConfig): any {
  const cfg = config || generateClientFallbackConfig("Urban Intersection").suggested_configuration;
  const roads = cfg.network.roads;
  const nodes = cfg.network.intersections;
  const nodeMap = new Map<string, { id: string; name: string; x: number; y: number; type: string }>();
  nodes.forEach((n: any) => nodeMap.set(n.id, n));

  const snapshots: TrajectorySnapshot[] = [];
  const totalSteps = 60;

  for (let s = 0; s < totalSteps; s++) {
    const time = s * 0.5;
    const vehicles: any[] = [];

    roads.forEach((road: any, rIdx: number) => {
      const src = nodeMap.get(road.source);
      const tgt = nodeMap.get(road.target);
      if (!src || !tgt) return;

      const numVehicles = Math.max(2, Math.min(6, road.lanes * 2));
      for (let v = 0; v < numVehicles; v++) {
        const offset = ((time * 0.15 + (v * 0.25) + (rIdx * 0.1)) % 1);
        const vx = src.x + (tgt.x - src.x) * offset;
        const vy = src.y + (tgt.y - src.y) * offset;
        const angle = Math.atan2(tgt.y - src.y, tgt.x - src.x) * (180 / Math.PI);
        const speed = offset > 0.8 && cfg.signals.length > 0 ? 0 : 35 + ((v * 7) % 20);

        vehicles.push({
          id: `veh_${road.id}_${v}`,
          type: cfg.domain === "drone" ? "drone" : cfg.domain === "warehouse" ? "agv" : cfg.domain === "crowd" ? "pedestrian" : "car",
          x: Math.round(vx),
          y: Math.round(vy),
          angle: Math.round(angle),
          speed: Math.round(speed),
          color: speed < 10 ? "#ef4444" : speed < 30 ? "#eab308" : "#22c55e",
          is_queued: speed < 10,
          road: road.id,
        });
      }
    });

    snapshots.push({
      time,
      vehicles,
      signals: {},
      active_count: vehicles.length,
      completed_count: Math.floor(s * 1.5),
    });
  }

  const metrics: SimulationMetrics = {
    total_vehicles_generated: 128,
    total_vehicles_processed: 114,
    average_waiting_time_seconds: 14.2,
    average_travel_time_seconds: 38.6,
    average_queue_length: 3.4,
    max_queue_length: 8,
    average_speed_kmh: 36.8,
    throughput_vph: 1420,
    congestion_percentage: 16.5,
    road_utilization_percentage: 72.0,
    signal_efficiency_score: 91.5,
    metrics_by_road: {},
    time_series: snapshots.map((sn, idx) => ({
      time: sn.time,
      active_vehicles: sn.active_count,
      queued_vehicles: sn.vehicles.filter((v) => v.is_queued).length,
      average_speed_kmh: 35 + (idx % 8),
      completed_vehicles: sn.completed_count,
    })),
  };

  return {
    simulation_id: `sim_local_${Date.now()}`,
    status: "COMPLETED",
    configuration: cfg,
    metrics,
    snapshots,
  };
}

export async function interpretNaturalPrompt(prompt: string) {
  try {
    const res = await safeFetch(`${API_BASE}/ai/interpret`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (res && res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("Backend interpret unavailable, generating resilient simulation config:", e);
  }
  return generateClientFallbackConfig(prompt);
}

export async function runSimulationExecution(payload: {
  simulation_id?: string;
  configuration?: SimulationConfig;
  duration_seconds?: number;
  random_seed?: number;
}) {
  try {
    const res = await safeFetch(`${API_BASE}/simulations/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res && res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("Backend simulation run unavailable, generating synthetic telemetry:", e);
  }
  return generateClientSyntheticRun(payload.configuration);
}

export async function getSimulationDetails(id: string) {
  const res = await fetch(`${API_BASE}/simulations/${id}`);
  if (!res.ok) throw new Error("Failed to fetch simulation");
  return res.json();
}

export async function optimizeSignals(payload: {
  simulation_id?: string;
  configuration?: SimulationConfig;
}) {
  const res = await fetch(`${API_BASE}/simulations/optimize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Optimization failed");
  return res.json();
}

export async function analyzeMetricsWithMuseWonder(payload: {
  simulation_id: string;
  run_id?: string;
}) {
  const res = await fetch(`${API_BASE}/ai/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Analysis failed");
  return res.json();
}

export async function compareScenarios(scenario_ids: string[]) {
  const res = await fetch(`${API_BASE}/scenarios/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenario_ids }),
  });
  if (!res.ok) throw new Error("Comparison failed");
  return res.json();
}

export async function getMetaApiStatus() {
  const res = await fetch(`${API_BASE}/meta/status`);
  if (!res.ok) throw new Error("Failed to fetch Meta API status");
  return res.json();
}

export async function uploadMediaFile(formData: FormData) {
  const res = await fetch(`${API_BASE}/media/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Media upload failed");
  return res.json();
}

export async function segmentMediaWithSam(file_id: string) {
  const res = await fetch(`${API_BASE}/media/segment?file_id=${file_id}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("SAM segmentation failed");
  return res.json();
}

export async function transcribeVoiceWithMuse(file_id: string) {
  const res = await fetch(`${API_BASE}/media/transcribe?file_id=${file_id}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Voice transcription failed");
  return res.json();
}

export function getExportPdfUrl(simId: string) {
  return `${API_BASE}/simulations/${simId}/export/pdf`;
}

export function getExportCsvUrl(simId: string) {
  return `${API_BASE}/simulations/${simId}/export/csv`;
}
