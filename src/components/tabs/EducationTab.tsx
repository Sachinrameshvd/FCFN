import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface EducationTabProps {
  content: string | null;
  isProcessing: boolean;
}

export const EducationTab: React.FC<EducationTabProps> = ({ content, isProcessing }) => {
  return (
    <motion.div 
      id="education-tab"
      key="education"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-panel p-8 h-full overflow-y-auto"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Pesticide Education Lab</h2>
          <p className="text-xs opacity-50 font-mono uppercase">Science-Based Food Safety • Tamil Nadu Context</p>
        </div>
      </div>

      {isProcessing && !content ? (
        <div className="flex flex-col items-center py-20 gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
          <p className="font-mono text-xs animate-pulse">GENERATING EDUCATIONAL CONTENT...</p>
        </div>
      ) : (
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{content || ""}</ReactMarkdown>
        </div>
      )}
    </motion.div>
  );
};
