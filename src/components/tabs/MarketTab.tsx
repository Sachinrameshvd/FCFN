import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Store, RefreshCw, Trash2, Zap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ForecastWidget } from '../ForecastWidget';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MarketTabProps {
  shoppingList: any[];
  marketTrends: any[];
  forecasts: any[];
  isProcessing: boolean;
  onSyncExpired: () => void;
  onDeleteShopping: (id: string | number) => void;
}

export const MarketTab: React.FC<MarketTabProps> = ({ 
  shoppingList, 
  marketTrends, 
  forecasts,
  isProcessing, 
  onSyncExpired, 
  onDeleteShopping 
}) => {
  return (
    <motion.div 
      id="market-tab"
      key="market"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6 h-full"
    >
      {/* AI Forecast Section */}
      <div className="glass-panel p-6 border-orange-500/20">
        <ForecastWidget forecasts={forecasts} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Shopping List Column */}
        <div className="glass-panel p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-fridge-accent" />
              <h2 className="text-xl font-bold uppercase tracking-tight">Smart Shopping List</h2>
            </div>
            <button 
              onClick={onSyncExpired}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-mono uppercase font-bold hover:bg-red-500/20 transition-all flex items-center gap-2"
            >
              <RefreshCw className={cn("w-3 h-3", isProcessing && "animate-spin")} />
              Auto-Fill from Expired
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {shoppingList.length === 0 ? (
              <div className="py-10 text-center opacity-30 font-mono text-xs uppercase">List is empty</div>
            ) : (
              shoppingList.map(item => (
                <div key={item.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    {item.type === 'ai' && <Zap className="w-3.5 h-3.5 text-orange-400" />}
                    <div>
                      <div className="font-bold">{item.name}</div>
                      <div className="text-[10px] opacity-50 uppercase font-mono">{item.reason}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => onDeleteShopping(item.id)}
                    className="p-2 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Market Trends Column */}
        <div className="glass-panel p-6 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Store className="w-5 h-5 text-fridge-accent" />
            <h2 className="text-xl font-bold uppercase tracking-tight">Market Trends</h2>
          </div>
          <div className="space-y-3">
            {marketTrends.map((trend, idx) => (
              <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] opacity-50 uppercase font-mono mb-1">{trend.market}</div>
                  <div className="font-bold">{trend.item}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-mono">{trend.price}</div>
                  <div className={cn(
                    "text-[10px] uppercase font-bold",
                    trend.trend === 'up' ? "text-red-400" : trend.trend === 'down' ? "text-green-400" : "text-blue-400"
                  )}>
                    {trend.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
