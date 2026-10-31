"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as PIXI from "pixi.js";
import { SimulationConfig, TrajectorySnapshot } from "@/lib/api";

interface CanvasProps {
  config: SimulationConfig | null;
  snapshots: TrajectorySnapshot[];
  durationSeconds: number;
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  showHeatmap?: boolean;
  showVectors?: boolean;
  onTimeUpdate: (time: number) => void;
  onSelectVehicle?: (vehicle: any | null) => void;
}

export default function PixiSimulationCanvas({
  config,
  snapshots,
  durationSeconds,
  currentTime,
  isPlaying,
  playbackSpeed,
  showHeatmap = false,
  showVectors = false,
  onTimeUpdate,
  onSelectVehicle,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  // Pixi Container layers
  const worldContainerRef = useRef<PIXI.Container | null>(null);
  const gridLayerRef = useRef<PIXI.Graphics | null>(null);
  const roadLayerRef = useRef<PIXI.Graphics | null>(null);
  const signalLayerRef = useRef<PIXI.Graphics | null>(null);
  const heatmapLayerRef = useRef<PIXI.Graphics | null>(null);
  const vehicleLayerRef = useRef<PIXI.Container | null>(null);
  const overlayLayerRef = useRef<PIXI.Graphics | null>(null);

  // References for render loop
  const currentTimeRef = useRef<number>(currentTime);
  currentTimeRef.current = currentTime;

  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;

  const playbackSpeedRef = useRef<number>(playbackSpeed);
  playbackSpeedRef.current = playbackSpeed;

  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const selectedVehicleRef = useRef<any | null>(null);
  selectedVehicleRef.current = selectedVehicle;

  // Initialize Pixi Application
  useEffect(() => {
    let isCancelled = false;

    async function initPixi() {
      if (!containerRef.current) return;

      const width = containerRef.current.clientWidth || 900;
      const height = containerRef.current.clientHeight || 560;

      const app = new PIXI.Application();
      await app.init({
        width,
        height,
        backgroundColor: 0x090040,
        antialias: true,
        resolution: typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        autoDensity: true,
      });

      if (isCancelled) {
        app.destroy(true);
        return;
      }

      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(app.canvas);
      appRef.current = app;

      // World container that scales & centers network
      const worldContainer = new PIXI.Container();
      app.stage.addChild(worldContainer);
      worldContainerRef.current = worldContainer;

      // Layer ordering
      const gridLayer = new PIXI.Graphics();
      const roadLayer = new PIXI.Graphics();
      const heatmapLayer = new PIXI.Graphics();
      const signalLayer = new PIXI.Graphics();
      const vehicleLayer = new PIXI.Container();
      const overlayLayer = new PIXI.Graphics();

      worldContainer.addChild(gridLayer);
      worldContainer.addChild(roadLayer);
      worldContainer.addChild(heatmapLayer);
      worldContainer.addChild(signalLayer);
      worldContainer.addChild(vehicleLayer);
      worldContainer.addChild(overlayLayer);

      gridLayerRef.current = gridLayer;
      roadLayerRef.current = roadLayer;
      heatmapLayerRef.current = heatmapLayer;
      signalLayerRef.current = signalLayer;
      vehicleLayerRef.current = vehicleLayer;
      overlayLayerRef.current = overlayLayer;

      if (config) {
        fitAndDrawRoadNetwork(app, worldContainer, roadLayer, gridLayer, config);
      }
    }

    initPixi();

    // Resize listener
    const handleResize = () => {
      if (!appRef.current || !containerRef.current || !config || !worldContainerRef.current || !roadLayerRef.current || !gridLayerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (w > 0 && h > 0) {
        appRef.current.renderer.resize(w, h);
        fitAndDrawRoadNetwork(appRef.current, worldContainerRef.current, roadLayerRef.current, gridLayerRef.current, config);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      isCancelled = true;
      window.removeEventListener("resize", handleResize);
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, []);

  // Center and scale network to fit canvas
  const fitAndDrawRoadNetwork = (
    app: PIXI.Application,
    world: PIXI.Container,
    roadGraphics: PIXI.Graphics,
    gridGraphics: PIXI.Graphics,
    cfg: SimulationConfig
  ) => {
    if (!cfg.network || !cfg.network.intersections.length) return;

    const xs = cfg.network.intersections.map((n) => n.x);
    const ys = cfg.network.intersections.map((n) => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const netW = Math.max(100, maxX - minX);
    const netH = Math.max(100, maxY - minY);

    const padding = 70;
    const availW = Math.max(200, app.screen.width - padding * 2);
    const availH = Math.max(200, app.screen.height - padding * 2);

    const scale = Math.min(availW / netW, availH / netH, 1.25);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    world.scale.set(scale);
    world.position.set(
      app.screen.width / 2 - cx * scale,
      app.screen.height / 2 - cy * scale
    );

    // Draw background blueprint grid
    gridGraphics.clear();
    const gMinX = minX - 300;
    const gMaxX = maxX + 300;
    const gMinY = minY - 300;
    const gMaxY = maxY + 300;

    for (let x = gMinX; x <= gMaxX; x += 40) {
      gridGraphics.moveTo(x, gMinY);
      gridGraphics.lineTo(x, gMaxY);
    }
    for (let y = gMinY; y <= gMaxY; y += 40) {
      gridGraphics.moveTo(gMinX, y);
      gridGraphics.lineTo(gMaxX, y);
    }
    gridGraphics.stroke({ width: 0.8, color: 0xb13bff, alpha: 0.12 });

    // Draw Roads & Intersections
    drawRoadNetwork(roadGraphics, cfg);
  };

  // Redraw when config changes
  useEffect(() => {
    if (
      appRef.current &&
      worldContainerRef.current &&
      roadLayerRef.current &&
      gridLayerRef.current &&
      config
    ) {
      fitAndDrawRoadNetwork(
        appRef.current,
        worldContainerRef.current,
        roadLayerRef.current,
        gridLayerRef.current,
        config
      );
    }
  }, [config]);

  // Main playback animation loop
  useEffect(() => {
    let animFrame: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const deltaSec = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      if (isPlayingRef.current && snapshots.length > 0) {
        let nextTime = currentTimeRef.current + deltaSec * playbackSpeedRef.current;
        if (nextTime >= durationSeconds) {
          nextTime = 0; // Loop seamlessly
        }
        currentTimeRef.current = nextTime;
        onTimeUpdate(nextTime);
      }

      renderFrameAtTime(currentTimeRef.current);
      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [snapshots, durationSeconds, onTimeUpdate]);

  // Draw roads, lane dividers, zebra crossings, and closures
  const drawRoadNetwork = (graphics: PIXI.Graphics, cfg: SimulationConfig) => {
    graphics.clear();
    const nodeMap = new Map<string, { x: number; y: number; name: string }>();
    cfg.network.intersections.forEach((n) => {
      nodeMap.set(n.id, { x: n.x, y: n.y, name: n.name });
    });

    // 1. Draw Road Asphalt Links
    cfg.network.roads.forEach((road) => {
      const src = nodeMap.get(road.source);
      const tgt = nodeMap.get(road.target);
      if (!src || !tgt) return;

      const roadWidth = Math.max(32, road.lanes * 20);

      // Deep asphalt surface
      graphics.beginPath();
      graphics.moveTo(src.x, src.y);
      graphics.lineTo(tgt.x, tgt.y);
      const roadColor = road.is_closed ? 0x27191d : 0x18114c;
      graphics.stroke({ width: roadWidth, color: roadColor, cap: "round" });

      // Outer curbstones / edge borders
      graphics.beginPath();
      graphics.moveTo(src.x, src.y);
      graphics.lineTo(tgt.x, tgt.y);
      graphics.stroke({
        width: roadWidth + 2.5,
        color: road.is_closed ? 0xef4444 : 0x36316c,
        alpha: 0.6,
      });

      // Dashed lane dividers
      if (road.lanes > 1) {
        graphics.beginPath();
        graphics.moveTo(src.x, src.y);
        graphics.lineTo(tgt.x, tgt.y);
        graphics.stroke({
          width: 1.5,
          color: road.is_closed ? 0xef4444 : 0xd1c1d7,
          alpha: 0.5,
        });
      }

      // Zebra crossings near intersections
      const dx = tgt.x - src.x;
      const dy = tgt.y - src.y;
      const dist = Math.hypot(dx, dy) || 1;
      const nx = -dy / dist;
      const ny = dx / dist;

      // Draw crossing stripes near entrance
      if (dist > 80 && !road.is_closed) {
        const crossX = src.x + (dx / dist) * 35;
        const crossY = src.y + (dy / dist) * 35;
        const halfW = roadWidth / 2 - 3;

        for (let i = -halfW; i <= halfW; i += 7) {
          graphics.beginPath();
          graphics.moveTo(crossX + nx * i - (dx / dist) * 4, crossY + ny * i - (dy / dist) * 4);
          graphics.lineTo(crossX + nx * i + (dx / dist) * 4, crossY + ny * i + (dy / dist) * 4);
          graphics.stroke({ width: 3, color: 0xe4dfff, alpha: 0.35 });
        }
      }

      // Road Closure Warning Barrier
      if (road.is_closed) {
        const midX = (src.x + tgt.x) / 2;
        const midY = (src.y + tgt.y) / 2;

        // Barrier bar
        const bHalf = roadWidth / 2 + 4;
        graphics.beginPath();
        graphics.moveTo(midX + nx * bHalf, midY + ny * bHalf);
        graphics.lineTo(midX - nx * bHalf, midY - ny * bHalf);
        graphics.stroke({ width: 8, color: 0xf1c100 });

        // Hazard stripes
        for (let s = -bHalf; s <= bHalf; s += 8) {
          graphics.beginPath();
          graphics.moveTo(midX + nx * s - 3, midY + ny * s - 3);
          graphics.lineTo(midX + nx * (s + 4) + 3, midY + ny * (s + 4) + 3);
          graphics.stroke({ width: 3, color: 0x000000 });
        }

        // Flashing beacon circle
        graphics.circle(midX, midY, 9);
        graphics.fill({ color: 0xef4444, alpha: 0.95 });
        graphics.stroke({ width: 2, color: 0xffffff });
      }
    });

    // 2. Draw Intersection Junction Nodes
    cfg.network.intersections.forEach((node) => {
      // Junction apron
      graphics.circle(node.x, node.y, 28);
      graphics.fill({ color: 0x27215b, alpha: 0.95 });
      graphics.stroke({ width: 2, color: 0xe3b5ff, alpha: 0.5 });

      // Subtle center dot
      graphics.circle(node.x, node.y, 5);
      graphics.fill({ color: 0xf1c100, alpha: 0.9 });
    });
  };

  // Render moving vehicles & dynamic signals
  const renderFrameAtTime = useCallback(
    (time: number) => {
      if (
        !vehicleLayerRef.current ||
        !signalLayerRef.current ||
        !heatmapLayerRef.current ||
        snapshots.length === 0
      )
        return;

      const vContainer = vehicleLayerRef.current;
      const sGraphics = signalLayerRef.current;
      const hGraphics = heatmapLayerRef.current;

      // Find closest trajectory snapshot
      let closestIdx = 0;
      let minDiff = Infinity;
      for (let i = 0; i < snapshots.length; i++) {
        const diff = Math.abs(snapshots[i].time - time);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }

      const snap = snapshots[closestIdx];
      if (!snap) return;

      // 1. Dynamic Signal Lights
      sGraphics.clear();
      if (snap.signals && config) {
        Object.entries(snap.signals).forEach(([intersectionId, roadSignals]) => {
          const node = config.network.intersections.find((n) => n.id === intersectionId);
          if (!node) return;

          Object.entries(roadSignals).forEach(([roadId, state]) => {
            const road = config.network.roads.find((r) => r.id === roadId);
            if (!road) return;

            const src = config.network.intersections.find((n) => n.id === road.source);
            if (!src) return;

            const dx = src.x - node.x;
            const dy = src.y - node.y;
            const dist = Math.hypot(dx, dy) || 1;
            const sigX = node.x + (dx / dist) * 36;
            const sigY = node.y + (dy / dist) * 36;

            let colorHex = 0x22c55e; // Green
            if (state === "YELLOW") colorHex = 0xf1c100;
            if (state === "RED") colorHex = 0xef4444;

            // Signal housing & glow
            sGraphics.circle(sigX, sigY, 9);
            sGraphics.fill({ color: 0x090040 });
            sGraphics.stroke({ width: 1.5, color: 0x9a8ca0 });

            // Light bulb with specular glow
            sGraphics.circle(sigX, sigY, 6);
            sGraphics.fill({ color: colorHex, alpha: 1.0 });
          });
        });
      }

      // 2. Heatmap Layer
      hGraphics.clear();
      if (showHeatmap && snap.vehicles.length > 0) {
        snap.vehicles.forEach((veh) => {
          if (veh.is_queued) {
            hGraphics.circle(veh.x, veh.y, 24);
            hGraphics.fill({ color: 0xff3b30, alpha: 0.25 });
            hGraphics.circle(veh.x, veh.y, 14);
            hGraphics.fill({ color: 0xff9500, alpha: 0.35 });
          }
        });
      }

      // 3. Moving Vehicles
      vContainer.removeChildren();

      snap.vehicles.forEach((veh) => {
        const vehG = new PIXI.Graphics();
        vehG.eventMode = "static";
        vehG.cursor = "pointer";

        // Dimensions by vehicle type
        let length = 14;
        let width = 7;
        let bodyColor = 0x38bdf8; // Default car: cyan

        if (veh.type === "bus") {
          length = 26;
          width = 9;
          bodyColor = 0xf1c100; // BEST bus: gold/amber
        } else if (veh.type === "truck") {
          length = 24;
          width = 9;
          bodyColor = 0xf97316; // Freight: orange
        } else if (veh.type === "motorcycle") {
          length = 9;
          width = 4;
          bodyColor = 0xc084fc; // 2-wheeler: violet
        } else if (veh.type === "emergency") {
          length = 16;
          width = 8;
          bodyColor = 0x10b981; // Emergency: emerald
        }

        // Custom color override if present
        if (veh.color && veh.color.startsWith("#")) {
          const parsed = parseInt(veh.color.replace("#", "0x"), 16);
          if (!isNaN(parsed)) bodyColor = parsed;
        }

        // Vehicle Chassis
        vehG.roundRect(-length / 2, -width / 2, length, width, 2.5);
        vehG.fill({ color: bodyColor });
        vehG.stroke({ width: 1, color: 0xffffff, alpha: 0.8 });

        // Headlights (front)
        vehG.circle(length / 2 - 1, -width / 4, 1.2);
        vehG.fill({ color: 0xfffbeb, alpha: 0.95 });
        vehG.circle(length / 2 - 1, width / 4, 1.2);
        vehG.fill({ color: 0xfffbeb, alpha: 0.95 });

        // Taillights / Brake Lights (rear)
        const brakeAlpha = veh.is_queued ? 1.0 : 0.4;
        const brakeColor = veh.is_queued ? 0xff0000 : 0xaa2222;
        vehG.circle(-length / 2 + 1, -width / 4, 1.3);
        vehG.fill({ color: brakeColor, alpha: brakeAlpha });
        vehG.circle(-length / 2 + 1, width / 4, 1.3);
        vehG.fill({ color: brakeColor, alpha: brakeAlpha });

        // Flashing beacon for emergency vehicles
        if (veh.type === "emergency") {
          const flash = Math.floor(time * 8) % 2 === 0;
          vehG.circle(0, 0, 3.5);
          vehG.fill({ color: flash ? 0xef4444 : 0x38bdf8, alpha: 1.0 });
        }

        // Trajectory velocity vector line
        if (showVectors && veh.speed > 0) {
          const vecLen = Math.min(30, veh.speed * 2.2);
          vehG.beginPath();
          vehG.moveTo(length / 2, 0);
          vehG.lineTo(length / 2 + vecLen, 0);
          vehG.stroke({ width: 1.5, color: 0x38bdf8, alpha: 0.7 });
        }

        // Selected Reticle
        if (selectedVehicleRef.current?.id === veh.id) {
          vehG.circle(0, 0, length);
          vehG.stroke({ width: 2, color: 0xf1c100, alpha: 0.9 });
        }

        vehG.x = veh.x;
        vehG.y = veh.y;
        vehG.rotation = veh.angle;

        // Interaction
        vehG.on("pointerdown", (e) => {
          e.stopPropagation();
          setSelectedVehicle(veh);
          if (onSelectVehicle) onSelectVehicle(veh);
        });

        vContainer.addChild(vehG);
      });
    },
    [snapshots, config, showHeatmap, showVectors, onSelectVehicle]
  );

  return (
    <div className="relative w-full h-full min-h-[500px] flex items-center justify-center overflow-hidden">
      {/* Pixi Canvas Mounting Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
        onClick={() => {
          setSelectedVehicle(null);
          if (onSelectVehicle) onSelectVehicle(null);
        }}
      />

      {/* Selected Vehicle Telemetry HUD Card */}
      {selectedVehicle && (
        <div className="absolute bottom-4 right-4 z-40 glass-tier-3 p-3.5 rounded-xl border border-[var(--primary)]/40 shadow-2xl flex flex-col gap-1.5 w-60 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between text-xs font-telemetry">
            <span className="font-bold text-[var(--primary)] flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">directions_car</span>
              {selectedVehicle.id}
            </span>
            <span className="text-[10px] uppercase font-bold bg-[var(--surface-container-highest)] px-1.5 py-0.5 rounded text-[var(--tertiary)]">
              {selectedVehicle.type}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-telemetry pt-1 border-t border-[var(--outline-variant)]/20">
            <div>
              <span className="text-[var(--on-surface-variant)] block text-[9px]">Speed</span>
              <span className="font-bold text-[var(--on-surface)]">
                {((selectedVehicle.speed || 0) * 3.6).toFixed(1)} km/h
              </span>
            </div>
            <div>
              <span className="text-[var(--on-surface-variant)] block text-[9px]">Status</span>
              <span
                className={`font-bold ${
                  selectedVehicle.is_queued ? "text-[var(--error)]" : "text-[var(--secondary)]"
                }`}
              >
                {selectedVehicle.is_queued ? "Queued" : "Cruising"}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-[var(--on-surface-variant)] block text-[9px]">Road Segment</span>
              <span className="font-medium text-[var(--on-surface)] truncate block">
                {selectedVehicle.road || "Internal Junction"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
