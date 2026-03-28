import React from 'react';
import { motion } from 'framer-motion';
import { Hourglass, AlertCircle, TrendingDown, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Forecast {
    item: string;
    current_count: number;
    hours_remaining: number;
    predicted_zero_day: string;
    confidence: string;
}

interface ForecastWidgetProps {
    forecasts: Forecast[];
}

export const ForecastWidget: React.FC<ForecastWidgetProps> = ({ forecasts }) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <Hourglass className="w-4 h-4 text-orange-400 animate-pulse" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-widest opacity-60">Consumption Forecast</h3>
                </div>
                <div className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded-full border border-white/10 uppercase opacity-40">
                    Next 48 Hours
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {forecasts.map((f, i) => (
                    <motion.div
                        key={f.item}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:border-orange-500/30 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                            <TrendingDown className="w-8 h-8 text-orange-400" />
                        </div>
                        
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-bold text-sm">{f.item}</h4>
                                <p className="text-[9px] font-mono opacity-50 uppercase">Stock: {f.current_count} units</p>
                            </div>
                            <div className={`px-2 py-0.5 rounded-full text-[8px] font-mono uppercase ${
                                f.hours_remaining < 24 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                            }`}>
                                {f.hours_remaining < 24 ? 'CRITICAL' : 'PREDICTION'}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-[9px] font-mono opacity-40 uppercase">Hits Zero In</span>
                                    <span className="text-xs font-bold font-mono text-orange-400">{f.hours_remaining}h</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: '100%' }}
                                        animate={{ width: `${Math.max(10, (f.hours_remaining / 48) * 100)}%` }}
                                        className={`h-full ${f.hours_remaining < 24 ? 'bg-red-500' : 'bg-orange-500'}`}
                                    />
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <Calendar className="w-3 h-3 text-orange-400 opacity-40 ml-auto mb-1" />
                                <div className="text-[10px] font-bold">{format(new Date(f.predicted_zero_day), 'HH:mm')}</div>
                                <div className="text-[8px] font-mono opacity-40 uppercase">{format(new Date(f.predicted_zero_day), 'MMM dd')}</div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-3 flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-orange-400 shrink-0" />
                <p className="text-[9px] leading-relaxed opacity-60 italic">
                    <span className="font-bold text-orange-400 uppercase">AI Note:</span> Predicted consumption rate is increasing for <strong className="text-orange-300">Milk</strong>. Stock depletion expected before Friday morning.
                </p>
            </div>
        </div>
    );
};
