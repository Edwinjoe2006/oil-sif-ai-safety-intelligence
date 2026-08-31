import React, { useState } from 'react';
import { 
  FolderGit2, 
  ExternalLink, 
  ArrowUpRight, 
  Layers, 
  Sparkles, 
  Filter, 
  CheckCircle2 
} from 'lucide-react';
import { Github } from './Icons';
import { projects } from '../data/portfolioData';
import ProjectModal from './ProjectModal';


export default function Projects() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeProjectModal, setActiveProjectModal] = useState(null);

  const categories = ['All', 'AI & Machine Learning', 'Full-Stack Web'];

  const filteredProjects = selectedCategory === 'All'
    ? projects
    : projects.filter(p => p.category === selectedCategory);

  return (
    <section id="projects" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Tag */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px w-8 bg-brand-500" />
          <span className="text-xs font-mono uppercase tracking-widest text-brand-400 font-semibold">
            Featured Engineering Work
          </span>
        </div>

        {/* Section Heading & Category Filter */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              End-to-End <span className="text-gradient">Production Systems</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2">
              Explore key software systems engineered from scratch — featuring machine learning inference pipelines, relational databases, responsive frontends, and RESTful architectures.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-2xl border border-white/10 self-start md:self-auto overflow-x-auto max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col justify-between hover:border-brand-500/40 transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Corner accent glow */}
              <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br ${project.accentColor} opacity-10 rounded-full blur-2xl group-hover:opacity-25 transition-opacity pointer-events-none`} />

              <div>
                {/* Header Pills */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {project.category}
                  </span>
                  {project.badge && (
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/30">
                      {project.badge}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {project.title}
                </h3>

                {/* Tagline / Summary */}
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-5">
                  {project.tagline}
                </p>

                {/* Tech Stack Badges */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-0.5 rounded-md bg-slate-900/90 text-slate-300 text-[11px] font-mono border border-slate-800"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Key Bullet Highlights */}
                <div className="space-y-2 mb-6 text-xs text-slate-400">
                  {project.highlights.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => setActiveProjectModal(project)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group/btn"
                >
                  <span>System Architecture & Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    title="View GitHub Repository"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Detail Modal */}
      {activeProjectModal && (
        <ProjectModal
          project={activeProjectModal}
          onClose={() => setActiveProjectModal(null)}
        />
      )}
    </section>
  );
}
