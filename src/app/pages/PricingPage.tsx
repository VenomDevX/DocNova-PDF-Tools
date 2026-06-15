import { Link } from "react-router";
import { motion } from "motion/react";
import { Rocket } from "lucide-react";

export default function PricingPage() {
  return (
    <div style={{ color: "white", padding: "100px 20px", textAlign: "center", minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--dn-bg)" }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        style={{ background: "rgba(37, 99, 235, 0.1)", padding: "1.5rem", borderRadius: "50%", marginBottom: "2rem", border: "1px solid rgba(37, 99, 235, 0.2)" }}
      >
        <Rocket size={48} color="#60a5fa" />
      </motion.div>
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ fontSize: "3rem", fontWeight: 800, marginBottom: "1rem", color: "var(--dn-t1)" }}
      >
        Pricing
      </motion.h2>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ display: "inline-block", background: "rgba(37,99,235,0.2)", color: "#93c5fd", padding: "0.25rem 0.75rem", borderRadius: "100px", fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "1.5rem" }}
      >
        Coming Soon
      </motion.div>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ color: "var(--dn-t3)", marginBottom: "2.5rem", maxWidth: "500px", fontSize: "1.1rem", lineHeight: "1.6" }}
      >
        We're currently finalizing our pricing plans to bring you the best value for your AI document intelligence workflows. Stay tuned for our upcoming launch!
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Link to="/" style={{ color: "var(--dn-bg)", background: "var(--dn-primary)", textDecoration: "none", padding: "0.75rem 1.5rem", borderRadius: "6px", fontWeight: 600, display: "inline-block" }}>
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
