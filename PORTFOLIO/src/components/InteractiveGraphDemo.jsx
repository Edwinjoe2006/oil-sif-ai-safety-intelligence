import React, { useState, useEffect } from 'react';
import { 
  Network, 
  ShieldAlert, 
  CheckCircle, 
  RefreshCw, 
  Play, 
  Activity, 
  HelpCircle,
  Sliders,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export default function InteractiveGraphDemo() {
  // Initial Nodes simulating a transaction ring & legitimate hub
  const defaultNodes = [
    { id: 'Acc-101', label: 'Retail User A', type: 'legit', degree: 3, betweenness: 0.12, pagerank: 0.08, txVolume: 1200, risk: 8 },
    { id: 'Acc-204', label: 'E-Commerce Merchant', type: 'hub', degree: 14, betweenness: 0.68, pagerank: 0.42, txVolume: 85000, risk: 14 },
    { id: 'Acc-309', label: 'Mule Candidate X', type: 'suspicious', degree: 8, betweenness: 0.89, pagerank: 0.35, txVolume: 42000, risk: 82 },
    { id: 'Acc-412', label: 'Offshore Proxy Node', type: 'suspicious', degree: 6, betweenness: 0.76, pagerank: 0.28, txVolume: 39000, risk: 78 },
    { id: 'Acc-515', label: 'Layering Account Y', type: 'suspicious', degree: 7, betweenness: 0.84, pagerank: 0.31, txVolume: 41500, risk: 85 },
    { id: 'Acc-602', label: 'Salary Account B', type: 'legit', degree: 2, betweenness: 0.05, pagerank: 0.04, txVolume: 3400, risk: 5 }
  ];

  const [nodes, setNodes] = useState(defaultNodes);
  const [selectedNode, setSelectedNode] = useState(defaultNodes[2]); // Default Mule Candidate X
  const [threshold, setThreshold] = useState(65);
  const [isSimulating, setIsSimulating] = useState(false);
  const [log, setLog] = useState([
    "Graph initialized with 6 transactional entities.",
    "NetworkX centrality pipeline loaded: Degree, Betweenness, Closeness, PageRank.",
    "Ensemble classifier tuned for precision: Ready for inference."
  ]);

  const runDetection = () => {
    setIsSimulating(true);
    setLog(prev => [
      `[${new Date().toLocaleTimeString()}] Calculating topological centrality tensors...`,
      ...prev.slice(0, 4)
    ]);

    setTimeout(() => {
      // Perturb scores slightly to simulate live dynamic graph calculation
      setNodes(prev => prev.map(node => {
        const delta = (Math.random() - 0.5) * 4;
        let newBetweenness = Math.min(0.99, Math.max(0.02, node.betweenness + (delta * 0.01)));
        let newRisk = Math.min(99, Math.max(1, Math.round(node.risk + delta)));
        return {
          ...node,
          betweenness: Number(newBetweenness.toFixed(3)),
          risk: newRisk
        };
      }));

      setIsSimulating(false);
      setLog(prev => [
        `[${new Date().toLocaleTimeString()}] ML inference executed. High-betweenness anomaly loop confirmed.`,
        ...prev.slice(0, 4)
      ]);
    }, 600);
  };

  const handleSelectNode = (node) => {
    setSelectedNode(node);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
      {/* Background visual highlight */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Simulator Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Interactive Simulator • ICRCET 2026</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Graph Centrality Fraud Detection Workbench
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Simulate how graph theory centrality features (Betweenness, Degree, PageRank) feed ML models to unmask money mule rings.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={runDetection}
            disabled={isSimulating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white shadow-lg shadow-brand-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Extracting...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Model Inference</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Graph Nodes Interactive Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
              Interactive Nodes (Click to inspect account features):
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Threshold: {threshold}%
            </span>
          </div>

          {/* Node Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nodes.map((node) => {
              const isSelected = selectedNode.id === node.id;
              const isHighRisk = node.risk >= threshold;

              return (
                <div
                  key={node.id}
                  onClick={() => handleSelectNode(node)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border relative ${
                    isSelected
                      ? 'bg-slate-800/90 border-brand-500 shadow-lg shadow-brand-500/20 ring-1 ring-brand-500'
                      : 'bg-slate-900/60 border-white/5 hover:border-white/20 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        isHighRisk ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'
                      }`} />
                      <span className="font-mono font-bold text-xs text-white">
                        {node.id}
                      </span>
                    </div>

                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                      isHighRisk
                        ? 'bg-red-500/10 text-red-400 border-red-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}>
                      Risk: {node.risk}%
                    </span>
                  </div>

                  <div className="text-xs font-medium text-slate-300 mb-2 truncate">
                    {node.label}
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-slate-400 border-t border-white/5 pt-2">
                    <div>
                      <span className="text-slate-500 block">Deg:</span>
                      <span className="text-slate-200">{node.degree}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Btwn:</span>
                      <span className="text-indigo-300">{node.betweenness}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">PRank:</span>
                      <span className="text-cyan-300">{node.pagerank}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Slider */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                ML Classification Decision Threshold:
              </span>
              <span className="font-mono font-bold text-cyan-400">{threshold}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="90"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>More Aggressive (30%)</span>
              <span>Balanced (65%)</span>
              <span>Strict Precision (90%)</span>
            </div>
          </div>
        </div>

        {/* Node Deep Dive & Research Feature Inspector */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                  Inspecting Node Topology
                </span>
                <h4 className="text-base font-bold text-white">
                  {selectedNode.label} ({selectedNode.id})
                </h4>
              </div>

              <div className={`p-2 rounded-xl border ${
                selectedNode.risk >= threshold
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}>
                {selectedNode.risk >= threshold ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
              </div>
            </div>

            {/* Centrality Feature Bars */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Betweenness Centrality (Mule Bridge Score):</span>
                  <span className="font-mono text-indigo-400 font-semibold">{selectedNode.betweenness}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-500" 
                    style={{ width: `${selectedNode.betweenness * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>PageRank Weight:</span>
                  <span className="font-mono text-cyan-400 font-semibold">{selectedNode.pagerank}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 transition-all duration-500" 
                    style={{ width: `${selectedNode.pagerank * 150}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Degree Centrality (Edges: {selectedNode.degree}):</span>
                  <span className="font-mono text-emerald-400 font-semibold">{selectedNode.degree}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500" 
                    style={{ width: `${(selectedNode.degree / 15) * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Transaction Flow:</span>
                <span className="font-mono font-bold text-white">
                  ${selectedNode.txVolume.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Scientific Insight Box */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-white/5 text-[11px] text-slate-400 leading-relaxed">
              <span className="text-cyan-300 font-semibold block mb-0.5">
                Research Insight (ICRCET 2026):
              </span>
              {selectedNode.betweenness > 0.7 ? (
                <span>
                  High betweenness centrality indicates this node acts as a bridge between disjoint clusters — a classic sign of <strong>layering and money mule smurfing</strong> that passes single-account volume filters.
                </span>
              ) : (
                <span>
                  Standard centrality distribution with direct merchant or consumer routing. Low probability of covert routing topology.
                </span>
              )}
            </div>
          </div>

          {/* Model Activity Log Terminal */}
          <div className="bg-black/50 rounded-2xl p-3.5 border border-white/10 font-mono text-[11px] space-y-1">
            <div className="text-slate-500 text-[10px] uppercase font-bold flex items-center justify-between pb-1 border-b border-white/5">
              <span>Flask API / Inference Log</span>
              <span className="text-emerald-400">HTTP 200 OK</span>
            </div>
            {log.map((line, i) => (
              <div key={i} className="text-slate-300 truncate">
                <span className="text-brand-400">$ </span>
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
