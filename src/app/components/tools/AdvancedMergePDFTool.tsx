import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, CheckCircle2, Download, Eye, FileStack, Loader2, Upload, X } from "lucide-react";
import { categoryMeta, type Tool } from "../../data/tools";
import { pdfApi, type MergeSelectedPage } from "../../../services/pdfApi";
import { resetDocNovaState } from "../../../lib/resetDocNovaState";
import { getFriendlyErrorMessage } from "../../../utils/errorHandler";
import { FilePreviewPanel, type PreviewFile, type PreviewPage, type QueuePage } from "./FilePreviewPanel";

interface MergeFile extends PreviewFile {
  file: File;
}

interface OutputFile {
  blob: Blob;
  url: string;
  name: string;
  size: number;
}

export function AdvancedMergePDFTool({ tool }: { tool: Tool }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [files, setFiles] = useState<MergeFile[]>([]);
  const [queue, setQueue] = useState<QueuePage[]>([]);
  const [isDraggingUpload, setIsDraggingUpload] = useState(false);
  const [draggingQueueId, setDraggingQueueId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [output, setOutput] = useState<OutputFile | null>(null);
  const [outputFileName, setOutputFileName] = useState("docnova-merged-selected");
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedPageIds = useMemo(() => new Set(queue.map(page => page.id)), [queue]);
  const catMeta = categoryMeta[tool.category];
  const estimatedSize = useMemo(() => {
    const bytes = files.reduce((sum, file) => {
      const selectedCount = queue.filter(page => page.fileId === file.id).length;
      const pageCount = Math.max(file.pages.length, 1);
      return sum + (file.size * selectedCount) / pageCount;
    }, 0);
    return formatBytes(bytes);
  }, [files, queue]);

  useEffect(() => {
    return () => {
      if (output?.url) URL.revokeObjectURL(output.url);
    };
  }, [output?.url]);

  const handleFiles = async (incoming: File[], insertIndex?: number) => {
    const targetIndex = insertIndex ?? queue.length;
    const pdfFiles = incoming.filter(file => file.name.toLowerCase().endsWith(".pdf"));
    if (pdfFiles.length === 0) {
      setErrorMsg("Please upload PDF files.");
      setProcessing(false);
      return;
    }

    setErrorMsg("");
    setOutput(null);
    if (files.length === 0 && !outputFileName.trim()) {
      setOutputFileName("docnova-merged-selected");
    }

    const nextFiles: MergeFile[] = pdfFiles.map(file => ({
      id: makeFileId(file),
      file,
      name: file.name,
      size: file.size,
      pages: [],
      loading: true,
    }));

    setFiles(prev => [...prev, ...nextFiles]);

    for (const source of nextFiles) {
      try {
        const first = await pdfApi.previewPDF(source.file, { pageRange: "1" });
        const totalPages = Math.max(first.total || first.images.length, first.images.length, 1);
        let pages: PreviewPage[] = Array.from({ length: totalPages }, (_, index) => {
          const pageNumber = index + 1;
          const firstImage = first.images.find(image => image.page === pageNumber);
          return {
            id: `${source.id}-${pageNumber}-${Math.random().toString(36).slice(2, 6)}`,
            fileId: source.id,
            fileName: source.name,
            pageIndex: index,
            pageNumber,
            thumbnail: firstImage ? `data:image/jpeg;base64,${firstImage.image}` : undefined,
          };
        });

        setQueue(prev => {
          const next = [...prev];
          next.splice(insertIndex ?? prev.length, 0, ...pages.map((p, i) => ({ ...p, order: 0 })));
          return next.map((p, i) => ({ ...p, order: i + 1 }));
        });

        setFiles(prev => prev.map(file => file.id === source.id ? {
          ...file,
          pages,
          loading: false,
          previewStatus: `Generating preview ${Math.min(first.images.length, totalPages)}/${totalPages} pages`,
        } : file));

        for (let start = 2; start <= totalPages; start += 4) {
          const end = Math.min(start + 3, totalPages);
          const batch = await pdfApi.previewPDF(source.file, { pageRange: `${start}-${end}` });
          const thumbnails = new Map(batch.images.map(image => [image.page, `data:image/jpeg;base64,${image.image}`]));
          pages = pages.map(page => thumbnails.has(page.pageNumber) ? { ...page, thumbnail: thumbnails.get(page.pageNumber) } : page);
          setFiles(prev => prev.map(file => file.id === source.id ? {
            ...file,
            pages,
            loading: false,
            previewStatus: `Generating preview ${Math.min(end, totalPages)}/${totalPages} pages`,
          } : file));
          setQueue(prev => prev.map(page => thumbnails.has(page.pageNumber) && page.fileId === source.id ? { ...page, thumbnail: thumbnails.get(page.pageNumber) } : page));
        }

        setFiles(prev => prev.map(file => file.id === source.id ? { ...file, pages, loading: false, previewStatus: "Preview ready" } : file));
      } catch (error) {
        setFiles(prev => prev.map(file => file.id === source.id ? {
          ...file,
          loading: false,
          previewStatus: undefined,
          error: getFriendlyErrorMessage(error, 'conversion'),
        } : file));
      }
    }
  };

  useEffect(() => {
    if (location.state?.sourceFileUrl) {
      const { sourceFileUrl, sourceFileName } = location.state;
      navigate(location.pathname, { replace: true, state: {} });
      resetDocNovaState(tool.id);

      setProcessing(true);
      setErrorMsg("Loading file...");

      fetch(sourceFileUrl)
        .then(res => {
          if (!res.ok) throw new Error("Failed to load previous file");
          return res.blob();
        })
        .then(blob => {
          setErrorMsg("");
          const file = new File([blob], sourceFileName || "document.pdf", { type: blob.type });
          handleFiles([file]);
        })
        .catch(err => {
          setErrorMsg(getFriendlyErrorMessage(err, 'download'));
        })
        .finally(() => {
          setProcessing(false);
        });
    }
  }, [location.state]);

  const togglePage = (page: PreviewPage) => {
    setOutput(null);
    setQueue(prev => {
      if (prev.some(item => item.id === page.id)) {
        return prev.filter(item => item.id !== page.id).map((item, index) => ({ ...item, order: index + 1 }));
      }

      return [...prev, { ...page, order: prev.length + 1 }];
    });
  };

  const selectFile = (fileId: string) => {
    const file = files.find(item => item.id === fileId);
    if (!file) return;

    setOutput(null);
    setQueue(prev => {
      const existing = new Set(prev.map(page => page.id));
      const added = file.pages
        .filter(page => !existing.has(page.id))
        .map((page, index) => ({ ...page, order: prev.length + index + 1 }));
      return [...prev, ...added];
    });
  };

  const deselectFile = (fileId: string) => {
    setOutput(null);
    setQueue(prev => prev.filter(page => page.fileId !== fileId).map((page, index) => ({ ...page, order: index + 1 })));
  };

  const selectAllFiles = () => {
    setOutput(null);
    const allPages = files.flatMap(file => file.pages);
    setQueue(allPages.map((page, index) => ({ ...page, order: index + 1 })));
  };

  const clearSelection = () => {
    setOutput(null);
    setQueue([]);
  };

  const invertSelection = () => {
    setOutput(null);
    const current = new Set(queue.map(page => page.id));
    const inverted = files.flatMap(file => file.pages).filter(page => !current.has(page.id));
    setQueue(inverted.map((page, index) => ({ ...page, order: index + 1 })));
  };

  const removeFile = (fileId: string) => {
    setOutput(null);
    setFiles(prev => prev.filter(file => file.id !== fileId));
    setQueue(prev => prev.filter(page => page.fileId !== fileId).map((page, index) => ({ ...page, order: index + 1 })));
  };

  const removeQueuePage = (pageId: string) => {
    setOutput(null);
    setQueue(prev => prev.filter(page => page.id !== pageId).map((page, index) => ({ ...page, order: index + 1 })));
  };

  const dropOnQueuePage = (targetId: string) => {
    if (!draggingQueueId || draggingQueueId === targetId) return;

    setQueue(prev => {
      const fromIndex = prev.findIndex(page => page.id === draggingQueueId);
      const toIndex = prev.findIndex(page => page.id === targetId);
      if (fromIndex < 0 || toIndex < 0) return prev;

      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next.map((page, index) => ({ ...page, order: index + 1 }));
    });
    setDraggingQueueId(null);
  };


  const handleInsertFile = (index: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.multiple = true;
    input.onchange = (e: any) => {
      if (e.target.files) handleFiles(Array.from(e.target.files), index);
    };
    input.click();
  };

  const handleRotatePage = (pageId: string, angle: number) => {
    const rotate = <T extends PreviewPage>(page: T): T =>
      page.id === pageId ? { ...page, rotation: ((page.rotation || 0) + angle + 360) % 360 } : page;
    setFiles(prev => prev.map(file => ({ ...file, pages: file.pages.map(rotate) })));
    setQueue(prev => prev.map(rotate));
  };

  const handleDuplicatePage = (pageId: string) => {
    setQueue(prev => {
      const idx = prev.findIndex(p => p.id === pageId);
      if (idx === -1) return prev;
      const next = [...prev];
      next.splice(idx + 1, 0, { ...prev[idx], id: `${prev[idx].id}-copy-${Math.random().toString(36).slice(2, 6)}` });
      return next.map((p, i) => ({ ...p, order: i + 1 }));
    });
  };

  const processMerge = async () => {
    if (queue.length === 0) {
      setErrorMsg("Select at least one page before merging.");
      return;
    }

    setProcessing(true);
    setProgress(14);
    setErrorMsg("");

    try {
      const selectedPages: MergeSelectedPage[] = queue.map((page, index) => ({
        fileId: page.fileId,
        fileName: page.fileName,
        pageIndex: page.pageIndex,
        pageNumber: page.pageNumber,
        order: index + 1,
      }));

      setProgress(45);
      const blob = await pdfApi.mergeSelectedPDFs(files.map(file => ({ id: file.id, file: file.file })), selectedPages);
      if (!blob) throw new Error("Merge failed.");

      if (output?.url) URL.revokeObjectURL(output.url);
      setOutput(null);
      const downloadName = buildOutputFileName(outputFileName, "docnova-merged-selected.pdf");
      const resultJob = await pdfApi.createResultJob(blob, {
        outputFileName: downloadName,
        toolType: tool.id,
        toolLabel: tool.label,
        outputFormat: tool.outputFormat,
        summary: [
          { label: "Selected pages", value: String(queue.length) },
          { label: "Source files", value: String(files.length) },
        ],
        items: [
          { name: downloadName, size: blob.size, kind: "pdf" },
        ],
      });
      setProgress(100);
      navigate(`/result/${resultJob.jobId}`);
    } catch (error) {
      setErrorMsg(getFriendlyErrorMessage(error, 'conversion'));
    } finally {
      window.setTimeout(() => {
        setProcessing(false);
        setProgress(0);
      }, 350);
    }
  };

  return (
    <div style={{ color: "var(--dn-t1)", paddingTop: files.length > 0 ? "0" : "48px", minHeight: files.length > 0 ? "calc(100vh - 60px)" : "100vh", background: "var(--dn-bg)", transition: "var(--dn-transition)", fontFamily: "'Inter', sans-serif", position: "relative" }}>
      {/* Background Blobs (Dark Mode Only) */}
      <div className="dn-dark-blobs fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#2563eb]/15 rounded-full blur-[100px] animate-[drift1_25s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#0267b8]/15 rounded-full blur-[120px] animate-[drift2_30s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#b4c5ff]/5 rounded-full blur-[150px] animate-[drift1_40s_ease-in-out_infinite]"></div>
      </div>
      <style>{`
        @keyframes mergeProgressShimmer {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }
        [data-theme="light"] .dn-dark-blobs { display: none; }
        html:not([data-theme="dark"]) .dn-dark-blobs { display: none; } /* Fallback */
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
      <div style={files.length > 0 ? { padding: "0", height: "calc(100vh - 60px)", display: "flex", flexDirection: "column", position: "relative", zIndex: 10 } : { maxWidth: "1440px", margin: "0 auto", padding: "2rem 1.5rem 6rem", position: "relative", zIndex: 10 }}>
        {files.length === 0 && (
          <Link to={`/${tool.category}`} style={{ textDecoration: "none" }}>
            <motion.div whileHover={{ x: -3 }} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--dn-t3)", fontSize: "0.875rem", marginBottom: "2rem", cursor: "pointer" }}>
              <ArrowLeft size={15} /> {catMeta.label}
            </motion.div>
          </Link>
        )}

        {files.length === 0 && (
          <>
            <header style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ width: 60, height: 60, borderRadius: "4px", background: tool.iconGrad, display: "grid", placeItems: "center", boxShadow: `0 8px 28px ${tool.color}42` }}>
                <FileStack size={28} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.7rem)", lineHeight: 1.05, fontWeight: 920, margin: 0 }}>Advanced Merge PDF</h1>
                <p style={{ color: "var(--dn-t3)", marginTop: "0.55rem", maxWidth: 720, lineHeight: 1.6 }}>
                  Preview every page, select only what you need, reorder the merge queue, then download the final PDF.
                </p>
              </div>
            </header>

            <div
              onDrop={event => {
                event.preventDefault();
                setIsDraggingUpload(false);
                handleFiles(Array.from(event.dataTransfer.files));
              }}
              onDragOver={event => {
                event.preventDefault();
                setIsDraggingUpload(true);
              }}
              onDragLeave={() => setIsDraggingUpload(false)}
              onClick={() => inputRef.current?.click()}
              style={{
                minHeight: "clamp(420px, calc(100vh - 320px), 680px)",
                borderRadius: "5px",
                border: `2px dashed ${isDraggingUpload ? "#60a5fa" : "var(--dn-border2)"}`,
                background: isDraggingUpload ? "rgba(59,130,246,0.1)" : "var(--dn-bg-card)",
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                cursor: "pointer",
                boxShadow: isDraggingUpload ? `0 0 0 4px rgba(59,130,246,0.15), var(--dn-shadow)` : "var(--dn-shadow)",
                marginBottom: "2rem",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden"
              }}
              className="dn-glass-panel group"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `linear-gradient(135deg, transparent, rgba(59,130,246,0.05), transparent)` }} />
              <input ref={inputRef} type="file" accept=".pdf" multiple style={{ display: "none" }} onChange={event => event.target.files && handleFiles(Array.from(event.target.files))} />
              <div className="relative z-10 flex flex-col items-center py-6">
                <div style={{ width: 64, height: 64, margin: "0 auto 1rem", borderRadius: "16px", display: "grid", placeItems: "center", background: "rgba(59,130,246,0.15)", color: "#60a5fa", boxShadow: "0 0 30px rgba(59,130,246,0.2)", transition: "transform 0.3s" }} className="group-hover:scale-110">
                  <Upload size={28} />
                </div>
                <div style={{ color: "var(--dn-t1)", fontWeight: 800, fontSize: "1.1rem" }}>{isDraggingUpload ? "Drop PDFs here" : `Upload PDFs`}</div>
                <div style={{ color: "var(--dn-t4)", fontSize: "0.85rem", marginTop: "0.5rem" }}>Multiple PDFs supported. Thumbnails generate automatically.</div>
              </div>
            </div>
          </>
        )}

        <AnimatePresence>
          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "1rem", padding: "0.85rem 1rem", borderRadius: "4px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", color: "#f87171", fontSize: "0.86rem" }}>
              <X size={16} /> {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {files.length > 0 && (
          <FilePreviewPanel
            files={files}
            queue={queue}
            selectedPageIds={selectedPageIds}
            draggingQueueId={draggingQueueId}
            estimatedSize={estimatedSize}
            onTogglePage={togglePage}
            onSelectFile={selectFile}
            onDeselectFile={deselectFile}
            onRemoveFile={removeFile}
            onSelectAllFiles={selectAllFiles}
            onClearSelection={clearSelection}
            onInvertSelection={invertSelection}
            onRemoveQueuePage={removeQueuePage}
            onDragStart={setDraggingQueueId}
            onDropOnQueuePage={dropOnQueuePage}
            processing={processing}
            onProcess={processMerge}
            onInsertFile={handleInsertFile}
            onRotatePage={handleRotatePage}
            onDuplicatePage={handleDuplicatePage}
            outputFileName={outputFileName}
            onOutputFileNameChange={setOutputFileName}
          />
        )}

        {processing && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginTop: "1rem", height: 8, borderRadius: 999, overflow: "hidden", background: "rgba(15,23,42,0.54)", border: "1px solid rgba(96,165,250,0.28)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 22px rgba(37,99,235,0.12)" }}
          >
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#2563eb,#60a5fa,#93c5fd)", backgroundSize: "200% 100%", animation: "mergeProgressShimmer 1.8s linear infinite", boxShadow: "0 0 18px rgba(96,165,250,0.48)", willChange: "width, background-position" }}
            />
          </motion.div>
        )}

        {output && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: "1.25rem", borderRadius: "4px", border: "1px solid rgba(34,197,94,0.24)", background: "var(--dn-bg-card)", padding: "1rem", boxShadow: "var(--dn-shadow)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              <CheckCircle2 size={22} color="#22c55e" />
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ color: "var(--dn-t1)", fontWeight: 850 }}>Final output preview</div>
                <div style={{ color: "var(--dn-t4)", fontSize: "0.78rem" }}>{output.name} • {formatBytes(output.size)}</div>
              </div>
              <button
                type="button"
                onClick={() => pdfApi.downloadBlob(output.blob, output.name)}
                style={{ border: "none", borderRadius: 999, background: "linear-gradient(135deg,#16a34a,#22c55e)", color: "#fff", padding: "0.72rem 1rem", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                <Download size={16} /> Download PDF
              </button>
            </div>
            <div style={{ height: 520, borderRadius: "4px", overflow: "hidden", border: "1px solid var(--dn-border)", background: "var(--dn-bg-subtle)" }}>
              <object data={output.url} type="application/pdf" width="100%" height="100%">
                <div style={{ display: "grid", placeItems: "center", height: "100%", color: "var(--dn-t3)" }}>
                  <Eye size={18} /> Preview is ready. Use Download PDF to save it.
                </div>
              </object>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}

function makeFileId(file: File) {
  return `${file.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${file.size}-${Math.random().toString(36).slice(2, 8)}`;
}

function extensionOf(filename: string) {
  const match = filename.match(/(\.[^/.]+)$/);
  return match ? match[1] : "";
}

function buildOutputFileName(inputName: string, fallbackName: string) {
  const fallbackExtension = extensionOf(fallbackName);
  const sanitized = inputName.trim().replace(/[\\/:*?"<>|]/g, "-");
  if (!sanitized) return fallbackName;
  return extensionOf(sanitized) ? sanitized : `${sanitized}${fallbackExtension}`;
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
