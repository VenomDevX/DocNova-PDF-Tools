import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon, Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { getToolsByCategory, type ToolCategory } from "../data/tools";

const NAV_LINKS = [
  { label: "Convert", path: "/convert", color: "#3b82f6" },
  { label: "Organize", path: "/organize", color: "#8b5cf6" },
  { label: "Edit", path: "/edit", color: "#f59e0b" },
  { label: "Secure", path: "/secure", color: "#ef4444" },
  { label: "OCR", path: "/ocr", color: "#06b6d4" },
];

export function Navbar() {
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setActiveDropdown(null); }, [location.pathname]);

  const openDD = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(label);
  };
  const closeDD = () => { timeoutRef.current = setTimeout(() => setActiveDropdown(null), 150); };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <>
      <style>{`
        .dn-desktop { display: flex !important; }
        .dn-mobile-btn { display: none !important; }
        .dn-cta { display: block !important; }
        @media (max-width: 960px) {
          .dn-desktop { display: none !important; }
          .dn-mobile-btn { display: flex !important; }
          .dn-cta { display: none !important; }
        }
      `}</style>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
          padding: scrolled ? "0.55rem 1.5rem" : "0.85rem 1.5rem",
          background: scrolled ? "var(--dn-nav-bg)" : "transparent",
          borderBottom: scrolled ? "1px solid var(--dn-nav-border)" : "1px solid transparent",
          backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
          transition: "all 0.3s ease", fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <motion.div whileHover={{ scale: 1.04 }} style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
              <img src="/favicon.svg?v=6" alt="DocNova" style={{ width: "34px", height: "34px", borderRadius: "10px", display: "block", boxShadow: "0 0 20px rgba(59,130,246,0.55)" }} />
              <span style={{ color: "var(--dn-nav-logo)", fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.025em" }}>Doc<span style={{ color: "#3b82f6" }}>Nova</span></span>
            </motion.div>
          </Link>

          {/* Desktop nav */}
          <div className="dn-desktop" style={{ alignItems: "center", gap: "0.1rem", flex: 1, justifyContent: "center" }}>
            {NAV_LINKS.map((nav) => {
              const tools = getToolsByCategory(nav.label.toLowerCase() as ToolCategory).slice(0, 6);
              return (
                <div key={nav.label} style={{ position: "relative" }} onMouseEnter={() => openDD(nav.label)} onMouseLeave={closeDD}>
                  <Link to={nav.path} style={{ textDecoration: "none" }}>
                    <motion.div whileHover={{ scale: 1.02 }} style={{ padding: "0.45rem 0.8rem", borderRadius: "10px", color: isActive(nav.path) ? nav.color : "var(--dn-nav-text)", background: isActive(nav.path) ? `${nav.color}14` : "transparent", fontSize: "0.875rem", fontWeight: isActive(nav.path) ? 600 : 500, display: "flex", alignItems: "center", gap: "0.2rem", transition: "all 0.15s", cursor: "pointer" }}>
                      {nav.label}
                      <ChevronDown size={12} style={{ transition: "transform 0.2s", transform: activeDropdown === nav.label ? "rotate(180deg)" : "rotate(0deg)" }} />
                    </motion.div>
                  </Link>
                  <AnimatePresence>
                    {activeDropdown === nav.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }} transition={{ duration: 0.15 }}
                        onMouseEnter={() => openDD(nav.label)} onMouseLeave={closeDD}
                        style={{ position: "absolute", top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", width: "270px", padding: "0.65rem", borderRadius: "18px", background: "var(--dn-bg-card)", border: "1px solid var(--dn-border)", boxShadow: "0 20px 60px rgba(0,0,0,0.45)", backdropFilter: "blur(20px)", zIndex: 200 }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.35rem 0.65rem 0.65rem", borderBottom: "1px solid var(--dn-border)", marginBottom: "0.4rem" }}>
                          <span style={{ color: nav.color, fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{nav.label} Tools</span>
                          <Link to={nav.path} style={{ textDecoration: "none" }}><span style={{ color: nav.color, fontSize: "0.7rem", display: "flex", alignItems: "center", gap: "0.2rem" }}>View all <ArrowRight size={10} /></span></Link>
                        </div>
                        {tools.map((tool) => (
                          <Link key={tool.id} to={`/tools/${tool.id}`} style={{ textDecoration: "none" }}>
                            <motion.div whileHover={{ background: "var(--dn-bg-subtle)", x: 2 }} style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.5rem 0.65rem", borderRadius: "10px", cursor: "pointer", background: "rgba(0,0,0,0)", transition: "all 0.12s" }}>
                              <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: tool.iconGrad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <tool.icon size={13} color="#fff" />
                              </div>
                              <div>
                                <div style={{ color: "var(--dn-t1)", fontSize: "0.8rem", fontWeight: 600, lineHeight: 1.2 }}>{tool.label}</div>
                                <div style={{ color: "var(--dn-t4)", fontSize: "0.7rem" }}>{tool.outputFormat}</div>
                              </div>
                              {tool.badge && <span style={{ marginLeft: "auto", padding: "0.1rem 0.4rem", borderRadius: "999px", background: `${nav.color}20`, color: nav.color, fontSize: "0.6rem", fontWeight: 700 }}>{tool.badge}</span>}
                            </motion.div>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
            {[{ label: "All Tools", path: "/tools" }, { label: "About", path: "/about" }].map((link) => (
              <Link key={link.path} to={link.path} style={{ textDecoration: "none" }}>
                <motion.div whileHover={{ scale: 1.02 }} style={{ padding: "0.45rem 0.8rem", borderRadius: "10px", color: isActive(link.path) ? "var(--dn-t1)" : "var(--dn-nav-text)", background: isActive(link.path) ? "var(--dn-nav-active)" : "transparent", fontSize: "0.875rem", fontWeight: isActive(link.path) ? 600 : 500, transition: "all 0.15s", cursor: "pointer" }}>
                  {link.label}
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }} onClick={toggle} style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--dn-nav-pill)", border: "1px solid var(--dn-nav-border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--dn-nav-text)" }} aria-label="Toggle theme">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                  {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
            <Link to="/tools" className="dn-cta" style={{ textDecoration: "none" }}>
              <motion.div whileHover={{ scale: 1.04, boxShadow: "0 0 24px rgba(59,130,246,0.5)" }} whileTap={{ scale: 0.97 }} style={{ padding: "0.5rem 1.1rem", borderRadius: "10px", background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", color: "#fff", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em" }}>
                Get Started
              </motion.div>
            </Link>
            <motion.button whileTap={{ scale: 0.92 }} onClick={() => setMobileOpen(!mobileOpen)} className="dn-mobile-btn" style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--dn-nav-pill)", border: "1px solid var(--dn-nav-border)", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--dn-t1)" }}>
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 998, backdropFilter: "blur(4px)" }} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 32 }} style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(320px, 88vw)", background: "var(--dn-bg-card)", borderLeft: "1px solid var(--dn-border)", zIndex: 999, padding: "1.25rem 1.25rem 2rem", overflowY: "auto", fontFamily: "'Inter', sans-serif" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <span style={{ color: "var(--dn-t1)", fontWeight: 800, fontSize: "1.1rem" }}>Doc<span style={{ color: "#3b82f6" }}>Nova</span></span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMobileOpen(false)} style={{ background: "var(--dn-bg-subtle)", border: "1px solid var(--dn-border)", borderRadius: "8px", padding: "0.4rem", cursor: "pointer", color: "var(--dn-t1)", display: "flex" }}><X size={16} /></motion.button>
              </div>
              {NAV_LINKS.map((nav) => (
                <div key={nav.label} style={{ marginBottom: "1.25rem" }}>
                  <div style={{ color: nav.color, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem" }}>{nav.label}</div>
                  {getToolsByCategory(nav.label.toLowerCase() as ToolCategory).slice(0, 4).map((tool) => (
                    <Link key={tool.id} to={`/tools/${tool.id}`} style={{ textDecoration: "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem 0.4rem", borderRadius: "10px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: tool.iconGrad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><tool.icon size={13} color="#fff" /></div>
                        <span style={{ color: "var(--dn-t2)", fontSize: "0.84rem" }}>{tool.label}</span>
                      </div>
                    </Link>
                  ))}
                  <Link to={nav.path} style={{ textDecoration: "none" }}><div style={{ color: nav.color, fontSize: "0.76rem", padding: "0.25rem 0.4rem", display: "flex", alignItems: "center", gap: "0.2rem" }}>All {nav.label} <ArrowRight size={10} /></div></Link>
                </div>
              ))}
              <div style={{ borderTop: "1px solid var(--dn-border)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                {[{ label: "All Tools", path: "/tools" }, { label: "About", path: "/about" }, { label: "Contact", path: "/contact" }].map((link) => (
                  <Link key={link.path} to={link.path} style={{ textDecoration: "none" }}><div style={{ color: "var(--dn-t2)", fontSize: "0.9rem", padding: "0.6rem 0.4rem", borderRadius: "8px" }}>{link.label}</div></Link>
                ))}
                <button onClick={toggle} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 0.4rem", background: "none", border: "none", cursor: "pointer", color: "var(--dn-t3)", fontSize: "0.875rem", fontFamily: "'Inter', sans-serif", borderRadius: "8px" }}>
                  {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </button>
              </div>
              <Link to="/tools" style={{ textDecoration: "none", display: "block", marginTop: "1rem" }}>
                <div style={{ padding: "0.85rem", borderRadius: "12px", background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", color: "#fff", fontWeight: 700, textAlign: "center", fontSize: "0.9rem" }}>Get Started Free</div>
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
