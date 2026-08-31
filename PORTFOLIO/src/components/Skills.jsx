import React, { useState } from 'react';
import { 
  Code2, 
  Terminal, 
  Coffee, 
  Database, 
  Layout, 
  Binary, 
  Boxes, 
  Cpu, 
  Network, 
  Atom, 
  Server, 
  Layers, 
  Palette, 
  Globe, 
  Brain, 
  Share2, 
  Activity, 
  BarChart3, 
  GitBranch, 
  Code,
  Search,
  Sparkles
} from 'lucide-react';
import { skillsData } from '../data/portfolioData';

// Dynamic icon mapper
const iconMap = {
  Terminal,
  Coffee,
  Code2,
  Database,
  Layout,
  Binary,
  Boxes,
  Cpu,
  Network,
  Atom,
  Server,
  Layers,
  Palette,
  Globe,
  Brain,
  Share2,
  Activity,
  BarChart3,
  GitBranch,
  Code
};

export default function Skills() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', ...Object.keys(skillsData)];

  // Aggregate or filter skills
  const allSkillsList = Object.entries(skillsData).flatMap(([cat, skills]) => 
    skills.map(s => ({ ...s, group: cat }))
  );

  const displayedSkills = allSkillsList.filter(skill => {
    const matchesCategory = activeCategory === 'All' || skill.group === activeCategory;
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          skill.highlight.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          skill.group.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="skills" className="py-20 relative bg-gradient-to-b from-transparent via-slate-950/40 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px w-8 bg-brand-500" />
          <span className="text-xs font-mono uppercase tracking-widest text-brand-400 font-semibold">
            Technical Proficiency
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Skills, Frameworks & <span className="text-gradient">Foundations</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2">
              From low-level data structures and operating systems to scalable React frontends and graph-powered machine learning pipelines.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search skill (e.g. Python, React, SQL)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors font-mono"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedSkills.map((skill, idx) => {
            const Icon = iconMap[skill.icon] || Code2;
            return (
              <div
                key={idx}
                className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/5 hover:border-white/20 transition-all duration-200 group hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-cyan-400 group-hover:text-brand-300 group-hover:scale-105 transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {skill.name}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-400">
                        {skill.group}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md border border-white/5">
                    {skill.level}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden mb-2.5">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full transition-all duration-700"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>

                {/* Highlight Detail */}
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                  {skill.highlight}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
