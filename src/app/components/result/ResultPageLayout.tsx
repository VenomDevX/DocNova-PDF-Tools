import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
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
} from "lucide-react";
import { pdfApi, type ResultJobResponse, type ResultPreviewResponse } from "../../../services/pdfApi";

interface ResultPageLayoutProps {
  job: ResultJobResponse;
  preview: ResultPreviewResponse | null;
  onDelete: () => void;
}

export function ResultPageLayout({ job, preview, onDelete }: ResultPageLayoutProps) {
  return (
    <div style={{ minHeight: "100vh", paddingTop: 78, background: "linear-gradient(180deg,var(--dn-bg),var(--dn-bg-subtle))", color: "var(--dn-t1)", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @media (max-width: 1080px) {
          .dn-result-grid { grid-template-columns: 1fr !important; }
          .dn-result-panel { position: static !important; }
        }
        @media print {
          nav, footer, .dn-result-panel, .dn-result-toolbar { display: none !important; }
          .dn-result-shell { padding: 0 !important; }
        }
      `}</style>
      <div className="dn-result-shell" style={{ maxWidth: 1480, margin: "0 auto", padding: "1.25rem 1.5rem 3rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", color: "#22c55e", fontWeight: 850, fontSize: "0.86rem", marginBottom: "0.3rem" }}>
              <CheckCircle2 size={17} /> Done
            </div>
            <h1 style={{ margin: 0, fontSize: "clamp(1.45rem,3vw,2.2rem)", fontWeight: 920, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Your file is ready
            </h1>
          </div>
          <Link to={`/tools/${job.toolType || "merge-pdf"}`} style={{ textDecoration: "none" }}>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", borderRadius: 999, border: "1px solid var(--dn-border)", background: "var(--dn-bg-card)", color: "var(--dn-t2)", padding: "0.65rem 0.9rem", fontWeight: 800, fontSize: "0.84rem", boxShadow: "var(--dn-shadow)" }}>
              <RotateCcw size={15} /> Start over
            </motion.div>
          </Link>
        </div>

        <div className="dn-result-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 360px", gap: "1.1rem", alignItems: "start" }}>
          <CleanPDFPreview job={job} preview={preview} />
          <ResultActionPanel job={job} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}

export function CleanPDFPreview({ job, preview }: { job: ResultJobResponse; preview: ResultPreviewResponse | null }) {
  const pages = preview?.pages || [];
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
    <section style={{ borderRadius: 24, overflow: "hidden", background: "var(--dn-bg-card)", border: "1px solid var(--dn-border)", boxShadow: "0 26px 80px rgba(0,0,0,0.28)" }}>
      <div className="dn-result-toolbar" style={{ minHeight: 58, padding: "0.75rem 0.9rem", display: "flex", alignItems: "center", gap: "0.65rem", borderBottom: "1px solid var(--dn-border)", flexWrap: "wrap" }}>
        <div style={{ display: "inline-grid", placeItems: "center", width: 36, height: 36, borderRadius: 12, background: "rgba(59,130,246,0.14)", color: "#60a5fa", flexShrink: 0 }}>
          {job.kind === "archive" ? <FileArchive size={18} /> : job.kind === "image" ? <FileImage size={18} /> : <FileText size={18} />}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: "var(--dn-t1)", fontWeight: 850, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.outputFileName}</div>
          <div style={{ color: "var(--dn-t4)", fontSize: "0.72rem" }}>{job.toolLabel || "DocNova"} output</div>
        </div>

        {showScrollMode && (
          <div style={{ display: "inline-flex", border: "1px solid var(--dn-border)", borderRadius: 999, background: "var(--dn-bg-subtle)", padding: 3, gap: 3 }}>
            {[
              { value: "scroll", label: "Continuous Scroll" },
              { value: "single", label: "Single Page" },
            ].map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setViewMode(option.value as "scroll" | "single")}
                style={{
                  border: "none",
                  borderRadius: 999,
                  background: viewMode === option.value ? "rgba(37,99,235,0.9)" : "transparent",
                  color: viewMode === option.value ? "#fff" : "var(--dn-t3)",
                  padding: "0.38rem 0.65rem",
                  fontSize: "0.72rem",
                  fontWeight: 850,
                  cursor: "pointer",
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {isPagedPreview && totalPages > 0 && (
          <>
            <IconButton label="Previous page" onClick={prevPage} disabled={currentPage <= 1}>
              <Minus size={14} />
            </IconButton>
            <div style={{ minWidth: 92, textAlign: "center", color: "var(--dn-t3)", fontSize: "0.8rem", fontWeight: 800 }}>
              {currentPage} / {totalPages}
            </div>
            <IconButton label="Next page" onClick={nextPage} disabled={currentPage >= totalPages}>
              <Plus size={14} />
            </IconButton>
            <div style={{ width: 1, height: 28, background: "var(--dn-border)" }} />
            <IconButton label="Zoom out" onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.65))}>
              <Minus size={14} />
            </IconButton>
            <div style={{ minWidth: 48, textAlign: "center", color: "var(--dn-t3)", fontSize: "0.78rem", fontWeight: 800 }}>{Math.round(zoom * 100)}%</div>
            <IconButton label="Zoom in" onClick={() => setZoom(prev => Math.min(prev + 0.1, 1.55))}>
              <Plus size={14} />
            </IconButton>
            <IconButton label="Fit preview" onClick={() => setZoom(1)}>
              <Maximize2 size={14} />
            </IconButton>
          </>
        )}
      </div>

      <div ref={scrollRef} style={{ height: "calc(100vh - 220px)", minHeight: 620, background: "linear-gradient(180deg,#eef2f7,#e5e7eb)", padding: "2rem", overflow: "auto", scrollBehavior: "smooth" }}>
        {isPagedPreview && viewMode === "single" && (
          <motion.div key={currentPage} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: "grid", placeItems: "start center", minHeight: 620 }}>
            {activeImage ? (
              <PreviewPageImage
                image={activeImage}
                alt={`${job.outputFileName} page ${currentPage}`}
                zoom={zoom}
              />
            ) : (
              <PageSkeleton page={currentPage} />
            )}
          </motion.div>
        )}

        {isPagedPreview && viewMode === "scroll" && (
          <div style={{ display: "grid", gap: "2rem", justifyItems: "center", paddingBottom: "2rem" }}>
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
                  <div style={{ color: "#64748b", fontWeight: 850, fontSize: "0.78rem", marginBottom: "0.7rem" }}>Page {pageNumber}</div>
                  {image ? (
                    <PreviewPageImage
                      image={image}
                      alt={`${job.outputFileName} page ${pageNumber}`}
                      zoom={zoom}
                    />
                  ) : (
                    <PageSkeleton page={pageNumber} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {preview?.kind === "text" && (
          <div style={{ width: "min(100%, 900px)", margin: "0 auto", background: "#fff", color: "#111827", borderRadius: 12, boxShadow: "0 24px 70px rgba(15,23,42,0.18)", padding: "2rem", whiteSpace: "pre-wrap", fontFamily: "Consolas, monospace", lineHeight: 1.65, minHeight: 620 }}>
            {preview.text || "No extracted text found."}
          </div>
        )}

        {preview?.kind === "archive" && (
          <div style={{ width: "min(100%, 860px)", margin: "0 auto", background: "#fff", color: "#111827", borderRadius: 16, boxShadow: "0 24px 70px rgba(15,23,42,0.18)", padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "#eff6ff", color: "#2563eb", display: "grid", placeItems: "center" }}>
                <FileArchive size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 900 }}>Generated files</div>
                <div style={{ color: "#64748b", fontSize: "0.82rem" }}>{archiveItems.length} files inside this download</div>
              </div>
            </div>
            <div style={{ display: "grid", gap: "0.55rem" }}>
              {archiveItems.map((item, index) => (
                <div key={`${item.name}-${index}`} style={{ display: "grid", gridTemplateColumns: "34px minmax(0,1fr) auto", alignItems: "center", gap: "0.7rem", padding: "0.7rem", borderRadius: 12, border: "1px solid #e5e7eb", background: "#f8fafc" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "#e0f2fe", color: "#0284c7", display: "grid", placeItems: "center", fontWeight: 900 }}>{index + 1}</div>
                  <div style={{ minWidth: 0, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                  <div style={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 800 }}>{formatBytes(item.size)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isPagedPreview && preview?.kind !== "text" && preview?.kind !== "archive" && (
          <div style={{ width: "min(100%, 760px)", minHeight: 520, margin: "0 auto", background: "#fff", color: "#111827", borderRadius: 16, boxShadow: "0 24px 70px rgba(15,23,42,0.18)", display: "grid", placeItems: "center", textAlign: "center", padding: "2rem" }}>
            <div>
              <FileText size={42} color="#2563eb" />
              <h2 style={{ margin: "0.9rem 0 0.35rem", fontSize: "1.25rem", fontWeight: 900 }}>{job.outputFileName}</h2>
              <p style={{ margin: 0, color: "#64748b", lineHeight: 1.6 }}>Preview metadata is ready. Download from the action panel.</p>
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
        borderRadius: 10,
        background: "#fff",
        boxShadow: "0 24px 70px rgba(15,23,42,0.24)",
        border: "1px solid rgba(15,23,42,0.08)",
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
      borderRadius: 10,
      background: "linear-gradient(90deg,#ffffff,#f1f5f9,#ffffff)",
      boxShadow: "0 24px 70px rgba(15,23,42,0.16)",
      border: "1px solid rgba(15,23,42,0.08)",
      display: "grid",
      placeItems: "center",
      color: "#94a3b8",
      fontWeight: 900,
    }}>
      Loading page {page}
    </div>
  );
}

export function ResultActionPanel({ job, onDelete }: { job: ResultJobResponse; onDelete: () => void }) {
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: job.outputFileName, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        window.setTimeout(() => setShared(false), 1800);
      }
    } catch {
      await navigator.clipboard.writeText(url);
      setShared(true);
      window.setTimeout(() => setShared(false), 1800);
    }
  };

  return (
    <aside className="dn-result-panel" style={{ position: "sticky", top: 92, display: "grid", gap: "1rem" }}>
      <section style={{ borderRadius: 22, background: "var(--dn-bg-card)", border: "1px solid var(--dn-border)", boxShadow: "var(--dn-shadow)", padding: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#22c55e", fontWeight: 900, marginBottom: "0.85rem" }}>
          <CheckCircle2 size={19} /> Done
        </div>

        <div style={{ borderRadius: 16, background: "var(--dn-bg-subtle)", border: "1px solid var(--dn-border)", padding: "0.9rem", marginBottom: "0.9rem" }}>
          <div style={{ color: "var(--dn-t1)", fontWeight: 900, fontSize: "0.95rem", wordBreak: "break-word" }}>{job.outputFileName}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "0.55rem", marginTop: "0.85rem" }}>
            <MiniStat label="Size" value={formatBytes(job.outputFileSize)} />
            <MiniStat label="Pages" value={job.pageCount ? String(job.pageCount) : "-"} />
            <MiniStat label="Format" value={job.outputFormat || job.kind.toUpperCase()} />
            <MiniStat label="Tool" value={job.toolLabel || "DocNova"} />
          </div>
        </div>

        <a href={job.downloadUrl} download={job.outputFileName} style={{ textDecoration: "none" }}>
          <motion.div whileHover={{ scale: 1.02, boxShadow: "0 0 34px rgba(59,130,246,0.38)" }} whileTap={{ scale: 0.98 }}
            style={{ width: "100%", borderRadius: 15, border: "none", background: "linear-gradient(135deg,#1d4ed8,#60a5fa)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.55rem", padding: "0.95rem 1rem", fontWeight: 900, cursor: "pointer", boxShadow: "0 16px 36px rgba(37,99,235,0.24)" }}>
            <Download size={18} /> Download
          </motion.div>
        </a>

        <div style={{ display: "grid", gap: "0.55rem", marginTop: "0.75rem" }}>
          <ExportDropdown job={job} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "0.55rem" }}>
            <ActionButton label={shared ? "Copied" : "Share"} onClick={handleShare}><Share2 size={15} /></ActionButton>
            <ActionButton label="Print" onClick={() => window.print()}><Printer size={15} /></ActionButton>
            <ActionButton label="Delete" onClick={onDelete} danger><Trash2 size={15} /></ActionButton>
          </div>
        </div>
      </section>

      <SmartTipCard job={job} />
      <ContinueToolsPanel />

      <Link to={`/tools/${job.toolType || "merge-pdf"}`} style={{ textDecoration: "none" }}>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          style={{ borderRadius: 16, border: "1px solid var(--dn-border)", background: "var(--dn-bg-card)", color: "var(--dn-t2)", padding: "0.85rem", fontWeight: 900, textAlign: "center", boxShadow: "var(--dn-shadow)" }}>
          Start over
        </motion.div>
      </Link>
    </aside>
  );
}

export function ContinueToolsPanel() {
  const tools = [
    { label: "Compress", path: "/tools/compress-pdf", icon: Scissors },
    { label: "Delete Pages", path: "/tools/delete-pages", icon: Trash2 },
    { label: "Number Pages", path: "/tools/add-page-numbers", icon: Hash },
    { label: "Annotate", path: "/tools/annotate-pdf", icon: Edit3 },
    { label: "Sign", path: "/tools/edit-pdf", icon: ShieldCheck },
    { label: "Edit PDF", path: "/tools/edit-pdf", icon: Edit3 },
  ];

  return (
    <section style={{ borderRadius: 22, background: "var(--dn-bg-card)", border: "1px solid var(--dn-border)", boxShadow: "var(--dn-shadow)", padding: "1rem" }}>
      <div style={{ color: "var(--dn-t1)", fontWeight: 900, marginBottom: "0.75rem" }}>Continue in</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "0.55rem" }}>
        {tools.map(tool => (
          <Link key={tool.label} to={tool.path} style={{ textDecoration: "none" }}>
            <motion.div whileHover={{ y: -2, borderColor: "rgba(96,165,250,0.45)" }}
              style={{ minHeight: 74, borderRadius: 14, border: "1px solid var(--dn-border)", background: "var(--dn-bg-subtle)", color: "var(--dn-t2)", padding: "0.75rem", display: "grid", alignContent: "space-between" }}>
              <tool.icon size={17} color="#60a5fa" />
              <span style={{ fontWeight: 850, fontSize: "0.78rem" }}>{tool.label}</span>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ExportDropdown({ job }: { job: ResultJobResponse }) {
  const [open, setOpen] = useState(false);
  const options = ["PDF", "DOCX", "XLSX", "PPTX", "JPG", "PNG", "ZIP"];

  return (
    <div style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen(prev => !prev)} style={{ width: "100%", borderRadius: 14, border: "1px solid var(--dn-border)", background: "var(--dn-bg-subtle)", color: "var(--dn-t2)", padding: "0.72rem 0.8rem", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", fontWeight: 850 }}>
        Export As <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--dn-t4)" }}>{job.outputFormat || job.kind.toUpperCase()} <ChevronDown size={15} /></span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 20, borderRadius: 16, border: "1px solid var(--dn-border)", background: "var(--dn-bg-card)", boxShadow: "0 18px 60px rgba(0,0,0,0.35)", padding: "0.45rem" }}>
          {options.map(option => (
            <button key={option} type="button" onClick={() => setOpen(false)} style={{ width: "100%", border: "none", background: "transparent", color: "var(--dn-t2)", textAlign: "left", padding: "0.6rem 0.7rem", borderRadius: 10, cursor: "pointer", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {option}
              {option === (job.outputFormat || "").replace(/[^A-Z]/gi, "").toUpperCase() && <MoreHorizontal size={15} color="var(--dn-t4)" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SmartTipCard({ job }: { job: ResultJobResponse }) {
  const tip = job.kind === "pdf"
    ? "Need a smaller file? Compress it next and keep this result page open until you are done."
    : job.kind === "archive"
      ? "ZIP results contain multiple generated files. Download once, then continue editing individual files if needed."
      : "Keep this result page open until you download the final file.";

  return (
    <section style={{ borderRadius: 22, background: "linear-gradient(135deg,rgba(37,99,235,0.15),rgba(14,165,233,0.08))", border: "1px solid rgba(96,165,250,0.22)", boxShadow: "var(--dn-shadow)", padding: "1rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.7rem" }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(96,165,250,0.18)", color: "#93c5fd", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Lightbulb size={18} />
        </div>
        <div>
          <div style={{ color: "var(--dn-t1)", fontWeight: 900, marginBottom: "0.25rem" }}>Smart tip</div>
          <div style={{ color: "var(--dn-t3)", fontSize: "0.82rem", lineHeight: 1.55 }}>{tip}</div>
        </div>
      </div>
    </section>
  );
}

function ActionButton({ children, label, onClick, danger }: { children: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} style={{ borderRadius: 14, border: "1px solid var(--dn-border)", background: danger ? "rgba(239,68,68,0.1)" : "var(--dn-bg-subtle)", color: danger ? "#f87171" : "var(--dn-t2)", padding: "0.7rem 0.45rem", display: "grid", placeItems: "center", gap: "0.25rem", cursor: "pointer", fontWeight: 850, fontSize: "0.72rem" }}>
      {children}
      {label}
    </button>
  );
}

function IconButton({ children, label, onClick, disabled }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled}
      style={{ width: 34, height: 34, borderRadius: 11, border: "1px solid var(--dn-border)", background: disabled ? "rgba(148,163,184,0.06)" : "var(--dn-bg-subtle)", color: disabled ? "var(--dn-t4)" : "var(--dn-t2)", display: "grid", placeItems: "center", cursor: disabled ? "not-allowed" : "pointer" }}>
      {children}
    </button>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ color: "var(--dn-t4)", fontSize: "0.64rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ color: "var(--dn-t1)", fontWeight: 900, fontSize: "0.78rem", marginTop: "0.15rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
