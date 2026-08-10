import React from "react";
import { ShieldCheck, Crosshair, Award, Flame, Zap, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import { about } from "../data";

const SparkleStar = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-4 h-4 text-accent animate-pulse ${className}`}
  >
    <path
      d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z"
      fill="currentColor"
    />
  </svg>
);

export default function About() {
  return (
    <section id="about" className="py-12 md:py-24 bg-gray-950 border-t border-gray-900/40 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-10 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[100px] pointer-events-none animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center md:text-left max-w-3xl mx-auto relative"
        >
          <SparkleStar className="absolute top-0 left-0 lg:left-1/4 -translate-y-4 text-accent" />
          <SparkleStar className="absolute bottom-0 right-0 lg:right-1/4 translate-y-4 text-accent/60" />
          
          <span className="font-mono text-xs text-accent tracking-widest uppercase font-medium">
            Engineering Identity
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mt-2 tracking-tight">
            Reliability. Automation. Agentic Operations.
          </h2>
          <div className="h-1 w-12 bg-accent mx-auto md:mx-0 mt-4 rounded-full" />
        </motion.div>

        {/* Bento/Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Main Biography Column (Left) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-7 space-y-6 flex flex-col justify-between"
          >
            <div className="space-y-6 glass-panel p-6 sm:p-8 rounded-2xl border border-gray-900/60 shadow-lg relative overflow-hidden group hover:border-accent/15 transition-all duration-300">
              <div className="absolute -right-12 -top-12 w-24 h-24 bg-accent/5 rounded-full blur-2xl pointer-events-none transition-all duration-500 group-hover:scale-150" />
              <h3 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight leading-snug text-center md:text-left">
                "{about.headline}"
              </h3>
              {about.intro.map((p, idx) => (
                <p key={idx} className="text-gray-400 leading-relaxed text-sm sm:text-base font-sans">
                  {p}
                </p>
              ))}
            </div>

            {/* Quick highlighted value statement */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="p-5 rounded-2xl bg-accent/[0.02] border border-accent/10 orange-glow-sm mt-6 flex items-start space-x-4 glass-panel hover:border-accent/30 transition-all duration-300"
            >
              <div className="p-2.5 bg-accent/10 rounded-lg text-accent shrink-0">
                <Flame size={20} className="animate-pulse" />
              </div>
              <div>
                <h4 className="font-display font-semibold text-white text-sm">Rapid Promotion & Accountability</h4>
                <p className="text-xs text-gray-400 mt-1 leading-normal font-sans">
                  Promoted to Assistant Manager at Protean eGov Technologies within 6 months based on technical execution, outage prevention, and critical incident leadership.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Pillars of Focus (Right Column) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            
            {/* Expertise pillar */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-panel glass-panel-hover p-6 sm:p-8 rounded-2xl border border-gray-900 shadow-md flex-1 relative group"
            >
              <div className="absolute -right-8 -top-8 w-20 h-20 bg-accent/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-accent/10 rounded-lg text-accent">
                  <Zap size={18} />
                </div>
                <h3 className="font-display font-bold text-lg text-white text-center md:text-left">Core Competence</h3>
              </div>

              <ul className="space-y-4">
                {about.expertise.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-sm font-sans">
                    <CheckCircle size={14} className="text-accent mt-1 shrink-0" />
                    <span className="text-gray-300 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Mindset pillar */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass-panel glass-panel-hover p-6 sm:p-8 rounded-2xl border border-gray-900 shadow-md flex-1 relative group"
            >
              <div className="absolute -right-8 -top-8 w-20 h-20 bg-accent/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-accent/10 rounded-lg text-accent">
                  <ShieldCheck size={18} />
                </div>
                <h3 className="font-display font-bold text-lg text-white text-center md:text-left">Engineering Approach</h3>
              </div>

              <ul className="space-y-4">
                {about.approach.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-sm font-sans">
                    <CheckCircle size={14} className="text-accent mt-1 shrink-0" />
                    <span className="text-gray-300 leading-relaxed uppercase-first">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
