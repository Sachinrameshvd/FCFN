/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, HelpCircle } from 'lucide-react';

interface Node {
    id: string;
    label: string;
    type: 'confounder' | 'treatment' | 'outcome';
    description: string;
    x?: number;
    y?: number;
}

interface Edge {
    source: string;
    target: string;
    label: string;
}

export const CausalGraph: React.FC = () => {
    const [data, setData] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null);
    const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/causal/graph');
                const json = await res.json();

                // Define fixed layout for 4-node DAG
                const layout: Record<string, { x: number, y: number }> = {
                    'humidity': { x: 150, y: 100 },
                    'vendor': { x: 150, y: 300 },
                    'zone': { x: 450, y: 100 },
                    'freshness': { x: 450, y: 300 }
                };

                const nodesWithLayout = json.nodes.map((n: Node) => ({
                    ...n,
                    x: layout[n.id]?.x || 0,
                    y: layout[n.id]?.y || 0
                }));

                setData({ nodes: nodesWithLayout, edges: json.edges });
            } catch (err) {
                console.error("Failed to fetch graph data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="h-64 flex items-center justify-center opacity-30 animate-pulse">
            <HelpCircle className="w-8 h-8 spin" />
        </div>
    );

    if (!data) return null;

    return (
        <div className="relative w-full aspect-video bg-black/40 rounded-3xl border border-white/5 overflow-hidden group">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

            <svg className="w-full h-full" viewBox="0 0 600 400">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#22c55e" fillOpacity="0.5" />
                    </marker>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Edges */}
                {data.edges.map((edge, i) => {
                    const source = data.nodes.find(n => n.id === edge.source);
                    const target = data.nodes.find(n => n.id === edge.target);
                    if (!source || !target) return null;

                    return (
                        <g key={`edge-${i}`}>
                            <motion.path
                                d={`M ${source.x} ${source.y} L ${target.x} ${target.y}`}
                                stroke="#22c55e"
                                strokeWidth="2"
                                strokeOpacity="0.2"
                                fill="none"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1, delay: i * 0.2 }}
                                markerEnd="url(#arrowhead)"
                            />
                            <motion.path
                                d={`M ${source.x} ${source.y} L ${target.x} ${target.y}`}
                                stroke="#22c55e"
                                strokeWidth="4"
                                strokeOpacity="0.1"
                                fill="none"
                                filter="url(#glow)"
                            />
                        </g>
                    );
                })}

                {/* Nodes */}
                {data.nodes.map((node) => (
                    <g
                        key={node.id}
                        onMouseEnter={() => setHoveredNode(node)}
                        onMouseLeave={() => setHoveredNode(null)}
                        className="cursor-pointer"
                    >
                        <motion.circle
                            cx={node.x}
                            cy={node.y}
                            r="40"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 12 }}
                            className={cn(
                                "fill-black/60 stroke-2",
                                node.type === 'treatment' ? "stroke-blue-500" :
                                    node.type === 'outcome' ? "stroke-fridge-accent" : "stroke-white/20"
                            )}
                        />
                        <motion.text
                            x={node.x}
                            y={node.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-white text-[10px] font-mono font-bold uppercase pointer-events-none"
                        >
                            {node.label}
                        </motion.text>

                        {/* Ripple Effect for focus */}
                        {hoveredNode?.id === node.id && (
                            <motion.circle
                                cx={node.x}
                                cy={node.y}
                                r="45"
                                stroke="#22c55e"
                                strokeOpacity="0.4"
                                fill="none"
                                initial={{ scale: 1, opacity: 0 }}
                                animate={{ scale: 1.2, opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />
                        )}
                    </g>
                ))}
            </svg>

            {/* Info Panel Overlay */}
            <AnimatePresence>
                {hoveredNode && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 flex gap-4 items-center"
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                            hoveredNode.type === 'treatment' ? "bg-blue-500/20 text-blue-400" :
                                hoveredNode.type === 'outcome' ? "bg-fridge-accent/20 text-fridge-accent" : "bg-white/10 text-white/50"
                        )}>
                            <Info className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold block">{hoveredNode.label}
                                <span className="ml-2 text-[9px] font-mono opacity-50 uppercase border border-white/20 px-1 rounded">
                                    {hoveredNode.type}
                                </span>
                            </h4>
                            <p className="text-xs opacity-70 mt-0.5">{hoveredNode.description}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute top-6 left-6">
                <h3 className="text-xs font-mono font-bold uppercase opacity-30 tracking-widest">Structural Causal Model (DAG)</h3>
            </div>
        </div>
    );
};

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
