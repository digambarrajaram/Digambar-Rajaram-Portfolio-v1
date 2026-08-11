import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { pinBody, unpinBody } from "../hooks/bodyPin";

type MessageRole = "user" | "assistant" | "system";
type MessageStatus = "failed";

interface Message {
  readonly id?: string;
  readonly role: MessageRole;
  readonly content: string;
  readonly status?: MessageStatus;
}

const DEFAULT_ASSISTANT_MESSAGE: Message = {
  id: 'assistant-default-1',
  role: "assistant",
  content:
    "👋 Hi — I'm SRE-Copilot. Ask me about Digambar's Kubernetes, AWS, or automation background.\n\nTry: 'Show GitOps architecture', 'Explain an incident response playbook', or 'What projects used LangGraph?'"
};

const SUGGESTIONS = [
  "Describe the architecture and automation workflow of the AWS Terraform Drift Reconciler project",
  "How does the multi-agent cost optimization system work?",
  "What were Digambar's SRE responsibilities at Protean eGov Technologies?",
  "What certifications and experience does Digambar have in GenAI and MLOps?"
];

const MAX_INPUT_LENGTH = 2000;
const AUTO_SCROLL_THRESHOLD = 120;

export default function SREChatWindow() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isContactVisible, setIsContactVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([DEFAULT_ASSISTANT_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [retryText, setRetryText] = useState<string | null>(null);

  // Draggable toggle button position — initialised to bottom-right, persisted
  // across sessions via localStorage so the user's preference sticks.
  const [btnPos, setBtnPos] = useState<{ x: number; y: number }>(() => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    try {
      const saved = localStorage.getItem("sre-chat-btn-pos");
      if (saved) return JSON.parse(saved) as { x: number; y: number };
    } catch { /* ignore */ }
    return { x: window.innerWidth - 72, y: window.innerHeight - 100 };
  });
  const draggingRef = useRef(false);
  const pointerDownRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, btnX: 0, btnY: 0 });
  const pendingRafRef = useRef<number | null>(null);
  const lastDragPosRef = useRef<{ x: number; y: number } | null>(null);

  const onDragStart = (clientX: number, clientY: number) => {
    pointerDownRef.current = true;
    draggingRef.current = false;
    dragStartRef.current = { x: clientX, y: clientY, btnX: btnPos.x, btnY: btnPos.y };
  };

  const onDragMove = (clientX: number, clientY: number) => {
    if (!pointerDownRef.current) return;
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;
    if (!draggingRef.current && Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
    draggingRef.current = true;
    lastDragPosRef.current = { x: Math.max(0, Math.min(window.innerWidth - (56 + 16), dragStartRef.current.btnX + dx)),
      y: Math.max(0, Math.min(window.innerHeight - (56 + 16), dragStartRef.current.btnY + dy)) };
    if (pendingRafRef.current === null) {
      pendingRafRef.current = requestAnimationFrame(() => {
        pendingRafRef.current = null;
        if (lastDragPosRef.current) setBtnPos(lastDragPosRef.current);
      });
    }
  };

  const onDragEnd = () => {
    pointerDownRef.current = false;
    if (draggingRef.current) {
      try { localStorage.setItem("sre-chat-btn-pos", JSON.stringify(btnPos)); } catch { /* ignore */ }
    }
    if (pendingRafRef.current !== null) {
      cancelAnimationFrame(pendingRafRef.current);
      pendingRafRef.current = null;
    }
  };

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const isMountedRef = useRef(false);
  const isOpenRef = useRef(false);
  const deferredUnpinRef = useRef(false);
  const shouldAutoScrollRef = useRef(true);
  const isFirstRender = useRef(true);
  const messagesRef = useRef<Message[]>([DEFAULT_ASSISTANT_MESSAGE]);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      if (isOpenRef.current) unpinBody();
    };
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

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

  const scrollToBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, []);

  const updateAutoScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldAutoScrollRef.current = distance < AUTO_SCROLL_THRESHOLD;
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    updateAutoScroll();
    container.addEventListener("scroll", updateAutoScroll, { passive: true });
    return () => container.removeEventListener("scroll", updateAutoScroll);
  }, [updateAutoScroll]);

  useEffect(() => {
    if (shouldAutoScrollRef.current) scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isLoading && shouldAutoScrollRef.current) scrollToBottom();
  }, [isLoading, scrollToBottom]);

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
    const interval = window.setInterval(() => {
      i = (i + 1) % steps.length;
      setCurrentStep(steps[i]);
    }, 1200);
    return () => window.clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isOpen) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 250);
      return () => window.clearTimeout(timer);
    }
    toggleBtnRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeChat();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const panel = document.getElementById("sre-chat-panel");
    if (!panel) return;
    const FOCUSABLE =
      'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusable = Array.from(panel.querySelectorAll(FOCUSABLE)) as HTMLElement[];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", trapFocus);
    return () => document.removeEventListener("keydown", trapFocus);
  }, [isOpen]);

  const generateMessageId = () =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const handleSend = useCallback(async (rawText: string) => {
    const textToSend = rawText.trim();
    if (!textToSend || isLoadingRef.current) return;

    const userMessage: Message = {
      id: generateMessageId(),
      role: "user",
      content: textToSend
    };
    const requestId = ++requestIdRef.current;

    setMessages((prev) => {
      const next = [...prev, userMessage];
      messagesRef.current = next;
      return next;
    });
    setInput("");
    setIsLoading(true);
    setRetryText(null);

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const requestPayload = { messages: [...messagesRef.current, userMessage] };
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
        signal: controller.signal
      });

      if (requestId !== requestIdRef.current || !isMountedRef.current) return;

      const payload = (await response.json().catch(() => ({} as Record<string, unknown>))) as Record<string, unknown>;
      if (!response.ok) {
        const message =
          typeof payload.error === "string"
            ? payload.error
            : response.statusText || "Request failed";
        throw new Error(String(message));
      }

      if (payload.error) {
        throw new Error(String(payload.error));
      }

      const incoming = payload.message as { role?: string; content?: unknown } | undefined;
      if (!incoming || typeof incoming.content !== "string") {
        throw new Error("Invalid message payload.");
      }

      const content = incoming.content.trim();
      if (!content) {
        throw new Error("Received empty response from the chat service.");
      }

      const role: MessageRole = incoming.role === "system" ? "system" : "assistant";
      if (requestId !== requestIdRef.current || !isMountedRef.current) return;

      setMessages((prev) => {
        const next = [...prev, { role, content }];
        messagesRef.current = next;
        return next;
      });
    } catch (error: unknown) {
      if ((error as { name?: string })?.name === "AbortError") return;
      if (requestId !== requestIdRef.current || !isMountedRef.current) return;

      const message =
        error instanceof Error && error.message ? error.message : "Unable to complete the request. Please try again.";
      setRetryText(textToSend);

      setMessages((prev) => {
        const next = prev.map((entry) =>
          entry.id === userMessage.id ? { ...entry, status: "failed" as const } : entry
        );
        return next;
      });

      setMessages((prev) => {
        const next: Message[] = [...prev, { role: "assistant" as const, content: `⚠️ ${message}` }];
        messagesRef.current = next;
        return next;
      });
    } finally {
      if (requestId !== requestIdRef.current || !isMountedRef.current) return;
      setIsLoading(false);
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (!retryText || isLoading) return;
    handleSend(retryText);
  }, [retryText, isLoading, handleSend]);

  const openChat = useCallback(() => {
    if (isOpenRef.current) return;
    if (deferredUnpinRef.current) {
      deferredUnpinRef.current = false;
    } else {
      pinBody();
    }
    setIsClosing(false);
    isOpenRef.current = true;
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    if (!isOpenRef.current) return;
    isOpenRef.current = false;
    deferredUnpinRef.current = true;
    setIsClosing(true);
    setIsOpen(false);
  }, []);

  const handleReset = useCallback(() => {
    if (!window.confirm("Are you sure you want to re-initialize SRE Chat session?")) return;
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setMessages([DEFAULT_ASSISTANT_MESSAGE]);
    setRetryText(null);
  }, []);

  return (
    <>
      {!isOpen && (
        <div
          className="fixed z-[9999] select-none"
          style={{
            left: btnPos.x,
            top: btnPos.y,
            touchAction: "none",
          }}
          onPointerDown={(e) => {
            e.preventDefault();
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            onDragStart(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (!e.isPrimary) return;
            onDragMove(e.clientX, e.clientY);
          }}
          onPointerUp={(e) => {
            onDragEnd();
            if (!draggingRef.current) openChat();
          }}
        >
          <motion.button
            ref={toggleBtnRef}
            id="chat-toggle-btn"
            whileHover={{ scale: 1.05 }}
            className="rounded-full font-bold cursor-grab active:cursor-grabbing flex items-center justify-center pointer-events-none"
            style={{
              backgroundColor: "#FFD400",
              color: "#050505",
              boxShadow: "0 0 20px rgba(255,212,0,0.3)",
              width: 56,
              height: 56,
            }}
            aria-label="Open SRE-Copilot chat"
            aria-expanded={isOpen}
            aria-controls="sre-chat-panel"
          >
            <MessageSquare size={24} />
            <span className="absolute top-0 right-0 flex h-3.5 w-3.5" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-accent-hover border-2 border-gray-950"></span>
            </span>
          </motion.button>
        </div>
      )}

      <AnimatePresence
        mode="wait"
        onExitComplete={() => {
          setIsClosing(false);
          if (deferredUnpinRef.current) {
            deferredUnpinRef.current = false;
            unpinBody();
          }
        }}
      >
        {isOpen && (
          <>
            <motion.div
              key="chat-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.08 }}
              className="fixed inset-0 z-90 bg-black/95"
              onClick={closeChat}
              aria-hidden="true"
            />

            <motion.div
              key="chat-panel"
              id="sre-chat-panel"
              role="dialog"
              aria-modal="true"
              aria-label="SRE-Copilot chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
              className={`fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 w-full sm:w-[440px] h-[100dvh] sm:h-[90dvh] max-h-none sm:max-h-[600px] bg-gray-950 border-0 sm:border border-gray-800 rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[95] ${isClosing ? "pointer-events-none" : ""}`}
            >
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
                    onClick={closeChat}
                    title="Minimize Terminal"
                    aria-label="Close chat"
                    className="p-1.5 rounded bg-gray-950 border border-gray-800 hover:border-red-500/40 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

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
                      key={msg.id ?? index}
                      className={`flex ${isBot ? "justify-start" : "justify-end"} items-start space-x-2 max-w-full`}
                    >
                      {isBot && (
                        <div
                          className={`p-1.5 rounded bg-gray-900 border shrink-0 ${
                            isSecurityTrigger ? "border-red-500/40 text-red-400" : "border-gray-800 text-accent"
                          }`}
                        >
                          {isSecurityTrigger ? <AlertTriangle size={14} /> : <Cpu size={14} />}
                        </div>
                      )}

                      <div
                        className={`rounded-xl px-3.5 py-2.5 text-xs font-sans leading-relaxed break-words max-w-[85%] ${
                          isBot
                            ? isSecurityTrigger
                              ? "bg-red-500/5 border border-red-500/20 text-red-200"
                              : "bg-gray-900 border border-gray-800 text-gray-300"
                            : msg.status === "failed"
                            ? "bg-red-500/5 border border-red-500/20 text-red-200"
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

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSend(input);
                }}
                className="p-3 bg-gray-900 border-t border-gray-800 flex items-center space-x-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={isLoading ? "SRE Copilot is thinking..." : "Ask me anything about Digambar's systems..."}
                  disabled={isLoading}
                  maxLength={MAX_INPUT_LENGTH}
                  aria-label="Chat message"
                  className="flex-1 bg-gray-950 border border-gray-800 hover:border-gray-700 focus:border-accent focus:ring-1 focus:ring-accent/10 text-base sm:text-xs text-gray-200 px-3 py-2.5 rounded-lg outline-none transition-all placeholder:text-gray-600 font-sans disabled:opacity-60"
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
