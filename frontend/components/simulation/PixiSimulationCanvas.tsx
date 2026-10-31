"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as PIXI from "pixi.js";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Gauge,
  Clock,
  Car,
  AlertTriangle,
} from "lucide-react";
import { SimulationConfig, TrajectorySnapshot } from "@/lib/api";

interface CanvasProps {
  config: SimulationConfig | null;
  snapshots: TrajectorySnapshot[];
  durationSeconds: number;
  onTimeUpdate?: (time: number) => void;
}

export default function PixiSimulationCanvas({
  config,
  snapshots,
  durationSeconds,
  onTimeUpdate,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  // Graphics layers
  const roadLayerRef = useRef<PIXI.Graphics | null>(null);
  const signalLayerRef = useRef<PIXI.Graphics | null>(null);
  const vehicleLayerRef = useRef<PIXI.Container | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const currentTimeRef = useRef<number>(0);
  currentTimeRef.current = currentTime;

  const isPlayingRef = useRef<boolean>(false);
  isPlayingRef.current = isPlaying;

  const playbackSpeedRef = useRef<number>(1);
  playbackSpeedRef.current = playbackSpeed;

  // Initialize Pixi Application
  useEffect(() => {
    let isCancelled = false;

    async function initPixi() {
      if (!containerRef.current) return;

      const app = new PIXI.Application();
      await app.init({
        width: containerRef.current.clientWidth || 900,
        height: 520,
        backgroundColor: 0x090d16,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (isCancelled) {
        app.destroy(true);
        return;
      }

      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(app.canvas);
      appRef.current = app;

      // Create layers
      const roadLayer = new PIXI.Graphics();
      const signalLayer = new PIXI.Graphics();
      const vehicleLayer = new PIXI.Container();

      app.stage.addChild(roadLayer);
      app.stage.addChild(signalLayer);
      app.stage.addChild(vehicleLayer);

      roadLayerRef.current = roadLayer;
      signalLayerRef.current = signalLayer;
      vehicleLayerRef.current = vehicleLayer;

      // Draw initial network if config is present
      if (config) {
        drawRoadNetwork(app, roadLayer, config);
      }
    }

    initPixi();

    return () => {
      isCancelled = true;
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, []);

  // Redraw roads when config changes
  useEffect(() => {
    if (appRef.current && roadLayerRef.current && config) {
      drawRoadNetwork(appRef.current, roadLayerRef.current, config);
    }
  }, [config]);

  // Main playback loop
  useEffect(() => {
    let animFrame: number;
    let lastTimestamp: number = performance.now();

    const loop = (now: number) => {
      const deltaSec = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isPlayingRef.current && snapshots.length > 0) {
        let nextTime = currentTimeRef.current + deltaSec * playbackSpeedRef.current;
        if (nextTime > durationSeconds) {
          nextTime = durationSeconds;
          setIsPlaying(false);
        }
        setCurrentTime(nextTime);
        if (onTimeUpdate) onTimeUpdate(nextTime);
      }

      // Render vehicles and signals at currentTime
      renderFrameAtTime(currentTimeRef.current);

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [snapshots, durationSeconds, onTimeUpdate]);

  // Draw static road network
  const drawRoadNetwork = (
    app: PIXI.Application,
    graphics: PIXI.Graphics,
    cfg: SimulationConfig
  ) => {
    graphics.clear();

    const nodeMap = new Map<string, { x: number; y: number }>();
    cfg.network.intersections.forEach((n) => {
      nodeMap.set(n.id, { x: n.x, y: n.y });
    });

    // 1. Draw subtle background grid
    graphics.beginPath();
    for (let x = 0; x < app.screen.width; x += 40) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, app.screen.height);
    }
    for (let y = 0; y < app.screen.height; y += 40) {
      graphics.moveTo(0, y);
      graphics.lineTo(app.screen.width, y);
    }
    graphics.stroke({ width: 1, color: 0x111827, alpha: 0.5 });

    // 2. Draw roads
    cfg.network.roads.forEach((road) => {
      const src = nodeMap.get(road.source);
      const tgt = nodeMap.get(road.target);
      if (!src || !tgt) return;

      const roadWidth = Math.max(20, road.lanes * 16);

      // Road asphalt surface
      graphics.beginPath();
      graphics.moveTo(src.x, src.y);
      graphics.lineTo(tgt.x, tgt.y);
      const roadColor = road.is_closed ? 0x27191d : 0x1e293b;
      graphics.stroke({ width: roadWidth, color: roadColor, cap: "round" });

      // White lane borders
      graphics.beginPath();
      graphics.moveTo(src.x, src.y);
      graphics.lineTo(tgt.x, tgt.y);
      graphics.stroke({ width: roadWidth + 2, color: 0x334155, alpha: 0.4 });

      // Dashed lane divider
      if (road.lanes > 1) {
        graphics.beginPath();
        graphics.moveTo(src.x, src.y);
        graphics.lineTo(tgt.x, tgt.y);
        graphics.stroke({
          width: 1.5,
          color: road.is_closed ? 0xef4444 : 0x64748b,
          alpha: 0.6,
        });
      }

      // Road closure warning pattern
      if (road.is_closed) {
        const midX = (src.x + tgt.x) / 2;
        const midY = (src.y + tgt.y) / 2;
        graphics.circle(midX, midY, 12);
        graphics.fill({ color: 0xef4444, alpha: 0.8 });
      }
    });

    // 3. Draw intersection junctions
    cfg.network.intersections.forEach((node) => {
      graphics.circle(node.x, node.y, 22);
      graphics.fill({ color: 0x0f172a });
      graphics.stroke({ width: 2, color: 0x38bdf8, alpha: 0.7 });

      // Inner junction center
      graphics.circle(node.x, node.y, 6);
      graphics.fill({ color: 0x38bdf8 });
    });
  };

  // Render moving vehicles & signals for current time
  const renderFrameAtTime = useCallback(
    (time: number) => {
      if (!vehicleLayerRef.current || !signalLayerRef.current || snapshots.length === 0)
        return;

      const vContainer = vehicleLayerRef.current;
      const sGraphics = signalLayerRef.current;

      // Find closest snapshot
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

      // 1. Update Signals
      sGraphics.clear();
      if (snap.signals && config) {
        Object.entries(snap.signals).forEach(([intersectionId, roadSignals]) => {
          const node = config.network.intersections.find((n) => n.id === intersectionId);
          if (!node) return;

          let offsetAngle = 0;
          Object.entries(roadSignals).forEach(([roadId, state]) => {
            const road = config.network.roads.find((r) => r.id === roadId);
            if (!road) return;

            // Draw signal lamp 25px offset towards incoming road
            const src = config.network.intersections.find((n) => n.id === road.source);
            if (!src) return;

            const dx = src.x - node.x;
            const dy = src.y - node.y;
            const dist = Math.hypot(dx, dy) || 1;
            const sigX = node.x + (dx / dist) * 28;
            const sigY = node.y + (dy / dist) * 28;

            let colorHex = 0x22c55e; // Green
            if (state === "YELLOW") colorHex = 0xeab308;
            if (state === "RED") colorHex = 0xef4444;

            // Signal housing
            sGraphics.circle(sigX, sigY, 7);
            sGraphics.fill({ color: 0x000000 });
            sGraphics.stroke({ width: 1.5, color: 0x475569 });

            // Glowing light
            sGraphics.circle(sigX, sigY, 5);
            sGraphics.fill({ color: colorHex, alpha: 0.95 });
          });
        });
      }

      // 2. Update Vehicles
      vContainer.removeChildren();

      snap.vehicles.forEach((veh) => {
        const vehG = new PIXI.Graphics();

        // Dimensions
        let length = 12;
        let width = 6;
        if (veh.type === "bus") {
          length = 24;
          width = 8;
        } else if (veh.type === "truck") {
          length = 20;
          width = 8;
        } else if (veh.type === "motorcycle") {
          length = 8;
          width = 4;
        } else if (veh.type === "emergency") {
          length = 15;
          width = 7;
        }

        // Color
        const color = parseInt(veh.color.replace("#", "0x"), 16) || 0x38bdf8;

        // Vehicle body
        vehG.roundRect(-length / 2, -width / 2, length, width, 2);
        vehG.fill({ color });
        vehG.stroke({ width: 1, color: 0xffffff, alpha: 0.7 });

        // Headlights
        vehG.circle(length / 2, -width / 4, 1.2);
        vehG.fill({ color: 0xfffbeb, alpha: 0.9 });
        vehG.circle(length / 2, width / 4, 1.2);
        vehG.fill({ color: 0xfffbeb, alpha: 0.9 });

        // Brake lights if queued
        if (veh.is_queued) {
          vehG.circle(-length / 2, -width / 4, 1.5);
          vehG.fill({ color: 0xff0000, alpha: 1.0 });
          vehG.circle(-length / 2, width / 4, 1.5);
          vehG.fill({ color: 0xff0000, alpha: 1.0 });
        }

        // Emergency flashing light
        if (veh.type === "emergency") {
          const flash = Math.floor(time * 6) % 2 === 0;
          vehG.circle(0, 0, 3);
          vehG.fill({ color: flash ? 0xef4444 : 0x38bdf8, alpha: 0.9 });
        }

        vehG.x = veh.x;
        vehG.y = veh.y;
        vehG.rotation = veh.angle;

        vContainer.addChild(vehG);
      });
    },
    [snapshots, config]
  );

  const handlePlayPause = () => {
    if (currentTime >= durationSeconds) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (onTimeUpdate) onTimeUpdate(0);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    const nextTime = Math.min(durationSeconds, currentTime + 1.0);
    setCurrentTime(nextTime);
    if (onTimeUpdate) onTimeUpdate(nextTime);
  };

  const currentSnapshot =
    snapshots.length > 0
      ? snapshots[
          Math.min(
            snapshots.length - 1,
            Math.floor((currentTime / Math.max(1, durationSeconds)) * snapshots.length)
          )
        ]
      : null;

  return (
    <div className="relative flex flex-col bg-[#090d16] border border-[#1e293b] rounded-xl overflow-hidden shadow-2xl">
      {/* Top Simulation Status Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f172a]/90 backdrop-blur border-b border-[#1e293b] text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-sky-400 font-mono font-medium">
            <Clock className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>T = {currentTime.toFixed(1)}s</span>
            <span className="text-slate-500">/ {durationSeconds}s</span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Car className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active: {currentSnapshot?.active_count || 0}</span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-400">
            <span>Cleared: {currentSnapshot?.completed_count || 0}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-[#1e293b] rounded-md px-2 py-0.5 text-[11px] text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-ping" />
            <span>Deterministic Engine: 60 FPS</span>
          </div>
        </div>
      </div>

      {/* Pixi Canvas Mount Element */}
      <div
        ref={containerRef}
        className="w-full h-[520px] relative cursor-crosshair overflow-hidden"
      />

      {/* Bottom Interactive Playback Controls Bar */}
      <div className="p-3 bg-[#0f172a]/95 backdrop-blur border-t border-[#1e293b] flex flex-col gap-2">
        {/* Scrubbing Slider */}
        <div className="flex items-center space-x-3 w-full">
          <input
            type="range"
            min={0}
            max={durationSeconds}
            step={0.5}
            value={currentTime}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setCurrentTime(val);
              if (onTimeUpdate) onTimeUpdate(val);
            }}
            className="w-full h-1.5 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
        </div>

        {/* Buttons and toggles */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePlayPause}
              className={`flex items-center justify-center w-9 h-9 rounded-lg font-medium transition ${
                isPlaying
                  ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/40"
                  : "bg-sky-500 text-slate-950 hover:bg-sky-400 shadow-md shadow-sky-500/20"
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <button
              onClick={handleStepForward}
              title="Step forward 1s"
              className="p-2 rounded-lg bg-[#1e293b] text-slate-300 hover:bg-[#334155] hover:text-white transition"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={handleReset}
              title="Reset simulation"
              className="p-2 rounded-lg bg-[#1e293b] text-slate-300 hover:bg-[#334155] hover:text-white transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Multiplier */}
          <div className="flex items-center space-x-1 bg-[#1e293b] rounded-lg p-1 text-xs font-mono">
            {[0.5, 1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 rounded transition ${
                  playbackSpeed === spd
                    ? "bg-sky-500 text-slate-950 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Map Legend */}
          <div className="hidden md:flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#38bdf8] mr-1" /> Car
            </span>
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b] mr-1" /> Bus
            </span>
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444] mr-1" /> Truck
            </span>
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#a855f7] mr-1" /> Bike
            </span>
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981] mr-1" /> Emergency
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
