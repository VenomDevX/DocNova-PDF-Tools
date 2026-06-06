import { motion } from "motion/react";
import { Link } from "react-router";
import {
  Zap,
  Heart,
  Globe,
  Shield,
  Target,
  Users,
  ArrowRight,
} from "lucide-react";

const values = [
  { icon: Zap, title: "Speed First", desc: "Every millisecond matters. We engineer our tools to process documents as fast as possible." },
  { icon: Shield, title: "Privacy by Design", desc: "We never store your files beyond what's needed. Your data is yours — always." },
  { icon: Heart, title: "Made with Care", desc: "Every detail, every animation, every interaction is crafted with intention and love." },
  { icon: Globe, title: "Accessible to All", desc: "Great document tools shouldn't cost a fortune. Core features are free, forever." },
];

const team = [
  { name: "Alex Nova", role: "Founder & CEO", emoji: "🚀" },
  { name: "Sora Kim", role: "Head of Design", emoji: "🎨" },
  { name: "Dev Patel", role: "Lead Engineer", emoji: "⚡" },
  { name: "Mia Chen", role: "Product Lead", emoji: "✨" },
];

export default function AboutPage() {
  return (
    <div style={{ color: "var(--dn-t1)", paddingTop: "100px", minHeight: "100vh", background: "var(--dn-bg)", transition: "var(--dn-transition)" }}>
      {/* Hero */}
      <section style={{ padding: "3rem 1.5rem 5rem", textAlign: "center" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{
              display: "inline-block",
              padding: "0.35rem 0.9rem",
              borderRadius: "999px",
              background: "rgba(10,132,255,0.1)",
              border: "1px solid rgba(10,132,255,0.25)",
              color: "#5ac8fa",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "1.5rem",
            }}>
              Our Story
            </div>

            <h1 style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              marginBottom: "1.5rem",
              background: "linear-gradient(180deg, var(--dn-t1) 0%, var(--dn-t2) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Rethinking how the world works with documents
            </h1>

            <p style={{
              color: "var(--dn-t3)",
              fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
              lineHeight: 1.8,
              maxWidth: "620px",
              margin: "0 auto",
            }}>
              DocNova is a modern document utility platform designed to make PDF tasks fast, simple, and beautiful. We believe working with documents shouldn't be painful — it should be a delight.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section style={{ padding: "2rem 1.5rem 5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              padding: "3.5rem",
              borderRadius: "32px",
              background: "linear-gradient(135deg, rgba(10,132,255,0.1) 0%, rgba(90,200,250,0.05) 100%)",
              border: "1px solid rgba(10,132,255,0.2)",
              backdropFilter: "blur(20px)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "400px",
              height: "400px",
              background: "radial-gradient(circle at top right, rgba(10,132,255,0.12), transparent 60%)",
              pointerEvents: "none",
            }} />
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <Target size={24} color="#0a84ff" />
              <span style={{ color: "#5ac8fa", fontWeight: 600, fontSize: "0.875rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Our Mission
              </span>
            </div>
            <p style={{
              fontSize: "clamp(1.2rem, 3vw, 1.8rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.5,
              color: "var(--dn-t1)",
              maxWidth: "700px",
            }}>
              "To make professional-grade document tools accessible to everyone — fast, private, and beautifully simple."
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: "2rem 1.5rem 5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: "3rem" }}
          >
            <h2 style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              marginBottom: "0.5rem",
            }}>
              What we stand for
            </h2>
          </motion.div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.25rem",
          }}>
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                style={{
                  padding: "2rem",
                  borderRadius: "24px",
                  background: "var(--dn-bg-card)",
                  border: "1px solid var(--dn-border)",
                  transition: "var(--dn-transition)",
                }}
              >
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "rgba(10,132,255,0.12)",
                  border: "1px solid rgba(10,132,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}>
                  <v.icon size={22} color="#0a84ff" />
                </div>
                <h3 style={{ color: "var(--dn-t1)", fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
                  {v.title}
                </h3>
                <p style={{ color: "var(--dn-t3)", fontSize: "0.875rem", lineHeight: 1.7 }}>
                  {v.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: "2rem 1.5rem 5rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: "3rem" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center", marginBottom: "0.75rem" }}>
              <Users size={20} color="#0a84ff" />
              <span style={{ color: "#5ac8fa", fontWeight: 600, fontSize: "0.875rem" }}>The Team</span>
            </div>
            <h2 style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
            }}>
              Built by people who care
            </h2>
          </motion.div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
          }}>
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.03 }}
                style={{
                  padding: "2rem 1.5rem",
                  borderRadius: "20px",
                  background: "var(--dn-bg-card)",
                  border: "1px solid var(--dn-border)",
                  transition: "var(--dn-transition)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{member.emoji}</div>
                <div style={{ color: "var(--dn-t1)", fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.25rem" }}>
                  {member.name}
                </div>
                <div style={{ color: "var(--dn-t4)", fontSize: "0.8rem" }}>{member.role}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "2rem 1.5rem 6rem", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 style={{
              fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              marginBottom: "1rem",
            }}>
              Join us on the mission
            </h2>
            <p style={{ color: "var(--dn-t3)", marginBottom: "2rem", lineHeight: 1.7 }}>
              Millions of people trust DocNova every day. We're just getting started.
            </p>
            <Link to="/tools" style={{ textDecoration: "none" }}>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(10,132,255,0.4)" }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: "0.9rem 2rem",
                  borderRadius: "999px",
                  background: "linear-gradient(135deg, #0a84ff 0%, #5ac8fa 100%)",
                  color: "var(--dn-t1)",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                Try DocNova Free <ArrowRight size={18} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
