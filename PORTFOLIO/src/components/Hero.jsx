import React, { useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Mail, 
  MapPin, 
  GraduationCap, 
  Award, 
  FileText, 
  Code2, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Github, Linkedin } from './Icons';
import { personalInfo, metrics } from '../data/portfolioData';


export default function Hero({ onOpenContact }) {
  const canvasRef = useRef(null);

  // Dynamic interactive network canvas background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    // Generate graph nodes
    const nodeCount = Math.min(Math.floor((width * height) / 16000), 55);
    const nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2.2 + 1.2,
        baseColor: Math.random() > 0.4 ? 'rgba(99, 102, 241,' : 'rgba(6, 182, 212,',
      });
    }

    let mouse = { x: null, y: null, maxDist: 140 };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.22;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }

        // Connect with mouse
        if (mouse.x !== null && mouse.y !== null) {
          const dx = nodes[i].x - mouse.x;
          const dy = nodes[i].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.maxDist) {
            const alpha = (1 - dist / mouse.maxDist) * 0.45;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }

      // Update and draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.baseColor + '0.75)';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background Interactive Graph Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto opacity-70"
      />

      {/* Atmospheric Radial Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[380px] h-[380px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Availability Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 shadow-lg shadow-black/30 backdrop-blur-md mb-6 animate-pulse-slow">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono font-medium text-slate-300">
            Available for Software Development & AI Engineering
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-5">
          Hi, I'm <span className="text-gradient">Edwin Joe M</span>
        </h1>

        {/* Subtitle / Role Tag */}
        <p className="text-lg sm:text-2xl font-medium text-slate-300 max-w-3xl mx-auto mb-4 leading-relaxed">
          Building practical software systems at the intersection of{' '}
          <span className="text-cyan-400 font-semibold">Machine Learning</span>,{' '}
          <span className="text-brand-300 font-semibold">RESTful Architectures</span>, &{' '}
          <span className="text-indigo-400 font-semibold">Full-Stack Web</span>.
        </p>

        {/* Education & Location Quick Pill */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-400 mb-8">
          <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-1.5 backdrop-blur-sm">
            <GraduationCap className="w-4 h-4 text-brand-400" />
            <span>B.Tech IT — <strong>SRM IST</strong></span>
            <span className="font-mono text-emerald-400 font-semibold px-1.5 py-0.2 bg-emerald-500/10 rounded">
              CGPA: 9.35 / 10.0
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-1.5 backdrop-blur-sm">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>Trichy, Tamil Nadu, India</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-1.5 backdrop-blur-sm">
            <Award className="w-4 h-4 text-amber-400" />
            <span>ICRCET 2026 Author</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <a
            href="#projects"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>Explore Featured Projects</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <a
            href="#research"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 hover:border-slate-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>ICRCET 2026 Research</span>
          </a>

          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <Mail className="w-4 h-4" />
            <span>Get in Touch</span>
          </a>
        </div>

        {/* Social Quick Links */}
        <div className="flex items-center justify-center gap-4 mb-14">
          <a
            href={personalInfo.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-600 text-slate-400 hover:text-white text-xs font-mono transition-all"
          >
            <Github className="w-4 h-4" />
            <span>GitHub/Edwinjoe2006</span>
          </a>

          <a
            href={personalInfo.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-600 text-slate-400 hover:text-white text-xs font-mono transition-all"
          >
            <Linkedin className="w-4 h-4 text-cyan-400" />
            <span>LinkedIn Profile</span>
          </a>
        </div>

        {/* Key Metric Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className="glass-panel p-4 sm:p-5 rounded-2xl text-left border border-white/5 hover:border-brand-500/30 transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white group-hover:text-cyan-300 transition-colors">
                  {metric.value}
                </span>
                <span className="text-xs font-mono text-cyan-400 font-semibold">
                  {metric.suffix}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-200 mb-0.5">
                {metric.label}
              </div>
              <div className="text-[11px] text-slate-400 line-clamp-1">
                {metric.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
