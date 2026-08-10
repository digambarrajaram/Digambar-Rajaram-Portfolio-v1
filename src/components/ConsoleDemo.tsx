import React, { useState, useEffect, useRef } from "react";
import { Terminal, Play, Pause, RotateCcw, AlertTriangle, CheckCircle, Shield, Settings, Server, HeartPulse, Sparkles } from "lucide-react";

interface LogLine {
  text: string;
  type: "info" | "success" | "warn" | "error" | "ai" | "command";
}

interface Playbook {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  durationLabel: string;
  logs: LogLine[];
  dashboard: {
    status: "HEALTHY" | "DEGRADED" | "STANDBY" | "STABLE";
    uptime: string;
    vms: string;
    alerts: string;
    costImpact: string;
    metrics: { label: string; value: string }[];
  };
}

export default function ConsoleDemo() {
  const [activePlaybookId, setActivePlaybookId] = useState("drift-reconciler");
  const [isRunning, setIsRunning] = useState(false);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [visibleLogs, setVisibleLogs] = useState<LogLine[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const playbooks: Playbook[] = [
    {
      id: "drift-reconciler",
      name: "AWS Terraform Drift Reconciler",
      description: "Detect live infrastructure drift, classify it via an LLM agent, and gate the fix through a Trivy security scan.",
      icon: <AlertTriangle size={16} className="text-accent" />,
      durationLabel: "LangGraph Pipeline",
      logs: [
        { text: "$ python drift_reconciler/agent.py --tf-dir terraform_code/prod --account-label prod-a --region ap-south-1 --scan-unmanaged", type: "command" },
        { text: "[INF] Initializing LangGraph pipeline: unmanaged_scan → reconcile_agent → trivy_gate → drift_alert → drift_pr", type: "info" },
        { text: "[INF] Running boto3 enumeration across EC2, VPC, S3, DynamoDB, RDS, ElastiCache...", type: "info" },
        { text: "[OK]  Unmanaged scan complete. 2 untracked resources flagged (tagged-elsewhere: 1, genuinely unmanaged: 1).", type: "success" },
        { text: "[INF] Executing 'terraform plan -json' against live AWS state...", type: "info" },
        { text: "[WRN] Drift detected: aws_security_group.esign_sg — ingress CIDR widened from /24 to /0", type: "warn" },
        { text: "[AI]  Amazon Nova Pro (Bedrock) classifying drift: HIGH severity — inbound rule change bypasses least-privilege baseline.", type: "ai" },
        { text: "[AI]  Proposed HCL fix generated: restore cidr_blocks to 10.0.0.0/24, diff validated against Terraform state.", type: "ai" },
        { text: "[INF] Trivy baseline scan on current state... 0 pre-existing findings.", type: "info" },
        { text: "[INF] Applying proposed patch → re-scanning with Trivy...", type: "info" },
        { text: "[OK]  Trivy re-scan clean. No newly-introduced misconfigurations. Fix cleared for PR.", type: "success" },
        { text: "[INF] Cost-impact analyzer: no billable delta on security group correction.", type: "info" },
        { text: "[WRN] Severity HIGH → routing alert to PagerDuty (Slack suppressed per routing rules).", type: "warn" },
        { text: "[OK]  GitHub PR #142 opened: fix/esign_sg-drift-ap-south-1. Drift event appended to Supabase history.", type: "success" },
        { text: ">> Reconciliation pipeline closed. Awaiting human PR review before merge.", type: "success" }
      ],
      dashboard: {
        status: "DEGRADED",
        uptime: "N/A (Pre-Merge)",
        vms: "38 Resources",
        alerts: "1 High (PagerDuty)",
        costImpact: "$0.00 Delta",
        metrics: [
          { label: "Drift MTTD", value: "< 5 min" },
          { label: "Trivy Findings", value: "0 New" },
          { label: "PR Gate", value: "Awaiting Review" }
        ]
      }
    },
    {
      id: "eks-diagnostics",
      name: "Kubernetes AI Cost Copilot",
      description: "Diagnose resource anomalies and run cost delta audits via Bedrock MCP.",
      icon: <Sparkles size={16} className="text-accent" />,
      durationLabel: "SRE Diagnostic",
      logs: [
        { text: "$ mcp-copilot analyze --cluster=eks-prod-ap-south-01 --target=namespace-esign", type: "command" },
        { text: "[INF] Connecting to AWS EKS cluster via OIDC token exchange...", type: "info" },
        { text: "[OK]  EKS API authorization handshake completed. Identity verified: IRSA_Role_EKS_Reader", type: "success" },
        { text: "[INF] Executing Kubernetes pod scanning in namespace [esign]...", type: "info" },
        { text: "[WRN] Node 'ip-10-0-2-45.ap-south-1.compute.internal' experiencing 88% CPU contention", type: "warn" },
        { text: "[INF] Analyzing logs from CrashLoopBackOff pods via AWS Bedrock Nova engine...", type: "info" },
        { text: "[AI]  Analysis: 'esign-service-67fb9-xx' failing on DB connection timeout. Target host: 'rds-esign-aurora'", type: "ai" },
        { text: "[AI]  Remediation: EBS CSI StorageClass limits are stable. Secrets in SealedSecrets 'esign-db-cred' verified.", type: "ai" },
        { text: "[AI]  Cost Alert: AutoScaling node group 'mng-esign' running on m5.2xlarge ($0.38/hr). tfsec scans suggest t3.xlarge ($0.16/hr) matches current workload density profiles perfectly.", type: "ai" },
        { text: "[INF] Running Terraform cost-impact analyzer...", type: "info" },
        { text: "[OK]  Infracost simulation complete. Estimated Monthly Saving: -$164.20/node (62% savings).", type: "success" },
        { text: "[INF] Gating action. Human approval required to execute scale down script.", type: "info" },
        { text: ">> Diagnostic analysis pipeline successfully closed. System reports healthy posture.", type: "success" }
      ],
      dashboard: {
        status: "STABLE",
        uptime: "99.98%",
        vms: "40 Nodes",
        alerts: "0 Active",
        costImpact: "-$164.20 / mo",
        metrics: [
          { label: "SRE MTTD", value: "< 2 min" },
          { label: "Cost Saving", value: "62%" },
          { label: "Cluster Health", value: "Optimal" }
        ]
      }
    },
    {
      id: "gitops-sync",
      name: "ArgoCD GitOps Deployment",
      description: "Trigger declarative Kustomize overlays build and sync to AWS EKS.",
      icon: <Terminal size={16} className="text-accent" />,
      durationLabel: "Argo CD Pipeline",
      logs: [
        { text: "$ git push origin main && argocd app sync esign-app", type: "command" },
        { text: "[INF] Webhook intercepted by Jenkins CI server. Initializing stage pipeline...", type: "info" },
        { text: "[INF] Build stage 1: Compiling Maven artifacts...", type: "info" },
        { text: "[OK]  Maven compilation successful. 0 errors, 4 warnings.", type: "success" },
        { text: "[INF] Build stage 2: Executing Docker multi-stage container build...", type: "info" },
        { text: "[INF] STEP 1/6: FROM alpine-jdk17 AS build ... cache hit", type: "info" },
        { text: "[INF] STEP 6/6: COPY --from=build target/*.jar app.jar ... size: 84MB (Optimized)", type: "info" },
        { text: "[OK]  Docker image tagged: 123456789012.dkr.ecr.ap-south-1.amazonaws.com/esign:v2.1.4", type: "success" },
        { text: "[INF] Build stage 3: Pushing docker layers to Amazon ECR registry...", type: "info" },
        { text: "[OK]  ECR push complete. Digest: sha256:cf203a56...", type: "success" },
        { text: "[INF] Build stage 4: Triggering ArgoCD declarative controller sync...", type: "info" },
        { text: "[INF] ArgoCD Controller matching Git commit 8b1f5c to active cluster...", type: "info" },
        { text: "[INF] Applying Kustomize overlays configuration template for 'prod-ap-south-mng'...", type: "info" },
        { text: "[OK]  Deployment/esign-service synced (OutofSync -> Synced)", type: "success" },
        { text: "[OK]  Service/esign-ingress synced. AWS Load Balancer Controller routing updated.", type: "success" },
        { text: ">> Continuous Delivery loop completed. All target pods report healthy.", type: "success" }
      ],
      dashboard: {
        status: "HEALTHY",
        uptime: "100.0%",
        vms: "8 Pods",
        alerts: "0 Active",
        costImpact: "Net Neutral",
        metrics: [
          { label: "Image Size", value: "84 MB" },
          { label: "Sync Speed", value: "18 seconds" },
          { label: "Drift Control", value: "Enforced" }
        ]
      }
    },
    {
      id: "dr-failover",
      name: "Ansible DR Failover Loop",
      description: "Execute automated Commvault failover scripts, validating RPO/RTO targets.",
      icon: <Server size={16} className="text-accent" />,
      durationLabel: "Ansible Playbook",
      logs: [
        { text: "$ ansible-playbook -i inventory/prod playbooks/dr_failover.yml --extra-vars \"target=dr-site\"", type: "command" },
        { text: "[INF] Initializing Ansible core engine v2.15...", type: "info" },
        { text: "[INF] TASK [gather_facts] : Querying hypervisor inventory states...", type: "info" },
        { text: "[OK]  Gather facts complete. 120 hosts found responsive.", type: "success" },
        { text: "[INF] TASK [verify_commvault_sync] : Verifying Commvault 10+ PB cold replication delta...", type: "info" },
        { text: "[OK]  Data replication state matches exactly. Safe boundary established.", type: "success" },
        { text: "[INF] TASK [vmotion_trigger] : Orchestrating distributed resource vMotion failover...", type: "info" },
        { text: "[WRN] Host ESXi-42 reporting high memory reservation. Auto-adjusting DRS criteria...", type: "warn" },
        { text: "[OK]  DRS balanced cluster resources. Booting target virtual machines...", type: "success" },
        { text: "[INF] TASK [network_switchover] : Re-routing VPC route tables and DNS mappings...", type: "info" },
        { text: "[OK]  Route53 multi-AZ active records modified. Ingress points to backup gateway.", type: "success" },
        { text: "[INF] TASK [validate_services] : Running synthetic API check-gate on eKYC & eSign...", type: "info" },
        { text: "[OK]  Services responsive (HTTP 200 OK). Failover complete.", type: "success" },
        { text: ">> Playbook execution finished. Recovery complete. RTO target met inside 4 mins.", type: "success" }
      ],
      dashboard: {
        status: "STANDBY",
        uptime: "99.95%",
        vms: "1500+ VMs",
        alerts: "1 Resolved",
        costImpact: "Backup Active",
        metrics: [
          { label: "RTO Recovery", value: "3m 45s" },
          { label: "RPO Drift", value: "< 15 sec" },
          { label: "DR Efficiency", value: "+60% speed" }
        ]
      }
    },
    {
      id: "elk-log-aggregation",
      name: "ELK Log Aggregation & Alerting",
      description: "Stream heterogeneous logs through a Logstash pipeline and fire real-time anomaly alerts.",
      icon: <Settings size={16} className="text-accent" />,
      durationLabel: "Observability Pipeline",
      logs: [
        { text: "$ filebeat -e -c filebeat-nginx.yml --once", type: "command" },
        { text: "[INF] Filebeat agents shipping nginx, application, and syslog streams to Logstash pipeline...", type: "info" },
        { text: "[INF] Logstash applying multi-grok filters to normalize heterogeneous log formats...", type: "info" },
        { text: "[OK]  1.2M log events parsed and indexed into Elasticsearch (index: app-logs-2026.07.30)", type: "success" },
        { text: "[WRN] ElastAlert2 rule 'error_rate_spike' triggered: 5xx rate crossed 8% over a 5-min window", type: "warn" },
        { text: "[INF] Correlating spike against recent deployments via Kibana Discover query...", type: "info" },
        { text: "[OK]  Root cause isolated: 'esign-service-67fb9-xx' timing out on downstream 'rds-esign-aurora' pool.", type: "success" },
        { text: "[INF] Dispatching alert via Slack webhook + email notification channel...", type: "info" },
        { text: "[OK]  Alert acknowledged. MTTD: 3m 42s from first anomalous event to notification.", type: "success" },
        { text: "[INF] Applying ILM policy: rolling app-logs-2026.07.23 index to warm tier (30-day retention).", type: "info" },
        { text: "[OK]  X-Pack TLS verified on all data-node transport connections. Field-level RBAC intact.", type: "success" },
        { text: ">> Log pipeline healthy. All ElastAlert2 rules re-armed and monitoring resumed.", type: "success" }
      ],
      dashboard: {
        status: "HEALTHY",
        uptime: "99.97%",
        vms: "6 EC2 Nodes",
        alerts: "1 Resolved",
        costImpact: "Net Neutral",
        metrics: [
          { label: "MTTD", value: "3m 42s" },
          { label: "Events Indexed", value: "1.2M" },
          { label: "Index Health", value: "Green" }
        ]
      }
    },
    {
      id: "incident-manager",
      name: "AI-Driven DevOps Incident Manager",
      description: "Inject synthetic failures via GitHub Actions and auto-diagnose root cause from CloudWatch telemetry.",
      icon: <Shield size={16} className="text-accent" />,
      durationLabel: "Automated Incident Response",
      logs: [
        { text: "$ gh workflow run failure-injection.yml -f target=dev -f fault=latency_500ms", type: "command" },
        { text: "[INF] GitHub Actions injecting controlled latency fault into 'dev' deployment stage...", type: "info" },
        { text: "[WRN] CloudWatch alarm 'ApiLatencyP99High' breached threshold: 512ms (baseline: 90ms)", type: "warn" },
        { text: "[INF] Diagnostic Engine aggregating CloudWatch metrics, recent deployments, and change events...", type: "info" },
        { text: "[AI]  Correlated latency spike to deploy 'esign-api@v2.1.5' merged 6 minutes prior.", type: "ai" },
        { text: "[AI]  Root cause: connection pool size reduced from 50 → 10 in the last config change (unintended regression).", type: "ai" },
        { text: "[INF] Cross-referencing GitHub commit history for the offending PR...", type: "info" },
        { text: "[OK]  Suggested fix: revert 'db_pool_size' to 50 in terraform_code/rds_config.tf. PR opened for review.", type: "success" },
        { text: "[INF] Running synthetic API check-gate to confirm fault reproduction...", type: "info" },
        { text: "[OK]  Fault reproduced and isolated in under 2 minutes from injection to diagnosis.", type: "success" },
        { text: "[INF] Rolling back synthetic fault injection, restoring dev stage to baseline...", type: "info" },
        { text: "[OK]  ApiLatencyP99 back to 88ms. Alarm auto-resolved.", type: "success" },
        { text: ">> Incident closed. Diagnosis + fix PR delivered in 1m 58s (target: < 2 min).", type: "success" }
      ],
      dashboard: {
        status: "STABLE",
        uptime: "99.99%",
        vms: "Dev Stage",
        alerts: "0 Active",
        costImpact: "N/A",
        metrics: [
          { label: "Diagnosis Time", value: "1m 58s" },
          { label: "Root Cause", value: "High-Fidelity" },
          { label: "Auto-PR", value: "Opened" }
        ]
      }
    }
  ];

  const currentPlaybook = playbooks.find((p) => p.id === activePlaybookId) || playbooks[0];

  useEffect(() => {
    setVisibleLogs([]);
    setCurrentLogIndex(0);
    setIsRunning(false);
    setIsCompleted(false);
  }, [activePlaybookId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && currentLogIndex < currentPlaybook.logs.length) {
      timer = setTimeout(() => {
        setVisibleLogs((prev) => [...prev, currentPlaybook.logs[currentLogIndex]]);
        setCurrentLogIndex((prev) => prev + 1);
      }, 400 + Math.random() * 400); // Realistic typing delay variation
    } else if (currentLogIndex >= currentPlaybook.logs.length && isRunning) {
      setIsRunning(false);
      setIsCompleted(true);
    }
    return () => clearTimeout(timer);
  }, [isRunning, currentLogIndex, currentPlaybook]);

  useEffect(() => {
    if (visibleLogs.length === 0) return;
    terminalContainerRef.current?.scrollTo({
      top: terminalContainerRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [visibleLogs]);

  const handleStart = () => {
    if (isCompleted) {
      setVisibleLogs([]);
      setCurrentLogIndex(0);
      setIsCompleted(false);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setVisibleLogs([]);
    setCurrentLogIndex(0);
    setIsCompleted(false);
  };

  return (
    <section id="console" className="py-12 md:py-24 bg-gray-950 border-t border-gray-900/40 relative z-0 scroll-mt-20">
      <div className="absolute top-1/4 right-1/2 translate-x-1/3 w-[300px] h-[300px] bg-primary-violet/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="mb-12 max-w-3xl mx-auto text-center md:text-left">
          <span className="font-mono text-xs text-accent tracking-widest uppercase font-medium">
            SRE Sandbox Interface
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mt-2 tracking-tight">
            Interactive DevOps Console
          </h2>
          <p className="text-gray-400 mt-2 text-sm sm:text-base">
            Select one of the simulated infrastructure playbooks below and execute it to watch a live representation of real systems engineering actions.
          </p>
        </div>

        {/* Sandbox Core Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left panel: Playbook Selectors */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1 -mr-1 themed-scrollbar hide-scrollbar">
              <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block font-bold">
                Available Playbooks
              </span>

              {playbooks.map((playbook) => (
                <button
                  key={playbook.id}
                  onClick={() => {
                    if (!isRunning) {
                      setActivePlaybookId(playbook.id);
                    }
                  }}
                  disabled={isRunning}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                    activePlaybookId === playbook.id
                      ? "bg-accent/[0.03] border-accent/30 shadow-[0_0_15px_rgba(204,255,0,0.05)]"
                      : "bg-gray-950 border-gray-900/80 hover:border-gray-800 hover:bg-gray-900/20"
                  } ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      activePlaybookId === playbook.id ? "bg-accent/10" : "bg-gray-900"
                    }`}>
                      {playbook.icon}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-white text-center md:text-left">
                        {playbook.name}
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-tight">
                        {playbook.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center w-full pt-3 mt-3 border-t border-gray-900/60 font-mono text-[10px] text-gray-500">
                    <span>Task Domain:</span>
                    <span className="text-accent font-medium">{playbook.durationLabel}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Simulated hardware state footer */}
            <div className="p-4 rounded-xl bg-gray-950 border border-gray-900 flex items-center justify-between font-mono text-[10px]">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                <span className="text-gray-400">Sandbox Pod: ONLINE</span>
              </div>
              <span className="text-gray-600">v4.0.1 (node18)</span>
            </div>
          </div>

          {/* Right panel: Terminal Terminal Output */}
          <div className="lg:col-span-8 flex flex-col bg-[#05070c] border border-gray-900/80 rounded-2xl overflow-hidden shadow-2xl relative min-h-[420px] max-h-[550px] scanline">
            {/* Terminal Header */}
            <div className="bg-[#0b0e17] px-4 py-3 border-b border-gray-900/80 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/10" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-500/10" />
                <span className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/10" />
                <span className="font-mono text-[10px] text-gray-400 ml-2 tracking-wider">
                  mcp_sre_console@{activePlaybookId}.io
                </span>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center space-x-2">
                {!isRunning ? (
                  <button
                    onClick={handleStart}
                    className="px-2.5 py-1 bg-accent hover:bg-accent-hover text-gray-950 font-mono text-[10px] font-bold rounded flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <Play size={10} fill="currentColor" />
                    <span>RUN PLAYBOOK</span>
                  </button>
                ) : (
                  <button
                    onClick={handlePause}
                    className="px-2.5 py-1 bg-yellow-600 hover:bg-yellow-500 text-gray-950 font-mono text-[10px] font-bold rounded flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <Pause size={10} fill="currentColor" />
                    <span>PAUSE</span>
                  </button>
                )}

                <button
                  onClick={handleReset}
                  className="p-1 hover:bg-gray-900 border border-transparent hover:border-gray-800 text-gray-400 hover:text-white rounded transition-colors cursor-pointer"
                  title="Clear Console"
                >
                  <RotateCcw size={12} />
                </button>
              </div>
            </div>

            {/* Terminal Log Screen */}
            <div ref={terminalContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-5 font-mono text-[11px] sm:text-xs space-y-2 select-text leading-relaxed themed-scrollbar">
              {visibleLogs.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-600 select-none py-12">
                  <Terminal size={36} className="text-gray-800 mb-2 animate-pulse" />
                  <p className="font-bold text-gray-500">Console Ready & Awaiting Execution</p>
                  <p className="text-[10px] text-gray-600 mt-1 max-w-xs">
                    Choose a playbook from the left and click 'RUN PLAYBOOK' to start streaming infrastructure telemetry.
                  </p>
                </div>
              )}

              {visibleLogs.map((log, index) => {
                let colorClass = "text-gray-300";
                if (log.type === "command") colorClass = "text-accent font-semibold";
                else if (log.type === "success") colorClass = "text-green-400";
                else if (log.type === "warn") colorClass = "text-amber-500";
                else if (log.type === "error") colorClass = "text-red-500";
                else if (log.type === "ai") colorClass = "text-accent/90 font-medium pl-4 border-l border-accent/20";

                return (
                  <div key={index} className={colorClass}>
                    {log.text}
                  </div>
                );
              })}

              {/* Typing cursor loader */}
              {isRunning && (
                <div className="flex items-center space-x-1.5 text-accent">
                  <span className="w-1.5 h-3.5 bg-accent animate-pulse" />
                  <span className="text-[10px] text-gray-600 tracking-wider">COMPILING TELEMETRY...</span>
                </div>
              )}

              <div ref={terminalEndRef} />
            </div>

            {/* Dashboard summary footer block (Appears once playbook runs) */}
            <div className={`border-t border-gray-900/80 bg-[#060911] transition-all duration-500 p-4 shrink-0 select-none ${
              isCompleted ? "opacity-100 max-h-[160px]" : "opacity-0 max-h-0 py-0 border-t-0 pointer-events-none overflow-hidden"
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Visual state indicator */}
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    currentPlaybook.dashboard.status === "HEALTHY" || currentPlaybook.dashboard.status === "STABLE"
                      ? "bg-green-500/10 text-green-400"
                      : "bg-yellow-500/10 text-yellow-400"
                  }`}>
                    <HeartPulse size={18} className="animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 block uppercase font-mono">POST-RUN STATUS</span>
                    <span className="font-display font-extrabold text-sm text-white tracking-wider">
                      {currentPlaybook.dashboard.status}
                    </span>
                  </div>
                </div>

                {/* Grid metrics */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-1 max-w-md">
                  {currentPlaybook.dashboard.metrics.map((metric) => (
                    <div key={metric.label} className="p-2 bg-gray-950 border border-gray-900 rounded-lg text-center font-mono">
                      <span className="block text-[8px] text-gray-500 uppercase tracking-widest">{metric.label}</span>
                      <span className="block text-xs text-accent font-bold mt-0.5">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}