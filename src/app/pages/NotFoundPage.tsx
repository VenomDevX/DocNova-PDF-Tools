import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <div style={{ color: "white", padding: "100px", textAlign: "center", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--dn-bg)" }}>
      <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem" }}>404 Not Found</h2>
      <p style={{ color: "var(--dn-t3)", marginBottom: "2rem" }}>This page doesn't exist or has been moved.</p>
      <Link to="/" style={{ color: "#60a5fa", textDecoration: "none", padding: "0.5rem 1rem", border: "1px solid #60a5fa", borderRadius: "4px" }}>
        Go Home
      </Link>
    </div>
  );
}
