import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Leaf, TrendingUp, Globe, Users, Award, TreePine } from 'lucide-react';

interface ImpactData {
    co2_saved: number;
    items_rescued: number;
    eco_score: number;
    rank: string;
    neighborhood_rank: string;
    history: any[];
    leaderboard: any[];
}

export const ImpactTab: React.FC<{ data: ImpactData | null }> = ({ data }) => {
    if (!data) return (
        <div className="flex items-center justify-center py-20 opacity-30 font-mono text-xs uppercase animate-pulse">
            Fetching Global Sustainability Data...
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-3xl">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3 text-emerald-400">
                        <Globe className="w-7 h-7" />
                        Sustainability Impact
                    </h2>
                    <p className="text-xs font-mono opacity-50 uppercase mt-1">Live Carbon Footprint Reduction Dashboard</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-400 font-mono">{data.rank}</div>
                    <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Current Status</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black/20 border border-white/5 p-6 rounded-3xl">
                    <TreePine className="w-6 h-6 text-emerald-400 mb-2" />
                    <div className="text-3xl font-bold">{data.co2_saved}kg</div>
                    <div className="text-[10px] font-mono opacity-40 uppercase mt-1">CO₂ Prevented</div>
                </div>
                <div className="bg-black/20 border border-white/5 p-6 rounded-3xl">
                    <Award className="w-6 h-6 text-emerald-400 mb-2" />
                    <div className="text-3xl font-bold">{data.items_rescued}</div>
                    <div className="text-[10px] font-mono opacity-40 uppercase mt-1">Items Rescued</div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl">
                    <TrendingUp className="w-6 h-6 text-emerald-400 mb-2" />
                    <div className="text-sm font-bold text-emerald-400">{data.neighborhood_rank}</div>
                    <div className="text-[10px] font-mono opacity-40 uppercase mt-1">Global Standing</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-black/20 border border-white/5 rounded-3xl p-6">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest opacity-50 mb-6">Carbon Saved (kg)</h3>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.history}>
                                <defs>
                                    <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#ffffff30', fontSize: 10, fontFamily: 'monospace' }} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ background: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }}
                                    itemStyle={{ color: '#10b981' }}
                                />
                                <Area type="monotone" dataKey="saved" stroke="#10b981" fillOpacity={1} fill="url(#colorImpact)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-black/20 border border-white/5 rounded-3xl p-6">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest opacity-50 mb-6 flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        Neighborhood Leaderboard
                    </h3>
                    <div className="space-y-4">
                        {data.leaderboard.map((user, i) => (
                            <div key={user.user} className={`flex items-center justify-between p-3 rounded-2xl border ${
                                user.user === 'You' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/5'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-mono">
                                        {i + 1}
                                    </div>
                                    <span className="text-sm font-bold">{user.user}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-emerald-400">{user.score} pts</div>
                                    <div className="text-[9px] font-mono opacity-50 uppercase">{user.saved}kg CO₂</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
