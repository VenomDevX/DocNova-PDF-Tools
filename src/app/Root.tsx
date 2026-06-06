import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import "../styles/fonts.css";

export default function Root() {
  const location = useLocation();
  const isResultPage = location.pathname.startsWith("/result/");

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
      `}</style>

      <Navbar />
      <main style={{ position: "relative", zIndex: 1 }}>
        <Outlet />
      </main>
      {!isResultPage && <Footer />}
    </div>
  );
}
