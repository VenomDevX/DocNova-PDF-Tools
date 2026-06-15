import { Outlet, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { Footer } from "./components/Footer";
import { SidebarProvider, useSidebar } from "./context/SidebarContext";
import "../styles/fonts.css";

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { width } = useSidebar();
  const [hideBanner, setHideBanner] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("hideGuestBanner") === "true") {
      setHideBanner(true);
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--dn-bg)",
      fontFamily: "'Inter', sans-serif",
      transition: "var(--dn-transition)",
    }}>
      <style>{`
        @keyframes orbFloat1 {
          0%,100% { transform:translate(0,0) scale(1); }
          50%      { transform:translate(-30px,40px) scale(1.1); }
        }
        @keyframes orbFloat2 {
          0%,100% { transform:translate(0,0) scale(1); }
          50%      { transform:translate(40px,-30px) scale(0.9); }
        }
        @keyframes pulse-glow {
          0%,100% { box-shadow:0 0 20px rgba(37,99,235,0.3); }
          50%      { box-shadow:0 0 40px rgba(37,99,235,0.6); }
        }
        @keyframes spin-slow {
          from { transform:rotate(0deg); }
          to   { transform:rotate(360deg); }
        }
        * { box-sizing:border-box; }
        body { transition: var(--dn-transition); }
        a:hover { opacity:0.85; }
        input::placeholder  { color:var(--dn-t4); }
        textarea::placeholder { color:var(--dn-t4); }
        @media (max-width: 860px) {
          .dn-sidebar-wrap { display: none !important; }
          .dn-main-wrap { margin-left: 0 !important; }
          .dn-nav-wrap { left: 0 !important; }
        }
      `}</style>

      <div className="dn-sidebar-wrap">
        <Sidebar />
      </div>

      <div className="dn-nav-wrap" style={{
        position: "fixed", top: 0, left: `${width}px`, right: 0, zIndex: 90,
        transition: "left 0.25s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <Navbar />
      </div>

      <main className="dn-main-wrap" style={{
        position: "relative",
        zIndex: 1,
        marginLeft: `${width}px`,
        paddingTop: (location.pathname === "/" || location.pathname.startsWith("/ai-tools")) ? "0" : "60px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
      }}>
        {typeof window !== 'undefined' && sessionStorage.getItem("guestMode") === "true" && location.pathname !== "/" && !hideBanner && (
          <div style={{ position: "relative", background: "rgba(37, 99, 235, 0.1)", borderBottom: "1px solid rgba(37, 99, 235, 0.2)", padding: "0.6rem 2.5rem 0.6rem 1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
            <span style={{ fontSize: "13px", color: "var(--dn-t1)" }}>Sign in to save your work, sync files, and access premium features.</span>
            <a href="/auth" onClick={(e) => { e.preventDefault(); sessionStorage.removeItem("guestMode"); navigate("/auth"); }} style={{ fontSize: "12px", fontWeight: 600, color: "#fff", textDecoration: "none", background: "#2563eb", padding: "0.25rem 0.75rem", borderRadius: "4px", border: "1px solid #2563eb", transition: "filter 0.2s" }} onMouseOver={(e) => e.currentTarget.style.filter = "brightness(1.1)"} onMouseOut={(e) => e.currentTarget.style.filter = "none"}>Sign In</a>
            <button 
              onClick={() => {
                sessionStorage.setItem("hideGuestBanner", "true");
                setHideBanner(true);
              }}
              aria-label="Close banner"
              style={{
                position: "absolute",
                right: "1rem",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--dn-t3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.2rem",
                borderRadius: "4px",
                transition: "background 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "var(--dn-bg-subtle)"}
              onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
            >
              <X size={16} />
            </button>
          </div>
        )}
        <Outlet key={location.pathname} />
        {location.pathname !== "/ai-tools/chat" && <Footer />}
      </main>
    </div>
  );
}

export default function Root() {
  return (
    <SidebarProvider>
      <Layout />
    </SidebarProvider>
  );
}
