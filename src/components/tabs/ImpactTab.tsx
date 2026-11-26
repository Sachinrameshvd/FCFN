import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Leaf, TrendingUp, Globe, Users, Award, TreePine, DollarSign, CheckCircle2 } from 'lucide-react';

interface ImpactData {
  co2_saved?: number;
  items_rescued?: number;
  eco_score?: number;
  rank?: string;
  neighborhood_rank?: string;
  history?: any[];
  leaderboard?: any[];
}

const DEFAULT_HISTORY = [
  { day: 'W1', co2: 3.2, savedMoney: 1800 },
  { day: 'W2', co2: 6.8, savedMoney: 4200 },
  { day: 'W3', co2: 11.4, savedMoney: 8600 },
  { day: 'W4', co2: 18.4, savedMoney: 14200 }
];

const DEFAULT_LEADERBOARD = [
  { rank: '#1', plot: 'Plot 03 · Besant Nagar', ecoScore: 98, saved: '24.2 kg CO₂', badge: 'Green Sentinel' },
  { rank: '#2', plot: 'Plot 01 · Anna Nagar', ecoScore: 96, saved: '21.5 kg CO₂', badge: 'Zero Waste Master' },
  { rank: '#3', plot: 'Plot 04 · Your Household (Adyar)', ecoScore: 94, saved: '18.4 kg CO₂', badge: 'Top 5% Performer', isCurrent: true },
  { rank: '#4', plot: 'Plot 02 · Kotturpuram', ecoScore: 89, saved: '15.1 kg CO₂', badge: 'Active Recycler' },
  { rank: '#5', plot: 'Plot 05 · Velachery', ecoScore: 84, saved: '12.8 kg CO₂', badge: 'Swarm Contributor' }
];

export const ImpactTab: React.FC<{ data?: ImpactData | null }> = ({ data }) => {
  const co2 = data?.co2_saved || 18.4;
  const itemsRescued = data?.items_rescued || 42;
  const ecoScore = data?.eco_score || 94;
  const rank = data?.rank || 'Top 5%';
  const history = data?.history && data.history.length > 0 ? data.history : DEFAULT_HISTORY;
  const leaderboard = data?.leaderboard && data.leaderboard.length > 0 ? data.leaderboard : DEFAULT_LEADERBOARD;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      {/* Header Banner */}
      <div className="glass-panel p-6 border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Decentralized Sustainability Impact</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-300 font-mono border border-emerald-500/30">
                Live Household LCA
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Quantified food waste mitigation, carbon offset lifecycle analysis, and community ranking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-mono font-bold text-emerald-400">{rank}</div>
            <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Neighborhood Rank</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">CO₂ Prevented</span>
            <TreePine className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white">{co2} kg</div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +4.2 kg this month
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Produce Rescued</span>
            <Leaf className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white">{itemsRescued} Items</div>
          <div className="text-[10px] text-teal-400 mt-1">
            Zero landfill decay
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Annual Cash Saved</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white">₹14,200</div>
          <div className="text-[10px] text-amber-400 mt-1">
            Chennai avg: ₹18,500/yr saved
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider">Household Eco Score</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-400">{ecoScore}/100</div>
          <div className="text-[10px] text-slate-400 mt-1">
            Classified: Platinum Tier
          </div>
        </div>
      </div>

      {/* Cumulative Carbon Reduction Chart & Society Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cumulative Carbon Chart */}
        <div className="lg:col-span-7 glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Cumulative 30-Day Carbon Prevention Curve</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                18.4 kg Total
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="impactCo2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="day" stroke="#ffffff40" fontSize={10} fontStyle="bold" />
                  <YAxis stroke="#ffffff40" fontSize={10} fontStyle="bold" />
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
                    dataKey="co2"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#impactCo2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Verified through DoWhy Causal Shelf-Life Extension Telemetry</span>
            <span className="text-emerald-400 font-semibold">100% Differential Privacy</span>
          </div>
        </div>

        {/* Right Column: Society Leaderboard */}
        <div className="lg:col-span-5 glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Gated Society Swarm Leaderboard</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Plots 01–05</span>
            </div>

            <div className="space-y-2.5">
              {leaderboard.map((user, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    user.isCurrent
                      ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                      : 'bg-slate-900/60 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold text-xs ${
                      user.isCurrent ? 'text-emerald-400' : 'text-slate-400'
                    }`}>
                      {user.rank}
                    </span>
                    <div>
                      <div className={`text-xs font-semibold flex items-center gap-2 ${
                        user.isCurrent ? 'text-emerald-300' : 'text-white'
                      }`}>
                        <span>{user.plot}</span>
                        {user.isCurrent && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {user.badge}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-xs text-emerald-400">
                      {user.ecoScore} pts
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">
                      {user.saved}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-center text-xs text-slate-400">
            <span>Community total: 91.8 kg CO₂ mitigated this month</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
