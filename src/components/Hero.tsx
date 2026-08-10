import React, { useState, useEffect } from "react";
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Activity, 
  Terminal, 
  Copy, 
  Check, 
  ArrowRight, 
  Layers, 
  Play, 
  RefreshCw, 
  ShieldAlert, 
  Sparkles, 
  Zap, 
  Sliders, 
  ChevronRight,
  Database,
  Lock,
  Globe,
  Radio
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { personalInfo, stats } from "../data";
import { scrollToElement } from "../hooks/scrollTo";

interface HeroProps {
  isChaosMode: boolean;
  setIsChaosMode: (val: boolean) => void;
}

const SparkleStar = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-5 h-5 text-accent animate-pulse ${className}`}
  >
    <path
      d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z"
      fill="currentColor"
    />
  </svg>
);

export default function Hero({ isChaosMode, setIsChaosMode }: HeroProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeTab, setActiveTab] = useState<"cluster" | "metrics" | "playbooks">("cluster");
  const [chartData, setChartData] = useState<number[]>([42, 45, 41, 48, 43, 50, 46, 52, 44, 48, 55, 49]);
  const [memoryData, setMemoryData] = useState<number[]>([64, 66, 65, 68, 67, 69, 68, 70, 71, 70, 72, 73]);
  const [activeAlertCount, setActiveAlertCount] = useState(0);

  // Copy email logic
  const copyToClipboard = () => {
    navigator.clipboard.writeText(personalInfo.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  // Generate dynamic chart data points
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData((prev) => {
        const nextData = [...prev.slice(1)];
        let newValue;
        if (isChaosMode) {
          // Chaos mode causes high CPU spikes
          newValue = Math.floor(Math.random() * 15) + 84; 
        } else {
          // Stable random workload
          newValue = Math.floor(Math.random() * 12) + 38;
        }
        return [...nextData, newValue];
      });

      setMemoryData((prev) => {
        const nextData = [...prev.slice(1)];
        let newValue;
        if (isChaosMode) {
          newValue = Math.floor(Math.random() * 8) + 89; // Memory leak
        } else {
          newValue = Math.floor(Math.random() * 5) + 62;
        }
        return [...nextData, newValue];
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isChaosMode]);

  // Adjust alert count dynamically
  useEffect(() => {
    if (isChaosMode) {
      setActiveAlertCount(3);
    } else {
      setActiveAlertCount(0);
    }
  }, [isChaosMode]);

  // Convert array data to SVG polyline coordinates
  const getSvgPath = (data: number[], height: number = 100) => {
    const maxVal = 100;
    const width = 360;
    const step = width / (data.length - 1);
    return data.map((val, idx) => {
      const x = idx * step;
      const y = height - (val / maxVal) * height;
      return `${x},${y}`;
    }).join(" ");
  };

  const dashboardStats = [
    {
      id: "stat-1",
      icon: <Server className={isChaosMode ? "text-red-400" : "text-accent"} size={20} />,
      label: "Node Status",
      value: isChaosMode ? "3 Degraded" : stats.vmsManaged,
      desc: isChaosMode ? "EKS replica failure" : "Production host nodes"
    },
    {
      id: "stat-2",
      icon: <Cpu className={isChaosMode ? "text-red-400" : "text-accent"} size={20} />,
      label: "Active CPU Load",
      value: isChaosMode ? "96.4%" : "41.2%",
      desc: isChaosMode ? "OOMKilled event logs" : "Cluster reservation optimal"
    },
    {
      id: "stat-3",
      icon: <Activity className={isChaosMode ? "text-red-400 animate-pulse" : "text-accent"} size={20} />,
      label: "System SLA",
      value: isChaosMode ? "94.12%" : stats.uptime,
      desc: isChaosMode ? "Critical Incident Active" : "Guaranteed SLA baseline"
    }
  ];

  return (
    <section
      id="hero"
      className="relative z-0 min-h-screen pt-24 sm:pt-32 pb-8 md:pb-12 flex flex-col justify-center items-center overflow-hidden terminal-grid bg-gray-950 px-4 sm:px-6 lg:px-8 scroll-mt-20"
      style={{ paddingTop: `calc(var(--banner-offset, 0px) + 6rem)` }}
    >
      {/* Background ambient gradient light blobs */}
      <div className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-all duration-1000 ${
        isChaosMode ? "bg-red-500/10" : "bg-accent/5"
      } animate-float-slow`} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none animate-float-reverse" />


      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">
        
        {/* Left Side: Text and Core CTA */}
        <div className="flex-1 text-center md:text-left max-w-2xl">
          {/* Tagline / System Status Badge */}
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-gray-900/40 border border-gray-800 backdrop-blur-sm shadow-xl select-none mb-6">
            <span className={`w-2 h-2 rounded-full ${isChaosMode ? "bg-red-500 animate-ping" : "bg-accent animate-pulse"}`} />
            <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest font-bold">SYSTEM POSTURE:</span>
            <span className={`font-mono text-[10px] uppercase font-bold tracking-wider transition-colors duration-500 ${isChaosMode ? "text-red-400" : "text-accent"}`}>
              {isChaosMode ? "🔥 CRITICAL SIMULATED ANOMALY" : "🟢 100% OPERATIONAL SLA"}
            </span>
          </div>

          <div className="relative">
            <SparkleStar className="absolute -top-8 -left-6 hidden md:block text-accent/60" />
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-[1.05] text-white text-center md:text-left"
            >
              Engineering Resilient, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-yellow-200 to-amber-400 font-extrabold drop-shadow-[0_2px_15px_rgba(255,212,0,0.15)]">
                AI-Driven Infrastructure
              </span>
            </motion.h1>

            {/* Job title — sourced directly from personalInfo.title, single source of truth with resume/data.ts */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-3 font-mono text-sm sm:text-base text-accent tracking-wide uppercase"
            >
              {personalInfo.title}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-base sm:text-lg text-gray-400 mt-6 leading-relaxed"
            >
              Hi, I'm <strong className="text-white font-semibold">{personalInfo.name}</strong>. I design high-availability cloud infrastructure, production Kubernetes clusters, and autonomous self-healing platforms. Currently pioneering <strong>PromptOps</strong> to integrate agentic AI frameworks with production observability to auto-remediate live system incidents.
            </motion.p>
          </div>

          {/* Interactive Controller Switch in Text block */}
          <div className="mt-8 p-4 rounded-xl bg-gray-900/30 border border-gray-900 backdrop-blur-sm max-w-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-mono text-gray-400 font-bold uppercase tracking-wider">Disaster Simulation Deck</p>
              <p className="text-[11px] text-gray-500 mt-1">Simulate a real-time cluster incident to demonstrate how my automated self-healing playbooks remediate memory leaks and pod crashes.</p>
            </div>
            <button
              onClick={() => setIsChaosMode(!isChaosMode)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out outline-none mt-3 sm:mt-0 ${
                isChaosMode ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-gray-700 hover:bg-gray-600"
              }`}
              aria-label="Toggle Disaster Simulation"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-gray-950 shadow ring-0 transition duration-300 ease-in-out flex items-center justify-center ${
                  isChaosMode ? "translate-x-5" : "translate-x-0"
                }`}
              >
                {isChaosMode ? "🔥" : "🟢"}
              </span>
            </button>
          </div>

          {/* CTA Group with neon-hover glow buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 mt-8 justify-center md:justify-start"
          >
            <button
              onClick={() => {
                scrollToElement("projects");
              }}
              className="px-6 py-3 bg-accent hover:bg-accent-hover text-gray-950 font-sans font-bold rounded-lg shadow-[0_0_25px_rgba(255,212,0,0.3)] hover:shadow-[0_0_35px_rgba(255,212,0,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center space-x-2 cursor-pointer text-sm tracking-wider uppercase"
            >
              <span>Explore My Work</span>
              <ArrowRight size={15} />
            </button>

            <button
              onClick={() => {
                scrollToElement("console");
              }}
              className="px-6 py-3 bg-gray-900 hover:bg-gray-850 text-white font-mono rounded-lg border border-gray-800 hover:border-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center space-x-2 cursor-pointer text-sm"
            >
              <Terminal size={15} className="text-accent animate-pulse" />
              <span>Launch Live Playground</span>
            </button>

            <button
              onClick={copyToClipboard}
              className="px-4 py-3 bg-gray-950 hover:bg-gray-900 text-gray-400 hover:text-white font-mono rounded-lg border border-gray-900 hover:border-gray-800 transition-all duration-200 flex items-center space-x-1.5 cursor-pointer text-xs"
            >
              {copiedEmail ? (
                <>
                  <Check size={13} className="text-green-500 animate-bounce" />
                  <span className="text-green-500">Email Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Get Enterprise Demo</span>
                </>
              )}
            </button>
          </motion.div>
        </div>

        {/* Right Side: Ultra-polished high-fidelity SaaS console with active charts & nodes */}
        <div className="flex-1 w-full max-w-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`glass-panel rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden transition-all duration-500 ${
              isChaosMode 
                ? "shadow-[0_0_50px_rgba(239,68,68,0.1)] border-red-500/20" 
                : "shadow-[0_0_40px_rgba(255,212,0,0.06)] hover:border-accent/10"
            }`}
          >
            {/* Header / Title bar */}
            <div className="bg-gray-900/40 px-5 py-4 border-b border-gray-900 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-[11px] font-mono text-gray-500 uppercase tracking-widest pl-2">Console // AetherSRE v2.4</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-950/80 px-2.5 py-1 rounded border border-gray-900 text-[10px] font-mono">
                <span className={`w-1.5 h-1.5 rounded-full ${isChaosMode ? "bg-red-500 animate-pulse" : "bg-accent"}`} />
                <span className="text-gray-400 font-bold">{isChaosMode ? "3 INCDNT" : "OK"}</span>
              </div>
            </div>

            {/* Main console content */}
            <div className="p-5">
              {/* Top Interactive Tabs inside Dashboard */}
              <div className="flex bg-gray-950/80 p-1 rounded-lg border border-gray-900 mb-5 text-[11px] font-mono font-bold select-none">
                <button
                  onClick={() => setActiveTab("cluster")}
                  className={`flex-1 py-1.5 rounded-md text-center transition-all ${
                    activeTab === "cluster" ? "bg-accent text-gray-950 font-bold" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Cluster Nodes
                </button>
                <button
                  onClick={() => setActiveTab("metrics")}
                  className={`flex-1 py-1.5 rounded-md text-center transition-all ${
                    activeTab === "metrics" ? "bg-accent text-gray-950 font-bold" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Live Metrics
                </button>
                <button
                  onClick={() => setActiveTab("playbooks")}
                  className={`flex-1 py-1.5 rounded-md text-center transition-all ${
                    activeTab === "playbooks" ? "bg-accent text-gray-950 font-bold" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Auto Playbooks
                </button>
              </div>

              {/* Tab 1: Cluster Nodes */}
              {activeTab === "cluster" && (
                <div className="space-y-4">
                  <div className="cluster-header flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] font-mono text-gray-400">
                    <span className="cluster-title">EKS-prod-ap-south-01 Cluster Nodes (18 Nodes)</span>
                    <span className="cluster-filter text-gray-500">Filter: Active</span>
                  </div>

                  {/* Nodes Grid */}
                  <div className="cluster-nodes-grid grid grid-cols-3 sm:grid-cols-6 gap-2 bg-gray-950/60 p-4 rounded-xl border border-gray-900/60">
                    {Array.from({ length: 18 }).map((_, i) => {
                      // Simulating some crashing nodes in Chaos Mode
                      const isFailingNode = isChaosMode && (i === 4 || i === 9 || i === 13);
                      return (
                        <div
                          key={i}
                          className={`h-10 rounded-lg flex flex-col items-center justify-center border transition-all duration-500 relative group cursor-pointer ${
                            isFailingNode 
                              ? "bg-red-500/10 border-red-500/35 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]" 
                              : "bg-gray-900/40 border-gray-800 text-gray-400 hover:border-accent/40 hover:text-accent"
                          }`}
                        >
                          <Server size={14} className={isFailingNode ? "animate-bounce" : ""} />
                          <span className="text-[7px] font-mono mt-1">N-{String(i + 1).padStart(2, "0")}</span>

                          {/* Hover node details */}
                          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-800 rounded px-2 py-1 text-[8px] font-mono text-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap">
                            {isFailingNode ? (
                              <span className="text-red-400 font-bold">🚨 FAULT: OOMKilled</span>
                            ) : (
                              <span>🟢 Healthy VM Node</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Node Stats row */}
                  <div className="cluster-status-footer flex flex-col sm:flex-row gap-3 justify-between font-mono text-[10px] text-gray-500 bg-gray-900/10 p-3 rounded-lg border border-gray-900/50">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span>{isChaosMode ? "15 Online" : "18 Online"}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span>{isChaosMode ? "3 Crashing" : "0 Failed"}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                      <span>0 Standby</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Live Metrics */}
              {activeTab === "metrics" && (
                <div className="space-y-4">
                  {/* CPU Sparkline Chart */}
                  <div className="bg-gray-950/60 p-4 rounded-xl border border-gray-900/60">
                    <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                      <div className="flex items-center space-x-1.5 text-gray-400">
                        <Cpu size={12} className="text-accent" />
                        <span>CPU Utilization (Cluster Average)</span>
                      </div>
                      <span className={`font-bold ${isChaosMode ? "text-red-400 animate-pulse" : "text-accent"}`}>
                        {chartData[chartData.length - 1]}%
                      </span>
                    </div>
                    <div className="h-20 w-full flex items-end">
                      <svg viewBox="0 0 360 100" className="w-full h-full overflow-visible">
                        <polyline
                          fill="none"
                          stroke={isChaosMode ? "#EF4444" : "#FFD400"}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={getSvgPath(chartData, 90)}
                          className="transition-all duration-300"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* RAM Sparkline Chart */}
                  <div className="bg-gray-950/60 p-4 rounded-xl border border-gray-900/60">
                    <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                      <div className="flex items-center space-x-1.5 text-gray-400">
                        <Database size={12} className="text-accent" />
                        <span>Memory Reservation (Cluster Limit)</span>
                      </div>
                      <span className={`font-bold ${isChaosMode ? "text-red-400 animate-pulse" : "text-accent"}`}>
                        {memoryData[memoryData.length - 1]}%
                      </span>
                    </div>
                    <div className="h-20 w-full flex items-end">
                      <svg viewBox="0 0 360 100" className="w-full h-full overflow-visible">
                        <polyline
                          fill="none"
                          stroke={isChaosMode ? "#F59E0B" : "#FFD400"}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={getSvgPath(memoryData, 90)}
                          className="transition-all duration-300"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Playbooks */}
              {activeTab === "playbooks" && (
                <div className="space-y-3 font-mono text-[11px]">
                  <div className="text-gray-400 mb-2">Automated Incident Runbooks Ready</div>
                  
                  <div className="p-2.5 rounded-lg bg-gray-900/40 border border-gray-900 hover:border-accent/20 transition-all flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap size={12} className="text-accent" />
                      <span className="text-gray-300">Scale EKS Replica Groups</span>
                    </div>
                    <span className="text-gray-500 font-bold text-[9px] uppercase tracking-wider">0s Auto trigger</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-gray-900/40 border border-gray-900 hover:border-accent/20 transition-all flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShieldAlert size={12} className="text-red-400" />
                      <span className="text-gray-300">OOMKilled Pod Auto-Recycle</span>
                    </div>
                    <span className="text-red-400 font-bold text-[9px] uppercase tracking-wider animate-pulse">Running</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-gray-900/40 border border-gray-900 hover:border-accent/20 transition-all flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sliders size={12} className="text-accent" />
                      <span className="text-gray-300">CloudFront CDN Cache Invalidation</span>
                    </div>
                    <span className="text-gray-500 font-bold text-[9px] uppercase tracking-wider">Trigger on sync</span>
                  </div>
                </div>
              )}
            </div>

            {/* Dashboard interactive status bar */}
            <div className="bg-gray-900/30 px-5 py-3 border-t border-gray-900 flex items-center justify-between">
              <span className="text-[10px] font-mono text-gray-500">Postgres DB cluster: Connected</span>
              <span className="text-[10px] font-mono text-accent flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                <span>Live agent connection</span>
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Embedded SRE Real-world Dashboard Stats Row */}
      <div className="w-full max-w-7xl mx-auto mt-16 relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {dashboardStats.map((stat, idx) => (
            <div
              key={stat.id}
              className={`glass-panel glass-panel-hover p-5 rounded-2xl flex items-center gap-4 border border-white/5 relative overflow-hidden transition-all duration-500 ${
                isChaosMode && (idx === 0 || idx === 1 || idx === 2)
                  ? "border-red-500/10 bg-red-950/5 shadow-[0_0_15px_rgba(239,68,68,0.03)]"
                  : "hover:border-accent/20"
              }`}
            >
              {/* Bottom yellow highlight bar on hover */}
              <div className={`absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full bg-accent`} />

              <div className={`p-3 rounded-xl bg-gray-950 border border-gray-900 text-accent`}>
                {stat.icon}
              </div>

              <div>
                <span className="block text-[10px] font-mono text-gray-500 uppercase tracking-widest font-semibold">{stat.label}</span>
                <span className={`block text-xl font-display font-bold mt-1 tracking-tight ${
                  isChaosMode && (idx === 0 || idx === 1 || idx === 2) ? "text-red-400" : "text-white"
                }`}>
                  {stat.value}
                </span>
                <p className="text-xs text-gray-400 mt-0.5 font-sans">{stat.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Floating Sparkle Star scroll indicator */}
      <motion.div
        animate={{
          y: [0, 8, 0],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        onClick={() => {
          scrollToElement("about");
        }}
        className="mt-20 flex flex-col items-center space-y-1.5 cursor-pointer text-gray-500 hover:text-accent transition-colors font-mono text-[10px] uppercase tracking-widest"
      >
        <span>Explore Core Modules</span>
        <ArrowRight size={14} className="text-accent/80 rotate-90" />
      </motion.div>
    </section>
  );
}
