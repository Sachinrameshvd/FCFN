import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Award } from 'lucide-react';

interface ImpactBadgeProps {
    score: number;
    co2Saved: number;
}

export const ImpactBadge: React.FC<ImpactBadgeProps> = ({ score, co2Saved }) => {
    return (
        <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-3xl flex items-center gap-4 relative overflow-hidden group cursor-pointer"
        >
            <div className="absolute -right-2 -top-2 w-16 h-16 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center relative shadow-lg shadow-emerald-500/10">
                <Leaf className="w-6 h-6 text-emerald-400" />
                <motion.div 
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-emerald-500/30 rounded-2xl"
                />
            </div>

            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">Eco Score</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{score}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    />
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                    <Award className="w-3 h-3 text-emerald-400 opacity-50" />
                    <span className="text-[9px] font-mono opacity-60 uppercase">{co2Saved}kg CO₂ SAVED</span>
                </div>
            </div>
        </motion.div>
    );
};
