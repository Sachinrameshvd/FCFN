import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp, TrendingDown, Star, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Vendor {
    name: string;
    location: string;
    score: number;
    status: 'alert' | 'premium' | 'good' | 'average';
    trend: 'up' | 'down' | 'stable';
}

interface VendorMapProps {
    vendors: Vendor[];
}

export const VendorMap: React.FC<VendorMapProps> = ({ vendors }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold">Chennai Vendor Health</h3>
                    <p className="text-[10px] font-mono opacity-50 uppercase mt-1">Live Federated Quality Intel</p>
                </div>
                <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                    <span className="text-[9px] font-mono text-blue-400 uppercase">Live Network Feed</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendors.map((vendor, i) => (
                    <motion.div
                        key={vendor.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/5 border border-white/5 rounded-3xl p-5 hover:border-blue-500/30 transition-all group relative overflow-hidden"
                    >
                        {/* Status Pulse Background */}
                        <div className={`absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-10 transition-all group-hover:opacity-20 ${
                            vendor.status === 'premium' ? 'bg-emerald-500' :
                            vendor.status === 'alert' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <MapPin className="w-3 h-3 text-blue-400 opacity-50" />
                                    <span className="text-[9px] font-mono opacity-50 uppercase">{vendor.location}</span>
                                </div>
                                <h4 className="font-bold text-lg leading-tight">{vendor.name}</h4>
                            </div>
                            <div className={`p-2 rounded-2xl ${
                                vendor.status === 'premium' ? 'bg-emerald-500/10 text-emerald-400' :
                                vendor.status === 'alert' ? 'bg-red-500/10 text-red-400' :
                                'bg-blue-500/10 text-blue-400'
                            }`}>
                                {vendor.status === 'premium' ? <ShieldCheck className="w-5 h-5" /> :
                                 vendor.status === 'alert' ? <AlertTriangle className="w-5 h-5" /> :
                                 <Star className="w-5 h-5" />}
                            </div>
                        </div>

                        <div className="flex items-end justify-between relative z-10">
                            <div className="flex-1 pr-6">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[10px] font-mono opacity-40 uppercase">Community Freshness</span>
                                    <span className={`text-xl font-bold font-mono ${
                                        vendor.score > 80 ? 'text-emerald-400' :
                                        vendor.score < 50 ? 'text-red-400' : 'text-blue-400'
                                    }`}>{vendor.score}%</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${vendor.score}%` }}
                                        className={`h-full ${
                                            vendor.score > 80 ? 'bg-emerald-500' :
                                            vendor.score < 50 ? 'bg-red-500' : 'bg-blue-500'
                                        }`}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                {vendor.trend === 'up' ? (
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                ) : vendor.trend === 'down' ? (
                                    <TrendingDown className="w-4 h-4 text-red-400" />
                                ) : (
                                    <div className="w-4 h-0.5 bg-blue-400 opacity-30 my-2" />
                                )}
                                <span className="text-[8px] font-mono opacity-40 uppercase">Trend</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Hint Box */}
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-[10px] leading-relaxed opacity-60">
                    <span className="font-bold text-blue-400 uppercase">Pro Tip:</span> Based on federated data from 12 neighbor fridges, the <strong>Adyar Organic Hub</strong> is currently reporting the highest vitamin retention scores for coastal greens today.
                </p>
            </div>
        </div>
    );
};
