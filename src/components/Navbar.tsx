import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Github, Linkedin, Mail, Phone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { personalInfo, socialLinks } from "../data";
import { pinBody, unpinBody } from "../hooks/bodyPin";
import { scrollToElement } from "../hooks/scrollTo";

interface NavbarProps {
  activeSection: string;
  isChaosMode: boolean;
  setIsChaosMode: (val: boolean) => void;
}

export default function Navbar({ activeSection, isChaosMode }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Distance from the top of the viewport to the bottom of the fixed navbar.
  // Used to position the mobile dropdown panel exactly below the header,
  // including any additional offset from the chaos-mode banner (fixes a bug
  // where the panel rendered too high / overlapped the banner in chaos mode).
  const [panelTop, setPanelTop] = useState(0);
  const navRef = useRef<HTMLElement>(null);
  const isOpenRef = useRef(false);

  // Guard against double-unlock on unmount.
  useEffect(() => {
    return () => {
      if (isOpenRef.current) unpinBody();
    };
  }, []);

  const openDrawer = () => {
    pinBody();
    isOpenRef.current = true;
    setIsOpen(true);
  };

  const closeDrawer = () => {
    isOpenRef.current = false;
    setIsOpen(false);
    unpinBody();
  };

  useEffect(() => {
    const updatePanelTop = () => {
      if (navRef.current) {
        setPanelTop(navRef.current.getBoundingClientRect().bottom);
      }
    };
    updatePanelTop();
    window.addEventListener("resize", updatePanelTop);
    return () => window.removeEventListener("resize", updatePanelTop);
  }, [isOpen, scrolled, isChaosMode]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the mobile menu on Escape for keyboard users.
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  // Focus trap — keep Tab / Shift+Tab cycling within the nav drawer while open.
  useEffect(() => {
    if (!isOpen) return;
    const panel = document.getElementById("mobile-nav-panel");
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
    const element = document.getElementById(id);
    if (!element) return;

    const navHeight = navRef.current?.offsetHeight || 0;
    const bannerOffset = parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--banner-offset") || "0",
      10
    );

    if (isOpen) {
      // When the body is pinned (position:fixed), window.scrollY is always 0,
      // so we use offsetTop (document-relative) instead of
      // getBoundingClientRect().top + window.scrollY (viewport-relative).
      const targetY = Math.max(
        0,
        element.offsetTop - navHeight - bannerOffset
      );
      // Unpin the body and scroll to the target in a single operation —
      // avoids the two-competing-scrollTo race that iOS Safari drops.
      isOpenRef.current = false;
      setIsOpen(false);
      unpinBody(targetY);
    } else {
      scrollToElement(id);
    }
  };

  return (
    <>
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
            {/* Logo / Name — a real button so it's keyboard-focusable and
                announced correctly by screen readers. */}
            <button
              type="button"
              onClick={() => handleNavClick("hero")}
              className="flex items-center space-x-3 cursor-pointer bg-transparent border-0 p-0 text-left"
              aria-label={`${personalInfo.name} — go to home`}
            >
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
            </button>

            {/* Desktop Nav Items */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  aria-current={activeSection === item.id ? "page" : undefined}
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
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                  title="GitHub"
                  aria-label="GitHub (opens in new tab)"
                >
                  <Github size={18} />
                </a>
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                  title="LinkedIn"
                  aria-label="LinkedIn (opens in new tab)"
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
                onClick={() => isOpen ? closeDrawer() : openDrawer()}
                className="text-gray-400 hover:text-white p-2"
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
                aria-controls="mobile-nav-panel"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu — rendered outside <nav> so the nav's backdrop-blur-md
           (present when scrolled) doesn't create a containing block that
           breaks position:fixed on iOS Safari. */}
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
              className="fixed inset-0 z-40 md:hidden"
              style={{ backgroundColor: '#030303' }}
              onClick={closeDrawer}
              aria-hidden="true"
            />

            {/* Content panel — starts just below the navbar, height ≈ content */}
            <motion.div
              key="nav-panel"
              id="mobile-nav-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed left-0 right-0 z-50 md:hidden overflow-y-auto flex flex-col px-4 pb-6 space-y-3"
              data-scroll-lock-scrollable
              style={{
                backgroundColor: '#060606',
                top: panelTop,
                maxHeight: panelTop ? `calc(100dvh - ${panelTop}px)` : undefined,
              }}
            >
              <div className="space-y-1 pt-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    aria-current={activeSection === item.id ? "page" : undefined}
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
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 hover:text-accent"
                    aria-label="GitHub (opens in new tab)"
                  >
                    <Github size={18} />
                    <span className="text-sm">GitHub</span>
                  </a>
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 hover:text-accent"
                    aria-label="LinkedIn (opens in new tab)"
                  >
                    <Linkedin size={18} />
                    <span className="text-sm">LinkedIn</span>
                  </a>
                </div>

                <div className="flex flex-col space-y-2 text-xs text-gray-500 font-mono px-4">
                  <div className="flex items-center space-x-2">
                    <Mail size={12} className="text-accent" />
                    <span className="break-all">{personalInfo.email}</span>
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
    </>
  );
}