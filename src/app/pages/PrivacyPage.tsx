import { motion } from "motion/react";
import { Shield, Lock, Trash2, Globe, Mail } from "lucide-react";

const sections = [
  {
    title: "Information We Collect",
    icon: Globe,
    content: `When you use DocNova, we collect minimal information necessary to provide our services:

• **Uploaded Files:** Your documents are temporarily stored in memory during processing and are automatically and permanently deleted within 1 hour of upload. We do not retain, analyze, or use the content of your files for any purpose.

• **Usage Data:** We collect anonymous usage statistics such as which tools are used and general performance metrics. This data is never linked to individual users.

• **Device Information:** Basic device type and browser information to optimize the experience. No personal identifiers are collected.

• **Contact Information:** If you contact us via email or our contact form, we retain your name and email address solely to respond to your inquiry.`,
  },
  {
    title: "How We Use Your Information",
    icon: Shield,
    content: `DocNova uses collected information strictly to:

• Provide and improve our document processing tools
• Ensure platform security and prevent abuse
• Respond to support requests and inquiries
• Maintain service reliability and performance
• Comply with applicable laws and regulations

We do not sell, rent, or share your personal data with third parties for marketing or advertising purposes. Ever.`,
  },
  {
    title: "File Security & Deletion",
    icon: Lock,
    content: `Your document security is our top priority:

• **In-Transit Encryption:** All file uploads and downloads are protected by 256-bit SSL/TLS encryption.

• **Automatic Deletion:** Uploaded files are permanently deleted from our servers within 1 hour of processing. We do not keep backups of your files.

• **No File Reading:** DocNova's systems process your files algorithmically. Our team members never read or access your document contents.

• **Isolated Processing:** Each file is processed in an isolated environment and immediately discarded after conversion.`,
  },
  {
    title: "Data Retention",
    icon: Trash2,
    content: `We keep your data for the shortest time possible:

• **Document files:** Automatically deleted within 1 hour of processing
• **Anonymous usage analytics:** Retained for 12 months, then purged
• **Contact form submissions:** Retained for up to 2 years for customer service purposes
• **Error logs:** Retained for 30 days for debugging, then deleted automatically

You may request deletion of any contact information by emailing privacy@docnova.app.`,
  },
  {
    title: "Your Rights",
    icon: Shield,
    content: `Depending on your location, you may have the following rights:

• **Right to Access:** Request a copy of personal data we hold about you
• **Right to Deletion:** Request deletion of your personal data
• **Right to Correction:** Request correction of inaccurate personal data
• **Right to Portability:** Request your data in a portable format
• **Right to Object:** Object to certain processing activities

To exercise any of these rights, contact us at privacy@docnova.app. We will respond within 30 days.`,
  },
  {
    title: "Cookies",
    icon: Globe,
    content: `DocNova uses minimal cookies:

• **Essential Cookies:** Required for basic site functionality (session management, security). These cannot be disabled.

• **Analytics Cookies:** Anonymous, aggregated analytics to understand how the site is used. You can opt out at any time.

We do not use advertising, tracking, or third-party marketing cookies.`,
  },
  {
    title: "Contact Us",
    icon: Mail,
    content: `For privacy-related questions or requests:

• **Email:** privacy@docnova.app
• **General:** hello@docnova.app
• **Response Time:** Within 30 days for privacy requests, within 24 hours for general inquiries

DocNova is committed to protecting your privacy and will respond promptly to all concerns.`,
  },
];

export default function PrivacyPage() {
  return (
    <div style={{ color: "var(--dn-t1)", paddingTop: "100px", minHeight: "100vh", background: "var(--dn-bg)", transition: "var(--dn-transition)" }}>
      <section style={{ padding: "3rem 1.5rem 6rem" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: "3.5rem" }}
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
              Legal
            </div>
            <h1 style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              marginBottom: "1rem",
            }}>
              Privacy Policy
            </h1>
            <p style={{ color: "var(--dn-t3)", fontSize: "0.95rem", lineHeight: 1.7 }}>
              Last updated: June 4, 2026 · Effective immediately
            </p>

            {/* Privacy pledge card */}
            <div style={{
              marginTop: "2rem",
              padding: "1.5rem",
              borderRadius: "6px",
              background: "linear-gradient(135deg, rgba(10,132,255,0.1) 0%, rgba(90,200,250,0.05) 100%)",
              border: "1px solid rgba(10,132,255,0.2)",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}>
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "6px",
                background: "rgba(10,132,255,0.15)",
                border: "1px solid rgba(10,132,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <Shield size={20} color="#0a84ff" />
              </div>
              <p style={{ color: "var(--dn-t2)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                <strong style={{ color: "var(--dn-t1)" }}>Our privacy pledge:</strong> We never sell your data. Files are auto-deleted within 1 hour. We collect the absolute minimum required to operate the service.
              </p>
            </div>
          </motion.div>

          {/* Sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * i }}
                style={{
                  padding: "2rem",
                  borderRadius: "6px",
                  background: "var(--dn-bg-card)",
                  border: "1px solid var(--dn-border)",
                  transition: "var(--dn-transition)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "6px",
                    background: "rgba(10,132,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <section.icon size={16} color="#0a84ff" />
                  </div>
                  <h2 style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: "var(--dn-t1)",
                  }}>
                    {section.title}
                  </h2>
                </div>

                <div style={{
                  color: "var(--dn-t3)",
                  fontSize: "0.9rem",
                  lineHeight: 1.8,
                  whiteSpace: "pre-line",
                }}>
                  {section.content.split("**").map((part, j) =>
                    j % 2 === 1
                      ? <strong key={j} style={{ color: "var(--dn-t1)", fontWeight: 600 }}>{part}</strong>
                      : <span key={j}>{part}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div style={{
            marginTop: "3rem",
            textAlign: "center",
            color: "var(--dn-t4)",
            fontSize: "0.8rem",
          }}>
            By using DocNova, you agree to this Privacy Policy. We may update this policy periodically and will notify users of significant changes.
          </div>
        </div>
      </section>
    </div>
  );
}
