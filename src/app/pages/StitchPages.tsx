import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const QUICK_ROUTES = [
  { label: "Home", path: "/", group: "Workspace" },
  { label: "Dashboard", path: "/dashboard", group: "Workspace" },
  { label: "Documents", path: "/documents", group: "Workspace" },
  { label: "Document Viewer", path: "/documents/viewer", group: "Workspace" },
  { label: "Conversations", path: "/conversations", group: "Workspace" },
  { label: "Search", path: "/search", group: "Workspace" },
  { label: "Analytics", path: "/analytics", group: "Workspace" },
  { label: "Pricing", path: "/pricing", group: "Company" },
  { label: "Profile Settings", path: "/settings/profile", group: "Settings" },
  { label: "Billing", path: "/settings/billing", group: "Settings" },
  { label: "API Keys", path: "/settings/api-keys", group: "Settings" },
  { label: "Security", path: "/settings/security", group: "Settings" },
  { label: "Integrations", path: "/settings/integrations", group: "Settings" },
  { label: "Onboarding", path: "/onboarding", group: "Setup" },
  { label: "Upload Document", path: "/onboarding/upload", group: "Setup" },
  { label: "Interactive Demo", path: "/onboarding/demo", group: "Setup" },
  { label: "Choose Plan", path: "/onboarding/plan", group: "Setup" },
];

type BackendTool = {
  id: string;
  label: string;
  description: string;
  route: string;
  category: string;
};

type SampleDocument = {
  id: string;
  name: string;
  status: string;
  pages: number;
  risk: string;
};

type AnalysisResult = {
  document: {
    filename: string;
    kind: string;
    pages: number;
    size: number;
    previewText: string;
  };
  analysis: {
    summary: {
      estimatedPages: number;
      risk: string;
      readableText: boolean;
      keywords: Record<string, number>;
    };
    recommendations: string[];
  };
};

type StitchScreenProps = {
  title: string;
  folder: string;
};

function StitchScreen({ title, folder }: StitchScreenProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const navigate = useNavigate();

  const handleLoad = () => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc) return;

    const go = (path: string) => {
      navigate(path);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const routeForLabel = (label: string, href: string | null) => {
      const text = label.toLowerCase().replace(/\s+/g, " ").trim();
      const iconText = text.replace(
        /\b(home|description|chat|search|database|analytics|settings|person|shield|credit_card|key|integration_instructions|folder|upload|arrow_forward|arrow_back|login|logout|menu)\b/g,
        "",
      ).trim();
      const target = iconText || text;

      if (href?.startsWith("#") && href.length > 1) return href;
      if (target.includes("features")) return "/#features";
      if (target.includes("how it works")) return "/#how-it-works";
      if (target.includes("solutions")) return "/#solutions";
      if (target === "pricing" || target.includes("pricing")) return "/pricing";
      if (target.includes("sign in") || target.includes("login")) return "/auth";
      if (target.includes("sign up") || target.includes("get started") || target.includes("free trial")) return "/onboarding";
      if (target.includes("choose plan") || target.includes("upgrade") || target.includes("start 14-day")) return "/onboarding/plan";
      if (target.includes("dashboard") || target === "home") return "/dashboard";
      if (target.includes("documents") || target.includes("open document")) return "/documents";
      if (target.includes("ask about this") || target.includes("conversations")) return "/conversations";
      if (target === "search" || target.includes("global search")) return "/search";
      if (target.includes("analytics")) return "/analytics";
      if (target.includes("settings")) return "/settings";
      if (target.includes("profile") || target.includes("account")) return "/settings/profile";
      if (target.includes("billing")) return "/settings/billing";
      if (target.includes("api keys")) return "/settings/api-keys";
      if (target.includes("security")) return "/settings/security";
      if (target.includes("integrations")) return "/settings/integrations";
      if (target.includes("upload") || target.includes("new document")) return "/onboarding/upload";
      if (target === "back" && title.includes("Upload")) return "/onboarding/workspace";
      if (target === "back" && title.includes("Demo")) return "/onboarding/upload";
      if (target === "back" && title.includes("Choose Plan")) return "/onboarding/demo";
      if (target.includes("continue") && title.includes("Upload")) return "/onboarding/demo";
      if (target.includes("continue") && title.includes("Demo")) return "/onboarding/plan";
      if (target.includes("continue") && title.includes("Workspace")) return "/onboarding/upload";
      if (target.includes("continue") && title.includes("Choose Plan")) return "/dashboard";
      if (target.includes("interactive demo") || target.includes("demo") || target.includes("extract")) return "/onboarding/demo";
      if (target.includes("skip setup")) return "/dashboard";
      if (target.includes("privacy")) return "/privacy";
      if (target.includes("terms")) return "/terms";
      if (target.includes("contact") || target.includes("support")) return "/contact";
      return null;
    };

    const clickHandler = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const control = target?.closest("a, button") as HTMLAnchorElement | HTMLButtonElement | null;
      if (!control) return;

      const href = control instanceof HTMLAnchorElement ? control.getAttribute("href") : null;
      const route = routeForLabel(control.textContent || "", href);
      if (!route) return;

      event.preventDefault();
      if (route.startsWith("#") || route.startsWith("/#")) {
        const id = route.replace("/#", "#").slice(1);
        doc.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      go(route);
    };

    const submitHandler = (event: SubmitEvent) => {
      event.preventDefault();
      go(title.includes("Authentication") ? "/dashboard" : "/onboarding/upload");
    };

    doc.removeEventListener("click", clickHandler);
    doc.addEventListener("click", clickHandler);
    doc.querySelectorAll("form").forEach((form) => {
      form.removeEventListener("submit", submitHandler);
      form.addEventListener("submit", submitHandler);
    });

    if (title.includes("Upload Document")) {
      wireUploadScreen(doc, go);
    }
  };

  return (
    <>
      <iframe
        ref={iframeRef}
        title={title}
        src={`/stitch-export/${folder}/code.html`}
        onLoad={handleLoad}
        style={{
          width: "100%",
          minHeight: "100vh",
          height: "100vh",
          border: 0,
          display: "block",
          background: "#f8f9ff",
        }}
      />
      <CommandCenter />
    </>
  );
}

function wireUploadScreen(doc: Document, go: (path: string) => void) {
  const body = doc.body;
  if (!body || body.dataset.docnovaUploadWired === "true") return;
  body.dataset.docnovaUploadWired = "true";

  const input = doc.createElement("input");
  input.type = "file";
  input.accept = ".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp";
  input.style.display = "none";
  body.appendChild(input);

  const choose = Array.from(doc.querySelectorAll("span, p, button")).find((node) =>
    (node.textContent || "").toLowerCase().includes("choose file"),
  ) as HTMLElement | undefined;

  const dropTitle = Array.from(doc.querySelectorAll("p")).find((node) =>
    (node.textContent || "").toLowerCase().includes("drop a document"),
  );
  const dropZone = dropTitle?.closest(".border-dashed") as HTMLElement | null;
  const supportText = Array.from(doc.querySelectorAll("p")).find((node) =>
    (node.textContent || "").toLowerCase().includes("supported formats"),
  ) as HTMLElement | undefined;

  const setSelectedFile = (name: string) => {
    if (dropTitle) dropTitle.textContent = "Document ready";
    if (choose) choose.textContent = name;
    if (supportText) supportText.textContent = "Ready to continue. Your file is staged for the demo workflow.";
    dropZone?.classList.add("border-primary-container", "bg-surface-container-low");
  };

  choose?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    input.click();
  });

  dropZone?.addEventListener("click", () => input.click());
  dropZone?.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("border-primary-container", "bg-surface-container-low");
  });
  dropZone?.addEventListener("dragleave", () => {
    dropZone.classList.remove("border-primary-container", "bg-surface-container-low");
  });
  dropZone?.addEventListener("drop", (event) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) setSelectedFile(file.name);
  });

  input.addEventListener("change", () => {
    const file = input.files?.[0];
    if (file) setSelectedFile(file.name);
  });

  Array.from(doc.querySelectorAll("button")).forEach((button) => {
    const text = (button.textContent || "").toLowerCase().replace(/\s+/g, " ").trim();
    if (text.includes("finance report")) {
      button.addEventListener("click", () => setSelectedFile("Q3 Finance Report.pdf"));
    }
    if (text.includes("legal contract")) {
      button.addEventListener("click", () => setSelectedFile("Legal Contract Sample.docx"));
    }
    if (text.includes("research summary")) {
      button.addEventListener("click", () => setSelectedFile("Research Summary.pdf"));
    }
    if (text.includes("continue")) {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        go("/onboarding/demo");
      });
    }
    if (text.includes("back")) {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        go("/onboarding/workspace");
      });
    }
    if (text.includes("skip")) {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        go("/dashboard");
      });
    }
  });
}

function CommandCenter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [health, setHealth] = useState<"online" | "offline" | "checking">("checking");
  const [tools, setTools] = useState<BackendTool[]>([]);
  const [documents, setDocuments] = useState<SampleDocument[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadBackendData() {
      try {
        const [healthRes, toolsRes, docsRes] = await Promise.all([
          fetch(`${API_BASE}/api/health`),
          fetch(`${API_BASE}/api/product/tools`),
          fetch(`${API_BASE}/api/documents/sample`),
        ]);
        if (cancelled) return;
        setHealth(healthRes.ok ? "online" : "offline");
        if (toolsRes.ok) setTools((await toolsRes.json()).tools || []);
        if (docsRes.ok) setDocuments((await docsRes.json()).documents || []);
      } catch {
        if (!cancelled) setHealth("offline");
      }
    }

    loadBackendData();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRoutes = useMemo(() => {
    const term = query.toLowerCase().trim();
    return QUICK_ROUTES.filter((route) =>
      `${route.label} ${route.group} ${route.path}`.toLowerCase().includes(term),
    ).slice(0, 8);
  }, [query]);

  const current = QUICK_ROUTES.find((route) => route.path === location.pathname)?.label || "DocNova";

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setAnalysis(null);

    const body = new FormData();
    body.append("file", file);

    try {
      const response = await fetch(`${API_BASE}/api/analyze-document`, {
        method: "POST",
        body,
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Analysis failed");
      setAnalysis(payload);
      setOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  const chipStyle = {
    border: "1px solid rgba(195,198,215,0.85)",
    background: "rgba(255,255,255,0.86)",
    color: "#0b1c30",
    borderRadius: 999,
    padding: "7px 10px",
    fontSize: 12,
    fontWeight: 700,
  } as const;

  return (
    <div
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        zIndex: 1000,
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#0b1c30",
      }}
    >
      {open && (
        <section
          style={{
            width: "min(440px, calc(100vw - 32px))",
            maxHeight: "min(760px, calc(100vh - 96px))",
            overflow: "auto",
            background: "rgba(248,249,255,0.96)",
            border: "1px solid rgba(195,198,215,0.95)",
            borderRadius: 18,
            boxShadow: "0 24px 70px rgba(11,28,48,0.22)",
            backdropFilter: "blur(16px)",
            marginBottom: 12,
          }}
        >
          <div style={{ padding: 18, borderBottom: "1px solid rgba(195,198,215,0.75)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "#005e6e", textTransform: "uppercase" }}>
                  Command Center
                </p>
                <h2 style={{ margin: "5px 0 0", fontSize: 20, lineHeight: "26px" }}>{current}</h2>
              </div>
              <span
                style={{
                  ...chipStyle,
                  color: health === "online" ? "#006b3f" : health === "offline" ? "#93000a" : "#434655",
                }}
              >
                Backend {health}
              </span>
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search pages and actions"
              style={{
                width: "100%",
                height: 42,
                marginTop: 14,
                border: "1px solid #c3c6d7",
                borderRadius: 10,
                padding: "0 12px",
                fontSize: 14,
                outline: "none",
                background: "#fff",
              }}
            />
          </div>

          <div style={{ padding: 18, display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {filteredRoutes.map((route) => (
                <button
                  key={route.path}
                  onClick={() => {
                    navigate(route.path);
                    setOpen(false);
                  }}
                  style={{
                    textAlign: "left",
                    border: route.path === location.pathname ? "1px solid #2563eb" : "1px solid #d3e4fe",
                    background: route.path === location.pathname ? "#dbe1ff" : "#fff",
                    borderRadius: 10,
                    padding: 12,
                    cursor: "pointer",
                    minHeight: 64,
                  }}
                >
                  <span style={{ display: "block", fontSize: 13, fontWeight: 800 }}>{route.label}</span>
                  <span style={{ display: "block", marginTop: 3, fontSize: 11, color: "#5d6274" }}>{route.group}</span>
                </button>
              ))}
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                border: "1px dashed #2563eb",
                background: "#eef4ff",
                borderRadius: 12,
                padding: 14,
                cursor: "pointer",
              }}
            >
              <span>
                <strong style={{ display: "block", fontSize: 14 }}>Analyze a document</strong>
                <span style={{ fontSize: 12, color: "#434655" }}>PDF, DOCX, XLSX, PPTX, or image</span>
              </span>
              <span style={chipStyle}>{uploading ? "Reading..." : "Upload"}</span>
              <input type="file" onChange={handleFileChange} style={{ display: "none" }} />
            </label>

            {error && <p style={{ margin: 0, color: "#93000a", fontSize: 13, fontWeight: 700 }}>{error}</p>}

            {analysis && (
              <div style={{ border: "1px solid #d3e4fe", borderRadius: 12, background: "#fff", padding: 14 }}>
                <h3 style={{ margin: 0, fontSize: 15 }}>{analysis.document.filename}</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                  <span style={chipStyle}>{analysis.document.kind}</span>
                  <span style={chipStyle}>{analysis.analysis.summary.estimatedPages || 1} pages</span>
                  <span style={chipStyle}>{analysis.analysis.summary.risk} risk</span>
                </div>
                <ul style={{ margin: "12px 0 0", paddingLeft: 18, color: "#434655", fontSize: 13 }}>
                  {analysis.analysis.recommendations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Backend tools</h3>
              <div style={{ display: "grid", gap: 8 }}>
                {tools.slice(0, 4).map((tool) => (
                  <div key={tool.id} style={{ border: "1px solid #d3e4fe", borderRadius: 10, padding: 10, background: "#fff" }}>
                    <strong style={{ display: "block", fontSize: 13 }}>{tool.label}</strong>
                    <span style={{ color: "#5d6274", fontSize: 12 }}>{tool.description}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Recent documents</h3>
              <div style={{ display: "grid", gap: 8 }}>
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => navigate("/documents/viewer")}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      textAlign: "left",
                      border: "1px solid #d3e4fe",
                      borderRadius: 10,
                      padding: 10,
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <span>
                      <strong style={{ display: "block", fontSize: 13 }}>{doc.name}</strong>
                      <span style={{ color: "#5d6274", fontSize: 12 }}>{doc.pages} pages</span>
                    </span>
                    <span style={chipStyle}>{doc.status}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <button
        onClick={() => setOpen((value) => !value)}
        style={{
          float: "right",
          height: 48,
          border: 0,
          borderRadius: 999,
          padding: "0 18px",
          background: "#004ac6",
          color: "#fff",
          fontWeight: 800,
          boxShadow: "0 14px 34px rgba(0,74,198,0.34)",
          cursor: "pointer",
        }}
      >
        {open ? "Close" : "Command Center"}
      </button>
    </div>
  );
}

export function StitchHomePage() {
  return <StitchScreen title="DocNova Home" folder="14-docnova-home-clinical-precision" />;
}

export function StitchAuthPage() {
  return <StitchScreen title="DocNova Authentication" folder="13-docnova-authentication-clinical-precision" />;
}

export function StitchDashboardPage() {
  return <StitchScreen title="DocNova Dashboard" folder="12-docnova-dashboard-clinical-precision" />;
}

export function StitchDocumentLibraryPage() {
  return <StitchScreen title="DocNova Document Library" folder="11-docnova-document-library-clinical-precision" />;
}

export function StitchDocumentViewerPage() {
  return <StitchScreen title="DocNova Document Viewer" folder="10-docnova-document-viewer-clinical-precision" />;
}

export function StitchConversationsPage() {
  return <StitchScreen title="DocNova Conversations" folder="09-docnova-conversations-clinical-precision" />;
}

export function StitchGlobalSearchPage() {
  return <StitchScreen title="DocNova Global Search" folder="08-docnova-global-search-clinical-precision" />;
}

export function StitchProfileSettingsPage() {
  return <StitchScreen title="DocNova Settings Profile" folder="07-docnova-settings-profile" />;
}

export function StitchBillingSettingsPage() {
  return <StitchScreen title="DocNova Settings Billing and Plan" folder="06-docnova-settings-billing-plan" />;
}

export function StitchAnalyticsPage() {
  return <StitchScreen title="DocNova Analytics" folder="05-docnova-analytics-clinical-precision" />;
}

export function StitchApiKeysSettingsPage() {
  return <StitchScreen title="DocNova Settings API Keys" folder="04-docnova-settings-api-keys" />;
}

export function StitchSecuritySettingsPage() {
  return <StitchScreen title="DocNova Settings Security" folder="03-docnova-settings-security" />;
}

export function StitchIntegrationsSettingsPage() {
  return <StitchScreen title="DocNova Settings Integrations" folder="02-docnova-settings-integrations" />;
}

export function StitchPricingPage() {
  return <StitchScreen title="DocNova Pricing" folder="01-docnova-pricing-clinical-precision" />;
}

export function StitchOnboardingWorkspacePage() {
  return <StitchScreen title="DocNova Onboarding Workspace Setup" folder="15-docnova-onboarding-step-1-workspace-setup" />;
}

export function StitchOnboardingUploadPage() {
  return <StitchScreen title="DocNova Onboarding Upload Document" folder="16-docnova-onboarding-step-2-upload-document" />;
}

export function StitchOnboardingDemoPage() {
  return <StitchScreen title="DocNova Onboarding Interactive Demo" folder="18-docnova-onboarding-step-3-interactive-demo" />;
}

export function StitchOnboardingPlanPage() {
  return <StitchScreen title="DocNova Onboarding Choose Plan" folder="17-docnova-onboarding-step-4-choose-plan" />;
}
