import React, { useState } from "react";
import { Briefcase, MapPin, Calendar, Server, Award, ChevronDown, ChevronUp, Database, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { experience } from "../data";

export default function Experience() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  // Grouped domain tabs for his responsibilities to make them incredibly scannable
  const responsibilitiesGroups = [
    {
      title: "CI/CD & GitOps Pipeline",
      bullets: [
        "Built and maintained Jenkins CI/CD pipelines across VMware on-prem and AWS EKS environments, creating isolated pipeline triggers, validation stages, Slack alerts, and automated rollbacks.",
        "Architected end-to-end GitOps deployment pipelines: GitHub webhook → Maven compile → Docker multi-stage build → ECR registry → Helm deployment → Argo CD synchronization with Kustomize configuration overrides.",
        "Authored modular, version-controlled Terraform templates for AWS (VPC, IAM, ALB, EKS) and VMware vSphere datacenter infrastructure, leveraging S3 and DynamoDB state locking."
      ]
    },
    {
      title: "Kubernetes & AWS Infrastructure",
      bullets: [
        "Provisioned and managed production AWS EKS clusters (20–40 nodes), enforcing Kubernetes RBAC for least-privilege control, Pod Security Admission parameters, and EBS CSI dynamic storage volumes.",
        "Configured Kubernetes Network Policies under VPC CNI for microservice segmentation, along with AWS Load Balancer Ingress Controller and IRSA (IAM Roles for Service Accounts) integration.",
        "Hardened microservice environments via Sealed Secrets for secure Git-based secrets, while optimizing Docker layers to construct highly defensive, lean images."
      ]
    },
    {
      title: "Observability, Virtualization & DR",
      bullets: [
        "Deployed Kubernetes-native monitoring: Prometheus with kube-state-metrics and metrics-server, alongside multi-system ELK logging dashboards and Grafana metrics visualization.",
        "Automated VM provisioning and patching compliance across 1500+ hybrid Linux/Windows servers via Ansible playbooks, ensuring perfect drift-free configuration controls.",
        "Sustained 99.9%+ service SLA uptime across high-demand national platforms; managed and validated disaster recovery protocols across a massive 10+ PB backup infrastructure backed by Commvault."
      ]
    },
    {
      title: "Team Leadership & Operations",
      bullets: [
        "Led operations for a 6-member infrastructure and site reliability team, acting as primary incident commander for critical escalation tickets, and coordinating structured ITIL Change Advisory Board checklist operations."
      ]
    }
  ];

  return (
    <section id="experience" className="py-4 md:py-10 bg-gray-950 border-t border-gray-900/40 relative z-0 scroll-mt-20">
      {/* Visual background lights */}
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="mb-12 text-center md:text-left max-w-3xl mx-auto">
          <span className="font-mono text-xs text-accent tracking-widest uppercase font-medium">
            Professional History
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mt-2 tracking-tight">
            Work Experience
          </h2>
          <div className="h-1 w-12 bg-accent mx-auto md:mx-0 mt-4 rounded-full" />
        </div>

        {/* Timeline container */}
        <div className="relative border-l-0 md:border-l border-gray-900 ml-0 md:ml-8 md:grid md:grid-cols-12 gap-8 pb-4">
          {experience.map((exp, idx) => (
            <React.Fragment key={exp.company}>
              {/* Left column info (Title, date, company details) */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="col-span-4 pl-0 md:pl-0 mb-6 md:mb-0"
              >
                <span className="font-mono text-xs text-accent font-semibold uppercase tracking-wide block mb-1 text-center md:text-left">
                  {exp.duration}
                </span>

                <h3 className="text-xl font-display font-bold text-white tracking-tight leading-tight text-center md:text-left">
                  {exp.role}
                </h3>

                <p className="text-sm font-sans text-gray-300 mt-1 flex items-center gap-1.5 justify-center md:justify-start">
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase size={14} className="text-gray-500 shrink-0" />
                    <span className="font-medium">{exp.company}</span>
                  </span>
                </p>

                <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5 justify-center md:justify-start">
                  <MapPin size={12} className="text-gray-600" />
                  <span>{exp.location}</span>
                </p>

                {/* Scope Highlight box */}
                <div className="mt-4 p-4 rounded-xl bg-accent/[0.01] border border-accent/5 orange-glow-sm text-center md:text-left">
                  <span className="font-mono text-[9px] text-accent font-bold uppercase tracking-wider block mb-1">
                    Platform Scale
                  </span>
                  <p className="text-xs text-gray-400 leading-normal font-sans">
                    {exp.domain}
                  </p>
                </div>
              </motion.div>

              {/* Right column (Achievements and domain breakdown tabs) */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="col-span-8 pl-0 md:pl-4 space-y-6"
              >
                {/* Promo Spotlight banner */}
                <div className="p-4 rounded-xl bg-accent/5 border border-accent/10 orange-text-glow flex items-center space-x-3 text-center md:text-left">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <Award size={18} />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-white leading-tight text-center md:text-left">
                      Promoted within 6 months
                    </h4>
                    <p className="text-xs text-accent/90 font-sans mt-0.5">
                      Elevated to Assistant Manager based on operational excellence and system stabilization leadership.
                    </p>
                  </div>
                </div>

                {/* Key Achievements Checklist */}
                <div className="space-y-3.5">
                  <h4 className="font-mono text-xs text-gray-400 uppercase tracking-widest font-semibold text-center md:text-left">
                    Key Achievements
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {exp.achievements.map((ach, aIdx) => (
                      <div key={aIdx} className="p-4 rounded-xl bg-gray-950 border border-gray-900/80 hover:border-accent/20 shadow-sm flex flex-col justify-between group transition-all text-center md:text-left">
                        <p className="text-xs text-gray-300 leading-relaxed font-sans">
                          {ach}
                        </p>
                        <span className="font-mono text-[10px] text-accent/80 font-bold tracking-wider mt-4 block">
                          MILESTONE {aIdx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grouped Responsibilities */}
                <div className="space-y-4">
                  <h4 className="font-mono text-xs text-gray-400 uppercase tracking-widest font-semibold text-center md:text-left">
                    Operational Scope & Domains
                  </h4>

                  <div className="space-y-3">
                    {responsibilitiesGroups.map((group, gIdx) => (
                      <div
                        key={group.title}
                        className="glass-panel rounded-xl border border-gray-900/60 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleExpand(gIdx)}
                          className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors cursor-pointer text-center md:text-left"
                        >
                          <span className="font-display font-bold text-sm text-white flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(204,255,0,0.6)]" />
                            <span>{group.title}</span>
                          </span>
                          {expandedIndex === gIdx ? (
                            <ChevronUp size={16} className="text-gray-500" />
                          ) : (
                            <ChevronDown size={16} className="text-gray-500" />
                          )}
                        </button>

                        <AnimatePresence>
                          {expandedIndex === gIdx && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25 }}
                            >
                              <div className="px-5 pb-5 pt-1 border-t border-gray-900/40 bg-gray-950/40 space-y-3">
                                {group.bullets.map((bullet, bIdx) => (
                                  <div key={bIdx} className="flex items-start space-x-2.5">
                                    <CheckCircle size={12} className="text-accent mt-1 shrink-0" />
                                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-sans">
                                      {bullet}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
