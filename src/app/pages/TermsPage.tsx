import { motion } from "motion/react";
import { FileText, Users, Shield, AlertCircle, Globe, Mail } from "lucide-react";

const sections = [
  { title: "Acceptance of Terms", icon: FileText, content: `By accessing or using DocNova ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.\n\n• These terms apply to all visitors, users, and others who access or use the Service\n• We reserve the right to update these terms at any time with reasonable notice\n• Continued use after changes constitutes acceptance of the new terms` },
  { title: "Use of the Service", icon: Users, content: `DocNova provides online document processing tools. By using the Service, you agree to:\n\n• Upload only files you own or have legal rights to process\n• Not upload malicious files, malware, or illegal content\n• Not attempt to reverse engineer or abuse the Service infrastructure\n• Not use the Service for bulk spam generation or automated abuse\n• Comply with all applicable laws in your jurisdiction` },
  { title: "Intellectual Property", icon: Shield, content: `DocNova and its original content, features, and functionality are owned by DocNova and protected by international copyright, trademark, and other intellectual property laws.\n\n• You retain all rights to your uploaded files and processed outputs\n• We do not claim ownership of any files you upload\n• The DocNova brand, logo, and UI design are our exclusive property\n• You may not reproduce, distribute, or create derivative works from our platform without written permission` },
  { title: "Privacy & Data", icon: Globe, content: `Your privacy is extremely important to us. By using the Service:\n\n• **Uploaded files** are processed in isolated, temporary environments and permanently deleted within 1 hour\n• We do not read, analyze, or store the content of your documents\n• Anonymous usage analytics may be collected to improve the Service\n• We do not sell your data to third parties under any circumstances\n• See our full Privacy Policy for detailed information on data handling` },
  { title: "Disclaimers & Limitations", icon: AlertCircle, content: `DocNova is provided "as is" without warranties of any kind. We disclaim all liability for:\n\n• Temporary service unavailability or downtime\n• Data loss due to technical failures (always keep backups)\n• Accuracy of OCR results or conversion quality\n• Compatibility issues with specific PDF standards or DRM-protected files\n• Any indirect, incidental, or consequential damages arising from use of the Service\n\nOur maximum liability is limited to the amount you paid us in the 12 months prior to any claim.` },
  { title: "Prohibited Content", icon: AlertCircle, content: `You may not use DocNova to process:\n\n• Content that violates copyright or intellectual property rights\n• Files containing malware, viruses, or malicious code\n• Child sexual abuse material (CSAM) or any illegal content\n• Content intended to facilitate harassment, harm, or illegal activities\n\nWe reserve the right to terminate accounts found in violation without notice.` },
  { title: "Contact", icon: Mail, content: `For questions about these Terms of Service:\n\n• **Email:** legal@docnova.app\n• **General:** hello@docnova.app\n• **Response time:** Within 5 business days for legal inquiries\n\nThese terms are governed by the laws of the State of California, United States.` },
];

export default function TermsPage() {
  return (
    <div style={{ color: "var(--dn-t1)", paddingTop: "100px", minHeight: "100vh", background: "var(--dn-bg)", transition: "var(--dn-transition)", fontFamily: "'Inter', sans-serif" }}>
      <section style={{ padding: "3rem 1.5rem 6rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "3.5rem" }}>
            <div style={{ display: "inline-block", padding: "0.35rem 0.9rem", borderRadius: "999px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#60a5fa", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1.25rem" }}>Legal</div>
            <h1 style={{ fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: "1rem", color: "var(--dn-t1)" }}>Terms of Service</h1>
            <p style={{ color: "var(--dn-t3)", fontSize: "0.95rem", lineHeight: 1.7 }}>Last updated: June 4, 2026 · Effective immediately</p>
            <div style={{ marginTop: "2rem", padding: "1.5rem", borderRadius: "18px", background: "linear-gradient(135deg,rgba(59,130,246,0.08) 0%,rgba(59,130,246,0.04) 100%)", border: "1px solid rgba(59,130,246,0.18)", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <FileText size={20} color="#3b82f6" />
              </div>
              <p style={{ color: "var(--dn-t2)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                <strong style={{ color: "var(--dn-t1)" }}>Simple summary:</strong> Use DocNova for legal purposes. We respect your files and privacy. We delete everything within 1 hour. Don't abuse the service.
              </p>
            </div>
          </motion.div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {sections.map((section, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.04 * i }}
                style={{ padding: "2rem", borderRadius: "20px", background: "var(--dn-bg-card)", border: "1px solid var(--dn-border)", transition: "var(--dn-transition)", boxShadow: "var(--dn-shadow)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <section.icon size={16} color="#3b82f6" />
                  </div>
                  <h2 style={{ fontSize: "1.05rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--dn-t1)" }}>{section.title}</h2>
                </div>
                <div style={{ color: "var(--dn-t3)", fontSize: "0.9rem", lineHeight: 1.8, whiteSpace: "pre-line" }}>
                  {section.content.split("**").map((part, j) =>
                    j % 2 === 1 ? <strong key={j} style={{ color: "var(--dn-t1)", fontWeight: 600 }}>{part}</strong> : <span key={j}>{part}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div style={{ marginTop: "3rem", textAlign: "center", color: "var(--dn-t4)", fontSize: "0.8rem", lineHeight: 1.7 }}>
            By using DocNova, you agree to these Terms of Service and our Privacy Policy.
          </div>
        </div>
      </section>
    </div>
  );
}
