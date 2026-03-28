import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CloudLightning, Network, Activity, LayoutGrid, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import { CommunityHealth } from '../CommunityHealth';
import { VendorMap } from '../VendorMap';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CommunityTabProps {
  communityBoard: any[];
}

export const CommunityTab: React.FC<CommunityTabProps> = ({ communityBoard }) => {
  const [activeView, setActiveView] = React.useState<'board' | 'health' | 'vendors'>('board');
  const [healthData, setHealthData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/community/health')
      .then(res => res.json())
      .then(data => setHealthData(data));
  }, []);

  return (
    <motion.div
      id="community-tab"
      key="community"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-panel p-8 h-full flex flex-col gap-6"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
          <Users className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Community Hub</h2>
          <p className="text-xs opacity-50 font-mono uppercase">Local Node Exchange • Regional Health Metrics</p>
        </div>
        <div className="flex-1" />
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveView('board')}
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-mono uppercase flex items-center gap-2 transition-all",
              activeView === 'board' ? "bg-blue-500 text-white" : "opacity-40 hover:opacity-100"
            )}
          >
            <LayoutGrid className="w-3 h-3" />
            Sharing Board
          </button>
          <button
            onClick={() => setActiveView('health')}
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-mono uppercase flex items-center gap-2 transition-all",
              activeView === 'health' ? "bg-blue-500 text-white" : "opacity-40 hover:opacity-100"
            )}
          >
            <Activity className="w-3 h-3" />
            City Health
          </button>
          <button
            onClick={() => setActiveView('vendors')}
            className={cn(
              "px-4 py-2 rounded-lg text-[10px] font-mono uppercase flex items-center gap-2 transition-all",
              activeView === 'vendors' ? "bg-blue-500 text-white" : "opacity-40 hover:opacity-100"
            )}
          >
            <ShoppingBag className="w-3 h-3" />
            Vendor Quality
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {activeView === 'board' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {communityBoard.map(item => (
              <div key={item.id} className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="font-bold text-lg">{item.name}</div>
                  <div className="text-[9px] font-mono bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30 uppercase">
                    {item.donor_id}
                  </div>
                </div>
                <div className="space-y-2 text-xs opacity-70">
                  <div className="flex items-center gap-2">
                    <CloudLightning className="w-3.5 h-3.5" />
                    Expires: {format(new Date(item.expiry_at), 'MMM dd, HH:mm')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Network className="w-3.5 h-3.5" />
                    {item.location}
                  </div>
                </div>
                <button className="w-full mt-6 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono uppercase font-bold hover:bg-blue-500/20 transition-all">
                  Request Item
                </button>
              </div>
            ))}
          </div>
        ) : activeView === 'health' ? (
          <CommunityHealth />
        ) : (
          <VendorMap vendors={healthData?.vendor_quality || []} />
        )}
      </div>
    </motion.div>
  );
};
