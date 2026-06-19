import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Theme = "light" | "dark";
interface Ctx { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void; }

const ThemeContext = createContext<Ctx>({ theme: "light", toggle: () => {}, setTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

/* ── CSS custom properties for each theme ───────────────── */
const VARS: Record<Theme, Record<string, string>> = {
  dark: {
    /* backgrounds — ultra-dark navy */
    "--dn-bg":              "#000000",
    "--dn-bg-alt":          "#020817",
    "--dn-bg-card":         "#090E1A",
    "--dn-bg-subtle":       "rgba(23,37,84,0.2)",
    "--dn-bg-input":        "rgba(23,37,84,0.25)",
    /* navbar */
    "--dn-nav-bg":          "rgba(2,8,23,0.88)",
    "--dn-nav-border":      "rgba(23,37,84,0.55)",
    "--dn-nav-pill":        "rgba(23,37,84,0.35)",
    "--dn-nav-active":      "rgba(23,78,166,0.28)",
    "--dn-nav-text":        "rgba(248,250,252,0.5)",
    "--dn-nav-logo":        "#ffffff",
    /* text */
    "--dn-t1":              "#F8FAFC",
    "--dn-t2":              "#94A3B8",
    "--dn-t3":              "#64748B",
    "--dn-t4":              "#475569",
    /* borders / dividers */
    "--dn-border":          "rgba(23,37,84,0.55)",
    "--dn-border2":         "#172554",
    "--dn-divider":         "rgba(23,37,84,0.45)",
    "--dn-shadow":          "none",
    /* hero */
    "--dn-hero-blob":       "rgba(23,78,166,0.16)",
    "--dn-hero-blob2":      "rgba(37,99,235,0.08)",
    "--dn-noise-op":        "0.5",
    "--dn-doc-bg":          "linear-gradient(145deg,#061332,#031026)",
    "--dn-doc-border":      "rgba(23,37,84,0.7)",
    "--dn-doc-line":        "rgba(255,255,255,0.07)",
    "--dn-doc-line1":       "rgba(37,99,235,0.4)",
    "--dn-doc-brand":       "rgba(255,255,255,0.2)",
    "--dn-doc-dot":         "#2563EB",
    "--dn-doc-dotbg":       "rgba(23,78,166,0.3)",
    "--dn-doc-dotbd":       "rgba(23,78,166,0.35)",
    "--dn-doc-front-bg":    "linear-gradient(145deg,#082B5F,#061332,#031026)",
    "--dn-doc-front-shad":  "0 20px 60px rgba(0,0,0,0.85),0 0 0 1px rgba(23,37,84,0.7),0 0 40px rgba(23,78,166,0.12),inset 0 1px 0 rgba(255,255,255,0.04)",
    "--dn-doc-amb":         "rgba(23,78,166,0.18)",
    "--dn-doc-amb2":        "rgba(23,78,166,0.06)",
    /* badge / tags */
    "--dn-badge-bg":        "rgba(23,78,166,0.14)",
    "--dn-badge-bd":        "rgba(23,37,84,0.8)",
    "--dn-badge-text":      "#93c5fd",
    "--dn-why-badge-bg":    "rgba(23,78,166,0.1)",
    "--dn-why-badge-bd":    "rgba(23,37,84,0.7)",
    "--dn-why-badge-text":  "#60a5fa",
    /* stats */
    "--dn-stat-val":        "linear-gradient(135deg,#2563EB,#3b82f6)",
    "--dn-stat-label":      "#64748B",
    "--dn-stat-div":        "rgba(23,37,84,0.5)",
    /* feature cards */
    "--dn-feat-icon-bg":    "rgba(23,78,166,0.15)",
    "--dn-feat-icon-bd":    "rgba(23,37,84,0.8)",
    "--dn-feat-top":        "rgba(23,78,166,0.35)",
    /* step cards */
    "--dn-step-icon-bg":    "linear-gradient(135deg,rgba(23,78,166,0.45),rgba(37,99,235,0.28))",
    "--dn-step-icon-bd":    "rgba(23,37,84,0.8)",
    "--dn-step-num":        "rgba(23,37,84,0.3)",
    /* CTA */
    "--dn-cta-bg":          "linear-gradient(135deg,rgba(6,19,50,0.95),rgba(3,10,26,0.97),rgba(0,0,0,0.95))",
    "--dn-cta-border":      "rgba(23,37,84,0.7)",
    "--dn-cta-shad":        "0 0 0 1px rgba(23,37,84,0.6),0 0 80px rgba(23,78,166,0.1),inset 0 1px 0 rgba(255,255,255,0.03)",
    "--dn-cta-blob":        "rgba(23,78,166,0.14)",
    "--dn-cta-grad":        "rgba(23,78,166,0.04)",
    "--dn-cta-t2":          "#64748B",
    /* tools grid */
    "--dn-tool-bg":         "#090E1A",
    "--dn-tool-border":     "rgba(23,37,84,0.55)",
    /* why blob */
    "--dn-why-blob":        "rgba(23,78,166,0.1)",
    "--dn-testi-blob":      "rgba(23,78,166,0.07)",
    /* footer */
    "--dn-footer-bg":       "#061130",
    "--dn-footer-bd":       "rgba(23,37,84,0.6)",
    "--dn-footer-icon-bg":  "rgba(23,37,84,0.4)",
    "--dn-footer-icon-bd":  "rgba(23,37,84,0.6)",
    "--dn-footer-text":     "rgba(148,163,184,0.7)",
    "--dn-footer-link":     "rgba(148,163,184,0.65)",
    "--dn-footer-title":    "#F8FAFC",
    "--dn-trust-icon":      "#22c55e",
    /* workspace / review pages */
    "--dn-surface-2":       "rgba(23,37,84,0.22)",
    /* transparent so the shared premium gradient (.dn-dark-blobs) shows through
       review/preview canvases — keeps one continuous background from upload on */
    "--dn-preview-bg":      "transparent",
    /* Same base as the AI tool pages: the page background (#000) with the
       shared .dn-dark-blobs drifting glow on top. Painted on the page main
       wrapper (full height, behind the transparent navbar) so upload /
       pre-conversion / result pages match the AI pages exactly. */
    "--dn-workspace-bg":    "var(--dn-bg)",
    "--dn-page-shadow":     "0 24px 70px rgba(0,0,0,0.5)",
    "--dn-toolbar-bg":      "rgba(9,14,28,0.72)",
    "--dn-toolbar-border":  "rgba(255,255,255,0.12)",
    "--dn-toolbar-text":    "rgba(255,255,255,0.92)",
    "--dn-toolbar-shadow":  "0 10px 30px rgba(0,0,0,0.42)",
    "--dn-selected-bg":     "rgba(37,99,235,0.24)",
    "--dn-selected-border": "#3b82f6",
    "--dn-hover-bg":        "rgba(255,255,255,0.06)",
    "--dn-icon-bg":         "rgba(148,163,184,0.16)",
    /* page transition */
    "--dn-transition":      "background 0.35s ease, color 0.35s ease",
  },
  light: {
    /* backgrounds */
    "--dn-bg":              "#f8f9fc",
    "--dn-bg-alt":          "#f1f3f9",
    "--dn-bg-card":         "#ffffff",
    "--dn-bg-subtle":       "#eef1f8",
    "--dn-bg-input":        "#f4f6fb",
    /* navbar */
    "--dn-nav-bg":          "rgba(248,249,252,0.92)",
    "--dn-nav-border":      "#c3c6d7",
    "--dn-nav-pill":        "rgba(0,0,0,0.05)",
    "--dn-nav-active":      "rgba(0,0,0,0.07)",
    "--dn-nav-text":        "#595e70",
    "--dn-nav-logo":        "#004ac6",
    /* text */
    "--dn-t1":              "#191c1e",
    "--dn-t2":              "#434655",
    "--dn-t3":              "#595e70",
    "--dn-t4":              "#737686",
    /* borders / dividers */
    "--dn-border":          "#cfd5e2",
    "--dn-border2":         "#bcc3d4",
    "--dn-divider":         "#dde2ec",
    "--dn-shadow":          "0 1px 2px rgba(15,23,42,0.06),0 6px 20px rgba(15,23,42,0.06)",
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
    /* workspace / review pages */
    "--dn-surface-2":       "#f4f6fb",
    /* transparent so the review/preview canvas matches the upload page bg
       (--dn-bg) exactly — no light-mode color switch between steps */
    "--dn-preview-bg":      "transparent",
    /* Light mode: keep the workspace background identical to the page bg so
       upload → review stays continuous (no gradient in light). */
    "--dn-workspace-bg":    "var(--dn-bg)",
    "--dn-page-shadow":     "0 6px 24px rgba(15,23,42,0.13),0 1px 3px rgba(15,23,42,0.08)",
    "--dn-toolbar-bg":      "rgba(255,255,255,0.94)",
    "--dn-toolbar-border":  "#cbd2e0",
    "--dn-toolbar-text":    "#1f2533",
    "--dn-toolbar-shadow":  "0 6px 22px rgba(15,23,42,0.16)",
    "--dn-selected-bg":     "rgba(37,99,235,0.10)",
    "--dn-selected-border": "#2563eb",
    "--dn-hover-bg":        "rgba(15,23,42,0.045)",
    "--dn-icon-bg":         "rgba(37,99,235,0.08)",
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
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    const saved = localStorage.getItem("docnova-theme") as Theme | null;
    const t = saved === "dark" || saved === "light" ? saved : "dark";
    applyVars(t);
    return t;
  });

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
