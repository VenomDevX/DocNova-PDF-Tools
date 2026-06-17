import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  ChevronDown,
  Download,
  Edit3,
  FileArchive,
  FileImage,
  FileText,
  Hash,
  Lightbulb,
  Maximize2,
  Minus,
  MoreHorizontal,
  Plus,
  Printer,
  RotateCcw,
  Scissors,
  Share2,
  ShieldCheck,
  Trash2,
  XCircle,
  Loader2,
  FileStack,
  RotateCw,
  FileOutput
} from "lucide-react";
import { pdfApi, type ResultJobResponse, type ResultPreviewResponse } from "../../../services/pdfApi";
import { hardNavigate } from "../../../lib/navigateClean";
import { resetDocNovaState } from "../../../lib/resetDocNovaState";

interface ResultPageLayoutProps {
  job: ResultJobResponse;
  preview: ResultPreviewResponse | null;
  onDelete: (job: ResultJobResponse) => void | Promise<void>;
}

export function ResultPageLayout({ job, preview, onDelete }: ResultPageLayoutProps) {
  const navigate = useNavigate();
  const [showStartOverModal, setShowStartOverModal] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [resettingAction, setResettingAction] = useState<"delete" | "start-over" | "continue" | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStartOver = () => {
    setShowStartOverModal(false);
    setResettingAction("start-over");
    const path = getToolPath(job.toolType);
    resetDocNovaState(job.toolType, job.jobId);
    navigate(path, { replace: true });
  };

  const handleDelete = async () => {
    setResettingAction("delete");
    const path = getToolPath(job.toolType);
    resetDocNovaState(job.toolType, job.jobId);
    await onDelete(job);
    navigate(path, { replace: true });
  };

  const handleContinue = (path: string) => {
    setResettingAction("continue");
    resetDocNovaState(job.toolType, job.jobId);
    navigate(path, {
      state: {
        sourceFileUrl: job.downloadUrl,
        sourceFileName: job.outputFileName
      }
    });
  };

  return (
    <div className="dn-result-layout-root" style={{ height: "100vh", paddingTop: 60, boxSizing: "border-box", display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--dn-bg)", color: "var(--dn-t1)", fontFamily: "'Inter', sans-serif", position: "relative" }}>
      <style>{`
        /* ── Light mode (default) ────────────────────────────────── */
        .dn-result-layout-root {
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
          --result-preview-bg: transparent;
          --result-sidebar-bg: rgba(255, 255, 255, 0.92);
          --result-soft-bg: rgba(37, 99, 235, 0.06);
          --result-accent-soft: rgba(37, 99, 235, 0.10);
          --result-page-shadow: 0 8px 32px rgba(15,23,42,0.10), 0 1px 4px rgba(15,23,42,0.06);
          --result-toolbar-bg: rgba(255, 255, 255, 0.88);
          --result-toolbar-border: rgba(15, 23, 42, 0.14);
          --result-toolbar-text: #0f172a;
          --result-toolbar-text-muted: #64748b;
          --result-toolbar-shadow: 0 4px 20px rgba(15,23,42,0.10);
          --result-panel-shadow: 0 8px 24px rgba(15,23,42,0.10);
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        /* ── Dark mode ───────────────────────────────────────────── */
        [data-theme="dark"] .dn-result-layout-root {
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
          --result-preview-bg: transparent;
          --result-sidebar-bg: rgba(15, 23, 42, 0.82);
          --result-soft-bg: rgba(23, 37, 84, 0.26);
          --result-accent-soft: rgba(37, 99, 235, 0.22);
          --result-page-shadow: 0 24px 70px rgba(0,0,0,0.42);
          --result-toolbar-bg: rgba(15, 23, 42, 0.55);
          --result-toolbar-border: rgba(255, 255, 255, 0.10);
          --result-toolbar-text: rgba(255, 255, 255, 0.95);
          --result-toolbar-text-muted: rgba(255, 255, 255, 0.50);
          --result-toolbar-shadow: 0 10px 30px rgba(0,0,0,0.30);
          --result-panel-shadow: 0 10px 30px rgba(0,0,0,0.30);
        }
        @media (max-width: 1080px) {
          .dn-result-layout-root { height: auto !important; display: block !important; overflow: visible !important; }
          .dn-result-shell { height: auto !important; display: block !important; overflow: visible !important; padding-bottom: 3rem !important; }
          .dn-result-grid { display: flex !important; flex-direction: column !important; overflow: visible !important; min-height: auto !important; height: auto !important; }
          .dn-result-preview-container { height: 620px !important; grid-template-columns: 160px minmax(0,1fr) !important; }
          .dn-result-panel { height: auto !important; overflow-y: visible !important; padding-right: 0 !important; border-left: none !important; }
        }
        @media print {
          nav, footer, .dn-result-panel, .dn-result-toolbar { display: none !important; }
          .dn-result-shell { padding: 0 !important; }
          .dn-result-preview-container { padding: 0 !important; height: auto !important; overflow: visible !important; }
        }
        .dn-main-wrap {
          height: auto !important;
          min-height: 100vh !important;
          padding-top: 0 !important;
          overflow: visible !important;
          background: var(--dn-bg) !important;
        }
        .dn-nav-wrap {
          background: var(--dn-bg-card) !important;
          background-color: var(--dn-bg-card) !important;
          border-bottom: 1px solid var(--dn-border2) !important;
          box-shadow: none !important;
        }
        .dn-nav-wrap > nav {
          background: transparent !important;
          background-color: transparent !important;
          background-image: none !important;
          border: 0 !important;
          border-bottom: 0 !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }
        [data-theme="dark"] .dn-nav-wrap {
          background: transparent !important;
          background-color: transparent !important;
          border: 0 !important;
          box-shadow: none !important;
        }
        .dn-main-wrap > footer {
          display: block !important;
          flex-shrink: 0 !important;
        }
        [data-theme="light"] .dn-result-layout-root .dn-dark-blobs {
          display: none;
        }
        html:not([data-theme="dark"]) .dn-result-layout-root .dn-dark-blobs {
          display: none;
        }
        
        /* Modern Clean Scrollbar */
        .dn-clean-scroll {
          -ms-overflow-style: auto !important;
          scrollbar-width: thin !important;
          scrollbar-color: var(--dn-convert-scroll-thumb) var(--dn-convert-scroll-track) !important;
          --dn-convert-scroll-thumb: rgba(100, 116, 139, 0.5);
          --dn-convert-scroll-track: rgba(226, 232, 240, 0.42);
        }
        [data-theme="dark"] .dn-clean-scroll {
          --dn-convert-scroll-thumb: rgba(96, 165, 250, 0.58);
          --dn-convert-scroll-track: rgba(15, 23, 42, 0.5);
        }
        .dn-clean-scroll::-webkit-scrollbar {
          display: block !important;
          width: 8px;
          height: 8px;
        }
        .dn-clean-scroll::-webkit-scrollbar-thumb {
          background: var(--dn-convert-scroll-thumb);
          border: 2px solid var(--dn-convert-scroll-track);
          border-radius: 999px;
        }
        .dn-clean-scroll::-webkit-scrollbar-track {
          background: var(--dn-convert-scroll-track);
        }

        .dn-action-btn {
          border: 1px solid var(--dn-border);
          border-radius: 6px;
          transition: all 0.15s ease;
          background: var(--dn-bg-card);
          color: var(--dn-t2);
        }
        .dn-action-btn:hover:not(:disabled) {
          background: var(--dn-bg-subtle);
          border-color: #3b82f6;
        }
        .dn-action-btn:active:not(:disabled) {
          transform: scale(0.98);
        }
        .dn-action-btn-danger {
          border: 1px solid rgba(239,68,68,0.32);
          border-radius: 6px;
          transition: all 0.15s ease;
          background: var(--dn-bg-card);
          color: var(--dn-t2);
        }
        .dn-action-btn-danger:hover:not(:disabled) {
          background: rgba(239,68,68,0.10);
          border-color: #ef4444;
        }
        .dn-action-btn-danger:active:not(:disabled) {
          transform: scale(0.98);
        }

        @keyframes drift1 {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(5vw, 5vh) scale(1.1); }
          66% { transform: translate(-2vw, 8vh) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes drift2 {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-5vw, -5vh) scale(0.95); }
          66% { transform: translate(4vw, -2vh) scale(1.05); }
          100% { transform: translate(0, 0) scale(1); }
        }
      `}</style>

      <div className="dn-dark-blobs fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#2563eb]/15 rounded-full blur-[100px] animate-[drift1_25s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#0267b8]/15 rounded-full blur-[120px] animate-[drift2_30s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#b4c5ff]/5 rounded-full blur-[150px] animate-[drift1_40s_ease-in-out_infinite]"></div>
      </div>

      <div className="dn-result-shell" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", width: "100%", margin: 0, padding: 0, position: "relative", zIndex: 10 }}>

        <div className="dn-result-grid" style={{ flex: 1, display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: 0, alignItems: "stretch", overflow: "hidden", minHeight: 0 }}>
          <div style={{ minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", gap: "1rem", minHeight: 112, flexShrink: 0, padding: "0 26px", zIndex: 10, borderBottom: "1px solid var(--dn-border2)", background: "transparent" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", minWidth: 0 }}>
                <h1 style={{ margin: 0, color: "var(--dn-t1)", fontSize: "1.55rem", fontWeight: 850, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                  {job.toolLabel || job.toolType || "Processed File"}
                </h1>
                <span style={{ color: "#3b82f6", fontSize: "0.9rem", fontWeight: 750, whiteSpace: "nowrap" }}>{getResultHeaderMode(job)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: 0 }}>
                <div style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 5, background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#bfdbfe", display: "grid", placeItems: "center", boxShadow: "0 10px 26px rgba(37,99,235,0.22)" }}>
                  <FileText size={22} strokeWidth={1.8} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ margin: 0, color: "var(--dn-t1)", fontSize: "1.12rem", fontWeight: 800, maxWidth: "min(70vw, 820px)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {job.outputFileName}
                  </h2>
                  <p style={{ margin: "0.35rem 0 0", color: "var(--dn-t3)", fontSize: "0.9rem", fontWeight: 550 }}>
                    {formatResultPages(job.pageCount)} - {formatBytes(job.outputFileSize)}
                  </p>
                </div>
              </div>
            </div>
            <CleanPDFPreview key={job.jobId} job={job} preview={preview} />
          </div>
          <ResultActionPanel key={job.jobId} job={job} onDelete={handleDelete} onStartOver={() => setShowStartOverModal(true)} onContinue={handleContinue} resettingAction={resettingAction} showToast={showToast} />
        </div>
      </div>

      <ConfirmModal
        open={showStartOverModal}
        title="Start Over"
        description="Are you sure you want to start over? This will clear the current processed file and return you to the upload screen."
        confirmText="Yes, start over"
        onConfirm={handleStartOver}
        onCancel={() => setShowStartOverModal(false)}
        loading={resettingAction === "start-over"}
      />

      <Toast message={toast?.message} type={toast?.type} />
    </div>
  );
}

export function CleanPDFPreview({ job, preview }: { job: ResultJobResponse; preview: ResultPreviewResponse | null }) {
  const pages = useMemo(() => preview?.pages || [], [preview?.pages]);
  const archiveItems = useMemo(() => preview?.items?.length ? preview.items : job.items, [job.items, preview?.items]);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [loadedPages, setLoadedPages] = useState<Record<number, string>>({});
  const [failedPages, setFailedPages] = useState<Set<number>>(() => new Set());
  const loadedPagesRef = useRef<Record<number, string>>({});
  const loadingRangesRef = useRef<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const isPdfPreview = preview?.kind === "pdf";
  const isImagePreview = preview?.kind === "image";
  const hasRenderablePages = isPdfPreview || isImagePreview;
  const totalPages = hasRenderablePages ? Math.max(preview?.total || job.pageCount || pages.length || 0, pages.length || 1) : 1;
  const pageNumbers = useMemo(() => (
    hasRenderablePages ? Array.from({ length: totalPages }, (_, index) => index + 1) : [1]
  ), [hasRenderablePages, totalPages]);
  const pageBadge = hasRenderablePages
    ? totalPages
    : preview?.kind === "archive"
      ? Math.max(archiveItems.length, 1)
      : 1;

  useEffect(() => {
    const nextPages = pages.reduce<Record<number, string>>((result, page) => {
      if (page.image) result[page.page] = page.image;
      return result;
    }, {});
    loadedPagesRef.current = nextPages;
    loadingRangesRef.current.clear();
    setLoadedPages(nextPages);
    setFailedPages(new Set());
    setCurrentPage(1);
    pageRefs.current.clear();
  }, [job.jobId, pages]);

  const loadPageBatch = useCallback(async (pageNumber: number) => {
    if (!isPdfPreview || !totalPages) return;
    const start = Math.max(1, pageNumber);
    const end = Math.min(totalPages, start + 3);
    const rangeKey = `${start}-${end}`;
    const rangePages = Array.from({ length: end - start + 1 }, (_, index) => start + index);
    if (loadingRangesRef.current.has(rangeKey)) return;
    const needsPages = rangePages.some(page => !loadedPagesRef.current[page]);
    if (!needsPages) return;

    loadingRangesRef.current.add(rangeKey);
    try {
      const result = await pdfApi.getResultPreview(job.jobId, { pageRange: rangeKey });
      const nextPages = (result.pages || []).reduce<Record<number, string>>((acc, page) => {
        if (page.image) acc[page.page] = page.image;
        return acc;
      }, {});
      loadedPagesRef.current = { ...loadedPagesRef.current, ...nextPages };
      setLoadedPages(prev => ({ ...prev, ...nextPages }));
      if (Object.keys(nextPages).length) {
        setFailedPages(prev => {
          const next = new Set(prev);
          Object.keys(nextPages).forEach(page => next.delete(Number(page)));
          return next;
        });
      }
    } catch {
      setFailedPages(prev => {
        const next = new Set(prev);
        rangePages.forEach(page => next.add(page));
        return next;
      });
    } finally {
      loadingRangesRef.current.delete(rangeKey);
    }
  }, [isPdfPreview, job.jobId, totalPages]);

  useEffect(() => {
    if (isPdfPreview && totalPages) {
      loadPageBatch(1);
    }
  }, [isPdfPreview, loadPageBatch, totalPages]);

  useEffect(() => {
    if (!hasRenderablePages || !scrollRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));

      if (visible[0]) {
        const page = Number((visible[0].target as HTMLElement).dataset.page);
        if (page) setCurrentPage(page);
      }

      visible.forEach(entry => {
        const page = Number((entry.target as HTMLElement).dataset.page);
        if (page && isPdfPreview && !loadedPagesRef.current[page]) {
          loadPageBatch(page);
        }
      });
    }, {
      root: scrollRef.current,
      rootMargin: "720px 0px",
      threshold: [0.08, 0.32, 0.6],
    });

    pageRefs.current.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [hasRenderablePages, isPdfPreview, loadPageBatch, pageNumbers]);

  const goToPage = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));
    setCurrentPage(nextPage);
    loadPageBatch(nextPage);
    pageRefs.current.get(nextPage)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const previewUnavailable = !preview || (!hasRenderablePages && preview.kind !== "text" && preview.kind !== "archive");

  return (
    <section className="dn-result-preview-container" style={{ display: "grid", gridTemplateColumns: "160px minmax(0,1fr)", height: "100%", minHeight: 0, overflow: "hidden", background: "transparent" }}>
      <aside style={{ minHeight: 0, overflow: "hidden", borderRight: "none", background: "transparent", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 56, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "none", padding: "0 16px" }}>
          <h2 style={{ margin: 0, color: "var(--dn-t1)", fontSize: "0.875rem", fontWeight: 600 }}>Pages</h2>
          <span style={{ color: "var(--dn-t3)", fontSize: "0.875rem", fontWeight: 600 }}>
            {pageBadge}
          </span>
        </div>

        <div className="dn-clean-scroll" style={{ minHeight: 0, flex: 1, overflowY: "auto", padding: "14px 12px" }}>
          {pageNumbers.map((pageNumber) => {
            const image = loadedPages[pageNumber] || pages.find(page => page.page === pageNumber)?.image;
            const active = currentPage === pageNumber;
            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => goToPage(pageNumber)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", border: "none", background: "transparent", padding: "0 0 16px", cursor: hasRenderablePages ? "pointer" : "default", textAlign: "center", opacity: active ? 1 : 0.7, transition: "opacity 0.2s" }}
              >
                <div style={{ width: "100%", borderRadius: 8, overflow: "hidden", background: "#ffffff", boxShadow: active ? "0 0 0 2px #3b82f6" : "0 6px 18px rgba(15,23,42,0.06)", display: "flex", flexDirection: "column" }}>
                  {image ? (
                    <img src={`data:image/jpeg;base64,${image}`} alt={`Page ${pageNumber}`} style={{ width: "100%", height: "auto", objectFit: "contain", display: "block" }} />
                  ) : (
                    <ThumbnailPlaceholder kind={preview?.kind} page={pageNumber} />
                  )}
                </div>
                <p style={{ margin: "8px 0 0", color: active ? "#3b82f6" : "var(--dn-t2)", fontSize: "0.75rem", fontWeight: 600 }}>{hasRenderablePages ? `Page ${pageNumber}` : getFallbackThumbLabel(preview?.kind)}</p>
              </button>
            );
          })}
        </div>
      </aside>

      <section style={{ position: "relative", minWidth: 0, minHeight: 0, overflow: "hidden", background: "transparent", display: "flex", flexDirection: "column" }}>
        <div id="print-area" ref={scrollRef} className="dn-clean-scroll" style={{ flex: 1, overflowY: "auto", overflowX: "auto", minHeight: 0, padding: "28px 32px", scrollBehavior: "smooth" }}>
          {hasRenderablePages && (
            <div style={{ display: "grid", gap: 28, justifyItems: "center" }}>
              {pageNumbers.map(pageNumber => {
                const image = loadedPages[pageNumber] || pages.find(page => page.page === pageNumber)?.image;
                return (
                  <div
                    key={pageNumber}
                    data-page={pageNumber}
                    ref={element => {
                      if (element) pageRefs.current.set(pageNumber, element);
                      else pageRefs.current.delete(pageNumber);
                    }}
                    style={{ width: "max-content", maxWidth: "100%", display: "grid", justifyItems: "center", scrollMarginTop: 18 }}
                  >
                    <div style={{ color: "var(--dn-t3)", fontSize: "0.76rem", fontWeight: 800, marginBottom: 10 }}>Page {pageNumber}</div>
                    {image ? (
                      <PreviewPageImage image={image} alt={`${job.outputFileName} page ${pageNumber}`} zoom={zoom} />
                    ) : (
                      <PreviewPagePlaceholder page={pageNumber} failed={failedPages.has(pageNumber)} zoom={zoom} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {preview?.kind === "text" && !hasRenderablePages && (
            <TextPreview text={preview.text} fileName={job.outputFileName} />
          )}

          {preview?.kind === "archive" && !hasRenderablePages && (
            <ArchivePreview items={archiveItems} fileName={job.outputFileName} />
          )}

          {previewUnavailable && (
            <UnavailablePreview job={job} />
          )}
        </div>

        {hasRenderablePages && (
          <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8, zIndex: 20 }}>
            <div style={{ minWidth: 84, height: 40, border: "1px solid var(--result-toolbar-border)", borderRadius: 4, background: "var(--result-toolbar-bg)", backdropFilter: "blur(16px) saturate(180%)", WebkitBackdropFilter: "blur(16px) saturate(180%)", boxShadow: "var(--result-toolbar-shadow)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "var(--result-toolbar-text)", fontSize: "0.86rem", fontWeight: 800 }}>
              <span>{hasRenderablePages ? currentPage : 1}</span>
              <span style={{ color: "var(--result-toolbar-text-muted)" }}>/</span>
              <span style={{ color: "var(--result-toolbar-text-muted)" }}>{pageBadge}</span>
            </div>
            <button type="button" aria-label="Zoom out" title="Zoom out" onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.65))} style={{ width: 40, height: 40, border: "1px solid var(--result-toolbar-border)", borderRadius: 4, background: "var(--result-toolbar-bg)", backdropFilter: "blur(16px) saturate(180%)", WebkitBackdropFilter: "blur(16px) saturate(180%)", boxShadow: "var(--result-toolbar-shadow)", color: "var(--result-toolbar-text)", display: "grid", placeItems: "center", cursor: "pointer", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "var(--dn-bg-subtle)"} onMouseOut={(e) => e.currentTarget.style.background = "var(--result-toolbar-bg)"}>
              <Minus size={16} />
            </button>
            <div style={{ minWidth: 60, height: 40, border: "1px solid var(--result-toolbar-border)", borderRadius: 4, background: "var(--result-toolbar-bg)", backdropFilter: "blur(16px) saturate(180%)", WebkitBackdropFilter: "blur(16px) saturate(180%)", boxShadow: "var(--result-toolbar-shadow)", display: "grid", placeItems: "center", color: "var(--result-toolbar-text)", fontSize: "0.86rem", fontWeight: 800 }}>{Math.round(zoom * 100)}%</div>
            <button type="button" aria-label="Zoom in" title="Zoom in" onClick={() => setZoom(prev => Math.min(prev + 0.1, 1.55))} style={{ width: 40, height: 40, border: "1px solid var(--result-toolbar-border)", borderRadius: 4, background: "var(--result-toolbar-bg)", backdropFilter: "blur(16px) saturate(180%)", WebkitBackdropFilter: "blur(16px) saturate(180%)", boxShadow: "var(--result-toolbar-shadow)", color: "var(--result-toolbar-text)", display: "grid", placeItems: "center", cursor: "pointer", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "var(--dn-bg-subtle)"} onMouseOut={(e) => e.currentTarget.style.background = "var(--result-toolbar-bg)"}>
              <Plus size={16} />
            </button>
            <button type="button" aria-label="Fit preview" title="Fit preview" onClick={() => setZoom(1)} style={{ width: 40, height: 40, border: "1px solid var(--result-toolbar-border)", borderRadius: 4, background: "var(--result-toolbar-bg)", backdropFilter: "blur(16px) saturate(180%)", WebkitBackdropFilter: "blur(16px) saturate(180%)", boxShadow: "var(--result-toolbar-shadow)", color: "var(--result-toolbar-text)", display: "grid", placeItems: "center", cursor: "pointer", transition: "background 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "var(--dn-bg-subtle)"} onMouseOut={(e) => e.currentTarget.style.background = "var(--result-toolbar-bg)"}>
              <Maximize2 size={16} />
            </button>
          </div>
        )}
      </section>
    </section>
  );
}

const PreviewPageImage = memo(function PreviewPageImage({ image, alt, zoom }: { image: string; alt: string; zoom: number }) {
  return (
    <img
      src={`data:image/jpeg;base64,${image}`}
      alt={alt}
      loading="lazy"
      decoding="async"
      style={{
        display: "block",
        width: Math.round(760 * zoom),
        maxWidth: "none",
        minWidth: 0,
        height: "auto",
        margin: "0 auto",
        background: "#fff",
        borderRadius: 2,
        boxShadow: "var(--result-page-shadow)",
      }}
    />
  );
});

function PreviewPagePlaceholder({ page, failed, zoom }: { page: number; failed?: boolean; zoom: number }) {
  return (
    <div style={{
      width: Math.round(760 * zoom),
      aspectRatio: "0.707",
      background: "var(--dn-bg-card)",
      boxShadow: "var(--result-page-shadow)",
      display: "grid",
      placeItems: "center",
      color: "var(--dn-t3)",
      fontSize: "0.88rem",
      fontWeight: 800,
      textAlign: "center",
    }}>
      <div>
        <FileText size={34} color="var(--dn-t4)" strokeWidth={1.5} />
        <div style={{ marginTop: 12 }}>{failed ? "Preview not available" : `Loading page ${page}`}</div>
      </div>
    </div>
  );
}

function ThumbnailPlaceholder({ kind, page }: { kind?: string; page: number }) {
  const isRenderable = kind === "pdf" || kind === "presentation" || kind === "document" || kind === "spreadsheet";
  const Icon = kind === "archive" ? FileArchive : FileText;
  return (
    <div style={{ width: "100%", aspectRatio: "1 / 1.414", display: "grid", placeItems: "center", color: "#94a3b8", fontSize: "0.85rem", fontWeight: 700, padding: "0 8px", textAlign: "center" }}>
      {isRenderable ? "Generating..." : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <Icon size={24} strokeWidth={1.6} />
          <span style={{ fontSize: "0.72rem" }}>{kind === "text" ? "TXT" : page}</span>
        </div>
      )}
    </div>
  );
}

function TextPreview({ text, fileName }: { text?: string; fileName: string }) {
  const hasText = Boolean(text?.trim());
  if (!hasText) {
    return <UnavailablePreview job={{ outputFileName: fileName } as ResultJobResponse} />;
  }

  return (
    <article style={{ width: "min(100%, 840px)", minHeight: 620, margin: "0 auto", background: "var(--dn-bg-card)", color: "var(--dn-t1)", boxShadow: "var(--result-page-shadow)", padding: "3rem", whiteSpace: "pre-wrap", fontFamily: "Inter, system-ui, sans-serif", fontSize: "0.92rem", lineHeight: 1.7 }}>
      {text}
    </article>
  );
}

function ArchivePreview({ items, fileName }: { items: ResultJobItem[]; fileName: string }) {
  if (!items.length) {
    return <UnavailablePreview job={{ outputFileName: fileName } as ResultJobResponse} />;
  }

  return (
    <article style={{ width: "min(100%, 840px)", margin: "0 auto", background: "var(--dn-bg-card)", color: "var(--dn-t1)", boxShadow: "var(--result-page-shadow)", padding: "2.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ width: 52, height: 52, background: "var(--result-accent-soft)", color: "#2563eb", display: "grid", placeItems: "center" }}>
          <FileArchive size={25} strokeWidth={1.8} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "1.2rem" }}>Generated files</div>
          <div style={{ color: "var(--dn-t3)", fontSize: "0.9rem", marginTop: "0.2rem" }}>{items.length} files inside this download</div>
        </div>
      </div>
      <div style={{ display: "grid", gap: "0.5rem" }}>
        {items.map((item, index) => (
          <div key={`${item.name}-${index}`} style={{ display: "grid", gridTemplateColumns: "28px minmax(0,1fr) auto", alignItems: "center", gap: "1rem", padding: "0.8rem 0", borderBottom: "1px solid var(--dn-border2)" }}>
            <div style={{ color: "var(--dn-t4)", fontSize: "0.75rem", fontWeight: 800 }}>{String(index + 1).padStart(2, "0")}</div>
            <div style={{ minWidth: 0, fontWeight: 700, fontSize: "0.9rem", color: "var(--dn-t1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
            <div style={{ color: "var(--dn-t3)", fontSize: "0.82rem" }}>{formatBytes(item.size)}</div>
          </div>
        ))}
      </div>
    </article>
  );
}

function UnavailablePreview({ job }: { job: Pick<ResultJobResponse, "outputFileName"> }) {
  return (
    <article style={{ width: "min(100%, 680px)", minHeight: 520, margin: "0 auto", background: "var(--dn-bg-card)", color: "var(--dn-t1)", boxShadow: "var(--result-page-shadow)", display: "grid", placeItems: "center", textAlign: "center", padding: "2rem" }}>
      <div>
        <FileText size={52} color="var(--dn-t4)" strokeWidth={1.4} />
        <h2 style={{ margin: "1.4rem 0 0.45rem", fontSize: "1.12rem", fontWeight: 850, overflowWrap: "anywhere" }}>{job.outputFileName}</h2>
        <p style={{ margin: 0, color: "var(--dn-t2)", fontSize: "0.98rem", fontWeight: 750 }}>Preview not available</p>
        <p style={{ margin: "0.35rem 0 0", color: "var(--dn-t3)", fontSize: "0.92rem" }}>Download from sidebar</p>
      </div>
    </article>
  );
}

function getFallbackThumbLabel(kind?: string) {
  if (kind === "text") return "Text";
  if (kind === "archive") return "Files";
  return "File";
}

export function ResultActionPanel({
  job,
  onDelete,
  onStartOver,
  onContinue,
  resettingAction,
  showToast
}: {
  job: ResultJobResponse;
  onDelete: () => void | Promise<void>;
  onStartOver: () => void;
  onContinue: (path: string) => void;
  resettingAction: "delete" | "start-over" | "continue" | null;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const isResetting = resettingAction !== null;

  const handleDeleteConfirm = async () => {
    setShowDeleteModal(false);
    await onDelete();
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const file = await fetchResultFile(job);
      pdfApi.downloadBlob(file, job.outputFileName);
      showToast("Download started.");
    } catch {
      triggerUrlDownload(job.downloadUrl, job.outputFileName);
      showToast("Download opened in your browser.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: job.outputFileName, url });
        showToast("Shared successfully!");
      } else {
        await navigator.clipboard.writeText(url);
        showToast("Link copied to clipboard!");
      }
    } catch {
      try {
        await copyText(url);
        showToast("Link copied to clipboard!");
      } catch {
        showToast("Failed to share link", "error");
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <aside className="dn-result-panel" style={{ height: "100%", minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column", borderLeft: "1px solid var(--dn-border2)", background: "var(--result-sidebar-bg)" }}>
      <div className="dn-clean-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <ResultSidebarSection title="Information">
          <ResultInfoRow label="File size" value={formatBytes(job.outputFileSize)} />
          <ResultInfoRow label="Pages" value={job.pageCount ? String(job.pageCount) : "-"} />
          <ResultInfoRow label="Format" value={getResultFormat(job)} />
          <ResultInfoRow label="Tool used" value={job.toolLabel || "DocNova"} />
        </ResultSidebarSection>

        <ResultSidebarSection title="Actions">
          <motion.button type="button" disabled={isDownloading || isResetting} onClick={handleDownload} whileHover={{ scale: isDownloading || isResetting ? 1 : 1.01 }} whileTap={{ scale: isDownloading || isResetting ? 1 : 0.99 }}
            style={{ width: "100%", height: 48, border: "none", marginBottom: 12, borderRadius: 6, background: isDownloading || isResetting ? "#94a3b8" : "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.55rem", fontWeight: 800, fontSize: "0.94rem", cursor: isDownloading || isResetting ? "wait" : "pointer", transition: "background 0.2s", boxShadow: "0 10px 22px rgba(37,99,235,0.22)" }}
            onMouseOver={(e) => { e.currentTarget.style.background = "#1d4ed8" }}
            onMouseOut={(e) => { e.currentTarget.style.background = isDownloading || isResetting ? "#94a3b8" : "#2563eb" }}
          >
            {isDownloading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Download size={18} />}
            {isDownloading ? "Preparing..." : "Download File"}
          </motion.button>

          <ExportDropdown job={job} showToast={showToast} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginTop: 12 }}>
            <ActionButton label="Share" icon={<Share2 size={18} />} onClick={handleShare} disabled={isResetting} />
            <ActionButton label="Print" icon={<Printer size={18} />} onClick={handlePrint} disabled={isResetting} />
            <ActionButton label={resettingAction === "delete" ? "Deleting" : "Delete"} icon={resettingAction === "delete" ? <Loader2 size={18} color="#ef4444" style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={18} />} onClick={() => setShowDeleteModal(true)} disabled={isResetting} danger />
          </div>
        </ResultSidebarSection>

        <ContinueToolsPanel key={job.jobId} job={job} onContinue={onContinue} disabled={isResetting} />
      </div>

      <div style={{ flexShrink: 0, padding: 18, borderTop: "1px solid var(--dn-border2)", background: "var(--result-sidebar-bg)" }}>
        <button onClick={onStartOver} disabled={isResetting} className="dn-action-btn" style={{ width: "100%", height: 44, color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: isResetting ? "wait" : "pointer", fontWeight: 800, fontSize: "0.9rem", opacity: isResetting ? 0.75 : 1 }}>
          {resettingAction === "start-over" ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <RotateCcw size={16} />}
          {resettingAction === "start-over" ? "Resetting..." : "Start Over"}
        </button>
      </div>

      <ConfirmModal
        open={showDeleteModal}
        title="Delete File"
        description="Are you sure you want to delete this result file? This action cannot be undone."
        confirmText="Delete"
        danger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
        loading={resettingAction === "delete"}
      />

    </aside>
  );
}

export function ContinueToolsPanel({ job, onContinue, disabled }: { job: ResultJobResponse; onContinue: (path: string) => void; disabled?: boolean }) {
  const tools = useMemo(() => getContinueTools(job), [job.kind, job.outputFileName, job.outputFormat]);

  const handleNavigate = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (disabled) return;
    onContinue(path);
  };

  return (
    <section style={{ padding: "18px 20px", borderBottom: "1px solid var(--dn-border2)" }}>
      <div style={{ color: "var(--dn-t3)", fontSize: "0.72rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Continue Working</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {tools.map(tool => {
          const Icon = tool.icon;
          return (
            <a key={tool.label} href={tool.path} onClick={(e) => handleNavigate(e, tool.path)} aria-disabled={disabled} style={{ textDecoration: "none", color: "var(--dn-t2)", minHeight: 42, borderBottom: "1px solid var(--dn-border2)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", opacity: disabled ? 0.7 : 1, cursor: disabled ? "wait" : "pointer", transition: "color 0.15s ease" }} onMouseOver={(e) => e.currentTarget.style.color = "#2563eb"} onMouseOut={(e) => e.currentTarget.style.color = "var(--dn-t2)"}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <Icon size={16} color="currentColor" />
                <span style={{ fontSize: "0.9rem", fontWeight: 750 }}>{tool.label}</span>
              </span>
              <ChevronDown size={15} style={{ transform: "rotate(-90deg)", color: "var(--dn-t4)", flexShrink: 0 }} />
            </a>
          );
        })}
      </div>
    </section>
  );
}

function ResultSidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: "18px 20px", borderBottom: "1px solid var(--dn-border2)" }}>
      <h3 style={{ margin: "0 0 14px", color: "var(--dn-t3)", fontSize: "0.72rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</h3>
      {children}
    </section>
  );
}

function ResultInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "7px 0", fontSize: "0.9rem" }}>
      <span style={{ color: "var(--dn-t3)" }}>{label}</span>
      <span style={{ color: "var(--dn-t1)", fontWeight: 800, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>{value}</span>
    </div>
  );
}

export function ExportDropdown({ job, showToast }: { job: ResultJobResponse; showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [open, setOpen] = useState(false);
  const [exportingAs, setExportingAs] = useState<string | null>(null);

  const currentFormat = getResultFormat(job);
  const options = getExportOptions(currentFormat);

  const handleExport = async (format: string) => {
    setOpen(false);
    if (format === currentFormat) {
      triggerUrlDownload(job.downloadUrl, job.outputFileName);
      showToast(`Downloaded ${currentFormat}.`);
      return;
    }

    setExportingAs(format);
    try {
      const file = await fetchResultFile(job);

      let resultBlob: Blob | null = null;
      let newName = job.outputFileName.replace(/\.[^/.]+$/, "") + `.${format.toLowerCase()}`;

      if (currentFormat === "PDF" && format === "DOCX") {
        resultBlob = await pdfApi.pdfToWord(file);
      } else if (currentFormat === "PDF" && format === "XLSX") {
        resultBlob = await pdfApi.pdfToExcel(file);
      } else if (currentFormat === "PDF" && format === "PPTX") {
        resultBlob = await pdfApi.pdfToPowerPoint(file);
      } else if (currentFormat === "PDF" && (format === "JPG" || format === "PNG")) {
        const res = await pdfApi.pdfToJpg(file, { format: format.toLowerCase() });
        if (res && res.images && res.images.length > 0) {
          res.images.forEach((image, index) => {
            const imageBlob = pdfApi.base64ToBlob(image.image, `image/${format.toLowerCase()}`);
            const suffix = res.images.length > 1 ? `-page-${image.page || index + 1}` : "";
            pdfApi.downloadBlob(imageBlob, `${job.outputFileName.replace(/\.[^/.]+$/, "")}${suffix}.${format.toLowerCase()}`);
          });
          showToast(`Exported to ${format} successfully!`);
          return;
        }
      } else if (format === "PDF") {
        if (currentFormat === "DOCX" || currentFormat === "DOC") resultBlob = await pdfApi.wordToPDF(file);
        else if (currentFormat === "XLSX" || currentFormat === "XLS") resultBlob = await pdfApi.excelToPDF(file);
        else if (currentFormat === "PPTX" || currentFormat === "PPT") resultBlob = await pdfApi.powerPointToPDF(file);
        else if (currentFormat === "JPG" || currentFormat === "JPEG" || currentFormat === "PNG") resultBlob = await pdfApi.jpgToPDF([file]);
      }

      if (resultBlob) {
        pdfApi.downloadBlob(resultBlob, newName);
        showToast(`Exported to ${format} successfully!`);
      } else {
        throw new Error(`Export from ${currentFormat} to ${format} is not available yet.`);
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : `Failed to export as ${format}`, "error");
    } finally {
      setExportingAs(null);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button type="button" disabled={exportingAs !== null} onClick={() => setOpen(prev => !prev)} className="dn-action-btn" style={{ width: "100%", height: 44, padding: "0 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: exportingAs ? "wait" : "pointer", fontWeight: 750, fontSize: "0.9rem", opacity: exportingAs ? 0.7 : 1, color: "var(--dn-t2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {exportingAs ? <Loader2 size={16} color="var(--dn-t3)" style={{ animation: "spin 1s linear infinite" }} /> : <FileText size={16} color="var(--dn-t3)" />}
          {exportingAs ? `Exporting ${exportingAs}...` : "Export As"}
        </div>
        {!exportingAs && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--dn-t3)", fontSize: "0.84rem" }}>
            {currentFormat} <ChevronDown size={14} />
          </span>
        )}
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 20, borderRadius: 6, background: "var(--dn-bg-card)", boxShadow: "var(--result-panel-shadow)", border: "1px solid var(--dn-border)", padding: "0.4rem" }}>
          {options.map(option => (
            <button key={option} type="button" onClick={() => handleExport(option)} style={{ width: "100%", color: "var(--dn-t2)", textAlign: "left", padding: "0.6rem 0.7rem", border: "none", borderRadius: 6, background: "transparent", cursor: "pointer", fontWeight: 750, fontSize: "0.88rem", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.1rem" }} onMouseOver={(e) => e.currentTarget.style.background = "var(--dn-bg-subtle)"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
              {option}
              {option === currentFormat && <CheckCircle2 size={14} color="#16a34a" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionButton({ icon, label, onClick, danger, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={danger ? "dn-action-btn-danger" : "dn-action-btn"} style={{ height: 66, color: danger ? "#ef4444" : "var(--dn-t2)", padding: "0.55rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.35rem", cursor: disabled ? "wait" : "pointer", opacity: disabled ? 0.7 : 1 }}>
      {icon}
      <span style={{ fontSize: "0.74rem", fontWeight: 800 }}>{label}</span>
    </button>
  );
}

function IconButton({ children, label, onClick, disabled }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className="dn-action-btn"
      style={{ width: 40, height: 40, color: disabled ? "var(--dn-t4)" : "var(--dn-t2)", display: "grid", placeItems: "center", cursor: disabled ? "not-allowed" : "pointer" }}>
      {children}
    </button>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ color: "var(--dn-t4)", fontSize: "0.65rem", fontWeight: 500 }}>{label}</div>
      <div style={{ color: "var(--dn-t1)", fontWeight: 500, fontSize: "0.85rem", marginTop: "0.15rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatResultPages(pageCount: number) {
  if (!pageCount) return "Pages unavailable";
  return `${pageCount} ${pageCount === 1 ? "page" : "pages"}`;
}

function getResultHeaderMode(job: ResultJobResponse) {
  if (job.toolType?.includes("-to-")) return "Convert single file";
  if (["merge-pdf", "split-pdf", "rotate-pdf", "delete-pages", "reorder-pages", "extract-pages", "insert-pages", "resize-pdf", "compress-pdf"].includes(job.toolType)) return "Organize PDF";
  if (job.toolType?.includes("ocr")) return "OCR result";
  if (job.toolType?.includes("protect") || job.toolType?.includes("unlock") || job.toolType?.includes("password")) return "Secure PDF";
  return "Processed result";
}

type ContinueTool = { label: string; path: string; icon: React.ComponentType<{ size?: number; color?: string }> };

const toolPathMap: Record<string, string> = {
  "pdf-to-word": "/tools/pdf-to-word",
  "word-to-pdf": "/tools/word-to-pdf",
  "pdf-to-excel": "/tools/pdf-to-excel",
  "excel-to-pdf": "/tools/excel-to-pdf",
  "pdf-to-image": "/tools/pdf-to-images",
  "pdf-to-images": "/tools/pdf-to-images",
  "image-to-pdf": "/tools/image-to-pdf",
  "pdf-to-ppt": "/tools/pdf-to-powerpoint",
  "pdf-to-powerpoint": "/tools/pdf-to-powerpoint",
  "ppt-to-pdf": "/tools/powerpoint-to-pdf",
  "powerpoint-to-pdf": "/tools/powerpoint-to-pdf",
};

function getToolPath(toolSlug?: string) {
  if (!toolSlug) return "/tools";
  return toolPathMap[toolSlug] || `/tools/${toolSlug}`;
}

function getResultFormat(job: ResultJobResponse): string {
  const raw = (job.outputFormat || job.outputFileName.split(".").pop() || job.kind || "").toUpperCase();
  return raw.replace(/[^A-Z0-9]/g, "") || "FILE";
}

function getExportOptions(currentFormat: string) {
  if (currentFormat === "PDF") return ["PDF", "DOCX", "XLSX", "PPTX", "JPG", "PNG"];
  if (currentFormat === "DOCX" || currentFormat === "DOC") return [currentFormat, "PDF"];
  if (currentFormat === "XLSX" || currentFormat === "XLS") return [currentFormat, "PDF"];
  if (currentFormat === "PPTX" || currentFormat === "PPT") return [currentFormat, "PDF"];
  if (["JPG", "JPEG", "PNG"].includes(currentFormat)) return [currentFormat, "PDF"];
  return [currentFormat];
}

function getContinueTools(job: ResultJobResponse): ContinueTool[] {
  void job;
  return [
    { label: "Merge PDF", path: "/tools/merge-pdf", icon: FileStack },
    { label: "Compress PDF", path: "/tools/compress-pdf", icon: FileArchive },
    { label: "Convert to Word", path: "/tools/pdf-to-word", icon: FileOutput },
    { label: "Split Pages", path: "/tools/split-pdf", icon: Scissors },
    { label: "Edit PDF", path: "/tools/edit-pdf", icon: Edit3 },
    { label: "Rotate PDF", path: "/tools/rotate-pdf", icon: RotateCw },
    { label: "Protect PDF", path: "/tools/protect-pdf", icon: ShieldCheck },
  ];
}

async function fetchResultFile(job: ResultJobResponse): Promise<File> {
  const response = await fetch(job.downloadUrl);
  if (!response.ok) throw new Error("Could not load the result file.");
  const blob = await response.blob();
  return new File([blob], job.outputFileName, { type: blob.type || mimeTypeForFormat(getResultFormat(job)) });
}

function triggerUrlDownload(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!ok) throw new Error("Copy failed");
}

function mimeTypeForFormat(format: string) {
  switch (format) {
    case "PDF": return "application/pdf";
    case "DOC":
    case "DOCX": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "XLS":
    case "XLSX": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "PPT":
    case "PPTX": return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "JPG":
    case "JPEG": return "image/jpeg";
    case "PNG": return "image/png";
    case "ZIP": return "application/zip";
    default: return "application/octet-stream";
  }
}

// --- Custom Modal ---
function ConfirmModal({ open, title, description, confirmText, onConfirm, onCancel, danger = false, loading = false }: any) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", padding: "1rem" }}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: "var(--dn-bg-card)", padding: "1.75rem", borderRadius: 6, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", border: "1px solid var(--dn-border)" }}>
        <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.15rem", fontWeight: 700, color: "var(--dn-t1)" }}>{title}</h3>
        <p style={{ margin: "0 0 1.75rem", color: "var(--dn-t3)", fontSize: "0.95rem", lineHeight: 1.5 }}>{description}</p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button onClick={onCancel} disabled={loading} className="dn-action-btn" style={{ padding: "0.6rem 1rem", color: "var(--dn-t2)", fontWeight: 600, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1 }}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} style={{ padding: "0.6rem 1rem", borderRadius: "4px", border: "none", background: danger ? "#ef4444" : "#2563eb", color: "#fff", fontWeight: 600, cursor: loading ? "wait" : "pointer", transition: "filter 0.2s", display: "inline-flex", alignItems: "center", gap: "0.45rem" }} onMouseOver={(e) => e.currentTarget.style.filter = "brightness(1.1)"} onMouseOut={(e) => e.currentTarget.style.filter = "none"}>
            {loading && <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />}
            {loading ? "Resetting..." : confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Custom Toast ---
function Toast({ message, type }: { message?: string, type?: 'success' | 'error' }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          style={{ position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)", zIndex: 200, display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1.25rem", borderRadius: 6, background: type === "error" ? "#fee2e2" : "#dcfce7", color: type === "error" ? "#991b1b" : "#166534", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", border: `1px solid ${type === "error" ? "#fca5a5" : "#86efac"}` }}
        >
          {type === "error" ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
          <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
