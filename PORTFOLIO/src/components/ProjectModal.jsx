import React, { useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  Workflow, 
  Database,
  Sparkles
} from 'lucide-react';
import { Github } from './Icons';


export default function ProjectModal({ project, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl glass-panel rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl my-8 text-left animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-3 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              {project.category}
            </span>
            {project.badge && (
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {project.badge}
              </span>
            )}
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            {project.title}
          </h3>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {project.tagline}
          </p>
        </div>

        {/* Tech Stack Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-700/70 text-slate-300 text-xs font-mono font-medium"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Detailed Overview */}
        <div className="space-y-4 mb-6">
          <div>
            <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              System Overview & Problem Solved
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-white/5">
              {project.overview}
            </p>
          </div>

          {/* Architecture Pipeline */}
          <div>
            <h4 className="text-xs font-mono font-bold text-brand-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Workflow className="w-3.5 h-3.5" />
              Architectural Pipeline
            </h4>
            <div className="bg-black/60 p-4 rounded-xl border border-white/10 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
              <span className="text-emerald-400 font-semibold">$ flow: </span>
              {project.architecture}
            </div>
          </div>

          {/* Key Feature Accomplishments */}
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Engineering Highlights
            </h4>
            <div className="space-y-2">
              {project.highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
          <div className="text-xs text-slate-400 font-mono">
            Author: Edwin Joe M • SRM IST
          </div>

          <div className="flex items-center gap-3">
            {project.liveDemo && (
              <a
                href={project.liveDemo}
                onClick={onClose}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white shadow-md transition-all"
              >
                <span>Live Interactive Demo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 transition-all"
            >
              <Github className="w-4 h-4" />
              <span>Source Repository</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
