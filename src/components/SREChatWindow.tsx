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
  "Explore Digambar's GitOps & EKS architecture",
  "What is the multi-agent cost copilot?",
  "Detail his SRE role at Protean eGov Technologies",
  "What are his credentials in GenAI and MLOps?"
];

export default function SREChatWindow() {
  const [isOpen, setIsOpen] = useState(false);

  useScrollLock(isOpen);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 **Welcome SRE Engineer / Recruiter!**\n\nI am Digambar's custom **Agentic SRE Copilot**, built with **LangChain tool-calling** and integrated **multi-layer guardrails**.\n\nI have direct access to Digambar's professional background, production EKS architecture details, and AWS project history. \n\nHow can I assist your investigation today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom — scrolls only the message pane's own scrollbar,
  // never the page (scrollIntoView was previously dragging the whole page down).
  const scrollToBottom = () => {
    messagesContainerRef.current?.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, currentStep]);

  // Loading step rotation to simulate multi-agent LangGraph / LangChain tool steps
  useEffect(() => {
    if (!isLoading) {
      setCurrentStep("");
      return;
    }
    const steps = [
      "RUNNING INPUT GUARDRAILS...",
      "CHECKING PROMPT INJECTION CONTROLS...",
      "PARSING USER INTENT VIA GROQ LLAMA...",
      "RESOLVING TOOL-CALL: get_technical_skills...",
      "RETRIEVING PORTFOLIO CONTEXT...",
      "EVALUATING MODEL OUTPUT...",
      "FORMATTING COMPLIANT RESPONSE..."
    ];
    let i = 0;
    setCurrentStep(steps[0]);
    const interval = setInterval(() => {
      i = (i + 1) % steps.length;
      setCurrentStep(steps[i]);
    }, 1200);

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const newUserMessage: Message = { role: "user", content: textToSend };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw { status: response.status, message: body.error };
      }

      const data = await response.json();
      if (data.error) {
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: `⚠️ ${data.error}`
          }
        ]);
      } else if (data.message) {
        setMessages(prev => [...prev, data.message]);
      }
    } catch (error: any) {
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
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          id="chat-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative p-4 rounded-full text-gray-950 font-bold shadow-[0_0_20px_rgba(255,212,0,0.3)] hover:shadow-[0_0_30px_rgba(255,212,0,0.5)] transition-all cursor-pointer flex items-center justify-center ${
            isOpen ? "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]" : "bg-accent text-gray-950"
          }`}
        >
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
          
          {/* Active indicator dot */}
          {!isOpen && (
            <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-accent-hover border-2 border-gray-950"></span>
            </span>
          )}
        </motion.button>
      </div>

      {/* Chat Terminal Window + full-screen backdrop.
           The backdrop prevents page content from bleeding through behind
           the panel, and clicking it closes the chat.  dvh units account for
           mobile browser chrome (address bar show/hide) correctly. */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="chat-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[60] bg-gray-950/70 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            {/* Panel */}
            <motion.div
              key="chat-panel"
              id="sre-chat-panel"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
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
                    LangGraph Tools & Guardrails
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleReset}
                  title="Reset System Cache"
                  className="p-1.5 rounded bg-gray-950 border border-gray-800 hover:border-accent/40 text-gray-400 hover:text-accent transition-colors cursor-pointer"
                >
                  <RotateCcw size={12} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Minimize Terminal"
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
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950/95 terminal-grid">
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
                <div className="flex justify-start items-center space-x-2.5">
                  <div className="p-1.5 rounded bg-gray-900 border border-gray-800 text-accent shrink-0 animate-spin">
                    <Cpu size={14} />
                  </div>
                  <div className="p-3 bg-gray-900/50 border border-gray-900/60 rounded-xl max-w-[80%] font-mono text-[9px] text-accent flex flex-col space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full animate-ping" />
                      <span>{currentStep || "PROCESSING DATA..."}</span>
                    </div>
                    <span className="text-[7px] text-gray-500 tracking-wider">LANGCHAIN AGENT RUNNABLE EXECUTION...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Chips Area */}
            {messages.length === 1 && (
              <div className="px-4 py-2 border-t border-gray-900/40 bg-gray-950/80">
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-2 flex items-center space-x-1">
                  <Sparkles size={10} className="text-accent" />
                  <span>Suggested Investigations:</span>
                </p>
                <div className="flex flex-col gap-1.5">
                  {SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      onClick={() => handleSend(sug)}
                      disabled={isLoading}
                      className="text-left px-3 py-1.5 bg-gray-900 hover:bg-accent/5 border border-gray-800 hover:border-accent/20 text-[11px] text-gray-400 hover:text-accent rounded-lg transition-all cursor-pointer font-sans truncate"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="p-3 bg-gray-900 border-t border-gray-800 flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isLoading ? "SRE Copilot is thinking..." : "Ask me anything about Digambar's systems..."}
                disabled={isLoading}
                className="flex-1 bg-gray-950 border border-gray-800 hover:border-gray-700 focus:border-accent focus:ring-1 focus:ring-accent/10 text-xs text-gray-200 px-3 py-2.5 rounded-lg outline-none transition-all placeholder:text-gray-600 font-sans"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
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