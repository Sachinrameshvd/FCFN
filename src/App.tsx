/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Mic,
  MicOff,
  RefreshCw,
  Shield,
  Trash2,
  AlertTriangle,
  Info,
  ChevronRight,
  Wind,
  Thermometer,
  Droplets,
  Network,
  BrainCircuit,
  ShoppingBag,
  Plus,
  X,
  Utensils,
  Store,
  Users,
  BookOpen,
  CloudLightning,
  Leaf
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, differenceInDays, addDays } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { geminiService, type FridgeItem } from './services/geminiService';
import { AddItemModal } from './components/AddItemModal';
import { RecipesTab } from './components/tabs/RecipesTab';
import { MarketTab } from './components/tabs/MarketTab';
import { CommunityTab } from './components/tabs/CommunityTab';
import { CausalTab } from './components/tabs/CausalTab';
import { NetworkTab } from './components/tabs/NetworkTab';
import { EducationTab } from './components/tabs/EducationTab';
import { ImpactBadge } from './components/ImpactBadge';
import { ImpactTab } from './components/tabs/ImpactTab';

import confetti from 'canvas-confetti';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const ZoneBadge = ({ zone }: { zone: string }) => {
  const colors: Record<string, string> = {
    front: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    middle: 'bg-green-500/20 text-green-400 border-green-500/30',
    back: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] uppercase font-mono border", colors[zone] || colors.middle)}>
      {zone}
    </span>
  );
};

const SpoilageIndicator = ({ expiryDate }: { expiryDate: string }) => {
  const daysLeft = differenceInDays(new Date(expiryDate), new Date());
  const percentage = Math.max(0, Math.min(100, (daysLeft / 7) * 100));

  let color = 'bg-fridge-accent';
  if (daysLeft < 2) color = 'bg-red-500';
  else if (daysLeft < 4) color = 'bg-yellow-500';

  return (
    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-2">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        className={cn("h-full transition-colors", color)}
      />
    </div>
  );
};

export default function App() {
  const [items, setItems] = useState<FridgeItem[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'map' | 'causal' | 'network' | 'recipes' | 'market' | 'community' | 'education' | 'impact'>('inventory');
  const [selectedItem, setSelectedItem] = useState<FridgeItem | null>(null);
  const [causalInsight, setCausalInsight] = useState<string | null>(null);
  const [voiceResponse, setVoiceResponse] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetZone, setTargetZone] = useState<string | null>(null);
  const [showManualAdd, setShowManualAdd] = useState(false);

  // New States
  const [recipes, setRecipes] = useState<string | null>(null);
  const [shoppingList, setShoppingList] = useState<any[]>([]);
  const [marketTrends, setMarketTrends] = useState<any[]>([]);
  const [communityBoard, setCommunityBoard] = useState<any[]>([]);
  const [educationContent, setEducationContent] = useState<string | null>(null);
  const [weatherAlert, setWeatherAlert] = useState<any>(null);
  const [impactData, setImpactData] = useState<any>(null);
  const [forecasts, setForecasts] = useState<any[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchItems();
    fetchNodes();
    fetchShopping();
    fetchMarket();
    fetchCommunity();
    fetchWeather();
    fetchImpact();
    fetchForecasts();
  }, []);

  const fetchItems = async () => {
    const res = await fetch('/api/items');
    const data = await res.json();
    setItems(data);
  };

  const fetchForecasts = async () => {
    try {
      const res = await fetch('/api/forecast');
      if (res.ok) {
        const data = await res.json();
        setForecasts(data);
      }
    } catch (e) {
      console.error("Forecast fetch failed", e);
    }
  };

  const fetchImpact = async () => {
    try {
      const res = await fetch('/api/impact');
      if (res.ok) {
        const data = await res.json();
        setImpactData(data);
      }
    } catch (e) {
      console.error("Impact fetch failed", e);
    }
  };

  const fetchShopping = async () => {
    const res = await fetch('/api/shopping');
    const data = await res.json();
    setShoppingList(data);
  };

  const fetchMarket = async () => {
    const res = await fetch('/api/market');
    const data = await res.json();
    setMarketTrends(data);
  };

  const fetchCommunity = async () => {
    const res = await fetch('/api/community');
    const data = await res.json();
    setCommunityBoard(data);
  };

  const fetchWeather = async () => {
    const res = await fetch('/api/weather');
    const data = await res.json();
    setWeatherAlert(data);
  };

  const syncExpiredItems = async () => {
    setIsProcessing(true);
    const res = await fetch('/api/shopping/sync-expired', { method: 'POST' });
    const data = await res.json();
    if (data.count > 0) {
      fetchItems();
      fetchShopping();
      confetti({
        particleCount: 50,
        spread: 30,
        origin: { y: 0.8 },
        colors: ['#ef4444', '#ffffff']
      });
    }
    setIsProcessing(false);
  };

  const fetchNodes = async () => {
    const res = await fetch('/api/federated/status');
    const data = await res.json();
    setNodes(data);
  };

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // Wait for camera to stabilize
        await new Promise(r => setTimeout(r, 2000));

        if (canvasRef.current && videoRef.current) {
          const context = canvasRef.current.getContext('2d');
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          context?.drawImage(videoRef.current, 0, 0);

          const base64Image = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
          const detectedItems = await geminiService.identifyFood(base64Image);

          // Add detected items to DB
          for (const item of detectedItems) {
            await fetch('/api/items', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: item.name,
                category: item.category,
                vendor_type: 'street', // Default for demo
                zone: item.recommendedZone,
                expiry_at: addDays(new Date(), 5).toISOString()
              })
            });
          }

          fetchItems();
        }

        stream.getTracks().forEach(track => track.stop());
      }
    } catch (err) {
      console.error("Scan error:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleVoiceCommand = async () => {
    if (isRecording) {
      setIsRecording(false);
      // In a real app, we'd capture audio here. For this demo, we'll simulate a query.
      setIsProcessing(true);
      const simulatedQuery = "How is my tomato doing and how should I wash it?";
      const response = await geminiService.voiceAssistant(simulatedQuery, items);
      setVoiceResponse(response);
      setIsProcessing(false);
    } else {
      setIsRecording(true);
    }
  };

  const selectItemForAnalysis = (item: FridgeItem) => {
    setSelectedItem(item);
    setCausalInsight(null);
    setTargetZone(null);
    setActiveTab('causal');
  };

  const performCausalAnalysis = async (item: FridgeItem, zone: string) => {
    setTargetZone(zone);
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/predict/${item.id}?target_zone=${targetZone}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      // Use local report if available, otherwise fetch from Gemini
      if (data.report_text) {
        setCausalInsight(data.report_text);
      } else {
        const insight = await geminiService.getCausalInsight(item, targetZone);
        setCausalInsight(insight);
      }

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00FF00', '#ffffff', '#22c55e']
      });
    } catch (err: any) {
      console.error("Causal analysis failed:", err);
      const isStatus503 = err.message?.includes('503') || err.toString().includes('503');
      setCausalInsight(
        isStatus503
          ? "The Causal Engine (Python) is not responding. Please make sure the terminal running uvicorn is still open."
          : "System encountered an error generating the report. This is usually due to an invalid Gemini API Key or the AI model being overloaded. Please check your .env file."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteItem = async (id: number) => {
    await fetch(`/api/items/${id}`, { method: 'DELETE' });
    fetchItems();
    fetchShopping();
  };

  const deleteShopping = async (id: string | number) => {
    await fetch(`/api/shopping/${id}`, { method: 'DELETE' });
    fetchShopping();
  };

  const shareToCommunity = async (item: FridgeItem) => {
    await fetch('/api/community/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: item.name,
        expiry_at: item.expiry_at,
        location: 'Chennai'
      })
    });
    fetchCommunity();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#ffffff']
    });
  };

  const generateRecipes = async () => {
    setIsProcessing(true);
    const res = await geminiService.generateRecipes(items);
    setRecipes(res);
    setIsProcessing(false);
    setActiveTab('recipes');
  };

  const fetchEducation = async () => {
    if (educationContent) return;
    setIsProcessing(true);
    const res = await geminiService.getPesticideEducation();
    setEducationContent(res);
    setIsProcessing(false);
  };

  const handleManualAdd = async (item: any) => {
    await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });

    fetchItems();

    confetti({
      particleCount: 50,
      spread: 40,
      origin: { y: 0.8 },
      colors: ['#00FF00', '#ffffff']
    });
  };

  return (
    <div id="app-root" className="min-h-screen flex flex-col md:flex-row p-4 md:p-8 gap-6 max-w-7xl mx-auto">
      {/* Left Column: Fridge Interface */}
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        <div className="glass-panel p-6 flex flex-col gap-6 border-fridge-accent/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-mono font-bold tracking-tighter text-fridge-accent">FCFN-NET</h1>
              <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Federated Causal Fresh Net</p>
            </div>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-fridge-accent animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-fridge-accent/30" />
            </div>
          </div>

          {/* Environmental Sensors */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <Thermometer className="w-4 h-4 mb-1 text-blue-400" />
              <div className="text-lg font-mono">4.2°C</div>
              <div className="text-[9px] uppercase opacity-50">Internal</div>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5 relative">
              <Droplets className="w-4 h-4 mb-1 text-cyan-400" />
              <div className="text-lg font-mono">{weatherAlert?.humidity || 88}%</div>
              <div className="text-[9px] uppercase opacity-50">Humidity</div>
              {weatherAlert?.humidity > 90 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              )}
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <Wind className="w-4 h-4 mb-1 text-emerald-400" />
              <div className="text-lg font-mono">High</div>
              <div className="text-[9px] uppercase opacity-50">Airflow</div>
            </div>
          </div>

          {/* Weather Alert */}
          {weatherAlert && weatherAlert.humidity > 90 && (
            <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex gap-3 items-start">
              <CloudLightning className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] font-bold text-red-500 uppercase mb-0.5">Humidity Alert</div>
                <p className="text-[10px] opacity-80 leading-tight">{weatherAlert.alert}</p>
              </div>
            </div>
          )}

          {/* Sustainability Scorecard */}
          <ImpactBadge 
            score={impactData?.eco_score || 0} 
            co2Saved={impactData?.co2_saved || 0} 
          />

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                onClick={handleScan}
                disabled={isScanning}
                className={cn(
                  "flex-1 py-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border",
                  isScanning ? "bg-white/5 border-white/10 opacity-50" : "bg-fridge-accent/10 border-fridge-accent/30 hover:bg-fridge-accent/20"
                )}
              >
                <Camera className={cn("w-6 h-6", isScanning && "animate-spin")} />
                <span className="text-[10px] font-mono uppercase font-bold">Scan Fridge</span>
              </button>
              <button
                onClick={handleVoiceCommand}
                className={cn(
                  "flex-1 py-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border",
                  isRecording ? "bg-red-500/20 border-red-500/50" : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
              >
                {isRecording ? <MicOff className="w-6 h-6 text-red-500" /> : <Mic className="w-6 h-6" />}
                <span className="text-[10px] font-mono uppercase font-bold">{isRecording ? "Listening..." : "Voice Command"}</span>
              </button>
            </div>

            <button
              onClick={() => setShowManualAdd(true)}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-all group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span className="text-[10px] font-mono uppercase font-bold">Add Item Manually</span>
            </button>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={async () => {
                  await fetch('/api/items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: "Brinjal",
                      category: "Vegetable",
                      vendor_type: 'street',
                      zone: 'middle',
                      expiry_at: addDays(new Date(), 4).toISOString()
                    })
                  });
                  fetchItems();
                }}
                className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono uppercase hover:bg-white/10 transition-all"
              >
                + Brinjal
              </button>
              <button
                onClick={async () => {
                  await fetch('/api/items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: "Ladies Finger",
                      category: "Vegetable",
                      vendor_type: 'street',
                      zone: 'front',
                      expiry_at: addDays(new Date(), 3).toISOString()
                    })
                  });
                  fetchItems();
                }}
                className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono uppercase hover:bg-white/10 transition-all"
              >
                + Ladies Finger
              </button>
              <button
                onClick={async () => {
                  await fetch('/api/items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: "Paneer",
                      category: "Dairy",
                      vendor_type: 'supermarket',
                      zone: 'back',
                      expiry_at: addDays(new Date(), 7).toISOString()
                    })
                  });
                  fetchItems();
                }}
                className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono uppercase hover:bg-white/10 transition-all"
              >
                + Paneer
              </button>
            </div>
          </div>

          {/* Hidden video/canvas for scanning */}
          <video ref={videoRef} className="hidden" />
          <canvas ref={canvasRef} className="hidden" />

          {/* Voice Response Area */}
          <AnimatePresence>
            {voiceResponse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-fridge-accent/5 border border-fridge-accent/20 p-4 rounded-xl relative"
              >
                <button
                  onClick={() => setVoiceResponse(null)}
                  className="absolute top-2 right-2 text-[10px] opacity-50 hover:opacity-100"
                >
                  CLOSE
                </button>
                <p className="text-xs leading-relaxed italic font-serif text-fridge-accent/90">
                  "{voiceResponse}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* System Status */}
        <div className="glass-panel p-6 border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-fridge-accent" />
            <h2 className="text-xs font-mono uppercase tracking-widest">Privacy Shield Active</h2>
          </div>
          <p className="text-[11px] opacity-60 leading-relaxed">
            All data processed locally. Only encrypted model weights are shared with the federated network. Raw images never leave your fridge.
          </p>
        </div>
      </div>

      {/* Right Column: Content Area */}
      <div id="content-area" className="flex-1 flex flex-col gap-6">
        <AddItemModal
          isOpen={showManualAdd}
          onClose={() => setShowManualAdd(false)}
          onAdd={handleManualAdd}
        />

        {/* Tabs */}
        <div id="navigation-tabs" className="flex gap-1 bg-white/5 p-1 rounded-xl self-start overflow-x-auto max-w-full no-scrollbar">
          {[
            { id: 'inventory', label: 'Inventory', icon: ShoppingBag },
            { id: 'map', label: 'Fridge Map', icon: Wind },
            { id: 'recipes', label: 'Recipes', icon: Utensils },
            { id: 'market', label: 'Market', icon: Store },
            { id: 'community', label: 'Community', icon: Users },
            { id: 'causal', label: 'Causal', icon: BrainCircuit },
            { id: 'impact', label: 'Impact', icon: Leaf },
            { id: 'network', label: 'Network', icon: Network },
            { id: 'education', label: 'Education', icon: BookOpen },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'education') fetchEducation();
              }}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-mono uppercase flex items-center gap-2 transition-all whitespace-nowrap",
                activeTab === tab.id ? "bg-fridge-accent text-fridge-bg font-bold" : "hover:bg-white/5 opacity-60"
              )}
            >
              <tab.icon className="w-3 h-3" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0">
          <AnimatePresence mode="wait">
            {activeTab === 'inventory' && (
              <motion.div
                id="inventory-tab"
                key="inventory"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
              >
                {items.length === 0 ? (
                  <div className="col-span-full py-20 text-center opacity-30">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-4" />
                    <p className="font-mono uppercase text-sm">Fridge is empty. Scan to add items.</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="glass-panel p-4 group hover:border-fridge-accent/40 transition-all cursor-pointer relative"
                      onClick={() => selectItemForAnalysis(item)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{item.name}</h3>
                          <p className="text-[10px] opacity-50 uppercase font-mono">{item.category} • {item.vendor_type} vendor</p>
                        </div>
                        <div className="flex gap-2">
                          {item.vendor_type === 'street' && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 font-mono animate-pulse">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              PESTICIDE RISK
                            </span>
                          )}
                          <ZoneBadge zone={item.zone} />
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); shareToCommunity(item); }}
                              className="p-1 hover:text-blue-400"
                              title="Share with Community"
                            >
                              <Users className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                              className="p-1 hover:text-red-500"
                              title="Used / Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono mt-4">
                        <span className="opacity-50">FRESHNESS SCORE</span>
                        <span className={cn(
                          differenceInDays(new Date(item.expiry_at), new Date()) < 2 ? "text-red-400" : "text-fridge-accent"
                        )}>
                          {differenceInDays(new Date(item.expiry_at), new Date())} DAYS LEFT
                        </span>
                      </div>
                      <SpoilageIndicator expiryDate={item.expiry_at} />
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'map' && (
              <motion.div
                id="map-tab"
                key="map"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel p-6 h-full flex flex-col gap-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Fridge Map</h2>
                  <div className="flex gap-4 text-[10px] font-mono uppercase opacity-50">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      Expiring Soon
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      Pesticide Risk
                    </div>
                  </div>
                </div>

                <div className="flex-1 grid grid-rows-3 gap-4 border-2 border-white/5 rounded-2xl p-4 bg-black/20 relative overflow-hidden">
                  {/* Background Gradient for Temperature */}
                  <div className="absolute inset-0 bg-linear-to-b from-blue-500/5 via-transparent to-red-500/5 pointer-events-none" />

                  {['back', 'middle', 'front'].map((zone) => (
                    <div key={zone} className="relative border border-white/5 rounded-xl p-4 flex flex-col gap-3 bg-white/5 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase font-bold opacity-30 tracking-widest">{zone} zone</span>
                        <span className="text-[9px] font-mono opacity-20">
                          {zone === 'back' ? '4°C • HIGH AIRFLOW' : zone === 'middle' ? '5°C • OPTIMAL' : '7°C • DOOR AREA'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {items.filter(i => i.zone === zone).map(item => {
                          const isExpiring = differenceInDays(new Date(item.expiry_at), new Date()) < 2;
                          const hasRisk = item.vendor_type === 'street';

                          return (
                            <motion.div
                              key={item.id}
                              whileHover={{ scale: 1.05 }}
                              onClick={() => selectItemForAnalysis(item)}
                              className={cn(
                                "px-3 py-2 rounded-lg border text-xs font-mono transition-all cursor-pointer flex items-center gap-2",
                                isExpiring ? "bg-red-500/20 border-red-500/50 text-red-200 shadow-[0_0_10px_rgba(239,68,68,0.2)]" :
                                  hasRisk ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-200" :
                                    "bg-white/5 border-white/10 text-white/80 hover:border-fridge-accent/50"
                              )}
                            >
                              {isExpiring && <AlertTriangle className="w-3 h-3 text-red-500" />}
                              {hasRisk && !isExpiring && <Shield className="w-3 h-3 text-yellow-500" />}
                              {item.name}
                            </motion.div>
                          );
                        })}
                        {items.filter(i => i.zone === zone).length === 0 && (
                          <div className="text-[10px] opacity-10 font-mono uppercase py-2">Empty</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'recipes' && (
              <RecipesTab
                recipes={recipes}
                isProcessing={isProcessing}
                onGenerate={generateRecipes}
              />
            )}

            {activeTab === 'market' && (
              <MarketTab
                shoppingList={shoppingList}
                marketTrends={marketTrends}
                forecasts={forecasts}
                isProcessing={isProcessing}
                onSyncExpired={syncExpiredItems}
                onDeleteShopping={deleteShopping}
              />
            )}

            {activeTab === 'community' && (
              <CommunityTab communityBoard={communityBoard} />
            )}

            {activeTab === 'causal' && (
              <CausalTab
                selectedItem={selectedItem}
                causalInsight={causalInsight}
                isProcessing={isProcessing}
                onAnalyze={performCausalAnalysis}
              />
            )}

            {activeTab === 'impact' && (
              <ImpactTab data={impactData} />
            )}

            {activeTab === 'network' && (
              <NetworkTab nodes={nodes} />
            )}

            {activeTab === 'education' && (
              <EducationTab content={educationContent} isProcessing={isProcessing} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
