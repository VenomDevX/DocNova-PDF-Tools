import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { motion, useInView, AnimatePresence } from "motion/react";
import {
  ArrowRight, Zap, Shield, Globe,
  Star, ChevronDown, FileStack, Upload, Settings, Download,
  ScanLine, Lock, FileOutput, PenLine,
  Users, Award, TrendingUp, Sparkles, FileText, Play, Send,
} from "lucide-react";
import { toolsList } from "../data/tools";
import { useTheme } from "../context/ThemeContext";
import imgAv1 from "figma:asset/93f15aeb02c5db6cd3584f99d115307bd7e4b724.png";
import imgAv2 from "figma:asset/f4b93e25139ee747624d991e495aea194707b6bf.png";
import imgAv3 from "figma:asset/fa207388222ec9a1da4cf5633c6508b1873db9a5.png";

/* ── App Mockup (right side of hero) ─────────────────────── */
function AppMockup() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "490px" }}>
      <div style={{ borderRadius: "6px", background: "var(--dn-bg-card)", border: "1px solid var(--dn-border2)", boxShadow: "var(--dn-shadow)", overflow: "hidden" }}>
        {/* Header bar */}
        <div style={{ background: "var(--dn-bg-card)", borderBottom: "1px solid var(--dn-border2)", height: "40px", display: "flex", alignItems: "center", padding: "0 1rem", gap: "0.375rem" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ffdad6" }} />
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#dbe1ff" }} />
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "var(--dn-border2)" }} />
        </div>
        {/* Body */}
        <div style={{ display: "flex", height: "380px" }}>
          {/* Sidebar */}
          <div style={{ width: "180px", background: "var(--dn-bg-card)", borderRight: "1px solid var(--dn-border2)", padding: "1rem", flexShrink: 0 }}>
            <div style={{ color: "var(--dn-t3)", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.625rem" }}>Documents</div>
            {/* Active file */}
            <div style={{ background: isDark ? "rgba(37,99,235,0.12)" : "rgba(37,99,235,0.06)", borderRadius: "6px", padding: "0.5rem 0.625rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem", borderLeft: "2px solid #2563eb" }}>
              <FileText size={11} color={isDark ? "#60a5fa" : "#2563eb"} />
              <span style={{ color: "var(--dn-t1)", fontSize: "0.75rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Q3_Report.pdf</span>
            </div>
            <div style={{ padding: "0.5rem 0.625rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FileText size={11} color="var(--dn-t3)" />
              <span style={{ color: "var(--dn-t3)", fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Contract_24.docx</span>
            </div>
            <div style={{ padding: "0.5rem 0.625rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FileText size={11} color="var(--dn-t3)" />
              <span style={{ color: "var(--dn-t3)", fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Invoice_Oct.pdf</span>
            </div>
          </div>
          {/* Main chat panel */}
          <div style={{ flex: 1, background: "var(--dn-bg-subtle)", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, padding: "1rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {/* User message */}
              <div style={{ background: "var(--dn-bg-card)", borderRadius: "6px", border: "1px solid var(--dn-border2)", padding: "0.875rem", fontSize: "0.8rem", color: "var(--dn-t1)", lineHeight: 1.5, boxShadow: "var(--dn-shadow)", marginLeft: "15%" }}>
                Can you summarize the total revenue for Q3 based on this report?
              </div>
              {/* AI response */}
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", marginRight: "5%" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Sparkles size={14} color="#fff" />
                </div>
                <div style={{ background: isDark ? "rgba(37,99,235,0.15)" : "#dbe1ff", borderRadius: "6px", border: `1px solid ${isDark ? "rgba(59,130,246,0.3)" : "#b4c5ff"}`, padding: "0.875rem", fontSize: "0.78rem", color: isDark ? "#f8fafc" : "#1e3a8a", lineHeight: 1.55, boxShadow: "var(--dn-shadow)" }}>
                  <div style={{ marginBottom: "0.5rem" }}>Based on the Q3_Report.pdf, the total consolidated revenue for Q3 2023 was <strong>$4.2 million</strong>, representing an 18% increase year-over-year.</div>
                  <div style={{ background: "var(--dn-bg-card)", border: "1px solid var(--dn-border2)", borderRadius: "6px", padding: "0.35rem 0.6rem", fontSize: "0.7rem", color: "var(--dn-t3)", display: "inline-block" }}>
                    Source: Page 4, Paragraph 2
                  </div>
                </div>
              </div>
            </div>
            {/* Input */}
            <div style={{ padding: "0.75rem", borderTop: "1px solid var(--dn-border2)" }}>
              <div style={{ background: "var(--dn-bg-card)", border: "1px solid var(--dn-border2)", borderRadius: "6px", display: "flex", alignItems: "center", padding: "0.6rem 0.75rem", gap: "0.5rem" }}>
                <span style={{ color: "var(--dn-t3)", fontSize: "0.78rem", flex: 1 }}>Ask a question about this document...</span>
                <Send size={14} color="#2563eb" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Hero ─────────────────────────────────────────────────── */
function HeroSection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  /* Reset failure state when theme changes so the new video can try to load */
  useEffect(() => {
    setVideoFailed(false);
  }, [theme]);

  /* Ensure autoplay works across browsers */
  useEffect(() => {
    if (videoRef.current && !videoFailed) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        /* Autoplay blocked — fallback to static background */
      });
    }
  }, [theme, videoFailed]);

  const videoSrc = isDark ? "/videos/dark-hero-bg.mp4" : "/videos/light-hero-bg.mp4";

  return (
    <section style={{
      position: "relative",
      /* Pull up behind the 60px fixed navbar */
      marginTop: "-60px",
      paddingTop: "0",
      minHeight: "calc(100vh)",
      display: "flex", alignItems: "center",
      overflow: "hidden",
      background: isDark ? "#0a0e1a" : "#f0f4ff",
      transition: "var(--dn-transition)",
    }}>
      {/* ── Theme-aware video background ────────────────── */}
      {!videoFailed && (
        <>
          <video
            ref={videoRef}
            key={theme} /* Force remount on theme change for clean source swap */
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onError={() => setVideoFailed(true)}
            style={{
              position: "absolute",
              top: 0, left: 0,
              width: "100%", height: "100%",
              objectFit: "cover",
              zIndex: 0,
              pointerEvents: "none",
              opacity: isDark ? 0.55 : 0.4,
            }}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
          {/* Overlay for text readability — different gradient per theme */}
          <div style={{
            position: "absolute",
            top: 0, left: 0,
            width: "100%", height: "100%",
            background: isDark
              ? "linear-gradient(180deg, rgba(10,14,26,0.72) 0%, rgba(10,14,26,0.55) 40%, rgba(10,14,26,0.78) 100%)"
              : "linear-gradient(180deg, rgba(240,244,255,0.78) 0%, rgba(240,244,255,0.55) 40%, rgba(240,244,255,0.82) 100%)",
            zIndex: 1,
            pointerEvents: "none",
          }} />
        </>
      )}

      <style>{`
        @keyframes glowPulse{0%,100%{box-shadow:0 0 20px rgba(37,99,235,0.18)}50%{box-shadow:0 0 44px rgba(37,99,235,0.38)}}
        .hero-2col{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;max-width:1280px;margin:0 auto;width:100%}
        .hero-right{display:block}
        @media(max-width:900px){.hero-2col{grid-template-columns:1fr!important;gap:3rem}.hero-right{display:none!important}}
      `}</style>

      {/* ── Hero content (above video) ─────────────────── */}
      <div className="hero-2col" style={{
        position: "relative",
        zIndex: 2,
        /* Restore the original content padding; extra top to compensate for margin-top pull */
        padding: "156px 2rem 80px",
      }}>
        {/* Left */}
        <div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.9rem", borderRadius: "6px", background: isDark ? "rgba(37,99,235,0.15)" : "#dbe1ff", border: isDark ? "1px solid rgba(59,130,246,0.3)" : "1px solid #b4c5ff", color: isDark ? "#93bbff" : "#00174b", fontSize: "0.73rem", fontWeight: 600, marginBottom: "1.5rem", letterSpacing: "0.04em" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2563eb" }} />
              Now in Public Beta · 38 Free PDF Tools
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }}
            style={{ fontSize: "clamp(2.6rem,5vw,3.75rem)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.12, marginBottom: "1.25rem", color: "var(--dn-t1)" }}>
            Your Documents,<br />Finally Understood.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.16 }}
            style={{ color: "var(--dn-t3)", fontSize: "1rem", lineHeight: 1.7, maxWidth: "460px", marginBottom: "2rem" }}>
            Convert, merge, split, compress, edit, and secure PDFs instantly. No registration. No watermarks. No limits.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.22 }} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
            <Link to="/tools" style={{ textDecoration: "none" }}>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.75rem 1.5rem", borderRadius: "6px", background: "#2563eb", color: "#fff", fontWeight: 500, fontSize: "0.8rem", letterSpacing: "0.045em", textTransform: "uppercase", cursor: "pointer", animation: "glowPulse 3s ease-in-out infinite" }}>
                <Upload size={14} /> Upload Your First Doc
              </motion.div>
            </Link>
            <Link to="/tools" style={{ textDecoration: "none" }}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.75rem 1.5rem", borderRadius: "6px", background: isDark ? "rgba(255,255,255,0.06)" : "var(--dn-bg-input)", border: isDark ? "1px solid rgba(255,255,255,0.18)" : "1px solid var(--dn-t3)", color: isDark ? "rgba(255,255,255,0.85)" : "var(--dn-t3)", fontWeight: 500, fontSize: "0.8rem", letterSpacing: "0.045em", textTransform: "uppercase", cursor: "pointer" }}>
                <Play size={12} fill="currentColor" /> See a Live Demo
              </motion.div>
            </Link>
          </motion.div>
          {/* Trust strip */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid var(--dn-border)", paddingTop: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {[imgAv1, imgAv2, imgAv3].map((src, i) => (
                <div key={i} style={{ width: "32px", height: "32px", borderRadius: "6px", overflow: "hidden", border: "2px solid var(--dn-bg)", marginRight: i < 2 ? "-10px" : 0, position: "relative", zIndex: 3 - i }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
              <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: "var(--dn-border2)", border: "2px solid var(--dn-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--dn-t2)", fontSize: "0.72rem", fontWeight: 500 }}>+</div>
            </div>
            <span style={{ color: "var(--dn-t3)", fontSize: "0.8rem" }}>Trusted by 2,400+ teams</span>
          </motion.div>
        </div>

        {/* Right — App Mockup */}
        <motion.div className="hero-right" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <AppMockup />
        </motion.div>
      </div>

      {/* Stats bar */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        className="dn-card"
        style={{ position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: 0, borderRadius: "6px", background: isDark ? "rgba(15,20,35,0.85)" : "var(--dn-bg-card)", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid var(--dn-border2)", overflow: "hidden", boxShadow: "var(--dn-shadow)", whiteSpace: "nowrap", zIndex: 2, backdropFilter: isDark ? "blur(12px)" : "none" }}>
        {[{ val: "38+", label: "Tools" }, { val: "∞", label: "Files" }, { val: "$0", label: "Cost" }, { val: "1 hr", label: "Auto-delete" }].map((s, i) => (
          <div key={s.val} style={{ padding: "0.875rem 1.5rem", textAlign: "center", borderRight: i < 3 ? `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "var(--dn-border)"}` : "none" }}>
            <div style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.04em", background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.val}</div>
            <div style={{ fontSize: "0.65rem", color: "var(--dn-t4)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: "0.1rem" }}>{s.label}</div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

/* ── Figma-style 3-col Feature Intro ─────────────────────── */
function DocumentIntelligenceSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const features = [
    {
      bg: "#dee1f7", icon: FileOutput, iconColor: "#161b2b",
      title: "Document Q&A",
      desc: "Ask complex questions and receive exact, cited answers directly from your document's text. No hallucinations, just facts.",
    },
    {
      bg: "#00788c", icon: FileStack, iconColor: "#d7f6ff",
      title: "Multi-Document Analysis",
      desc: "Cross-reference thousands of pages instantly. Synthesize information across contracts, reports, and emails in a single query.",
    },
    {
      bg: "#dbe1ff", icon: ScanLine, iconColor: "#00174b",
      title: "Smart Extraction",
      desc: "Automatically pull key entities, dates, clauses, and financial figures into structured formats like CSV or JSON.",
    },
  ];
  return (
    <section ref={ref} style={{ padding: "6rem 2rem", background: "var(--dn-bg-alt)", borderTop: "1px solid var(--dn-border)", transition: "var(--dn-transition)" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.4rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--dn-t1)", marginBottom: "0.875rem" }}>Clinical-Grade Document Intelligence</h2>
          <p style={{ color: "var(--dn-t3)", fontSize: "1rem", maxWidth: "560px", margin: "0 auto", lineHeight: 1.65 }}>
            Engineered for precision, security, and speed. Transform unstructured data into actionable insights instantly.
          </p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "1.5rem" }}>
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }}>
              <div className="dn-card" style={{ background: "var(--dn-bg-card)", border: "1px solid var(--dn-border2)", borderRadius: "6px", padding: "1.5rem", boxShadow: "var(--dn-shadow)", height: "100%" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "6px", background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                  <f.icon size={20} color={f.iconColor} />
                </div>
                <div style={{ color: "var(--dn-t1)", fontWeight: 600, fontSize: "1.05rem", letterSpacing: "-0.02em", marginBottom: "0.6rem" }}>{f.title}</div>
                <div style={{ color: "var(--dn-t2)", fontSize: "0.875rem", lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Categories ───────────────────────────────────────────── */
function CategoriesSection() {
  const cats = [
    { path: "/convert", label: "Convert PDF", desc: "PDF ↔ Word, Excel, PPT, Images", color: "#3b82f6", grad: "linear-gradient(135deg,#1e3a8a,#2563eb)", count: 11, icon: FileOutput },
    { path: "/organize", label: "Organize PDF", desc: "Merge, Split, Rotate, Compress", color: "#8b5cf6", grad: "linear-gradient(135deg,#2e1065,#6d28d9)", count: 9, icon: FileStack },
    { path: "/edit", label: "Edit PDF", desc: "Annotate, Watermark, Redact", color: "#f59e0b", grad: "linear-gradient(135deg,#451a03,#b45309)", count: 10, icon: PenLine },
    { path: "/secure", label: "Secure PDF", desc: "Lock, Unlock, Encrypt, Protect", color: "#ef4444", grad: "linear-gradient(135deg,#450a0a,#dc2626)", count: 6, icon: Lock },
    { path: "/ocr", label: "OCR Tools", desc: "AI text from PDFs & images", color: "#06b6d4", grad: "linear-gradient(135deg,#083344,#0891b2)", count: 2, icon: ScanLine },
  ];
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <section ref={ref} style={{ padding: "5rem 2rem", background: "var(--dn-bg)", transition: "var(--dn-transition)" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "inline-block", padding: "0.3rem 0.875rem", borderRadius: "6px", background: "#dbe1ff", border: "1px solid #b4c5ff", color: "#1d4ed8", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>Tool Categories</div>
          <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.4rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--dn-t1)", marginBottom: "0.75rem" }}>Everything you need for PDFs</h2>
          <p style={{ color: "var(--dn-t3)", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>38 professional tools across 5 categories. No watermarks. No limits.</p>
        </motion.div>
        <div className="category-grid">
          {cats.map((cat, i) => (
            <motion.div key={cat.path} initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.07 }} style={{ height: "100%" }}>
              <Link to={cat.path} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                <motion.div whileHover={{ y: -4 }}
                  className="dn-card"
                  style={{ display: "flex", flexDirection: "column", height: "100%", padding: "1.5rem", borderRadius: "6px", background: "var(--dn-bg-card)", border: "1px solid var(--dn-border2)", cursor: "pointer", boxShadow: "var(--dn-shadow)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = cat.color; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--dn-border2)"; }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "6px", background: cat.grad, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", flexShrink: 0 }}>
                    <cat.icon size={22} color="#fff" />
                  </div>
                  <div style={{ color: "var(--dn-t1)", fontWeight: 600, fontSize: "0.95rem", letterSpacing: "-0.02em", marginBottom: "0.3rem", flexShrink: 0 }}>{cat.label}</div>
                  <div style={{ flex: 1, color: "var(--dn-t4)", fontSize: "0.78rem", lineHeight: 1.5, marginBottom: "0.875rem" }}>{cat.desc}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", flexShrink: 0 }}>
                    <span style={{ padding: "0.2rem 0.6rem", borderRadius: "999px", background: `${cat.color}14`, color: cat.color, fontSize: "0.68rem", fontWeight: 600 }}>{cat.count} tools</span>
                    <ArrowRight size={13} color={cat.color} />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Popular Tools ────────────────────────────────────────── */
function PopularToolsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const displayed = toolsList.filter(t => t.popular || t.badge).slice(0, 12);
  return (
    <section ref={ref} style={{ padding: "5rem 2rem", background: "var(--dn-bg-alt)", transition: "var(--dn-transition)" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "inline-block", padding: "0.3rem 0.875rem", borderRadius: "6px", background: "#dbe1ff", border: "1px solid #b4c5ff", color: "#1d4ed8", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>Most Used</div>
          <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.4rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--dn-t1)", marginBottom: "0.75rem" }}>Popular tools</h2>
          <p style={{ color: "var(--dn-t3)", fontSize: "0.95rem", lineHeight: 1.7 }}>The most used tools by millions of users every day.</p>
        </motion.div>
        <div className="popular-grid">
          {displayed.map((tool, i) => (
            <motion.div key={tool.id} initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.06 }} style={{ height: "100%" }}>
              <Link to={`/tools/${tool.id}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                <motion.div whileHover={{ y: -4 }}
                  className="dn-card"
                  style={{ display: "flex", flexDirection: "column", height: "100%", padding: "1.5rem", borderRadius: "6px", background: "var(--dn-bg-card)", border: "1px solid var(--dn-border2)", cursor: "pointer", position: "relative", overflow: "hidden", boxShadow: "var(--dn-shadow)", transition: "border-color 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = tool.color; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--dn-border2)"; }}>
                  {tool.badge && <div style={{ position: "absolute", top: "1rem", right: "1rem", padding: "0.12rem 0.45rem", borderRadius: "999px", background: `${tool.color}18`, border: `1px solid ${tool.color}30`, color: tool.color, fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase" }}>{tool.badge}</div>}
                  <div style={{ width: "48px", height: "48px", borderRadius: "6px", background: tool.iconGrad, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", flexShrink: 0 }}>
                    <tool.icon size={22} color="#fff" />
                  </div>
                  <div style={{ color: "var(--dn-t1)", fontWeight: 600, fontSize: "0.95rem", letterSpacing: "-0.02em", marginBottom: "0.3rem", flexShrink: 0 }}>{tool.label}</div>
                  <div style={{ flex: 1, color: "var(--dn-t3)", fontSize: "0.82rem", lineHeight: 1.65, marginBottom: "1rem" }}>{tool.desc}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", flexShrink: 0 }}>
                    <span style={{ padding: "0.25rem 0.7rem", borderRadius: "999px", background: `${tool.color}14`, color: tool.color, fontSize: "0.72rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      {tool.action} <ArrowRight size={9} />
                    </span>
                    <span style={{ color: "var(--dn-t4)", fontSize: "0.68rem" }}>{tool.accepts.split(",").slice(0, 2).join(", ")}</span>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }} style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link to="/tools" style={{ textDecoration: "none" }}>
            <motion.div whileHover={{ scale: 1.02 }} className="dn-card" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 1.75rem", borderRadius: "6px", background: "var(--dn-bg-card)", border: "1px solid var(--dn-border2)", color: "var(--dn-t2)", fontWeight: 500, cursor: "pointer", fontSize: "0.85rem", boxShadow: "var(--dn-shadow)" }}>
              View all 38 tools <ArrowRight size={14} />
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ── How It Works ─────────────────────────────────────────── */
function HowItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const steps = [
    { num: "01", icon: Upload, title: "Upload your file", desc: "Drag & drop or click to select. Supports PDF, DOCX, XLSX, PPTX, JPG, PNG, WEBP and more.", color: "#3b82f6" },
    { num: "02", icon: Settings, title: "Choose your tool", desc: "Select from 38 tools. Configure settings like page range, password, OCR language, or output format.", color: "#8b5cf6" },
    { num: "03", icon: Download, title: "Download instantly", desc: "Processing happens in seconds. Download your file immediately. Files are auto-deleted after 1 hour.", color: "#06b6d4" },
  ];
  return (
    <section ref={ref} style={{ padding: "5rem 2rem", background: "var(--dn-bg)", transition: "var(--dn-transition)" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div style={{ display: "inline-block", padding: "0.3rem 0.875rem", borderRadius: "6px", background: "#dbe1ff", border: "1px solid #b4c5ff", color: "#1d4ed8", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>How it works</div>
          <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.4rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--dn-t1)" }}>Three steps to done</h2>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "1.5rem" }}>
          {steps.map((step, i) => (
            <motion.div key={step.num} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.12 }}>
              <div className="dn-card" style={{ padding: "2rem", borderRadius: "6px", background: "var(--dn-bg-card)", border: "1px solid var(--dn-border2)", position: "relative", overflow: "hidden", boxShadow: "var(--dn-shadow)" }}>
                <div style={{ position: "absolute", top: "-0.5rem", right: "1rem", fontSize: "5.5rem", fontWeight: 900, color: "var(--dn-border)", letterSpacing: "-0.05em", lineHeight: 1, userSelect: "none" }}>{step.num}</div>
                <div style={{ width: "48px", height: "48px", borderRadius: "6px", background: `${step.color}14`, border: `1px solid ${step.color}28`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                  <step.icon size={22} color={step.color} />
                </div>
                <div style={{ color: "var(--dn-t1)", fontWeight: 600, fontSize: "1.05rem", letterSpacing: "-0.02em", marginBottom: "0.6rem" }}>{step.title}</div>
                <div style={{ color: "var(--dn-t3)", fontSize: "0.875rem", lineHeight: 1.75 }}>{step.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Why DocNova ──────────────────────────────────────────── */
function WhySection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const features = [
    { icon: Zap, title: "Lightning Fast", desc: "Optimized processing engine delivers results in seconds. Batch conversion included.", color: "#f59e0b", bg: "#fef3c7" },
    { icon: Shield, title: "Privacy First", desc: "Files are processed in isolated environments and permanently deleted after 1 hour.", color: "#22c55e", bg: "#dcfce7" },
    { icon: Globe, title: "Works Everywhere", desc: "No installation. No plugins. Works on Mac, Windows, iOS, and Android browsers.", color: "#3b82f6", bg: "#dbeafe" },
    { icon: Award, title: "No Watermarks", desc: "All core tools are free with zero watermarks, no hidden fees, no registration walls.", color: "#8b5cf6", bg: "#ede9fe" },
    { icon: TrendingUp, title: "38+ Tools", desc: "The most comprehensive PDF toolkit. Convert, organize, edit, secure, and OCR.", color: "#06b6d4", bg: "#cffafe" },
    { icon: Users, title: "Trusted by Millions", desc: "Over 5 million people use DocNova every month for their document workflows.", color: "#f472b6", bg: "#fce7f3" },
  ];
  return (
    <section ref={ref} style={{ padding: "5rem 2rem", background: "var(--dn-bg-alt)", borderTop: "1px solid var(--dn-border)", transition: "var(--dn-transition)" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "inline-block", padding: "0.3rem 0.875rem", borderRadius: "6px", background: "#dbe1ff", border: "1px solid #b4c5ff", color: "#1d4ed8", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>Why DocNova</div>
          <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.4rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--dn-t1)", marginBottom: "0.75rem" }}>Built different. Built better.</h2>
          <p style={{ color: "var(--dn-t3)", fontSize: "0.95rem", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>DocNova isn't just another PDF tool. It's the complete document platform for modern workflows.</p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1rem" }}>
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.08 }}>
              <motion.div whileHover={{ y: -3 }}
                className="dn-card"
                style={{ padding: "1.5rem", borderRadius: "6px", background: "var(--dn-bg-card)", border: "1px solid var(--dn-border2)", boxShadow: "var(--dn-shadow)" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "6px", background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                  <f.icon size={20} color={f.color} />
                </div>
                <div style={{ color: "var(--dn-t1)", fontWeight: 600, fontSize: "1rem", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>{f.title}</div>
                <div style={{ color: "var(--dn-t3)", fontSize: "0.875rem", lineHeight: 1.7 }}>{f.desc}</div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ─────────────────────────────────────────── */
function TestimonialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const testimonials = [
    { name: "Sarah K.", role: "Freelance Designer", text: "DocNova replaced 5 different PDF tools I was paying for. The quality is incredible and it's free.", stars: 5 },
    { name: "Marcus T.", role: "Legal Assistant", text: "The PDF lock, unlock and redact tools are exactly what I need for confidential legal documents.", stars: 5 },
    { name: "Priya M.", role: "Student", text: "OCR on scanned textbook pages is a game-changer. Converts in seconds and the text is perfect.", stars: 5 },
    { name: "James R.", role: "Project Manager", text: "Merge and compress PDFs daily. No file size limits, no watermarks. DocNova is essential.", stars: 5 },
    { name: "Aiko N.", role: "UX Researcher", text: "The UI is gorgeous — actually enjoyable to use. Something no other PDF tool has managed.", stars: 5 },
    { name: "Carlos B.", role: "Teacher", text: "I use Word to PDF and PDF to Word constantly for lesson materials. Flawless conversion every time.", stars: 5 },
  ];
  return (
    <section ref={ref} style={{ padding: "5rem 2rem", background: "var(--dn-bg)", transition: "var(--dn-transition)" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "inline-block", padding: "0.3rem 0.875rem", borderRadius: "6px", background: "#dbe1ff", border: "1px solid #b4c5ff", color: "#1d4ed8", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>Testimonials</div>
          <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.4rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--dn-t1)" }}>Loved by millions</h2>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1rem" }}>
          {testimonials.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.07 }}>
              <div className="dn-card" style={{ padding: "1.5rem", borderRadius: "6px", background: "var(--dn-bg-card)", border: "1px solid var(--dn-border2)", boxShadow: "var(--dn-shadow)" }}>
                <div style={{ display: "flex", gap: "0.2rem", marginBottom: "0.75rem" }}>
                  {Array.from({ length: t.stars }).map((_, j) => <Star key={j} size={13} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <div style={{ color: "var(--dn-t2)", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1rem" }}>"{t.text}"</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.82rem" }}>{t.name[0]}</div>
                  <div>
                    <div style={{ color: "var(--dn-t1)", fontWeight: 600, fontSize: "0.82rem" }}>{t.name}</div>
                    <div style={{ color: "var(--dn-t4)", fontSize: "0.7rem" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ──────────────────────────────────────────────────── */
function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const faqs = [
    { q: "Is DocNova really free?", a: "Yes. All core tools — convert, merge, split, compress, rotate — are free with zero watermarks and no registration required." },
    { q: "Are my files safe and private?", a: "Files are uploaded over 256-bit SSL, processed in isolated temporary environments, and permanently deleted within 1 hour. We never read, store, or share your documents." },
    { q: "What file formats are supported?", a: "PDF, DOCX, DOC, XLSX, XLS, PPTX, PPT, JPG, JPEG, PNG, and WEBP. Each tool accepts formats relevant to its function." },
    { q: "Is there a file size limit?", a: "Free tier supports files up to 100MB. For larger files or batch processing, a Pro plan is planned for the future." },
    { q: "Do I need to install anything?", a: "No. DocNova works entirely in your browser. No downloads, no plugins, no accounts needed." },
    { q: "How accurate is the OCR?", a: "We use Tesseract OCR with AI preprocessing. For clearly scanned documents accuracy typically exceeds 98%. 50+ languages supported." },
    { q: "Can I use DocNova on mobile?", a: "Yes. DocNova is fully responsive and works on iOS Safari, Android Chrome, and all modern mobile browsers." },
  ];
  return (
    <section ref={ref} style={{ padding: "5rem 2rem", background: "var(--dn-bg-alt)", transition: "var(--dn-transition)" }}>
      <div style={{ maxWidth: "780px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "inline-block", padding: "0.3rem 0.875rem", borderRadius: "6px", background: "#dbe1ff", border: "1px solid #b4c5ff", color: "#1d4ed8", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>FAQ</div>
          <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.4rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--dn-t1)" }}>Common questions</h2>
        </motion.div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.05 }}>
              <div onClick={() => setOpen(open === i ? null : i)}
                className="dn-card"
                style={{ padding: "1.125rem 1.25rem", borderRadius: "6px", background: "var(--dn-bg-card)", border: `1px solid ${open === i ? "#b4c5ff" : "var(--dn-border2)"}`, cursor: "pointer", boxShadow: "var(--dn-shadow)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                  <span style={{ color: "var(--dn-t1)", fontWeight: 600, fontSize: "0.9rem" }}>{faq.q}</span>
                  <ChevronDown size={16} color="var(--dn-t4)" style={{ flexShrink: 0, transition: "transform 0.25s", transform: open === i ? "rotate(180deg)" : "rotate(0)" }} />
                </div>
                <AnimatePresence>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: "hidden" }}>
                      <div style={{ paddingTop: "0.75rem", color: "var(--dn-t3)", fontSize: "0.875rem", lineHeight: 1.75 }}>{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA ──────────────────────────────────────────────────── */
function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <section ref={ref} style={{ padding: "5rem 2rem", background: "var(--dn-bg)", transition: "var(--dn-transition)" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.45 }}>
          <div style={{ padding: "3rem 3.5rem", borderRadius: "6px", background: "var(--dn-cta-bg)", border: "1px solid var(--dn-cta-border)", boxShadow: "var(--dn-cta-shad)", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)", width: "280px", height: "280px", borderRadius: "50%", background: "var(--dn-cta-blob)", filter: "blur(60px)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.35rem 0.875rem", borderRadius: "6px", background: "#dbe1ff", border: "1px solid #b4c5ff", color: "#1d4ed8", fontSize: "0.72rem", fontWeight: 600, marginBottom: "1.5rem" }}>
                <Sparkles size={11} /> Ready to get started?
              </div>
              <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 700, letterSpacing: "-0.04em", color: "var(--dn-t1)", marginBottom: "1rem", lineHeight: 1.15 }}>
                Start working smarter<br />with your documents.
              </h2>
              <p style={{ color: "var(--dn-t3)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "2rem", maxWidth: "440px", margin: "0 auto 2rem" }}>
                Join millions of users who trust DocNova. No sign up. No credit card. No limits.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link to="/tools" style={{ textDecoration: "none" }}>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    style={{ padding: "0.75rem 1.75rem", borderRadius: "6px", background: "#2563eb", color: "#fff", fontWeight: 500, fontSize: "0.8rem", letterSpacing: "0.045em", textTransform: "uppercase", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                    Start for Free <ArrowRight size={15} />
                  </motion.div>
                </Link>
                <Link to="/about" style={{ textDecoration: "none" }}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{ padding: "0.75rem 1.5rem", borderRadius: "6px", background: "var(--dn-bg-subtle)", border: "1px solid var(--dn-border2)", color: "var(--dn-t2)", fontWeight: 500, fontSize: "0.8rem", letterSpacing: "0.045em", textTransform: "uppercase", cursor: "pointer" }}>
                    Learn more
                  </motion.div>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "var(--dn-bg)", transition: "var(--dn-transition)" }}>
      <HeroSection />
      <DocumentIntelligenceSection />
      <CategoriesSection />
      <PopularToolsSection />
      <HowItWorksSection />
      <WhySection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}
