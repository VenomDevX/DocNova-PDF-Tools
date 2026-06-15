import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  FileArchive,
  FileSpreadsheet,
  FileText,
  GripVertical,
  Image as ImageIcon,
  Layers,
  Loader2,
  Maximize2,
  Minimize2,
  Plus,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Settings,
  Trash2,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { categoryMeta, ocrLanguages, type Tool } from "../../data/tools";
import { pdfApi } from "../../../services/pdfApi";
import { resetDocNovaState } from "../../../lib/resetDocNovaState";
import { getFriendlyErrorMessage } from "../../../utils/errorHandler";

type WorkflowStatus = "idle" | "processing" | "done" | "error";
type PreviewKind = "pdf" | "image" | "document" | "spreadsheet" | "presentation" | "text" | "generic";

export interface PreviewItem {
  id: string;
  fileId: string;
  fileName: string;
  index: number;
  label: string;
  kind: PreviewKind;
  thumbnail?: string;
  text?: string;
  rows?: string[][];
}

interface WorkflowFile {
  id: string;
  file: File;
  name: string;
  size: number;
  kind: PreviewKind;
  items: PreviewItem[];
  loading: boolean;
  error?: string;
  objectUrl?: string;
  previewStatus?: string;
}

interface OutputPreviewItem {
  id: string;
  name: string;
  size: number;
  kind: PreviewKind | "archive";
  blob: Blob;
  url?: string;
  text?: string;
}

interface ProcessedOutput {
  items: OutputPreviewItem[];
  downloadBlob: Blob;
  downloadName: string;
  summary: Array<{ label: string; value: string }>;
}

type ToolSettings = {
  splitMode: string;
  pageRange: string;
  customGroups: string;
  rotation: string;
  rotationScope: string;
  compression: string;
  conversionMode: string;
  preserveLayout: boolean;
  extractMode: string;
  oneSheetPerPage: boolean;
  imageFormat: string;
  imageQuality: number;
  pageSize: string;
  orientation: string;
  margins: string;
  fitMode: string;
  ocrLang: string;
  ocrOutput: string;
  editTool: string;
  watermarkText: string;
  password: string;
};

const defaultSettings: ToolSettings = {
  splitMode: "selected",
  pageRange: "",
  customGroups: "1-2, 3-4",
  rotation: "90",
  rotationScope: "selected",
  compression: "medium",
  conversionMode: "selected",
  preserveLayout: true,
  extractMode: "tables",
  oneSheetPerPage: true,
  imageFormat: "jpg",
  imageQuality: 85,
  pageSize: "A4",
  orientation: "portrait",
  margins: "normal",
  fitMode: "fit-page",
  ocrLang: "eng",
  ocrOutput: "txt",
  editTool: "text",
  watermarkText: "DocNova",
  password: "",
};

const panelStyle: React.CSSProperties = {
  background: "var(--dn-bg-card)",
  border: "1px solid var(--dn-border)",
  boxShadow: "var(--dn-shadow)",
};

const previewCache = new Map<string, PreviewItem[]>();

export function UniversalToolWorkflow({ tool }: { tool: Tool }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [files, setFiles] = useState<WorkflowFile[]>([]);
  const [selectionOrder, setSelectionOrder] = useState<string[]>([]);
  const [settings, setSettings] = useState<ToolSettings>(defaultSettings);
  const [status, setStatus] = useState<WorkflowStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [processingLabel, setProcessingLabel] = useState("Preparing preview");
  const [errorMsg, setErrorMsg] = useState("");
  const [output, setOutput] = useState<ProcessedOutput | null>(null);
  const [isDraggingUpload, setIsDraggingUpload] = useState(false);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);
  const [draggingQueueId, setDraggingQueueId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const catMeta = categoryMeta[tool.category];
  const acceptsMultiple = tool.multipleFiles || tool.id === "image-to-pdf" || tool.id === "insert-pages";
  const allItems = useMemo(() => files.flatMap(file => file.items), [files]);
  const selectedIds = useMemo(() => new Set(selectionOrder), [selectionOrder]);
  const selectedItems = useMemo(
    () => selectionOrder.map(id => allItems.find(item => item.id === id)).filter(Boolean) as PreviewItem[],
    [allItems, selectionOrder],
  );
  const selectedSize = useMemo(() => {
    if (selectedItems.length === 0) return 0;
    return files.reduce((sum, file) => {
      const selectedCount = selectedItems.filter(item => item.fileId === file.id).length;
      const total = Math.max(file.items.length, 1);
      return sum + (file.size * selectedCount) / total;
    }, 0);
  }, [files, selectedItems]);

  const loadPreviewForFile = useCallback(async (source: WorkflowFile) => {
    const cacheKey = cacheKeyForFile(source.file);
    const cachedItems = previewCache.get(cacheKey);
    if (cachedItems) {
      const hydratedItems = hydrateCachedItems(cachedItems, source);
      setFiles(prev => prev.map(file => file.id === source.id ? { ...file, items: hydratedItems, loading: false, previewStatus: "Preview ready" } : file));
      if (shouldAutoSelect(tool.id)) addSelectionItems(hydratedItems, setSelectionOrder);
      return;
    }

    try {
      if (source.kind === "pdf") {
        const first = await pdfApi.previewPDF(source.file, { pageRange: "1" });
        const totalPages = Math.max(first.total || first.images.length, first.images.length, 1);
        let currentItems = Array.from({ length: totalPages }, (_, index) => {
          const pageNumber = index + 1;
          const firstImage = first.images.find(image => image.page === pageNumber);
          return {
            id: `${source.id}-${pageNumber}`,
            fileId: source.id,
            fileName: source.name,
            index,
            label: `Page ${pageNumber}`,
            kind: "pdf" as PreviewKind,
            thumbnail: firstImage ? `data:image/jpeg;base64,${firstImage.image}` : undefined,
          };
        });

        setFiles(prev => prev.map(file => file.id === source.id ? {
          ...file,
          items: currentItems,
          loading: false,
          previewStatus: `Generating preview ${Math.min(first.images.length, totalPages)}/${totalPages} pages`,
        } : file));
        if (shouldAutoSelect(tool.id)) addSelectionItems(currentItems, setSelectionOrder);

        for (let start = 2; start <= totalPages; start += 4) {
          const end = Math.min(start + 3, totalPages);
          const batch = await pdfApi.previewPDF(source.file, { pageRange: `${start}-${end}` });
          const thumbnails = new Map(batch.images.map(image => [image.page, `data:image/jpeg;base64,${image.image}`]));
          currentItems = currentItems.map(item => thumbnails.has(item.index + 1) ? { ...item, thumbnail: thumbnails.get(item.index + 1) } : item);

          setFiles(prev => prev.map(file => file.id === source.id ? {
            ...file,
            items: currentItems,
            loading: false,
            previewStatus: `Generating preview ${Math.min(end, totalPages)}/${totalPages} pages`,
          } : file));
        }

        previewCache.set(cacheKey, currentItems);
        setFiles(prev => prev.map(file => file.id === source.id ? { ...file, items: currentItems, loading: false, previewStatus: "Preview ready" } : file));
        return;
      }

      const items = await buildPreviewItems(source, tool);
      previewCache.set(cacheKey, items);
      setFiles(prev => prev.map(file => file.id === source.id ? { ...file, items, loading: false, previewStatus: "Preview ready" } : file));
      if (shouldAutoSelect(tool.id)) addSelectionItems(items, setSelectionOrder);
    } catch (error) {
      setFiles(prev => prev.map(file => file.id === source.id ? {
        ...file,
        loading: false,
        previewStatus: undefined,
        error: getFriendlyErrorMessage(error, 'conversion'),
      } : file));
    }
  }, [tool]);

  const addFiles = useCallback(async (incoming: File[], replaceId = replaceTargetId) => {
    const accepts = tool.accepts.split(",").map(ext => ext.trim().toLowerCase());
    const valid = incoming.filter(file => {
      const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
      return accepts.includes(ext) || accepts.includes("*");
    });

    if (valid.length === 0) {
      setErrorMsg(`Please upload: ${tool.accepts}`);
      setStatus("idle");
      return;
    }

    const accepted = acceptsMultiple && !replaceId ? valid : [valid[0]];
    const nextFiles = accepted.map(file => createWorkflowFile(file));
    const replacedFile = replaceId ? files.find(file => file.id === replaceId) : undefined;
    const replacedItemIds = new Set(replacedFile?.items.map(item => item.id) || []);

    if (replacedFile?.objectUrl) URL.revokeObjectURL(replacedFile.objectUrl);
    setErrorMsg("");
    resetOutput(output);
    setOutput(null);
    setStatus("idle");
    setReplaceTargetId(null);
    setSelectionOrder(prev => prev.filter(id => !replacedItemIds.has(id)));
    setFiles(prev => {
      const base = replaceId ? prev.filter(file => file.id !== replaceId) : acceptsMultiple ? prev : [];
      return [...base, ...nextFiles];
    });

    nextFiles.forEach(source => {
      void loadPreviewForFile(source);
    });
  }, [acceptsMultiple, files, loadPreviewForFile, output, replaceTargetId, tool]);

  useEffect(() => {
    if (location.state?.sourceFileUrl) {
      const { sourceFileUrl, sourceFileName } = location.state;
      // Properly clear location.state using React Router instead of breaking history
      navigate(location.pathname, { replace: true, state: {} });
      
      setStatus("processing");
      setProcessingLabel("Loading file...");
      
      fetch(sourceFileUrl)
        .then(res => {
          if (!res.ok) throw new Error("Failed to load previous file");
          return res.blob();
        })
        .then(blob => {
          const file = new File([blob], sourceFileName || "document.pdf", { type: blob.type });
          addFiles([file]);
        })
        .catch(err => {
          setErrorMsg(getFriendlyErrorMessage(err, 'download'));
          setStatus("idle");
        });
    }
  }, [addFiles, location.state]);

  const removeFile = (fileId: string) => {
    const target = files.find(file => file.id === fileId);
    if (target?.objectUrl) URL.revokeObjectURL(target.objectUrl);
    const targetItemIds = new Set(target?.items.map(item => item.id) || []);
    setFiles(prev => prev.filter(file => file.id !== fileId));
    setSelectionOrder(prev => prev.filter(id => !targetItemIds.has(id)));
    resetOutput(output);
    setOutput(null);
    setStatus("idle");
  };

  const replaceFile = (fileId: string) => {
    setReplaceTargetId(fileId);
    inputRef.current?.click();
  };

  const selectItems = (items: PreviewItem[]) => {
    resetOutput(output);
    setOutput(null);
    setSelectionOrder(prev => {
      const current = new Set(prev);
      const additions = items.filter(item => !current.has(item.id)).map(item => item.id);
      return [...prev, ...additions];
    });
  };

  const deselectItems = (items: PreviewItem[]) => {
    resetOutput(output);
    setOutput(null);
    const remove = new Set(items.map(item => item.id));
    setSelectionOrder(prev => prev.filter(id => !remove.has(id)));
  };

  const toggleItem = (item: PreviewItem) => {
    resetOutput(output);
    setOutput(null);
    setSelectionOrder(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]);
  };

  const selectAll = () => selectItems(allItems);
  const clearSelection = () => deselectItems(allItems);
  const invertSelection = () => {
    resetOutput(output);
    setOutput(null);
    const current = new Set(selectionOrder);
    setSelectionOrder(allItems.filter(item => !current.has(item.id)).map(item => item.id));
  };

  const removeQueueItem = (id: string) => setSelectionOrder(prev => prev.filter(itemId => itemId !== id));

  const dropOnQueueItem = (targetId: string) => {
    if (!draggingQueueId || draggingQueueId === targetId) return;
    setSelectionOrder(prev => {
      const fromIndex = prev.indexOf(draggingQueueId);
      const toIndex = prev.indexOf(targetId);
      if (fromIndex < 0 || toIndex < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setDraggingQueueId(null);
  };

  const handleReset = () => {
    files.forEach(file => file.objectUrl && URL.revokeObjectURL(file.objectUrl));
    resetOutput(output);
    resetDocNovaState(tool.id);
    setFiles([]);
    setSelectionOrder([]);
    setSettings(defaultSettings);
    setStatus("idle");
    setProgress(0);
    setErrorMsg("");
    setOutput(null);
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      setErrorMsg("Upload a file first.");
      return;
    }
    if (tool.hasPassword && !settings.password.trim()) {
      setErrorMsg("Enter the password first.");
      return;
    }
    if (needsSelection(tool.id) && selectedItems.length === 0) {
      setErrorMsg("Select at least one page or item first.");
      return;
    }
    if (tool.id === "delete-pages" && selectedItems.length >= allItems.length) {
      setErrorMsg("You cannot delete every page.");
      return;
    }

    resetOutput(output);
    setOutput(null);
    setErrorMsg("");
    setStatus("processing");
    setProgress(8);
    setProcessingLabel("Preparing input preview");

    try {
      await animateProgress(setProgress, 8, 28, 320);
      setProcessingLabel("Applying settings");
      await animateProgress(setProgress, 28, 48, 280);
      const processed = await processTool(tool, files, selectedItems, settings, setProcessingLabel);
      setProcessingLabel("Generating output preview");
      const resultJob = await pdfApi.createResultJob(processed.downloadBlob, {
        outputFileName: processed.downloadName,
        toolType: tool.id,
        toolLabel: tool.label,
        outputFormat: tool.outputFormat,
        summary: processed.summary,
        items: processed.items.map(item => ({
          name: item.name,
          size: item.size,
          kind: item.kind,
        })),
      });
      resetOutput(processed);
      await animateProgress(setProgress, 78, 100, 350);
      setStatus("done");
      navigate(`/result/${resultJob.jobId}`);
    } catch (error) {
      setStatus("error");
      setProgress(0);
      setErrorMsg(getFriendlyErrorMessage(error, 'conversion'));
    }
  };

  const handleDownload = () => {
    if (!output) {
      setErrorMsg("Preview the processed output first.");
      return;
    }
    pdfApi.downloadBlob(output.downloadBlob, output.downloadName);
  };

  return (
    <div style={{ color: "var(--dn-t1)", paddingTop: "60px", minHeight: "100vh", background: "var(--dn-bg)", transition: "var(--dn-transition)", fontFamily: "'Inter', sans-serif", position: "relative" }}>
      {/* Background Blobs (Dark Mode Only) */}
      <div className="dn-dark-blobs fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#2563eb]/15 rounded-full blur-[100px] animate-[drift1_25s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#0267b8]/15 rounded-full blur-[120px] animate-[drift2_30s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#b4c5ff]/5 rounded-full blur-[150px] animate-[drift1_40s_ease-in-out_infinite]"></div>
      </div>

      <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "1.5rem 1.5rem 2rem", position: "relative", zIndex: 10 }}>
        <style>{`
          ::-webkit-scrollbar { display: none !important; }
          * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @media (max-width: 980px) {
            .dn-workflow-grid { grid-template-columns: 1fr !important; }
            .dn-sticky-panel { position: static !important; }
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

        <Link to={`/${tool.category}`} style={{ textDecoration: "none" }}>
          <motion.div whileHover={{ x: -3 }} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--dn-t3)", fontSize: "0.875rem", marginBottom: "1.25rem", cursor: "pointer" }}>
            <ArrowLeft size={15} /> {catMeta.label}
          </motion.div>
        </Link>

        <header style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1.25rem" }}>
          <div style={{ width: 60, height: 60, borderRadius: "4px", background: tool.iconGrad, display: "grid", placeItems: "center", boxShadow: `0 8px 28px ${tool.color}42`, flexShrink: 0 }}>
            <tool.icon size={28} color="#fff" />
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.7rem)", lineHeight: 1.05, fontWeight: 920, margin: 0 }}>{tool.label}</h1>
            <p style={{ color: "var(--dn-t3)", marginTop: "0.55rem", maxWidth: 760, lineHeight: 1.6 }}>{tool.desc}</p>
            <p style={{ color: "var(--dn-t4)", fontSize: "0.78rem", marginTop: "0.35rem" }}>
              Upload, preview, adjust settings, process, preview the final output, then download.
            </p>
          </div>
        </header>

        <section
          onDrop={event => {
            event.preventDefault();
            setIsDraggingUpload(false);
            addFiles(Array.from(event.dataTransfer.files));
          }}
          onDragOver={event => {
            event.preventDefault();
            setIsDraggingUpload(true);
          }}
          onDragLeave={() => setIsDraggingUpload(false)}
          onClick={() => inputRef.current?.click()}
          style={{
            minHeight: 168,
            borderRadius: "4px",
            border: `2px dashed ${isDraggingUpload ? tool.color : "var(--dn-border2)"}`,
            background: isDraggingUpload ? `${tool.color}14` : "var(--dn-bg-card)",
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            cursor: "pointer",
            boxShadow: "var(--dn-shadow)",
            marginBottom: "1rem",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={tool.accepts}
            multiple={acceptsMultiple && !replaceTargetId}
            style={{ display: "none" }}
            onChange={event => {
              if (event.target.files) addFiles(Array.from(event.target.files), replaceTargetId);
              event.target.value = "";
            }}
          />
          <div>
            <div style={{ width: 58, height: 58, margin: "0 auto 0.85rem", borderRadius: "4px", display: "grid", placeItems: "center", background: `${tool.color}18`, color: tool.color, boxShadow: `0 0 30px ${tool.color}24` }}>
              <Upload size={26} />
            </div>
            <div style={{ color: "var(--dn-t1)", fontWeight: 800 }}>{isDraggingUpload ? "Drop files here" : `Upload ${tool.label} files`}</div>
            <div style={{ color: "var(--dn-t4)", fontSize: "0.82rem", marginTop: "0.35rem" }}>
              {acceptsMultiple ? "Multiple files supported." : "One file at a time."} Accepted: {tool.accepts}
            </div>
          </div>
        </section>

        <AnimatePresence>
          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "1rem", padding: "0.85rem 1rem", borderRadius: "4px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", color: "#f87171", fontSize: "0.86rem" }}>
              <AlertCircle size={16} /> <span style={{ flex: 1 }}>{errorMsg}</span>
              <button type="button" onClick={() => setErrorMsg("")} style={{ border: "none", background: "transparent", color: "#f87171", cursor: "pointer", display: "grid", placeItems: "center" }}>
                <X size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {files.length > 0 && (
          <div className="dn-workflow-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 330px", gap: "1rem", alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <SelectionToolbar
                selectedCount={selectedItems.length}
                totalCount={allItems.length}
                selectedSize={selectedSize}
                onSelectAll={selectAll}
                onDeselectAll={clearSelection}
                onInvert={invertSelection}
              />

              <UniversalFilePreview
                files={files}
                selectedIds={selectedIds}
                rotation={tool.id === "rotate-pdf" ? settings.rotation : "0"}
                onToggleItem={toggleItem}
                onRemoveFile={removeFile}
                onReplaceFile={replaceFile}
                onSelectFile={(fileId) => selectItems(files.find(file => file.id === fileId)?.items || [])}
                onDeselectFile={(fileId) => deselectItems(files.find(file => file.id === fileId)?.items || [])}
              />

              {selectedItems.length > 0 && queueTools.has(tool.id) && (
                <QueuePanel
                  title={tool.id === "image-to-pdf" || tool.id === "jpg-to-pdf" || tool.id === "png-to-pdf" ? "Image Order" : "Selection Queue"}
                  items={selectedItems}
                  draggingId={draggingQueueId}
                  onDragStart={setDraggingQueueId}
                  onDropOnItem={dropOnQueueItem}
                  onRemove={removeQueueItem}
                />
              )}

              <ToolSettingsPanel
                tool={tool}
                settings={settings}
                selectedItems={selectedItems}
                allItems={allItems}
                files={files}
                onChange={(patch) => {
                  resetOutput(output);
                  setOutput(null);
                  setSettings(prev => ({ ...prev, ...patch }));
                }}
              />

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: `0 0 34px ${tool.color}38` }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleProcess}
                  disabled={status === "processing"}
                  style={{
                    border: "none",
                    borderRadius: "4px",
                    background: `linear-gradient(135deg,${tool.color},#60a5fa)`,
                    color: "#fff",
                    padding: "0.9rem 1.25rem",
                    fontWeight: 850,
                    fontSize: "0.94rem",
                    cursor: status === "processing" ? "not-allowed" : "pointer",
                    fontFamily: "'Inter', sans-serif",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.55rem",
                  }}
                >
                  {status === "processing" ? <Loader2 size={17} style={{ animation: "spin 0.8s linear infinite" }} /> : <Settings size={17} />}
                  {tool.action}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReset}
                  style={{ border: "1px solid var(--dn-border)", borderRadius: "4px", background: "var(--dn-bg-card)", color: "var(--dn-t2)", padding: "0.9rem 1rem", fontWeight: 750, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
                >
                  <X size={16} /> Clear
                </motion.button>
                <span style={{ color: "var(--dn-t4)", fontSize: "0.8rem" }}>
                  Download appears after the final output preview.
                </span>
              </div>

              {output && (
                <OutputPreviewPanel
                  tool={tool}
                  output={output}
                  onDownload={handleDownload}
                />
              )}
            </div>

            <aside className="dn-sticky-panel" style={{ ...panelStyle, borderRadius: "4px", padding: "1rem", position: "sticky", top: 96 }}>
              <WorkflowSteps status={status} hasFiles={files.length > 0} hasSelection={selectedItems.length > 0} hasOutput={!!output} />
              <div style={{ height: 1, background: "var(--dn-border)", margin: "1rem 0" }} />
              <div style={{ display: "grid", gap: "0.7rem" }}>
                <Stat label="Files" value={String(files.length)} />
                <Stat label="Selected" value={`${selectedItems.length}/${allItems.length || 0}`} />
                <Stat label="Estimated output" value={formatBytes(selectedSize || files.reduce((sum, file) => sum + file.size, 0))} />
                <Stat label="Backend" value={tool.backendLib || "DocNova engine"} />
              </div>
            </aside>
          </div>
        )}

        <ProcessingModal open={status === "processing"} progress={progress} label={processingLabel} color={tool.color} />
      </div>
    </div>
  );
}

export function SelectionToolbar({
  selectedCount,
  totalCount,
  selectedSize,
  onSelectAll,
  onDeselectAll,
  onInvert,
}: {
  selectedCount: number;
  totalCount: number;
  selectedSize: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onInvert: () => void;
}) {
  return (
    <div style={{ ...panelStyle, borderRadius: "4px", padding: "1rem", display: "flex", gap: "0.65rem", flexWrap: "wrap", alignItems: "center" }}>
      <ToolbarButton onClick={onSelectAll}>Select All</ToolbarButton>
      <ToolbarButton onClick={onDeselectAll}>Deselect All</ToolbarButton>
      <ToolbarButton onClick={onInvert}>Invert Selection</ToolbarButton>
      <div style={{ marginLeft: "auto", color: "var(--dn-t3)", fontSize: "0.78rem" }}>
        {selectedCount} selected / {totalCount} items - est. {formatBytes(selectedSize)}
      </div>
    </div>
  );
}

export function UniversalFilePreview({
  files,
  selectedIds,
  rotation,
  onToggleItem,
  onRemoveFile,
  onReplaceFile,
  onSelectFile,
  onDeselectFile,
}: {
  files: WorkflowFile[];
  selectedIds: Set<string>;
  rotation: string;
  onToggleItem: (item: PreviewItem) => void;
  onRemoveFile: (fileId: string) => void;
  onReplaceFile: (fileId: string) => void;
  onSelectFile: (fileId: string) => void;
  onDeselectFile: (fileId: string) => void;
}) {
  const [previewItem, setPreviewItem] = useState<PreviewItem | null>(null);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      {files.map(file => (
        <section key={file.id} style={{ ...panelStyle, borderRadius: "4px", padding: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <FileKindIcon kind={file.kind} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ color: "var(--dn-t1)", fontWeight: 800, fontSize: "0.94rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                <div style={{ color: "var(--dn-t4)", fontSize: "0.72rem" }}>
                  {formatBytes(file.size)} - {file.items.length || (file.loading ? "..." : "0")} preview items
                </div>
                {file.previewStatus && (
                  <div style={{ color: "#93c5fd", fontSize: "0.72rem", fontWeight: 750, marginTop: "0.18rem" }}>{file.previewStatus}</div>
                )}
              </div>
            <ToolbarButton onClick={() => onSelectFile(file.id)}>Select File</ToolbarButton>
            <ToolbarButton onClick={() => onDeselectFile(file.id)}>Clear File</ToolbarButton>
            <IconButton label="Replace file" onClick={() => onReplaceFile(file.id)}>
              <RefreshCw size={14} />
            </IconButton>
            <IconButton label="Remove file" onClick={() => onRemoveFile(file.id)} danger>
              <Trash2 size={14} />
            </IconButton>
          </div>

          {file.loading && <PreviewSkeleton />}
          {file.error && (
            <div style={{ color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: "4px", padding: "0.85rem", fontSize: "0.84rem" }}>
              {file.error}
            </div>
          )}
          {!file.loading && !file.error && (
            <PageThumbnailGrid
              items={file.items}
              selectedIds={selectedIds}
              rotation={rotation}
              onToggleItem={onToggleItem}
              onPreviewItem={(item) => {
                setPreviewItem(item);
                setZoom(1);
              }}
            />
          )}
        </section>
      ))}

      {previewItem && (
        <PreviewModal
          item={previewItem}
          zoom={zoom}
          fullscreen={fullscreen}
          onClose={() => {
            setPreviewItem(null);
            setFullscreen(false);
          }}
          onZoomIn={() => setZoom(prev => Math.min(prev + 0.2, 2.4))}
          onZoomOut={() => setZoom(prev => Math.max(prev - 0.2, 0.6))}
          onToggleFullscreen={() => setFullscreen(prev => !prev)}
        />
      )}
    </>
  );
}

export function PageThumbnailGrid({
  items,
  selectedIds,
  rotation,
  onToggleItem,
  onPreviewItem,
}: {
  items: PreviewItem[];
  selectedIds: Set<string>;
  rotation: string;
  onToggleItem: (item: PreviewItem) => void;
  onPreviewItem: (item: PreviewItem) => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: "0.9rem" }}>
      {items.map(item => {
        const selected = selectedIds.has(item.id);
        const rotateDeg = item.kind === "pdf" ? Number(rotation || 0) : 0;
        return (
          <motion.div
            key={item.id}
            role="button"
            tabIndex={0}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onToggleItem(item)}
            onDoubleClick={() => onPreviewItem(item)}
            onKeyDown={event => {
              if (event.key === "Enter" || event.key === " ") onToggleItem(item);
            }}
            style={{
              position: "relative",
              border: selected ? "2px solid #3b82f6" : "1px solid rgba(148,163,184,0.18)",
              background: selected ? "rgba(37,99,235,0.12)" : "var(--dn-bg-card)",
              borderRadius: "4px",
              padding: "0.45rem",
              cursor: "pointer",
              boxShadow: selected ? "0 0 28px rgba(59,130,246,0.28)" : "var(--dn-shadow)",
              color: "var(--dn-t1)",
              fontFamily: "'Inter', sans-serif",
              minHeight: 198,
            }}
          >
            <button
              type="button"
              title="Open preview"
              aria-label={`Open ${item.label} preview`}
              onClick={event => {
                event.stopPropagation();
                onPreviewItem(item);
              }}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 2,
                width: 30,
                height: 30,
                border: "1px solid rgba(96,165,250,0.32)",
                borderRadius: "4px",
                background: "rgba(2,6,23,0.72)",
                color: "#bfdbfe",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
              }}
            >
              <Eye size={14} />
            </button>

            <PreviewSurface item={item} rotation={rotateDeg} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem", marginTop: "0.45rem", color: selected ? "#93c5fd" : "var(--dn-t3)", fontSize: "0.74rem", fontWeight: 750 }}>
              {selected && <Check size={12} />} {item.label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function ToolSettingsPanel({
  tool,
  settings,
  selectedItems,
  allItems,
  files,
  onChange,
}: {
  tool: Tool;
  settings: ToolSettings;
  selectedItems: PreviewItem[];
  allItems: PreviewItem[];
  files: WorkflowFile[];
  onChange: (patch: Partial<ToolSettings>) => void;
}) {
  const remainingItems = tool.id === "delete-pages" ? allItems.filter(item => !selectedItems.some(selected => selected.id === item.id)) : selectedItems;

  return (
    <section style={{ ...panelStyle, borderRadius: "4px", padding: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.9rem" }}>
        <Settings size={17} color="var(--dn-t3)" />
        <div>
          <div style={{ color: "var(--dn-t1)", fontWeight: 850, fontSize: "0.96rem" }}>Tool Settings</div>
          <div style={{ color: "var(--dn-t4)", fontSize: "0.72rem" }}>{selectedItems.length} selected item(s)</div>
        </div>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        {tool.id === "split-pdf" && (
          <>
            <Segmented label="Split mode" value={settings.splitMode} options={[
              ["every", "Every page"],
              ["selected", "Selected pages"],
              ["range", "Page range"],
              ["groups", "Custom groups"],
            ]} onChange={value => onChange({ splitMode: value })} />
            {settings.splitMode === "range" && <TextInput label="Page range" value={settings.pageRange} placeholder="1-3, 5, 8-10" onChange={value => onChange({ pageRange: value })} />}
            {settings.splitMode === "groups" && <TextInput label="Custom groups" value={settings.customGroups} placeholder="1-2, 3-5, 9" onChange={value => onChange({ customGroups: value })} />}
            <PreviewStrip title="Split preview" items={settings.splitMode === "every" ? allItems : selectedItems} empty="Select pages or enter a range to preview split groups." />
          </>
        )}

        {tool.id === "rotate-pdf" && (
          <>
            <Segmented label="Rotation" value={settings.rotation} options={[["270", "90 left"], ["90", "90 right"], ["180", "180"]]} onChange={value => onChange({ rotation: value })} />
            <Segmented label="Apply to" value={settings.rotationScope} options={[["selected", "Selected"], ["all", "All pages"]]} onChange={value => onChange({ rotationScope: value })} />
            <PreviewStrip title="Rotated live preview" items={settings.rotationScope === "all" ? allItems : selectedItems} empty="Select pages to preview rotation." />
          </>
        )}

        {tool.id === "delete-pages" && (
          <>
            <div style={{ padding: "0.85rem", borderRadius: "4px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", fontSize: "0.82rem", fontWeight: 700 }}>
              Warning: selected pages will be removed.
            </div>
            <PreviewStrip title="Remaining pages preview" items={remainingItems} empty="Select pages to delete and the remaining document appears here." />
          </>
        )}

        {(tool.id === "extract-pages" || tool.id === "reorder-pages" || tool.id === "insert-pages") && (
          <PreviewStrip title="Output order preview" items={selectedItems} empty="Select pages to build the final output order." />
        )}

        {tool.id === "compress-pdf" && (
          <>
            <Segmented label="Compression" value={settings.compression} options={[
              ["low", "Low / high quality"],
              ["medium", "Medium"],
              ["high", "High / smaller file"],
            ]} onChange={value => onChange({ compression: value })} />
            <SizeEstimate files={files} level={settings.compression} />
          </>
        )}

        {tool.id === "pdf-to-word" && (
          <>
            <Segmented label="Conversion" value={settings.conversionMode} options={[["all", "All pages"], ["selected", "Selected pages"]]} onChange={value => onChange({ conversionMode: value })} />
            <ToggleRow label="Preserve layout" checked={settings.preserveLayout} onChange={value => onChange({ preserveLayout: value })} />
            <ToggleRow label="Extract text only" checked={!settings.preserveLayout} onChange={value => onChange({ preserveLayout: !value })} />
          </>
        )}

        {tool.id === "word-to-pdf" && (
          <>
            <Segmented label="Page size" value={settings.pageSize} options={[["A4", "A4"], ["Letter", "Letter"]]} onChange={value => onChange({ pageSize: value })} />
            <Segmented label="Orientation" value={settings.orientation} options={[["portrait", "Portrait"], ["landscape", "Landscape"]]} onChange={value => onChange({ orientation: value })} />
            <Segmented label="Margins" value={settings.margins} options={[["compact", "Compact"], ["normal", "Normal"], ["wide", "Wide"]]} onChange={value => onChange({ margins: value })} />
          </>
        )}

        {tool.id === "pdf-to-excel" && (
          <>
            <Segmented label="Extract" value={settings.extractMode} options={[["tables", "Tables only"], ["text", "All text"], ["page-sheets", "One sheet/page"]]} onChange={value => onChange({ extractMode: value })} />
            <PreviewStrip title="Pages for extraction" items={selectedItems} empty="Select pages to extract into Excel." />
          </>
        )}

        {tool.id === "excel-to-pdf" && (
          <>
            <Segmented label="Layout" value={settings.fitMode} options={[["fit-page", "Fit to page"], ["actual", "Actual size"]]} onChange={value => onChange({ fitMode: value })} />
            <Segmented label="Orientation" value={settings.orientation} options={[["portrait", "Portrait"], ["landscape", "Landscape"]]} onChange={value => onChange({ orientation: value })} />
            <Segmented label="Page size" value={settings.pageSize} options={[["A4", "A4"], ["Letter", "Letter"]]} onChange={value => onChange({ pageSize: value })} />
          </>
        )}

        {tool.id === "pdf-to-powerpoint" && (
          <PreviewStrip title="Slide preview" items={selectedItems} empty="Select PDF pages to convert into slides." />
        )}

        {tool.id === "powerpoint-to-pdf" && (
          <PreviewStrip title="Selected slides" items={selectedItems} empty="Select slides to convert into PDF pages." />
        )}

        {(tool.id === "pdf-to-jpg" || tool.id === "pdf-to-images") && (
          <>
            <Segmented label="Format" value={settings.imageFormat} options={[["jpg", "JPG"], ["png", "PNG"], ["webp", "WEBP"]]} onChange={value => onChange({ imageFormat: value })} />
            <RangeInput label="Image quality" value={settings.imageQuality} min={40} max={100} onChange={value => onChange({ imageQuality: value })} />
            <PreviewStrip title="Pages to export" items={selectedItems} empty="Select pages to export as images." />
          </>
        )}

        {(tool.id === "image-to-pdf" || tool.id === "jpg-to-pdf" || tool.id === "png-to-pdf") && (
          <>
            <Segmented label="Page size" value={settings.pageSize} options={[["A4", "A4"], ["Letter", "Letter"], ["image", "Fit image"]]} onChange={value => onChange({ pageSize: value })} />
            <Segmented label="Orientation" value={settings.orientation} options={[["portrait", "Portrait"], ["landscape", "Landscape"]]} onChange={value => onChange({ orientation: value })} />
            <PreviewStrip title="Image order" items={selectedItems} empty="Select and reorder images for the PDF." />
          </>
        )}

        {(tool.id === "pdf-ocr" || tool.id === "image-ocr") && (
          <>
            <label style={{ display: "grid", gap: "0.4rem", color: "var(--dn-t3)", fontSize: "0.78rem", fontWeight: 750 }}>
              OCR language
              <select value={settings.ocrLang} onChange={event => onChange({ ocrLang: event.target.value })} style={inputStyle}>
                {ocrLanguages.map(language => <option key={language.value} value={language.value}>{language.label}</option>)}
              </select>
            </label>
            <Segmented label="Output" value={settings.ocrOutput} options={[["txt", "TXT"], ["docx", "DOCX"], ["searchable", "Searchable PDF"]]} onChange={value => onChange({ ocrOutput: value })} />
          </>
        )}

        {tool.hasPassword && (
          <TextInput label={tool.id.includes("unlock") || tool.id.includes("decrypt") || tool.id === "remove-password" ? "Current password" : "New password"} value={settings.password} placeholder="Enter password" password onChange={value => onChange({ password: value })} />
        )}

        {tool.category === "edit" && (
          <>
            <Segmented label="Edit tool" value={settings.editTool} options={[
              ["text", "Add text"],
              ["image", "Add image"],
              ["highlight", "Highlight"],
              ["draw", "Draw"],
              ["crop", "Crop"],
              ["redact", "Redact"],
              ["watermark", "Watermark"],
              ["numbers", "Page numbers"],
            ]} onChange={value => onChange({ editTool: value })} />
            <TextInput label="Text / watermark" value={settings.watermarkText} placeholder="Enter text" onChange={value => onChange({ watermarkText: value })} />
            <PreviewStrip title="Live edit preview" items={selectedItems.length ? selectedItems : allItems.slice(0, 3)} empty="Upload a PDF to preview edits." />
          </>
        )}
      </div>
    </section>
  );
}

export function ProcessingModal({ open, progress, label, color }: { open: boolean; progress: number; label: string; color: string }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(2,6,23,0.64)", backdropFilter: "blur(18px)", display: "grid", placeItems: "center", padding: "1.5rem" }}>
          <style>{`
            @keyframes processingProgressShimmer {
              from { background-position: 200% 0; }
              to { background-position: -200% 0; }
            }
          `}</style>
          <motion.div initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 10 }}
            style={{ width: "min(92vw, 430px)", minHeight: 248, borderRadius: "4px", background: "var(--dn-bg-card)", border: "1px solid var(--dn-border)", boxShadow: "0 28px 90px rgba(0,0,0,0.42)", padding: "1.5rem", display: "grid", placeItems: "center", textAlign: "center" }}>
            <div style={{ width: "100%" }}>
              <div style={{ width: 72, height: 72, margin: "0 auto 1rem", borderRadius: "50%", display: "grid", placeItems: "center", background: `${color}12`, position: "relative" }}>
                <div style={{ position: "absolute", inset: 8, borderRadius: "50%", border: "3px solid rgba(148,163,184,0.18)", borderTopColor: color, animation: "spin 0.82s linear infinite" }} />
                <Loader2 size={24} color={color} style={{ animation: "spin 1.4s linear infinite" }} />
              </div>
              <div style={{ color: "var(--dn-t1)", fontWeight: 900, fontSize: "1.04rem" }}>Processing your file...</div>
              <div style={{ color: "var(--dn-t4)", fontSize: "0.82rem", marginTop: "0.35rem", minHeight: 20 }}>{label}</div>
              <div style={{ marginTop: "1.2rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ flex: 1, height: 8, borderRadius: 999, overflow: "hidden", background: "rgba(15,23,42,0.54)", border: "1px solid rgba(96,165,250,0.24)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)" }}>
                  <motion.div
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    style={{ height: "100%", borderRadius: 999, background: `linear-gradient(90deg,${color},#60a5fa,#93c5fd)`, backgroundSize: "200% 100%", animation: "processingProgressShimmer 1.8s linear infinite", boxShadow: `0 0 18px ${color}55`, willChange: "width, background-position" }}
                  />
                </div>
                <div style={{ minWidth: 42, color, fontWeight: 900, fontSize: "0.86rem", textAlign: "right" }}>{progress}%</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function OutputPreviewPanel({ tool, output, onDownload }: { tool: Tool; output: ProcessedOutput; onDownload: () => void }) {
  const [activeItem, setActiveItem] = useState<OutputPreviewItem | null>(output.items[0] || null);

  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: "0.25rem", borderRadius: "4px", border: "1px solid rgba(34,197,94,0.24)", background: "var(--dn-bg-card)", padding: "1rem", boxShadow: "var(--dn-shadow)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <CheckCircle2 size={22} color="#22c55e" />
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ color: "var(--dn-t1)", fontWeight: 850 }}>Final output preview</div>
          <div style={{ color: "var(--dn-t4)", fontSize: "0.78rem" }}>Preview generated. Download is now available.</div>
        </div>
        <DownloadResultCard output={output} label={`Download ${tool.outputFormat || "Result"}`} onDownload={onDownload} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: output.items.length > 1 ? "220px minmax(0,1fr)" : "1fr", gap: "1rem" }}>
        {output.items.length > 1 && (
          <div style={{ display: "grid", gap: "0.55rem", maxHeight: 520, overflow: "auto" }}>
            {output.items.map(item => (
              <button key={item.id} type="button" onClick={() => setActiveItem(item)}
                style={{ display: "flex", alignItems: "center", gap: "0.6rem", textAlign: "left", borderRadius: "4px", border: activeItem?.id === item.id ? "1px solid #60a5fa" : "1px solid var(--dn-border)", background: activeItem?.id === item.id ? "rgba(37,99,235,0.12)" : "var(--dn-bg-subtle)", color: "var(--dn-t2)", padding: "0.55rem", cursor: "pointer" }}>
                <FileKindIcon kind={item.kind === "archive" ? "generic" : item.kind} compact />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                  <div style={{ color: "var(--dn-t4)", fontSize: "0.68rem" }}>{formatBytes(item.size)}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div style={{ minHeight: 420, borderRadius: "4px", overflow: "hidden", border: "1px solid var(--dn-border)", background: "var(--dn-bg-subtle)" }}>
          {activeItem ? <OutputPreviewSurface item={activeItem} /> : <EmptyPanel text="Output preview is ready." />}
        </div>
      </div>

      {output.summary.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", marginTop: "1rem" }}>
          {output.summary.map(item => (
            <div key={item.label} style={{ minWidth: 150, borderRadius: "4px", border: "1px solid var(--dn-border)", background: "var(--dn-bg-subtle)", padding: "0.75rem" }}>
              <div style={{ color: "var(--dn-t4)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</div>
              <div style={{ color: "var(--dn-t1)", fontSize: "0.9rem", fontWeight: 850, marginTop: "0.2rem" }}>{item.value}</div>
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}

export function DownloadResultCard({ output, label, onDownload }: { output: ProcessedOutput; label: string; onDownload: () => void }) {
  return (
    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} type="button" onClick={onDownload}
      style={{ border: "none", borderRadius: 999, background: "linear-gradient(135deg,#16a34a,#22c55e)", color: "#fff", padding: "0.72rem 1rem", fontWeight: 850, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
      <Download size={16} /> {label} ({formatBytes(output.downloadBlob.size)})
    </motion.button>
  );
}

function QueuePanel({
  title,
  items,
  draggingId,
  onDragStart,
  onDropOnItem,
  onRemove,
}: {
  title: string;
  items: PreviewItem[];
  draggingId: string | null;
  onDragStart: (id: string) => void;
  onDropOnItem: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <section style={{ ...panelStyle, borderRadius: "4px", padding: "1rem" }}>
      <div style={{ color: "var(--dn-t1)", fontWeight: 850, marginBottom: "0.75rem" }}>{title}</div>
      <div style={{ display: "grid", gap: "0.55rem" }}>
        {items.map((item, index) => (
          <motion.div key={item.id} layout draggable onDragStart={() => onDragStart(item.id)} onDragOver={event => event.preventDefault()} onDrop={() => onDropOnItem(item.id)}
            style={{ display: "grid", gridTemplateColumns: "18px 44px minmax(0,1fr) 28px", alignItems: "center", gap: "0.55rem", padding: "0.45rem", borderRadius: "4px", border: draggingId === item.id ? "1px solid #60a5fa" : "1px solid var(--dn-border)", background: "var(--dn-bg-subtle)", cursor: "grab" }}>
            <GripVertical size={14} color="var(--dn-t4)" />
            <MiniPreview item={item} />
            <div style={{ minWidth: 0 }}>
              <div style={{ color: "var(--dn-t1)", fontWeight: 750, fontSize: "0.78rem" }}>#{index + 1} - {item.label}</div>
              <div style={{ color: "var(--dn-t4)", fontSize: "0.68rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.fileName}</div>
            </div>
            <IconButton label="Remove item" onClick={() => onRemove(item.id)} danger>
              <X size={13} />
            </IconButton>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function WorkflowSteps({ status, hasFiles, hasSelection, hasOutput }: { status: WorkflowStatus; hasFiles: boolean; hasSelection: boolean; hasOutput: boolean }) {
  const steps = [
    ["Upload", hasFiles],
    ["Input preview", hasFiles],
    ["Selection/settings", hasSelection],
    ["Process", status === "processing" || status === "done"],
    ["Output preview", hasOutput],
    ["Download", hasOutput],
  ] as const;
  return (
    <div>
      <div style={{ color: "var(--dn-t1)", fontWeight: 850, marginBottom: "0.85rem" }}>Workflow</div>
      <div style={{ display: "grid", gap: "0.55rem" }}>
        {steps.map(([label, done], index) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: done ? "var(--dn-t1)" : "var(--dn-t4)", fontSize: "0.82rem" }}>
            <div style={{ width: 24, height: 24, borderRadius: "4px", display: "grid", placeItems: "center", background: done ? "rgba(34,197,94,0.16)" : "var(--dn-bg-subtle)", color: done ? "#4ade80" : "var(--dn-t4)", border: "1px solid var(--dn-border)" }}>
              {done ? <Check size={13} /> : index + 1}
            </div>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewSurface({ item, rotation = 0 }: { item: PreviewItem; rotation?: number }) {
  if (item.thumbnail) {
    return (
      <div style={{ width: "100%", aspectRatio: "0.72", borderRadius: "4px", background: "#fff", display: "grid", placeItems: "center", overflow: "hidden" }}>
        <img src={item.thumbnail} alt={item.label} style={{ width: "100%", height: "100%", objectFit: "contain", transform: `rotate(${rotation}deg)`, transition: "transform 0.2s ease" }} />
      </div>
    );
  }

  if (item.kind === "pdf") {
    return (
      <div style={{ width: "100%", aspectRatio: "0.72", borderRadius: "4px", background: "linear-gradient(90deg,#ffffff,#f1f5f9,#ffffff)", border: "1px solid rgba(148,163,184,0.24)", display: "grid", placeItems: "center", color: "#94a3b8", fontWeight: 850, fontSize: "0.74rem" }}>
        Generating...
      </div>
    );
  }

  return (
    <div style={{ width: "100%", aspectRatio: "0.72", borderRadius: "4px", background: "linear-gradient(180deg,rgba(15,23,42,0.94),rgba(30,41,59,0.88))", border: "1px solid rgba(148,163,184,0.18)", display: "grid", placeItems: "center", padding: "0.8rem", textAlign: "center" }}>
      <div>
        <FileKindIcon kind={item.kind} />
        <div style={{ color: "var(--dn-t2)", fontWeight: 850, fontSize: "0.78rem", marginTop: "0.6rem" }}>{item.label}</div>
        {item.text && <div style={{ color: "var(--dn-t4)", fontSize: "0.68rem", marginTop: "0.35rem", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.text}</div>}
      </div>
    </div>
  );
}

function OutputPreviewSurface({ item }: { item: OutputPreviewItem }) {
  if (item.kind === "pdf" && item.url) {
    return (
      <object data={item.url} type="application/pdf" width="100%" height="520">
        <EmptyPanel text="PDF preview is ready. Use the download button to save it." />
      </object>
    );
  }
  if (item.kind === "image" && item.url) {
    return <img src={item.url} alt={item.name} style={{ display: "block", width: "100%", height: 520, objectFit: "contain", background: "#fff" }} />;
  }
  if (item.kind === "text") {
    return (
      <div style={{ height: 520, overflow: "auto", padding: "1rem", color: "var(--dn-t2)", whiteSpace: "pre-wrap", fontFamily: "Consolas, monospace", fontSize: "0.82rem", lineHeight: 1.6 }}>
        {item.text || "No text extracted."}
      </div>
    );
  }
  return (
    <div style={{ height: 520, display: "grid", placeItems: "center", textAlign: "center", padding: "1rem" }}>
      <div>
        <FileKindIcon kind={item.kind === "archive" ? "generic" : item.kind} />
        <div style={{ color: "var(--dn-t1)", fontWeight: 850, marginTop: "0.75rem" }}>{item.name}</div>
        <div style={{ color: "var(--dn-t4)", fontSize: "0.78rem", marginTop: "0.3rem" }}>{formatBytes(item.size)}</div>
      </div>
    </div>
  );
}

function PreviewModal({
  item,
  zoom,
  fullscreen,
  onClose,
  onZoomIn,
  onZoomOut,
  onToggleFullscreen,
}: {
  item: PreviewItem;
  zoom: number;
  fullscreen: boolean;
  onClose: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleFullscreen: () => void;
}) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(2,6,23,0.72)", backdropFilter: "blur(18px)", display: "grid", placeItems: "center", padding: fullscreen ? 0 : "2rem" }}>
      <div onClick={event => event.stopPropagation()} style={{ width: fullscreen ? "100vw" : "min(92vw, 900px)", height: fullscreen ? "100vh" : "auto", maxHeight: fullscreen ? "100vh" : "92vh", borderRadius: fullscreen ? 0 : "4px", border: "1px solid var(--dn-border)", background: "var(--dn-bg-card)", boxShadow: "var(--dn-shadow)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.85rem 1rem", borderBottom: "1px solid var(--dn-border)" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ color: "var(--dn-t1)", fontWeight: 850, fontSize: "0.92rem" }}>{item.label}</div>
            <div style={{ color: "var(--dn-t4)", fontSize: "0.74rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.fileName}</div>
          </div>
          <IconButton label="Zoom out" onClick={onZoomOut}><ZoomOut size={15} /></IconButton>
          <span style={{ color: "var(--dn-t3)", fontSize: "0.78rem", minWidth: 46, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
          <IconButton label="Zoom in" onClick={onZoomIn}><ZoomIn size={15} /></IconButton>
          <IconButton label="Fullscreen preview" onClick={onToggleFullscreen}>{fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}</IconButton>
          <IconButton label="Close preview" onClick={onClose}><X size={15} /></IconButton>
        </div>
        <div style={{ height: fullscreen ? "calc(100vh - 66px)" : "min(78vh, 740px)", overflow: "auto", background: "var(--dn-bg-subtle)", padding: "1rem", display: "grid", placeItems: "start center" }}>
          <div style={{ width: `${Math.round(100 * zoom)}%`, maxWidth: item.thumbnail ? "none" : 760 }}>
            <PreviewSurface item={item} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewStrip({ title, items, empty }: { title: string; items: PreviewItem[]; empty: string }) {
  return (
    <div>
      <div style={{ color: "var(--dn-t3)", fontSize: "0.78rem", fontWeight: 800, marginBottom: "0.55rem" }}>{title}</div>
      {items.length === 0 ? (
        <div style={{ border: "1px dashed var(--dn-border2)", borderRadius: "4px", color: "var(--dn-t4)", fontSize: "0.78rem", padding: "0.85rem", background: "var(--dn-bg-subtle)" }}>{empty}</div>
      ) : (
        <div style={{ display: "flex", gap: "0.55rem", overflowX: "auto", paddingBottom: "0.2rem" }}>
          {items.slice(0, 12).map(item => (
            <div key={item.id} style={{ width: 74, flex: "0 0 auto" }}>
              <MiniPreview item={item} />
              <div style={{ color: "var(--dn-t4)", fontSize: "0.66rem", textAlign: "center", marginTop: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</div>
            </div>
          ))}
          {items.length > 12 && <div style={{ color: "var(--dn-t4)", display: "grid", placeItems: "center", minWidth: 74, fontSize: "0.78rem" }}>+{items.length - 12}</div>}
        </div>
      )}
    </div>
  );
}

function MiniPreview({ item }: { item: PreviewItem }) {
  if (item.thumbnail) {
    return <img src={item.thumbnail} alt="" style={{ width: 44, height: 56, objectFit: "cover", borderRadius: "4px", background: "#fff", border: "1px solid var(--dn-border)" }} />;
  }
  return (
    <div style={{ width: 44, height: 56, borderRadius: "4px", background: "var(--dn-bg-card)", border: "1px solid var(--dn-border)", display: "grid", placeItems: "center" }}>
      <FileKindIcon kind={item.kind} compact />
    </div>
  );
}

function PreviewSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: "0.9rem" }}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} style={{ height: 198, borderRadius: "4px", background: "linear-gradient(90deg,var(--dn-bg-subtle),rgba(148,163,184,0.12),var(--dn-bg-subtle))", border: "1px solid var(--dn-border)", opacity: 0.86 }} />
      ))}
    </div>
  );
}

function FileKindIcon({ kind, compact }: { kind: PreviewKind; compact?: boolean }) {
  const size = compact ? 15 : 18;
  const style: React.CSSProperties = {
    width: compact ? 30 : 38,
    height: compact ? 30 : 38,
    borderRadius: compact ? "4px" : "4px",
    background: "rgba(59,130,246,0.14)",
    display: "inline-grid",
    placeItems: "center",
    color: "#60a5fa",
  };
  const Icon = kind === "image" ? ImageIcon : kind === "spreadsheet" ? FileSpreadsheet : kind === "presentation" ? Layers : kind === "generic" ? FileArchive : FileText;
  return <div style={style}><Icon size={size} /></div>;
}

function ToolbarButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={event => { event.stopPropagation(); onClick(); }} style={{ border: "1px solid var(--dn-badge-bd)", background: "var(--dn-badge-bg)", color: "var(--dn-badge-text)", borderRadius: 999, padding: "0.42rem 0.72rem", fontSize: "0.74rem", fontWeight: 750, cursor: "pointer", fontFamily: "'Inter', sans-serif", boxShadow: "0 0 18px rgba(37,99,235,0.12)" }}>
      {children}
    </button>
  );
}

function IconButton({ children, label, onClick, danger }: { children: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={event => { event.stopPropagation(); onClick(); }} style={{ width: 30, height: 30, border: "none", borderRadius: "4px", display: "grid", placeItems: "center", background: danger ? "rgba(239,68,68,0.12)" : "rgba(148,163,184,0.12)", color: danger ? "#f87171" : "var(--dn-t3)", cursor: "pointer" }}>
      {children}
    </button>
  );
}

function Segmented({ label, value, options, onChange }: { label: string; value: string; options: Array<[string, string]>; onChange: (value: string) => void }) {
  return (
    <div>
      <div style={{ color: "var(--dn-t3)", fontSize: "0.78rem", fontWeight: 800, marginBottom: "0.5rem" }}>{label}</div>
      <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
        {options.map(([optionValue, optionLabel]) => (
          <button key={optionValue} type="button" onClick={() => onChange(optionValue)} style={{ border: value === optionValue ? "1px solid #60a5fa" : "1px solid var(--dn-border)", background: value === optionValue ? "rgba(37,99,235,0.16)" : "var(--dn-bg-subtle)", color: value === optionValue ? "#bfdbfe" : "var(--dn-t3)", borderRadius: "4px", padding: "0.5rem 0.7rem", fontSize: "0.76rem", fontWeight: 800, cursor: "pointer" }}>
            {optionLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

function TextInput({ label, value, placeholder, password, onChange }: { label: string; value: string; placeholder: string; password?: boolean; onChange: (value: string) => void }) {
  return (
    <label style={{ display: "grid", gap: "0.4rem", color: "var(--dn-t3)", fontSize: "0.78rem", fontWeight: 800 }}>
      {label}
      <input type={password ? "password" : "text"} value={value} placeholder={placeholder} onChange={event => onChange(event.target.value)} style={inputStyle} />
    </label>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", color: "var(--dn-t2)", fontSize: "0.82rem", fontWeight: 800 }}>
      {label}
      <input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} />
    </label>
  );
}

function RangeInput({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <label style={{ display: "grid", gap: "0.45rem", color: "var(--dn-t3)", fontSize: "0.78rem", fontWeight: 800 }}>
      <span>{label}: {value}%</span>
      <input type="range" min={min} max={max} value={value} onChange={event => onChange(Number(event.target.value))} />
    </label>
  );
}

function SizeEstimate({ files, level }: { files: WorkflowFile[]; level: string }) {
  const source = files.reduce((sum, file) => sum + file.size, 0);
  const ratio = level === "high" ? 0.45 : level === "medium" ? 0.68 : 0.82;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "0.55rem" }}>
      <Stat label="Original" value={formatBytes(source)} />
      <Stat label="Estimated" value={formatBytes(source * ratio)} />
      <Stat label="Reduced" value={`${Math.max(0, Math.round((1 - ratio) * 100))}%`} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderRadius: "4px", border: "1px solid var(--dn-border)", background: "var(--dn-bg-subtle)", padding: "0.7rem" }}>
      <div style={{ color: "var(--dn-t4)", fontSize: "0.66rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ color: "var(--dn-t1)", fontSize: "0.86rem", fontWeight: 850, marginTop: "0.18rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
    </div>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return <div style={{ height: "100%", display: "grid", placeItems: "center", color: "var(--dn-t4)", textAlign: "center", padding: "1rem" }}>{text}</div>;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "0.75rem 0.85rem",
  borderRadius: "4px",
  background: "var(--dn-bg-input)",
  border: "1px solid var(--dn-border)",
  color: "var(--dn-t1)",
  outline: "none",
  fontFamily: "'Inter', sans-serif",
  fontSize: "0.85rem",
};

async function buildPreviewItems(source: WorkflowFile, tool: Tool): Promise<PreviewItem[]> {
  if (source.kind === "pdf") {
    const result = await pdfApi.previewPDF(source.file);
    return result.images.map(image => ({
      id: `${source.id}-${image.page}`,
      fileId: source.id,
      fileName: source.name,
      index: image.page - 1,
      label: `Page ${image.page}`,
      kind: "pdf",
      thumbnail: `data:image/jpeg;base64,${image.image}`,
    }));
  }

  if (source.kind === "image") {
    return [{
      id: `${source.id}-image`,
      fileId: source.id,
      fileName: source.name,
      index: 0,
      label: "Image 1",
      kind: "image",
      thumbnail: source.objectUrl,
    }];
  }

  try {
    const response = source.kind === "document"
      ? await pdfApi.previewDocument(source.file)
      : source.kind === "spreadsheet"
        ? await pdfApi.previewSpreadsheet(source.file)
        : source.kind === "presentation"
          ? await pdfApi.previewPresentation(source.file)
          : await pdfApi.previewImage(source.file);

    return response.items.map((item, index) => ({
      id: `${source.id}-${index}`,
      fileId: source.id,
      fileName: source.name,
      index,
      label: item.label || defaultItemLabel(source.kind, index),
      kind: source.kind,
      thumbnail: item.thumbnail ? `data:image/jpeg;base64,${item.thumbnail}` : undefined,
      text: item.text,
      rows: item.rows,
    }));
  } catch {
    return fallbackPreviewItems(source, tool);
  }
}

async function processTool(
  tool: Tool,
  files: WorkflowFile[],
  selectedItems: PreviewItem[],
  settings: ToolSettings,
  setProcessingLabel: (label: string) => void,
): Promise<ProcessedOutput> {
  const firstFile = files[0]?.file;
  if (!firstFile) throw new Error("Upload a file first.");

  const selectedRange = pageRangeFromItems(selectedItems);
  const allRange = pageRangeFromItems(files.flatMap(file => file.items));
  const rangeForTool = settings.conversionMode === "all" ? allRange : selectedRange;

  setProcessingLabel("Sending file to backend");

  switch (tool.id) {
    case "split-pdf": {
      const range = settings.splitMode === "every" ? "" : settings.splitMode === "range" ? settings.pageRange : selectedRange;
      const result = await pdfApi.splitPDF(firstFile, range);
      const items = result.pages.map(page => ({
        name: `${stripExtension(firstFile.name)}-page-${page.page}.pdf`,
        blob: pdfApi.base64ToBlob(page.pdf, "application/pdf"),
      }));
      const outputItems = items.map((item, index) => makeOutputItem(item.blob, item.name, "pdf", index));
      const zip = await createZipBlob(items);
      return {
        items: outputItems,
        downloadBlob: zip,
        downloadName: `${stripExtension(firstFile.name)}-split.zip`,
        summary: [{ label: "Output files", value: String(items.length) }],
      };
    }
    case "rotate-pdf": {
      const pageRange = settings.rotationScope === "all" ? "" : selectedRange;
      const blob = await pdfApi.rotatePDF(firstFile, settings.rotation, pageRange);
      return makeSingleOutput(blob, `${stripExtension(firstFile.name)}-rotated.pdf`, "pdf", [
        { label: "Rotation", value: `${settings.rotation} deg` },
        { label: "Pages", value: pageRange || "All" },
      ]);
    }
    case "delete-pages": {
      const blob = await pdfApi.deletePages(firstFile, selectedRange);
      return makeSingleOutput(blob, `${stripExtension(firstFile.name)}-pages-deleted.pdf`, "pdf", [
        { label: "Removed pages", value: selectedRange },
      ]);
    }
    case "extract-pages":
    case "reorder-pages":
    case "insert-pages": {
      const blob = await pdfApi.mergeSelectedPDFs(files.map(file => ({ id: file.id, file: file.file })), selectedItems.map((item, index) => ({
        fileId: item.fileId,
        fileName: item.fileName,
        pageIndex: item.index,
        pageNumber: item.index + 1,
        order: index + 1,
      })));
      return makeSingleOutput(blob, `${stripExtension(firstFile.name)}-selected-pages.pdf`, "pdf", [
        { label: "Selected pages", value: String(selectedItems.length) },
      ]);
    }
    case "compress-pdf": {
      const blob = await pdfApi.compressPDF(firstFile, settings.compression);
      return makeSingleOutput(blob, `${stripExtension(firstFile.name)}-compressed.pdf`, "pdf", [
        { label: "Original size", value: formatBytes(firstFile.size) },
        { label: "New size", value: formatBytes(blob?.size || 0) },
        { label: "Reduced", value: reductionText(firstFile.size, blob?.size || 0) },
      ]);
    }
    case "pdf-to-word": {
      const blob = await pdfApi.pdfToWord(firstFile, rangeForTool, settings.preserveLayout);
      return makeSingleOutput(blob, `${stripExtension(firstFile.name)}.docx`, "document", [
        { label: "Pages", value: rangeForTool || "All" },
        { label: "Mode", value: settings.preserveLayout ? "Preserve layout" : "Text only" },
      ]);
    }
    case "word-to-pdf": {
      const blob = await pdfApi.wordToPDF(firstFile, pickSettings(settings, ["pageSize", "orientation", "margins"]));
      return makeSingleOutput(blob, `${stripExtension(firstFile.name)}.pdf`, "pdf", [
        { label: "Page size", value: settings.pageSize },
        { label: "Orientation", value: settings.orientation },
      ]);
    }
    case "pdf-to-excel": {
      const blob = await pdfApi.pdfToExcel(firstFile, selectedRange, settings.extractMode);
      return makeSingleOutput(blob, `${stripExtension(firstFile.name)}.xlsx`, "spreadsheet", [
        { label: "Pages", value: selectedRange || "All" },
        { label: "Mode", value: settings.extractMode },
      ]);
    }
    case "excel-to-pdf": {
      const blob = await pdfApi.excelToPDF(firstFile, pickSettings(settings, ["pageSize", "orientation", "fitMode"]));
      return makeSingleOutput(blob, `${stripExtension(firstFile.name)}.pdf`, "pdf", [
        { label: "Layout", value: settings.fitMode },
        { label: "Orientation", value: settings.orientation },
      ]);
    }
    case "pdf-to-powerpoint": {
      const blob = await pdfApi.pdfToPowerPoint(firstFile, selectedRange);
      return makeSingleOutput(blob, `${stripExtension(firstFile.name)}.pptx`, "presentation", [
        { label: "Slides", value: String(selectedItems.length || files[0].items.length) },
      ]);
    }
    case "powerpoint-to-pdf": {
      const blob = await pdfApi.powerPointToPDF(firstFile, pageRangeFromItems(selectedItems));
      return makeSingleOutput(blob, `${stripExtension(firstFile.name)}.pdf`, "pdf", [
        { label: "Slides", value: String(selectedItems.length || files[0].items.length) },
      ]);
    }
    case "pdf-to-jpg":
    case "pdf-to-images": {
      const result = await pdfApi.pdfToJpg(firstFile, {
        pageRange: selectedRange,
        format: settings.imageFormat,
        quality: String(settings.imageQuality),
      });
      const extension = settings.imageFormat === "jpg" ? "jpg" : settings.imageFormat;
      const mime = extension === "png" ? "image/png" : extension === "webp" ? "image/webp" : "image/jpeg";
      const items = result.images.map(image => ({
        name: `${stripExtension(firstFile.name)}-page-${image.page}.${extension}`,
        blob: pdfApi.base64ToBlob(image.image, mime),
      }));
      const outputItems = items.map((item, index) => makeOutputItem(item.blob, item.name, "image", index));
      const zip = await createZipBlob(items);
      return {
        items: outputItems,
        downloadBlob: zip,
        downloadName: `${stripExtension(firstFile.name)}-images.zip`,
        summary: [{ label: "Images", value: String(items.length) }, { label: "Format", value: extension.toUpperCase() }],
      };
    }
    case "jpg-to-pdf":
    case "png-to-pdf":
    case "image-to-pdf": {
      const selectedFileIds = new Set(selectedItems.map(item => item.fileId));
      const imageFiles = files.filter(file => selectedFileIds.has(file.id)).map(file => file.file);
      const blob = await pdfApi.jpgToPDF(imageFiles.length ? imageFiles : files.map(file => file.file), pickSettings(settings, ["pageSize", "orientation", "margins"]));
      return makeSingleOutput(blob, "images.pdf", "pdf", [
        { label: "Images", value: String(imageFiles.length || files.length) },
        { label: "Page Size", value: settings.pageSize },
        { label: "Orientation", value: settings.orientation },
        { label: "Margins", value: settings.margins },
      ]);
    }
    case "pdf-ocr":
    case "image-ocr": {
      const result = await pdfApi.ocr(firstFile, settings.ocrLang, selectedRange, settings.ocrOutput);
      const blob = new Blob([result.text || ""], { type: "text/plain" });
      const item = makeOutputItem(blob, `${stripExtension(firstFile.name)}-ocr.txt`, "text", 0, result.text || "");
      return {
        items: [item],
        downloadBlob: blob,
        downloadName: item.name,
        summary: [{ label: "Language", value: settings.ocrLang }, { label: "Characters", value: String((result.text || "").length) }],
      };
    }
    case "lock-pdf":
    case "protect-pdf":
    case "encrypt-pdf": {
      const blob = await pdfApi.encryptPDF(firstFile, settings.password, tool.id);
      return makeSingleOutput(blob, `${stripExtension(firstFile.name)}-protected.pdf`, "pdf", [{ label: "Security", value: "Password protected" }]);
    }
    case "unlock-pdf":
    case "remove-password":
    case "decrypt-pdf": {
      const blob = await pdfApi.decryptPDF(firstFile, settings.password, tool.id);
      return makeSingleOutput(blob, `${stripExtension(firstFile.name)}-unlocked.pdf`, "pdf", [{ label: "Security", value: "Password removed" }]);
    }
    case "resize-pdf":
    case "edit-pdf":
    case "annotate-pdf":
    case "add-text":
    case "add-image-to-pdf":
    case "highlight-text":
    case "draw-on-pdf":
    case "crop-pdf":
    case "redact-pdf":
    case "add-watermark":
    case "add-page-numbers": {
      const blob = new Blob([await firstFile.arrayBuffer()], { type: "application/pdf" });
      return makeSingleOutput(blob, `${stripExtension(firstFile.name)}-${tool.id}.pdf`, "pdf", [
        { label: "Previewed edit", value: settings.editTool || tool.label },
        { label: "Pages", value: selectedItems.length ? String(selectedItems.length) : "All" },
      ]);
    }
    default:
      throw new Error(`${tool.label} is not connected to the backend yet.`);
  }
}

function createWorkflowFile(file: File): WorkflowFile {
  const kind = kindForFile(file);
  const objectUrl = kind === "image" ? URL.createObjectURL(file) : undefined;
  return {
    id: makeFileId(file),
    file,
    name: file.name,
    size: file.size,
    kind,
    items: [],
    loading: true,
    objectUrl,
  };
}

function cacheKeyForFile(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

function hydrateCachedItems(items: PreviewItem[], source: WorkflowFile) {
  return items.map((item, index) => ({
    ...item,
    id: `${source.id}-${index + 1}`,
    fileId: source.id,
    fileName: source.name,
  }));
}

function addSelectionItems(items: PreviewItem[], setSelectionOrder: React.Dispatch<React.SetStateAction<string[]>>) {
  setSelectionOrder(prev => {
    const current = new Set(prev);
    const additions = items.filter(item => !current.has(item.id)).map(item => item.id);
    return [...prev, ...additions];
  });
}

function kindForFile(file: File): PreviewKind {
  const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
  if (ext === ".pdf") return "pdf";
  if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return "image";
  if ([".doc", ".docx"].includes(ext)) return "document";
  if ([".xls", ".xlsx"].includes(ext)) return "spreadsheet";
  if ([".ppt", ".pptx"].includes(ext)) return "presentation";
  return "generic";
}

function fallbackPreviewItems(source: WorkflowFile, tool: Tool): PreviewItem[] {
  const count = source.kind === "presentation" ? 4 : source.kind === "spreadsheet" ? 3 : 1;
  return Array.from({ length: count }).map((_, index) => ({
    id: `${source.id}-fallback-${index}`,
    fileId: source.id,
    fileName: source.name,
    index,
    label: defaultItemLabel(source.kind, index),
    kind: source.kind,
    text: `${tool.label} preview placeholder for ${source.name}`,
  }));
}

function defaultItemLabel(kind: PreviewKind, index: number) {
  if (kind === "spreadsheet") return `Sheet ${index + 1}`;
  if (kind === "presentation") return `Slide ${index + 1}`;
  if (kind === "image") return `Image ${index + 1}`;
  if (kind === "document") return `Document ${index + 1}`;
  return `Item ${index + 1}`;
}

function shouldAutoSelect(toolId: string) {
  return toolId !== "delete-pages";
}

function needsSelection(toolId: string) {
  return new Set([
    "split-pdf",
    "delete-pages",
    "extract-pages",
    "reorder-pages",
    "insert-pages",
    "pdf-to-jpg",
    "pdf-to-images",
    "pdf-to-powerpoint",
    "powerpoint-to-pdf",
    "image-to-pdf",
    "jpg-to-pdf",
    "png-to-pdf",
  ]).has(toolId);
}

const queueTools = new Set(["extract-pages", "reorder-pages", "insert-pages", "image-to-pdf", "jpg-to-pdf", "png-to-pdf", "pdf-to-powerpoint"]);

function pageRangeFromItems(items: PreviewItem[]) {
  const pages = [...new Set(items.filter(item => item.kind === "pdf" || item.kind === "presentation").map(item => item.index + 1))].sort((a, b) => a - b);
  return pages.join(",");
}

function makeSingleOutput(blob: Blob | null, name: string, kind: OutputPreviewItem["kind"], summary: ProcessedOutput["summary"]): ProcessedOutput {
  if (!blob) throw new Error("No output file returned.");
  const item = makeOutputItem(blob, name, kind, 0);
  return { items: [item], downloadBlob: blob, downloadName: name, summary };
}

function makeOutputItem(blob: Blob, name: string, kind: OutputPreviewItem["kind"], index: number, text?: string): OutputPreviewItem {
  const canPreviewUrl = kind === "pdf" || kind === "image";
  return {
    id: `output-${index}-${name}`,
    name,
    size: blob.size,
    kind,
    blob,
    url: canPreviewUrl ? URL.createObjectURL(blob) : undefined,
    text,
  };
}

function resetOutput(output: ProcessedOutput | null) {
  output?.items.forEach(item => {
    if (item.url) URL.revokeObjectURL(item.url);
  });
}

function pickSettings(settings: ToolSettings, keys: Array<keyof ToolSettings>) {
  return keys.reduce<Record<string, string>>((result, key) => {
    result[key] = String(settings[key]);
    return result;
  }, {});
}

function reductionText(original: number, next: number) {
  if (!original || !next) return "0%";
  return `${Math.max(0, Math.round((1 - next / original) * 100))}%`;
}

function stripExtension(filename: string) {
  return filename.replace(/\.[^/.]+$/, "");
}

function makeFileId(file: File) {
  return `${file.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${file.size}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function animateProgress(setProgress: (value: number) => void, from: number, to: number, duration: number): Promise<void> {
  return new Promise(resolve => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const percent = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - percent, 3);
      setProgress(Math.round(from + (to - from) * eased));
      if (percent < 1) requestAnimationFrame(tick); else resolve();
    };
    requestAnimationFrame(tick);
  });
}

async function createZipBlob(files: Array<{ name: string; blob: Blob }>) {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  const { time, date } = dosTimeDate(new Date());

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const data = new Uint8Array(await file.blob.arrayBuffer());
    const crc = crc32(data);

    const local = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, time, true);
    localView.setUint16(12, date, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, data.length, true);
    localView.setUint32(22, data.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localView.setUint16(28, 0, true);
    local.set(nameBytes, 30);
    chunks.push(local, data);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, time, true);
    centralView.setUint16(14, date, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, data.length, true);
    centralView.setUint32(24, data.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);
    central.push(centralHeader);

    offset += local.length + data.length;
  }

  const centralOffset = offset;
  const centralSize = central.reduce((sum, chunk) => sum + chunk.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, centralOffset, true);
  endView.setUint16(20, 0, true);

  const parts = [...chunks, ...central, end].map(part => {
    const buffer = new ArrayBuffer(part.byteLength);
    new Uint8Array(buffer).set(part);
    return buffer;
  });
  return new Blob(parts, { type: "application/zip" });
}

function dosTimeDate(value: Date) {
  const time = (value.getHours() << 11) | (value.getMinutes() << 5) | Math.floor(value.getSeconds() / 2);
  const date = ((value.getFullYear() - 1980) << 9) | ((value.getMonth() + 1) << 5) | value.getDate();
  return { time, date };
}

function crc32(data: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let c = index;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});
