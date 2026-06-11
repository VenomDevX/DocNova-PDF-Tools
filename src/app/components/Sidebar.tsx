import { useState, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown, FileText, FileOutput, FileStack, PenLine, Lock, ScanLine,
  LayoutGrid, Info, Mail, Shield, BookOpen, PanelLeftClose, PanelLeftOpen, Plus,
} from "lucide-react";
import { getToolsByCategory, type ToolCategory } from "../data/tools";
import { useSidebar, SIDEBAR_W_EXPANDED, SIDEBAR_W_COLLAPSED } from "../context/SidebarContext";

const CATEGORIES = [
  { id: "convert" as ToolCategory, label: "Convert", icon: FileOutput, color: "#93c5fd" },
  { id: "organize" as ToolCategory, label: "Organize", icon: FileStack, color: "#c4b5fd" },
  { id: "edit" as ToolCategory, label: "Edit", icon: PenLine, color: "#fcd34d" },
  { id: "secure" as ToolCategory, label: "Secure", icon: Lock, color: "#fca5a5" },
  { id: "ocr" as ToolCategory, label: "OCR", icon: ScanLine, color: "#67e8f9" },
];

const NAV_LINKS = [
  { label: "All Tools", path: "/tools", icon: LayoutGrid },
  { label: "About", path: "/about", icon: Info },
  { label: "Contact", path: "/contact", icon: Mail },
  { label: "Privacy", path: "/privacy", icon: Shield },
  { label: "Terms", path: "/terms", icon: BookOpen },
];

const C = {
  base1: "#020817",
  base2: "#031226",
  base3: "#051B3A",
  activeBg: "#0B3A7A",
  hoverBg: "rgba(37,99,235,0.18)",
  accent: "#1E40AF",
  glow: "rgba(30,64,175,0.28)",
  text: "#F8FAFC",
  muted: "#93A4C7",
  divider: "rgba(255,255,255,0.055)",
  scrollThumb: "#1D4ED8",
  scrollHover: "rgba(37,99,235,0.75)",
  btnGrad: "linear-gradient(135deg,#0B3A7A 0%,#1E40AF 100%)",
  btnShadow: "0 2px 12px rgba(11,58,122,0.6)",
};

const scrollbarId = "dn-sb-scroll";

export function Sidebar() {
  const location = useLocation();
  const { collapsed, toggle: toggleCollapsed } = useSidebar();

  const [expanded, setExpanded] = useState<string | null>(() => {
    const seg = location.pathname.split("/")[1];
    return ["convert", "organize", "edit", "secure", "ocr"].includes(seg) ? seg : "convert";
  });

  const [glow, setGlow] = useState({ x: "50%", y: "30%" });
  const sidebarRef = useRef<HTMLElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = sidebarRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = `${((e.clientX - rect.left) / rect.width) * 100}%`;
    const y = `${((e.clientY - rect.top) / rect.height) * 100}%`;
    setGlow({ x, y });
  }, []);

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id);
  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const width = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED;

  const sidebarBg = `
    radial-gradient(circle at ${glow.x} ${glow.y}, ${C.glow}, transparent 32%),
    linear-gradient(180deg, ${C.base1} 0%, ${C.base2} 45%, ${C.base3} 100%)
  `;

  return (
    <>
      <style>{`
        #${scrollbarId}::-webkit-scrollbar { width: 5px; }
        #${scrollbarId}::-webkit-scrollbar-track { background: transparent; }
        #${scrollbarId}::-webkit-scrollbar-thumb {
          background: ${C.scrollThumb};
          border-radius: 999px;
        }
        #${scrollbarId}::-webkit-scrollbar-thumb:hover { background: ${C.scrollHover}; }
        #${scrollbarId} { scrollbar-width: thin; scrollbar-color: ${C.scrollThumb} transparent; }

        .dn-sb-item {
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .dn-sb-item:hover {
          background: ${C.hoverBg} !important;
        }
        .dn-sb-item-active {
          background: ${C.activeBg} !important;
          box-shadow: 0 1px 8px rgba(11,58,122,0.55);
        }
        .dn-sb-btn:hover { filter: brightness(1.12); }
        .dn-sb-toggle:hover { background: rgba(255,255,255,0.08) !important; }
      `}</style>

      <aside
        ref={sidebarRef}
        onMouseMove={handleMouseMove}
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0, width: `${width}px`,
          background: sidebarBg,
          borderRight: `1px solid ${C.divider}`,
          display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 100,
          fontFamily: "'Inter', sans-serif",
          transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Header */}
        <div style={{
          padding: collapsed ? "0.875rem 0.5rem 0.75rem" : "1rem 1rem 0.875rem",
          borderBottom: `1px solid ${C.divider}`,
          flexShrink: 0,
          display: "flex", flexDirection: "column",
          gap: "0.625rem",
        }}>
          {collapsed ? (
            /* ── Collapsed: logo icon centered, toggle below it ── */
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
              <Link to="/" title="DocNova" style={{ textDecoration: "none" }}>
                <img src="/logo.svg" alt="DocNova" style={{ width: 28, height: 28 }} />
              </Link>
              <button
                onClick={toggleCollapsed}
                aria-label="Expand sidebar"
                title="Expand sidebar"
                className="dn-sb-toggle"
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  color: C.muted, width: "28px", height: "28px", borderRadius: "6px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.15s",
                }}
              >
                <PanelLeftOpen size={15} />
              </button>
            </div>
          ) : (
            /* ── Expanded: logo + text row, then subtitle ── */
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", minHeight: "28px" }}>
                <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem", overflow: "hidden", flex: 1 }}>
                  <img src="/logo.svg" alt="DocNova logo" style={{ width: 24, height: 24, flexShrink: 0 }} />
                  <span style={{ color: C.text, fontWeight: 700, fontSize: "1.02rem", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
                    Doc<span style={{ color: "#60A5FA" }}>Nova</span>
                  </span>
                </Link>
                <button
                  onClick={toggleCollapsed}
                  aria-label="Collapse sidebar"
                  title="Collapse sidebar"
                  className="dn-sb-toggle"
                  style={{
                    background: "transparent", border: "none", cursor: "pointer",
                    color: C.muted, width: "28px", height: "28px", borderRadius: "6px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.15s", flexShrink: 0,
                  }}
                >
                  <PanelLeftClose size={15} />
                </button>
              </div>
              <p style={{ color: C.muted, fontSize: "0.67rem", margin: 0, paddingLeft: "0.125rem", opacity: 0.55 }}>
                AI Document Intelligence
              </p>
            </>
          )}

          <Link to="/tools" style={{ textDecoration: "none" }} title="Upload Document">
            <div
              className="dn-sb-btn"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: collapsed ? 0 : "0.4rem",
                padding: collapsed ? "0.5rem" : "0.55rem 0.75rem",
                borderRadius: "6px",
                background: C.btnGrad, color: "#fff",
                fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                boxShadow: C.btnShadow,
                transition: "filter 0.15s",
                whiteSpace: "nowrap", overflow: "hidden",
              }}
            >
              <Plus size={collapsed ? 16 : 13} strokeWidth={2.5} />
              {!collapsed && <span>Upload Document</span>}
            </div>
          </Link>
        </div>

        {/* Scrollable tools list */}
        <div id={scrollbarId} style={{ padding: collapsed ? "0.625rem 0.4rem 0.5rem" : "0.75rem 0.5rem 0.5rem", flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {!collapsed && (
            <div style={{ color: C.muted, fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 0.5rem", marginBottom: "0.4rem", opacity: 0.5 }}>
              Tools
            </div>
          )}

          {CATEGORIES.map(cat => {
            const tools = getToolsByCategory(cat.id);
            const isOpen = !collapsed && expanded === cat.id;
            const catActive = location.pathname === `/${cat.id}` || tools.some(t => location.pathname === `/tools/${t.id}`);

            if (collapsed) {
              return (
                <Link key={cat.id} to={`/${cat.id}`} style={{ textDecoration: "none" }} title={cat.label}>
                  <div
                    className={`dn-sb-item${catActive ? " dn-sb-item-active" : ""}`}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: "100%", height: "36px", marginBottom: "4px",
                      borderRadius: "6px", cursor: "pointer",
                      background: catActive ? C.activeBg : "transparent",
                      borderLeft: `2px solid ${catActive ? cat.color : "transparent"}`,
                    }}
                  >
                    <cat.icon size={16} color={catActive ? "#fff" : C.muted} />
                  </div>
                </Link>
              );
            }

            return (
              <div key={cat.id} style={{ marginBottom: "2px" }}>
                <div
                  className={`dn-sb-item${catActive && !isOpen ? " dn-sb-item-active" : ""}`}
                  onClick={() => toggle(cat.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.55rem",
                    padding: "0.5rem 0.55rem",
                    paddingLeft: catActive ? "calc(0.55rem - 2px)" : "0.55rem",
                    borderRadius: "6px", cursor: "pointer",
                    background: catActive && !isOpen ? C.activeBg : "transparent",
                    borderLeft: catActive ? `2px solid ${cat.color}` : "2px solid transparent",
                  }}
                >
                  <cat.icon size={14} color={catActive ? "#fff" : C.muted} />
                  <span style={{ flex: 1, color: catActive ? C.text : C.muted, fontSize: "0.79rem", fontWeight: catActive ? 600 : 500 }}>
                    {cat.label}
                  </span>
                  <ChevronDown
                    size={12}
                    color={C.muted}
                    style={{ transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", opacity: 0.7 }}
                  />
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{ paddingLeft: "0.625rem", paddingTop: "0.125rem", paddingBottom: "0.25rem" }}>
                        {tools.map(tool => {
                          const active = location.pathname === `/tools/${tool.id}`;
                          return (
                            <Link key={tool.id} to={`/tools/${tool.id}`} style={{ textDecoration: "none" }}>
                              <div
                                className={`dn-sb-item${active ? " dn-sb-item-active" : ""}`}
                                style={{
                                  display: "flex", alignItems: "center", gap: "0.5rem",
                                  padding: "0.34rem 0.5rem",
                                  paddingLeft: active ? "calc(0.5rem - 2px)" : "0.5rem",
                                  borderRadius: "6px", cursor: "pointer",
                                  background: active ? C.activeBg : "transparent",
                                  borderLeft: active ? `2px solid ${cat.color}` : "2px solid transparent",
                                  marginBottom: "1px",
                                }}
                              >
                                <div style={{ width: "18px", height: "18px", borderRadius: "6px", background: tool.iconGrad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  <tool.icon size={9} color="#fff" />
                                </div>
                                <span style={{ color: active ? C.text : C.muted, fontSize: "0.73rem", fontWeight: active ? 600 : 400, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.4 }}>
                                  {tool.shortLabel || tool.label}
                                </span>
                                {tool.badge && (
                                  <span style={{ padding: "0.05rem 0.3rem", borderRadius: "999px", background: "rgba(255,255,255,0.1)", color: cat.color, fontSize: "0.52rem", fontWeight: 700, flexShrink: 0 }}>
                                    {tool.badge}
                                  </span>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Bottom nav */}
        <div style={{ borderTop: `1px solid ${C.divider}`, padding: collapsed ? "0.5rem 0.4rem" : "0.5rem 0.5rem" }}>
          {NAV_LINKS.map(link => {
            const active = isActive(link.path);
            if (collapsed) {
              return (
                <Link key={link.path} to={link.path} style={{ textDecoration: "none" }} title={link.label}>
                  <div
                    className={`dn-sb-item${active ? " dn-sb-item-active" : ""}`}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: "100%", height: "32px", marginBottom: "2px",
                      borderRadius: "6px", cursor: "pointer",
                      background: active ? C.activeBg : "transparent",
                    }}
                  >
                    <link.icon size={14} color={active ? "#fff" : C.muted} />
                  </div>
                </Link>
              );
            }
            return (
              <Link key={link.path} to={link.path} style={{ textDecoration: "none" }}>
                <div
                  className={`dn-sb-item${active ? " dn-sb-item-active" : ""}`}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.55rem",
                    padding: "0.42rem 0.55rem",
                    paddingLeft: active ? "calc(0.55rem - 2px)" : "0.55rem",
                    borderRadius: "6px",
                    background: active ? C.activeBg : "transparent",
                    borderLeft: active ? `2px solid ${C.muted}` : "2px solid transparent",
                    marginBottom: "1px", cursor: "pointer",
                  }}
                >
                  <link.icon size={13} color={active ? "#fff" : C.muted} />
                  <span style={{ color: active ? C.text : C.muted, fontSize: "0.74rem", fontWeight: active ? 600 : 500 }}>
                    {link.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}
