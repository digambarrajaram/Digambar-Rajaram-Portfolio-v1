import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Github, Linkedin, Mail, Phone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { personalInfo, socialLinks } from "../data";
import { useScrollLock } from "../hooks/useScrollLock";

interface NavbarProps {
  activeSection: string;
  isChaosMode: boolean;
  setIsChaosMode: (val: boolean) => void;
}

export default function Navbar({ activeSection, isChaosMode, setIsChaosMode }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  const navRef = useRef<HTMLElement>(null);

  useScrollLock(isOpen);

  // Measure actual navbar height so the mobile drawer can offset itself
  // exactly below the fixed header on any device, instead of relying on a
  // hard-coded pt-20 that breaks on taller viewports.
  useEffect(() => {
    if (navRef.current) {
      setNavHeight(navRef.current.offsetHeight);
    }
  }, [isOpen, scrolled, isChaosMode]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "hero", label: "Home" },
    { id: "about", label: "Profile" },
    { id: "projects", label: "Projects" },
    { id: "experience", label: "Experience" },
    { id: "skills", label: "Skills" },
    { id: "console", label: "Sandbox" },
    { id: "contact", label: "Contact" },
  ];

  const handleNavClick = (id: string) => {
    setIsOpen(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
  };

  return (
    <nav
      ref={navRef}
      id="navbar"
      className={`fixed left-0 w-full z-50 transition-all duration-300 ${
        isChaosMode ? "top-[96px] sm:top-[56px]" : "top-0"
      } ${
        scrolled
          ? "bg-gray-950/85 backdrop-blur-md border-b border-gray-900/60 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo / Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick("hero")}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-gray-950 transition-all duration-500 ${
              isChaosMode
                ? "bg-red-500 shadow-[0_0_20px_#EF4444] animate-pulse"
                : "bg-accent shadow-[0_0_15px_rgba(255,212,0,0.5)]"
            }`}>
              {isChaosMode ? "⚠️" : "DR"}
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight text-white block">
                {personalInfo.name}
              </span>
              <span className={`font-mono text-[10px] tracking-widest uppercase block -mt-1 font-semibold transition-colors duration-500 ${
                isChaosMode ? "text-red-400 animate-pulse" : "text-accent"
              }`}>
                {isChaosMode ? "[🚨 ALERT: INCIDENT DEV]" : "SRE & AI Platform Portfolio"}
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1.5 rounded-md font-sans text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeSection === item.id
                    ? "text-accent bg-accent/5 border border-accent/20 shadow-[0_0_12px_rgba(255,212,0,0.05)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Social icons & Quick CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3 text-gray-400 border-r border-gray-800 pr-4">
              <a
                href={socialLinks.github}
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent transition-colors"
                title="GitHub"
              >
                <Github size={18} />
              </a>
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent transition-colors"
                title="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            </div>
            <button
              onClick={() => handleNavClick("contact")}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-gray-950 font-sans font-bold text-xs tracking-wider uppercase rounded-md shadow-[0_0_20px_rgba(255,212,0,0.25)] hover:shadow-[0_0_30px_rgba(255,212,0,0.4)] transition-all cursor-pointer"
            >
              Get In Touch
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu — two-layer: a full-height transparent backdrop for
           tap-to-close (blocks interaction with page content behind it),
           and a separate content-sized solid panel that starts just below
           the navbar header and only takes as much height as its children
           need — no dead space below the Get In Touch button. */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Full-viewport backdrop — blocks scroll/poke-through, tap to close */}
            <motion.div
              key="nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 md:hidden bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Content panel — starts just below the navbar, height ≈ content */}
            <motion.div
              key="nav-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed left-0 right-0 z-50 md:hidden bg-gray-950 overflow-y-auto flex flex-col px-4 pb-6 space-y-3"
              style={{
                top: navRef.current?.offsetHeight || 0,
                maxHeight: navRef.current?.offsetHeight
                  ? `calc(100vh - ${navRef.current.offsetHeight}px)`
                  : undefined,
              }}
            >
              {/* Close button inside the drawer — always visible on mobile so users
                  have an obvious way out without hunting for the hamburger. */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded bg-gray-900 border border-gray-800 hover:border-red-500/40 text-gray-400 hover:text-red-400 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-md font-sans text-base font-medium flex items-center justify-between ${
                      activeSection === item.id
                        ? "text-accent bg-accent/10 border-l-2 border-accent pl-3"
                        : "text-gray-300 hover:bg-gray-900"
                    }`}
                  >
                    {item.label}
                    {activeSection === item.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-900 pt-4 flex flex-col space-y-4">
                <div className="flex justify-around text-gray-400">
                  <a
                    href={socialLinks.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-2 hover:text-accent"
                  >
                    <Github size={18} />
                    <span className="text-sm">GitHub</span>
                  </a>
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-2 hover:text-accent"
                  >
                    <Linkedin size={18} />
                    <span className="text-sm">LinkedIn</span>
                  </a>
                </div>

                <div className="flex flex-col space-y-2 text-xs text-gray-500 font-mono px-4">
                  <div className="flex items-center space-x-2">
                    <Mail size={12} className="text-accent" />
                    <span>{personalInfo.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone size={12} className="text-accent" />
                    <span>{personalInfo.phone}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleNavClick("contact")}
                  className="w-full py-3 bg-accent text-gray-950 font-sans font-bold text-center text-sm rounded-md tracking-wider uppercase shadow-md"
                >
                  Get In Touch
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
