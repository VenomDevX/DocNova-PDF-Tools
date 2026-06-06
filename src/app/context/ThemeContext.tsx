import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Theme = "light" | "dark";
interface Ctx { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void; }

const ThemeContext = createContext<Ctx>({ theme: "light", toggle: () => {}, setTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

/* ── CSS custom properties for each theme ───────────────── */
const VARS: Record<Theme, Record<string, string>> = {
  dark: {
    /* backgrounds */
    "--dn-bg":              "#000000",
    "--dn-bg-alt":          "#03050f",
    "--dn-bg-card":         "#0d0f1a",
    "--dn-bg-subtle":       "rgba(255,255,255,0.03)",
    "--dn-bg-input":        "rgba(255,255,255,0.05)",
    /* navbar */
    "--dn-nav-bg":          "rgba(0,0,0,0.75)",
    "--dn-nav-border":      "rgba(255,255,255,0.06)",
    "--dn-nav-pill":        "rgba(255,255,255,0.04)",
    "--dn-nav-active":      "rgba(255,255,255,0.1)",
    "--dn-nav-text":        "rgba(255,255,255,0.5)",
    "--dn-nav-logo":        "#ffffff",
    /* text */
    "--dn-t1":              "#ffffff",
    "--dn-t2":              "#9CA3AF",
    "--dn-t3":              "#6B7280",
    "--dn-t4":              "#4B5563",
    /* borders / dividers */
    "--dn-border":          "rgba(255,255,255,0.07)",
    "--dn-border2":         "rgba(255,255,255,0.12)",
    "--dn-divider":         "rgba(255,255,255,0.06)",
    "--dn-shadow":          "none",
    /* hero */
    "--dn-hero-blob":       "rgba(37,99,235,0.18)",
    "--dn-hero-blob2":      "rgba(59,130,246,0.10)",
    "--dn-noise-op":        "0.5",
    "--dn-doc-bg":          "linear-gradient(145deg,#0d1b35,#0a1628)",
    "--dn-doc-border":      "rgba(59,130,246,0.18)",
    "--dn-doc-line":        "rgba(255,255,255,0.1)",
    "--dn-doc-line1":       "rgba(59,130,246,0.5)",
    "--dn-doc-brand":       "rgba(255,255,255,0.25)",
    "--dn-doc-dot":         "#3b82f6",
    "--dn-doc-dotbg":       "rgba(37,99,235,0.25)",
    "--dn-doc-dotbd":       "rgba(37,99,235,0.3)",
    "--dn-doc-front-bg":    "linear-gradient(145deg,#0f2040,#0d1b35,#091526)",
    "--dn-doc-front-shad":  "0 20px 60px rgba(0,0,0,0.7),0 0 0 1px rgba(255,255,255,0.06),0 0 40px rgba(37,99,235,0.15),inset 0 1px 0 rgba(255,255,255,0.06)",
    "--dn-doc-amb":         "rgba(37,99,235,0.22)",
    "--dn-doc-amb2":        "rgba(37,99,235,0.08)",
    /* badge / tags */
    "--dn-badge-bg":        "rgba(37,99,235,0.1)",
    "--dn-badge-bd":        "rgba(37,99,235,0.28)",
    "--dn-badge-text":      "#93c5fd",
    "--dn-why-badge-bg":    "rgba(37,99,235,0.06)",
    "--dn-why-badge-bd":    "rgba(59,130,246,0.35)",
    "--dn-why-badge-text":  "#60a5fa",
    /* stats */
    "--dn-stat-val":        "linear-gradient(135deg,#3b82f6,#60a5fa)",
    "--dn-stat-label":      "#6B7280",
    "--dn-stat-div":        "rgba(255,255,255,0.06)",
    /* feature cards */
    "--dn-feat-icon-bg":    "rgba(37,99,235,0.12)",
    "--dn-feat-icon-bd":    "rgba(37,99,235,0.22)",
    "--dn-feat-top":        "rgba(59,130,246,0.4)",
    /* step cards */
    "--dn-step-icon-bg":    "linear-gradient(135deg,rgba(29,78,216,0.5),rgba(37,99,235,0.35))",
    "--dn-step-icon-bd":    "rgba(59,130,246,0.3)",
    "--dn-step-num":        "rgba(255,255,255,0.04)",
    /* CTA */
    "--dn-cta-bg":          "linear-gradient(135deg,rgba(13,27,61,0.9),rgba(9,20,46,0.95),rgba(7,15,35,0.9))",
    "--dn-cta-border":      "rgba(59,130,246,0.2)",
    "--dn-cta-shad":        "0 0 0 1px rgba(255,255,255,0.04),0 0 80px rgba(37,99,235,0.12),inset 0 1px 0 rgba(255,255,255,0.06)",
    "--dn-cta-blob":        "rgba(37,99,235,0.18)",
    "--dn-cta-grad":        "rgba(37,99,235,0.04)",
    "--dn-cta-t2":          "#6B7280",
    /* tools grid */
    "--dn-tool-bg":         "#0d0f1a",
    "--dn-tool-border":     "rgba(255,255,255,0.07)",
    /* why blob */
    "--dn-why-blob":        "rgba(37,99,235,0.12)",
    "--dn-testi-blob":      "rgba(37,99,235,0.08)",
    /* footer */
    "--dn-footer-bg":       "rgba(8,8,16,0.95)",
    "--dn-footer-bd":       "rgba(255,255,255,0.06)",
    "--dn-footer-icon-bg":  "rgba(255,255,255,0.06)",
    "--dn-footer-icon-bd":  "rgba(255,255,255,0.08)",
    "--dn-footer-text":     "rgba(255,255,255,0.45)",
    "--dn-footer-link":     "rgba(255,255,255,0.45)",
    "--dn-footer-title":    "#ffffff",
    "--dn-trust-icon":      "#22c55e",
    /* page transition */
    "--dn-transition":      "background 0.35s ease, color 0.35s ease",
  },
  light: {
    /* backgrounds */
    "--dn-bg":              "#f5f7ff",
    "--dn-bg-alt":          "#eef0fb",
    "--dn-bg-card":         "#ffffff",
    "--dn-bg-subtle":       "rgba(0,0,0,0.02)",
    "--dn-bg-input":        "rgba(0,0,0,0.04)",
    /* navbar */
    "--dn-nav-bg":          "rgba(255,255,255,0.85)",
    "--dn-nav-border":      "rgba(0,0,0,0.08)",
    "--dn-nav-pill":        "rgba(0,0,0,0.05)",
    "--dn-nav-active":      "rgba(0,0,0,0.07)",
    "--dn-nav-text":        "rgba(0,0,0,0.45)",
    "--dn-nav-logo":        "#0f1117",
    /* text */
    "--dn-t1":              "#0f1117",
    "--dn-t2":              "#374151",
    "--dn-t3":              "#6b7280",
    "--dn-t4":              "#9ca3af",
    /* borders / dividers */
    "--dn-border":          "rgba(0,0,0,0.08)",
    "--dn-border2":         "rgba(0,0,0,0.14)",
    "--dn-divider":         "rgba(0,0,0,0.06)",
    "--dn-shadow":          "0 1px 4px rgba(0,0,0,0.06),0 4px 20px rgba(0,0,0,0.05)",
    /* hero */
    "--dn-hero-blob":       "rgba(37,99,235,0.07)",
    "--dn-hero-blob2":      "rgba(59,130,246,0.05)",
    "--dn-noise-op":        "0.12",
    "--dn-doc-bg":          "linear-gradient(145deg,#dce8ff,#e8f0ff)",
    "--dn-doc-border":      "rgba(59,130,246,0.3)",
    "--dn-doc-line":        "rgba(0,0,0,0.08)",
    "--dn-doc-line1":       "rgba(37,99,235,0.35)",
    "--dn-doc-brand":       "rgba(0,0,0,0.25)",
    "--dn-doc-dot":         "#2563eb",
    "--dn-doc-dotbg":       "rgba(37,99,235,0.15)",
    "--dn-doc-dotbd":       "rgba(37,99,235,0.25)",
    "--dn-doc-front-bg":    "linear-gradient(145deg,#dbeafe,#eff6ff,#dbeafe)",
    "--dn-doc-front-shad":  "0 20px 60px rgba(0,0,0,0.12),0 0 0 1px rgba(0,0,0,0.05),0 0 30px rgba(37,99,235,0.08),inset 0 1px 0 rgba(255,255,255,0.8)",
    "--dn-doc-amb":         "rgba(37,99,235,0.12)",
    "--dn-doc-amb2":        "rgba(37,99,235,0.04)",
    /* badge / tags */
    "--dn-badge-bg":        "rgba(37,99,235,0.07)",
    "--dn-badge-bd":        "rgba(37,99,235,0.2)",
    "--dn-badge-text":      "#1d4ed8",
    "--dn-why-badge-bg":    "rgba(37,99,235,0.05)",
    "--dn-why-badge-bd":    "rgba(59,130,246,0.2)",
    "--dn-why-badge-text":  "#2563eb",
    /* stats */
    "--dn-stat-val":        "linear-gradient(135deg,#1d4ed8,#3b82f6)",
    "--dn-stat-label":      "#6b7280",
    "--dn-stat-div":        "rgba(0,0,0,0.06)",
    /* feature cards */
    "--dn-feat-icon-bg":    "rgba(37,99,235,0.08)",
    "--dn-feat-icon-bd":    "rgba(37,99,235,0.18)",
    "--dn-feat-top":        "rgba(59,130,246,0.2)",
    /* step cards */
    "--dn-step-icon-bg":    "linear-gradient(135deg,rgba(29,78,216,0.12),rgba(37,99,235,0.08))",
    "--dn-step-icon-bd":    "rgba(59,130,246,0.2)",
    "--dn-step-num":        "rgba(0,0,0,0.04)",
    /* CTA */
    "--dn-cta-bg":          "linear-gradient(135deg,rgba(219,234,254,0.97),rgba(239,246,255,1),rgba(219,234,254,0.97))",
    "--dn-cta-border":      "rgba(59,130,246,0.25)",
    "--dn-cta-shad":        "0 0 0 1px rgba(0,0,0,0.04),0 0 60px rgba(37,99,235,0.08)",
    "--dn-cta-blob":        "rgba(37,99,235,0.08)",
    "--dn-cta-grad":        "rgba(37,99,235,0.02)",
    "--dn-cta-t2":          "#6b7280",
    /* tools grid */
    "--dn-tool-bg":         "#ffffff",
    "--dn-tool-border":     "rgba(0,0,0,0.07)",
    /* why blob */
    "--dn-why-blob":        "rgba(37,99,235,0.06)",
    "--dn-testi-blob":      "rgba(37,99,235,0.05)",
    /* footer */
    "--dn-footer-bg":       "#eef1fb",
    "--dn-footer-bd":       "rgba(0,0,0,0.08)",
    "--dn-footer-icon-bg":  "rgba(0,0,0,0.05)",
    "--dn-footer-icon-bd":  "rgba(0,0,0,0.09)",
    "--dn-footer-text":     "rgba(0,0,0,0.45)",
    "--dn-footer-link":     "rgba(0,0,0,0.5)",
    "--dn-footer-title":    "#0f1117",
    "--dn-trust-icon":      "#16a34a",
    /* page transition */
    "--dn-transition":      "background 0.35s ease, color 0.35s ease",
  },
};

function applyVars(theme: Theme) {
  const root = document.documentElement;
  Object.entries(VARS[theme]).forEach(([k, v]) => root.style.setProperty(k, v));
  root.setAttribute("data-theme", theme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  /* Init from localStorage */
  useEffect(() => {
    const saved = localStorage.getItem("docnova-theme") as Theme | null;
    const t = saved === "dark" || saved === "light" ? saved : "dark";
    setThemeState(t);
    applyVars(t);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    applyVars(t);
    localStorage.setItem("docnova-theme", t);
  };

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
