import React from 'react';
import { motion } from 'framer-motion';
import { Hourglass, AlertCircle, TrendingDown, Calendar, Plus, Check } from 'lucide-react';
import { format, addHours } from 'date-fns';

export interface Forecast {
  item: string;
  current_count: number;
  hours_remaining: number;
  predicted_zero_day: string;
  confidence: string;
  category?: string;
  unit?: string;
}

interface ForecastWidgetProps {
  forecasts: Forecast[];
  onAddToList?: (item: { name: string; category: string; reason: string; price: number }) => void;
}

const DEFAULT_FORECASTS: Forecast[] = [
  {
    item: 'Aavin Toned Milk',
    current_count: 1,
    hours_remaining: 14,
    predicted_zero_day: addHours(new Date(), 14).toISOString(),
    confidence: '96% (High)',
    category: 'Dairy',
    unit: '500ml'
  },
  {
    item: 'Fresh Coriander Bunch',
    current_count: 1,
    hours_remaining: 18,
    predicted_zero_day: addHours(new Date(), 18).toISOString(),
    confidence: '92% (High)',
    category: 'Greens',
    unit: '1 bunch'
  },
  {
    item: 'Country Tomatoes',
    current_count: 3,
    hours_remaining: 28,
    predicted_zero_day: addHours(new Date(), 28).toISOString(),
    confidence: '88% (Med)',
    category: 'Vegetable',
    unit: 'approx 300g'
  },
  {
    item: 'Small Onions / Shallots',
    current_count: 4,
    hours_remaining: 42,
    predicted_zero_day: addHours(new Date(), 42).toISOString(),
    confidence: '85% (Med)',
    category: 'Vegetable',
    unit: 'approx 200g'
  }
];

export const ForecastWidget: React.FC<ForecastWidgetProps> = ({ forecasts, onAddToList }) => {
  const displayForecasts = forecasts && forecasts.length > 0 ? forecasts : DEFAULT_FORECASTS;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Hourglass className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Household Depletion Velocity
            </h3>
            <span className="text-[10px] text-slate-400">AI monitors how quickly your family finishes staples</span>
          </div>
        </div>
        <div className="text-[10px] font-mono bg-amber-500/10 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/20 uppercase font-semibold">
          Next 48 Hours Outlook
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {displayForecasts.map((f, i) => {
          const isCritical = f.hours_remaining <= 18;
          const pct = Math.min(100, Math.max(12, Math.round((f.hours_remaining / 48) * 100)));

          return (
            <motion.div
              key={f.item}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4 flex flex-col justify-between hover:border-amber-500/30 transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-2.5">
                <div>
                  <h4 className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors truncate">
                    {f.item}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Stock: {f.current_count} {f.unit || 'units'} left
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-semibold border ${
                  isCritical 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' 
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}>
                  {isCritical ? 'Runs Out Soon' : `${f.hours_remaining}h Left`}
                </span>
              </div>

              {/* Progress Gauge (Fuel Tank Style) */}
              <div className="space-y-1.5 my-2">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-400">Hits Zero:</span>
                  <span className={`font-bold ${isCritical ? 'text-rose-400' : 'text-amber-400'}`}>
                    in {f.hours_remaining} Hours
                  </span>
                </div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                  <div 
                    style={{ width: `${pct}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCritical ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                    }`}
                  />
                </div>
              </div>

              {/* Bottom Quick Restock Action */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-mono">
                  {format(new Date(f.predicted_zero_day), 'EEE, HH:mm')}
                </span>

                {onAddToList && (
                  <button
                    onClick={() => onAddToList({
                      name: f.item,
                      category: f.category || 'Pantry',
                      reason: `Depletes in ${f.hours_remaining}h`,
                      price: f.item.includes('Milk') ? 25 : f.item.includes('Tomatoes') ? 28 : f.item.includes('Coriander') ? 15 : 40
                    })}
                    className="px-2 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-mono font-semibold flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>Queue Restock</span>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-center gap-3">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-amber-300 font-mono uppercase text-[11px] mr-1.5">Mandi AI Restock Alert:</strong>
          Predicted consumption rate is peaking for <strong className="text-white">Aavin Toned Milk</strong> and <strong className="text-white">Coriander</strong>. Koyambedu market is offering fresh arrivals at wholesale rates today.
        </p>
      </div>
    </div>
  );
};
