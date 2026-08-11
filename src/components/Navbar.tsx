import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Github, Linkedin, Mail, Phone, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { personalInfo, socialLinks } from "../data";
import { pinBody, unpinBody, getSavedScrollY } from "../hooks/bodyPin";
import { scrollToElement } from "../hooks/scrollTo";

interface NavbarProps {
  activeSection: string;
  isChaosMode: boolean;
  setIsChaosMode: (val: boolean) => void;
}

export default function Navbar({ activeSection, isChaosMode }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const openStateRef = useRef(false);
  // Distance from the top of the viewport to the bottom of the fixed navbar.
  // Used to position the mobile dropdown panel exactly below the header,
  // including any additional offset from the chaos-mode banner (fixes a bug
  // where the panel rendered too high / overlapped the banner in chaos mode).
  const [panelTop, setPanelTop] = useState(0);
  const navRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(false);
  // When true, unpinBody is deferred to onExitComplete (closeDrawer path).
  // When false, handleNavClick already called unpinBody directly.
  const deferredUnpinRef = useRef(false);

  // Phone reveal — matches the Contact page behaviour
  const [showPhone, setShowPhone] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const maskPhone = (phone: string) => phone.replace(/\d(?=\d{4})/g, "•");

  const handleRevealPhone = () => {
    setShowPhone(true);
    try {
      navigator.clipboard.writeText(personalInfo.phone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } catch (_) {}
  };

  // Guard against double-unlock on unmount.
  useEffect(() => {
    return () => {
      if (isOpenRef.current) {
        isOpenRef.current = false;
        unpinBody();
      }
    };
  }, []);

  const openDrawer = React.useCallback(() => {
    if (isOpenRef.current) return;
    if (deferredUnpinRef.current) {
      // A close is still mid-exit; its unpinBody() hasn't run yet, so the
      // original pin is still active. Just cancel the pending unpin —
      // don't pin a second time.
      deferredUnpinRef.current = false;
    } else {
      pinBody();
    }
    setIsClosing(false);
    isOpenRef.current = true;
    openStateRef.current = true;
    setIsOpen(true);
  }, []);

  const closeDrawer = React.useCallback(() => {
    if (!isOpenRef.current) return;
    isOpenRef.current = false;
    openStateRef.current = false;
    deferredUnpinRef.current = true;
    setIsClosing(true);
    setIsOpen(false);
    setShowPhone(false);
    setCopiedPhone(false);
  }, []);

  const updatePanelTop = React.useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    setPanelTop(nav.getBoundingClientRect().bottom);
  }, []);

  useEffect(() => {
    updatePanelTop();
  }, [updatePanelTop, isChaosMode, scrolled]);

  useEffect(() => {
    window.addEventListener("resize", updatePanelTop);
    return () => window.removeEventListener("resize", updatePanelTop);
  }, [updatePanelTop]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 50);
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the mobile menu on Escape for keyboard users.
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, closeDrawer]);

  // Focus trap — keep Tab / Shift+Tab cycling within the nav drawer while open.
  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    if (!panel) return;

    const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

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

  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );

    if (focusable.length > 0) {
      focusable[0].focus();
    }
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

  const handleNavClick = React.useCallback(
    (id: string) => {
      const element = document.getElementById(id);
      if (!element) return;

      const navHeight = navRef.current?.offsetHeight || 0;
      const bannerOffset = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue("--banner-offset") || "0",
        10
      );
      const headerBottom = navHeight + bannerOffset;

      // elementTop is the element's distance from the viewport top.  When the
      // body is pinned we use getSavedScrollY() (window.scrollY is always 0);
      // when unpinned we use the live window.scrollY directly.
      const elementTop = element.getBoundingClientRect().top;
      // The section is "already visible" only when its top edge is between
      // just-above-the-viewport and the navbar line — not scrolled past above
      // (negative elementTop with large magnitude) and not below the fold.
      const alreadyThere = elementTop >= -40 && elementTop <= headerBottom + 40;

      if (openStateRef.current) {
        const prevY = getSavedScrollY();
        const targetY = Math.max(0, elementTop + prevY - headerBottom);

        // handleNavClick calls unpinBody directly — don't also unpin in
        // onExitComplete when the exit animation finishes.
        deferredUnpinRef.current = false;
        isOpenRef.current = false;
        openStateRef.current = false;
        setIsClosing(true);
        setIsOpen(false);
        setShowPhone(false);
        setCopiedPhone(false);

        if (alreadyThere) {
          // Already looking at this section — restore to savedScrollY.
          // The instant scroll fires in rAF before paint, so no visible jump.
          unpinBody();
        } else {
          // Different section — unpin with an instant scroll to the target.
          // The scroll fires inside unpinBody's rAF before the next paint,
          // so there's no intermediate frame showing the top of the page.
          unpinBody(targetY);
        }
      } else {
        // Desktop — only scroll if we aren't already at this section.
        if (!alreadyThere) {
          scrollToElement(id);
        }
      }
    },
    [isOpen, scrollToElement]
  );

  return (
    <>
      <nav
        ref={navRef}
        id="navbar"
        className={`fixed left-0 w-full transition-all duration-300 ${
          isOpen ? "z-40" : "z-50"
        } ${
          isChaosMode ? "top-[96px] sm:top-[56px]" : "top-0"
        } ${
          scrolled
            ? "bg-gray-950/85 backdrop-blur-md border-b border-gray-900/60 py-3"
            : "bg-transparent py-3 sm:py-5"
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
      <AnimatePresence
        onExitComplete={() => {
          setIsClosing(false);
          // closeDrawer defers unpinBody — the backdrop + panel fade out
          // together, scroll stays locked, no page bleed-through.
          // handleNavClick already called unpinBody directly, so skip.
          if (deferredUnpinRef.current) {
            deferredUnpinRef.current = false;
            unpinBody();
          }
        }}
      >
        {isOpen && (
          <>
            {/* Full-viewport backdrop — fades out in sync with the panel so
                page content never shows through during the exit animation. */}
            <motion.div
              key="nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="fixed inset-0 z-[100] md:hidden"
              style={{ backgroundColor: '#030303' }}
              onClick={closeDrawer}
              aria-hidden="true"
            />

            {/* Content panel */}
            <motion.div
              key="nav-panel"
              id="mobile-nav-panel"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className={`fixed left-0 right-0 z-[110] md:hidden overflow-y-auto flex flex-col px-4 pb-6 space-y-3 ${isClosing ? 'pointer-events-none' : ''}`}
              data-scroll-lock-scrollable
              style={{
                backgroundColor: '#060606',
                top: panelTop,
                maxHeight: panelTop ? `calc(100dvh - ${panelTop}px)` : undefined,
              }}
            >
              {/* Drawer header — mirrors the main navbar branding so the top
                  of the panel doesn't look blank on mobile. */}
              <div className="flex items-center justify-between pt-4 pb-2 border-b border-gray-900/60">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-gray-950 transition-all duration-500 ${
                    isChaosMode
                      ? "bg-red-500 shadow-[0_0_20px_#EF4444] animate-pulse"
                      : "bg-accent shadow-[0_0_15px_rgba(255,212,0,0.5)]"
                  }`}>
                    {isChaosMode ? "⚠️" : "DR"}
                  </div>
                  <div>
                    <span className="font-display font-bold text-sm tracking-tight text-white block">
                      {personalInfo.name}
                    </span>
                    <span className={`font-mono text-[9px] tracking-widest uppercase block font-semibold transition-colors duration-500 ${
                      isChaosMode ? "text-red-400" : "text-accent"
                    }`}>
                      {isChaosMode ? "INCIDENT ACTIVE" : "SRE & AI Platform"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeDrawer}
                  className="p-2 text-gray-400 hover:text-white shrink-0"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-1">
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0">
                      <Phone size={12} className="text-accent shrink-0" />
                      <span className="truncate">
                        {showPhone ? personalInfo.phone : maskPhone(personalInfo.phone)}
                      </span>
                    </div>
                    {!showPhone ? (
                      <button
                        onClick={handleRevealPhone}
                        className="ml-2 shrink-0 px-2 py-0.5 text-[10px] font-mono text-accent bg-accent/10 border border-accent/20 rounded hover:bg-accent/20 transition-colors"
                      >
                        Reveal
                      </button>
                    ) : (
                      <span className="ml-2 shrink-0 text-[10px] font-mono text-green-400 flex items-center gap-1">
                        <Check size={10} />
                        Copied
                      </span>
                    )}
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