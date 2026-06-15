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

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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
    <div className="dn-result-layout-root" style={{ height: "calc(100vh - 60px)", display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--dn-bg)", color: "var(--dn-t1)", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @media (max-width: 1080px) {
          .dn-result-layout-root { height: auto !important; display: block !important; overflow: visible !important; }
          .dn-result-shell { height: auto !important; display: block !important; overflow: visible !important; padding-bottom: 3rem !important; }
          .dn-result-grid { display: flex !important; flex-direction: column !important; overflow: visible !important; min-height: auto !important; height: auto !important; }
          .dn-result-preview-container { height: 620px !important; }
          .dn-result-panel { height: auto !important; overflow-y: visible !important; padding-right: 0 !important; border-left: none !important; }
        }
        @media print {
          nav, footer, .dn-result-panel, .dn-result-toolbar { display: none !important; }
          .dn-result-shell { padding: 0 !important; }
          .dn-result-preview-container { padding: 0 !important; height: auto !important; overflow: visible !important; }
        }
        
        /* Modern Clean Scrollbar */
        .dn-clean-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
        .dn-clean-scroll::-webkit-scrollbar-track { background: transparent; }
        .dn-clean-scroll::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.3); border-radius: 4px; }
        .dn-clean-scroll::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.6); }

        .dn-action-btn {
          border: 1px solid var(--dn-border);
          border-radius: 4px;
          transition: all 0.15s ease;
          background: transparent;
        }
        .dn-action-btn:hover:not(:disabled) {
          background: rgba(37, 99, 235, 0.04);
          border-color: #3b82f6;
        }
        .dn-action-btn:active:not(:disabled) {
          transform: scale(0.98);
        }
        .dn-action-btn-danger {
          border: 1px solid var(--dn-border);
          border-radius: 4px;
          transition: all 0.15s ease;
          background: transparent;
        }
        .dn-action-btn-danger:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.04);
          border-color: #ef4444;
        }
        .dn-action-btn-danger:active:not(:disabled) {
          transform: scale(0.98);
        }
      `}</style>
      
      <div className="dn-result-shell" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", width: "100%", margin: 0, padding: 0 }}>
        
        {/* Minimal Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "1.25rem 2rem", zIndex: 10, background: "transparent" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", color: "#16a34a", fontWeight: 600, fontSize: "0.86rem", marginBottom: "0.15rem" }}>
              <CheckCircle2 size={16} /> Completed
            </div>
            <h1 style={{ margin: 0, fontSize: "1.45rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--dn-t1)" }}>
              {job.outputFileName}
            </h1>
          </div>
          <button onClick={() => setShowStartOverModal(true)} disabled={resettingAction !== null} className="dn-action-btn"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--dn-t2)", padding: "0.55rem 0.85rem", fontWeight: 600, fontSize: "0.85rem", cursor: resettingAction ? "wait" : "pointer", opacity: resettingAction ? 0.75 : 1 }}>
            {resettingAction === "start-over" ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <RotateCcw size={15} />}
            {resettingAction === "start-over" ? "Resetting..." : "Start over"}
          </button>
        </div>

        {/* Clean Layout Split */}
        <div className="dn-result-grid" style={{ flex: 1, display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", alignItems: "stretch", overflow: "hidden", minHeight: 0 }}>
          <CleanPDFPreview key={job.jobId} job={job} preview={preview} />
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
  const [viewMode, setViewMode] = useState<"scroll" | "single">("scroll");
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [loadedPages, setLoadedPages] = useState<Record<number, string>>({});
  const loadedPagesRef = useRef<Record<number, string>>({});
  const loadingRangesRef = useRef<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const isPagedPreview = preview?.kind === "pdf" || preview?.kind === "image";
  const isPdfPreview = preview?.kind === "pdf";
  const totalPages = Math.max(preview?.total || job.pageCount || pages.length || 0, pages.length);
  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, index) => index + 1), [totalPages]);

  const archiveItems = useMemo(() => preview?.items?.length ? preview.items : job.items, [job.items, preview?.items]);

  useEffect(() => {
    const nextPages = pages.reduce<Record<number, string>>((result, page) => {
      result[page.page] = page.image;
      return result;
    }, {});
    loadedPagesRef.current = nextPages;
    loadingRangesRef.current.clear();
    setLoadedPages(nextPages);
    setCurrentPage(1);
  }, [job.jobId, pages]);

  const loadPageBatch = useCallback(async (pageNumber: number) => {
    if (!isPdfPreview || !totalPages) return;
    const start = Math.max(1, pageNumber);
    const end = Math.min(totalPages, start + 3);
    const rangeKey = `${start}-${end}`;
    if (loadingRangesRef.current.has(rangeKey)) return;
    const needsPages = Array.from({ length: end - start + 1 }, (_, index) => start + index)
      .some(page => !loadedPagesRef.current[page]);
    if (!needsPages) return;

    loadingRangesRef.current.add(rangeKey);
    try {
      const result = await pdfApi.getResultPreview(job.jobId, { pageRange: rangeKey });
      const nextPages = (result.pages || []).reduce<Record<number, string>>((acc, page) => {
        acc[page.page] = page.image;
        return acc;
      }, {});
      loadedPagesRef.current = { ...loadedPagesRef.current, ...nextPages };
      setLoadedPages(prev => ({ ...prev, ...nextPages }));
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
    if (!isPdfPreview || viewMode !== "scroll" || !scrollRef.current) return;

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
        if (page && !loadedPagesRef.current[page]) {
          loadPageBatch(page);
        }
      });
    }, {
      root: scrollRef.current,
      rootMargin: "700px 0px",
      threshold: [0.08, 0.28, 0.55],
    });

    pageRefs.current.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [isPdfPreview, loadPageBatch, pageNumbers, viewMode]);

  const goToPage = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));
    setCurrentPage(nextPage);
    loadPageBatch(nextPage);

    if (viewMode === "scroll") {
      pageRefs.current.get(nextPage)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  const activeImage = loadedPages[currentPage] || pages.find(page => page.page === currentPage)?.image;
  const showScrollMode = isPdfPreview && totalPages > 1;

  return (
    <section className="dn-result-preview-container" style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "transparent" }}>
      
      {/* Minimal Toolbar (Floating style instead of strict border) */}
      <div className="dn-result-toolbar" style={{ padding: "0 2rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", zIndex: 5, background: "transparent" }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {showScrollMode && (
            <div style={{ display: "inline-flex", background: "var(--dn-bg-subtle)", borderRadius: "6px", padding: "4px" }}>
              {[
                { value: "scroll", label: "Scroll" },
                { value: "single", label: "Single" },
              ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setViewMode(option.value as "scroll" | "single")}
                    style={{
                      border: "none",
                      borderRadius: "4px",
                      background: viewMode === option.value ? "var(--dn-bg-card)" : "transparent",
                      color: viewMode === option.value ? "var(--dn-t1)" : "var(--dn-t3)",
                      boxShadow: viewMode === option.value ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                      padding: "0.3rem 0.65rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          {isPagedPreview && totalPages > 0 && (
            <>
              <IconButton label="Previous page" onClick={prevPage} disabled={currentPage <= 1}>
                <Minus size={14} />
              </IconButton>
              <div style={{ minWidth: "50px", textAlign: "center", color: "var(--dn-t2)", fontSize: "0.75rem", fontWeight: 600 }}>
                {currentPage} / {totalPages}
              </div>
              <IconButton label="Next page" onClick={nextPage} disabled={currentPage >= totalPages}>
                <Plus size={14} />
              </IconButton>
              <div style={{ width: 1, height: 20, background: "var(--dn-border)", margin: "0 0.5rem" }} />
              <IconButton label="Zoom out" onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.65))}>
                <Minus size={14} />
              </IconButton>
              <div style={{ minWidth: 44, textAlign: "center", color: "var(--dn-t2)", fontSize: "0.75rem", fontWeight: 600 }}>{Math.round(zoom * 100)}%</div>
              <IconButton label="Zoom in" onClick={() => setZoom(prev => Math.min(prev + 0.1, 1.55))}>
                <Plus size={14} />
              </IconButton>
              <IconButton label="Fit preview" onClick={() => setZoom(1)}>
                <Maximize2 size={14} />
              </IconButton>
            </>
          )}
        </div>
      </div>

      {/* Clean Workspace Preview Area */}
      <div id="print-area" ref={scrollRef} className="dn-clean-scroll" style={{ flex: 1, overflow: "auto", minHeight: 0, padding: "0 2rem 2rem", scrollBehavior: "smooth" }}>
        {isPagedPreview && viewMode === "single" && (
          <motion.div key={currentPage} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: "grid", placeItems: "start center", minHeight: "100%" }}>
            {activeImage ? (
              <PreviewPageImage image={activeImage} alt={`${job.outputFileName} page ${currentPage}`} zoom={zoom} />
            ) : (
              <PageSkeleton page={currentPage} />
            )}
          </motion.div>
        )}

        {isPagedPreview && viewMode === "scroll" && (
          <div style={{ display: "grid", gap: "2.5rem", justifyItems: "center", paddingBottom: "3rem" }}>
            {(isPdfPreview ? pageNumbers : [1]).map(pageNumber => {
              const image = loadedPages[pageNumber] || pages.find(page => page.page === pageNumber)?.image;
              return (
                <div
                  key={pageNumber}
                  data-page={pageNumber}
                  ref={element => {
                    if (element) pageRefs.current.set(pageNumber, element);
                    else pageRefs.current.delete(pageNumber);
                  }}
                  style={{ width: "100%", display: "grid", justifyItems: "center", scrollMarginTop: 24 }}
                >
                  <div style={{ color: "var(--dn-t4)", fontWeight: 500, fontSize: "0.75rem", marginBottom: "0.5rem" }}>Page {pageNumber}</div>
                  {image ? (
                    <PreviewPageImage image={image} alt={`${job.outputFileName} page ${pageNumber}`} zoom={zoom} />
                  ) : (
                    <PageSkeleton page={pageNumber} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {preview?.kind === "text" && (
          <div style={{ width: "min(100%, 800px)", margin: "0 auto", background: "var(--dn-bg-card)", color: "var(--dn-t1)", borderRadius: "8px", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)", padding: "3rem", whiteSpace: "pre-wrap", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: "0.85rem", lineHeight: 1.7, minHeight: 620 }}>
            {preview.text || "No extracted text found."}
          </div>
        )}

        {preview?.kind === "archive" && (
          <div style={{ width: "min(100%, 800px)", margin: "0 auto", background: "var(--dn-bg-card)", color: "var(--dn-t1)", borderRadius: "8px", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)", padding: "2.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{ width: 48, height: 48, borderRadius: "8px", background: "rgba(37,99,235,0.06)", color: "#2563eb", display: "grid", placeItems: "center" }}>
                <FileArchive size={24} strokeWidth={1.5} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>Generated files</div>
                <div style={{ color: "var(--dn-t3)", fontSize: "0.85rem", marginTop: "0.2rem" }}>{archiveItems.length} files inside this download</div>
              </div>
            </div>
            <div style={{ display: "grid", gap: "0.5rem" }}>
              {archiveItems.map((item, index) => (
                <div key={`${item.name}-${index}`} style={{ display: "grid", gridTemplateColumns: "24px minmax(0,1fr) auto", alignItems: "center", gap: "1rem", padding: "0.75rem 1rem", borderRadius: "4px", border: "1px solid var(--dn-border)" }}>
                  <div style={{ color: "var(--dn-t4)", fontSize: "0.75rem", fontWeight: 500 }}>{String(index + 1).padStart(2, '0')}</div>
                  <div style={{ minWidth: 0, fontWeight: 500, fontSize: "0.9rem", color: "var(--dn-t1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                  <div style={{ color: "var(--dn-t4)", fontSize: "0.8rem" }}>{formatBytes(item.size)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isPagedPreview && preview?.kind !== "text" && preview?.kind !== "archive" && (
          <div style={{ width: "min(100%, 760px)", minHeight: 520, margin: "0 auto", background: "transparent", color: "var(--dn-t1)", display: "grid", placeItems: "center", textAlign: "center", padding: "2rem" }}>
            <div>
              <FileText size={48} color="var(--dn-t4)" strokeWidth={1} />
              <h2 style={{ margin: "1.5rem 0 0.5rem", fontSize: "1.1rem", fontWeight: 600 }}>{job.outputFileName}</h2>
              <p style={{ margin: 0, color: "var(--dn-t3)", fontSize: "0.9rem" }}>Preview is ready. Download from the sidebar.</p>
            </div>
          </div>
        )}
      </div>
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
        width: `${Math.round(72 * zoom)}%`,
        maxWidth: 980,
        minWidth: 280,
        height: "auto",
        borderRadius: "4px",
        background: "#fff",
        boxShadow: "0 12px 40px -12px rgba(0,0,0,0.12)",
      }}
    />
  );
});

function PageSkeleton({ page }: { page: number }) {
  return (
    <div style={{
      width: "72%",
      maxWidth: 980,
      minWidth: 280,
      aspectRatio: "0.707",
      borderRadius: "4px",
      background: "var(--dn-bg-subtle)",
      display: "grid",
      placeItems: "center",
      color: "var(--dn-t4)",
      fontSize: "0.85rem",
      fontWeight: 500,
    }}>
      Loading page {page}...
    </div>
  );
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
  showToast: (msg: string, type?: 'success'|'error') => void;
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
    <aside className="dn-result-panel dn-clean-scroll" style={{ height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.5rem", padding: "0 2rem 2rem 1rem" }}>
      
      {/* File Information Section */}
      <section>
        <div style={{ color: "var(--dn-t4)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>Information</div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "1rem" }}>
          <MiniStat label="Size" value={formatBytes(job.outputFileSize)} />
          <MiniStat label="Pages" value={job.pageCount ? String(job.pageCount) : "-"} />
          <MiniStat label="Format" value={job.outputFormat || job.kind.toUpperCase()} />
          <MiniStat label="Tool" value={job.toolLabel || "DocNova"} />
        </div>
      </section>

      {/* Actions Section */}
      <section>
        <div style={{ color: "var(--dn-t4)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>Actions</div>
        
        <motion.button type="button" disabled={isDownloading || isResetting} onClick={handleDownload} whileHover={{ scale: isDownloading || isResetting ? 1 : 1.01 }} whileTap={{ scale: isDownloading || isResetting ? 1 : 0.99 }}
            style={{ width: "100%", border: "none", marginBottom: "0.5rem", borderRadius: "4px", background: isDownloading || isResetting ? "#94a3b8" : "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.55rem", padding: "0.85rem 1rem", fontWeight: 500, fontSize: "0.9rem", cursor: isDownloading || isResetting ? "wait" : "pointer", transition: "background 0.2s" }}
            onMouseOver={(e) => { e.currentTarget.style.background = "#1d4ed8" }}
            onMouseOut={(e) => { e.currentTarget.style.background = isDownloading || isResetting ? "#94a3b8" : "#2563eb" }}
          >
            {isDownloading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Download size={16} />}
            {isDownloading ? "Preparing..." : "Download File"}
        </motion.button>

        <div style={{ display: "grid", gap: "0.25rem" }}>
          <ExportDropdown job={job} showToast={showToast} />
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "0.4rem" }}>
            <ActionButton label="Share" icon={<Share2 size={15} />} onClick={handleShare} disabled={isResetting} />
            <ActionButton label="Print" icon={<Printer size={15} />} onClick={handlePrint} disabled={isResetting} />
            <ActionButton label={resettingAction === "delete" ? "Resetting..." : "Delete"} icon={resettingAction === "delete" ? <Loader2 size={15} color="#ef4444" style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={15} color="#ef4444" />} onClick={() => setShowDeleteModal(true)} disabled={isResetting} danger />
          </div>
        </div>
      </section>

      {/* Continue Working Section */}
      <ContinueToolsPanel key={job.jobId} job={job} onContinue={onContinue} disabled={isResetting} />

      <div style={{ marginTop: "16px", display: "grid" }}>
        <button onClick={onStartOver} disabled={isResetting} className="dn-action-btn" style={{ width: "100%", color: "var(--dn-t2)", padding: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: isResetting ? "wait" : "pointer", fontWeight: 600, fontSize: "0.85rem", opacity: isResetting ? 0.75 : 1 }}>
          {resettingAction === "start-over" ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <RotateCcw size={15} />}
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
    <section>
      <div style={{ color: "var(--dn-t4)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Continue Working</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {tools.map(tool => {
          const Icon = tool.icon;
          return (
            <a key={tool.label} href={tool.path} onClick={(e) => handleNavigate(e, tool.path)} className="dn-action-btn" aria-disabled={disabled} style={{ textDecoration: "none", color: "var(--dn-t2)", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 0.75rem", opacity: disabled ? 0.7 : 1, cursor: disabled ? "wait" : "pointer" }}>
              <Icon size={15} color="var(--dn-t3)" />
              <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{tool.label}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

export function ExportDropdown({ job, showToast }: { job: ResultJobResponse; showToast: (msg: string, type?: 'success'|'error') => void }) {
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
      <button type="button" disabled={exportingAs !== null} onClick={() => setOpen(prev => !prev)} className="dn-action-btn" style={{ width: "100%", padding: "0.65rem 0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: exportingAs ? "wait" : "pointer", fontWeight: 500, fontSize: "0.85rem", opacity: exportingAs ? 0.7 : 1, color: "var(--dn-t2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {exportingAs ? <Loader2 size={15} color="var(--dn-t3)" style={{ animation: "spin 1s linear infinite" }} /> : <FileText size={15} color="var(--dn-t3)" />}
          {exportingAs ? `Exporting ${exportingAs}...` : "Export As"}
        </div>
        {!exportingAs && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--dn-t4)", fontSize: "0.8rem" }}>
            {currentFormat} <ChevronDown size={14} />
          </span>
        )}
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 20, borderRadius: "4px", background: "var(--dn-bg-card)", boxShadow: "0 12px 30px rgba(0,0,0,0.12)", border: "1px solid var(--dn-border)", padding: "0.4rem" }}>
          {options.map(option => (
            <button key={option} type="button" onClick={() => handleExport(option)} className="dn-action-btn" style={{ width: "100%", color: "var(--dn-t2)", textAlign: "left", padding: "0.5rem 0.6rem", border: "none", cursor: "pointer", fontWeight: 500, fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.2rem" }}>
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
    <button type="button" onClick={onClick} disabled={disabled} className={danger ? "dn-action-btn-danger" : "dn-action-btn"} style={{ color: danger ? "#ef4444" : "var(--dn-t2)", padding: "0.6rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem", cursor: disabled ? "wait" : "pointer", opacity: disabled ? 0.7 : 1 }}>
      {icon}
      <span style={{ fontSize: "0.7rem", fontWeight: 500 }}>{label}</span>
    </button>
  );
}

function IconButton({ children, label, onClick, disabled }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className="dn-action-btn"
      style={{ width: 28, height: 28, color: disabled ? "var(--dn-t4)" : "var(--dn-t2)", display: "grid", placeItems: "center", cursor: disabled ? "not-allowed" : "pointer" }}>
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
  const format = getResultFormat(job);
  if (format === "PDF") {
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
  if (format === "DOCX" || format === "DOC") {
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
  if (format === "XLSX" || format === "XLS") {
    return [{ label: "Convert to PDF", path: "/tools/excel-to-pdf", icon: FileText }];
  }
  if (format === "PPTX" || format === "PPT") {
    return [{ label: "Convert to PDF", path: "/tools/powerpoint-to-pdf", icon: FileText }];
  }
  if (["JPG", "JPEG", "PNG"].includes(format)) {
    return [
      { label: "Convert to PDF", path: "/tools/image-to-pdf", icon: FileImage },
      { label: "Run OCR", path: "/tools/image-ocr", icon: Hash },
    ];
  }
  return [{ label: "All Tools", path: "/tools", icon: MoreHorizontal }];
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
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: "var(--dn-bg-card)", padding: "1.75rem", borderRadius: "8px", width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", border: "1px solid var(--dn-border)" }}>
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
          style={{ position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)", zIndex: 200, display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1.25rem", borderRadius: "8px", background: type === "error" ? "#fee2e2" : "#dcfce7", color: type === "error" ? "#991b1b" : "#166534", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", border: `1px solid ${type === "error" ? "#fca5a5" : "#86efac"}` }}
        >
          {type === "error" ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
          <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
