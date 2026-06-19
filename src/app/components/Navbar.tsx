import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon, Search, Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { categories, getToolsByCategory, ToolCategory } from "../data/tools";

const MAIN_LINKS = [
  { label: "All Tools", path: "/tools", type: "link" },
  { label: "Convert", type: "dropdown", category: "convert" as ToolCategory },
  { label: "Organize", type: "dropdown", category: "organize" as ToolCategory },
  { label: "Edit", type: "dropdown", category: "edit" as ToolCategory },
  { label: "OCR", type: "dropdown", category: "ocr" as ToolCategory },
  { label: "Secure", type: "dropdown", category: "secure" as ToolCategory },
  { label: "Pricing", path: "/pricing", type: "link" },
  { label: "About", path: "/about", type: "link" },
  { label: "Contact", path: "/contact", type: "link" },
];

function DropdownMenu({ category, label, isActive }: { category: ToolCategory, label: string, isActive: boolean }) {
  const tools = getToolsByCategory(category);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="dn-nav-dropdown-wrapper"
      style={{ position: "relative", height: "100%", display: "flex", alignItems: "center" }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div style={{ 
        padding: "0 0.875rem", 
        height: "60px", 
        display: "flex", 
        alignItems: "center",
        gap: "4px",
        cursor: "pointer"
      }}>
        <span style={{ 
          color: isActive ? "#2563eb" : "var(--dn-nav-text)", 
          fontWeight: isActive ? 600 : 500, 
          fontSize: "0.85rem", 
          transition: "color 0.15s" 
        }}>{label}</span>
        <ChevronDown size={14} style={{ color: isActive ? "#2563eb" : "var(--dn-t3)", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none" }} />
        {isActive && <div style={{ position: "absolute", bottom: 0, left: "0.875rem", right: "0.875rem", height: "2px", background: "#2563eb", borderRadius: "2px 2px 0 0" }} />}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "280px",
              background: "var(--dn-bg-card)",
              border: "1px solid var(--dn-border)",
              borderRadius: "6px",
              padding: "0.5rem",
              boxShadow: "0 10px 40px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05)",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              gap: "2px"
            }}
          >
            {tools.map(t => (
              <Link key={t.id} to={`/tools/${t.id}`} style={{ textDecoration: "none" }} onClick={() => setIsOpen(false)}>
                <motion.div
                  whileHover={{ backgroundColor: "var(--dn-bg-subtle)" }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "6px",
                    transition: "background 0.15s"
                  }}
                >
                  <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: t.iconGrad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <t.icon size={12} color="#fff" />
                  </div>
                  <span style={{ color: "var(--dn-t1)", fontSize: "0.85rem", fontWeight: 500 }}>{t.label}</span>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileAccordion({ item, closeMenu }: { item: any, closeMenu: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isActive = location.pathname.includes(item.category);

  if (item.type === "link") {
    return (
      <Link to={item.path} style={{ textDecoration: "none" }} onClick={closeMenu}>
        <div style={{ padding: "1rem", borderBottom: "1px solid var(--dn-border2)", color: "var(--dn-t1)", fontWeight: 500 }}>
          {item.label}
        </div>
      </Link>
    );
  }

  const tools = getToolsByCategory(item.category);

  return (
    <div style={{ borderBottom: "1px solid var(--dn-border2)" }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", color: isActive ? "#2563eb" : "var(--dn-t1)", fontWeight: isActive ? 600 : 500, cursor: "pointer" }}
      >
        {item.label}
        <ChevronDown size={18} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden", background: "var(--dn-bg-subtle)" }}
          >
            {tools.map(t => (
              <Link key={t.id} to={`/tools/${t.id}`} style={{ textDecoration: "none" }} onClick={closeMenu}>
                <div style={{ padding: "0.75rem 1rem 0.75rem 2rem", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "4px", background: t.iconGrad, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <t.icon size={10} color="#fff" />
                  </div>
                  <span style={{ color: "var(--dn-t2)", fontSize: "0.9rem" }}>{t.label}</span>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Navbar() {
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileMenuOpen]);

  const isActive = (path?: string, cat?: string) => {
    if (path && (location.pathname === path || location.pathname.startsWith(path + "/"))) return true;
    if (cat && location.pathname.includes(cat)) return true;
    return false;
  };

  const isDark = theme === "dark";

  const isAIToolsPage = location.pathname.startsWith("/ai-tools");

  /* At the top of any page: fully transparent so the navbar blends with the
     page background (no solid bar). On AI tools: always transparent. Once the
     user scrolls, a subtle blurred/theme background kicks in for readability. */
  void isHomePage;
  const heroTransparent = isAIToolsPage ? true : !scrolled;

  return (
    <>
      <nav style={{
        height: "60px",
        background: "transparent",
        borderBottom: heroTransparent
          ? "1px solid transparent"
          : `1px solid ${scrolled ? "var(--dn-nav-border)" : "transparent"}`,
        boxShadow: heroTransparent ? "none" : (scrolled ? "0 1px 3px rgba(0,0,0,0.06)" : "none"),
        backdropFilter: heroTransparent ? "none" : "blur(20px) saturate(180%)",
        WebkitBackdropFilter: heroTransparent ? "none" : "blur(20px) saturate(180%)",
        transition: "background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, backdrop-filter 0.25s ease",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
      }}>
        {/* Left — Spacer to guarantee perfect mathematical centering */}
        <div style={{ flex: "1 1 0%", display: "flex", alignItems: "center" }}>
        </div>

        {/* Center — Main nav items (Desktop only) */}
        <div className="dn-desktop-nav" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem", height: "100%" }}>
          {MAIN_LINKS.map((link, idx) => {
            if (link.type === "dropdown") {
              return <DropdownMenu key={idx} category={link.category!} label={link.label} isActive={isActive(undefined, link.category)} />;
            }
            const active = isActive(link.path);
            return (
              <Link key={idx} to={link.path!} style={{ textDecoration: "none" }}>
                <div style={{ position: "relative", padding: "0 0.875rem", height: "60px", display: "flex", alignItems: "center" }}>
                  <span style={{ color: active ? "#2563eb" : "var(--dn-nav-text)", fontWeight: active ? 600 : 500, fontSize: "0.85rem", transition: "color 0.15s" }}>{link.label}</span>
                  {active && <div style={{ position: "absolute", bottom: 0, left: "0.875rem", right: "0.875rem", height: "2px", background: "#2563eb", borderRadius: "2px 2px 0 0" }} />}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Right actions */}
        <div style={{ flex: "1 1 0%", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.25rem" }}>
          <motion.button whileTap={{ scale: 0.92 }} aria-label="Search"
            style={{ width: "36px", height: "36px", borderRadius: "6px", background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--dn-nav-text)" }}>
            <Search size={16} />
          </motion.button>

          <motion.button whileTap={{ scale: 0.92 }} onClick={toggle} aria-label="Toggle theme"
            style={{ width: "36px", height: "36px", borderRadius: "6px", background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--dn-nav-text)" }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          <div className="dn-desktop-nav" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <Link to="/auth" style={{ textDecoration: "none", marginLeft: "0.25rem" }}>
              <div style={{ padding: "0.45rem 1rem", height: "34px", display: "flex", alignItems: "center", borderRadius: "6px", color: "var(--dn-nav-text)", fontWeight: 500, fontSize: "0.85rem", cursor: "pointer", transition: "color 0.15s", whiteSpace: "nowrap" }}>
                Sign In
              </div>
            </Link>
            <Link to="/auth" style={{ textDecoration: "none" }}>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{ padding: "0.45rem 1.1rem", height: "34px", display: "flex", alignItems: "center", borderRadius: "6px", background: "#2563eb", color: "#fff", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", boxShadow: "0 2px 8px rgba(37,99,235,0.3)", whiteSpace: "nowrap" }}>
                Get Started
              </motion.div>
            </Link>
          </div>

          <motion.button 
            className="dn-mobile-nav" 
            whileTap={{ scale: 0.92 }} 
            onClick={() => setMobileMenuOpen(true)}
            style={{ width: "36px", height: "36px", borderRadius: "6px", background: "transparent", border: "none", display: "none", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--dn-nav-text)" }}
          >
            <Menu size={20} />
          </motion.button>
        </div>
      </nav>

      <style>{`
        @media (max-width: 1024px) {
          .dn-desktop-nav { display: none !important; }
          .dn-mobile-nav { display: flex !important; }
        }
      `}</style>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "var(--dn-bg)",
              zIndex: 999,
              display: "flex",
              flexDirection: "column",
              fontFamily: "'Inter', sans-serif"
            }}
          >
            <div style={{ height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem", borderBottom: "1px solid var(--dn-border2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <img src="/logo.svg" alt="DocNova Logo" style={{ width: "24px", height: "24px" }} />
                <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--dn-t1)", letterSpacing: "-0.01em" }}>DocNova</span>
              </div>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(false)}
                style={{ width: "36px", height: "36px", borderRadius: "6px", background: "var(--dn-bg-subtle)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--dn-t1)" }}
              >
                <X size={20} />
              </motion.button>
            </div>
            
            <div style={{ flex: 1, overflowY: "auto" }}>
              {MAIN_LINKS.map((link, idx) => (
                <MobileAccordion key={idx} item={link} closeMenu={() => setMobileMenuOpen(false)} />
              ))}
              
              <div style={{ padding: "2rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <Link to="/auth" style={{ textDecoration: "none" }} onClick={() => setMobileMenuOpen(false)}>
                  <div style={{ padding: "0.75rem", borderRadius: "6px", background: "var(--dn-bg-subtle)", color: "var(--dn-t1)", fontWeight: 600, textAlign: "center", border: "1px solid var(--dn-border)" }}>
                    Sign In
                  </div>
                </Link>
                <Link to="/auth" style={{ textDecoration: "none" }} onClick={() => setMobileMenuOpen(false)}>
                  <div style={{ padding: "0.75rem", borderRadius: "6px", background: "#2563eb", color: "#fff", fontWeight: 600, textAlign: "center", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}>
                    Get Started Free
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
