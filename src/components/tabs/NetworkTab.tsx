import React from 'react';
import { motion } from 'motion/react';
import { Network } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

interface NetworkTabProps {
  nodes: any[];
}

export const NetworkTab: React.FC<NetworkTabProps> = ({ nodes }) => {
  return (
    <motion.div 
      id="network-tab"
      key="network"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-6 h-full"
    >
      <div className="glass-panel p-8 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-fridge-accent/20 flex items-center justify-center">
              <Network className="w-6 h-6 text-fridge-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Federated Fresh Network</h2>
              <p className="text-xs opacity-50 font-mono uppercase">Decentralized Spoilage Intelligence • Privacy First</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-mono font-bold text-fridge-accent">1,242</div>
            <div className="text-[9px] opacity-50 uppercase tracking-widest">Global Syncs Today</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nodes.map((node) => (
            <div key={node.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm">{node.location}</div>
                <div className="text-[10px] opacity-50 font-mono">ID: {node.id}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-fridge-accent">{node.contribution_count}</div>
                <div className="text-[8px] opacity-40 uppercase">Updates</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel p-6 h-64">
        <h3 className="text-xs font-mono uppercase opacity-50 mb-4">Network Accuracy Improvement</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={[
            { day: 'Mon', accuracy: 72 },
            { day: 'Tue', accuracy: 75 },
            { day: 'Wed', accuracy: 74 },
            { day: 'Thu', accuracy: 79 },
            { day: 'Fri', accuracy: 82 },
            { day: 'Sat', accuracy: 85 },
            { day: 'Sun', accuracy: 88 },
          ]}>
            <defs>
              <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00FF00" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00FF00" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis dataKey="day" stroke="#ffffff30" fontSize={10} axisLine={false} tickLine={false} />
            <YAxis stroke="#ffffff30" fontSize={10} axisLine={false} tickLine={false} domain={[60, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#151619', border: '1px solid #ffffff20', borderRadius: '8px' }}
              itemStyle={{ color: '#00FF00' }}
            />
            <Area type="monotone" dataKey="accuracy" stroke="#00FF00" fillOpacity={1} fill="url(#colorAcc)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
