import React, { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import ProjectGallery from "./components/ProjectGallery";
import Experience from "./components/Experience";
import SkillsMatrix from "./components/SkillsMatrix";
import ConsoleDemo from "./components/ConsoleDemo";
import Contact from "./components/Contact";
import SREChatWindow from "./components/SREChatWindow";
import { CheckCircle2, ShieldAlert, X } from "lucide-react";
import { personalInfo } from "./data";
import { motion, AnimatePresence } from "motion/react";

const healingMessages = [
  "📡 INCIDENT INTERCEPTED: INITIALIZING AUTOMATED RECOVERY PLAYBOOK...",
  "🔐 Establishing secure OIDC credentials handshake with EKS api-server...",
  "🔍 SCANNING NODES: kubectl get nodes -o custom-columns=STATUS:.status.conditions[-1].type",
  "🚨 FAULT ISOLATED: pod/payment-gateway-69f8d5-vctrx crashed due to OOMKilled (Exit Code 137).",
  "📈 RESOLUTION RUNNING: Adjusting deployment limits (YAML spec Memory Limit: 512Mi -> 1Gi)...",
  "🔄 SYNCING STATE: argo cd app sync cluster-prod-mumbai --force",
  "🚀 DEPLOYING REPLACEMENT: kubectl rollout restart deployment/payment-gateway",
  "⏳ PULLING CONTAINER LAYER: dkr.ecr.ap-south-1.amazonaws.com/payment-gateway:v2.4.9 (cache-hit)...",
  "🟢 HEALTH CHECK: readiness-probe checking /actuator/health... HTTP 200 OK (passed)",
  "🧹 FLUSHING CACHE: Purging CloudFront CDN edge caches...",
  "🎉 ALL SYSTEMS OPERATIONAL: SLA stability verified at 100.0%. Auto-healed."
];

export default function App() {
  const [activeSection, setActiveSection] = useState("hero");
  const [isChaosMode, setIsChaosMode] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const [healingLogs, setHealingLogs] = useState<string[]>([]);
  const [healingProgress, setHealingProgress] = useState(0);

  const isMountedRef = useRef(true);
  const isHealingRef = useRef(false);
  const healingIntervalRef = useRef<number | null>(null);
  const healingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (healingIntervalRef.current !== null) {
        window.clearInterval(healingIntervalRef.current);
        healingIntervalRef.current = null;
      }
      if (healingTimeoutRef.current !== null) {
        window.clearTimeout(healingTimeoutRef.current);
        healingTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.history === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    if (window.scrollY !== 0) {
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined" || typeof IntersectionObserver === "undefined") return;

    const sections = ["hero", "about", "projects", "experience", "skills", "console", "contact"];
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -40% 0px",
      threshold: 0,
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id) {
          setActiveSection((current) => (current === entry.target.id ? current : entry.target.id));
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const triggerSelfHeal = useCallback(() => {
    if (typeof window === "undefined" || isHealingRef.current) return;

    if (healingIntervalRef.current !== null) {
      window.clearInterval(healingIntervalRef.current);
      healingIntervalRef.current = null;
    }
    if (healingTimeoutRef.current !== null) {
      window.clearTimeout(healingTimeoutRef.current);
      healingTimeoutRef.current = null;
    }

    setHealingLogs(healingMessages);
    setHealingProgress(0);
    setIsHealing(true);
    isHealingRef.current = true;

    healingIntervalRef.current = window.setInterval(() => {
      setHealingProgress((prev) => {
        const next = Math.min(100, prev + 10);
        if (next >= 100) {
          if (healingIntervalRef.current !== null) {
            window.clearInterval(healingIntervalRef.current);
            healingIntervalRef.current = null;
          }
          healingTimeoutRef.current = window.setTimeout(() => {
            if (!isMountedRef.current) return;
            setIsHealing(false);
            setIsChaosMode(false);
            isHealingRef.current = false;
            healingTimeoutRef.current = null;
          }, 1500);
          return 100;
        }
        return next;
      });
    }, 500);
  }, [setIsChaosMode]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    let resizeTimer: number | null = null;
    const setBannerOffset = () => {
      const bannerElement = document.getElementById("incident-banner");
      const height = bannerElement?.offsetHeight ?? 0;
      document.documentElement.style.setProperty("--banner-offset", `${height}px`);
    };

    const onResize = () => {
      if (resizeTimer !== null) {
        window.clearTimeout(resizeTimer);
      }
      resizeTimer = window.setTimeout(setBannerOffset, 100);
    };

    setBannerOffset();
    window.addEventListener("resize", onResize);

    let resizeObserver: ResizeObserver | null = null;
    const bannerElement = document.getElementById("incident-banner");
    if (bannerElement && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(setBannerOffset);
      resizeObserver.observe(bannerElement);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      if (resizeTimer !== null) {
        window.clearTimeout(resizeTimer);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      document.documentElement.style.setProperty("--banner-offset", "0px");
    };
  }, [isChaosMode]);

  return (
    <>
    <div className={`relative min-h-screen bg-gray-950 font-sans text-gray-100 selection:bg-accent selection:text-gray-950 transition-colors duration-700 ${isChaosMode ? "shadow-[inset_0_0_100px_rgba(239,68,68,0.15)] border-red-500/10" : ""}`}>
      <AnimatePresence>
        {isChaosMode && (
          <motion.div
            id="incident-banner"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed top-0 left-0 w-full bg-red-500/10 backdrop-blur-md border-b border-red-500/30 py-3 px-4 z-[60] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono"
          >
            <div className="flex items-center space-x-3 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
              <ShieldAlert size={14} className="shrink-0" />
              <span>
                <strong>[SIMULATED INCIDENT]</strong> EKS Alert: pod/payment-gateway-69f8d5 OOMKilled in <code>prod-mumbai-01</code>
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={triggerSelfHeal}
                className="px-3.5 py-1.5 bg-red-500 hover:bg-red-400 text-white font-bold rounded-lg uppercase tracking-wider text-[10px] shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] cursor-pointer transition-all"
              >
                Trigger SRE Auto-Heal
              </button>
              <button
                onClick={() => setIsChaosMode(false)}
                className="p-1 rounded bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors"
                title="Silence Simulation"
              >
                <X size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar activeSection={activeSection} isChaosMode={isChaosMode} setIsChaosMode={setIsChaosMode} />

      <main className="w-full">
        <Hero isChaosMode={isChaosMode} setIsChaosMode={setIsChaosMode} />
        <About />
        <ProjectGallery />
        <Experience />
        <SkillsMatrix />
        <ConsoleDemo />
        <Contact />
      </main>

      <AnimatePresence>
        {isHealing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl bg-gray-950 border border-red-500/30 rounded-2xl shadow-[0_0_40px_rgba(239,68,68,0.15)] p-6 font-mono text-xs relative overflow-hidden"
            >
              <div className="scanline absolute inset-0 pointer-events-none" />

              <div className="flex items-center justify-between pb-3 border-b border-gray-900 mb-4 select-none">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 animate-pulse" />
                  <span className="text-red-400 uppercase tracking-widest text-[10px] font-bold">
                    SRE Auto-Heal Console v4.0.1
                  </span>
                </div>
                <span className="text-gray-500">Progress: {healingProgress}%</span>
              </div>

              <div className="h-72 overflow-y-auto space-y-2 p-3 bg-gray-950/80 border border-gray-900 rounded-xl leading-relaxed select-none themed-scrollbar">
                {healingLogs.slice(0, Math.ceil((healingProgress / 100) * healingLogs.length)).map((log, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === healingLogs.length - 1 && healingProgress === 100;
                  return (
                    <div
                      key={idx}
                      className={isFirst ? "text-amber-400 font-bold" : isLast ? "text-green-400 font-bold border-t border-gray-900 pt-2 mt-2" : "text-gray-300"}
                    >
                      {log}
                    </div>
                  );
                })}
                {healingProgress < 100 && (
                  <div className="text-accent animate-pulse flex items-center space-x-1">
                    <span className="w-1.5 h-3.5 bg-accent" />
                    <span className="text-[10px] text-gray-500 font-mono">AUTOMATED REMEDIATION IN PROGRESS...</span>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-accent shadow-[0_0_10px_#FFD400]"
                    style={{ width: `${healingProgress}%` }}
                    transition={{ ease: "easeInOut" }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="bg-gray-950 border-t border-gray-900/80 pt-8 pb-12 sm:pt-12 sm:pb-24 px-4 sm:px-6 lg:px-8 relative z-10 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[100px] bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${isChaosMode ? "bg-red-500 shadow-[0_0_8px_#EF4444]" : "bg-green-500 shadow-[0_0_8px_#10B981]"}`} />
              <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                {isChaosMode ? "SIMULATED ANOMALY ACTIVE" : "ALL SYSTEMS OPERATIONAL"}
              </span>
            </div>
            <p className="font-display font-bold text-base text-white mt-2">
              {personalInfo.name} — Portfolio
            </p>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              © {new Date().getFullYear()} Digambar Rajaram. Built with React + Tailwind + Motion.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-2">
            <div className="flex items-center space-x-2.5 text-[10px] font-mono text-gray-400 bg-gray-950 border border-gray-900 px-3 py-1.5 rounded-lg">
              <CheckCircle2 size={12} className="text-accent" />
              <span>Built with React · Tailwind CSS · Framer Motion</span>
            </div>
            <p className="text-[10px] font-mono text-gray-600">
              Served over HTTPS · Design system: in-house
            </p>
          </div>
        </div>
      </footer>
    </div>

    <SREChatWindow />
    </>
  );
}
