import React from "react";
import {
  CheckCircle2,
  RotateCcw,
  Download,
  Share2,
  Printer,
  Trash2,
  FileText,
  ChevronRight,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Hand,
  Minus,
  Plus,
  Shield,
  Scissors,
  Edit3,
  RefreshCcw,
  Archive,
} from "lucide-react";

type ResultToolCategory = "convert" | "organize" | "edit" | "secure" | "ocr";

type FinalPreviewProps = {
  fileName?: string;
  fileSize?: string;
  pages?: number;
  format?: string;
  toolName?: string;
  category?: ResultToolCategory;
};

export default function FinalPreviewPage({
  fileName = "images.pdf",
  fileSize = "305.0 KB",
  pages = 1,
  format = "PDF",
  toolName = "JPG to PDF",
  category = "convert",
}: FinalPreviewProps) {
  void category;
  return (
    <div
      className="dn-fp-root"
      style={{
        minHeight: "100vh",
        background: "var(--dn-bg)",
        color: "var(--dn-t1)",
        fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        position: "relative",
      }}
    >
      <style>{`
        .dn-fp-root {
          --dn-bg: #f1f5f9;
          --dn-bg-alt: #e8edf5;
          --dn-bg-card: #ffffff;
          --dn-bg-subtle: #f1f5f9;
          --dn-border: rgba(15, 23, 42, 0.12);
          --dn-border2: rgba(15, 23, 42, 0.08);
          --dn-t1: #0f172a;
          --dn-t2: #334155;
          --dn-t3: #64748b;
          --dn-t4: #94a3b8;
          --dn-page-shadow: 0 8px 32px rgba(15,23,42,0.10), 0 1px 4px rgba(15,23,42,0.06);
          --dn-toolbar-bg: rgba(255, 255, 255, 0.88);
          --dn-toolbar-border: rgba(15, 23, 42, 0.14);
          --dn-toolbar-text: #0f172a;
          --dn-toolbar-text-muted: #64748b;
          --dn-toolbar-shadow: 0 4px 20px rgba(15,23,42,0.10);
          --dn-panel-shadow: 0 8px 24px rgba(15,23,42,0.10);
          --dn-sidebar-bg: rgba(255, 255, 255, 0.92);
          --dn-accent-soft: rgba(37, 99, 235, 0.06);
        }
        [data-theme="dark"] .dn-fp-root {
          --dn-bg: #000000;
          --dn-bg-alt: #020817;
          --dn-bg-card: #0f172a;
          --dn-bg-subtle: #1e293b;
          --dn-border: rgba(148, 163, 184, 0.24);
          --dn-border2: rgba(148, 163, 184, 0.14);
          --dn-t1: #f8fafc;
          --dn-t2: #cbd5e1;
          --dn-t3: #94a3b8;
          --dn-t4: #64748b;
          --dn-page-shadow: 0 24px 70px rgba(0,0,0,0.42);
          --dn-toolbar-bg: rgba(15, 23, 42, 0.55);
          --dn-toolbar-border: rgba(255, 255, 255, 0.10);
          --dn-toolbar-text: rgba(255, 255, 255, 0.95);
          --dn-toolbar-text-muted: rgba(255, 255, 255, 0.50);
          --dn-toolbar-shadow: 0 10px 30px rgba(0,0,0,0.30);
          --dn-panel-shadow: 0 10px 30px rgba(0,0,0,0.30);
          --dn-sidebar-bg: rgba(15, 23, 42, 0.82);
          --dn-accent-soft: rgba(23, 37, 84, 0.26);
        }
        [data-theme="light"] .dn-fp-root .dn-fp-blobs,
        html:not([data-theme="dark"]) .dn-fp-root .dn-fp-blobs {
          display: none;
        }
        @keyframes fp-drift1 {
          0%   { transform: translate(0,0) scale(1); }
          33%  { transform: translate(5vw,5vh) scale(1.1); }
          66%  { transform: translate(-2vw,8vh) scale(0.9); }
          100% { transform: translate(0,0) scale(1); }
        }
        @keyframes fp-drift2 {
          0%   { transform: translate(0,0) scale(1); }
          33%  { transform: translate(-5vw,-5vh) scale(0.95); }
          66%  { transform: translate(4vw,-2vh) scale(1.05); }
          100% { transform: translate(0,0) scale(1); }
        }
        .dn-fp-action-btn {
          border: 1px solid var(--dn-border);
          border-radius: 6px;
          transition: all 0.15s ease;
          background: var(--dn-bg-card);
          color: var(--dn-t2);
          cursor: pointer;
        }
        .dn-fp-action-btn:hover {
          background: var(--dn-bg-subtle);
          border-color: #3b82f6;
        }
        .dn-fp-action-btn:active {
          transform: scale(0.98);
        }
        .dn-fp-danger-btn {
          border: 1px solid rgba(239,68,68,0.32);
          border-radius: 6px;
          transition: all 0.15s ease;
          background: var(--dn-bg-card);
          color: #ef4444;
          cursor: pointer;
        }
        .dn-fp-danger-btn:hover {
          background: rgba(239,68,68,0.10);
          border-color: #ef4444;
        }
        .dn-fp-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(100,116,139,0.5) rgba(226,232,240,0.42);
        }
        [data-theme="dark"] .dn-fp-scroll {
          scrollbar-color: rgba(96,165,250,0.58) rgba(15,23,42,0.5);
        }
        .dn-fp-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .dn-fp-scroll::-webkit-scrollbar-thumb {
          background: rgba(100,116,139,0.5);
          border: 2px solid rgba(226,232,240,0.42);
          border-radius: 999px;
        }
        [data-theme="dark"] .dn-fp-scroll::-webkit-scrollbar-thumb {
          background: rgba(96,165,250,0.58);
          border-color: rgba(15,23,42,0.5);
        }
        .dn-fp-scroll::-webkit-scrollbar-track { background: rgba(226,232,240,0.42); }
        .dn-fp-toolbar-btn {
          width: 40px;
          height: 40px;
          border: 1px solid var(--dn-toolbar-border);
          border-radius: 4px;
          background: var(--dn-toolbar-bg);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          box-shadow: var(--dn-toolbar-shadow);
          color: var(--dn-toolbar-text);
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        .dn-fp-toolbar-btn:hover { background: var(--dn-bg-subtle); }
        .dn-fp-continue-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 42px;
          border-bottom: 1px solid var(--dn-border2);
          color: var(--dn-t2);
          font-size: 0.9rem;
          font-weight: 750;
          cursor: pointer;
          transition: color 0.15s ease;
          background: none;
          border-left: none;
          border-right: none;
          border-top: none;
          width: 100%;
          text-align: left;
          padding: 0;
        }
        .dn-fp-continue-item:last-child { border-bottom: none; }
        .dn-fp-continue-item:hover { color: #2563eb; }
      `}</style>

      {/* Animated ambient blobs — only visible in dark mode */}
      <div className="dn-fp-blobs" style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "25%", left: "25%", width: 500, height: 500, background: "rgba(37,99,235,0.15)", borderRadius: "50%", filter: "blur(100px)", animation: "fp-drift1 25s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "25%", right: "25%", width: 600, height: 600, background: "rgba(2,103,184,0.15)", borderRadius: "50%", filter: "blur(120px)", animation: "fp-drift2 30s ease-in-out infinite reverse" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 800, background: "rgba(180,197,255,0.05)", borderRadius: "50%", filter: "blur(150px)", animation: "fp-drift1 40s ease-in-out infinite" }} />
      </div>

      {/* Navbar */}
      <header
        style={{
          height: 60,
          borderBottom: "1px solid var(--dn-border2)",
          background: "var(--dn-bg-card)",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
          position: "sticky",
          top: 0,
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#bfdbfe", display: "grid", placeItems: "center", boxShadow: "0 6px 16px rgba(37,99,235,0.22)" }}>
            <FileText size={19} strokeWidth={1.8} />
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {["All Tools", "Convert", "Organize", "Edit", "OCR", "Secure", "Pricing", "About", "Contact"].map((label, i) => (
              <button key={label} style={{ background: "none", border: "none", color: "var(--dn-t2)", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 3, padding: 0 }}>
                {label}
                {i > 0 && i < 6 && <ChevronDown size={13} />}
              </button>
            ))}
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="dn-fp-action-btn" style={{ height: 38, padding: "0 16px", fontSize: "0.875rem", fontWeight: 600 }}>Sign In</button>
          <button style={{ height: 38, padding: "0 18px", borderRadius: 6, border: "none", background: "linear-gradient(135deg,#2563eb,#3b82f6)", color: "#fff", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 16px rgba(37,99,235,0.22)" }}>Get Started</button>
        </div>
      </header>

      {/* Main layout — full viewport minus header */}
      <main style={{ height: "calc(100vh - 60px)", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 10 }}>

        {/* Result header bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 92, padding: "0 26px", borderBottom: "1px solid var(--dn-border2)", background: "transparent", flexShrink: 0, gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: 0 }}>
            <div style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 5, background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#bfdbfe", display: "grid", placeItems: "center", boxShadow: "0 10px 26px rgba(37,99,235,0.22)" }}>
              <FileText size={22} strokeWidth={1.8} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <CheckCircle2 size={15} color="#16a34a" />
                <span style={{ color: "#16a34a", fontSize: "0.82rem", fontWeight: 750 }}>Completed</span>
                <span style={{ color: "#3b82f6", fontSize: "0.82rem", fontWeight: 750 }}>{toolName}</span>
              </div>
              <h1 style={{ margin: 0, color: "var(--dn-t1)", fontSize: "1.15rem", fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "min(70vw,820px)", letterSpacing: "-0.02em" }}>
                {fileName}
              </h1>
            </div>
          </div>

          <button className="dn-fp-action-btn" style={{ height: 40, padding: "0 16px", display: "flex", alignItems: "center", gap: 7, fontSize: "0.875rem", fontWeight: 700, flexShrink: 0 }}>
            <RotateCcw size={15} />
            Start Over
          </button>
        </div>

        {/* Content grid: pages panel | preview | sidebar */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "160px minmax(0,1fr) 320px", overflow: "hidden", minHeight: 0 }}>

          {/* Pages panel */}
          <aside style={{ borderRight: "1px solid var(--dn-border2)", background: "transparent", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ height: 56, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: "none" }}>
              <h2 style={{ margin: 0, color: "var(--dn-t1)", fontSize: "0.875rem", fontWeight: 600 }}>Pages</h2>
              <span style={{ color: "var(--dn-t3)", fontSize: "0.875rem", fontWeight: 600 }}>{pages}</span>
            </div>

            <div className="dn-fp-scroll" style={{ flex: 1, overflowY: "auto", padding: "14px 12px" }}>
              <button type="button" style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", border: "none", background: "transparent", padding: "0 0 16px", cursor: "pointer" }}>
                <div style={{ width: "100%", borderRadius: 8, overflow: "hidden", background: "#ffffff", boxShadow: "0 0 0 2px #3b82f6" }}>
                  <div style={{ width: "100%", aspectRatio: "1 / 1.414", display: "flex", alignItems: "stretch" }}>
                    <CertificateMini />
                  </div>
                </div>
                <p style={{ margin: "8px 0 0", color: "#3b82f6", fontSize: "0.75rem", fontWeight: 600 }}>Page 1</p>
              </button>
            </div>
          </aside>

          {/* Preview area */}
          <section style={{ position: "relative", display: "flex", flexDirection: "column", overflow: "hidden", background: "transparent" }}>
            <div className="dn-fp-scroll" style={{ flex: 1, overflowY: "auto", overflowX: "auto", minHeight: 0, padding: "28px 32px", scrollBehavior: "smooth" }}>
              <div style={{ display: "grid", gap: 28, justifyItems: "center" }}>
                <div style={{ display: "grid", justifyItems: "center", scrollMarginTop: 18 }}>
                  <div style={{ color: "var(--dn-t3)", fontSize: "0.76rem", fontWeight: 800, marginBottom: 10 }}>Page 1</div>
                  <div style={{ width: 760, maxWidth: "100%", background: "#fff", boxShadow: "var(--dn-page-shadow)", borderRadius: 2 }}>
                    <CertificatePreview />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating zoom toolbar */}
            <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8, zIndex: 20 }}>
              <button className="dn-fp-toolbar-btn" aria-label="Hand tool"><Hand size={16} /></button>
              <div style={{ width: 1, height: 24, background: "var(--dn-toolbar-border)", margin: "0 2px" }} />
              <button className="dn-fp-toolbar-btn" aria-label="Zoom out"><ZoomOut size={16} /></button>
              <div style={{ minWidth: 60, height: 40, border: "1px solid var(--dn-toolbar-border)", borderRadius: 4, background: "var(--dn-toolbar-bg)", backdropFilter: "blur(16px) saturate(180%)", WebkitBackdropFilter: "blur(16px) saturate(180%)", boxShadow: "var(--dn-toolbar-shadow)", display: "grid", placeItems: "center", color: "var(--dn-toolbar-text)", fontSize: "0.86rem", fontWeight: 800 }}>100%</div>
              <button className="dn-fp-toolbar-btn" aria-label="Zoom in"><ZoomIn size={16} /></button>
              <div style={{ width: 1, height: 24, background: "var(--dn-toolbar-border)", margin: "0 2px" }} />
              <button className="dn-fp-toolbar-btn" aria-label="Fullscreen"><Maximize2 size={16} /></button>
              <div style={{ width: 1, height: 24, background: "var(--dn-toolbar-border)", margin: "0 2px" }} />
              <div style={{ minWidth: 84, height: 40, border: "1px solid var(--dn-toolbar-border)", borderRadius: 4, background: "var(--dn-toolbar-bg)", backdropFilter: "blur(16px) saturate(180%)", WebkitBackdropFilter: "blur(16px) saturate(180%)", boxShadow: "var(--dn-toolbar-shadow)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "var(--dn-toolbar-text)", fontSize: "0.86rem", fontWeight: 800 }}>
                <span>1</span>
                <span style={{ color: "var(--dn-toolbar-text-muted)" }}>/</span>
                <span style={{ color: "var(--dn-toolbar-text-muted)" }}>{pages}</span>
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside style={{ height: "100%", display: "flex", flexDirection: "column", borderLeft: "1px solid var(--dn-border2)", background: "var(--dn-sidebar-bg)", overflow: "hidden" }}>
            <div className="dn-fp-scroll" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>

              {/* Information */}
              <FPSidebarSection title="Information">
                <FPInfoRow label="File size" value={fileSize} />
                <FPInfoRow label="Pages" value={String(pages)} />
                <FPInfoRow label="Format" value={format} />
                <FPInfoRow label="Tool used" value={toolName} />
              </FPSidebarSection>

              {/* Actions */}
              <FPSidebarSection title="Actions">
                <button style={{ width: "100%", height: 48, border: "none", marginBottom: 12, borderRadius: 6, background: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 800, fontSize: "0.94rem", cursor: "pointer", boxShadow: "0 10px 22px rgba(37,99,235,0.22)" }}>
                  <Download size={18} />
                  Download File
                </button>

                <button className="dn-fp-action-btn" style={{ width: "100%", height: 44, padding: "0 14px", display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 750, fontSize: "0.9rem", color: "var(--dn-t2)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <FileText size={16} color="var(--dn-t3)" />
                    Export As
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--dn-t3)", fontSize: "0.84rem" }}>
                    {format} <ChevronDown size={14} />
                  </span>
                </button>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginTop: 12 }}>
                  <FPSmallAction icon={<Share2 size={18} />} label="Share" />
                  <FPSmallAction icon={<Printer size={18} />} label="Print" />
                  <FPSmallAction icon={<Trash2 size={18} />} label="Delete" danger />
                </div>
              </FPSidebarSection>

              {/* Continue Working */}
              <FPSidebarSection title="Continue Working">
                {[
                  { icon: <FileText size={16} />, label: "Merge PDF" },
                  { icon: <Archive size={16} />, label: "Compress PDF" },
                  { icon: <RefreshCcw size={16} />, label: "Convert to Word" },
                  { icon: <Scissors size={16} />, label: "Split Pages" },
                  { icon: <Edit3 size={16} />, label: "Edit PDF" },
                  { icon: <RotateCcw size={16} />, label: "Rotate PDF" },
                  { icon: <Shield size={16} />, label: "Protect PDF" },
                ].map(({ icon, label }) => (
                  <button key={label} className="dn-fp-continue-item">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                      <span style={{ color: "var(--dn-t4)" }}>{icon}</span>
                      {label}
                    </span>
                    <ChevronRight size={15} color="var(--dn-t4)" style={{ flexShrink: 0 }} />
                  </button>
                ))}
              </FPSidebarSection>
            </div>

            <div style={{ flexShrink: 0, padding: 18, borderTop: "1px solid var(--dn-border2)", background: "var(--dn-sidebar-bg)" }}>
              <button className="dn-fp-action-btn" style={{ width: "100%", height: 44, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontWeight: 800, fontSize: "0.9rem", color: "#2563eb" }}>
                <RotateCcw size={15} />
                Start Over
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function FPSidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: "18px 20px", borderBottom: "1px solid var(--dn-border2)" }}>
      <h3 style={{ margin: "0 0 14px", color: "var(--dn-t3)", fontSize: "0.72rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</h3>
      {children}
    </section>
  );
}

function FPInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "7px 0", fontSize: "0.9rem" }}>
      <span style={{ color: "var(--dn-t3)" }}>{label}</span>
      <span style={{ color: "var(--dn-t1)", fontWeight: 800, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>{value}</span>
    </div>
  );
}

function FPSmallAction({ icon, label, danger }: { icon: React.ReactNode; label: string; danger?: boolean }) {
  return (
    <button
      className={danger ? "dn-fp-danger-btn" : "dn-fp-action-btn"}
      style={{ height: 66, padding: "0.55rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}
    >
      {icon}
      <span style={{ fontSize: "0.74rem", fontWeight: 800 }}>{label}</span>
    </button>
  );
}

function CertificateMini() {
  return (
    <div style={{ width: "100%", height: "100%", padding: 10, textAlign: "left", display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
      <div style={{ width: 24, height: 6, background: "#2563eb", borderRadius: 2, marginBottom: 10 }} />
      <div style={{ width: 60, height: 8, background: "#0f172a", borderRadius: 2, marginBottom: 5 }} />
      <div style={{ width: 70, height: 6, background: "#334155", borderRadius: 2, marginBottom: 8 }} />
      <div style={{ width: 50, height: 5, background: "#94a3b8", borderRadius: 2, marginBottom: 12 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ width: "100%", height: 3, background: "#e2e8f0", borderRadius: 1 }} />
        <div style={{ width: "67%", height: 3, background: "#e2e8f0", borderRadius: 1 }} />
        <div style={{ width: "75%", height: 3, background: "#e2e8f0", borderRadius: 1 }} />
      </div>
    </div>
  );
}

function CertificatePreview() {
  return (
    <div style={{ position: "relative", aspectRatio: "16/10", background: "#fff", padding: "4rem" }}>
      <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: 22, background: "#1d4ed8" }} />
      <div style={{ position: "absolute", right: 0, top: 0, height: "100%", width: 22, background: "#1d4ed8" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ color: "#1d4ed8", fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>TATA</div>
        <div style={{ width: 180, height: 160, background: "#1d4ed8", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "1.25rem" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.75rem" }}>Forage</div>
          <p style={{ fontSize: "0.85rem", fontWeight: 600, lineHeight: 1.4 }}>Inspiring and empowering future professionals</p>
        </div>
      </div>

      <div style={{ marginTop: "3.5rem" }}>
        <h1 style={{ margin: "0 0 0.5rem", fontSize: "2.25rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em" }}>Parth Sharma</h1>
        <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.75rem", fontWeight: 700, color: "#0f172a" }}>Cybersecurity Analyst Job Simulation</h2>
        <p style={{ margin: "0 0 0.25rem", fontSize: "1.25rem", color: "#334155" }}>Certificate of Completion</p>
        <p style={{ margin: 0, fontSize: "1.1rem", color: "#2563eb", fontWeight: 600 }}>June 16th, 2026</p>
      </div>

      <div style={{ marginTop: "3rem", borderTop: "1px solid #e2e8f0", paddingTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: "0.78rem", color: "#334155", lineHeight: 1.8 }}>
          <p style={{ margin: "0 0 0.5rem" }}>Over the period of June 2026, Parth Sharma has completed practical tasks in:</p>
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            <li>Identity and access management fundamentals</li>
            <li>IAM strategy assessment</li>
            <li>Crafting custom IAM solutions</li>
          </ul>
        </div>
        <div style={{ textAlign: "center", flexShrink: 0, marginLeft: "2rem" }}>
          <div style={{ height: 56, width: 140, borderBottom: "1px solid #cbd5e1", marginBottom: 10 }} />
          <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: "0.78rem", color: "#0f172a" }}>Thomas A. Kello</p>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>CEO, Forage</p>
        </div>
      </div>
    </div>
  );
}
