/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  HelpCircle, 
  Info, 
  Sparkles, 
  Lock, 
  Unlock, 
  ArrowRight,
  Flame,
  Wind,
  Droplets,
  Activity
} from 'lucide-react';

export interface CausalNode {
  id: string;
  label: string;
  type: 'confounder' | 'treatment' | 'outcome' | 'mediator';
  description: string;
  x: number;
  y: number;
  icon?: string;
}

export interface CausalEdge {
  source: string;
  target: string;
  label: string;
}

const DEFAULT_GRAPH_NODES: CausalNode[] = [
  {
    id: "humidity",
    label: "Chennai Coastal Humidity (92% RH)",
    type: "confounder",
    description: "High ambient moisture penetrates during door openings, accelerating bacterial and fungal spore germination on produce surfaces.",
    x: 95,
    y: 55,
    icon: "🌊"
  },
  {
    id: "ethylene",
    label: "Ethylene Gas Trapping",
    type: "confounder",
    description: "Ripening hormones emitted by climacteric fruits (apples, tomatoes) pool in stagnant shelf zones, inducing premature rotting.",
    x: 95,
    y: 165,
    icon: "💨"
  },
  {
    id: "door",
    label: "Door Thermal Shock (Openings/day)",
    type: "confounder",
    description: "Frequent ambient air ingress creates severe thermal gradients and condensation cycles.",
    x: 95,
    y: 275,
    icon: "🚪"
  },
  {
    id: "zone",
    label: "Chamber Shelf Zone",
    type: "treatment",
    description: "Physical micro-climate placement: Back Chiller [do(Zone=Back)] vs Middle vs Door Balcony.",
    x: 305,
    y: 90,
    icon: "🧊"
  },
  {
    id: "airflow",
    label: "Laminar Airflow (0.45 m/s)",
    type: "mediator",
    description: "Fluid jet stream rapidly evaporates boundary moisture films and dilutes ethylene gas pockets.",
    x: 305,
    y: 240,
    icon: "🌀"
  },
  {
    id: "freshness",
    label: "Produce Freshness Lifespan",
    type: "outcome",
    description: "Cellular firmness, vitamin retention, and invariant days before cellular breakdown occurs.",
    x: 515,
    y: 165,
    icon: "🌿"
  }
];

const DEFAULT_GRAPH_EDGES: CausalEdge[] = [
  { source: "humidity", target: "freshness", label: "Spore Proliferation (+0.74 corr)" },
  { source: "humidity", target: "zone", label: "Confounder Backdoor Path" },
  { source: "door", target: "freshness", label: "Thermal Stress Decay" },
  { source: "door", target: "zone", label: "Confounder Backdoor Path" },
  { source: "ethylene", target: "freshness", label: "Ripening Hormone" },
  { source: "zone", target: "airflow", label: "Fluid Jet Deflection" },
  { source: "airflow", target: "freshness", label: "Direct Physical Mechanism" },
  { source: "zone", target: "freshness", label: "True Causal Treatment (+2.86d)" }
];

export const CausalGraph: React.FC = () => {
  const [nodes, setNodes] = useState<CausalNode[]>(DEFAULT_GRAPH_NODES);
  const [edges, setEdges] = useState<CausalEdge[]>(DEFAULT_GRAPH_EDGES);
  const [selectedNode, setSelectedNode] = useState<CausalNode | null>(DEFAULT_GRAPH_NODES[3]); // default to Zone
  const [blockBackdoors, setBlockBackdoors] = useState<boolean>(true);

  // Fetch live graph from server if available, fallback to defaults
  useEffect(() => {
    fetch('/api/causal/graph')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.nodes) && data.nodes.length > 0) {
          setNodes(data.nodes);
          setEdges(data.edges);
        }
      })
      .catch(err => {
        // Fallback is already loaded
      });
  }, []);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'treatment':
        return {
          stroke: '#06b6d4',
          fill: 'rgba(6, 182, 212, 0.15)',
          text: 'text-cyan-300',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          glow: 'rgba(6, 182, 212, 0.6)'
        };
      case 'outcome':
        return {
          stroke: '#10b981',
          fill: 'rgba(16, 185, 129, 0.15)',
          text: 'text-emerald-300',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          glow: 'rgba(16, 185, 129, 0.6)'
        };
      case 'mediator':
        return {
          stroke: '#a855f7',
          fill: 'rgba(168, 85, 247, 0.15)',
          text: 'text-purple-300',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          glow: 'rgba(168, 85, 247, 0.6)'
        };
      case 'confounder':
      default:
        return {
          stroke: '#f59e0b',
          fill: 'rgba(245, 158, 11, 0.15)',
          text: 'text-amber-300',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          glow: 'rgba(245, 158, 11, 0.6)'
        };
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 relative select-none">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 z-10">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-slate-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            DAG Causal Network
          </span>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
            (Judea Pearl's Directed Acyclic Graph)
          </span>
        </div>

        {/* Backdoor Shielding Toggle */}
        <button
          onClick={() => setBlockBackdoors(!blockBackdoors)}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all border ${
            blockBackdoors
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}
        >
          {blockBackdoors ? <Lock className="w-3 h-3 text-emerald-400" /> : <Unlock className="w-3 h-3 text-amber-400" />}
          <span>{blockBackdoors ? 'DoWhy Backdoors: BLOCKED' : 'Raw Confounded Data'}</span>
        </button>
      </div>

      {/* SVG Canvas for the Graph */}
      <div className="relative w-full h-[220px] flex items-center justify-center my-1">
        <svg 
          viewBox="0 0 610 330" 
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Arrowhead marker: Cyan for treatment/direct causal */}
            <marker id="arrow-cyan" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#06b6d4" />
            </marker>
            {/* Arrowhead marker: Emerald for outcome */}
            <marker id="arrow-emerald" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#10b981" />
            </marker>
            {/* Arrowhead marker: Purple for mediator */}
            <marker id="arrow-purple" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#a855f7" />
            </marker>
            {/* Arrowhead marker: Amber for confounder */}
            <marker id="arrow-amber" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
            </marker>
            {/* Arrowhead marker: Dimmed blocked */}
            <marker id="arrow-dim" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#475569" />
            </marker>

            {/* Glowing filters */}
            <filter id="cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines in background */}
          <g opacity="0.08">
            <line x1="0" y1="80" x2="610" y2="80" stroke="#fff" strokeDasharray="3 3" />
            <line x1="0" y1="165" x2="610" y2="165" stroke="#fff" strokeDasharray="3 3" />
            <line x1="0" y1="250" x2="610" y2="250" stroke="#fff" strokeDasharray="3 3" />
          </g>

          {/* Directed Edges */}
          {edges.map((edge, idx) => {
            const sNode = nodes.find(n => n.id === edge.source);
            const tNode = nodes.find(n => n.id === edge.target);
            if (!sNode || !tNode) return null;

            const isConfounderEdge = sNode.type === 'confounder' || edge.label.includes('Backdoor');
            const isBlocked = isConfounderEdge && blockBackdoors;

            // Determine stroke color and marker
            let strokeColor = '#06b6d4';
            let markerId = 'arrow-cyan';

            if (isBlocked) {
              strokeColor = '#334155';
              markerId = 'arrow-dim';
            } else if (sNode.type === 'confounder') {
              strokeColor = '#f59e0b';
              markerId = 'arrow-amber';
            } else if (sNode.type === 'mediator') {
              strokeColor = '#a855f7';
              markerId = 'arrow-purple';
            } else if (sNode.type === 'treatment') {
              strokeColor = '#06b6d4';
              markerId = 'arrow-cyan';
            }

            // Path with gentle curve
            const dx = tNode.x - sNode.x;
            const dy = tNode.y - sNode.y;
            const cx1 = sNode.x + dx * 0.5;
            const cy1 = sNode.y;
            const cx2 = sNode.x + dx * 0.5;
            const cy2 = tNode.y;

            return (
              <g key={`edge-${idx}`}>
                <motion.path
                  d={`M ${sNode.x} ${sNode.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tNode.x} ${tNode.y}`}
                  stroke={strokeColor}
                  strokeWidth={isBlocked ? 1 : 2}
                  strokeDasharray={isBlocked ? "4 4" : isConfounderEdge ? "3 3" : undefined}
                  fill="none"
                  opacity={isBlocked ? 0.35 : 0.85}
                  markerEnd={`url(#${markerId})`}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: idx * 0.05 }}
                />

                {/* Animated pulse packet along direct causal path */}
                {!isBlocked && sNode.id === 'zone' && tNode.id === 'freshness' && (
                  <circle r="3.5" fill="#10b981">
                    <animateMotion
                      path={`M ${sNode.x} ${sNode.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tNode.x} ${tNode.y}`}
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {!isBlocked && sNode.id === 'zone' && tNode.id === 'airflow' && (
                  <circle r="3" fill="#a855f7">
                    <animateMotion
                      path={`M ${sNode.x} ${sNode.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tNode.x} ${tNode.y}`}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Causal Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const colors = getNodeColor(node.type);

            return (
              <g 
                key={node.id} 
                className="cursor-pointer group"
                onClick={() => setSelectedNode(node)}
              >
                {/* Outer Glow on selection */}
                {isSelected && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="28"
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    opacity="0.8"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from={`0 ${node.x} ${node.y}`}
                      to={`360 ${node.x} ${node.y}`}
                      dur="8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Main Node Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="20"
                  fill="#0b1120"
                  stroke={colors.stroke}
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-all duration-200"
                />

                {/* Interior fill wash */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="17"
                  fill={colors.fill}
                />

                {/* Icon inside node */}
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  fontSize="13"
                  className="pointer-events-none select-none"
                >
                  {node.icon || (node.type === 'treatment' ? '🧊' : node.type === 'outcome' ? '🌿' : '⚙️')}
                </text>

                {/* Node Label underneath */}
                <text
                  x={node.x}
                  y={node.y + 32}
                  textAnchor="middle"
                  fill="#e2e8f0"
                  fontSize="9.5"
                  fontWeight="600"
                  className="pointer-events-none font-mono"
                >
                  {node.id === 'humidity' ? 'Coastal Humidity' :
                   node.id === 'door' ? 'Door Thermal Shock' :
                   node.id === 'ethylene' ? 'Ethylene Gas' :
                   node.id === 'zone' ? 'Shelf Zone do(T)' :
                   node.id === 'airflow' ? 'Laminar Airflow' :
                   'Freshness Lifespan'}
                </text>

                {/* Type Subtitle */}
                <text
                  x={node.x}
                  y={node.y + 42}
                  textAnchor="middle"
                  fill={node.type === 'treatment' ? '#06b6d4' : node.type === 'outcome' ? '#10b981' : node.type === 'mediator' ? '#a855f7' : '#f59e0b'}
                  fontSize="7.5"
                  fontWeight="bold"
                  className="pointer-events-none font-mono uppercase tracking-wider"
                >
                  {node.type}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Node Inspection Callout */}
      {selectedNode && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-slate-950/90 border border-white/10 text-xs flex flex-col gap-1.5 z-10 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">{selectedNode.icon}</span>
              <span className="font-bold text-white text-xs">{selectedNode.label}</span>
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${getNodeColor(selectedNode.type).badge}`}>
                {selectedNode.type}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Click any node to inspect</span>
          </div>

          <p className="text-[11px] text-slate-300 leading-snug">
            {selectedNode.description}
          </p>

          {/* DoWhy Backdoor Mechanism status */}
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 pt-0.5 border-t border-white/5">
            {selectedNode.type === 'confounder' ? (
              <span className="text-amber-300 flex items-center gap-1 font-semibold">
                🛡️ Pearl's Backdoor: Conditioned & blocked by DoWhy adjustment formula.
              </span>
            ) : selectedNode.type === 'treatment' ? (
              <span className="text-cyan-300 flex items-center gap-1 font-semibold">
                ⚡ Causal Intervention: do(Zone = Back Chiller) eliminates spurious association.
              </span>
            ) : selectedNode.type === 'mediator' ? (
              <span className="text-purple-300 flex items-center gap-1 font-semibold">
                🌀 Mechanism: 0.45 m/s laminar air physically sweeps away surface moisture film.
              </span>
            ) : (
              <span className="text-emerald-300 flex items-center gap-1 font-semibold">
                🎯 Clean Invariant Outcome: True physical freshness gain isolated from coastal weather.
              </span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
