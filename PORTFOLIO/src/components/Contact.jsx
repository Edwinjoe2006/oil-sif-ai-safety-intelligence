import React, { useState } from 'react';
import { 
  Mail, 
  Copy, 
  Check, 
  Send, 
  MapPin, 
  Phone, 
  Sparkles, 
  ExternalLink, 
  MessageSquare 
} from 'lucide-react';
import { Github, Linkedin } from './Icons';
import confetti from 'canvas-confetti';
import { personalInfo } from '../data/portfolioData';


export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: 'Project Collaboration / Software Opportunity',
    message: ''
  });
  const [sent, setSent] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(personalInfo.email);
    setCopied(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 }
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Generate native mailto link
    const mailtoUrl = `mailto:${personalInfo.email}?subject=${encodeURIComponent(formState.subject)}&body=${encodeURIComponent(
      `Name: ${formState.name}\nEmail: ${formState.email}\n\nMessage:\n${formState.message}`
    )}`;
    window.location.href = mailtoUrl;
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <section id="contact" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px w-8 bg-brand-500" />
          <span className="text-xs font-mono uppercase tracking-widest text-brand-400 font-semibold">
            Get In Touch
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Direct Info & Socials */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Let's build something <span className="text-gradient">exceptional</span> together.
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Open to software engineering roles, machine learning developer opportunities, research collaborations, and full-stack projects. Feel free to reach out directly via email or LinkedIn!
            </p>

            {/* Quick Copy Email Card */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 relative overflow-hidden group">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 block">Direct Email</span>
                    <span className="text-sm font-mono font-semibold text-white">
                      {personalInfo.email}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCopyEmail}
                  className={`p-2.5 rounded-xl border transition-all duration-200 ${
                    copied
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 hover:text-white'
                  }`}
                  title="Copy email address"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {copied && (
                <div className="mt-2 text-xs font-mono text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                  <Check className="w-3 h-3" />
                  <span>Email address copied to clipboard!</span>
                </div>
              )}
            </div>

            {/* Direct Connect Hub */}
            <div className="space-y-3">
              {/* LinkedIn */}
              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 hover:bg-slate-900/90 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
                    <Linkedin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">LinkedIn Profile</div>
                    <div className="text-xs text-slate-400 font-mono">Professional network & recommendations</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </a>

              {/* GitHub */}
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-brand-500/30 hover:bg-slate-900/90 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-105 transition-transform">
                    <Github className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">GitHub Repositories</div>
                    <div className="text-xs text-slate-400 font-mono">@Edwinjoe2006 • Code & Contributions</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-brand-400 transition-colors" />
              </a>

              {/* Location */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/40 border border-white/5 text-slate-300 text-xs">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Trichy, Tamil Nadu, India • Ready for Remote & Onsite</span>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Message Form */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">
                  Send a Direct Message
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. sarah@techcompany.com"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Message
                  </label>
                  <textarea
                    required
                    rows="4"
                    placeholder="Hi Edwin, I came across your portfolio and ICRCET research and would love to discuss..."
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-brand-500 transition-colors resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-xs bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white shadow-lg shadow-brand-500/20 active:scale-[0.99] transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message via Email</span>
                </button>

                {sent && (
                  <p className="text-xs text-emerald-400 text-center font-mono animate-in fade-in">
                    ✓ Opening your email client to dispatch the message!
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
