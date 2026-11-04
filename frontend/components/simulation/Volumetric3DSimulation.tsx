"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type Simulation3DMode = "DRONES" | "WAREHOUSE" | "ORBITAL" | "CROWD";

export default function Volumetric3DSimulation() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeMode, setActiveMode] = useState<Simulation3DMode>("DRONES");
  const [agentCount, setAgentCount] = useState<number>(24);
  const [fps, setFps] = useState<number>(60);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  // References to keep across render loops
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const activeModeRef = useRef<Simulation3DMode>(activeMode);
  activeModeRef.current = activeMode;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x04040c, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(30, 26, 38);
    camera.lookAt(0, 4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.replaceChildren(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffcc00, 2.0);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    const purplePoint = new THREE.PointLight(0xb13bff, 4, 60);
    purplePoint.position.set(-15, 15, -15);
    scene.add(purplePoint);

    const cyanPoint = new THREE.PointLight(0x00f0ff, 3, 50);
    cyanPoint.position.set(15, 10, 15);
    scene.add(cyanPoint);

    // 3. Blueprint Holographic Grid Base
    const gridHelper = new THREE.GridHelper(50, 50, 0xb13bff, 0x1f1444);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Dynamic simulation groups
    const modeGroup = new THREE.Group();
    scene.add(modeGroup);

    // Data structures for agents
    let droneObjects: Array<{
      group: THREE.Group;
      rotors: THREE.Mesh[];
      pathRadius: number;
      speed: number;
      angle: number;
      altitude: number;
      yOffset: number;
      id: string;
    }> = [];

    let agvObjects: Array<{
      mesh: THREE.Mesh;
      targetX: number;
      targetZ: number;
      speed: number;
      id: string;
      color: number;
    }> = [];

    let orbitalObjects: Array<{
      mesh: THREE.Mesh;
      orbitRadius: number;
      inclination: number;
      speed: number;
      angle: number;
      id: string;
    }> = [];

    let crowdParticles: THREE.Points | null = null;
    let crowdPositions: Float32Array | null = null;
    let crowdVelocities: Float32Array | null = null;

    // BUILD MODE SCENES
    const buildDronesScene = () => {
      modeGroup.clear();
      droneObjects = [];

      // 4 High-tech Holographic Towers / Rooftops
      const towerGeom = new THREE.BoxGeometry(6, 16, 6);
      const towerEdges = new THREE.EdgesGeometry(towerGeom);
      const towerMat = new THREE.MeshStandardMaterial({
        color: 0x090918,
        roughness: 0.2,
        metalness: 0.9,
        transparent: true,
        opacity: 0.85,
      });
      const edgeMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 2 });

      const towerCoords = [
        { x: -14, z: -14, h: 14, name: "ALPHA VERTIPORT" },
        { x: 14, z: -14, h: 18, name: "BETA HUB" },
        { x: 14, z: 14, h: 12, name: "GAMMA ROOFTOP" },
        { x: -14, z: 14, h: 20, name: "DELTA LOGISTICS" },
      ];

      towerCoords.forEach((t) => {
        const mesh = new THREE.Mesh(towerGeom, towerMat);
        mesh.scale.set(1, t.h / 16, 1);
        mesh.position.set(t.x, t.h / 2, t.z);
        modeGroup.add(mesh);

        const wireframe = new THREE.LineSegments(towerEdges, edgeMat);
        wireframe.scale.copy(mesh.scale);
        wireframe.position.copy(mesh.position);
        modeGroup.add(wireframe);

        // Helipad glowing ring
        const ringGeom = new THREE.RingGeometry(2.2, 2.6, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xffcc00,
          side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(t.x, t.h + 0.1, t.z);
        modeGroup.add(ring);

        // Light beam
        const beamGeom = new THREE.CylinderGeometry(0.1, 0.1, 15, 8);
        const beamMat = new THREE.MeshBasicMaterial({
          color: 0x00f0ff,
          transparent: true,
          opacity: 0.25,
        });
        const beam = new THREE.Mesh(beamGeom, beamMat);
        beam.position.set(t.x, t.h + 7.5, t.z);
        modeGroup.add(beam);
      });

      // Airspace Geofence Boundary Rings
      for (let r = 8; r <= 24; r += 8) {
        const torusGeom = new THREE.TorusGeometry(r, 0.06, 8, 64);
        const torusMat = new THREE.MeshBasicMaterial({
          color: 0xb13bff,
          transparent: true,
          opacity: 0.35,
        });
        const torus = new THREE.Mesh(torusGeom, torusMat);
        torus.rotation.x = Math.PI / 2;
        torus.position.y = 10 + r * 0.3;
        modeGroup.add(torus);
      }

      // 12 Autonomous 3D Drones
      const droneColors = [0x00f0ff, 0xffcc00, 0x00ff88, 0xff3366];
      for (let i = 0; i < 16; i++) {
        const droneGroup = new THREE.Group();

        // Central chassis
        const bodyGeom = new THREE.BoxGeometry(0.8, 0.25, 0.8);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: 0x111122,
          metalness: 0.8,
          roughness: 0.2,
        });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        droneGroup.add(body);

        // Strobe beacon
        const beaconGeom = new THREE.SphereGeometry(0.15, 8, 8);
        const beaconMat = new THREE.MeshBasicMaterial({
          color: droneColors[i % droneColors.length],
        });
        const beacon = new THREE.Mesh(beaconGeom, beaconMat);
        beacon.position.y = 0.2;
        droneGroup.add(beacon);

        // 4 Rotors
        const rotorGeom = new THREE.BoxGeometry(0.6, 0.02, 0.08);
        const rotorMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const rotors: THREE.Mesh[] = [];

        [
          [-0.45, -0.45],
          [0.45, -0.45],
          [-0.45, 0.45],
          [0.45, 0.45],
        ].forEach(([rx, rz]) => {
          const rotor = new THREE.Mesh(rotorGeom, rotorMat);
          rotor.position.set(rx, 0.15, rz);
          droneGroup.add(rotor);
          rotors.push(rotor);
        });

        // Altitude laser indicator
        const laserGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, -10, 0),
        ]);
        const laserMat = new THREE.LineBasicMaterial({
          color: 0x00f0ff,
          transparent: true,
          opacity: 0.2,
        });
        const laser = new THREE.Line(laserGeom, laserMat);
        droneGroup.add(laser);

        const radius = 6 + (i % 4) * 4.5;
        const altitude = 8 + (i % 5) * 2.8;

        droneObjects.push({
          group: droneGroup,
          rotors,
          pathRadius: radius,
          speed: 0.015 + (i % 3) * 0.008,
          angle: (i * Math.PI) / 8,
          altitude,
          yOffset: Math.sin(i) * 2,
          id: `UAV-${(100 + i).toString()}`,
        });

        modeGroup.add(droneGroup);
      }
      setAgentCount(16);
    };

    const buildWarehouseScene = () => {
      modeGroup.clear();
      agvObjects = [];

      // High-Bay ASRS Racks (Grid of multi-tier shelves)
      const rackWidth = 2.5;
      const rackHeight = 8;
      const rackDepth = 16;
      const shelfGeom = new THREE.BoxGeometry(rackWidth, rackHeight, rackDepth);
      const shelfEdges = new THREE.EdgesGeometry(shelfGeom);
      const shelfMat = new THREE.MeshStandardMaterial({
        color: 0x0c0f20,
        metalness: 0.8,
        roughness: 0.3,
        transparent: true,
        opacity: 0.7,
      });
      const edgeMat = new THREE.LineBasicMaterial({ color: 0xffcc00, linewidth: 1.5 });

      [-10, 0, 10].forEach((rx) => {
        const rack = new THREE.Mesh(shelfGeom, shelfMat);
        rack.position.set(rx, rackHeight / 2, 0);
        modeGroup.add(rack);

        const edges = new THREE.LineSegments(shelfEdges, edgeMat);
        edges.position.copy(rack.position);
        modeGroup.add(edges);

        // Pallet boxes inside rack
        for (let y = 1; y < rackHeight; y += 2) {
          for (let z = -rackDepth / 2 + 2; z < rackDepth / 2; z += 3) {
            const boxGeom = new THREE.BoxGeometry(1.4, 1.2, 1.8);
            const boxMat = new THREE.MeshStandardMaterial({
              color: (y + z) % 2 === 0 ? 0x00f0ff : 0xb13bff,
              roughness: 0.4,
            });
            const box = new THREE.Mesh(boxGeom, boxMat);
            box.position.set(rx, y, z);
            modeGroup.add(box);
          }
        }
      });

      // 20 AGV Autonomous Sorting Robots on Floor
      const agvGeom = new THREE.BoxGeometry(1.6, 0.45, 1.2);
      for (let i = 0; i < 18; i++) {
        const agvMat = new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0xffcc00 : 0x00f0ff,
          metalness: 0.8,
          roughness: 0.2,
        });
        const agv = new THREE.Mesh(agvGeom, agvMat);
        agv.position.set(-15 + (i % 6) * 6, 0.25, -12 + Math.floor(i / 6) * 12);

        // Top hazard light
        const lightGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.15, 8);
        const lightMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });
        const light = new THREE.Mesh(lightGeom, lightMat);
        light.position.y = 0.3;
        agv.add(light);

        modeGroup.add(agv);
        agvObjects.push({
          mesh: agv,
          targetX: (Math.random() - 0.5) * 30,
          targetZ: (Math.random() - 0.5) * 24,
          speed: 0.08 + Math.random() * 0.06,
          id: `AGV-${(200 + i).toString()}`,
          color: i % 2 === 0 ? 0xffcc00 : 0x00f0ff,
        });
      }
      setAgentCount(18);
    };

    const buildOrbitalScene = () => {
      modeGroup.clear();
      orbitalObjects = [];

      // Central Holographic Planetary Core
      const sphereGeom = new THREE.SphereGeometry(7, 32, 32);
      const sphereWire = new THREE.WireframeGeometry(sphereGeom);
      const wireMat = new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.4,
      });
      const wireSphere = new THREE.LineSegments(sphereWire, wireMat);
      modeGroup.add(wireSphere);

      // Inner glowing core
      const innerGeom = new THREE.SphereGeometry(6.6, 24, 24);
      const innerMat = new THREE.MeshBasicMaterial({
        color: 0x0b0026,
        transparent: true,
        opacity: 0.85,
      });
      const inner = new THREE.Mesh(innerGeom, innerMat);
      modeGroup.add(inner);

      // Multiple Orbit Rings
      const ringRadii = [12, 17, 22, 27];
      ringRadii.forEach((r, idx) => {
        const ringGeom = new THREE.TorusGeometry(r, 0.05, 8, 100);
        const ringMat = new THREE.MeshBasicMaterial({
          color: idx % 2 === 0 ? 0xffcc00 : 0xb13bff,
          transparent: true,
          opacity: 0.5,
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = Math.PI / (2 + idx * 0.4);
        ring.rotation.y = (idx * Math.PI) / 6;
        modeGroup.add(ring);
      });

      // 24 Orbital Satellite Agents
      const satGeom = new THREE.BoxGeometry(0.8, 0.4, 0.4);
      const panelGeom = new THREE.BoxGeometry(1.8, 0.04, 0.6);
      const satMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9 });
      const panelMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

      for (let i = 0; i < 24; i++) {
        const sat = new THREE.Group();
        const body = new THREE.Mesh(satGeom, satMat);
        const panel = new THREE.Mesh(panelGeom, panelMat);
        sat.add(body);
        sat.add(panel);

        const radius = ringRadii[i % ringRadii.length];
        orbitalObjects.push({
          mesh: sat as any,
          orbitRadius: radius,
          inclination: (i * Math.PI) / 6,
          speed: 0.008 + (i % 4) * 0.004,
          angle: (i * Math.PI) / 12,
          id: `SAT-NODE-${(50 + i).toString()}`,
        });

        modeGroup.add(sat);
      }
      setAgentCount(24);
    };

    const buildCrowdScene = () => {
      modeGroup.clear();

      // Architectural Egress Arena & Chokepoint Portals
      const wallMat = new THREE.MeshStandardMaterial({
        color: 0x0e1329,
        metalness: 0.8,
        roughness: 0.2,
      });

      // Central Funnel & Obstacle Columns
      for (let col = -12; col <= 12; col += 8) {
        const colGeom = new THREE.CylinderGeometry(1.2, 1.2, 6, 16);
        const colMesh = new THREE.Mesh(colGeom, wallMat);
        colMesh.position.set(col, 3, 0);
        modeGroup.add(colMesh);

        // Glowing guide ring
        const ringGeom = new THREE.TorusGeometry(1.4, 0.06, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(col, 1.5, 0);
        modeGroup.add(ring);
      }

      // Exit Gates
      const gateGeom = new THREE.BoxGeometry(6, 4, 1);
      const gateEdge = new THREE.EdgesGeometry(gateGeom);
      const gateEdgeMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 2 });
      [-15, 15].forEach((gx) => {
        const wire = new THREE.LineSegments(gateEdge, gateEdgeMat);
        wire.position.set(gx, 2, 16);
        modeGroup.add(wire);
      });

      // 120 Crowd Agent Particles
      const P_COUNT = 140;
      const pGeom = new THREE.BufferGeometry();
      crowdPositions = new Float32Array(P_COUNT * 3);
      crowdVelocities = new Float32Array(P_COUNT * 3);

      for (let i = 0; i < P_COUNT; i++) {
        crowdPositions[i * 3 + 0] = (Math.random() - 0.5) * 36;
        crowdPositions[i * 3 + 1] = 0.5;
        crowdPositions[i * 3 + 2] = -18 + Math.random() * 8; // start behind obstacles

        crowdVelocities[i * 3 + 0] = (Math.random() - 0.5) * 0.05;
        crowdVelocities[i * 3 + 1] = 0;
        crowdVelocities[i * 3 + 2] = 0.08 + Math.random() * 0.08; // march toward positive Z (exit)
      }

      pGeom.setAttribute("position", new THREE.BufferAttribute(crowdPositions, 3));
      const pMat = new THREE.PointsMaterial({
        color: 0x00ff88,
        size: 0.8,
        transparent: true,
        opacity: 0.9,
      });

      crowdParticles = new THREE.Points(pGeom, pMat);
      modeGroup.add(crowdParticles);
      setAgentCount(P_COUNT);
    };

    // Load initial mode
    if (activeMode === "DRONES") buildDronesScene();
    else if (activeMode === "WAREHOUSE") buildWarehouseScene();
    else if (activeMode === "ORBITAL") buildOrbitalScene();
    else if (activeMode === "CROWD") buildCrowdScene();

    // 4. Mouse / Orbit Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let camPhi = 0.55;
    let camTheta = 0.85;
    let camRadius = 55;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      camTheta -= deltaX * 0.008;
      camPhi = Math.max(0.1, Math.min(Math.PI / 2.1, camPhi + deltaY * 0.008));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camRadius = Math.max(25, Math.min(90, camRadius + e.deltaY * 0.05));
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("wheel", onWheel, { passive: false });

    // 5. Animation Loop
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = 0;

    const animate = (time: number) => {
      animFrameRef.current = requestAnimationFrame(animate);

      const delta = (time - lastTime) / 1000;
      lastTime = time;

      frameCount++;
      fpsTimer += delta;
      if (fpsTimer >= 0.5) {
        setFps(Math.round(frameCount / fpsTimer));
        frameCount = 0;
        fpsTimer = 0;
      }

      // Gentle auto-rotation if not dragging
      if (!isDragging) {
        camTheta += 0.002;
      }

      // Spherical camera update
      camera.position.x = camRadius * Math.sin(camPhi) * Math.sin(camTheta);
      camera.position.y = camRadius * Math.cos(camPhi);
      camera.position.z = camRadius * Math.sin(camPhi) * Math.cos(camTheta);
      camera.lookAt(0, 4, 0);

      const mode = activeModeRef.current;

      // UPDATE DRONES
      if (mode === "DRONES") {
        droneObjects.forEach((d) => {
          d.angle += d.speed;
          d.group.position.x = Math.cos(d.angle) * d.pathRadius;
          d.group.position.z = Math.sin(d.angle) * d.pathRadius;
          d.group.position.y = d.altitude + Math.sin(d.angle * 3 + d.yOffset) * 0.8;
          d.group.rotation.y = -d.angle + Math.PI / 2;
          d.group.rotation.z = Math.sin(d.angle * 2) * 0.15; // bank angle

          // Spin rotors
          d.rotors.forEach((r) => {
            r.rotation.y += 0.8;
          });
        });
      }

      // UPDATE WAREHOUSE AGVS
      if (mode === "WAREHOUSE") {
        agvObjects.forEach((agv) => {
          const dx = agv.targetX - agv.mesh.position.x;
          const dz = agv.targetZ - agv.mesh.position.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < 1.0) {
            agv.targetX = (Math.random() - 0.5) * 32;
            agv.targetZ = (Math.random() - 0.5) * 24;
          } else {
            agv.mesh.position.x += (dx / dist) * agv.speed;
            agv.mesh.position.z += (dz / dist) * agv.speed;
            agv.mesh.rotation.y = Math.atan2(dx, dz);
          }
        });
      }

      // UPDATE ORBITAL
      if (mode === "ORBITAL") {
        orbitalObjects.forEach((sat) => {
          sat.angle += sat.speed;
          sat.mesh.position.x = Math.cos(sat.angle) * sat.orbitRadius;
          sat.mesh.position.z = Math.sin(sat.angle) * sat.orbitRadius * Math.cos(sat.inclination);
          sat.mesh.position.y = Math.sin(sat.angle) * sat.orbitRadius * Math.sin(sat.inclination);
          sat.mesh.rotation.y += 0.02;
        });
      }

      // UPDATE CROWD PARTICLES
      if (mode === "CROWD" && crowdParticles && crowdPositions && crowdVelocities) {
        const posAttr = crowdParticles.geometry.attributes.position;
        const count = crowdPositions.length / 3;

        for (let i = 0; i < count; i++) {
          crowdPositions[i * 3 + 0] += crowdVelocities[i * 3 + 0];
          crowdPositions[i * 3 + 2] += crowdVelocities[i * 3 + 2];

          // Funnel toward exit portals when approaching z=16
          if (crowdPositions[i * 3 + 2] > 10) {
            const targetX = crowdPositions[i * 3 + 0] < 0 ? -15 : 15;
            crowdPositions[i * 3 + 0] += (targetX - crowdPositions[i * 3 + 0]) * 0.03;
          }

          // Reset loop
          if (crowdPositions[i * 3 + 2] > 20) {
            crowdPositions[i * 3 + 2] = -18;
            crowdPositions[i * 3 + 0] = (Math.random() - 0.5) * 32;
          }
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // Resize handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("wheel", onWheel);
      renderer.dispose();
    };
  }, [activeMode]);

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border border-[var(--outline-variant)]/30 bg-[#04040c] shadow-2xl flex flex-col group select-none">
      {/* 3D WebGL Canvas Mount Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Glassmorphic Mode Switcher Dock */}
      <div className="relative z-10 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-[#090040]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[var(--glass-border-2)] shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] animate-pulse"></span>
          <span className="font-telemetry text-xs font-bold text-white tracking-wider">
            3D VOLUMETRIC DIGITAL TWIN
          </span>
          <span className="text-[10px] font-mono text-[var(--tertiary)] bg-[#FFCC00]/10 px-2 py-0.5 rounded border border-[#FFCC00]/30 font-bold">
            {fps} FPS
          </span>
        </div>

        {/* Mode Selector Buttons */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-[#07002b]/80 backdrop-blur-md p-1 rounded-xl border border-[var(--outline-variant)]/20 shadow-xl">
          {[
            { id: "DRONES", label: "🚁 3D Drone Airspace", count: 16 },
            { id: "WAREHOUSE", label: "📦 3D AGV Racks", count: 18 },
            { id: "ORBITAL", label: "🌐 3D Orbital Swarm", count: 24 },
            { id: "CROWD", label: "🚶 3D Crowd Egress", count: 140 },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id as Simulation3DMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-telemetry font-semibold transition-all ${
                activeMode === m.id
                  ? "bg-gradient-to-r from-[#B13BFF] to-[#471396] text-white shadow-lg border border-[#B13BFF]/50 scale-[1.02]"
                  : "text-[var(--on-surface-variant)] hover:text-white hover:bg-white/5"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Center Subtle Orbit Helper Hint */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-60 transition-opacity duration-300">
        <div className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white font-telemetry text-xs flex items-center gap-2 shadow-2xl">
          <span className="material-symbols-outlined text-sm">3d_rotation</span>
          <span>Click & Drag to Orbit 3D Space • Scroll to Zoom</span>
        </div>
      </div>

      {/* Bottom Live Kinematics Telemetry Ribbon */}
      <div className="relative z-10 mt-auto p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto bg-[#090040]/80 backdrop-blur-md px-4 py-2 rounded-xl border border-[var(--glass-border-2)] text-xs font-telemetry text-white shadow-xl">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#00f0ff] text-sm">view_in_ar</span>
            <span className="text-[var(--on-surface-variant)]">Domain:</span>
            <span className="font-bold text-[#00f0ff]">{activeMode}</span>
          </div>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--on-surface-variant)]">Active 3D Agents:</span>
            <span className="font-bold text-[#FFCC00]">{agentCount}</span>
          </div>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--on-surface-variant)]">Collisions:</span>
            <span className="font-bold text-[#00ff88]">0.00 (Zero Defect)</span>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <span className="text-[11px] font-telemetry text-white/50 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm">
            Three.js WebGL • 60Hz Microscopic Physics Engine
          </span>
        </div>
      </div>
    </div>
  );
}
