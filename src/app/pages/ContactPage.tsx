import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, MessageSquare, Send, CheckCircle2, MapPin, Clock } from "lucide-react";

const inputStyle = {
  width: "100%",
  padding: "0.875rem 1rem",
  borderRadius: "6px",
  background: "var(--dn-bg-input)",
  border: "1px solid var(--dn-border)",
  color: "var(--dn-t1)",
  fontSize: "0.95rem",
  outline: "none",
  fontFamily: "'Inter', sans-serif",
  transition: "border-color 0.2s",
};

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    /* BACKEND INTEGRATION POINT: POST form data to /api/contact */
    await new Promise((r) => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div style={{ color: "var(--dn-t1)", paddingTop: "100px", minHeight: "100vh", background: "var(--dn-bg)", transition: "var(--dn-transition)" }}>
      <section style={{ padding: "3rem 1.5rem 6rem" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: "center", marginBottom: "3.5rem" }}
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
              marginBottom: "1.25rem",
            }}>
              Get in Touch
            </div>
            <h1 style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              marginBottom: "1rem",
            }}>
              We'd love to hear from you
            </h1>
            <p style={{ color: "var(--dn-t3)", fontSize: "1rem", lineHeight: 1.7 }}>
              Have a question, feedback, or partnership idea? We're all ears.
            </p>
          </motion.div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: "2rem",
            alignItems: "start",
          }} className="contact-grid">
            {/* Info sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <style>{`
                @media (max-width: 768px) {
                  .contact-grid { grid-template-columns: 1fr !important; }
                }
              `}</style>

              {[
                { icon: Mail, label: "Email", value: "hello@docnova.app" },
                { icon: MessageSquare, label: "Support", value: "support@docnova.app" },
                { icon: Clock, label: "Response Time", value: "Within 24 hours" },
                { icon: MapPin, label: "HQ", value: "India" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.875rem",
                    padding: "1.25rem",
                    borderRadius: "6px",
                    background: "var(--dn-bg-card)",
                    border: "1px solid var(--dn-border)",
                    transition: "var(--dn-transition)",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "6px",
                    background: "rgba(10,132,255,0.12)",
                    border: "1px solid rgba(10,132,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <item.icon size={16} color="#0a84ff" />
                  </div>
                  <div>
                    <div style={{ color: "var(--dn-t4)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.2rem" }}>
                      {item.label}
                    </div>
                    <div style={{ color: "var(--dn-t1)", fontSize: "0.875rem", fontWeight: 500 }}>
                      {item.value}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div style={{
                padding: "2.5rem",
                borderRadius: "6px",
                background: "var(--dn-bg-card)",
                border: "1px solid var(--dn-border)",
                backdropFilter: "blur(20px)",
                transition: "var(--dn-transition)",
              }}>
                <AnimatePresence mode="wait">
                  {sent ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{ textAlign: "center", padding: "3rem 2rem" }}
                    >
                      <div style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "50%",
                        background: "rgba(48,209,88,0.1)",
                        border: "1px solid rgba(48,209,88,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1.5rem",
                      }}>
                        <CheckCircle2 size={32} color="#30d158" />
                      </div>
                      <h3 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "0.75rem" }}>
                        Message sent!
                      </h3>
                      <p style={{ color: "var(--dn-t3)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                        Thanks for reaching out. We'll get back to you within 24 hours.
                      </p>
                      <button
                        onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                        style={{
                          marginTop: "1.5rem",
                          padding: "0.6rem 1.5rem",
                          borderRadius: "999px",
                          background: "var(--dn-border)",
                          border: "1px solid var(--dn-border2)",
                          color: "var(--dn-t2)",
                          cursor: "pointer",
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "0.875rem",
                        }}
                      >
                        Send another message
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
                    >
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                          <label style={{ display: "block", color: "var(--dn-t3)", fontSize: "0.8rem", marginBottom: "0.5rem", fontWeight: 500 }}>
                            Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            required
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Your name"
                            style={inputStyle}
                            onFocus={(e) => { e.target.style.borderColor = "rgba(10,132,255,0.5)"; }}
                            onBlur={(e) => { e.target.style.borderColor = "var(--dn-border)"; }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", color: "var(--dn-t3)", fontSize: "0.8rem", marginBottom: "0.5rem", fontWeight: 500 }}>
                            Email *
                          </label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@email.com"
                            style={inputStyle}
                            onFocus={(e) => { e.target.style.borderColor = "rgba(10,132,255,0.5)"; }}
                            onBlur={(e) => { e.target.style.borderColor = "var(--dn-border)"; }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: "block", color: "var(--dn-t3)", fontSize: "0.8rem", marginBottom: "0.5rem", fontWeight: 500 }}>
                          Subject *
                        </label>
                        <select
                          name="subject"
                          required
                          value={form.subject}
                          onChange={handleChange}
                          style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
                          onFocus={(e) => { e.target.style.borderColor = "rgba(10,132,255,0.5)"; }}
                          onBlur={(e) => { e.target.style.borderColor = "var(--dn-border)"; }}
                        >
                          <option value="" style={{ background: "var(--dn-bg-alt)" }}>Select a subject...</option>
                          <option value="general" style={{ background: "var(--dn-bg-alt)" }}>General Inquiry</option>
                          <option value="support" style={{ background: "var(--dn-bg-alt)" }}>Technical Support</option>
                          <option value="feedback" style={{ background: "var(--dn-bg-alt)" }}>Feature Request</option>
                          <option value="partnership" style={{ background: "var(--dn-bg-alt)" }}>Partnership</option>
                          <option value="other" style={{ background: "var(--dn-bg-alt)" }}>Other</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: "block", color: "var(--dn-t3)", fontSize: "0.8rem", marginBottom: "0.5rem", fontWeight: 500 }}>
                          Message *
                        </label>
                        <textarea
                          name="message"
                          required
                          rows={5}
                          value={form.message}
                          onChange={handleChange}
                          placeholder="Tell us how we can help..."
                          style={{ ...inputStyle, resize: "vertical", minHeight: "130px" }}
                          onFocus={(e) => { e.target.style.borderColor = "rgba(10,132,255,0.5)"; }}
                          onBlur={(e) => { e.target.style.borderColor = "var(--dn-border)"; }}
                        />
                      </div>

                      <motion.button
                        type="submit"
                        disabled={sending}
                        whileHover={!sending ? { scale: 1.02, boxShadow: "0 0 30px rgba(10,132,255,0.4)" } : {}}
                        whileTap={!sending ? { scale: 0.98 } : {}}
                        style={{
                          padding: "0.9rem 2rem",
                          borderRadius: "6px",
                          background: sending
                            ? "rgba(10,132,255,0.4)"
                            : "linear-gradient(135deg, #0a84ff 0%, #5ac8fa 100%)",
                          color: "#fff",
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 700,
                          fontSize: "1rem",
                          border: "none",
                          cursor: sending ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem",
                          marginTop: "0.5rem",
                          transition: "background 0.2s",
                        }}
                      >
                        {sending ? (
                          <>
                            <div style={{
                              width: "18px",
                              height: "18px",
                              borderRadius: "50%",
                              border: "2px solid var(--dn-t4)",
                              borderTopColor: "var(--dn-t1)",
                              animation: "spin-slow 0.8s linear infinite",
                            }} />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send size={18} />
                            Send Message
                          </>
                        )}
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
