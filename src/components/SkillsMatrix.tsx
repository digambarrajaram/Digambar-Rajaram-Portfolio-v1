import React, { useState, useMemo } from "react";
import { Search, Brain, Cloud, ShieldCheck, HardDrive, Eye, Network, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { skills } from "../data";

export default function SkillsMatrix() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    { id: "All", label: "All Skills" },
    { id: "agenticAi", label: "Agentic AI Ops", icon: <Brain size={16} /> },
    { id: "cloudDevOps", label: "Cloud & IaC", icon: <Cloud size={16} /> },
    { id: "kubernetesAndSecurity", label: "K8s & Security", icon: <ShieldCheck size={16} /> },
    { id: "infrastructureVirtualization", label: "Virtualization & DR", icon: <HardDrive size={16} /> },
    { id: "monitoringAutomation", label: "SRE & Monitoring", icon: <Eye size={16} /> },
    { id: "networking", label: "Networking & VPC", icon: <Network size={16} /> },
  ];

  const cleanedQuery = searchQuery.trim().toLowerCase();

  // Filter skills list based on active category selection and query matching
  const filteredSkillsMap = useMemo(() => {
    const keys = Object.keys(skills) as Array<keyof typeof skills>;
    const result: Record<string, string[]> = {};

    keys.forEach((key) => {
      // Check category match
      const matchesCategory = selectedCategory === "All" || selectedCategory === key;
      if (!matchesCategory) return;

      // Filter sub-list by query match
      const matches = skills[key].filter((skill) =>
        skill.toLowerCase().includes(cleanedQuery)
      );

      if (matches.length > 0) {
        result[key] = matches;
      }
    });

    return result;
  }, [selectedCategory, cleanedQuery]);

  // Pretty human category labels mapping
  const categoryLabels: Record<string, string> = {
    agenticAi: "Agentic AI Operations & LLM Engineering",
    cloudDevOps: "Cloud Infrastructure, DevOps & CI/CD",
    awsComputeStorage: "AWS Compute & Storage",
    awsNetworking: "AWS Networking & Edge",
    awsSecurity: "AWS Identity, Key Management & Monitoring",
    kubernetesAndSecurity: "Advanced Kubernetes Operations & Platform Security",
    infrastructureVirtualization: "Enterprise Virtualization, Datacenter & DR Systems",
    monitoringAutomation: "SRE, Central Logging & Systems Automation",
    networking: "Cloud & Container Networking Architectures",
  };

  const hasSkillsFound = Object.keys(filteredSkillsMap).length > 0;

  return (
    <section id="skills" className="py-12 md:py-24 bg-gray-950 border-t border-gray-900/40 relative overflow-hidden">
      {/* Ambient glowing radial blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center md:text-left"
          >
            <span className="font-mono text-xs text-accent tracking-widest uppercase font-medium">
              Technical Arsenal
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mt-2 tracking-tight">
              Skills & Expertise Matrix
            </h2>
            <p className="text-gray-400 mt-2 text-sm sm:text-base max-w-xl font-sans">
              A comprehensive directory of verified technologies, frameworks, and engineering standards used on production workloads.
            </p>
          </motion.div>

          {/* Search bar inside the component */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative w-full md:max-w-xs shrink-0"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Filter specific tool (e.g. Terraform)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-950 border border-gray-900 hover:border-gray-800 focus:border-accent focus:ring-1 focus:ring-accent/20 text-base sm:text-sm text-gray-200 pl-10 pr-4 py-2 rounded-lg transition-all outline-none"
            />
          </motion.div>
        </div>

        {/* Category Toolbar Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap gap-1.5 mb-10 pb-2 border-b border-gray-900/40 overflow-x-auto"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2.5 text-xs rounded-lg transition-all cursor-pointer font-sans font-semibold flex items-center space-x-2 shrink-0 ${
                selectedCategory === cat.id
                  ? "bg-accent text-gray-950 border border-accent shadow-[0_0_15px_rgba(255,212,0,0.25)]"
                  : "text-gray-400 hover:text-white border border-transparent hover:bg-white/5"
              }`}
            >
              {cat.icon && <span className={`${selectedCategory === cat.id ? "text-gray-950" : "text-accent"}`}>{cat.icon}</span>}
              <span>{cat.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Grid display of groups */}
        <AnimatePresence mode="popLayout">
          {hasSkillsFound ? (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
            >
              {Object.keys(filteredSkillsMap).map((key, index) => {
                const list = filteredSkillsMap[key];
                const title = categoryLabels[key] || key;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    key={key}
                    className="glass-panel glass-panel-hover p-6 sm:p-7 rounded-2xl border border-gray-900/60 shadow-md flex flex-col h-full relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 h-0.5 w-0 bg-accent group-hover:w-full transition-all duration-300" />
                    <div className="absolute -right-8 -top-8 w-16 h-16 bg-accent/5 rounded-full blur-xl pointer-events-none" />

                    <h3 className="font-display font-bold text-sm sm:text-base text-white mb-5 tracking-tight flex items-start md:items-center space-x-2 text-center md:text-left">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 shadow-[0_0_8px_rgba(255,212,0,0.8)] animate-pulse mt-1 md:mt-0" />
                      <span>{title}</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {list.map((skill, idx) => {
                        const isLastSingle = list.length % 2 === 1 && idx === list.length - 1;
                        return (
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            key={skill}
                            className={`px-3.5 py-2 rounded-lg bg-gray-950/80 border border-gray-900/50 flex items-center justify-between hover:border-accent/20 hover:bg-gray-900/40 transition-all cursor-default ${isLastSingle ? 'sm:col-span-2' : ''}`}
                          >
                            <span className="text-xs sm:text-sm text-gray-300 font-sans leading-tight">
                              {skill}
                            </span>
                            <CheckCircle size={12} className="text-accent/60 shrink-0 ml-2" />
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-gray-950 border border-dashed border-gray-900 rounded-2xl p-8"
            >
              <Search size={32} className="text-accent/40 mx-auto mb-3 animate-pulse" />
              <h3 className="text-md font-display font-semibold text-white">No Matching Skills Found</h3>
              <p className="text-xs text-gray-400 mt-1">
                Try adjusting your query, or click "All Skills" to view the full technical inventory.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
