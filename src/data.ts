import { Project, ExperienceItem, Certification, PersonalInfo, SocialLinks, AboutData, Stats } from "./types";

export const personalInfo: PersonalInfo = {
  name: "Digambar Rajaram",
  title: "AI Platform & Cloud Infrastructure Engineer",
  location: "India (Remote / Open to Relocation)",
  phone: "+91-7353570952",
  email: "digambarrajaram2@gmail.com",
};

export const socialLinks: SocialLinks = {
  linkedin: "http://www.linkedin.com/in/digambarrajaram",
  github: "https://github.com/digambarrajaram",
  twitter: "https://twitter.com/digambarrajaram",
};

export const siteConfig = {
  siteUrl: "https://digambarrajaram.cloud",
  profileImage: "/Digambar_Photo.png", // Will handle backup placeholder gracefully
};

export const about: AboutData = {
  headline:
    "Engineering High-Availability Infrastructure, Resilient Cloud Platforms, and Orchestrating Agentic AI Systems at Scale",
  intro: [
    "I am an AI Platform & Cloud Infrastructure Engineer with 2+ years of production experience at Protean eGov Technologies (formerly NSDL eGov), building automated CI/CD pipelines, managing highly scalable AWS workloads, and running enterprise VMware platforms for government-grade systems serving 300M+ citizens.",
    "Driven by reliability and high-efficiency automation, I specialize in provisioning production-grade AWS EKS clusters using Terraform, operating GitOps pipelines via Argo CD, and implementing unified observability stacks (ELK, Prometheus, Grafana) that sustain 99.9%+ SLA uptime.",
    "Currently, I am actively pioneering the integration of Generative AI and Agentic AI into operations (PromptOps). I design multi-agent orchestration frameworks (LangGraph), build custom Model Context Protocol (MCP) servers, and automate complex cloud operations to bridge the gap between infrastructure stability and AI capabilities."
  ],
  expertise: [
    "Agentic AI Architecture — LangGraph, LangChain, MCP (Model Context Protocol), Tool-Calling, and Safety Guardrails",
    "Kubernetes & GitOps (EKS, Argo CD, Helm, Kustomize) — RBAC, VPC CNI Network Policies, EBS CSI Storage",
    "Infrastructure as Code & Automation — Terraform, Ansible, Jenkins Pipelines, and GitHub Actions",
    "Observability & Reliability — Prometheus, Grafana, ELK Stack (Logstash, Filebeat), and ElastAlert2"
  ],
  approach: [
    "Security-First Mindset — Enforcing least-privilege IAM, OS hardening, Pod security admissions, and X-Pack TLS",
    "End-to-End Ownership — Managing every stage from design to deployment, infrastructure, and performance monitoring",
    "Auditable & Resilient Systems — Engineering stable, compliant, and highly redundant systems that withstand massive real-world loads"
  ]
};

export const technologies = [
  "AWS",
  "Terraform",
  "Kubernetes",
  "Docker",
  "GitHub Actions",
  "Jenkins",
  "Ansible",
  "Argo CD",
  "Helm",
  "ELK Stack",
  "Prometheus",
  "Grafana",
  "Python",
  "Shell Scripting",
  "VMware vSphere",
  "Linux",
  "Windows Server",
  "Commvault",
  "N8N",
  "LangGraph",
  "LangChain",
  "AWS Bedrock",
  "FastAPI",
  "Supabase",
  "Trivy"
];

export const skills = {
  agenticAi: [
    "LangGraph (Multi-agent orchestration)",
    "LangChain (Chains & Agents)",
    "MCP (Model Context Protocol)",
    "LLM Tool-Calling & Function Calling",
    "RAG Pipelines (Vector Search & Embeddings)",
    "AWS Bedrock (Claude, Nova)",
    "Agent Evaluation & Approval Gates",
    "Safety Guardrails & PII Redaction",
    "Workflow automation with N8N"
  ],
  cloudDevOps: [
    "AWS (EC2, S3, IAM, VPC, Lambda, API Gateway, EKS, CloudWatch, ALB/NLB, Route 53, CloudFront, ECR, KMS)",
    "Terraform (modules, remote state, S3 + DynamoDB locking)",
    "Docker (multi-stage builds) & Containerization",
    "Kubernetes (EKS)",
    "Argo CD (GitOps)",
    "Helm Charts & Kustomize",
    "Jenkins CI/CD",
    "GitHub Actions (OIDC)",
    "Ansible Playbooks"
  ],
  kubernetesAndSecurity: [
    "RBAC (Roles, ClusterRoles, RoleBindings)",
    "Pod Security Admission",
    "Network Policies (VPC CNI)",
    "PersistentVolumeClaims & StorageClasses",
    "EBS CSI Driver",
    "IRSA / OIDC Integration",
    "AWS Load Balancer Controller",
    "Sealed Secrets",
    "IMDSv2 & KMS Encryption"
  ],
  infrastructureVirtualization: [
    "VMware vSphere (ESXi & vCenter)",
    "High Availability (HA) & DRS",
    "vMotion & vRealize Operations (vROps)",
    "Capacity Planning & Performance Tuning",
    "Commvault Enterprise Backup (10+ PB)",
    "Disaster Recovery (DR) Automation",
    "RPO/RTO Validation"
  ],
  monitoringAutomation: [
    "ELK Stack (Elasticsearch, Logstash, Kibana)",
    "Filebeat, Metricbeat, ElastAlert2",
    "Prometheus & kube-state-metrics",
    "Grafana Dashboard Visuals",
    "Amazon CloudWatch Logs & Metrics",
    "Python & Shell Scripting (Bash)",
    "OS Hardening (Linux & Windows Server)"
  ],
  networking: [
    "TCP/IP, DNS, DHCP Protocols",
    "AWS VPC, Security Groups, NACLs",
    "Kubernetes VPC CNI",
    "Nginx Ingress & ALB Controllers"
  ]
};

export const experience: ExperienceItem[] = [
  {
    company: "Protean eGov Technologies Ltd (formerly NSDL eGov Infrastructure Ltd)",
    location: "Mumbai, Maharashtra, India",
    role: "Assistant Manager – DevOps & Cloud Infrastructure Engineer",
    duration: "Mar 2023 – Jun 2025",
    domain: "India's largest government platforms (NPS, PAN, TIN, CRA, eSign) — 300M+ users",
    responsibilities: [
      "Built and maintained Jenkins CI/CD pipelines across VMware on-prem and AWS EKS environments, creating isolated pipeline triggers, validation stages, Slack alerts, and automated rollbacks.",
      "Architected end-to-end GitOps deployment pipelines: GitHub webhook → Maven compile → Docker multi-stage build → ECR registry → Helm deployment → Argo CD synchronization with Kustomize configuration overrides.",
      "Authored modular, version-controlled Terraform templates for AWS (VPC, IAM, ALB, EKS) and VMware vSphere datacenter infrastructure, leveraging S3 and DynamoDB state locking.",
      "Provisioned and managed production AWS EKS clusters (20–40 nodes), enforcing Kubernetes RBAC for least-privilege control, Pod Security Admission parameters, and EBS CSI dynamic storage volumes.",
      "Configured Kubernetes Network Policies under VPC CNI for microservice segmentation, along with AWS Load Balancer Ingress Controller and IRSA (IAM Roles for Service Accounts) integration.",
      "Hardened microservice environments via Sealed Secrets for secure Git-based secrets, while optimizing Docker layers to construct highly defensive, lean images.",
      "Deployed Kubernetes-native monitoring: Prometheus with kube-state-metrics and metrics-server, alongside multi-system ELK logging dashboards and Grafana metrics visualization.",
      "Automated VM provisioning and patching compliance across 1500+ hybrid Linux/Windows servers via Ansible playbooks, ensuring perfect drift-free configuration controls.",
      "Sustained 99.9%+ service SLA uptime across high-demand national platforms; managed and validated disaster recovery protocols across a massive 10+ PB backup infrastructure backed by Commvault.",
      "Led operations for a 6-member infrastructure and site reliability team, acting as primary incident commander for critical escalation tickets, and coordinating structured ITIL Change Advisory Board checklist operations."
    ],
    achievements: [
      "Promoted to Assistant Manager within 6 months based on technical mastery and operational leadership.",
      "Designed and implemented the core GitOps EKS continuous delivery architecture adopted across all production environments.",
      "Cut VMware disaster recovery failover drill time by 60% through custom Ansible-driven DR automation playbooks."
    ]
  }
];

export const projects: Project[] = [
    {
    title: "AWS Terraform Drift Reconciler",
    category: "AI & Agentic DevOps",
    description:
      "An automated drift-detection and remediation pipeline that compares Terraform desired state against live AWS resources, classifies drift via an LLM agent, proposes HCL fixes, and opens GitHub PRs for review — with Trivy security scanning, cost estimation, unmanaged-resource detection, rollback, and multi-account/multi-region support.",
    technologies: ["LangGraph", "AWS Bedrock (Nova Pro)", "Terraform", "Trivy", "GitHub Actions", "Supabase", "PagerDuty", "Python"],
    metrics: "5-node LangGraph pipeline with a Trivy security gate and Supabase-backed dashboard across multi-account AWS environments.",
    architecture: [
      "Reconcile Agent: Amazon Nova Pro (via Bedrock) classifies drift from terraform plan output and proposes HCL fixes.",
      "Trivy Security Gate: baseline scan → patch → re-scan loop distinguishing pre-existing vs newly-introduced issues.",
      "Alerting & Dashboard: severity-routed PagerDuty/Slack alerts, cost-aware findings, rollback with a freshness gate, and a Supabase-backed dashboard for scans, findings, and trends."
    ]
  },
  {
    title: "Kubernetes & Cloud Cost Copilot",
    category: "AI & Agentic DevOps",
    description:
      "A sophisticated multi-agent SRE system designed to diagnose live Kubernetes cluster incidents and review Terraform IaC plans for cost anomalies and security exposure. Orchestrated using LangGraph for structured agent state machines and AWS Bedrock (Claude/Nova) for high-reasoning execution.",
    technologies: ["LangGraph", "AWS Bedrock", "Python MCP SDK", "Kubernetes", "Terraform", "tfsec", "Infracost", "GitHub Actions"],
    metrics: "Automated cost delta analysis and incident diagnostics with full human-in-the-loop validation.",
    architecture: [
      "Supervisor Agent: Routes intent dynamically to sub-agents and manages security-approval thresholds.",
      "EKS MCP Server: Custom Python server exposing real-time pod metrics, logs, and events directly to the LLM.",
      "Security & Cost MCP Server: Integrates tfsec, checkov, and Infracost to generate cost and risk logs."
    ]
  },
  {
    title: "ShopAssist — AI Shopping Assistant",
    category: "AI & Agentic DevOps",
    description:
      "A production-grade retail conversational AI. Features advanced function-calling, dynamic intent mapping, and multi-tier guardrails. Persists conversational context safely with automated session lifecycle management.",
    technologies: ["LangChain", "AWS Bedrock", "FastAPI", "React", "Supabase", "TailwindCSS"],
    metrics: "Enforces a 5-layer guardrail stack mapping PII redaction, prompt injection detection, and argument validation.",
    architecture: [
      "Guardrail Stack: Validates inputs for injection, redacts PII, checks tool arguments, and intercepts leakage.",
      "Persistence: Structured Supabase storage maintaining session state with a custom TTL policy."
    ]
  },
  {
    title: "ELK Centralized Log Aggregation",
    category: "Observability & Monitoring",
    description:
      "A comprehensive logging and alerting platform running on clustered AWS infrastructure. Implemented advanced Logstash parsing pipelines to structure heterogeneous Nginx, application, and system logs, completed with active anomaly alerts.",
    technologies: ["Elasticsearch", "Logstash", "Kibana", "Filebeat", "ElastAlert2", "AWS EC2", "Terraform", "Docker Compose"],
    metrics: "Reduced Mean Time to Detection (MTTD) to sub-5-minutes with real-time Slack and email notifications.",
    architecture: [
      "Ingestion Tier: Distributed Filebeat agents parsing logs locally and streaming to a central pipeline.",
      "Logstash Pipeline: Multi-grok filters parsing and indexing metrics systematically.",
      "Security Controls: Fully encrypted indices with X-Pack TLS, precise field-level RBAC, and automated ILM policies."
    ]
  },
  {
    title: "EKS GitOps Production Architecture",
    category: "Kubernetes & IaC",
    description:
      "A highly redundant, production-ready AWS EKS cluster deployment. Provisioned multi-AZ VPC, Auto-Scaling node groups, and secure ingress structures, all synchronized continuously with a GitOps control repository.",
    technologies: ["AWS", "EKS", "Terraform", "Kubernetes", "Helm", "Argo CD", "Kustomize", "IRSA"],
    metrics: "Maintains 100% declarative infrastructure, eliminating configuration drift and manual interventions.",
    architecture: [
      "IaC Automation: Terraform blueprints with S3 remote state and DynamoDB distributed locks.",
      "GitOps Pipeline: Argo CD controllers continuously matching live cluster state to target repository changes.",
      "Workload Security: Strict RBAC profiles, Pod security admissions, and namespace-level network policies."
    ]
  },
  {
    title: "NutriBlood AI — Blood Report Analyser",
    category: "AI & Agentic DevOps",
    description:
      "An intelligent health assistant that extracts key biomarkers from blood report documents or images via vision LLMs, categorizes values into high/low/normal tiers, and outputs personalized health advice.",
    technologies: ["Groq API", "FastAPI", "Python", "React", "Jinja2", "Vercel"],
    metrics: "Provides instant tabular biomarker diagnostics paired with precise Indian dietetic planning advice.",
    architecture: [
      "Vision Pipeline: High-speed Groq inference extracting tabular data from PDF/images.",
      "Categorization Engine: Translates clinical text into structured, color-coded health ranges."
    ]
  },
  {
    title: "Enterprise DevOps CI/CD Pipeline",
    category: "DevOps Automation",
    description:
      "An automated, secure CI/CD orchestration setup for Java Enterprise microservices. Handles compile-time testing, artifact storage, and zero-downtime blue-green deployment to production nodes.",
    technologies: ["Jenkins", "Docker", "Ansible", "AWS EC2", "Maven", "SonarQube"],
    metrics: "Accelerated release velocity by 4x, securing code reviews and container scanning steps in-line.",
    architecture: [
      "Jenkinsfile: Staged declarative pipeline wrapping code static analysis and unit test targets.",
      "Ansible Deployment: Automated target rolling updates, performing clean health check gates before routing."
    ]
  },
  {
    title: "AI-Driven DevOps Incident Manager",
    category: "AI & Agentic DevOps",
    description:
      "An automated SRE supervisor system that monitors CloudWatch alerts and deployment telemetry, diagnosing system degradation root causes via automated telemetry investigation and failure injection testing.",
    technologies: ["AWS", "Terraform", "CloudWatch", "GitHub Actions", "OIDC"],
    metrics: "Achieved automated diagnostics within 2 minutes of synthetic failure injection events.",
    architecture: [
      "Failure Simulator: GitHub Actions injecting controlled latency and error configurations into dev stages.",
      "Diagnostic Engine: Aggregates metrics, checks recent deployments, and outlines high-fidelity solutions."
    ]
  },
  {
    title: "MenuMind AI — Restaurant Identity Studio",
    category: "AI & Agentic DevOps",
    description:
      "A generative branding tool that creates restaurant names, brand concepts, and curated menus through a LangChain + Groq pipeline, with structured JSON output parsing and dynamic Streamlit card rendering.",
    technologies: ["LangChain", "Groq API", "Streamlit", "Python"],
    metrics: "Deployed live on Render with structured-JSON brand and menu generation.",
    architecture: [
      "Generation Pipeline: LangChain + Groq producing structured JSON for names, brand identity, and menu items.",
      "Rendering Layer: Streamlit dynamically renders generated content as interactive brand cards."
    ]
  },
  {
    title: "Infrastructure Asset Platform",
    category: "Internal Automation Tool",
    description:
      "A secure internal inventory ledger built to replace manual spreadsheets tracking 1500+ heterogeneous servers, hardware assets, licenses, and security patch states, significantly optimizing audit posture.",
    technologies: ["Spring Boot", "ReactJS", "MySQL", "Docker"],
    metrics: "Cut infrastructure compliance and audit preparation times by ~50%.",
    architecture: [
      "Asset Ledger: Central relational DB tracking lifecycle states, hardware serials, and IP mappings.",
      "Compliance Checker: Automated scripts checking host responsiveness and patch alignment."
    ]
  }
];

export const certifications: Certification[] = [
  {
    name: "Advanced Cloud Computing & DevOps",
    provider: "Learnbay, in collaboration with Microsoft",
    completedDate: "May 2026"
  },
  {
    name: "AI Engineer MLOps Track – Deploy GenAI & Agentic AI at Scale",
    provider: "Udemy"
  },
  {
    name: "Complete VMware vSphere ESXi and vCenter Administration",
    provider: "Udemy"
  },
  {
    name: "Java Full Stack Development",
    provider: "TalentSprint / Q-J Spiders"
  }
];

export const stats: Stats = {
  experienceYears: 2.4,
  projects: 10,
  certifications: 4,
  vmsManaged: "1500+",
  esxiHosts: "100+",
  backupStorage: "10+ PB",
  uptime: "99.9%+",
  usersServed: "300M+"
};