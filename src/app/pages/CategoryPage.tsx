import { useRef } from "react";
import { Link, useLocation } from "react-router";
import { motion, useInView } from "motion/react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { toolsList, categoryMeta, type ToolCategory } from "../data/tools";

export default function CategoryPage() {
  const location = useLocation();
  const catId = location.pathname.slice(1) as ToolCategory;
  const meta = categoryMeta[catId];
  const tools = toolsList.filter(t => t.category === catId);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  if (!meta) return null;

  return (
    <div style={{ color: "var(--dn-t1)", paddingTop: "100px", minHeight: "100vh", background: "var(--dn-bg)", transition: "var(--dn-transition)", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <section style={{ padding: "3rem 1.5rem 4rem", position: "relative", overflow: "hidden" }}>
        {/* Bg glow */}
        <div style={{ position: "absolute", top: "-100px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "400px", borderRadius: "50%", background: `radial-gradient(circle,${meta.cardTint.replace("0.1", "0.15")},transparent 60%)`, pointerEvents: "none", filter: "blur(40px)" }} />
        <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative" }}>
          <Link to="/tools" style={{ textDecoration: "none" }}>
            <motion.div whileHover={{ x: -3 }} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--dn-t3)", fontSize: "0.85rem", marginBottom: "2rem", cursor: "pointer" }}>
              <ArrowLeft size={15} /> All Tools
            </motion.div>
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.32rem 0.85rem", borderRadius: "999px", background: `${meta.color}15`, border: `1px solid ${meta.color}30`, color: meta.color, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1.25rem" }}>
              {tools.length} Tools Available
            </div>
            <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.08, marginBottom: "1rem", background: "linear-gradient(180deg, var(--dn-t1) 0%, var(--dn-t2) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {meta.label}
            </h1>
            <p style={{ color: "var(--dn-t3)", fontSize: "clamp(0.95rem, 2vw, 1.1rem)", lineHeight: 1.75, maxWidth: "600px" }}>{meta.desc}</p>
          </motion.div>
        </div>
      </section>

      {/* Tools Grid */}
      <section ref={ref} style={{ padding: "0 1.5rem 6rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.1rem" }}>
            {tools.map((tool, i) => (
              <motion.div key={tool.id} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.07, duration: 0.4 }}>
                <Link to={`/tools/${tool.id}`} style={{ textDecoration: "none" }}>
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{ padding: "1.75rem", borderRadius: "22px", background: "var(--dn-bg-card)", border: "1px solid var(--dn-border)", cursor: "pointer", position: "relative", overflow: "hidden", boxShadow: "var(--dn-shadow)", transition: "border-color 0.2s, box-shadow 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${tool.color}35`; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px ${tool.color}15`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--dn-border)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--dn-shadow)"; }}
                  >
                    {/* Accents */}
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg,transparent,${tool.color}50,transparent)` }} />
                    <div style={{ position: "absolute", top: 0, right: 0, width: "100px", height: "100px", background: `radial-gradient(circle at top right,${tool.cardTint},transparent 70%)`, pointerEvents: "none" }} />

                    {tool.badge && (
                      <div style={{ position: "absolute", top: "1.25rem", right: "1.25rem", padding: "0.18rem 0.55rem", borderRadius: "999px", background: `${tool.color}20`, border: `1px solid ${tool.color}35`, color: tool.color, fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>{tool.badge}</div>
                    )}

                    {/* Icon */}
                    <div style={{ width: "52px", height: "52px", borderRadius: "15px", background: tool.iconGrad, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem", boxShadow: `0 6px 20px ${tool.color}35` }}>
                      <tool.icon size={24} color="#fff" />
                    </div>

                    <div style={{ color: "var(--dn-t1)", fontWeight: 700, fontSize: "1.05rem", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>{tool.label}</div>
                    <div style={{ color: "var(--dn-t4)", fontSize: "0.84rem", lineHeight: 1.7, marginBottom: "1.25rem" }}>{tool.desc}</div>

                    {/* Meta row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                      <div style={{ padding: "0.35rem 0.9rem", borderRadius: "999px", background: `${tool.color}15`, border: `1px solid ${tool.color}25`, color: tool.color, fontSize: "0.78rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        {tool.action} <ArrowRight size={11} />
                      </div>
                      <div style={{ color: "var(--dn-t4)", fontSize: "0.72rem" }}>
                        {tool.accepts.split(",").slice(0, 3).join(" · ")}
                      </div>
                    </div>

                    {/* Backend lib note */}
                    {tool.backendLib && (
                      <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--dn-border)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: tool.color, opacity: 0.6 }} />
                        <span style={{ color: "var(--dn-t4)", fontSize: "0.68rem" }}>Powered by {tool.backendLib}</span>
                      </div>
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
