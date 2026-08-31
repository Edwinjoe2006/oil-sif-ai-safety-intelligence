import React from 'react';
import { 
  User, 
  Brain, 
  Layers, 
  Server, 
  Database, 
  GraduationCap, 
  CheckCircle, 
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { personalInfo } from '../data/portfolioData';

export default function About() {
  const pillars = [
    {
      icon: Brain,
      title: "AI & Machine Learning",
      desc: "Architecting supervised/unsupervised models, graph centrality analysis, anomaly detection, and predictive scoring algorithms.",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20"
    },
    {
      icon: Layers,
      title: "Full-Stack Web Engineering",
      desc: "Building dynamic React single-page apps backed by Node.js, Express, and Flask with clean component architecture.",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20"
    },
    {
      icon: Server,
      title: "REST APIs & Microservices",
      desc: "Designing robust API contracts with JWT authentication, role-based access control, sub-second latency, and pagination.",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      icon: Database,
      title: "Data & Relational Databases",
      desc: "Mastering complex MySQL schemas, transaction safety, SQLite local storage, and MongoDB NoSQL document design.",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    }
  ];

  return (
    <section id="about" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px w-8 bg-brand-500" />
          <span className="text-xs font-mono uppercase tracking-widest text-brand-400 font-semibold">
            About The Engineer
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Narrative Column */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Solving real problems through <span className="text-gradient">data, intelligent models</span>, and reliable software.
            </h2>

            <p className="text-slate-300 text-base leading-relaxed">
              {personalInfo.bio}
            </p>

            <p className="text-slate-400 text-sm leading-relaxed">
              {personalInfo.aboutExtended}
            </p>

            {/* Quick Feature Checkpoints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-300">
                  Published research author at <strong>ICRCET 2026</strong> in Graph Fraud Detection.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Zap className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-300">
                  Maintains a stellar <strong>9.35 / 10.0 CGPA</strong> in B.Tech Information Technology.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Activity className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-300">
                  Completed virtual internships with <strong>Google, AWS, and YuvaIntern</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <GraduationCap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-300">
                  Strong grasp of core CS fundamentals: DSA, OOP, OS, DBMS, & Networks.
                </span>
              </div>
            </div>
          </div>

          {/* Academic Profile Card Column */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Outer decorative glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-cyan-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-60 transition duration-500" />

              <div className="relative glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <div className="text-xs font-mono text-cyan-400">Academic Standing</div>
                    <div className="text-lg font-bold text-white">SRM Institute of Science & Tech</div>
                  </div>
                  <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-2xl text-brand-400">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                </div>

                {/* Big CGPA metric display */}
                <div className="bg-slate-900/80 rounded-2xl p-5 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-mono">
                      Cumulative GPA
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono mt-0.5">
                      9.35 <span className="text-lg text-slate-400 font-normal">/ 10.0</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Top Rank
                  </span>
                </div>

                {/* Academic Highlights */}
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Degree:</span>
                    <span className="font-medium text-white">B.Tech Information Technology</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-medium text-white">Undergraduate Scholar</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Location:</span>
                    <span className="font-medium text-white">Trichy, Tamil Nadu, India</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Specialization:</span>
                    <span className="font-medium text-cyan-300">Software & Artificial Intelligence</span>
                  </div>
                </div>

                {/* Action */}
                <a
                  href="#research"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all group"
                >
                  <span>Explore Research Contribution</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Core Engineering Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-white/20 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className={`w-11 h-11 rounded-xl ${pillar.bg} ${pillar.border} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${pillar.color}`} />
                </div>
                <h3 className="text-base font-semibold text-white mb-1.5">
                  {pillar.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
