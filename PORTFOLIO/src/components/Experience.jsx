import React from 'react';
import { 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  MapPin, 
  Award, 
  CheckCircle2,
  Building,
  Sparkles
} from 'lucide-react';
import { experiences } from '../data/portfolioData';

export default function Experience() {
  return (
    <section id="experience" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px w-8 bg-brand-500" />
          <span className="text-xs font-mono uppercase tracking-widest text-brand-400 font-semibold">
            Track Record & Career
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Education & <span className="text-gradient">Virtual Internships</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-2">
              Demonstrated academic excellence alongside focused industry training programs in Artificial Intelligence, Cloud Architectures, and Statistical Analytics.
            </p>
          </div>
        </div>

        {/* Timeline Container */}
        <div className="relative border-l border-slate-800 ml-4 sm:ml-8 space-y-12">
          {experiences.map((item, idx) => {
            const isEducation = item.type === 'Education';

            return (
              <div key={item.id} className="relative pl-8 sm:pl-10 group">
                {/* Timeline Node Point */}
                <div className={`absolute -left-[17px] top-1.5 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  isEducation
                    ? 'bg-[#070b14] border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-500/20 group-hover:scale-110'
                    : 'bg-[#070b14] border-brand-500 text-brand-400 shadow-lg shadow-brand-500/20 group-hover:scale-110'
                }`}>
                  {isEducation ? (
                    <GraduationCap className="w-4 h-4" />
                  ) : (
                    <Briefcase className="w-4 h-4" />
                  )}
                </div>

                {/* Content Card */}
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-300 group-hover:-translate-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {item.type}
                      </span>
                      {item.badge && (
                        <span className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full border ${
                          isEducation 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-brand-500/10 text-brand-300 border-brand-500/30'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.period}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                    {item.role}
                  </h3>

                  <div className="text-sm font-semibold text-cyan-300 mb-4 flex items-center gap-1.5">
                    <Building className="w-4 h-4" />
                    <span>{item.organization}</span>
                    {item.grade && (
                      <span className="ml-2 font-mono text-xs text-slate-400 font-normal">
                        ({item.grade})
                      </span>
                    )}
                  </div>

                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-5">
                    {item.description}
                  </p>

                  {/* Skills / Key Learnings */}
                  <div>
                    <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                      Competencies Practiced:
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {item.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-slate-300 text-xs font-mono border border-white/5"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
