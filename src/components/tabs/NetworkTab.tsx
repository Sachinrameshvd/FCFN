import React from 'react';
import { motion } from 'framer-motion';
import { Network, ShieldCheck, Activity, Cpu, ArrowUpRight, Lock, CheckCircle2, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

interface NetworkTabProps {
  nodes?: any[];
}

const DEFAULT_NODES = [
  { id: 'FCFN-NODE-01', location: 'Plot 01 · Anna Nagar', role: 'Edge Client', updates: 342, status: 'Active Sync', latency: '4.2ms' },
  { id: 'FCFN-NODE-02', location: 'Plot 02 · Kotturpuram', role: 'Edge Client', updates: 298, status: 'Active Sync', latency: '3.8ms' },
  { id: 'FCFN-NODE-03', location: 'Plot 03 · Besant Nagar', role: 'Edge Client', updates: 388, status: 'Active Sync', latency: '5.1ms' },
  { id: 'FCFN-NODE-04', location: 'Plot 04 · Adyar (Your Fridge)', role: 'Local Coordinator', updates: 412, status: 'Master Node', latency: '0.8ms', isSelf: true },
  { id: 'FCFN-NODE-05', location: 'Plot 05 · Velachery', role: 'Edge Client', updates: 276, status: 'Active Sync', latency: '4.6ms' }
];

const ACCURACY_HISTORY = [
  { round: 'R1', accuracy: 71.2, loss: 0.68 },
  { round: 'R2', accuracy: 76.5, loss: 0.52 },
  { round: 'R3', accuracy: 81.8, loss: 0.41 },
  { round: 'R4', accuracy: 86.4, loss: 0.32 },
  { round: 'R5', accuracy: 90.7, loss: 0.24 },
  { round: 'R6', accuracy: 94.2, loss: 0.17 }
];

const BANDWIDTH_COMPARISON = [
  { metric: 'Cloud Image Upload', sizeMB: 480, privacy: '0% (Raw Camera Leak)' },
  { metric: 'FedAvg Encrypted Weights', sizeMB: 0.042, privacy: '100% Differential Privacy' }
];

export const NetworkTab: React.FC<NetworkTabProps> = ({ nodes }) => {
  const nodeList = nodes && nodes.length > 0 ? nodes : DEFAULT_NODES;

  return (
    <motion.div 
      id="network-tab"
      key="network"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      {/* Header Banner */}
      <div className="glass-panel p-6 border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Decentralized Federated Swarm</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-300 font-mono border border-emerald-500/30">
                FedAvg 1.7 Protocol
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              5 heterogeneous household nodes collaboratively train causal degradation weights without transmitting raw food images.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-mono font-bold text-emerald-400">42 KB</div>
            <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Encrypted Vector Payload</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 5 Society Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
        {nodeList.map((node, i) => (
          <div
            key={node.id || i}
            className={`glass-card p-4 flex flex-col justify-between ${
              node.isSelf ? 'border-emerald-500/40 bg-emerald-500/10' : ''
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono text-slate-400">
                  {node.id}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="font-bold text-xs text-white">
                {node.location}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {node.role}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-400">{node.latency} latency</span>
              <span className="text-emerald-400 font-bold">{node.updates} syn</span>
            </div>
          </div>
        ))}
      </div>

      {/* Accuracy Convergence Chart & Differential Privacy Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Swarm Convergence */}
        <div className="lg:col-span-7 glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Swarm Causal Convergence Curve (Rounds 1–6)</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                94.2% Peak Accuracy
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ACCURACY_HISTORY}>
                  <defs>
                    <linearGradient id="netAcc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="round" stroke="#ffffff40" fontSize={10} fontStyle="bold" />
                  <YAxis domain={[60, 100]} stroke="#ffffff40" fontSize={10} fontStyle="bold" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#10b98130',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#netAcc)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Federated Averaging weight updates aggregated every 12 hours</span>
            <span className="text-emerald-400 font-semibold">Flower 1.7 P2P Mesh</span>
          </div>
        </div>

        {/* Right: Privacy Shield & Bandwidth Proof */}
        <div className="lg:col-span-5 glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Zero-Cloud Privacy Guarantee</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">100% Differential Privacy</span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">DIFFERENTIAL PRIVACY BUDGET</span>
                  <span className="text-emerald-400 font-bold">ε = 1.2, δ = 10⁻⁵</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">WEIGHT VECTOR PAYLOAD</span>
                  <span className="text-cyan-400 font-bold">42 KB Encrypted</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">RAW IMAGE UPLOAD</span>
                  <span className="text-emerald-400 font-bold">0 Bytes (Zero Cloud)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2 text-xs text-slate-300 leading-relaxed">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Why This Outperforms Big Tech IoT:</span>
                </div>
                <p>
                  Typical smart fridges upload raw camera photographs to centralized corporate servers. FedCausalFreshNet runs edge YOLOv8 + DoWhy inference on-device and transmits only differential privacy gradients.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-center text-xs text-slate-400">
            <span>Communication overhead reduced by 99.991% vs raw video streaming</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
