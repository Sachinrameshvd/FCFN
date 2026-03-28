import React from 'react';
import { motion } from 'motion/react';
import { Utensils, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { FridgeItem } from '../../services/geminiService';

interface RecipesTabProps {
  recipes: string | null;
  isProcessing: boolean;
  onGenerate: () => void;
}

export const RecipesTab: React.FC<RecipesTabProps> = ({ recipes, isProcessing, onGenerate }) => {
  return (
    <motion.div 
      id="recipes-tab"
      key="recipes"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-panel p-8 h-full overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-fridge-accent/20 flex items-center justify-center">
            <Utensils className="w-6 h-6 text-fridge-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Waste-Reduction Recipes</h2>
            <p className="text-xs opacity-50 font-mono uppercase">Tamil Nadu Style • Powered by Gemini</p>
          </div>
        </div>
        <button 
          onClick={onGenerate}
          disabled={isProcessing}
          className="px-6 py-3 rounded-xl bg-fridge-accent text-fridge-bg font-bold uppercase text-[10px] tracking-widest hover:scale-105 transition-all disabled:opacity-50"
        >
          {isProcessing ? "Generating..." : "Get New Suggestions"}
        </button>
      </div>

      {!recipes ? (
        <div className="h-64 flex flex-col items-center justify-center opacity-30 text-center">
          <Utensils className="w-16 h-16 mb-4" />
          <p className="font-mono uppercase">Click the button above to generate recipes based on your expiring items.</p>
        </div>
      ) : (
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{recipes}</ReactMarkdown>
        </div>
      )}
    </motion.div>
  );
};
