import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  X,
  Send,
  Terminal,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  User,
  Cpu,
  AlertTriangle
} from "lucide-react";
import Markdown from "react-markdown";
import { useScrollLock } from "../hooks/useScrollLock";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

const SUGGESTIONS = [
  "Describe the architecture and automation workflow of the AWS Terraform Drift Reconciler project",
  "How does the multi-agent cost optimization system work?",
  "What were Digambar's SRE responsibilities at Protean eGov Technologies?",
  "What certifications and experience does Digambar have in GenAI and MLOps?"
];

const MAX_INPUT_LENGTH = 2000;

export default function SREChatWindow() {
  const [isOpen, setIsOpen] = useState(false);
  const [isContactVisible, setIsContactVisible] = useState(false);

  useScrollLock(isOpen);

  useEffect(() => {
    const contactEl = document.getElementById("contact");
    if (!contactEl || !(window as any).IntersectionObserver) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((entry) => setIsContactVisible(entry.isIntersecting)),
      { root: null, threshold: 0.05 }
    );
    io.observe(contactEl);
    return () => io.disconnect();
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi — I'm SRE-Copilot. Ask me about Digambar's Kubernetes, AWS, or automation background.\n\nTry: 'Show GitOps architecture', 'Explain an incident response playbook', or 'What projects used LangGraph?'"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isFirstRender = useRef(true);

  // Scrolls only the message pane's own scrollbar, never the page.
  const scrollToBottom = () => {
    messagesContainerRef.current?.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: "smooth"
    });
  };

  // Scroll on new messages only — kept separate from the loading-step
  // ticker below so we don't yank the user's scroll position back to the
  // bottom every ~1.2s while they might be reading earlier messages.
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isLoading) scrollToBottom();
  }, [isLoading]);

  // Loading step rotation to simulate multi-agent LangGraph / LangChain tool steps
  useEffect(() => {
    if (!isLoading) {
      setCurrentStep("");
      return;
    }
    const steps = [
      "Verifying request...",
      "Checking for safe content...",
      "Understanding intent...",
      "Retrieving relevant context...",
      "Composing response...",
      "Finalizing answer...",
      "Delivering results..."
    ];
    let i = 0;
    setCurrentStep(steps[0]);
    const interval = setInterval(() => {
      i = (i + 1) % steps.length;
      setCurrentStep(steps[i]);
    }, 1200);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Escape closes the panel; focus moves into the input on open and back
  // to the toggle button on close (skipped on first mount so we don't
  // steal focus from the page on load).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isOpen) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 250);
      return () => window.clearTimeout(t);
    }
    toggleBtnRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  // Focus trap — keep Tab / Shift+Tab cycling within the chat panel while open.
  useEffect(() => {
    if (!isOpen) return;
    const panel = document.getElementById("sre-chat-panel");
    if (!panel) return;

    const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = Array.from(panel.querySelectorAll(FOCUSABLE)) as HTMLElement[];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", trapFocus);
    return () => document.removeEventListener("keydown", trapFocus);
  }, [isOpen]);

  // Abort any in-flight request if the component unmounts.
  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  const handleSend = async (rawText: string) => {
    const textToSend = rawText.trim();
    if (!textToSend || isLoading) return;

    const newUserMessage: Message = { role: "user", content: textToSend };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw { status: response.status, message: body.error };
      }

      const data = await response.json();
      if (data.error) {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: `⚠️ ${data.error}` }
        ]);
      } else if (data.message && typeof data.message.content === "string") {
        setMessages(prev => [
          ...prev,
          {
            role: data.message.role === "user" ? "assistant" : data.message.role,
            content: data.message.content,
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "⚠️ Received an unexpected response format." }
        ]);
      }
    } catch (error: any) {
      if (error?.name === "AbortError") return;
      console.error("Chat error:", error);
      const isRateLimited = error?.status === 429;
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: isRateLimited
            ? "⚠️ Getting a lot of traffic — try again in a few seconds."
            : "⚠️ Something went wrong, please retry."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to re-initialize SRE Chat session?")) {
      abortControllerRef.current?.abort();
      setIsLoading(false);
      setMessages([
        {
          role: "assistant",
          content: "🔄 **Session Re-initialized.**\n\nAll cognitive cache has been flushed. How can I help you explore Digambar's Kubernetes, AWS cloud, or agentic automation background?"
        }
      ]);
    }
  };

  return (
    <>
      {/* Floating Action Button (hidden while chat panel is open to avoid duplicate entry points) */}
      {!isOpen && (
        <div
          className="fixed right-6 z-50"
          style={{ bottom: isContactVisible ? '6.5rem' : '1.5rem', transition: 'bottom 0.3s ease' }}
        >
          <motion.button
            ref={toggleBtnRef}
            id="chat-toggle-btn"
            onClick={() => setIsOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-4 rounded-full text-gray-950 font-bold shadow-[0_0_20px_rgba(255,212,0,0.3)] hover:shadow-[0_0_30px_rgba(255,212,0,0.5)] transition-all cursor-pointer flex items-center justify-center bg-accent text-gray-950"
            aria-label="Open SRE-Copilot chat"
            aria-expanded={isOpen}
            aria-controls="sre-chat-panel"
          >
            <MessageSquare size={24} />
            {/* Active indicator dot */}
            <span className="absolute top-0 right-0 flex h-3.5 w-3.5" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-accent-hover border-2 border-gray-950"></span>
            </span>
          </motion.button>
        </div>
      )}

      {/* Chat Terminal Window + full-screen backdrop.
           The backdrop prevents page content from bleeding through behind
           the panel, and clicking it closes the chat. dvh units account for
           mobile browser chrome (address bar show/hide) correctly. */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop: lighter overlay so background remains visible but de-emphasized */}
            <motion.div
              key="chat-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="fixed inset-0 z-[60]"
              style={{ backgroundColor: 'rgba(0,0,0,0.94)', backdropFilter: 'blur(12px)' }}
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            {/* Panel */}
            <motion.div
              key="chat-panel"
              id="sre-chat-panel"
              role="dialog"
              aria-modal="true"
              aria-label="SRE-Copilot chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 w-full sm:w-[440px] h-[100dvh] sm:h-[90dvh] max-h-none sm:max-h-[600px] bg-gray-950 border-0 sm:border border-gray-800 rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[70]"
            >
            {/* Header / Control Bar */}
            <div className="p-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_#FFD400]" />
                <div>
                  <h3 className="font-display font-bold text-xs text-white uppercase tracking-wider flex items-center space-x-1.5">
                    <Terminal size={12} className="text-accent" />
                    <span>SRE-Copilot v1.2</span>
                  </h3>
                  <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">
                    Secure tool integrations & protections
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleReset}
                  title="Reset System Cache"
                  aria-label="Reset chat session"
                  className="p-1.5 rounded bg-gray-950 border border-gray-800 hover:border-accent/40 text-gray-400 hover:text-accent transition-colors cursor-pointer"
                >
                  <RotateCcw size={12} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Minimize Terminal"
                  aria-label="Close chat"
                  className="p-1.5 rounded bg-gray-950 border border-gray-800 hover:border-red-500/40 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            {/* Alert Indicator for Guardrail Status */}
            <div className="bg-gray-900/60 px-4 py-1.5 border-b border-gray-800/40 flex items-center justify-between text-[10px] font-mono text-gray-400">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck size={11} className="text-green-400" />
                <span>GUARDRAILS: ACTIVE</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Cpu size={11} className="text-accent" />
                <span>INFERENCE: ACTIVE</span>
              </div>
            </div>

            {/* Message Pane */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950 terminal-grid themed-scrollbar"
              data-scroll-lock-scrollable
              role="log"
              aria-live="polite"
            >
              {messages.map((msg, index) => {
                const isBot = msg.role === "assistant" || msg.role === "system";
                const isSecurityTrigger = msg.content.includes("Guardrail Triggered");

                return (
                  <div
                    key={index}
                    className={`flex ${isBot ? "justify-start" : "justify-end"} items-start space-x-2 max-w-full`}
                  >
                    {isBot && (
                      <div className={`p-1.5 rounded bg-gray-900 border shrink-0 ${
                        isSecurityTrigger ? "border-red-500/40 text-red-400" : "border-gray-800 text-accent"
                      }`}>
                        {isSecurityTrigger ? <AlertTriangle size={14} /> : <Cpu size={14} />}
                      </div>
                    )}

                    <div
                      className={`rounded-xl px-3.5 py-2.5 text-xs font-sans leading-relaxed break-words max-w-[85%] ${
                        isBot
                          ? isSecurityTrigger
                            ? "bg-red-500/5 border border-red-500/20 text-red-200"
                            : "bg-gray-900 border border-gray-800 text-gray-300"
                          : "bg-accent/5 border border-accent/20 text-gray-200"
                      }`}
                    >
                      {isBot ? (
                        <div className="markdown-body prose prose-invert max-w-none text-xs">
                          <Markdown>{msg.content}</Markdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>

                    {!isBot && (
                      <div className="p-1.5 rounded bg-gray-900 border border-gray-800 text-gray-400 shrink-0">
                        <User size={14} />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Dynamic Agent Multi-Step Typing Loader */}
              {isLoading && (
                <div className="flex justify-start items-start space-x-3" role="status" aria-live="polite">
                  <div className="p-1.5 rounded bg-gray-900 border border-gray-800 text-accent shrink-0">
                    <Cpu size={14} />
                  </div>

                  <div className="rounded-xl px-3.5 py-2.5 text-xs font-sans leading-relaxed break-words max-w-[85%] bg-gray-900 border border-gray-800 text-gray-300">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0s' }} />
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: '150ms' }} />
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[11px] text-accent font-mono">{currentStep || 'Thinking...'}</span>
                    </div>
                    <div className="text-[9px] text-gray-500 mt-1">SRE-Copilot is composing a response...</div>
                  </div>
                </div>
              )}

              {/* Suggestions Chips Area (inline with messages to avoid large empty gaps) */}
              {messages.length === 1 && (
                <div className="px-2 py-2 mt-1 border-t border-gray-900/40 bg-gray-950/80 rounded-md">
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-2 flex items-center space-x-1">
                    <Sparkles size={10} className="text-accent" />
                    <span>Suggested Investigations:</span>
                  </p>
                  <div className="flex flex-col gap-2">
                    {SUGGESTIONS.map((sug) => (
                      <button
                        key={sug}
                        onClick={() => handleSend(sug)}
                        disabled={isLoading}
                        className="text-left px-3 py-2 bg-gray-900 hover:bg-accent/5 border border-gray-800 hover:border-accent/20 text-[11px] text-gray-400 hover:text-accent rounded-lg transition-all cursor-pointer font-sans line-clamp-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input Form Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="p-3 bg-gray-900 border-t border-gray-800 flex items-center space-x-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isLoading ? "SRE Copilot is thinking..." : "Ask me anything about Digambar's systems..."}
                disabled={isLoading}
                maxLength={MAX_INPUT_LENGTH}
                aria-label="Chat message"
                className="flex-1 bg-gray-950 border border-gray-800 hover:border-gray-700 focus:border-accent focus:ring-1 focus:ring-accent/10 text-xs text-gray-200 px-3 py-2.5 rounded-lg outline-none transition-all placeholder:text-gray-600 font-sans disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className="p-2.5 rounded-lg bg-accent hover:bg-accent-hover text-gray-950 font-bold transition-all disabled:opacity-50 disabled:hover:bg-accent cursor-pointer flex items-center justify-center shrink-0"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

