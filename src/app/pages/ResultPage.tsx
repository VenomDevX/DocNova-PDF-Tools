import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { motion } from "motion/react";
import { AlertCircle, Loader2, RotateCcw } from "lucide-react";
import { pdfApi, type ResultJobResponse, type ResultPreviewResponse } from "../../services/pdfApi";
import { ResultPageLayout } from "../components/result/ResultPageLayout";
import { getFriendlyErrorMessage } from "../../utils/errorHandler";
import { ProcessingOverlay } from "../components/tools/ProcessingOverlay";

type ResultState = "loading" | "ready" | "error";

export default function ResultPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state as any;
  const [state, setState] = useState<ResultState>(stateData?.preloadedJob ? "ready" : "loading");
  const [job, setJob] = useState<ResultJobResponse | null>(stateData?.preloadedJob || null);
  const [preview, setPreview] = useState<ResultPreviewResponse | null>(stateData?.preloadedPreview || null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadResult() {
      if (!jobId) {
        setError("Result id is missing.");
        setState("error");
        return;
      }

      if (stateData?.preloadedJob) {
        return;
      }

      setState("loading");
      setJob(null);
      setPreview(null);
      setError("");
      try {
        const loadedJob = await pdfApi.getResultJob(jobId);
        let loadedPreview: ResultPreviewResponse | null = null;
        try {
          loadedPreview = loadedJob.kind === "pdf"
            ? await pdfApi.getResultPreview(jobId, { pageRange: `1-${Math.min(4, Math.max(loadedJob.pageCount, 1))}` })
            : await pdfApi.getResultPreview(jobId);
        } catch {
          loadedPreview = null;
        }
        if (cancelled) return;
        setJob(loadedJob);
        setPreview(loadedPreview);
        setState("ready");
      } catch (loadError) {
        if (cancelled) return;
        setError(getFriendlyErrorMessage(loadError, 'server'));
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
    void pdfApi.deleteResultJob(jobId).catch(() => { });
  };

  if (state === "loading") {
    const toolAction = stateData?.processingToolAction || "Preparing clean preview";
    const files = stateData?.processingFiles;

    return (
      <div className="relative min-h-screen">
        <ProcessingOverlay
          title={`${toolAction} document...`}
          description="Applying AI operations and generating your output. This may take a few moments."
          progressMessage="Processing Output"
          files={files}
        />
      </div>
    );
  }

  if (state === "error" || !job) {
    return (
      <div style={{ minHeight: "100vh", paddingTop: 110, display: "grid", placeItems: "center", background: "var(--dn-bg)", color: "var(--dn-t1)", paddingInline: "1.5rem" }}>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          style={{ width: "min(100%, 460px)", borderRadius: "4px", border: "1px solid var(--dn-border)", background: "var(--dn-bg-card)", boxShadow: "var(--dn-shadow)", padding: "1.25rem", textAlign: "center" }}>
          <div style={{ width: 50, height: 50, borderRadius: "4px", background: "rgba(239,68,68,0.12)", color: "#f87171", display: "grid", placeItems: "center", margin: "0 auto 0.9rem" }}>
            <AlertCircle size={24} />
          </div>
          <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 900 }}>Result not available</h1>
          <p style={{ color: "var(--dn-t3)", lineHeight: 1.6, margin: "0.6rem 0 1rem" }}>{error || "This result may have expired or been deleted."}</p>
          <motion.button onClick={() => navigate("/tools")} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", borderRadius: "4px", border: "none", cursor: "pointer", background: "linear-gradient(135deg,#1d4ed8,#60a5fa)", color: "#fff", padding: "0.72rem 1rem", fontWeight: 900 }}>
            <RotateCcw size={16} /> Start over
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return <ResultPageLayout key={jobId} job={job} preview={preview} onDelete={handleDelete} />;
}
