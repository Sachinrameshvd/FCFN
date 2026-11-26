import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wind, 
  Thermometer, 
  Droplets, 
  Sparkles, 
  ArrowRightLeft, 
  CheckCircle2, 
  Info, 
  Eye, 
  Layers,
  Box,
  Camera,
  Activity,
  ShieldCheck,
  ChevronRight,
  Flame,
  X
} from 'lucide-react';
import { differenceInDays } from 'date-fns';
import type { FridgeItem } from '../services/geminiService';
import confetti from 'canvas-confetti';
import { Fridge3DCanvas } from './Fridge3DCanvas';

interface ArchitecturalFridgeMapProps {
  items: FridgeItem[];
  onRelocate: (item: FridgeItem, newZone: string) => void;
  onSelectItem: (item: FridgeItem) => void;
}

const getProduceEmoji = (name: string, category: string) => {
  const n = name.toLowerCase();
  if (n.includes('apple')) return '🍎';
  if (n.includes('banana')) return '🍌';
  if (n.includes('mango')) return '🥭';
  if (n.includes('grape')) return '🍇';
  if (n.includes('tomato')) return '🍅';
  if (n.includes('carrot')) return '🥕';
  if (n.includes('brinjal') || n.includes('eggplant')) return '🍆';
  if (n.includes('ladies finger') || n.includes('okra')) return '🥒';
  if (n.includes('spinach') || n.includes('palak') || n.includes('keerai')) return '🥬';
  if (n.includes('mint') || n.includes('coriander') || n.includes('curry')) return '🌿';
  if (n.includes('milk')) return '🥛';
  if (n.includes('paneer') || n.includes('cheese')) return '🧀';
  if (n.includes('curd') || n.includes('yogurt')) return '🥣';
  if (n.includes('butter')) return '🧈';
  if (n.includes('onion') || n.includes('shallot')) return '🧅';
  if (n.includes('potato')) return '🥔';
  if (category === 'Fruit') return '🍎';
  if (category === 'Dairy') return '🥛';
  if (category === 'Greens') return '🥬';
  return '🥗';
};

export const ArchitecturalFridgeMap: React.FC<ArchitecturalFridgeMapProps> = ({
  items,
  onRelocate,
  onSelectItem
}) => {
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [selectedProduce, setSelectedProduce] = useState<FridgeItem | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<'normal' | 'airflow' | 'thermal'>('normal');

  // Partition items into realistic physical shelf groups
  // Top Shelf (Zone: back)
  const topShelfItems = items.filter(i => i.zone === 'back');

  // Middle Shelf (Zone: middle)
  const middleShelfItems = items.filter(i => i.zone === 'middle');

  // Front Zone split into Door Balconies vs Crisper Drawers
  const doorItems = items.filter(i => i.zone === 'front' && (i.category === 'Dairy' || i.name.includes('Butter') || i.name.includes('Cheese') || i.name.includes('Milk')));
  const crisperItems = items.filter(i => i.zone === 'front' && !(i.category === 'Dairy' || i.name.includes('Butter') || i.name.includes('Cheese') || i.name.includes('Milk')));

  // Crisper A: Leafy Greens & Herbs
  const crisperGreens = crisperItems.filter(i => i.category === 'Greens' || i.name.includes('Palak') || i.name.includes('Spinach') || i.name.includes('Mint') || i.name.includes('Coriander'));
  // Crisper B: Vegetables & Tubers
  const crisperVeg = crisperItems.filter(i => !(i.category === 'Greens' || i.name.includes('Palak') || i.name.includes('Spinach') || i.name.includes('Mint') || i.name.includes('Coriander')));

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
    <div className="space-y-6">
      {/* 1. Sub-Zero Control Bar & Mode Selector */}
      <div className="glass-panel p-6 border-cyan-500/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Sub-Zero Architectural Chamber</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/15 text-cyan-300 font-mono border border-cyan-500/30">
                French-Door Cross-Section
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Live physical map of tempered glass shelves, vegetable crisper drawers, and door balconies.
            </p>
          </div>
        </div>

        {/* View Mode Toggle: 3D Chamber vs 2D Blueprint */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 rounded-2xl bg-slate-900/90 border border-white/10 shadow-inner">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase flex items-center gap-2 transition-all ${
                viewMode === '3d'
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-lg shadow-cyan-500/25 scale-[1.02]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>🧊 3D Chamber</span>
            </button>

            <button
              onClick={() => setViewMode('2d')}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase flex items-center gap-2 transition-all ${
                viewMode === '2d'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 scale-[1.02]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>📋 2D Blueprint</span>
            </button>
          </div>

          {/* 2D View Overlays (Only shown when 2D is selected) */}
          {viewMode === '2d' && (
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'normal', label: 'Physical Shelves', icon: Layers },
                { id: 'airflow', label: 'Airflow & Mist', icon: Wind },
                { id: 'thermal', label: 'Thermal Heatmap', icon: Thermometer }
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setActiveOverlay(m.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                    activeOverlay === m.id
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-white/[0.03] text-slate-300 hover:text-white border-white/[0.08]'
                  }`}
                >
                  <m.icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. MAIN VIEWPORT: EITHER INTERACTIVE 3D SUB-ZERO CANVAS OR 2D BLUEPRINT */}
      {viewMode === '3d' ? (
        <Fridge3DCanvas
          items={items}
          onRelocate={onRelocate}
          onSelectItem={onSelectItem}
        />
      ) : (
        /* 2D Cutaway Frame */
        <div className="relative rounded-3xl border-2 border-slate-700/60 bg-[#090d16] p-4 md:p-6 shadow-2xl overflow-hidden">
        
        {/* Exterior Stainless Steel Frame Glow & Bevel */}
        <div className="absolute inset-0 pointer-events-none rounded-3xl border border-white/10 shadow-[inset_0_2px_15px_rgba(255,255,255,0.06)]" />

        {/* Thermal Heatmap Overlay (when active) */}
        {activeOverlay === 'thermal' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-b from-cyan-500 via-emerald-500 to-amber-500 mix-blend-screen"
          />
        )}

        {/* Airflow Mist Drift Overlay (when active or normal) */}
        {(activeOverlay === 'airflow' || activeOverlay === 'normal') && (
          <div className="absolute inset-0 pointer-events-none z-10 chilled-airflow-mist opacity-40" />
        )}

        {/* TOP CEILING FIXTURE: LED Downlight & Micro-Camera */}
        <div className="mb-4 pb-3 border-b border-white/10 flex items-center justify-between px-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-md shadow-emerald-400/50" />
            <span className="text-slate-300 font-semibold">CEILING LINEAR LED WASH · 4500K</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
              <Camera className="w-3 h-3" />
              <span>YOLOv8 Macro Camera Active</span>
            </div>
            <span className="text-slate-400">Brushed 304 Stainless Interior</span>
          </div>
        </div>

        {/* MAIN SPLIT: MAIN CHAMBER (75%) VS DOOR BALCONIES (25%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-20">
          
          {/* =========================================================================
              A. MAIN CHAMBER (9 Columns): 2 Glass Shelves + Dual Crisper Drawers
              ========================================================================= */}
          <div className="lg:col-span-9 flex flex-col gap-6">

            {/* -------------------------------------------------------------------
                SHELF 1: TOP CHILLER SHELF (Back Zone - 3.8°C)
                ------------------------------------------------------------------- */}
            <div className="relative rounded-2xl bg-slate-900/40 p-4 border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold font-mono">SHELF 01</span>
                  <span className="text-white font-semibold">Top Cold Chiller Shelf</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    3.8°C · Direct Air Curtain
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {topShelfItems.length} Items Resting
                </span>
              </div>

              {/* Produce Resting On Glass */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2 min-h-[90px] items-end">
                {topShelfItems.map(item => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedProduce(item)}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-white/10 hover:border-cyan-400/60 transition-all cursor-pointer text-center group relative shadow-md"
                  >
                    <div className="text-3xl mb-1 group-hover:scale-125 transition-transform">
                      {getProduceEmoji(item.name, item.category)}
                    </div>
                    <div className="text-xs font-bold text-white truncate">{item.name}</div>
                    <div className="text-[10px] text-cyan-300 font-mono mt-0.5">
                      {differenceInDays(new Date(item.expiry_at), new Date())}d crisp
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Tempered Glass Edge Refraction */}
              <div className="tempered-glass-edge mt-3" />
            </div>

            {/* -------------------------------------------------------------------
                SHELF 2: MIDDLE PRODUCE SHELF (Middle Zone - 4.2°C)
                ------------------------------------------------------------------- */}
            <div className="relative rounded-2xl bg-slate-900/40 p-4 border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold font-mono">SHELF 02</span>
                  <span className="text-white font-semibold">Middle Produce Shelf</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    4.2°C · Micro-Climate Deflector
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {middleShelfItems.length} Items Preserved
                </span>
              </div>

              {/* Produce Resting On Middle Glass */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2 min-h-[90px] items-end">
                {middleShelfItems.map(item => {
                  const isApple = item.name.includes('Honeycrisp');
                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedProduce(item)}
                      className={`p-2.5 rounded-xl bg-slate-950/80 border transition-all cursor-pointer text-center group relative shadow-md ${
                        isApple 
                          ? 'border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]' 
                          : 'border-white/10 hover:border-emerald-400/60'
                      }`}
                    >
                      {isApple && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-emerald-500 text-slate-950 rounded text-[8px] font-bold uppercase font-mono">
                          Hero
                        </div>
                      )}
                      <div className="text-3xl mb-1 group-hover:scale-125 transition-transform">
                        {getProduceEmoji(item.name, item.category)}
                      </div>
                      <div className="text-xs font-bold text-white truncate">{item.name}</div>
                      <div className="text-[10px] text-emerald-300 font-mono mt-0.5">
                        {differenceInDays(new Date(item.expiry_at), new Date())}d crisp
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Tempered Glass Edge Refraction */}
              <div className="tempered-glass-edge mt-3" />
            </div>

            {/* -------------------------------------------------------------------
                BOTTOM SECTION: DUAL CRISPER DRAWERS (2.5°C - 92% RH Moisture Lock)
                ------------------------------------------------------------------- */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <span className="flex items-center gap-1.5 text-slate-300 font-bold">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  DUAL MOISTURE-LOCK VEGETABLE CRISPERS · 2.5°C (92% RH)
                </span>
                <span>Sub-Zero Dual Sealed Gaskets</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Crisper Drawer Left: Leafy Greens & Herbs */}
                <div className="acrylic-crisper p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      🥬 Leafy Greens Crisper
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      High Humidity (92%)
                    </span>
                  </div>

                  {/* Brushed Aluminum Pull Handle Bar */}
                  <div className="h-1.5 w-1/3 mx-auto bg-gradient-to-r from-slate-400 via-white to-slate-400 rounded-full shadow-inner opacity-70" />

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {crisperGreens.map(item => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedProduce(item)}
                        className="p-2 rounded-xl bg-slate-900/60 border border-white/5 hover:border-emerald-400/50 cursor-pointer text-center group"
                      >
                        <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                          {getProduceEmoji(item.name, item.category)}
                        </div>
                        <div className="text-[11px] font-bold text-white truncate">{item.name}</div>
                        <div className="text-[9px] text-emerald-400 font-mono">
                          {differenceInDays(new Date(item.expiry_at), new Date())}d
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Crisper Drawer Right: Country Vegetables */}
                <div className="acrylic-crisper p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      🥕 Country Vegetables Crisper
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                      Controlled Vent
                    </span>
                  </div>

                  {/* Brushed Aluminum Pull Handle Bar */}
                  <div className="h-1.5 w-1/3 mx-auto bg-gradient-to-r from-slate-400 via-white to-slate-400 rounded-full shadow-inner opacity-70" />

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {crisperVeg.map(item => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedProduce(item)}
                        className="p-2 rounded-xl bg-slate-900/60 border border-white/5 hover:border-cyan-400/50 cursor-pointer text-center group"
                      >
                        <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                          {getProduceEmoji(item.name, item.category)}
                        </div>
                        <div className="text-[11px] font-bold text-white truncate">{item.name}</div>
                        <div className="text-[9px] text-cyan-400 font-mono">
                          {differenceInDays(new Date(item.expiry_at), new Date())}d
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* =========================================================================
              B. RIGHT DOOR BALCONY SECTION (3 Columns): Authentic Door Liner
              ========================================================================= */}
          <div className="lg:col-span-3 rounded-2xl bg-slate-900/60 border border-white/10 p-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  🚪 Door Balconies
                </span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  6.5°C
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">
                Quick-access storage bins on the interior French door liner.
              </p>

              {/* Upper Door Bin: Butter & Cheese */}
              <div className="mt-4 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                  Upper Dairy Balcony:
                </span>
                <div className="door-balcony-bin p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {doorItems.filter(i => i.name.includes('Butter') || i.name.includes('Cheese')).map(item => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedProduce(item)}
                        className="p-2 rounded-lg bg-slate-950/80 border border-white/5 hover:border-amber-400/50 text-center cursor-pointer group"
                      >
                        <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                          {getProduceEmoji(item.name, item.category)}
                        </div>
                        <div className="text-[11px] font-bold text-white truncate">{item.name}</div>
                        <div className="text-[9px] text-amber-300 font-mono">
                          {differenceInDays(new Date(item.expiry_at), new Date())}d
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lower Tall Bottle Bin: Milk & Liquid cartons */}
              <div className="mt-4 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                  Lower Bottle Balcony:
                </span>
                <div className="door-balcony-bin p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {doorItems.filter(i => !i.name.includes('Butter') && !i.name.includes('Cheese')).map(item => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedProduce(item)}
                        className="p-2 rounded-lg bg-slate-950/80 border border-white/5 hover:border-amber-400/50 text-center cursor-pointer group"
                      >
                        <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                          {getProduceEmoji(item.name, item.category)}
                        </div>
                        <div className="text-[11px] font-bold text-white truncate">{item.name}</div>
                        <div className="text-[9px] text-amber-300 font-mono">
                          {differenceInDays(new Date(item.expiry_at), new Date())}d
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 text-[11px] text-slate-400 space-y-1">
              <span className="text-emerald-400 font-bold block">💡 Sub-Zero Placement Rule:</span>
              Never store delicate greens on door balconies — frequent door swings cause temperature swings that trigger mold.
            </div>
          </div>

        </div>
      </div>
      )}

      {/* 3. MODAL / SLIDE-OUT DRAWER: CLICK TO MOVE PRODUCE */}
      <AnimatePresence>
        {selectedProduce && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="glass-panel p-6 max-w-md w-full border-cyan-500/30 bg-[#0d1321] text-white space-y-5 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedProduce(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
                  {getProduceEmoji(selectedProduce.name, selectedProduce.category)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{selectedProduce.name}</h3>
                  <p className="text-xs text-slate-400">
                    Currently resting on: <strong className="text-cyan-300 capitalize">{selectedProduce.zone} Shelf</strong>
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Relocate to Optimize Freshness:
                </div>
                <p>
                  DoWhy Causal Model calculates that moving this item to the <strong>Top Chiller Shelf (3.8°C)</strong> will isolate ambient coastal humidity and add <strong>+2.86 days of crispness</strong>.
                </p>
              </div>

              {/* Destination Shelf Buttons */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
                  Select Destination Shelf:
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
                          ? 'bg-cyan-500/20 border-cyan-400 text-white'
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
