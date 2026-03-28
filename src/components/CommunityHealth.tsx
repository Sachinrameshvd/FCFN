/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Heart, TrendingDown, TrendingUp, Users, MapPin, Activity } from 'lucide-react';

interface Neighborhood {
    name: string;
    freshness: number;
    active_fridges: number;
    waste_trend: 'up' | 'down' | 'stable';
}

interface HealthData {
    city_average_freshness: number;
    total_waste_reduced: string;
    neighborhoods: Neighborhood[];
    city_trends: any[];
}

export const CommunityHealth: React.FC = () => {
    const [data, setData] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/community/health')
            .then(res => res.json())
            .then(d => {
                setData(d);
                setLoading(false);
            });
    }, []);

    if (loading || !data) return (
        <div className="h-64 flex items-center justify-center opacity-30">
            <Activity className="w-8 h-8 animate-pulse text-blue-400" />
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-3xl">
                    <Heart className="w-5 h-5 text-blue-400 mb-2" />
                    <div className="text-2xl font-bold">{data.city_average_freshness}%</div>
                    <div className="text-[10px] font-mono opacity-50 uppercase mt-1">City Freshness Score</div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-3xl">
                    <TrendingDown className="w-5 h-5 text-emerald-400 mb-2" />
                    <div className="text-2xl font-bold">{data.total_waste_reduced}</div>
                    <div className="text-[10px] font-mono opacity-50 uppercase mt-1">Total Waste Prevented</div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 p-5 rounded-3xl">
                    <Users className="w-5 h-5 text-purple-400 mb-2" />
                    <div className="text-2xl font-bold">{data.neighborhoods.length}</div>
                    <div className="text-[10px] font-mono opacity-50 uppercase mt-1">Active Neighborhoods</div>
                </div>
                <div className="bg-fridge-accent/10 border border-fridge-accent/20 p-5 rounded-3xl">
                    <Activity className="w-5 h-5 text-fridge-accent mb-2" />
                    <div className="text-2xl font-bold">5 Nodes</div>
                    <div className="text-[10px] font-mono opacity-50 uppercase mt-1">Federated Network Status</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trend Chart */}
                <div className="lg:col-span-2 bg-black/20 border border-white/5 rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-mono font-bold uppercase tracking-widest opacity-50">City-Wide Freshness Trend</h3>
                        <div className="flex items-center gap-2 text-[9px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">
                            <TrendingUp className="w-3 h-3" />
                            +5% improvement this week
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.city_trends}>
                                <defs>
                                    <linearGradient id="colorFresh" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#ffffff30', fontSize: 10, fontFamily: 'monospace' }}
                                />
                                <YAxis hide domain={[50, 100]} />
                                <Tooltip
                                    contentStyle={{ background: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }}
                                    itemStyle={{ color: '#3b82f6' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="freshness"
                                    stroke="#3b82f6"
                                    fillOpacity={1}
                                    fill="url(#colorFresh)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Neighborhood List */}
                <div className="bg-black/20 border border-white/5 rounded-3xl p-6 flex flex-col gap-6">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest opacity-50">Neighborhood Health</h3>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {data.neighborhoods.map((n, i) => (
                            <motion.div
                                key={n.name}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-all"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3 h-3 text-blue-400 opacity-50" />
                                        <span className="text-sm font-bold">{n.name}</span>
                                    </div>
                                    {n.waste_trend === 'down' ? (
                                        <TrendingDown className="w-3 h-3 text-emerald-400" />
                                    ) : n.waste_trend === 'up' ? (
                                        <TrendingUp className="w-3 h-3 text-red-400" />
                                    ) : (
                                        <Activity className="w-3 h-3 text-blue-400" />
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 bg-white/5 h-1 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-blue-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${n.freshness}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-blue-400">{n.freshness}%</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
