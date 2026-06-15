import { Link } from "react-router";
import { motion } from "motion/react";

export default function NotFoundPage() {
  return (
    <div style={{ color: "white", padding: "100px", textAlign: "center", minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--dn-bg)" }}>
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ fontSize: "5rem", fontWeight: 800, marginBottom: "0.5rem", color: "var(--dn-t1)" }}
      >
        404
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--dn-t2)", marginBottom: "1rem" }}
      >
        Lost in Space
      </motion.p>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ color: "var(--dn-t3)", marginBottom: "2.5rem", maxWidth: "400px" }}
      >
        Looks like this document drifted out of orbit. We couldn't find the page you're looking for in this sector.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Link to="/" style={{ color: "var(--dn-bg)", background: "var(--dn-primary)", textDecoration: "none", padding: "0.75rem 1.5rem", borderRadius: "6px", fontWeight: 600, display: "inline-block" }}>
          Return to Base
        </Link>
      </motion.div>
    </div>
  );
}
