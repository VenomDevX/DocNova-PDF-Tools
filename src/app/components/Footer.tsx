import { Link } from "react-router";
import { Sparkles, Twitter, Github, Linkedin, Mail, FileOutput, FileStack, PenLine, Lock, ScanLine } from "lucide-react";

export function Footer() {
  const toolCategories = [
    { label: "Convert PDF", path: "/convert", icon: FileOutput, color: "#3b82f6" },
    { label: "Organize PDF", path: "/organize", icon: FileStack, color: "#8b5cf6" },
    { label: "Edit PDF", path: "/edit", icon: PenLine, color: "#f59e0b" },
    { label: "Secure PDF", path: "/secure", icon: Lock, color: "#ef4444" },
    { label: "OCR Tools", path: "/ocr", icon: ScanLine, color: "#06b6d4" },
  ];

  const popularTools = [
    { label: "Merge PDF", path: "/tools/merge-pdf" },
    { label: "PDF to Word", path: "/tools/pdf-to-word" },
    { label: "Word to PDF", path: "/tools/word-to-pdf" },
    { label: "Compress PDF", path: "/tools/compress-pdf" },
    { label: "PDF to JPG", path: "/tools/pdf-to-jpg" },
    { label: "Lock PDF", path: "/tools/lock-pdf" },
    { label: "PDF OCR", path: "/tools/pdf-ocr" },
  ];

  return (
    <footer style={{ background: "var(--dn-footer-bg)", borderTop: "1px solid var(--dn-footer-bd)", padding: "4rem 1.5rem 2rem", fontFamily: "'Inter',sans-serif", transition: "var(--dn-transition)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "2.5rem", marginBottom: "3rem" }}>

          {/* Brand */}
          <div style={{ gridColumn: "span 1" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "linear-gradient(135deg,#1d4ed8,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 14px rgba(37,99,235,0.45)" }}>
                <Sparkles size={16} color="#fff" strokeWidth={2.2} />
              </div>
              <span style={{ color: "var(--dn-footer-title)", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>Doc<span style={{ color: "#3b82f6" }}>Nova</span></span>
            </div>
            <p style={{ color: "var(--dn-footer-text)", fontSize: "0.875rem", lineHeight: 1.7, maxWidth: "220px", marginBottom: "1.25rem" }}>
              The next-gen PDF toolkit built for speed, privacy, and simplicity.
            </p>
            <div style={{ display: "flex", gap: "0.6rem" }}>
              {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                <a key={i} href="#" style={{ width: "32px", height: "32px", borderRadius: "9px", background: "var(--dn-footer-icon-bg)", border: "1px solid var(--dn-footer-icon-bd)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--dn-footer-text)", textDecoration: "none" }}>
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 style={{ color: "var(--dn-footer-title)", fontWeight: 600, fontSize: "0.82rem", marginBottom: "1rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Categories</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              {toolCategories.map(cat => (
                <Link key={cat.path} to={cat.path} style={{ textDecoration: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--dn-footer-link)", fontSize: "0.875rem", transition: "color 0.15s" }}>
                    <cat.icon size={13} color={cat.color} />
                    {cat.label}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Popular tools */}
          <div>
            <h4 style={{ color: "var(--dn-footer-title)", fontWeight: 600, fontSize: "0.82rem", marginBottom: "1rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Popular Tools</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              {popularTools.map(t => (
                <Link key={t.path} to={t.path} style={{ color: "var(--dn-footer-link)", textDecoration: "none", fontSize: "0.875rem" }}>{t.label}</Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 style={{ color: "var(--dn-footer-title)", fontWeight: 600, fontSize: "0.82rem", marginBottom: "1rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Company</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              {[
                { label: "All Tools", path: "/tools" },
                { label: "About", path: "/about" },
                { label: "Contact", path: "/contact" },
                { label: "Privacy Policy", path: "/privacy" },
                { label: "Terms of Service", path: "/terms" },
              ].map(item => (
                <Link key={item.path} to={item.path} style={{ color: "var(--dn-footer-link)", textDecoration: "none", fontSize: "0.875rem" }}>{item.label}</Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ color: "var(--dn-footer-title)", fontWeight: 600, fontSize: "0.82rem", marginBottom: "1rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Stay Updated</h4>
            <p style={{ color: "var(--dn-footer-text)", fontSize: "0.875rem", marginBottom: "1rem", lineHeight: 1.6 }}>Get notified about new tools and updates.</p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input type="email" placeholder="your@email.com"
                style={{ flex: 1, padding: "0.6rem 0.875rem", borderRadius: "10px", background: "var(--dn-footer-icon-bg)", border: "1px solid var(--dn-footer-bd)", color: "var(--dn-footer-title)", fontSize: "0.875rem", outline: "none", fontFamily: "'Inter',sans-serif", minWidth: 0 }} />
              <button style={{ padding: "0.6rem 0.9rem", borderRadius: "10px", background: "linear-gradient(135deg,#1d4ed8,#2563eb)", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600, fontFamily: "'Inter',sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}>
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid var(--dn-footer-bd)", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <p style={{ color: "var(--dn-footer-text)", fontSize: "0.8rem", opacity: 0.6 }}>© 2026 DocNova. All rights reserved.</p>
          <div style={{ display: "flex", gap: "1.25rem" }}>
            {[{ label: "Privacy", path: "/privacy" }, { label: "Terms", path: "/terms" }].map(link => (
              <Link key={link.path} to={link.path} style={{ color: "var(--dn-footer-text)", fontSize: "0.8rem", textDecoration: "none", opacity: 0.6 }}>{link.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
