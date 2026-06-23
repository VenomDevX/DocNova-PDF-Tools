import { useState, useRef } from "react";
import { Link } from "react-router";
import { motion, useInView } from "motion/react";
import { Search, ArrowRight, SlidersHorizontal } from "lucide-react";
import { toolsList, categories } from "../data/tools";
import type { ToolCategory } from "../data/tools";

export default function ToolsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | ToolCategory>("all");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const filtered = toolsList.filter(t => {
    const matchesSearch = t.label.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "all" || t.category === activeCategory;
    return matchesSearch && matchesCat;
  }).sort((a, b) => {
    if (a.category === "ai" && b.category !== "ai") return -1;
    if (a.category !== "ai" && b.category === "ai") return 1;
    return 0;
  });

  const catColors: Record<string, string> = {
    all: "#3b82f6", convert: "#3b82f6", organize: "#8b5cf6", edit: "#f59e0b", secure: "#ef4444", ocr: "#06b6d4",
  };

  return (
    <div style={{ position: "relative", color: "var(--dn-t1)", paddingTop: "100px", minHeight: "100vh", background: "var(--dn-bg)", transition: "var(--dn-transition)", fontFamily: "'Inter', sans-serif" }}>
      {/* Background Glow Effect */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: "1000px", height: "1000px", background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, rgba(37,99,235,0.02) 40%, transparent 70%)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "1400px", height: "800px", background: "radial-gradient(ellipse, rgba(59,130,246,0.04) 0%, transparent 60%)", filter: "blur(100px)" }} />
      </div>

      {/* Header */}
      <section style={{ position: "relative", zIndex: 1, padding: "2.5rem 1.5rem 3rem", textAlign: "center" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: "inline-block", padding: "0.3rem 0.85rem", borderRadius: "999px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#60a5fa", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
              {toolsList.length} Tools Available
            </div>
            <h1 style={{ fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "1rem", background: "linear-gradient(180deg,var(--dn-t1) 0%,var(--dn-t2) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Your document toolkit
            </h1>
            <p style={{ color: "var(--dn-t3)", fontSize: "1rem", lineHeight: 1.7 }}>{toolsList.length} powerful tools across {categories.length} categories. No watermarks. No sign-up. Free forever.</p>
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ marginTop: "1.75rem", position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--dn-t4)" }} />
            <input type="text" placeholder="Search tools..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: "0.875rem 1rem 0.875rem 2.75rem", borderRadius: "6px", background: "var(--dn-bg-input)", border: "1px solid var(--dn-border)", color: "var(--dn-t1)", fontSize: "0.95rem", outline: "none", fontFamily: "'Inter',sans-serif", transition: "border-color 0.2s", boxSizing: "border-box" }}
              onFocus={e => { e.target.style.borderColor = "rgba(59,130,246,0.5)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--dn-border)"; }} />
          </motion.div>

          {/* Category filters */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1rem", flexWrap: "wrap" }}>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id as any)}
                style={{ padding: "0.4rem 1rem", borderRadius: "999px", background: activeCategory === cat.id ? `${cat.color}20` : "var(--dn-bg-card)", border: activeCategory === cat.id ? `1px solid ${cat.color}40` : "1px solid var(--dn-border)", color: activeCategory === cat.id ? cat.color : "var(--dn-t3)", fontSize: "0.825rem", fontWeight: 500, cursor: "pointer", fontFamily: "'Inter',sans-serif", transition: "all 0.2s", boxShadow: "var(--dn-shadow)" }}>
                {cat.label}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section ref={ref} style={{ position: "relative", zIndex: 1, padding: "0 1.5rem 6rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--dn-t4)", padding: "4rem 0" }}>
              No tools found for "{search}"
            </div>
          ) : (
            <>
              <div style={{ color: "var(--dn-t4)", fontSize: "0.8rem", marginBottom: "1.25rem" }}>
                {filtered.length} tool{filtered.length !== 1 ? "s" : ""} {activeCategory !== "all" ? `in ${categories.find(c=>c.id===activeCategory)?.label}` : ""}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: "1rem" }}>
                {filtered.map((tool, i) => (
                  <motion.div key={tool.id} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.04, duration: 0.35 }} style={{ height: "100%" }}>
                    <Link to={`/tools/${tool.id}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                      <motion.div
                        whileHover={{ y: -5, scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="dn-card"
                        style={{ padding: "1.5rem", borderRadius: "6px", background: "var(--dn-bg-card)", border: "1px solid var(--dn-border)", cursor: "pointer", height: "100%", position: "relative", overflow: "hidden", boxShadow: "var(--dn-shadow)", transition: "border-color 0.2s", display: "flex", flexDirection: "column" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${tool.color}35`; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--dn-border)"; }}
                      >
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg,transparent,${tool.color}50,transparent)` }} />
                        <div style={{ position: "absolute", top: 0, right: 0, width: "80px", height: "80px", background: `radial-gradient(circle at top right,${tool.cardTint},transparent 70%)`, pointerEvents: "none" }} />
                        {tool.badge && <div style={{ position: "absolute", top: "1rem", right: "1rem", padding: "0.15rem 0.5rem", borderRadius: "999px", background: `${tool.color}20`, border: `1px solid ${tool.color}35`, color: tool.color, fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" }}>{tool.badge}</div>}
                        <div style={{ width: "44px", height: "44px", borderRadius: "6px", background: tool.iconGrad, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", boxShadow: `0 4px 14px ${tool.color}30` }}>
                          <tool.icon size={20} color="#fff" />
                        </div>
                        <div style={{ color: "var(--dn-t1)", fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.02em", marginBottom: "0.35rem" }}>{tool.label}</div>
                        <div style={{ color: "var(--dn-t4)", fontSize: "0.82rem", lineHeight: 1.65, marginBottom: "1.1rem", flexGrow: 1 }}>{tool.desc}</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                          <div style={{ padding: "0.3rem 0.8rem", borderRadius: "999px", background: `${tool.color}15`, border: `1px solid ${tool.color}25`, color: tool.color, fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            {tool.action} <ArrowRight size={11} />
                          </div>
                          <div style={{ color: "var(--dn-t4)", fontSize: "0.7rem" }}>{tool.accepts.split(",").slice(0, 2).join(" · ")}</div>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
