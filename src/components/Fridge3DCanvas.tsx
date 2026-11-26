import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wind, 
  DoorClosed, 
  DoorOpen, 
  RotateCcw, 
  Sparkles, 
  Activity, 
  X, 
  Layers, 
  ChevronRight, 
  Thermometer,
  Eye,
  Camera
} from 'lucide-react';
import { differenceInDays } from 'date-fns';
import confetti from 'canvas-confetti';
import type { FridgeItem } from '../services/geminiService';
import { FridgeModel, type ProduceObject } from './3d/FridgeModel';

interface Fridge3DCanvasProps {
  items: FridgeItem[];
  onRelocate: (item: FridgeItem, targetZone: string) => void;
  onSelectItem: (item: FridgeItem) => void;
}

export const Fridge3DCanvas: React.FC<Fridge3DCanvasProps> = ({
  items,
  onRelocate,
  onSelectItem
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // UI Interactive States
  const [isDoorsOpen, setIsDoorsOpen] = useState(true);
  const [isAirflowActive, setIsAirflowActive] = useState(true);
  const [hoveredProduce, setHoveredProduce] = useState<{ name: string; zone: string; daysLeft: number } | null>(null);
  const [selectedProduce, setSelectedProduce] = useState<FridgeItem | null>(null);
  const [activePreset, setActivePreset] = useState<'overview' | 'top' | 'middle' | 'crisper'>('overview');

  // Animation & Three.js Refs
  const fridgeRef = useRef<FridgeModel | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const targetCameraPos = useRef(new THREE.Vector3(0, 1.8, 17.5));
  const targetLookAt = useRef(new THREE.Vector3(0, 0.2, 0));
  const isDoorsOpenRef = useRef(true);
  const isAirflowActiveRef = useRef(true);

  // Sync state with refs
  useEffect(() => {
    isDoorsOpenRef.current = isDoorsOpen;
    if (fridgeRef.current) {
      fridgeRef.current.setDoorOpen(isDoorsOpen);
    }
  }, [isDoorsOpen]);

  useEffect(() => {
    isAirflowActiveRef.current = isAirflowActive;
    if (fridgeRef.current && fridgeRef.current.frostParticles) {
      fridgeRef.current.frostParticles.visible = isAirflowActive;
    }
  }, [isAirflowActive]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07090e);
    scene.fog = new THREE.FogExp2(0x07090e, 0.008);

    // --- 2. Camera Setup ---
    const width = container.clientWidth;
    const height = container.clientHeight || 580;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 17.5);
    cameraRef.current = camera;

    // --- 3. Renderer Setup ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // --- 4. Orbit Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 6.0;
    controls.maxDistance = 28.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.12; // Don't orbit below ground
    controls.target.set(0, 0.2, 0);
    controlsRef.current = controls;

    // --- 5. Studio Lighting Setup ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff8ee, 1.4);
    keyLight.position.set(12, 14, 16);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.85);
    fillLight.position.set(-12, -4, 12);
    scene.add(fillLight);

    // Ground Studio Grid & Floor
    const groundGrid = new THREE.GridHelper(36, 36, 0x10b981, 0x1e293b);
    groundGrid.position.y = -6.8;
    scene.add(groundGrid);

    const floorGeo = new THREE.PlaneGeometry(36, 36);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x05070a,
      roughness: 0.2,
      metalness: 0.8
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -6.81;
    scene.add(floor);

    // --- 6. Mount Sub-Zero 3D Fridge Model ---
    const fridge = new FridgeModel();
    fridgeRef.current = fridge;
    fridge.setDoorOpen(isDoorsOpenRef.current);
    if (fridge.frostParticles) {
      fridge.frostParticles.visible = isAirflowActiveRef.current;
    }
    scene.add(fridge.group);

    // --- 7. Raycasting Setup for Interactive Produce Selection ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-1000, -1000);

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const produceMeshes = fridge.produces.map(p => p.mesh);
      const intersects = raycaster.intersectObjects(produceMeshes, true);

      if (intersects.length > 0) {
        // Find matching produce object in fridge
        let hitObj: THREE.Object3D | null = intersects[0].object;
        let matchedProduce: ProduceObject | null = null;

        while (hitObj && !matchedProduce) {
          matchedProduce = fridge.produces.find(p => p.mesh === hitObj) || null;
          hitObj = hitObj.parent;
        }

        if (matchedProduce) {
          // Find matching item from live inventory
          const pName = matchedProduce.name.toLowerCase();
          const found = items.find(i => 
            i.name.toLowerCase().includes(pName) || pName.includes(i.name.toLowerCase())
          ) || items[0];

          if (found) {
            setSelectedProduce(found);
            confetti({
              particleCount: 50,
              spread: 45,
              origin: { y: 0.65 },
              colors: ['#06b6d4', '#10b981', '#ffffff']
            });
          }
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', onPointerMove);
    renderer.domElement.addEventListener('click', onClick);

    // --- 8. Responsive Resize Handler ---
    const onResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 580;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', onResize);

    // --- 9. 60 FPS Render Loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Update Fridge Model (Mist, Doors, Shaders, Produce Physics)
      fridge.update(delta);

      // Smooth Camera Glide to Presets
      camera.position.lerp(targetCameraPos.current, 0.06);
      controls.target.lerp(targetLookAt.current, 0.06);
      controls.update();

      // Raycast Produce
      raycaster.setFromCamera(mouse, camera);
      const produceMeshes = fridge.produces.map(p => p.mesh);
      const intersects = raycaster.intersectObjects(produceMeshes, true);

      // Reset Halos
      fridge.produces.forEach(p => {
        if (p.halo) (p.halo.material as THREE.MeshBasicMaterial).opacity = 0.2;
      });

      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        let matchedProduce: ProduceObject | null = null;
        while (hitObj && !matchedProduce) {
          matchedProduce = fridge.produces.find(p => p.mesh === hitObj) || null;
          hitObj = hitObj.parent;
        }

        if (matchedProduce) {
          renderer.domElement.style.cursor = 'pointer';
          if (matchedProduce.halo) {
            (matchedProduce.halo.material as THREE.MeshBasicMaterial).opacity = 0.95;
            (matchedProduce.halo.material as THREE.MeshBasicMaterial).color.setHex(0x06b6d4);
          }
          const matchedItem = items.find(i => 
            i.name.toLowerCase().includes(matchedProduce!.name.toLowerCase())
          );
          const days = matchedItem 
            ? differenceInDays(new Date(matchedItem.expiry_at), new Date()) 
            : 5;
          setHoveredProduce({
            name: matchedProduce.name,
            zone: matchedProduce.zone,
            daysLeft: Math.max(1, days)
          });
        }
      } else {
        renderer.domElement.style.cursor = 'grab';
        setHoveredProduce(null);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('mousemove', onPointerMove);
      renderer.domElement.removeEventListener('click', onClick);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [items]);

  // Camera Glide Presets
  const handlePreset = (preset: 'overview' | 'top' | 'middle' | 'crisper') => {
    setActivePreset(preset);
    if (preset === 'overview') {
      targetCameraPos.current.set(0, 1.8, 17.5);
      targetLookAt.current.set(0, 0.2, 0);
    } else if (preset === 'top') {
      targetCameraPos.current.set(0, 4.4, 11.0);
      targetLookAt.current.set(0, 3.4, 0);
    } else if (preset === 'middle') {
      targetCameraPos.current.set(0, 1.2, 11.0);
      targetLookAt.current.set(0, 0.2, 0);
    } else if (preset === 'crisper') {
      targetCameraPos.current.set(0, -2.4, 11.0);
      targetLookAt.current.set(0, -3.2, 0);
    }
  };

  const handleZoneMove = (item: FridgeItem, targetZone: string) => {
    onRelocate(item, targetZone);
    setSelectedProduce(null);
    confetti({
      particleCount: 50,
      spread: 45,
      origin: { y: 0.65 },
      colors: ['#06b6d4', '#10b981', '#ffffff']
    });
  };

  return (
    <div className="relative rounded-3xl border-2 border-slate-700/60 bg-[#07090e] shadow-2xl overflow-hidden min-h-[580px] flex flex-col justify-between">
      
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* TOP FLOATING CONTROLS HUD */}
      <div className="relative z-20 p-4 md:p-6 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Sub-Zero 3D Chamber Identity Badge */}
        <div className="px-3.5 py-2 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-cyan-500/30 shadow-lg pointer-events-auto flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-md shadow-cyan-400/50" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            3D Sub-Zero Chamber
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            WebGL 60 FPS
          </span>
        </div>

        {/* Shelf Camera Focus Presets */}
        <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 pointer-events-auto shadow-lg">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'top', label: 'Top Chiller' },
            { id: 'middle', label: 'Middle Shelf' },
            { id: 'crisper', label: 'Crisper Drawers' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => handlePreset(p.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activePreset === p.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Interactive Chamber Toggles */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Doors Toggle */}
          <button
            onClick={() => setIsDoorsOpen(!isDoorsOpen)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono uppercase flex items-center gap-2 transition-all border shadow-lg ${
              isDoorsOpen
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            {isDoorsOpen ? <DoorOpen className="w-4 h-4 text-emerald-400" /> : <DoorClosed className="w-4 h-4 text-slate-400" />}
            <span>{isDoorsOpen ? 'Doors Open' : 'Doors Closed'}</span>
          </button>

          {/* Airflow Toggle */}
          <button
            onClick={() => setIsAirflowActive(!isAirflowActive)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono uppercase flex items-center gap-2 transition-all border shadow-lg ${
              isAirflowActive
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <Wind className={`w-4 h-4 ${isAirflowActive ? 'text-cyan-400 animate-spin' : 'text-slate-400'}`} />
            <span>Airflow Mist</span>
          </button>

          {/* Reset View */}
          <button
            onClick={() => handlePreset('overview')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all shadow-lg"
            title="Reset Camera View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BOTTOM HOVER TOOLTIP & INSTRUCTIONS */}
      <div className="relative z-20 p-4 md:p-6 flex flex-col md:flex-row md:items-end justify-between gap-4 pointer-events-none">
        
        {/* Produce Hover Info Card */}
        <AnimatePresence>
          {hoveredProduce ? (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-cyan-500/40 shadow-2xl pointer-events-auto flex items-center gap-3.5 min-w-[260px]"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xl">
                🍎
              </div>
              <div>
                <div className="font-bold text-xs text-white flex items-center gap-1.5">
                  <span>{hoveredProduce.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                    {hoveredProduce.zone.toUpperCase()} ZONE
                  </span>
                </div>
                <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                  {hoveredProduce.daysLeft} Days Crisp · Click to Relocate ↗
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/70 backdrop-blur-md border border-white/5 text-[11px] font-mono text-slate-400 pointer-events-auto flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Drag to rotate · Scroll to zoom · Click any produce to inspect</span>
            </div>
          )}
        </AnimatePresence>

        {/* Real-Time Ambient Sensor Data */}
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 text-xs font-mono text-slate-300 pointer-events-auto shadow-lg">
          <div className="flex items-center gap-1.5 text-cyan-300">
            <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
            <span>3.8°C / 92% RH</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> 18 Active 3D Assets
          </span>
        </div>
      </div>

      {/* =========================================================================
          ITEM INSPECTION & CAUSAL RELOCATION MODAL
          ========================================================================= */}
      <AnimatePresence>
        {selectedProduce && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md rounded-2xl bg-slate-900 border border-cyan-500/40 p-6 shadow-2xl space-y-4 relative"
            >
              <button
                onClick={() => setSelectedProduce(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-3xl shadow-lg">
                  🍎
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{selectedProduce.name}</h3>
                  <p className="text-xs text-slate-400">
                    Currently resting on: <strong className="text-cyan-300 capitalize">{selectedProduce.zone} Shelf</strong>
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> 3D Micro-Climate Optimization:
                </div>
                <p>
                  Relocating this item in the 3D chamber to the <strong>Top Chiller Shelf (3.8°C)</strong> isolates it from ambient coastal humidity and yields <strong>+2.86 days of crispness</strong>.
                </p>
              </div>

              {/* Destination Shelf Buttons */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
                  Select Destination Shelf in 3D:
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'back', label: 'Top Chiller Shelf (3.8°C)', lift: '+2.86 Days Added ❄️', desc: 'Direct Laminar Air Jet' },
                    { id: 'middle', label: 'Middle Produce Shelf (4.2°C)', lift: '+1.40 Days Added 🌿', desc: 'Even Climate Deflection' },
                    { id: 'front', label: 'Crisper Bins & Door (2.5°C–6.5°C)', lift: 'Moisture Retention 💧', desc: 'High Humidity Seal' }
                  ].map(dest => (
                    <button
                      key={dest.id}
                      onClick={() => handleZoneMove(selectedProduce, dest.id)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        selectedProduce.zone === dest.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                          : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs flex items-center gap-2">
                          <span>{dest.label}</span>
                          {selectedProduce.zone === dest.id && (
                            <span className="text-[9px] font-mono text-cyan-300 bg-cyan-500/20 px-1.5 py-0.2 rounded">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{dest.desc}</div>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">{dest.lift}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    onSelectItem(selectedProduce);
                    setSelectedProduce(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Activity className="w-4 h-4" />
                  <span>Run Full Causal Analysis →</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
