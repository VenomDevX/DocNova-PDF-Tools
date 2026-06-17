import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  Upload, Bot, User, Paperclip, Send, Lock,
  ShieldCheck, FileCheck, CheckCircle, Sun, Moon,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

/* ─── Navbar ──────────────────────────────────────────────── */
function AINavbar() {
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "Features", href: "#features", active: true },
    { label: "How It Works", href: "#how-it-works", active: false },
    { label: "Solutions", href: "#solutions", active: false },
    { label: "Pricing", href: "#pricing", active: false },
  ];

  return (
    <header
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 60, display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 2.5rem", maxWidth: 1280, margin: "0 auto",
        background: scrolled ? "var(--dn-nav-bg)" : "transparent",
        borderBottom: scrolled ? "1px solid var(--dn-nav-border)" : "1px solid transparent",
        backdropFilter: scrolled ? "blur(16px) saturate(180%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px) saturate(180%)" : "none",
        transition: "all 0.3s ease", fontFamily: "'Inter', sans-serif",
        boxShadow: scrolled ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <img src="/favicon.svg?v=6" alt="DocNova Logo" style={{ width: 32, height: 32, borderRadius: 8 }} />
        <span style={{ fontWeight: 700, fontSize: "1.25rem", color: "#2563eb", letterSpacing: "-0.02em" }}>DocNova</span>
      </Link>

      <nav style={{ display: "flex", alignItems: "center", gap: 24 }} className="dn-desktop">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            style={{
              textDecoration: "none", fontSize: "0.875rem", transition: "color 0.2s",
              color: l.active ? "#2563eb" : "var(--dn-t3)",
              fontWeight: l.active ? 600 : 400,
              borderBottom: l.active ? "2px solid #2563eb" : "2px solid transparent",
              padding: "1rem 0",
            }}
          >
            {l.label}
          </a>
        ))}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <motion.button
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
          onClick={toggle}
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: "var(--dn-nav-pill)", border: "1px solid var(--dn-nav-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--dn-nav-text)",
          }}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </motion.button>
        <Link to="/auth" style={{ textDecoration: "none" }} className="dn-desktop">
          <span style={{ color: "#2563eb", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}>Sign In</span>
        </Link>
        <Link to="/auth" style={{ textDecoration: "none" }}>
          <motion.div
            whileHover={{ scale: 1.04, boxShadow: "0 0 24px rgba(37,99,235,0.4)" }}
            whileTap={{ scale: 0.97 }}
            style={{
              height: 44, padding: "0 16px", background: "#2563eb", color: "#fff",
              fontWeight: 600, fontSize: "0.875rem", borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
          >
            Get Started
          </motion.div>
        </Link>
      </div>
    </header>
  );
}

/* ─── Chat Demo (Hero Right) ──────────────────────────────── */
function ChatDemo() {
  return (
    <div
      style={{
        width: "100%", borderRadius: 12, overflow: "hidden",
        background: "var(--dn-chat-glass-bg, rgba(255,255,255,0.9))",
        backdropFilter: "blur(10px)",
        border: "1px solid var(--dn-chat-glass-border, rgba(226,232,240,0.8))",
        boxShadow: "0 4px 6px -1px rgba(10,15,30,0.1), 0 2px 4px -2px rgba(10,15,30,0.05)",
        display: "flex", flexDirection: "column" as const, minHeight: 520,
      }}
    >
      {/* Browser chrome */}
      <div style={{
        height: 40, background: "var(--dn-bg-card)", borderBottom: "1px solid var(--dn-border)",
        display: "flex", alignItems: "center", padding: "0 16px", gap: 8,
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "rgba(186,26,26,0.8)" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "rgba(245,158,11,0.8)" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "rgba(16,185,129,0.8)" }} />
        </div>
        <div style={{
          marginLeft: 16, background: "var(--dn-bg-alt)", height: 24, borderRadius: 4,
          width: "50%", border: "1px solid var(--dn-border)",
          display: "flex", alignItems: "center", padding: "0 8px", gap: 4,
        }}>
          <Lock size={11} color="var(--dn-t4)" />
          <span style={{ fontSize: 10, color: "var(--dn-t4)" }}>app.docnova.ai/chat/patient-record</span>
        </div>
      </div>

      {/* Chat content */}
      <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column" as const, gap: 16, background: "var(--dn-bg)", overflowY: "auto" as const }}>
        {/* Bot message 1 */}
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", background: "#2563eb", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Bot size={16} />
          </div>
          <div style={{
            background: "var(--dn-bg-alt)", padding: 12, borderRadius: "0 12px 12px 12px",
            border: "1px solid var(--dn-border)", maxWidth: "85%", fontSize: 14, color: "var(--dn-t2)", lineHeight: 1.6,
          }}>
            I've analyzed the uploaded patient history (JohnDoe_MedRec_2023.pdf). What specific information are you looking for?
          </div>
        </div>

        {/* User message */}
        <div style={{ display: "flex", gap: 12, flexDirection: "row-reverse" as const }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", background: "var(--dn-bg-alt)", color: "var(--dn-t1)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            border: "1px solid var(--dn-border)",
          }}>
            <User size={16} />
          </div>
          <div style={{
            background: "#2563eb", color: "#fff", padding: 12, borderRadius: "12px 0 12px 12px",
            maxWidth: "85%", fontSize: 14, lineHeight: 1.6,
            boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
          }}>
            Summarize the cardiovascular history and list any prescribed medications.
          </div>
        </div>

        {/* Bot message 2 — detailed response */}
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", background: "#2563eb", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Bot size={16} />
          </div>
          <div style={{
            background: "var(--dn-bg-alt)", padding: 12, borderRadius: "0 12px 12px 12px",
            border: "1px solid var(--dn-border)", maxWidth: "85%", fontSize: 14, color: "var(--dn-t2)", lineHeight: 1.6,
          }}>
            <p style={{ fontWeight: 600, color: "#2563eb", marginBottom: 8 }}>Cardiovascular Summary:</p>
            <p style={{ marginBottom: 8 }}>Patient diagnosed with mild hypertension in 2021. Recent EKG (Oct 2023) shows normal sinus rhythm.</p>
            <div style={{
              background: "var(--dn-bg-card)", padding: 10, borderRadius: 8,
              border: "1px solid var(--dn-border)", marginBottom: 8,
            }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--dn-t3)", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 6 }}>
                Current Medications
              </p>
              <ul style={{ listStyle: "disc", paddingLeft: 16, fontSize: 12, color: "var(--dn-t2)" }}>
                <li style={{ marginBottom: 4 }}>Lisinopril 10mg - Daily</li>
                <li>Atorvastatin 20mg - Nightly</li>
              </ul>
            </div>
            <p style={{ fontSize: 10, color: "var(--dn-t4)", fontStyle: "italic" }}>Source: Page 4, Section 2.1</p>
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--dn-border)", position: "relative" as const }}>
        <div style={{ position: "relative" as const }}>
          <Paperclip size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--dn-t4)" }} />
          <input
            type="text"
            placeholder="Ask about this document..."
            style={{
              width: "100%", height: 44, paddingLeft: 40, paddingRight: 48,
              borderRadius: 10, border: "1px solid var(--dn-border)",
              background: "var(--dn-bg-card)", outline: "none",
              fontSize: 14, color: "var(--dn-t1)", fontFamily: "'Inter', sans-serif",
              transition: "border-color 0.2s",
            }}
          />
          <button style={{
            position: "absolute", right: 4, top: 4, bottom: 4, width: 32,
            background: "#2563eb", color: "#fff", borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "none", cursor: "pointer",
          }}>
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Hero Section ────────────────────────────────────────── */
function HeroSection() {
  return (
    <section
      style={{
        paddingTop: 120, paddingBottom: 32, minHeight: "80vh",
        maxWidth: 1280, margin: "0 auto",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24,
        alignItems: "center", padding: "120px 2.5rem 32px",
      }}
      className="ai-hero-grid"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16 }}
      >
        {/* Animated badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "4px 12px", borderRadius: 999,
          background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.18)",
        }}>
          <span style={{ position: "relative", display: "flex", width: 8, height: 8 }}>
            <span style={{
              position: "absolute", inset: 0, borderRadius: "50%", background: "#2563eb",
              opacity: 0.75, animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
            }} />
            <span style={{ position: "relative", width: 8, height: 8, borderRadius: "50%", background: "#2563eb" }} />
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", letterSpacing: "0.05em" }}>
            Public Beta Now Live
          </span>
        </div>

        <h1 style={{
          fontSize: "clamp(2.5rem, 5vw, 3rem)", fontWeight: 700,
          letterSpacing: "-0.02em", lineHeight: 1.17, color: "var(--dn-t1)",
        }}>
          Your Documents,<br />
          <span style={{ color: "#2563eb" }}>Finally Understood.</span>
        </h1>

        <p style={{
          fontSize: "1.125rem", lineHeight: 1.6, color: "var(--dn-t3)",
          maxWidth: 520,
        }}>
          Upload critical medical and administrative documents. Extract precise data, generate insights, and interact with your files securely using advanced AI.
        </p>

        <div style={{ display: "flex", gap: 8, paddingTop: 8, flexWrap: "wrap" as const }}>
          <Link to="/dashboard" style={{ textDecoration: "none" }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 0 30px rgba(37,99,235,0.4)" }}
              whileTap={{ scale: 0.97 }}
              style={{
                height: 44, padding: "0 24px", background: "#2563eb", color: "#fff",
                fontWeight: 600, fontSize: "1rem", borderRadius: 8, border: "none",
                display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                boxShadow: "0 2px 12px rgba(37,99,235,0.3)", fontFamily: "'Inter', sans-serif",
              }}
            >
              <Upload size={18} /> Upload Your First Doc
            </motion.button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              height: 44, padding: "0 24px",
              background: "var(--dn-bg-card)", color: "#2563eb",
              border: "1px solid var(--dn-border)", fontWeight: 600,
              fontSize: "1rem", borderRadius: 8, cursor: "pointer",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            View Demo
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <ChatDemo />
      </motion.div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────── */
function AIFooter() {
  const columns = [
    { title: "Product", links: ["Features", "API Documentation", "Pricing"] },
    { title: "Company", links: ["About Us", "Contact Support", "Status"] },
    { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Security"] },
  ];

  return (
    <footer style={{
      background: "var(--dn-footer-bg)", color: "var(--dn-footer-text)",
      fontSize: 14, marginTop: 32, borderTop: "1px solid var(--dn-footer-bd)",
      fontFamily: "'Inter', sans-serif", transition: "var(--dn-transition)",
    }}>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 24, padding: "2.5rem 2.5rem", maxWidth: 1280, margin: "0 auto",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--dn-footer-title)", marginBottom: 8 }}>
            DocNova
          </span>
          <p style={{ color: "var(--dn-footer-text)", maxWidth: 280, lineHeight: 1.7, fontSize: "0.875rem" }}>
            © 2024 DocNova AI. All rights reserved. Precision document intelligence.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h4 style={{
              fontWeight: 600, color: "var(--dn-footer-title)", marginBottom: 8,
              letterSpacing: "0.05em", textTransform: "uppercase" as const, fontSize: "0.75rem",
            }}>
              {col.title}
            </h4>
            {col.links.map((link) => {
              const routeMap: Record<string, string> = {
                "Features": "/tools",
                "Pricing": "/pricing",
                "About Us": "/about",
                "Contact Support": "/contact",
                "Privacy Policy": "/privacy",
                "Terms of Service": "/terms",
              };
              const route = routeMap[link];
              const linkStyle = { color: "var(--dn-footer-link)", textDecoration: "none", fontSize: "0.875rem", transition: "color 0.15s" } as const;
              return route ? (
                <Link key={link} to={route} style={linkStyle}>{link}</Link>
              ) : (
                <button
                  key={link}
                  type="button"
                  disabled
                  title="Coming soon"
                  style={{ ...linkStyle, background: "transparent", border: "none", padding: 0, textAlign: "left", opacity: 0.55, cursor: "not-allowed", display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  {link}
                  <span style={{ fontSize: "0.5rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", padding: "1px 4px", borderRadius: 3, background: "var(--dn-footer-icon-bg)", color: "var(--dn-footer-text)" }}>Soon</span>
                </button>
              );
            })}
            {col.title === "Legal" && (
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <ShieldCheck size={20} color="var(--dn-footer-text)" style={{ cursor: "pointer" }} />
                <FileCheck size={20} color="var(--dn-footer-text)" style={{ cursor: "pointer" }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </footer>
  );
}

/* ─── Page ─────────────────────────────────────────────────── */
export default function AIHomePage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "var(--dn-bg)", minHeight: "100vh", transition: "var(--dn-transition)" }}>
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .ai-hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: center;
        }
        @media (max-width: 860px) {
          .ai-hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <AINavbar />
      <HeroSection />
      <AIFooter />
    </div>
  );
}
