/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Info, RefreshCw, CheckCircle2, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { CausalGraph } from '../CausalGraph';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { FridgeItem } from '../../services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CausalTabProps {
  selectedItem: FridgeItem | null;
  causalInsight: string | null;
  isProcessing: boolean;
  // Added targetZone to track the specific button clicked
  targetZone?: string | null;
  onAnalyze: (item: FridgeItem, zone: string) => void;
}

export const CausalTab: React.FC<CausalTabProps> = ({
  selectedItem,
  causalInsight,
  isProcessing,
  targetZone,
  onAnalyze
}) => {
  return (
    <motion.div
      id="causal-tab"
      key="causal"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-panel p-8 h-full flex flex-col gap-8"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-fridge-accent/20 flex items-center justify-center">
          <BrainCircuit className="w-6 h-6 text-fridge-accent" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Causal Spoilage Prediction</h2>
          <p className="text-xs opacity-50 font-mono uppercase tracking-wider">
            Counterfactual Analysis • Shelf-Life Extension
          </p>
        </div>
      </div>

      {!selectedItem ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 border-2 border-dashed border-white/5 rounded-3xl">
          <BrainCircuit className="w-20 h-20 mb-6" />
          <h3 className="text-xl font-bold uppercase tracking-widest">Select an item to run analysis</h3>
          <p className="max-w-md mt-2 text-sm font-mono">Pick an item from inventory to simulate "What-If" scenarios.</p>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12 overflow-y-auto pr-4 custom-scrollbar">
          <div className="space-y-8">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 relative overflow-hidden">
              <h3 className="text-xs font-mono uppercase opacity-50 mb-4">Subject Analysis</h3>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-3xl font-bold text-white">{selectedItem.name}</div>
                  <div className="text-sm opacity-60 uppercase font-mono tracking-tighter">
                    {selectedItem.category} • {selectedItem.vendor_type} vendor
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase opacity-50 mb-1 font-mono">Current Position</div>
                  <div className="text-xl font-mono text-fridge-accent uppercase font-bold tracking-widest">{selectedItem.zone}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase opacity-50">Simulate Movement to Target Zone</h3>
              <div className="grid grid-cols-3 gap-3">
                {['front', 'middle', 'back'].map(zone => (
                  <button
                    key={zone}
                    onClick={() => onAnalyze(selectedItem, zone)}
                    // Disable only if currently processing OR if it's the current zone
                    disabled={isProcessing || selectedItem.zone === zone}
                    className={cn(
                      "py-5 rounded-xl border transition-all flex flex-col items-center gap-2 relative",
                      selectedItem.zone === zone
                        ? "bg-white/5 border-white/10 opacity-30 cursor-not-allowed"
                        : targetZone === zone
                          ? "bg-fridge-accent/20 border-fridge-accent"
                          : "bg-fridge-accent/5 border-fridge-accent/20 hover:bg-fridge-accent/10 hover:border-fridge-accent/40"
                    )}
                  >
                    {targetZone === zone && !isProcessing && <CheckCircle2 className="w-3 h-3 text-fridge-accent absolute top-2 right-2" />}
                    <div className="text-xs font-bold uppercase tracking-widest">{zone}</div>
                    <div className="text-[9px] opacity-50 uppercase font-mono">Simulate</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl flex gap-4">
              <Info className="w-6 h-6 text-blue-400 shrink-0" />
              <p className="text-xs leading-relaxed opacity-80 italic font-mono">
                Causal logic calculates humidity vs {selectedItem.name}'s ethylene sensitivity.
              </p>
            </div>
          </div>

          <div className="glass-panel p-8 relative flex flex-col bg-black/20 border-white/5">
            <div className="absolute top-0 left-0 w-full h-1 bg-fridge-accent/30" />
            <h3 className="text-xs font-mono uppercase opacity-50 mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <RefreshCw className={cn("w-3 h-3", isProcessing && "animate-spin")} />
                AI Inference Report
              </span>
            </h3>

            <div className="flex-1 overflow-y-auto">
              {isProcessing ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 border-2 border-fridge-accent border-t-transparent rounded-full animate-spin" />
                  <div className="text-[10px] font-mono uppercase animate-pulse">Computing Inference...</div>
                </div>
              ) : causalInsight ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="prose prose-invert prose-sm max-w-none"
                >
                  <ReactMarkdown>{causalInsight}</ReactMarkdown>
                </motion.div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center opacity-20 border border-white/5 rounded-2xl bg-white/5">
                  <BrainCircuit className="w-12 h-12 mb-4" />
                  <p className="text-[10px] uppercase font-mono tracking-widest">Select a target zone to generate report</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Structural Causal Model (DAG) Visualizer */}
      <div className="mt-4 border-t border-white/5 pt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-fridge-accent shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              Structural Causal Model (DAG)
            </h3>
            <p className="text-[10px] opacity-40 font-mono uppercase mt-1">
              Visualizing the Hidden causal relationships governing shelf-life
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-[9px] font-mono opacity-50 uppercase">
              <div className="w-2 h-2 rounded-full border border-blue-500" />
              Treatment
            </div>
            <div className="flex items-center gap-2 text-[9px] font-mono opacity-50 uppercase">
              <div className="w-2 h-2 rounded-full border border-fridge-accent" />
              Outcome
            </div>
          </div>
        </div>
        <CausalGraph />
        <div className="mt-4 bg-white/5 p-4 rounded-xl flex gap-3 items-center">
          <Info className="w-4 h-4 text-fridge-accent opacity-50" />
          <p className="text-[10px] opacity-60 font-mono leading-relaxed uppercase tracking-tighter">
            Note: This graph represents the structural model trained via DoWhy. Arrows represent causal influence, not just correlation.
          </p>
        </div>
      </div>
    </motion.div>
  );
};