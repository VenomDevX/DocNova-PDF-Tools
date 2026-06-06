import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { AlertCircle, Loader2, RotateCcw } from "lucide-react";
import { pdfApi, type ResultJobResponse, type ResultPreviewResponse } from "../../services/pdfApi";
import { ResultPageLayout } from "../components/result/ResultPageLayout";

type ResultState = "loading" | "ready" | "error";

export default function ResultPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<ResultState>("loading");
  const [job, setJob] = useState<ResultJobResponse | null>(null);
  const [preview, setPreview] = useState<ResultPreviewResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadResult() {
      if (!jobId) {
        setError("Result id is missing.");
        setState("error");
        return;
      }

      setState("loading");
      setError("");

      try {
        const loadedJob = await pdfApi.getResultJob(jobId);
        const loadedPreview = loadedJob.kind === "pdf"
          ? await pdfApi.getResultPreview(jobId, { pageRange: `1-${Math.min(4, Math.max(loadedJob.pageCount, 1))}` })
          : await pdfApi.getResultPreview(jobId);
        if (cancelled) return;
        setJob(loadedJob);
        setPreview(loadedPreview);
        setState("ready");
      } catch (loadError) {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "Could not load this result.");
        setState("error");
      }
    }

    loadResult();

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const handleDelete = async () => {
    if (!jobId) return;
    try {
      await pdfApi.deleteResultJob(jobId);
    } finally {
      navigate("/tools");
    }
  };

  if (state === "loading") {
    return (
      <div style={{ minHeight: "100vh", width: "100%", padding: "96px 1.5rem 2rem", display: "grid", placeItems: "center", background: "var(--dn-bg)", color: "var(--dn-t1)" }}>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulseGlow {
            0%, 100% { opacity: 0.35; transform: scale(0.95); }
            50% { opacity: 0.75; transform: scale(1.08); }
          }
          @keyframes shimmer {
            from { background-position: 200% 0; }
            to { background-position: -200% 0; }
          }
        `}</style>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "min(92vw, 430px)", minHeight: 260, borderRadius: 24, background: "var(--dn-bg-card)", border: "1px solid var(--dn-border)", boxShadow: "0 28px 90px rgba(0,0,0,0.38)", padding: "1.75rem", display: "grid", placeItems: "center", textAlign: "center", willChange: "opacity, transform" }}
        >
          <div style={{ width: "100%" }}>
            <div style={{ width: 74, height: 74, margin: "0 auto 1.1rem", borderRadius: "50%", display: "grid", placeItems: "center", position: "relative", background: "rgba(59,130,246,0.12)" }}>
              <div style={{ position: "absolute", inset: -6, borderRadius: "50%", background: "rgba(59,130,246,0.28)", filter: "blur(10px)", animation: "pulseGlow 2s ease-in-out infinite", willChange: "opacity, transform" }} />
              <div style={{ position: "absolute", inset: 8, borderRadius: "50%", border: "3px solid rgba(148,163,184,0.18)", borderTopColor: "#60a5fa", animation: "spin 1.2s linear infinite", transformOrigin: "center", willChange: "transform" }} />
              <div style={{ position: "absolute", inset: 18, borderRadius: "50%", background: "rgba(96,165,250,0.16)" }} />
              <Loader2 size={24} color="#bfdbfe" style={{ animation: "spin 1.2s linear infinite", position: "relative", transformOrigin: "center", willChange: "transform" }} />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <div style={{ fontWeight: 900, fontSize: "1.12rem", letterSpacing: "-0.02em" }}>Preparing clean preview</div>
              <div style={{ color: "var(--dn-t4)", fontSize: "0.86rem", margin: "0.38rem auto 1.15rem", lineHeight: 1.55, maxWidth: 300 }}>Loading result metadata and pages.</div>
            </motion.div>
            <div style={{ height: 7, width: "100%", borderRadius: 999, overflow: "hidden", background: "var(--dn-border2)" }}>
              <motion.div
                initial={{ width: "18%" }}
                animate={{ width: "62%" }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#2563eb,#60a5fa,#93c5fd)", backgroundSize: "200% 100%", animation: "shimmer 1.8s linear infinite", willChange: "width, background-position" }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (state === "error" || !job) {
    return (
      <div style={{ minHeight: "100vh", paddingTop: 110, display: "grid", placeItems: "center", background: "var(--dn-bg)", color: "var(--dn-t1)", paddingInline: "1.5rem" }}>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          style={{ width: "min(100%, 460px)", borderRadius: 22, border: "1px solid var(--dn-border)", background: "var(--dn-bg-card)", boxShadow: "var(--dn-shadow)", padding: "1.25rem", textAlign: "center" }}>
          <div style={{ width: 50, height: 50, borderRadius: 16, background: "rgba(239,68,68,0.12)", color: "#f87171", display: "grid", placeItems: "center", margin: "0 auto 0.9rem" }}>
            <AlertCircle size={24} />
          </div>
          <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 900 }}>Result not available</h1>
          <p style={{ color: "var(--dn-t3)", lineHeight: 1.6, margin: "0.6rem 0 1rem" }}>{error || "This result may have expired or been deleted."}</p>
          <Link to="/tools" style={{ textDecoration: "none" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", borderRadius: 999, background: "linear-gradient(135deg,#1d4ed8,#60a5fa)", color: "#fff", padding: "0.72rem 1rem", fontWeight: 900 }}>
              <RotateCcw size={16} /> Start over
            </div>
          </Link>
        </motion.div>
      </div>
    );
  }

  return <ResultPageLayout job={job} preview={preview} onDelete={handleDelete} />;
}
