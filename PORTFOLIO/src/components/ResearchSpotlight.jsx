import React from 'react';
import { 
  FileText, 
  Award, 
  Share2, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink, 
  BookOpen,
  Layers,
  ArrowRight
} from 'lucide-react';
import { researchPublication } from '../data/portfolioData';
import InteractiveGraphDemo from './InteractiveGraphDemo';

export default function ResearchSpotlight() {
  return (
    <section id="research" className="py-20 relative bg-gradient-to-b from-transparent via-brand-950/20 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px w-8 bg-cyan-400" />
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">
            Academic Research & Publications
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Pioneering <span className="text-gradient">Graph AI</span> for Financial Security
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2">
              Peer-reviewed research presenting high-recall fraud detection via topological network centrality measures and supervised machine learning classifiers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-semibold">
              <Award className="w-4 h-4 text-cyan-400" />
              Accepted at ICRCET 2026
            </span>
          </div>
        </div>

        {/* Publication Feature Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 mb-12 relative overflow-hidden">
          {/* Subtle accent glow line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Main Paper Details */}
            <div className="lg:col-span-8 space-y-5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-md bg-brand-500/20 text-brand-300 font-mono font-medium border border-brand-500/30">
                  {researchPublication.conference}
                </span>
                <span className="px-3 py-1 rounded-md bg-emerald-500/15 text-emerald-400 font-mono font-medium border border-emerald-500/30">
                  {researchPublication.status}
                </span>
                <span className="px-3 py-1 rounded-md bg-purple-500/15 text-purple-300 font-mono font-medium border border-purple-500/30">
                  {researchPublication.presentation}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
                {researchPublication.title}
              </h3>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {researchPublication.description}
              </p>

              {/* Key Contributions */}
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Core Innovations & Findings:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {researchPublication.keyInnovations.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                {researchPublication.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 text-xs font-mono border border-slate-700/60"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Meta Column */}
            <div className="lg:col-span-4 bg-slate-900/80 rounded-2xl p-6 border border-white/5 space-y-4">
              <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                Conference Metadata
              </h4>

              <div className="space-y-3 text-xs">
                {researchPublication.stats.map((stat, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-slate-400">{stat.label}</span>
                    <span className="font-mono font-semibold text-white">{stat.value}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <div className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                  Published as first/lead researcher. Accepted for presentation at the International Conference on Recent Challenges in Engineering and Technology (ICRCET 2026).
                </div>

                <a
                  href="#projects"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white shadow transition-all"
                >
                  <span>View Project Implementation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Live Interactive Graph Simulator Widget */}
        <InteractiveGraphDemo />
      </div>
    </section>
  );
}
