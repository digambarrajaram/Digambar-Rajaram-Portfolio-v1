import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Search, ArrowRight, ShieldAlert, Sparkles, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { projects } from "../data";
import { Project } from "../types";

interface IndexedProject {
  project: Project;
  normalizedTitle: string;
  normalizedDescription: string;
  normalizedTechnologies: readonly string[];
}

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
}

const ProjectCard = React.memo(function ProjectCard({ project, onSelect }: ProjectCardProps) {
  const techs = project.technologies ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.45 }}
      onClick={() => onSelect(project)}
      className="glass-panel glass-panel-hover p-5 sm:p-6 rounded-xl border border-gray-900 flex flex-col justify-between items-start orange-glow-sm cursor-pointer group relative overflow-hidden"
    >
      <div>
        <div className="flex items-center justify-between w-full mb-4">
          <span className="font-mono text-[10px] sm:text-[11px] text-accent font-semibold tracking-wider uppercase bg-accent/10 px-2 py-0.5 rounded border border-accent/10">
            {project.category}
          </span>
          {project.category.includes("AI") && (
            <Sparkles size={14} className="text-amber-400 animate-pulse" />
          )}
        </div>

        <h3 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-accent transition-colors tracking-tight leading-snug">
          {project.title}
        </h3>

        <p className="text-xs sm:text-sm text-gray-400 mt-2.5 leading-relaxed line-clamp-3">
          {project.description}
        </p>
      </div>

      <div className="w-full mt-6">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {techs.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="font-mono text-[10px] sm:text-[11px] text-gray-400 bg-gray-900 border border-gray-900/60 px-2 py-0.5 rounded"
            >
              {tech}
            </span>
          ))}
          {techs.length > 4 && (
            <span className="font-mono text-[10px] sm:text-[11px] text-gray-500 bg-gray-900 px-2 py-0.5 rounded">
              +{techs.length - 4} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between w-full pt-3 border-t border-gray-900/60 text-xs font-mono text-gray-400 group-hover:text-white transition-colors">
          <span className="flex items-center space-x-1 group-hover:text-accent transition-colors">
            <span>View Blueprint</span>
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </span>
          {project.metrics && (
            <span className="text-[10px] text-accent font-medium">Metric Ready</span>
          )}
        </div>
      </div>
    </motion.div>
  );
});

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

export default function ProjectGallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const categories = useMemo(() => {
    const setOfCategories = new Set<string>();
    projects.forEach((project) => {
      setOfCategories.add(project.category ?? "Uncategorized");
    });
    return ["All", ...setOfCategories];
  }, []);

  const indexedProjects = useMemo<IndexedProject[]>(
    () =>
      projects.map((project) => ({
        project,
        normalizedTitle: project.title.toLowerCase(),
        normalizedDescription: project.description.toLowerCase(),
        normalizedTechnologies: project.technologies?.map((tech) => tech.toLowerCase()) ?? []
      })),
    []
  );

  const normalizedQuery = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);

  const filteredProjects = useMemo<Project[]>(() => {
    if (indexedProjects.length === 0) return [];
    const activeCategory = selectedCategory === "All" ? undefined : selectedCategory;
    if (!normalizedQuery && !activeCategory) {
      return projects;
    }

    const results: Project[] = [];
    for (const item of indexedProjects) {
      const category = item.project.category ?? "Uncategorized";
      if (activeCategory && category !== activeCategory) continue;
      if (!normalizedQuery) {
        results.push(item.project);
        continue;
      }
      if (
        item.normalizedTitle.includes(normalizedQuery) ||
        item.normalizedDescription.includes(normalizedQuery) ||
        item.normalizedTechnologies.some((tech) => tech.includes(normalizedQuery))
      ) {
        results.push(item.project);
      }
    }
    return results;
  }, [indexedProjects, normalizedQuery, selectedCategory]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    tabsRef.current = tabsRef.current.slice(0, categories.length);
  }, [categories.length]);

  const setTabRef = useCallback((node: HTMLButtonElement | null, index: number) => {
    tabsRef.current[index] = node;
  }, []);

  const handleProjectSelect = useCallback((project: Project) => {
    setSelectedProject(project);
  }, []);

  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedCategory("All");
    setSearchQuery("");
  }, []);

  useEffect(() => {
    if (!selectedProject || typeof document === "undefined") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedProject]);

  useEffect(() => {
    const idx = categories.indexOf(selectedCategory);
    if (idx === -1) return;
    const btn = tabsRef.current[idx];
    const container = containerRef.current;
    if (!btn || !container) return;

    try {
      btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    } catch {
      const offset = btn.offsetLeft - container.clientWidth / 2 + btn.clientWidth / 2;
      container.scrollTo({ left: Math.max(0, offset), behavior: "smooth" });
    }
  }, [selectedCategory, categories]);

  return (
    <section id="projects" className="py-4 md:py-10 bg-gray-950 border-t border-gray-900/40 relative z-0 scroll-mt-20">
      <div className="absolute top-1/2 left-10 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4 relative">
          <div className="relative text-center md:text-left">
            <SparkleStar className="absolute -top-6 left-0 text-accent" />
            <span className="font-mono text-xs text-accent tracking-widest uppercase font-medium">
              Demonstrated Work
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mt-2 tracking-tight">
              Interactive Project Gallery
            </h2>
            <p className="text-gray-400 mt-2 text-sm sm:text-base max-w-xl">
              Selected projects showcasing production-grade cloud architectures, container orchestration, GitOps automation, and cutting-edge agentic operations.
            </p>
          </div>

          <div className="font-mono text-xs px-3 py-1 bg-gray-900 border border-gray-800 text-gray-400 rounded-md shrink-0 self-center md:self-end">
            Showing <span className="text-accent font-bold">{filteredProjects.length}</span> of {projects.length} Systems
          </div>
        </div>

        <div className="mb-10 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-950/45 p-4 rounded-xl border border-gray-900/50 backdrop-blur-sm">
          <div className="relative w-full md:w-auto">
            <div
              ref={(el) => {
                containerRef.current = el;
              }}
              className="flex gap-1.5 w-full md:w-auto overflow-x-auto md:overflow-visible whitespace-nowrap md:flex-wrap md:justify-start py-2 px-1 hide-scrollbar"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {categories.map((cat, idx) => (
                <button
                  key={`${cat}-${idx}`}
                  ref={(el) => setTabRef(el, idx)}
                  type="button"
                  aria-pressed={selectedCategory === cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`inline-flex items-center px-3 py-1.5 text-xs rounded-lg transition-all cursor-pointer font-medium min-w-max whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-accent text-gray-950 shadow-[0_0_12px_rgba(204,255,0,0.3)] font-bold"
                      : "text-gray-400 hover:text-white hover:bg-white/5 bg-gray-900/40"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="pointer-events-none md:hidden absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-gray-950/95 to-transparent" />
            <div className="pointer-events-none md:hidden absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-gray-950/95 to-transparent" />
          </div>

          <div className="relative w-full md:max-w-xs shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search stack, logs, title..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-gray-950 border border-gray-900 hover:border-gray-800 focus:border-accent focus:ring-1 focus:ring-accent/20 text-base sm:text-sm text-gray-200 pl-10 pr-4 py-2 rounded-lg transition-all outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <ProjectCard key={`${project.title}-${project.category}`} project={project} onSelect={handleProjectSelect} />
            ))}
          </AnimatePresence>
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-14 bg-gray-950 rounded-xl border border-dashed border-gray-900 p-8">
            <ShieldAlert size={48} className="text-accent/40 mx-auto mb-4" />
            <h3 className="text-lg font-display font-semibold text-white">No Matching Systems Found</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
              We couldn't find any projects matching your parameters. Try searching for "EKS", "Terraform", "Argo CD", or "ELK".
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 bg-gray-900 border border-gray-800 hover:border-accent text-xs font-mono rounded-lg transition-colors text-white"
            >
              Reset Filters
            </button>
          </div>
        )}

        <AnimatePresence>
          {selectedProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md">
              <button
                type="button"
                aria-label="Close project drawer"
                className="absolute inset-0 cursor-pointer"
                onClick={() => setSelectedProject(null)}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative bg-gray-950 border border-gray-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh] z-10 themed-scrollbar"
              >
                <div className="bg-gradient-to-r from-accent/10 via-primary-violet/5 to-gray-950 p-6 sm:p-8 border-b border-gray-900 relative">
                  <button
                    type="button"
                    aria-label="Close project drawer"
                    onClick={() => setSelectedProject(null)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg bg-gray-900/50 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white transition-all cursor-pointer"
                  >
                    <X size={16} />
                  </button>

                  <span className="font-mono text-[10px] text-accent font-semibold uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded border border-accent/10 inline-block mb-3">
                    {selectedProject.category}
                  </span>

                  <h3 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight text-center md:text-left">
                    {selectedProject.title}
                  </h3>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-mono text-xs text-accent uppercase tracking-widest font-medium">
                      Overview
                    </h4>
                    <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                      {selectedProject.description}
                    </p>
                  </div>

                  {selectedProject.metrics && (
                    <div className="p-4 rounded-xl bg-accent/[0.02] border border-accent/10 orange-glow-sm flex items-start space-x-3.5">
                      <CheckCircle2 size={18} className="text-accent shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-display font-semibold text-white text-xs uppercase tracking-wider text-center md:text-left">
                          Key Operational Metric & SLA Impact
                        </h4>
                        <p className="text-sm text-gray-300 mt-1 font-sans">
                          {selectedProject.metrics}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedProject.architecture && (
                    <div className="space-y-3.5">
                      <h4 className="font-mono text-xs text-accent uppercase tracking-widest font-medium">
                        System Architecture Blueprint
                      </h4>

                      <div className="bg-gray-950 border border-gray-900/80 rounded-xl p-4 sm:p-5 terminal-grid">
                        <div className="flex flex-col space-y-3">
                          {selectedProject.architecture.map((node, idx) => (
                            <div key={idx} className="relative pl-7">
                              {idx < selectedProject.architecture!.length - 1 && (
                                <div className="absolute left-3 top-5 bottom-0 w-[1px] bg-dashed border-l border-accent/30" />
                              )}
                              <div className="absolute left-2 top-2 w-2 h-2 rounded-full bg-accent/40 border border-accent shadow-[0_0_8px_rgba(204,255,0,0.6)]" />

                              <div className="p-3 bg-gray-900/50 border border-gray-900/60 rounded-lg">
                                <span className="font-mono text-[10px] text-accent block mb-0.5">
                                  STAGE {idx + 1}
                                </span>
                                <span className="text-xs sm:text-sm text-gray-200">
                                  {node}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-mono text-xs text-accent uppercase tracking-widest font-medium">
                      Operational Stack
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProject.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="font-mono text-xs text-gray-300 bg-gray-900/80 border border-gray-800 px-2.5 py-1 rounded-lg"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-950 border-t border-gray-900/60 p-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-xs font-mono text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Close Blueprint
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
