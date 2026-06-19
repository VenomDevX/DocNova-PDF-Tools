import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Download,
  MoreVertical,
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
  Grid2X2,
  List,
  ChevronDown,
  CornerDownRight,
  Lock,
  ArrowRight,
  Type,
  Crop,
  Eraser,
  Undo2,
  Redo2,
  Minus,
  Hand,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  PenLine,
  Highlighter,
  Droplet,
  Shield,
  Hash,
  Unlock,
  KeyRound,
  ShieldOff,
  ShieldCheck,
  EyeOff,
  Eye as EyeIcon,
  ScanLine,
} from "lucide-react";
import { categoryMeta, ocrLanguages, type Tool } from "../../data/tools";
import { pdfApi } from "../../../services/pdfApi";
import { ProcessingOverlay } from "./ProcessingOverlay";
import { resetDocNovaState } from "../../../lib/resetDocNovaState";
import { getFriendlyErrorMessage } from "../../../utils/errorHandler";
import {
  CheckBox as OrganizeCheckBox,
  AddMoreFilesTile as OrganizeAddMoreFilesTile,
  DetailRow as OrganizeDetailRow,
  Label as OrganizeLabel,
  PageCard as OrganizePageCard,
  RadioRow as OrganizeRadioRow,
  Select as OrganizeSelect,
  ToggleRow as OrganizeToggleRow,
  ToolbarButton as OrganizeToolbarButton,
} from "./OrganizeComponents";

type WorkflowStatus = "idle" | "processing" | "done" | "error";
type PreviewKind = "pdf" | "image" | "document" | "spreadsheet" | "presentation" | "text" | "generic";
const singleFileConversionTools = new Set([
  "pdf-to-word",
  "word-to-pdf",
  "pdf-to-excel",
  "excel-to-pdf",
  "pdf-to-powerpoint",
  "powerpoint-to-pdf",
  "pdf-to-jpg",
  "jpg-to-pdf",
  "png-to-pdf",
  "pdf-to-images",
  "image-to-pdf",
]);
const pdfEditorWorkspaceTools = new Set([
  "edit-pdf",
  "annotate-pdf",
  "add-text",
  "add-image-to-pdf",
  "highlight-text",
  "draw-on-pdf",
  "crop-pdf",
  "redact-pdf",
  "add-watermark",
  "add-page-numbers",
]);

const secureWorkspaceTools = new Set([
  "lock-pdf",
  "unlock-pdf",
  "protect-pdf",
  "remove-password",
  "encrypt-pdf",
  "decrypt-pdf",
]);

const ocrWorkspaceTools = new Set([
  "pdf-ocr",
  "image-ocr",
]);

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
  rotation?: number;
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
  ocrRecognizeText: boolean;
  ocrSearchablePdf: boolean;
  ocrImageEnhancement: boolean;
  ocrAutoRotate: boolean;
  ocrTextDetectionMode: string;
  editTool: string;
  editorLayers: string;
  editorCanvasHeight: number;
  watermarkText: string;
  password: string;
  confirmPassword: string;
  ownerPassword: string;
  encryptionStrength: string;
  encryptionMethod: string;
  allowPrinting: boolean;
  allowCopying: boolean;
  allowEditing: boolean;
  allowComments: boolean;
  outputFileName: string;
};

const defaultSettings: ToolSettings = {
  splitMode: "selected",
  pageRange: "",
  customGroups: "1-2, 3-4",
  rotation: "90",
  rotationScope: "selected",
  compression: "medium",
  conversionMode: "all",
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
  ocrRecognizeText: true,
  ocrSearchablePdf: true,
  ocrImageEnhancement: true,
  ocrAutoRotate: true,
  ocrTextDetectionMode: "auto",
  editTool: "text",
  editorLayers: "[]",
  editorCanvasHeight: 900,
  watermarkText: "DocNova",
  password: "",
  confirmPassword: "",
  ownerPassword: "",
  encryptionStrength: "AES-256",
  encryptionMethod: "password",
  allowPrinting: true,
  allowCopying: false,
  allowEditing: false,
  allowComments: true,
  outputFileName: "",
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
  const [organizerViewMode, setOrganizerViewMode] = useState<"grid" | "list">("grid");
  // List-mode (preview-style) state: which page is shown large + its zoom.
  const [organizeActiveId, setOrganizeActiveId] = useState<string | null>(null);
  const [organizeZoom, setOrganizeZoom] = useState(100);
  // When true, the upload/options screen is shown again even though files exist,
  // so "Back" can return there without discarding the file or chosen settings.
  const [showUploadView, setShowUploadView] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const catMeta = categoryMeta[tool.category];
  const acceptsMultiple = tool.multipleFiles || tool.id === "image-to-pdf" || tool.id === "insert-pages";
  const allItems = useMemo(() => files.flatMap(file => file.items), [files]);
  const organizeActiveItem = allItems.find(item => item.id === organizeActiveId) || allItems[0];
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
            rotation: 0,
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
      // Word preview errors carry actionable messages (e.g. legacy .doc); keep them verbatim.
      const message = source.kind === "document" && error instanceof Error && error.message
        ? error.message
        : getFriendlyErrorMessage(error, 'conversion');
      setFiles(prev => prev.map(file => file.id === source.id ? {
        ...file,
        loading: false,
        previewStatus: undefined,
        error: message,
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
    setShowUploadView(false);
    setReplaceTargetId(null);
    setSelectionOrder(prev => prev.filter(id => !replacedItemIds.has(id)));
    const outputNameFiles = replaceId ? [nextFiles[0]] : acceptsMultiple ? [...files, ...nextFiles] : nextFiles;
    setSettings(prev => ({
      ...prev,
      outputFileName: defaultOutputBaseName(tool, outputNameFiles),
    }));
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

  const addMoreFiles = useCallback(() => {
    setReplaceTargetId(null);
    inputRef.current?.click();
  }, []);

  const deleteSelectedItems = useCallback(() => {
    const toDelete = new Set(selectionOrder);
    setFiles(prev => prev.map(f => ({
      ...f,
      items: f.items.filter(item => !toDelete.has(item.id))
    })).filter(f => f.items.length > 0));
    setSelectionOrder([]);
    resetOutput(output);
    setOutput(null);
  }, [selectionOrder, output]);

  const duplicateSelectedItems = useCallback(() => {
    const toDuplicate = new Set(selectionOrder);
    setFiles(prev => prev.map(f => {
      const newItems = [...f.items];
      let insertOffset = 1;
      f.items.forEach((item, index) => {
        if (toDuplicate.has(item.id)) {
          const clone = { ...item, id: item.id + '-copy-' + Math.random().toString(36).substr(2, 5) };
          newItems.splice(index + insertOffset, 0, clone);
          insertOffset++;
        }
      });
      return { ...f, items: newItems };
    }));
    resetOutput(output);
    setOutput(null);
  }, [selectionOrder, output]);

  const rotateSelectedItems = useCallback((degrees: string) => {
    const add = parseInt(degrees, 10);
    if (!Number.isFinite(add) || selectionOrder.length === 0) return;
    const selected = new Set(selectionOrder);
    const normalizeRotation = (value: number) => ((value % 360) + 360) % 360;
    const firstSelectedRotation = selectedItems[0]?.rotation || 0;
    const nextRotation = normalizeRotation(firstSelectedRotation + add);

    setFiles(prev => prev.map(file => ({
      ...file,
      items: file.items.map(item => selected.has(item.id) ? {
        ...item,
        rotation: normalizeRotation((item.rotation || 0) + add),
      } : item),
    })));

    if (tool.id === "rotate-pdf") {
      setSettings(prev => ({ ...prev, rotation: String(nextRotation) }));
    }
    resetOutput(output);
    setOutput(null);
  }, [selectionOrder, selectedItems, output, tool.id]);

  // Rotate a single page by id (used by the list-preview floating toolbar).
  const rotateItemById = useCallback((id: string, degrees: string) => {
    const add = parseInt(degrees, 10);
    if (!Number.isFinite(add)) return;
    const normalizeRotation = (value: number) => ((value % 360) + 360) % 360;
    setFiles(prev => prev.map(file => ({
      ...file,
      items: file.items.map(item => item.id === id ? { ...item, rotation: normalizeRotation((item.rotation || 0) + add) } : item),
    })));
    resetOutput(output);
    setOutput(null);
  }, [output]);

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
    setShowUploadView(false);
  };

  const handleProcess = async (settingsOverride?: Partial<ToolSettings> | React.MouseEvent) => {
    const immediateSettings = settingsOverride && !("preventDefault" in settingsOverride)
      ? settingsOverride as Partial<ToolSettings>
      : {};
    const effectiveSettings = { ...settings, ...immediateSettings };

    if (files.length === 0) {
      setErrorMsg("Upload a file first.");
      return;
    }
    if (tool.hasPassword && !effectiveSettings.password.trim()) {
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
      const processed = await processTool(tool, files, selectedItems, effectiveSettings, setProcessingLabel);
      const customOutputName = buildOutputFileName(effectiveSettings.outputFileName, processed.downloadName);
      const namedProcessed = {
        ...processed,
        downloadName: customOutputName,
        items: processed.items.map((item, index) => index === 0 ? { ...item, name: customOutputName } : item),
      };
      setProcessingLabel("Generating output preview");
      const resultJob = await pdfApi.createResultJob(namedProcessed.downloadBlob, {
        outputFileName: namedProcessed.downloadName,
        toolType: tool.id,
        toolLabel: tool.label,
        outputFormat: tool.outputFormat,
        summary: namedProcessed.summary,
        items: namedProcessed.items.map(item => ({
          name: item.name,
          size: item.size,
          kind: item.kind,
        })),
      });

      let loadedPreview = null;
      try {
        setProcessingLabel("Finalizing document preview");
        loadedPreview = resultJob.kind === "pdf"
          ? await pdfApi.getResultPreview(resultJob.jobId, { pageRange: `1-${Math.min(4, Math.max(resultJob.pageCount, 1))}` })
          : await pdfApi.getResultPreview(resultJob.jobId);
      } catch (e) {}

      resetOutput(namedProcessed);
      await animateProgress(setProgress, 78, 100, 350);
      setStatus("done");
      navigate(`/result/${resultJob.jobId}`, {
        state: {
          preloadedJob: resultJob,
          preloadedPreview: loadedPreview
        }
      });
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

  const isOrganizerWorkspace = !showUploadView && files.length > 0 && tool.category === "organize";
  const isSingleFileConversionWorkspace = !showUploadView && files.length === 1 && singleFileConversionTools.has(tool.id);
  const isPdfEditorWorkspace = !showUploadView && files.length > 0 && pdfEditorWorkspaceTools.has(tool.id);
  const isSecureWorkspace = !showUploadView && files.length === 1 && secureWorkspaceTools.has(tool.id);
  const isOcrWorkspace = !showUploadView && files.length === 1 && ocrWorkspaceTools.has(tool.id);
  const goBackToUpload = useCallback(() => setShowUploadView(true), []);
  const continueToReview = useCallback(() => setShowUploadView(false), []);
  const isViewportLockedWorkspace = isSingleFileConversionWorkspace || isPdfEditorWorkspace || isSecureWorkspace || isOcrWorkspace;
  const isLoadedWorkspace = isOrganizerWorkspace || isSingleFileConversionWorkspace || isPdfEditorWorkspace || isSecureWorkspace || isOcrWorkspace;
  const updateOrganizerSettings = useCallback((patch: Partial<ToolSettings>) => {
    resetOutput(output);
    setOutput(null);
    setSettings(prev => ({ ...prev, ...patch }));
  }, [output]);

  const renderOrganizerSettings = () => {
    if (tool.id === "split-pdf") {
      return (
        <div>
          <OrganizeLabel>Split mode</OrganizeLabel>
          <OrganizeRadioRow checked={settings.splitMode === "every"} label="Split into individual pages" onClick={() => updateOrganizerSettings({ splitMode: "every" })} />
          <OrganizeRadioRow checked={settings.splitMode === "selected"} label="Extract selected pages" onClick={() => updateOrganizerSettings({ splitMode: "selected" })} />
          <OrganizeRadioRow checked={settings.splitMode === "range"} label="Use page range" onClick={() => updateOrganizerSettings({ splitMode: "range" })} />
          {settings.splitMode === "range" && (
            <input
              type="text"
              value={settings.pageRange}
              placeholder="1-3, 5, 8-10"
              onChange={event => updateOrganizerSettings({ pageRange: event.target.value })}
              className="mt-3 h-9 w-full rounded-md border px-3 text-sm outline-none"
              style={{ borderColor: "var(--dn-border)", background: "var(--dn-bg-subtle)", color: "var(--dn-t1)" }}
            />
          )}
        </div>
      );
    }

    if (tool.id === "rotate-pdf") {
      return (
        <div className="space-y-4">
          <div>
            <OrganizeLabel>Rotation</OrganizeLabel>
            <OrganizeRadioRow checked={settings.rotation === "270"} label="90 degrees left" onClick={() => updateOrganizerSettings({ rotation: "270" })} />
            <OrganizeRadioRow checked={settings.rotation === "90"} label="90 degrees right" onClick={() => updateOrganizerSettings({ rotation: "90" })} />
            <OrganizeRadioRow checked={settings.rotation === "180"} label="180 degrees" onClick={() => updateOrganizerSettings({ rotation: "180" })} />
          </div>
          <div>
            <OrganizeLabel>Apply to</OrganizeLabel>
            <OrganizeRadioRow checked={settings.rotationScope === "selected"} label="Selected pages" onClick={() => updateOrganizerSettings({ rotationScope: "selected" })} />
            <OrganizeRadioRow checked={settings.rotationScope === "all"} label="All pages" onClick={() => updateOrganizerSettings({ rotationScope: "all" })} />
          </div>
        </div>
      );
    }

    if (tool.id === "delete-pages") {
      return (
        <div>
          <OrganizeLabel>Delete mode</OrganizeLabel>
          <OrganizeRadioRow checked label="Remove selected pages" />
          <p className="mt-3 rounded-md border px-3 py-2 text-xs leading-relaxed" style={{ borderColor: "rgba(248,113,113,0.28)", background: "rgba(248,113,113,0.08)", color: "#fca5a5" }}>
            Select pages in the canvas, then process to remove them from the final PDF.
          </p>
        </div>
      );
    }

    if (tool.id === "reorder-pages") {
      return (
        <div>
          <OrganizeLabel>Reorder mode</OrganizeLabel>
          <OrganizeRadioRow checked label="Use current page order" />
          <OrganizeRadioRow checked={false} label="Keep original file grouping" />
        </div>
      );
    }

    if (tool.id === "extract-pages") {
      return (
        <div>
          <OrganizeLabel>Extract mode</OrganizeLabel>
          <OrganizeRadioRow checked={settings.conversionMode === "selected"} label="Selected pages only" onClick={() => updateOrganizerSettings({ conversionMode: "selected" })} />
          <OrganizeRadioRow checked={settings.conversionMode === "all"} label="All pages" onClick={() => updateOrganizerSettings({ conversionMode: "all" })} />
        </div>
      );
    }

    if (tool.id === "insert-pages") {
      return (
        <div>
          <OrganizeLabel>Insert mode</OrganizeLabel>
          <OrganizeRadioRow checked label="Insert selected pages in canvas order" />
          <OrganizeRadioRow checked={false} label="Append after existing pages" />
        </div>
      );
    }

    if (tool.id === "resize-pdf") {
      return (
        <div className="space-y-4">
          <div>
            <OrganizeLabel>Page size</OrganizeLabel>
            <OrganizeRadioRow checked={settings.pageSize === "A4"} label="A4" onClick={() => updateOrganizerSettings({ pageSize: "A4" })} />
            <OrganizeRadioRow checked={settings.pageSize === "Letter"} label="Letter" onClick={() => updateOrganizerSettings({ pageSize: "Letter" })} />
            <OrganizeRadioRow checked={settings.pageSize === "Legal"} label="Legal" onClick={() => updateOrganizerSettings({ pageSize: "Legal" })} />
          </div>
          <div>
            <OrganizeLabel>Orientation</OrganizeLabel>
            <OrganizeRadioRow checked={settings.orientation === "portrait"} label="Portrait" onClick={() => updateOrganizerSettings({ orientation: "portrait" })} />
            <OrganizeRadioRow checked={settings.orientation === "landscape"} label="Landscape" onClick={() => updateOrganizerSettings({ orientation: "landscape" })} />
          </div>
        </div>
      );
    }

    if (tool.id === "compress-pdf") {
      return (
        <div>
          <OrganizeLabel>Compression</OrganizeLabel>
          <OrganizeRadioRow checked={settings.compression === "low"} label="Low compression, best quality" onClick={() => updateOrganizerSettings({ compression: "low" })} />
          <OrganizeRadioRow checked={settings.compression === "medium"} label="Balanced compression" onClick={() => updateOrganizerSettings({ compression: "medium" })} />
          <OrganizeRadioRow checked={settings.compression === "high"} label="High compression, smaller file" onClick={() => updateOrganizerSettings({ compression: "high" })} />
        </div>
      );
    }

    return (
      <div>
        <OrganizeLabel>Mode</OrganizeLabel>
        <OrganizeRadioRow checked label={tool.action} />
      </div>
    );
  };

  const workflowShellStyle: React.CSSProperties = {
    color: "var(--dn-t1)",
    paddingTop: isLoadedWorkspace ? "0" : "8px",
    minHeight: isViewportLockedWorkspace ? "calc(100vh - 60px)" : isLoadedWorkspace ? "calc(100vh - 60px)" : "100vh",
    height: isViewportLockedWorkspace ? "calc(100vh - 60px)" : undefined,
    overflow: isViewportLockedWorkspace ? "hidden" : undefined,
    // Transparent: the gradient is painted by the page's main wrapper so it is
    // one continuous background that also sits behind the transparent navbar.
    background: "transparent",
    transition: "var(--dn-transition)",
    fontFamily: "'Inter', sans-serif",
    position: "relative",
  };
  const workflowContentStyle: React.CSSProperties = isOrganizerWorkspace
    ? { maxWidth: "none", margin: 0, padding: 0, position: "relative", zIndex: 10, height: "calc(100vh - 60px)", display: "flex", flexDirection: "column" }
    : isViewportLockedWorkspace
      ? { width: "100%", maxWidth: "none", margin: 0, padding: 0, position: "relative", zIndex: 10, height: "calc(100vh - 60px)", overflow: "hidden" }
      : { width: "100%", maxWidth: "none", margin: 0, padding: "2rem 1.5rem", position: "relative", zIndex: 10 };

  return (
    <div style={workflowShellStyle}>
      {status === "processing" && (
        <ProcessingOverlay
          title={`${tool.action} document...`}
          description="Applying AI operations and generating your output. This may take a few moments."
          progressMessage="Processing Output"
          files={files}
        />
      )}
      <div className="dn-dark-blobs fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#2563eb]/15 rounded-full blur-[100px] animate-[drift1_25s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#0267b8]/15 rounded-full blur-[120px] animate-[drift2_30s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#b4c5ff]/5 rounded-full blur-[150px] animate-[drift1_40s_ease-in-out_infinite]"></div>
      </div>

      <div style={workflowContentStyle}>
        <style>{`
          ${(isViewportLockedWorkspace || isOrganizerWorkspace) ? `
          ::-webkit-scrollbar { display: none !important; }
          * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
          ` : ""}
          ${isViewportLockedWorkspace ? `
          .dn-main-wrap {
            height: 100vh !important;
            min-height: 100vh !important;
            overflow: hidden !important;
          }
          .dn-main-wrap > footer {
            display: none !important;
          }
          ` : ""}
          .document-viewer,
          .settings-content,
          .thumbnail-scroll {
            -ms-overflow-style: auto !important;
            scrollbar-width: thin !important;
            scrollbar-color: var(--dn-convert-scroll-thumb) var(--dn-convert-scroll-track) !important;
            --dn-convert-scroll-thumb: rgba(100, 116, 139, 0.5);
            --dn-convert-scroll-track: rgba(226, 232, 240, 0.42);
          }
          [data-theme="dark"] .document-viewer,
          [data-theme="dark"] .settings-content,
          [data-theme="dark"] .thumbnail-scroll {
            --dn-convert-scroll-thumb: rgba(96, 165, 250, 0.58);
            --dn-convert-scroll-track: rgba(15, 23, 42, 0.5);
          }
          html:not([data-theme="light"]) .document-viewer,
          html:not([data-theme="light"]) .settings-content,
          html:not([data-theme="light"]) .thumbnail-scroll {
            --dn-convert-scroll-thumb: rgba(96, 165, 250, 0.58);
            --dn-convert-scroll-track: rgba(15, 23, 42, 0.5);
          }
          .document-viewer::-webkit-scrollbar,
          .settings-content::-webkit-scrollbar,
          .thumbnail-scroll::-webkit-scrollbar {
            display: block !important;
            width: 8px;
            height: 8px;
          }
          .document-viewer::-webkit-scrollbar-thumb,
          .settings-content::-webkit-scrollbar-thumb,
          .thumbnail-scroll::-webkit-scrollbar-thumb {
            background: var(--dn-convert-scroll-thumb);
            border: 2px solid var(--dn-convert-scroll-track);
            border-radius: 999px;
          }
          .document-viewer::-webkit-scrollbar-track,
          .settings-content::-webkit-scrollbar-track,
          .thumbnail-scroll::-webkit-scrollbar-track {
            background: var(--dn-convert-scroll-track);
          }
          .pdf-editor-scroll {
            -ms-overflow-style: auto !important;
            scrollbar-width: thin !important;
            scrollbar-color: rgba(100, 116, 139, 0.42) transparent !important;
          }
          .pdf-editor-scroll::-webkit-scrollbar {
            display: block !important;
            width: 8px;
            height: 8px;
          }
          .pdf-editor-scroll::-webkit-scrollbar-thumb {
            background: rgba(100, 116, 139, 0.42);
            border-radius: 999px;
          }
          .pdf-editor-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          @media (max-width: 980px) {
            .dn-workflow-grid { grid-template-columns: 1fr !important; }
            .dn-sticky-panel { position: static !important; }
          }
          [data-theme="light"] .dn-dark-blobs { display: none; }
          html:not([data-theme="dark"]) .dn-dark-blobs { display: none; }

          .thumbnail-item {
              width: 100%;
              margin: 0;
          }
          .thumbnail-preview {
              width: 100%;
              height: auto;
              object-fit: contain;
              border-radius: 8px;
          }
          .dn-glassmorphism-button {
            position: relative;
            isolation: isolate;
            overflow: hidden;
            color: var(--dn-toolbar-text) !important;
            border-color: var(--dn-toolbar-border) !important;
            background: var(--dn-toolbar-bg) !important;
            backdrop-filter: blur(16px) saturate(180%);
            -webkit-backdrop-filter: blur(16px) saturate(180%);
            box-shadow: var(--dn-toolbar-shadow);
          }
          .dn-glassmorphism-button::before {
            content: "";
            position: absolute;
            inset: 0;
            z-index: -1;
            border-radius: inherit;
            background: linear-gradient(180deg, rgba(255,255,255,0.11), rgba(255,255,255,0.025));
            opacity: 1;
            pointer-events: none;
          }
          .dn-glassmorphism-button:hover {
            border-color: var(--dn-selected-border) !important;
            background: var(--dn-hover-bg) !important;
            color: var(--dn-t1) !important;
          }
          [data-theme="light"] .dn-glassmorphism-button {
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.9), var(--dn-toolbar-shadow);
          }
          [data-theme="light"] .dn-glassmorphism-button:hover {
            background: #ffffff !important;
          }
          [data-theme="dark"] .dn-glassmorphism-button:hover {
            /* Keep the whole button dark on hover (a lifted slate), not a washed-out
               white from the translucent --dn-hover-bg overlay. */
            background: rgba(38,50,74,0.92) !important;
            color: var(--dn-t1) !important;
          }
          .active-thumbnail {
              box-shadow: 0 0 0 2px var(--dn-selected-border) !important;
              border-color: var(--dn-selected-border) !important;
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

        {showUploadView && files.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1.25rem", padding: "0.85rem 1rem", borderRadius: "8px", background: "var(--dn-bg-card)", border: "1px solid var(--dn-border)", boxShadow: "var(--dn-shadow)" }}>
            <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: "8px", display: "grid", placeItems: "center", background: "var(--dn-icon-bg)", color: tool.color }}>
              <FileKindIcon kind={files[0].kind} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ color: "var(--dn-t1)", fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{files.length > 1 ? `${files.length} files ready` : files[0].name}</div>
              <div style={{ color: "var(--dn-t4)", fontSize: "0.78rem" }}>Your file and settings are kept. Continue where you left off.</div>
            </div>
            <button type="button" onClick={continueToReview} className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700">
              Continue to review <ArrowRight size={16} />
            </button>
          </div>
        )}

        {!isOrganizerWorkspace && (
          <>
            {!isSingleFileConversionWorkspace && !isPdfEditorWorkspace && !isSecureWorkspace && !isOcrWorkspace && (
              <>
                <Link to={"/" + tool.category} style={{ textDecoration: "none" }}>
                  <motion.div whileHover={{ x: -3 }} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--dn-t3)", fontSize: "0.875rem", marginBottom: "1.25rem", cursor: "pointer" }}>
                    <ArrowLeft size={15} /> {catMeta.label}
                  </motion.div>
                </Link>

                <header style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1.25rem" }}>
                  <div style={{ width: 60, height: 60, borderRadius: "4px", background: tool.iconGrad, display: "grid", placeItems: "center", boxShadow: "0 8px 28px " + tool.color + "42", flexShrink: 0 }}>
                    <tool.icon size={28} color="#fff" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.7rem)", lineHeight: 1.05, fontWeight: 920, margin: 0 }}>{tool.label}</h1>
                    <p style={{ color: "var(--dn-t3)", marginTop: "0.55rem", maxWidth: 760, lineHeight: 1.6 }}>{tool.desc}</p>
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
                    minHeight: "clamp(420px, calc(100vh - 320px), 680px)",
                    borderRadius: "5px",
                    border: "2px dashed " + (isDraggingUpload ? tool.color : "var(--dn-border2)"),
                    background: isDraggingUpload ? tool.color + "14" : "var(--dn-bg-card)",
                    display: "grid",
                    placeItems: "center",
                    textAlign: "center",
                    cursor: "pointer",
                    boxShadow: "var(--dn-shadow)",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <div style={{ width: 58, height: 58, margin: "0 auto 0.85rem", borderRadius: "4px", display: "grid", placeItems: "center", background: tool.color + "18", color: tool.color, boxShadow: "0 0 30px " + tool.color + "24" }}>
                      <Upload size={26} />
                    </div>
                    <div style={{ color: "var(--dn-t1)", fontWeight: 800 }}>{isDraggingUpload ? "Drop files here" : "Upload " + tool.label + " files"}</div>
                    <div style={{ color: "var(--dn-t4)", fontSize: "0.82rem", marginTop: "0.35rem" }}>
                      {acceptsMultiple ? "Multiple files supported." : "One file at a time."} Accepted: {tool.accepts}
                    </div>
                  </div>
                </section>
              </>
            )}

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
              isPdfEditorWorkspace ? (
                <PdfEditorPreviewWorkspace
                  tool={tool}
                  file={files[0]}
                  items={allItems}
                  status={status}
                  onSave={handleProcess}
                  onClear={handleReset}
                  onBack={goBackToUpload}
                  onSettingsChange={updateOrganizerSettings}
                />
              ) : isSecureWorkspace ? (
                <SecurePdfWorkspace
                  tool={tool}
                  file={files[0]}
                  items={allItems}
                  settings={settings}
                  status={status}
                  onSettingsChange={updateOrganizerSettings}
                  onProcess={handleProcess}
                  onClear={handleReset}
                  onBack={goBackToUpload}
                />
              ) : isOcrWorkspace ? (
                <OcrWorkspace
                  tool={tool}
                  file={files[0]}
                  items={allItems}
                  settings={settings}
                  status={status}
                  onSettingsChange={updateOrganizerSettings}
                  onProcess={handleProcess}
                  onClear={handleReset}
                  onBack={goBackToUpload}
                />
              ) : isSingleFileConversionWorkspace ? (
                <SingleFileConversionPreview
                  tool={tool}
                  file={files[0]}
                  items={allItems}
                  settings={settings}
                  status={status}
                  onSettingsChange={updateOrganizerSettings}
                  onConvert={handleProcess}
                  onBack={goBackToUpload}
                />
              ) : (pdfEditorWorkspaceTools.has(tool.id) || singleFileConversionTools.has(tool.id)) ? null : (
                <section style={{ ...panelStyle, borderRadius: "4px", padding: "1rem", display: "grid", gap: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ color: "var(--dn-t1)", fontWeight: 850 }}>{files.length} file(s) ready</div>
                      <div style={{ color: "var(--dn-t4)", fontSize: "0.78rem", marginTop: "0.2rem" }}>{selectedItems.length}/{allItems.length || 0} preview items selected</div>
                    </div>
                    <button type="button" onClick={handleReset} style={{ border: "1px solid var(--dn-border)", borderRadius: "4px", background: "var(--dn-bg-card)", color: "var(--dn-t2)", padding: "0.72rem 0.9rem", fontWeight: 750, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                      <X size={16} /> Clear
                    </button>
                  </div>

                  <div style={{ display: "grid", gap: "0.55rem" }}>
                    {files.map(file => (
                      <div key={file.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", border: "1px solid var(--dn-border)", background: "var(--dn-bg-subtle)", borderRadius: "4px", padding: "0.75rem" }}>
                        <FileKindIcon kind={file.kind} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ color: "var(--dn-t1)", fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                          <div style={{ color: "var(--dn-t4)", fontSize: "0.72rem" }}>{formatBytes(file.size)} - {file.loading ? "Preparing preview" : file.items.length + " item(s)"}</div>
                        </div>
                        <IconButton label="Remove file" onClick={() => removeFile(file.id)} danger>
                          <Trash2 size={14} />
                        </IconButton>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleProcess}
                    disabled={status === "processing"}
                    style={{ border: "none", borderRadius: "4px", background: "linear-gradient(135deg," + tool.color + ",#60a5fa)", color: "#fff", padding: "0.9rem 1.25rem", fontWeight: 850, fontSize: "0.94rem", cursor: status === "processing" ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.55rem" }}
                  >
                    {status === "processing" ? <Loader2 size={17} style={{ animation: "spin 0.8s linear infinite" }} /> : <Settings size={17} />}
                    {tool.action}
                  </motion.button>

                  {output && <OutputPreviewPanel tool={tool} output={output} onDownload={handleDownload} />}
                </section>
              )
            )}
          </>
        )}

        {isOrganizerWorkspace && (
          <div className="flex flex-1 w-full overflow-hidden bg-transparent" style={{ color: "var(--dn-t1)" }}>
            {/* Main Center */}
            <section className="flex min-w-0 flex-1 flex-col bg-transparent">
              {/* Header — shared standard layout (single tool icon, no file icon) */}
              <div className="px-6 pt-2">
                <ToolWorkspaceHeader
                  tool={tool}
                  onBack={goBackToUpload}
                  countLabel={`${files.length} ${files.length === 1 ? "file" : "files"} selected`}
                  fileName={files.length === 1 ? files[0].name : undefined}
                  fileSize={files.length === 1 ? files[0].size : undefined}
                />
              </div>

              {/* Toolbar */}
              <div className="flex h-auto min-h-14 flex-shrink-0 items-center justify-between gap-4 px-6 py-2 border-b" style={{ borderColor: "var(--dn-border)" }}>
                <div className="flex min-w-0 flex-nowrap items-center gap-2 overflow-x-auto">
                  <OrganizeToolbarButton icon={<OrganizeCheckBox checked={selectedItems.length === allItems.length && allItems.length > 0} />} text="Select all" onClick={selectedItems.length === allItems.length ? clearSelection : selectAll} />
                  <div className="mx-1 h-6 w-px" style={{ background: "var(--dn-border)" }} />
                  <OrganizeToolbarButton icon={<Plus size={17} />} text="Add files" dropdown onClick={addMoreFiles} />
                  <div className="mx-1 h-6 w-px" style={{ background: "var(--dn-border)" }} />
                  <OrganizeToolbarButton icon={<RotateCcw size={17} />} text="Rotate left" disabled={selectedItems.length === 0} onClick={() => rotateSelectedItems("-90")} />
                  <OrganizeToolbarButton icon={<RotateCw size={17} />} text="Rotate right" disabled={selectedItems.length === 0} onClick={() => rotateSelectedItems("90")} />
                  <OrganizeToolbarButton icon={<Copy size={17} />} text="Duplicate" disabled={selectedItems.length === 0} onClick={duplicateSelectedItems} />
                  <OrganizeToolbarButton icon={<Trash2 size={17} />} text="Delete" muted={selectedItems.length === 0} disabled={selectedItems.length === 0} onClick={deleteSelectedItems} />
                </div>

                <div className="flex flex-shrink-0 items-center gap-4">
                  <button type="button" className="flex items-center gap-2 text-sm" style={{ color: "var(--dn-t3)" }}>
                    Sort: <span className="font-medium" style={{ color: "var(--dn-t1)" }}>Custom</span> <ChevronDown size={15} />
                  </button>

                  <div className="flex overflow-hidden rounded-md border shadow-sm" style={{ borderColor: "var(--dn-border)", background: "var(--dn-bg-card)" }}>
                    <button
                      type="button"
                      aria-label="List view"
                      title="List view"
                      onClick={() => setOrganizerViewMode("list")}
                      className="p-2 transition"
                      style={{ color: organizerViewMode === "list" ? "#3b82f6" : "var(--dn-t4)", background: organizerViewMode === "list" ? "rgba(59,130,246,0.1)" : "transparent" }}
                    >
                      <List size={18} />
                    </button>
                    <button
                      type="button"
                      aria-label="Grid view"
                      title="Grid view"
                      onClick={() => setOrganizerViewMode("grid")}
                      className="p-2 transition"
                      style={{ color: organizerViewMode === "grid" ? "#3b82f6" : "var(--dn-t4)", background: organizerViewMode === "grid" ? "rgba(59,130,246,0.1)" : "transparent" }}
                    >
                      <Grid2X2 size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Pages Grid — unchanged grid view */}
              {organizerViewMode === "grid" ? (
                <div className="custom-scrollbar flex-1 overflow-y-auto p-6 md:p-8">
                  {files.map((file, fileIndex) => (
                    <div key={file.id} className="mb-8">
                      <div className="mb-5 flex items-start gap-2">
                        <CornerDownRight size={18} color="#2563eb" className="mt-1 flex-shrink-0" />
                        <div className="min-w-0">
                          <h2 className="truncate text-sm font-medium" style={{ color: "var(--dn-t1)" }}>{file.name}</h2>
                          <p className="mt-0.5 text-xs font-medium text-blue-500">{file.loading ? "Generating preview..." : file.items.length + " pages"}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {file.items.map((item, itemIdx) => (
                          <OrganizePageCard
                            key={item.id}
                            page={{
                              id: item.id,
                              label: item.label,
                              fileName: file.name,
                              pageNumber: item.index + 1,
                              totalPages: file.items.length,
                              thumbnail: item.thumbnail,
                              rotation: item.rotation || 0,
                            }}
                            selected={selectedIds.has(item.id)}
                            onToggle={() => toggleItem(item)}
                            isFirst={itemIdx === 0}
                          />
                        ))}
                        {fileIndex === files.length - 1 && (
                          <OrganizeAddMoreFilesTile
                            onClick={() => inputRef.current?.click()}
                            referenceThumbnail={file.items[file.items.length - 1]?.thumbnail}
                            referenceRotation={file.items[file.items.length - 1]?.rotation || 0}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List view — preview-style layout (thumbnails + large canvas) */
                <OrganizeListPreview
                  items={allItems}
                  activeItem={organizeActiveItem}
                  selectedIds={selectedIds}
                  zoom={organizeZoom}
                  onZoom={setOrganizeZoom}
                  onSetActive={setOrganizeActiveId}
                  onToggleSelect={toggleItem}
                  onRotateActive={degrees => organizeActiveItem && rotateItemById(organizeActiveItem.id, degrees)}
                  onAddFiles={() => inputRef.current?.click()}
                />
              )}
            </section>

            {/* Right Sidebar */}
            <aside className="relative z-20 flex w-[320px] flex-shrink-0 flex-col" style={{ background: "var(--dn-bg-card)", borderLeft: "1px solid var(--dn-border)" }}>
              <div className="flex-1 overflow-hidden">
                <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--dn-border)" }}>
                  <h2 className="mb-3 text-sm font-semibold" style={{ color: "var(--dn-t1)" }}>Conversion Settings</h2>
                  <div className="space-y-4">{renderOrganizerSettings()}</div>
                </div>

                <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--dn-border)" }}>
                  <h2 className="mb-3 text-sm font-semibold" style={{ color: "var(--dn-t1)" }}>Output Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <OrganizeLabel>Output format</OrganizeLabel>
                      <OrganizeSelect value="PDF" />
                    </div>
                    <div>
                      <OrganizeLabel>Save to</OrganizeLabel>
                      <OrganizeSelect value="Downloads folder" />
                    </div>
                    <div>
                      <OrganizeLabel>File name</OrganizeLabel>
                      <input
                        type="text"
                        value={settings.outputFileName || defaultOutputBaseName(tool, files)}
                        onChange={event => updateOrganizerSettings({ outputFileName: event.target.value })}
                        className="h-9 w-full rounded-md border px-3 text-sm font-semibold outline-none transition focus:border-blue-500"
                        style={{ borderColor: "var(--dn-border)", background: "var(--dn-bg-subtle)", color: "var(--dn-t1)" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4">
                  <h2 className="mb-3 text-sm font-semibold" style={{ color: "var(--dn-t1)" }}>File Details</h2>
                  <div className="space-y-2.5">
                    <OrganizeDetailRow label="Total files" value={files.length} />
                    <OrganizeDetailRow label="Total pages" value={allItems.length} />
                    <OrganizeDetailRow label="Estimated size" value={formatBytes(files.reduce((sum, file) => sum + file.size, 0))} />
                  </div>
                </div>
              </div>

              <div className="z-10 p-5 pt-5" style={{ background: "linear-gradient(to top, var(--dn-bg-card) 60%, transparent)" }}>
                <button
                  onClick={handleProcess}
                  disabled={status === "processing"}
                  className="flex h-11 w-full items-center justify-center gap-3 rounded-lg bg-blue-700 font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === "processing" ? <Loader2 size={20} className="animate-spin" /> : "Process Files"}
                  {status !== "processing" && <ArrowRight size={20} />}
                </button>

                <p className="mt-3 flex items-center justify-center gap-2 text-xs font-medium text-gray-400">
                  <Lock size={14} />
                  Your files are secure and private
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SECURE PDF WORKSPACE
   Pre-conversion review page for: Lock, Unlock, Protect,
   Remove Password, Encrypt, Decrypt
   ═══════════════════════════════════════════════════════════════ */

function SecurePdfWorkspace({
  tool,
  file,
  items,
  settings,
  status,
  onSettingsChange,
  onProcess,
  onClear,
  onBack,
}: {
  tool: Tool;
  file: WorkflowFile;
  items: PreviewItem[];
  settings: ToolSettings;
  status: WorkflowStatus;
  onSettingsChange: (patch: Partial<ToolSettings>) => void;
  onProcess: () => void;
  onClear: () => void;
  onBack?: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOwnerPassword, setShowOwnerPassword] = useState(false);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const previewItems = items.length ? items : fallbackPreviewItems(file, tool);
  const pageCount = Math.max(previewItems.length, file.loading ? 0 : 1);

  const toolId = tool.id;
  const isLock = toolId === "lock-pdf" || toolId === "protect-pdf";
  const isUnlock = toolId === "unlock-pdf" || toolId === "remove-password";
  const isEncrypt = toolId === "encrypt-pdf";
  const isDecrypt = toolId === "decrypt-pdf";

  const passwordsMatch =
    isLock || isEncrypt
      ? settings.password === settings.confirmPassword
      : true;
  const canProcess =
    status !== "processing" &&
    settings.password.length > 0 &&
    passwordsMatch;

  const badgeText = isUnlock || isDecrypt ? (isDecrypt ? "Ready to Decrypt" : "Ready to Unlock") : isEncrypt ? "Ready to Encrypt" : "Ready to Secure";
  const badgeColor = isUnlock || isDecrypt ? "#a78bfa" : isEncrypt ? "#fbbf24" : "#22c55e";
  const badgeBg = isUnlock || isDecrypt ? "rgba(167,139,250,0.12)" : isEncrypt ? "rgba(251,191,36,0.12)" : "rgba(34,197,94,0.11)";

  useEffect(() => {
    setActiveIndex(0);
    setZoom(100);
    pageRefs.current.clear();
  }, [file.id]);

  useEffect(() => {
    const root = viewerRef.current;
    if (!root || previewItems.length <= 1) return;
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) =>
          Math.abs(a.boundingClientRect.top - root.getBoundingClientRect().top) -
          Math.abs(b.boundingClientRect.top - root.getBoundingClientRect().top)
        );
      const nextIndex = Number((visible[0]?.target as HTMLElement | undefined)?.dataset.previewIndex);
      if (Number.isFinite(nextIndex)) setActiveIndex(nextIndex);
    }, { root, threshold: [0.28, 0.5, 0.72], rootMargin: "-18% 0px -58% 0px" });
    pageRefs.current.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [file.id, previewItems.length]);

  const change = (patch: Partial<ToolSettings>) => onSettingsChange(patch);

  return (
    <div
      className="convert-page grid h-[calc(100vh-60px)] w-full grid-cols-1 overflow-hidden xl:grid-cols-[minmax(0,1fr)_320px]"
      style={{ color: "var(--dn-t1)" }}
    >
      {/* ── CENTER ── */}
      <main className="preview-workspace flex h-[calc(100vh-60px)] min-w-0 flex-col overflow-hidden px-5 py-4">

        <ToolWorkspaceHeader
          tool={tool}
          onBack={onBack ?? onClear}
          countLabel={file.loading ? "Preparing..." : `${pageCount} ${pageCount === 1 ? "page" : "pages"}`}
          fileName={file.name}
          fileSize={file.size}
          badge={{ text: badgeText, color: badgeColor, bg: badgeBg, icon: <ShieldCheck size={13} /> }}
        />

        {/* Two-column inner layout: thumbnails + preview */}
        <section className="grid min-h-0 flex-1 gap-5 overflow-hidden lg:grid-cols-[160px_minmax(0,1fr)]">

          {/* Left thumbnail strip */}
          <aside className="flex min-h-0 min-w-0 flex-col">
            <div className="mb-3 flex shrink-0 items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: "var(--dn-t1)" }}>Pages</h3>
              <span className="text-sm font-semibold" style={{ color: "var(--dn-t3)" }}>
                {file.loading ? "..." : pageCount}
              </span>
            </div>
            <div className="thumbnail-scroll grid auto-rows-max content-start min-h-0 flex-1 gap-4 overflow-y-auto pr-2">
              {previewItems.map((item, index) => {
                const active = index === activeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveIndex(index);
                      pageRefs.current.get(index)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="thumbnail-item transition-colors"
                    style={{ color: active ? "#3b82f6" : "var(--dn-t2)" }}
                  >
                    <div className={active ? "active-thumbnail" : ""} style={{ borderRadius: "8px", overflow: "hidden", background: "#fff", border: "1px solid var(--dn-border)", boxShadow: "var(--dn-shadow)" }}>
                      <PreviewSurface item={item} isThumbnail />
                    </div>
                    <p className="mt-2 truncate text-xs font-semibold">{item.label}</p>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Center preview canvas */}
          <section className="relative flex min-h-0 min-w-0 flex-col">
            <div
              ref={viewerRef}
              className="document-viewer flex min-h-0 flex-1 items-start justify-center overflow-auto p-8"
              style={{ background: "var(--dn-preview-bg)" }}
            >
              <div style={{ width: Math.max(360, zoom * 7), flexShrink: 0, display: "grid", gap: "2rem", justifyItems: "center", alignContent: "start", transition: "width 0.2s ease" }}>
                {previewItems.length
                  ? previewItems.map((item, index) => (
                      <div
                        key={item.id}
                        data-preview-index={index}
                        ref={el => { if (el) pageRefs.current.set(index, el); else pageRefs.current.delete(index); }}
                        style={{ width: "100%", boxShadow: "var(--dn-page-shadow)", scrollMarginTop: 16 }}
                      >
                        <PreviewSurface item={item} />
                      </div>
                    ))
                  : <EmptyPanel text="Preview is preparing." />}
              </div>
            </div>

            {/* Floating zoom controls */}
            <div
              className="absolute bottom-6 left-1/2 z-20 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 flex-nowrap items-center justify-center gap-2 overflow-x-auto whitespace-nowrap"
              style={{ background: "transparent", boxShadow: "none" }}
            >
              <ConversionToolButton label="Zoom out" icon={<ZoomOut size={16} />} compact onClick={() => setZoom(prev => Math.max(50, prev - 10))} />
              <button type="button" className="dn-glassmorphism-button h-10 min-w-[60px] whitespace-nowrap rounded-[4px] border px-4 text-sm font-extrabold transition-colors" style={{ color: "rgba(255,255,255,0.95)" }}>
                {zoom}%
              </button>
              <ConversionToolButton label="Zoom in" icon={<ZoomIn size={16} />} compact onClick={() => setZoom(prev => Math.min(180, prev + 10))} />
              <div className="mx-1 h-5 w-px" style={{ background: "rgba(255,255,255,0.18)" }} />
              <span className="inline-flex h-10 items-center rounded-[4px] border px-4 text-xs font-semibold whitespace-nowrap" style={{ borderColor: "rgba(255,255,255,0.14)", background: "rgba(15,23,42,0.55)", color: "rgba(255,255,255,0.7)" }}>
                {activeIndex + 1} / {pageCount}
              </span>
            </div>
          </section>
        </section>
      </main>

      {/* ── RIGHT SIDEBAR ── */}
      <aside
        className="settings-sidebar flex h-[calc(100vh-60px)] min-h-0 flex-col overflow-hidden border-l xl:sticky xl:top-[60px]"
        style={{ background: "var(--dn-bg-card)", borderColor: "var(--dn-border)" }}
      >
        {/* Sidebar header */}
        <div className="flex shrink-0 items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--dn-border)" }}>
          <div className="grid h-10 w-10 place-items-center rounded-lg" style={{ background: `${tool.color}22`, color: tool.color }}>
            <tool.icon size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold" style={{ color: "var(--dn-t1)" }}>{tool.label}</h3>
            <p className="mt-0.5 truncate text-xs" style={{ color: "var(--dn-t3)" }}>{tool.desc}</p>
          </div>
        </div>

        {/* Scrollable settings */}
        <div className="settings-content min-h-0 flex-1 overflow-y-auto">

          {/* ── LOCK / PROTECT ── */}
          {(isLock) && (
            <>
              <ConversionPanelSection title="Set Password">
                <SecurePasswordField
                  label="New password"
                  value={settings.password}
                  show={showPassword}
                  onToggleShow={() => setShowPassword(p => !p)}
                  onChange={v => change({ password: v })}
                  placeholder="Enter password..."
                />
                <SecurePasswordField
                  label="Confirm password"
                  value={settings.confirmPassword}
                  show={showConfirmPassword}
                  onToggleShow={() => setShowConfirmPassword(p => !p)}
                  onChange={v => change({ confirmPassword: v })}
                  placeholder="Re-enter password..."
                  error={settings.confirmPassword.length > 0 && !passwordsMatch ? "Passwords do not match" : undefined}
                />
              </ConversionPanelSection>
              <ConversionPanelSection title="Encryption Strength">
                {(["AES-256", "AES-128", "RC4-128"] as const).map(s => (
                  <ConversionRadio
                    key={s}
                    label={s}
                    checked={settings.encryptionStrength === s}
                    onClick={() => change({ encryptionStrength: s })}
                  />
                ))}
              </ConversionPanelSection>
              <ConversionPanelSection title="Permissions">
                <SecurePermissionToggle label="Allow Printing" checked={settings.allowPrinting} onChange={v => change({ allowPrinting: v })} />
                <SecurePermissionToggle label="Allow Copying" checked={settings.allowCopying} onChange={v => change({ allowCopying: v })} />
                <SecurePermissionToggle label="Allow Editing" checked={settings.allowEditing} onChange={v => change({ allowEditing: v })} />
                <SecurePermissionToggle label="Allow Comments" checked={settings.allowComments} onChange={v => change({ allowComments: v })} />
              </ConversionPanelSection>
              <SecureSecuritySummary
                strength={settings.encryptionStrength}
                permissions={[settings.allowPrinting, settings.allowCopying, settings.allowEditing, settings.allowComments]}
                isSet={settings.password.length > 0 && passwordsMatch}
              />
            </>
          )}

          {/* ── UNLOCK / REMOVE PASSWORD ── */}
          {(isUnlock) && (
            <>
              <ConversionPanelSection title="Enter Current Password">
                <SecurePasswordField
                  label="Current password"
                  value={settings.password}
                  show={showPassword}
                  onToggleShow={() => setShowPassword(p => !p)}
                  onChange={v => change({ password: v })}
                  placeholder="Enter current password..."
                />
              </ConversionPanelSection>
              <ConversionPanelSection title="Security Status">
                <SecureStatusCard
                  icon={<Lock size={16} />}
                  title="PDF is Password Protected"
                  desc="Enter the correct password to remove protection."
                  color="#f59e0b"
                />
              </ConversionPanelSection>
            </>
          )}

          {/* ── ENCRYPT ── */}
          {(isEncrypt) && (
            <>
              <ConversionPanelSection title="Encryption Method">
                {(["password", "certificate"] as const).map(m => (
                  <ConversionRadio
                    key={m}
                    label={m === "password" ? "Password-based encryption" : "Certificate-based encryption"}
                    checked={settings.encryptionMethod === m}
                    onClick={() => change({ encryptionMethod: m })}
                  />
                ))}
              </ConversionPanelSection>
              <ConversionPanelSection title="Encryption Strength">
                {(["AES-256", "AES-128", "RC4-128"] as const).map(s => (
                  <ConversionRadio
                    key={s}
                    label={s}
                    checked={settings.encryptionStrength === s}
                    onClick={() => change({ encryptionStrength: s })}
                  />
                ))}
              </ConversionPanelSection>
              <ConversionPanelSection title="Passwords">
                <SecurePasswordField
                  label="User password"
                  value={settings.password}
                  show={showPassword}
                  onToggleShow={() => setShowPassword(p => !p)}
                  onChange={v => change({ password: v })}
                  placeholder="User password..."
                />
                <SecurePasswordField
                  label="Confirm user password"
                  value={settings.confirmPassword}
                  show={showConfirmPassword}
                  onToggleShow={() => setShowConfirmPassword(p => !p)}
                  onChange={v => change({ confirmPassword: v })}
                  placeholder="Re-enter user password..."
                  error={settings.confirmPassword.length > 0 && !passwordsMatch ? "Passwords do not match" : undefined}
                />
                <SecurePasswordField
                  label="Owner password (optional)"
                  value={settings.ownerPassword}
                  show={showOwnerPassword}
                  onToggleShow={() => setShowOwnerPassword(p => !p)}
                  onChange={v => change({ ownerPassword: v })}
                  placeholder="Owner password..."
                />
              </ConversionPanelSection>
              <ConversionPanelSection title="Permissions">
                <SecurePermissionToggle label="Allow Printing" checked={settings.allowPrinting} onChange={v => change({ allowPrinting: v })} />
                <SecurePermissionToggle label="Allow Copying" checked={settings.allowCopying} onChange={v => change({ allowCopying: v })} />
                <SecurePermissionToggle label="Allow Editing" checked={settings.allowEditing} onChange={v => change({ allowEditing: v })} />
                <SecurePermissionToggle label="Allow Comments" checked={settings.allowComments} onChange={v => change({ allowComments: v })} />
              </ConversionPanelSection>
              <SecureSecuritySummary
                strength={settings.encryptionStrength}
                permissions={[settings.allowPrinting, settings.allowCopying, settings.allowEditing, settings.allowComments]}
                isSet={settings.password.length > 0 && passwordsMatch}
              />
            </>
          )}

          {/* ── DECRYPT ── */}
          {(isDecrypt) && (
            <>
              <ConversionPanelSection title="Enter Password">
                <SecurePasswordField
                  label="Password"
                  value={settings.password}
                  show={showPassword}
                  onToggleShow={() => setShowPassword(p => !p)}
                  onChange={v => change({ password: v })}
                  placeholder="Enter PDF password..."
                />
              </ConversionPanelSection>
              <ConversionPanelSection title="Encryption Details">
                <SecureStatusCard
                  icon={<Shield size={16} />}
                  title="Encrypted PDF Detected"
                  desc="This PDF is encrypted. Enter the owner or user password to decrypt."
                  color="#a78bfa"
                />
              </ConversionPanelSection>
              <ConversionPanelSection title="Security Summary">
                <ConversionDetail label="File name" value={file.name.length > 22 ? file.name.slice(0, 20) + "…" : file.name} />
                <ConversionDetail label="File size" value={formatBytes(file.size)} />
                <ConversionDetail label="Total pages" value={file.loading ? "Preparing..." : String(pageCount)} />
                <ConversionDetail label="Encryption" value="AES-256" />
              </ConversionPanelSection>
            </>
          )}

          {/* File details — always shown */}
          <ConversionPanelSection title="File Details">
            <ConversionDetail label="File name" value={file.name.length > 22 ? file.name.slice(0, 20) + "…" : file.name} />
            <ConversionDetail label="File size" value={formatBytes(file.size)} />
            <ConversionDetail label="Total pages" value={file.loading ? "Preparing..." : String(pageCount)} />
            <ConversionDetail label="Format" value={tool.outputFormat ?? "PDF"} />
          </ConversionPanelSection>
        </div>

        {/* Sticky CTA */}
        <div className="convert-cta sticky bottom-0 shrink-0 border-t p-4" style={{ background: "var(--dn-bg-card)", borderColor: "var(--dn-border)" }}>
          {!passwordsMatch && (
            <p className="mb-3 flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold" style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.22)" }}>
              <AlertCircle size={13} /> Passwords do not match
            </p>
          )}
          {(isLock || isEncrypt) && settings.password.length === 0 && (
            <p className="mb-3 flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold" style={{ background: "rgba(251,191,36,0.08)", color: "#f59e0b", border: "1px solid rgba(251,191,36,0.22)" }}>
              <AlertCircle size={13} /> Enter a password to continue
            </p>
          )}
          {(isUnlock || isDecrypt) && settings.password.length === 0 && (
            <p className="mb-3 flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold" style={{ background: "rgba(251,191,36,0.08)", color: "#f59e0b", border: "1px solid rgba(251,191,36,0.22)" }}>
              <AlertCircle size={13} /> Enter the PDF password to continue
            </p>
          )}
          <button
            type="button"
            onClick={onProcess}
            disabled={!canProcess}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-lg font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: canProcess ? "#2563eb" : "var(--dn-bg-subtle)", color: canProcess ? "#fff" : "var(--dn-t3)" }}
            onMouseOver={e => { if (canProcess) e.currentTarget.style.background = "#1d4ed8"; }}
            onMouseOut={e => { if (canProcess) e.currentTarget.style.background = "#2563eb"; }}
          >
            {status === "processing" ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <tool.icon size={18} />
                {tool.action}
                <ArrowRight size={18} />
              </>
            )}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs" style={{ color: "var(--dn-t4)" }}>
            <Lock size={11} /> Your files are encrypted and never stored permanently
          </p>
        </div>
      </aside>
    </div>
  );
}

/* ── Secure PDF helper atoms ── */

function SecurePasswordField({
  label,
  value,
  show,
  onToggleShow,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  show: boolean;
  onToggleShow: () => void;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <ConversionLabel>{label}</ConversionLabel>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="new-password"
          className="h-10 w-full rounded-md pr-10 pl-3 text-sm outline-none transition"
          style={{
            border: `1px solid ${error ? "#ef4444" : "var(--dn-border)"}`,
            background: "var(--dn-bg-subtle)",
            color: "var(--dn-t1)",
          }}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition"
          style={{ color: "var(--dn-t4)" }}
          onMouseOver={e => e.currentTarget.style.color = "var(--dn-t1)"}
          onMouseOut={e => e.currentTarget.style.color = "var(--dn-t4)"}
        >
          {show ? <EyeOff size={15} /> : <EyeIcon size={15} />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>{error}</p>}
    </div>
  );
}

function SecurePermissionToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 py-1 text-left text-sm font-medium transition"
      style={{ color: "var(--dn-t1)" }}
    >
      <span>{label}</span>
      <span
        className="relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors"
        style={{ background: checked ? "#2563eb" : "var(--dn-border)" }}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all"
          style={{ left: checked ? "18px" : "2px" }}
        />
      </span>
    </button>
  );
}

function SecureSecuritySummary({
  strength,
  permissions,
  isSet,
}: {
  strength: string;
  permissions: boolean[];
  isSet: boolean;
}) {
  const permLabels = ["Print", "Copy", "Edit", "Comment"];
  const allowedCount = permissions.filter(Boolean).length;
  return (
    <ConversionPanelSection title="Security Summary">
      <div
        className="rounded-lg p-3 text-xs"
        style={{
          background: isSet ? "rgba(34,197,94,0.07)" : "rgba(251,191,36,0.06)",
          border: `1px solid ${isSet ? "rgba(34,197,94,0.22)" : "rgba(251,191,36,0.22)"}`,
        }}
      >
        <div className="mb-2 flex items-center gap-2 font-semibold" style={{ color: isSet ? "#22c55e" : "#f59e0b" }}>
          <ShieldCheck size={14} />
          {isSet ? "Password set — ready to secure" : "No password set yet"}
        </div>
        <div className="space-y-1" style={{ color: "var(--dn-t3)" }}>
          <div className="flex justify-between">
            <span>Encryption</span>
            <span className="font-semibold" style={{ color: "var(--dn-t1)" }}>{strength}</span>
          </div>
          <div className="flex justify-between">
            <span>Permissions</span>
            <span className="font-semibold" style={{ color: "var(--dn-t1)" }}>
              {allowedCount === 0 ? "None" : allowedCount === permissions.length ? "All" : permLabels.filter((_, i) => permissions[i]).join(", ")}
            </span>
          </div>
        </div>
      </div>
    </ConversionPanelSection>
  );
}

function SecureStatusCard({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <div
      className="flex items-start gap-3 rounded-lg p-3 text-sm"
      style={{
        background: `${color}12`,
        border: `1px solid ${color}35`,
      }}
    >
      <span className="mt-0.5 flex-shrink-0" style={{ color }}>{icon}</span>
      <div>
        <p className="mb-0.5 font-semibold" style={{ color: "var(--dn-t1)" }}>{title}</p>
        <p className="text-xs leading-relaxed" style={{ color: "var(--dn-t3)" }}>{desc}</p>
      </div>
    </div>
  );
}

/* ─── end SecurePdfWorkspace ─── */

/* ═══════════════════════════════════════════════════════════════
   OCR WORKSPACE
   Pre-processing review page for: PDF OCR, Image OCR
   ═══════════════════════════════════════════════════════════════ */

function OcrWorkspace({
  tool,
  file,
  items,
  settings,
  status,
  onSettingsChange,
  onProcess,
  onClear,
  onBack,
}: {
  tool: Tool;
  file: WorkflowFile;
  items: PreviewItem[];
  settings: ToolSettings;
  status: WorkflowStatus;
  onSettingsChange: (patch: Partial<ToolSettings>) => void;
  onProcess: () => void;
  onClear: () => void;
  onBack?: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const previewItems = items.length ? items : fallbackPreviewItems(file, tool);
  const pageCount = Math.max(previewItems.length, file.loading ? 0 : 1);

  const isImageOcr = tool.id === "image-ocr";
  const unitLabel = isImageOcr ? (pageCount === 1 ? "image" : "images") : (pageCount === 1 ? "page" : "pages");
  const badgeText = isImageOcr ? "Ready for Image OCR" : "Ready for OCR";
  const ctaLabel = isImageOcr ? "Run Image OCR" : "Run PDF OCR";
  const useCustomRange = settings.conversionMode === "range";

  useEffect(() => {
    setActiveIndex(0);
    setZoom(100);
    pageRefs.current.clear();
  }, [file.id]);

  useEffect(() => {
    const root = viewerRef.current;
    if (!root || previewItems.length <= 1) return;
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) =>
          Math.abs(a.boundingClientRect.top - root.getBoundingClientRect().top) -
          Math.abs(b.boundingClientRect.top - root.getBoundingClientRect().top)
        );
      const nextIndex = Number((visible[0]?.target as HTMLElement | undefined)?.dataset.previewIndex);
      if (Number.isFinite(nextIndex)) setActiveIndex(nextIndex);
    }, { root, threshold: [0.28, 0.5, 0.72], rootMargin: "-18% 0px -58% 0px" });
    pageRefs.current.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [file.id, previewItems.length]);

  const change = (patch: Partial<ToolSettings>) => onSettingsChange(patch);
  const canProcess = status !== "processing" && !file.loading;

  return (
    <div
      className="convert-page grid h-[calc(100vh-60px)] w-full grid-cols-1 overflow-hidden xl:grid-cols-[minmax(0,1fr)_320px]"
      style={{ color: "var(--dn-t1)" }}
    >
      {/* ── CENTER ── */}
      <main className="preview-workspace flex h-[calc(100vh-60px)] min-w-0 flex-col overflow-hidden px-5 py-4">

        <ToolWorkspaceHeader
          tool={tool}
          onBack={onBack ?? onClear}
          countLabel={file.loading ? "Preparing..." : `${pageCount} ${unitLabel}`}
          fileName={file.name}
          fileSize={file.size}
          badge={{ text: badgeText, color: "#22d3ee", bg: "rgba(6,182,212,0.12)", icon: <ScanLine size={13} /> }}
        />

        {/* Two-column inner layout: thumbnails + preview */}
        <section className="grid min-h-0 flex-1 gap-5 overflow-hidden lg:grid-cols-[160px_minmax(0,1fr)]">

          {/* Left thumbnail strip */}
          <aside className="flex min-h-0 min-w-0 flex-col">
            <div className="mb-3 flex shrink-0 items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: "var(--dn-t1)" }}>{isImageOcr ? "Images" : "Pages"}</h3>
              <span className="text-sm font-semibold" style={{ color: "var(--dn-t3)" }}>
                {file.loading ? "..." : pageCount}
              </span>
            </div>
            <div className="thumbnail-scroll grid auto-rows-max content-start min-h-0 flex-1 gap-4 overflow-y-auto pr-2">
              {previewItems.map((item, index) => {
                const active = index === activeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveIndex(index);
                      pageRefs.current.get(index)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="thumbnail-item transition-colors"
                    style={{ color: active ? "#3b82f6" : "var(--dn-t2)" }}
                  >
                    <div className={active ? "active-thumbnail" : ""} style={{ borderRadius: "8px", overflow: "hidden", background: "#fff", border: "1px solid var(--dn-border)", boxShadow: "var(--dn-shadow)" }}>
                      <PreviewSurface item={item} isThumbnail />
                    </div>
                    <p className="mt-2 truncate text-xs font-semibold">{item.label}</p>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Center preview canvas */}
          <section className="relative flex min-h-0 min-w-0 flex-col">
            <div
              ref={viewerRef}
              className="document-viewer flex min-h-0 flex-1 items-start justify-center overflow-auto p-8"
              style={{ background: "var(--dn-preview-bg)" }}
            >
              <div style={{ width: Math.max(360, zoom * 7), flexShrink: 0, display: "grid", gap: "2rem", justifyItems: "center", alignContent: "start", transition: "width 0.2s ease" }}>
                {previewItems.length
                  ? previewItems.map((item, index) => (
                      <div
                        key={item.id}
                        data-preview-index={index}
                        ref={el => { if (el) pageRefs.current.set(index, el); else pageRefs.current.delete(index); }}
                        style={{ width: "100%", boxShadow: "var(--dn-page-shadow)", scrollMarginTop: 16 }}
                      >
                        <PreviewSurface item={item} />
                      </div>
                    ))
                  : <EmptyPanel text="Preview is preparing." />}
              </div>
            </div>

            {/* Floating zoom controls */}
            <div
              className="absolute bottom-6 left-1/2 z-20 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 flex-nowrap items-center justify-center gap-2 overflow-x-auto whitespace-nowrap"
              style={{ background: "transparent", boxShadow: "none" }}
            >
              <ConversionToolButton label="Zoom out" icon={<ZoomOut size={16} />} compact onClick={() => setZoom(prev => Math.max(50, prev - 10))} />
              <button type="button" className="dn-glassmorphism-button h-10 min-w-[60px] whitespace-nowrap rounded-[4px] border px-4 text-sm font-extrabold transition-colors" style={{ color: "rgba(255,255,255,0.95)" }}>
                {zoom}%
              </button>
              <ConversionToolButton label="Zoom in" icon={<ZoomIn size={16} />} compact onClick={() => setZoom(prev => Math.min(180, prev + 10))} />
              <div className="mx-1 h-5 w-px" style={{ background: "rgba(255,255,255,0.18)" }} />
              <span className="inline-flex h-10 items-center rounded-[4px] border px-4 text-xs font-semibold whitespace-nowrap" style={{ borderColor: "rgba(255,255,255,0.14)", background: "rgba(15,23,42,0.55)", color: "rgba(255,255,255,0.7)" }}>
                {activeIndex + 1} / {pageCount}
              </span>
            </div>
          </section>
        </section>
      </main>

      {/* ── RIGHT SIDEBAR ── */}
      <aside
        className="settings-sidebar flex h-[calc(100vh-60px)] min-h-0 flex-col overflow-hidden border-l xl:sticky xl:top-[60px]"
        style={{ background: "var(--dn-bg-card)", borderColor: "var(--dn-border)" }}
      >
        {/* Sidebar header */}
        <div className="flex shrink-0 items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--dn-border)" }}>
          <div className="grid h-10 w-10 place-items-center rounded-lg" style={{ background: `${tool.color}22`, color: tool.color }}>
            <tool.icon size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold" style={{ color: "var(--dn-t1)" }}>{tool.label}</h3>
            <p className="mt-0.5 truncate text-xs" style={{ color: "var(--dn-t3)" }}>{tool.desc}</p>
          </div>
        </div>

        {/* Scrollable settings */}
        <div className="settings-content min-h-0 flex-1 overflow-y-auto">

          <ConversionPanelSection title="OCR Language">
            <OcrSelect
              value={settings.ocrLang}
              onChange={v => change({ ocrLang: v })}
              options={ocrLanguages}
            />
          </ConversionPanelSection>

          {/* ── PDF OCR ── */}
          {!isImageOcr && (
            <>
              <ConversionPanelSection title="Output Format">
                <OcrSelect
                  value={settings.ocrOutput}
                  onChange={v => change({ ocrOutput: v })}
                  options={[
                    { value: "txt", label: "Plain Text (.txt)" },
                    { value: "pdf", label: "Searchable PDF (.pdf)" },
                    { value: "docx", label: "Word Document (.docx)" },
                  ]}
                />
              </ConversionPanelSection>

              <ConversionPanelSection title="Recognition">
                <ConversionToggle label="Recognize text" checked={settings.ocrRecognizeText} onChange={v => change({ ocrRecognizeText: v })} />
                <ConversionToggle label="Preserve layout" checked={settings.preserveLayout} onChange={v => change({ preserveLayout: v })} />
                <ConversionToggle label="Searchable PDF" checked={settings.ocrSearchablePdf} onChange={v => change({ ocrSearchablePdf: v })} />
              </ConversionPanelSection>

              <ConversionPanelSection title="Page Range">
                <ConversionRadio label="All pages" checked={!useCustomRange} onClick={() => change({ conversionMode: "all", pageRange: "" })} />
                <ConversionRadio label="Custom range" checked={useCustomRange} onClick={() => change({ conversionMode: "range" })} />
                <input
                  value={settings.pageRange}
                  placeholder="e.g. 1-3, 5, 8-10"
                  onChange={e => change({ conversionMode: "range", pageRange: e.target.value })}
                  className="mt-1 h-10 w-full rounded-md px-3 text-sm outline-none transition"
                  style={{ border: `1px solid ${useCustomRange ? "#3b82f6" : "var(--dn-border)"}`, background: "var(--dn-bg-subtle)", color: "var(--dn-t1)" }}
                />
              </ConversionPanelSection>
            </>
          )}

          {/* ── IMAGE OCR ── */}
          {isImageOcr && (
            <>
              <ConversionPanelSection title="Image Processing">
                <ConversionToggle label="Image enhancement" checked={settings.ocrImageEnhancement} onChange={v => change({ ocrImageEnhancement: v })} />
                <ConversionToggle label="Auto rotate" checked={settings.ocrAutoRotate} onChange={v => change({ ocrAutoRotate: v })} />
              </ConversionPanelSection>

              <ConversionPanelSection title="Text Detection Mode">
                {([
                  { value: "auto", label: "Automatic" },
                  { value: "sparse", label: "Sparse text" },
                  { value: "dense", label: "Dense / block text" },
                  { value: "single-line", label: "Single line" },
                ] as const).map(m => (
                  <ConversionRadio
                    key={m.value}
                    label={m.label}
                    checked={settings.ocrTextDetectionMode === m.value}
                    onClick={() => change({ ocrTextDetectionMode: m.value })}
                  />
                ))}
              </ConversionPanelSection>

              <ConversionPanelSection title="Output Format">
                <OcrSelect
                  value={settings.ocrOutput}
                  onChange={v => change({ ocrOutput: v })}
                  options={[
                    { value: "txt", label: "Plain Text (.txt)" },
                    { value: "pdf", label: "Searchable PDF (.pdf)" },
                  ]}
                />
              </ConversionPanelSection>
            </>
          )}

          {/* File details */}
          <ConversionPanelSection title="File Details">
            <ConversionDetail label="File name" value={file.name.length > 22 ? file.name.slice(0, 20) + "…" : file.name} />
            <ConversionDetail label="File size" value={formatBytes(file.size)} />
            <ConversionDetail label={isImageOcr ? "Total images" : "Total pages"} value={file.loading ? "Preparing..." : String(pageCount)} />
            <ConversionDetail label="Language" value={ocrLanguages.find(l => l.value === settings.ocrLang)?.label ?? settings.ocrLang} />
          </ConversionPanelSection>
        </div>

        {/* Sticky CTA */}
        <div className="convert-cta sticky bottom-0 shrink-0 border-t p-4" style={{ background: "var(--dn-bg-card)", borderColor: "var(--dn-border)" }}>
          <button
            type="button"
            onClick={onProcess}
            disabled={!canProcess}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-lg font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: canProcess ? "#2563eb" : "var(--dn-bg-subtle)", color: canProcess ? "#fff" : "var(--dn-t3)" }}
            onMouseOver={e => { if (canProcess) e.currentTarget.style.background = "#1d4ed8"; }}
            onMouseOut={e => { if (canProcess) e.currentTarget.style.background = "#2563eb"; }}
          >
            {status === "processing" ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <ScanLine size={18} />
                {ctaLabel}
                <ArrowRight size={18} />
              </>
            )}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs" style={{ color: "var(--dn-t4)" }}>
            <CheckCircle2 size={11} /> File ready for processing
          </p>
        </div>
      </aside>
    </div>
  );
}

function OcrSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-11 w-full appearance-none rounded-md border px-3 pr-9 text-sm font-semibold outline-none transition focus:border-blue-500"
        style={{ background: "var(--dn-bg-subtle)", borderColor: "var(--dn-border)", color: "var(--dn-t1)" }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} style={{ background: "var(--dn-bg-card)", color: "var(--dn-t1)" }}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--dn-t3)" }} />
    </div>
  );
}

/* ─── end OcrWorkspace ─── */

function SingleFileConversionPreview({
  tool,
  file,
  items,
  settings,
  status,
  onSettingsChange,
  onConvert,
  onBack,
}: {
  tool: Tool;
  file: WorkflowFile;
  items: PreviewItem[];
  settings: ToolSettings;
  status: WorkflowStatus;
  onSettingsChange: (patch: Partial<ToolSettings>) => void;
  onConvert: () => void;
  onBack?: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [outputName, setOutputName] = useState(stripExtension(file.name));
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const hasError = Boolean(file.error);
  const previewItems = items.length ? items : (hasError || file.loading ? [] : fallbackPreviewItems(file, tool));
  const pageCount = Math.max(previewItems.length, file.loading || hasError ? 0 : 1);
  const output = conversionOutputMeta(tool);
  const estimatedRatio = tool.id.includes("jpg") || tool.id.includes("image") ? 1.18 : tool.id.includes("pdf") ? 0.72 : 0.86;

  useEffect(() => {
    setActiveIndex(0);
    setZoom(100);
    setRotation(0);
    setOutputName(stripExtension(file.name));
    pageRefs.current.clear();
  }, [file.id, file.name]);

  useEffect(() => {
    const root = viewerRef.current;
    if (!root || previewItems.length <= 1) return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => Math.abs(a.boundingClientRect.top - root.getBoundingClientRect().top) - Math.abs(b.boundingClientRect.top - root.getBoundingClientRect().top));
      const nextIndex = Number((visible[0]?.target as HTMLElement | undefined)?.dataset.previewIndex);
      if (Number.isFinite(nextIndex)) setActiveIndex(nextIndex);
    }, { root, threshold: [0.28, 0.5, 0.72], rootMargin: "-18% 0px -58% 0px" });

    pageRefs.current.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [file.id, previewItems.length]);

  const changeSettings = (patch: Partial<ToolSettings>) => onSettingsChange(patch);
  const useCustomRange = settings.conversionMode === "range";
  const pageLabel = file.loading ? "Preparing..." : pageCount + (pageCount === 1 ? " page" : " pages");

  return (
    <div className="convert-page grid h-[calc(100vh-60px)] w-full grid-cols-1 overflow-hidden xl:grid-cols-[minmax(0,1fr)_320px]" style={{ color: "var(--dn-t1)" }}>
      <main className="preview-workspace flex h-[calc(100vh-60px)] min-w-0 flex-col overflow-hidden px-5 py-4">
        <ToolWorkspaceHeader
          tool={tool}
          onBack={onBack}
          countLabel={pageLabel}
          fileName={file.name}
          fileSize={file.size}
          badge={{ text: "Ready to convert", color: "#22c55e", bg: "rgba(34,197,94,0.11)", icon: <CheckCircle2 size={13} /> }}
        />

        <section className="grid min-h-0 flex-1 gap-5 overflow-hidden lg:grid-cols-[160px_minmax(0,1fr)]">
          <aside className="flex min-h-0 min-w-0 flex-col">
            <div className="mb-3 flex shrink-0 items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: "var(--dn-t1)" }}>Pages</h3>
              <span className="text-sm font-semibold" style={{ color: "var(--dn-t3)" }}>{file.loading ? "..." : pageCount}</span>
            </div>
            <div className="thumbnail-scroll grid auto-rows-max content-start min-h-0 flex-1 gap-4 overflow-y-auto pr-2">
              {previewItems.map((item, index) => {
                const selected = index === activeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveIndex(index);
                      pageRefs.current.get(index)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="thumbnail-item transition-colors"
                    style={{
                      color: selected ? "#3b82f6" : "var(--dn-t2)",
                    }}
                  >
                    <div className={selected ? "active-thumbnail" : ""} style={{ borderRadius: "8px", overflow: "hidden", background: "#fff", border: "1px solid var(--dn-border)", boxShadow: "var(--dn-shadow)" }}>
                      <PreviewSurface item={item} isThumbnail={true} />
                    </div>
                    <p className="mt-2 truncate text-xs font-semibold">{item.label}</p>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="relative flex min-h-0 min-w-0 flex-col">
            <div ref={viewerRef} className="document-viewer flex min-h-0 flex-1 items-start justify-center overflow-auto p-8" style={{ background: "var(--dn-preview-bg)" }}>
              <div style={{ width: Math.max(360, zoom * 7), flexShrink: 0, display: "grid", gap: "2rem", justifyItems: "center", alignContent: "start", transition: "width 0.2s ease" }}>
                {hasError ? (
                  <PreviewErrorPanel message={file.error || "Preview could not be generated."} />
                ) : file.loading ? (
                  <PreviewLoadingPanel name={file.name} status={file.previewStatus} />
                ) : previewItems.length ? previewItems.map((item, index) => (
                  <div
                    key={item.id}
                    data-preview-index={index}
                    ref={element => {
                      if (element) pageRefs.current.set(index, element);
                      else pageRefs.current.delete(index);
                    }}
                    style={{ width: "100%", transform: "rotate(" + rotation + "deg)", transition: "transform 0.2s ease", boxShadow: "var(--dn-page-shadow)", scrollMarginTop: 16 }}
                  >
                    <PreviewSurface item={item} />
                  </div>
                )) : <EmptyPanel text="Preview is preparing." />}
              </div>
            </div>

            <div
              className="absolute bottom-6 left-1/2 z-20 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 flex-nowrap items-center justify-center gap-2 overflow-x-auto whitespace-nowrap bg-transparent"
              style={{ background: "transparent", boxShadow: "none", backdropFilter: "none", WebkitBackdropFilter: "none" }}
            >
              <ConversionToolButton label="Zoom out" icon={<ZoomOut size={16} />} compact onClick={() => setZoom(prev => Math.max(50, prev - 10))} />
              <button type="button" className="dn-glassmorphism-button h-10 min-w-[60px] whitespace-nowrap rounded-[4px] border px-4 text-sm font-extrabold transition-colors">{zoom}%</button>
              <ConversionToolButton label="Zoom in" icon={<ZoomIn size={16} />} compact onClick={() => setZoom(prev => Math.min(180, prev + 10))} />
              <ConversionToolButton label="Rotate left" icon={<RotateCcw size={17} />} onClick={() => setRotation(prev => prev - 90)} />
              <ConversionToolButton label="Rotate right" icon={<RotateCw size={17} />} onClick={() => setRotation(prev => prev + 90)} />
              <ConversionToolButton label="Extract text" icon={<Download size={17} />} onClick={() => changeSettings({ preserveLayout: false, extractMode: "text" })} />
            </div>
          </section>
        </section>
      </main>

      <aside className="settings-sidebar flex h-[calc(100vh-60px)] min-h-0 flex-col overflow-hidden border-l xl:sticky xl:top-[60px]" style={{ background: "var(--dn-bg-card)", borderColor: "var(--dn-border)" }}>
        <div className="settings-content min-h-0 flex-1 overflow-y-auto">
          <ConversionPanelSection title="Conversion Settings">
            <ConversionLabel>Output format</ConversionLabel>
            <ConversionSelect value={output.formatLabel} />
            <ConversionToggle label="Preserve layout" checked={settings.preserveLayout} onChange={value => changeSettings({ preserveLayout: value })} />
            <ConversionToggle label="Extract text if possible" checked={settings.extractMode === "text" || !settings.preserveLayout} onChange={value => changeSettings({ extractMode: value ? "text" : "tables", preserveLayout: !value })} />
          </ConversionPanelSection>

          <ConversionPanelSection title="Page Range">
            <ConversionRadio label="All pages" checked={!useCustomRange} onClick={() => changeSettings({ conversionMode: "all", pageRange: "" })} />
            <ConversionRadio label="Custom range" checked={useCustomRange} onClick={() => changeSettings({ conversionMode: "range" })} />
            <input
              value={settings.pageRange}
              placeholder="e.g. 1-3, 5, 8-10"
              onChange={event => changeSettings({ conversionMode: "range", pageRange: event.target.value })}
              className="mt-3 h-10 w-full rounded-md border px-3 text-sm outline-none transition-colors"
              style={{ background: "var(--dn-bg-subtle)", borderColor: useCustomRange ? "#3b82f6" : "var(--dn-border)", color: "var(--dn-t1)" }}
            />
          </ConversionPanelSection>

          <ConversionPanelSection title="Output Settings">
            <ConversionLabel>Save to</ConversionLabel>
            <ConversionSelect value="Original folder" />
            <ConversionLabel>File name</ConversionLabel>
            <input
              value={outputName}
              onChange={event => setOutputName(event.target.value)}
              className="h-10 w-full rounded-md border px-3 text-sm outline-none transition-colors"
              style={{ background: "var(--dn-bg-subtle)", borderColor: "var(--dn-border)", color: "var(--dn-t1)" }}
            />
          </ConversionPanelSection>

          <ConversionPanelSection title="File Details">
            <ConversionDetail label="File size" value={formatBytes(file.size)} />
            <ConversionDetail label="Total pages" value={file.loading ? "Preparing..." : String(pageCount)} />
            <ConversionDetail label="Estimated output" value={"~ " + formatBytes(Math.max(1, file.size * estimatedRatio))} />
          </ConversionPanelSection>
        </div>

        <div className="convert-cta sticky bottom-0 shrink-0 border-t p-4" style={{ background: "var(--dn-bg-card)", borderColor: "var(--dn-border)" }}>
          <button
            type="button"
            onClick={onConvert}
            disabled={status === "processing"}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-blue-600 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "processing" ? <Loader2 size={20} className="animate-spin" /> : output.cta}
            {status !== "processing" && <ArrowRight size={20} />}
          </button>
        </div>
      </aside>
    </div>
  );
}

type EditorToolKey = "edit" | "annotate" | "add-text" | "add-image" | "highlight" | "draw" | "crop" | "redact" | "watermark" | "page-numbers";

const editorToolTabs: Array<{ id: EditorToolKey; label: string; icon: React.ReactNode }> = [
  { id: "edit", label: "Edit Text", icon: <Type size={17} /> },
  { id: "annotate", label: "Annotate", icon: <PenLine size={17} /> },
  { id: "add-text", label: "Add Text", icon: <Type size={17} /> },
  { id: "add-image", label: "Add Image", icon: <ImageIcon size={17} /> },
  { id: "highlight", label: "Highlight", icon: <Highlighter size={17} /> },
  { id: "draw", label: "Draw", icon: <PenLine size={17} /> },
  { id: "crop", label: "Crop", icon: <Crop size={17} /> },
  { id: "redact", label: "Redact", icon: <Eraser size={17} /> },
  { id: "watermark", label: "Watermark", icon: <Droplet size={17} /> },
  { id: "page-numbers", label: "Page Numbers", icon: <Hash size={17} /> },
];

type EditorLayer = {
  id: string;
  pageIndex: number;
  type: EditorToolKey;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  text: string;
  color: string;
  opacity: number;
  fontSize?: number;
  font?: string;
  align?: "left" | "center" | "right" | "justify";
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  brushSize?: number;
  temporary?: boolean;
  applied?: boolean;
};

function PdfEditorPreviewWorkspace({
  tool,
  file,
  items,
  status,
  onSave,
  onClear,
  onBack,
  onSettingsChange,
}: {
  tool: Tool;
  file: WorkflowFile;
  items: PreviewItem[];
  status: WorkflowStatus;
  onSave: (settingsOverride?: Partial<ToolSettings>) => void;
  onClear: () => void;
  onBack?: () => void;
  onSettingsChange: (patch: Partial<ToolSettings>) => void;
}) {
  const [activeTool, setActiveTool] = useState<EditorToolKey>(() => editorToolFromToolId(tool.id));
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  // Draw sub-mode: "brush" paints new strokes, "eraser" removes nearby ink.
  const [drawMode, setDrawMode] = useState<"brush" | "eraser">("brush");
  // Editor canvas keeps a fixed normalized width (680) and a height that
  // matches the real page aspect ratio, so the page is shown at its true
  // proportions (no white border / no stretch) and edits map 1:1 to export.
  const [pageHeight, setPageHeight] = useState(900);
  const [layers, setLayers] = useState<EditorLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [history, setHistory] = useState<EditorLayer[][]>([]);
  const [future, setFuture] = useState<EditorLayer[][]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const editSnapshotRef = useRef<EditorLayer[] | null>(null);
  const pages = items.length ? items : fallbackPreviewItems(file, tool);
  const activeItem = pages[activeIndex] || pages[0];
  const pageCount = file.loading ? 0 : Math.max(pages.length, 1);

  const pushHistory = useCallback((snapshot: EditorLayer[]) => {
    setHistory(prev => {
      const lastSnapshot = prev[prev.length - 1];
      if (lastSnapshot && editorSnapshotsEqual(lastSnapshot, snapshot)) return prev;
      return [...prev, snapshot].slice(-40);
    });
    setFuture([]);
    setIsDirty(true);
  }, []);

  const commitLayers = useCallback((updater: (current: EditorLayer[]) => EditorLayer[]) => {
    setLayers(current => {
      const next = updater(current);
      if (next !== current) pushHistory(current);
      return next;
    });
  }, [pushHistory]);

  const removeTemporaryLayers = useCallback((current: EditorLayer[]) => (
    current.filter(layer => {
      if (!layer.temporary) return true;
      if (layer.type !== "draw") return false;
      return parseDrawPaths(layer.text).some(path => path.length > 1);
    }).map(layer => layer.temporary ? { ...layer, temporary: false } : layer)
  ), []);

  const ensureLayerForTool = useCallback((toolKey: EditorToolKey, pageIndex: number) => {
    setLayers(current => {
      const existing = current.find(layer => layer.pageIndex === pageIndex && layer.type === toolKey && !(layer.type === "crop" && layer.applied));
      if (existing) {
        setSelectedLayerId(existing.id);
        return current;
      }
      const nextLayer = createEditorLayer(toolKey, pageIndex, true, pageHeight);
      setSelectedLayerId(nextLayer.id);
      return [...current, nextLayer];
    });
  }, [pageHeight]);

  const commitSelectedLayerForExport = useCallback((source: EditorLayer[]) => (
    source.map(layer => {
      if (layer.id !== selectedLayerId) return layer;
      return { ...layer, temporary: false, applied: layer.type === "crop" ? true : layer.applied };
    })
  ), [selectedLayerId]);

  const exportableLayers = useCallback((source: EditorLayer[]) => (
    source.filter(layer => !layer.temporary || layer.applied)
  ), []);

  const saveEditor = useCallback(() => {
    const committedLayers = commitSelectedLayerForExport(layers);
    const editorLayers = JSON.stringify(exportableLayers(committedLayers));
    setLayers(committedLayers);
    onSettingsChange({ editorLayers, editTool: activeTool });
    window.setTimeout(() => onSave({ editorLayers, editTool: activeTool }), 0);
  }, [activeTool, commitSelectedLayerForExport, exportableLayers, layers, onSave, onSettingsChange]);

  useEffect(() => {
    const next = editorToolFromToolId(tool.id);
    // Start with NO layers so the preview shows only the original PDF page —
    // no placeholder text block / dashed border layered on top. A layer is
    // created lazily when the user actually engages a tool (see switchTool).
    setActiveTool(next);
    setActiveIndex(0);
    setZoom(100);
    setLayers([]);
    setSelectedLayerId(null);
    setHistory([]);
    setFuture([]);
    setIsDirty(false);
    onSettingsChange({ editTool: next });
  }, [file.id, tool.id]);

  // Keep the export canvas height in sync with the measured page aspect ratio
  // so the backend scales the Y axis (page_rect.height / canvasHeight) exactly.
  useEffect(() => {
    onSettingsChange({ editorCanvasHeight: pageHeight });
  }, [pageHeight]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onSettingsChange({ editorLayers: JSON.stringify(exportableLayers(layers)) });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [exportableLayers, layers, onSettingsChange]);

  const switchTool = (next: EditorToolKey) => {
    setDrawMode("brush");
    setActiveTool(next);
    onSettingsChange({ editTool: next });
    setLayers(current => {
      const cleaned = removeTemporaryLayers(current);
      const existing = cleaned.find(layer => layer.pageIndex === activeIndex && layer.type === next && !(layer.type === "crop" && layer.applied));
      if (existing) {
        setSelectedLayerId(existing.id);
        if (!editorSnapshotsEqual(current, cleaned)) pushHistory(current);
        return cleaned;
      }
      const nextLayer = createEditorLayer(next, activeIndex, true, pageHeight);
      setSelectedLayerId(nextLayer.id);
      pushHistory(current);
      return [...cleaned, nextLayer];
    });
  };

  const undo = useCallback(() => {
    setHistory(prev => {
      if (!prev.length) return prev;
      const previous = prev[prev.length - 1];
      setFuture(next => [layers, ...next].slice(0, 40));
      setLayers(previous);
      setSelectedLayerId(previous[previous.length - 1]?.id || null);
      setIsDirty(true);
      return prev.slice(0, -1);
    });
  }, [layers]);

  const redo = useCallback(() => {
    setFuture(prev => {
      if (!prev.length) return prev;
      const nextLayers = prev[0];
      setHistory(next => [...next, layers].slice(-40));
      setLayers(nextLayers);
      setSelectedLayerId(nextLayers[nextLayers.length - 1]?.id || null);
      setIsDirty(true);
      return prev.slice(1);
    });
  }, [layers]);

  const resetEditor = useCallback(() => {
    const nextLayer = createEditorLayer(editorToolFromToolId(tool.id), activeIndex, true, pageHeight);
    pushHistory(layers);
    setLayers([nextLayer]);
    setSelectedLayerId(nextLayer.id);
    setActiveTool(nextLayer.type);
  }, [activeIndex, layers, pushHistory, tool.id, pageHeight]);

  const patchLayer = useCallback((layerId: string, patch: Partial<EditorLayer>, record = true) => {
    const meaningfulPatch = Object.keys(patch).some(key => !["applied", "temporary"].includes(key));
    const apply = (current: EditorLayer[]) => current.map(layer => layer.id === layerId ? { ...layer, ...patch, ...(meaningfulPatch ? { temporary: false } : {}) } : layer);
    if (record) {
      commitLayers(apply);
    } else {
      setLayers(apply);
      setIsDirty(true);
    }
  }, [commitLayers]);

  // Sidebar controls patch the selected layer. If nothing is selected yet (e.g.
  // right after opening the editor, or after deselecting), create a layer for
  // the active tool on the current page and apply the change to it — so every
  // control works immediately instead of being a dead no-op.
  const patchActiveLayer = useCallback((patch: Partial<EditorLayer>) => {
    setLayers(current => {
      const existing = selectedLayerId ? current.find(layer => layer.id === selectedLayerId) : null;
      pushHistory(current);
      if (existing) {
        return current.map(layer => layer.id === existing.id ? { ...layer, ...patch, temporary: false } : layer);
      }
      const created: EditorLayer = { ...createEditorLayer(activeTool, activeIndex, false, pageHeight), ...patch, temporary: false };
      setSelectedLayerId(created.id);
      return [...current, created];
    });
  }, [activeIndex, activeTool, pageHeight, pushHistory, selectedLayerId]);

  const duplicateLayer = useCallback((layerId = selectedLayerId) => {
    if (!layerId) return;
    commitLayers(current => {
      const source = current.find(layer => layer.id === layerId);
      if (!source) return current;
      const clone = { ...source, id: makeEditorLayerId(source.type), x: source.x + 24, y: source.y + 24, temporary: false, applied: false };
      setSelectedLayerId(clone.id);
      return [...current, clone];
    });
  }, [commitLayers, selectedLayerId]);

  const deleteLayer = useCallback((layerId = selectedLayerId) => {
    if (!layerId) return;
    commitLayers(current => {
      const next = current.filter(layer => layer.id !== layerId);
      setSelectedLayerId(next.find(layer => layer.pageIndex === activeIndex)?.id || null);
      return next;
    });
  }, [activeIndex, commitLayers, selectedLayerId]);

  const rotateLayer = useCallback((layerId = selectedLayerId) => {
    if (!layerId) return;
    commitLayers(current => current.map(layer => layer.id === layerId ? { ...layer, temporary: false, rotation: (layer.rotation + 15) % 360 } : layer));
  }, [commitLayers, selectedLayerId]);

  const applyActiveTool = useCallback(() => {
    setLayers(current => {
      const existing = selectedLayerId ? current.find(layer => layer.id === selectedLayerId) : null;
      pushHistory(current);
      const markApplied = (layer: EditorLayer): EditorLayer => ({ ...layer, temporary: false, applied: layer.type === "crop" ? true : layer.applied });
      if (existing) {
        return current.map(layer => layer.id === existing.id ? markApplied(layer) : layer);
      }
      // Nothing selected — create the active tool's layer and apply it so the
      // Apply button is never a dead no-op.
      const created = markApplied(createEditorLayer(activeTool, activeIndex, false, pageHeight));
      setSelectedLayerId(created.id);
      return [...current, created];
    });
    if (activeTool === "crop") setSelectedLayerId(null);
  }, [activeIndex, activeTool, pageHeight, pushHistory, selectedLayerId]);

  const cancelSelectedTemporary = useCallback(() => {
    if (!selectedLayerId) {
      setSelectedLayerId(null);
      return;
    }
    setLayers(current => {
      const selected = current.find(layer => layer.id === selectedLayerId);
      if (!selected?.temporary) return current;
      return current.filter(layer => layer.id !== selectedLayerId);
    });
    setSelectedLayerId(null);
  }, [selectedLayerId]);

  const beginTextEdit = useCallback(() => {
    editSnapshotRef.current = layers;
  }, [layers]);

  const endTextEdit = useCallback(() => {
    if (editSnapshotRef.current) pushHistory(editSnapshotRef.current);
    editSnapshotRef.current = null;
  }, [pushHistory]);

  const beginLayerDrag = useCallback((event: React.PointerEvent, layerId: string, mode: "move" | "resize") => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedLayerId(layerId);
    const source = layers.find(layer => layer.id === layerId);
    if (!source) return;
    const startSnapshot = layers;
    const startX = event.clientX;
    const startY = event.clientY;
    // Overlay coordinates live in a 680-wide logical space rendered at
    // displayWidth (the same zoom*7 width the conversion preview uses), so a
    // screen-pixel delta converts to logical units by dividing by this factor.
    const scale = editorDisplayWidth(zoom) / 680;
    let moved = false;

    const onMove = (moveEvent: PointerEvent) => {
      moved = true;
      const dx = (moveEvent.clientX - startX) / scale;
      const dy = (moveEvent.clientY - startY) / scale;
      setLayers(current => current.map(layer => {
        if (layer.id !== layerId) return layer;
        if (mode === "resize") {
          return { ...layer, temporary: false, width: Math.max(44, snapToGrid(source.width + dx)), height: Math.max(28, snapToGrid(source.height + dy)) };
        }
        return {
          ...layer,
          temporary: false,
          x: clamp(snapToGrid(source.x + dx), 0, 680 - layer.width),
          y: clamp(snapToGrid(source.y + dy), 0, pageHeight - layer.height),
        };
      }));
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (moved) pushHistory(startSnapshot);
      setIsDirty(moved || isDirty);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, [isDirty, layers, pushHistory, zoom, pageHeight]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const editingText = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveEditor();
        return;
      }
      if (editingText) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undo();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateLayer();
      } else if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteLayer();
      } else if (event.key === "Escape") {
        cancelSelectedTemporary();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cancelSelectedTemporary, deleteLayer, duplicateLayer, redo, saveEditor, undo]);

  const activeLayer = layers.find(layer => layer.id === selectedLayerId) || null;

  return (
    <div className="pdf-editor-page flex h-[calc(100vh-60px)] w-full flex-col overflow-hidden" style={{ background: "transparent", color: "var(--dn-t1)" }}>
      <style>{`
        .pdf-editor-layer {
          transition: box-shadow 0.16s ease, border-color 0.16s ease, background 0.16s ease;
        }
        .pdf-editor-layer:hover {
          box-shadow: 0 0 0 1px rgba(59,130,246,0.45), 0 10px 24px rgba(15,23,42,0.14);
        }
        .ped-tool-tab {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 34px;
          padding: 0 12px;
          border-radius: 6px;
          font-size: 0.8125rem;
          font-weight: 600;
          white-space: nowrap;
          flex-shrink: 0;
          transition: background 0.15s, color 0.15s;
          border: none;
          cursor: pointer;
        }
        .ped-tool-tab-active {
          background: var(--dn-selected-bg);
          color: #3b82f6;
          box-shadow: inset 0 0 0 1px rgba(59,130,246,0.22);
        }
        .ped-tool-tab-inactive {
          background: transparent;
          color: var(--dn-t3);
        }
        .ped-tool-tab-inactive:hover {
          background: var(--dn-bg-subtle);
          color: var(--dn-t1);
        }
        .ped-tool-tab-bar {
          max-width: calc(100% - 28px);
          border: 1px solid var(--dn-toolbar-border);
          border-radius: 6px;
          background: var(--dn-toolbar-bg);
          box-shadow: var(--dn-toolbar-shadow);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
        }
        [data-theme="light"] .ped-tool-tab-bar {
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.92), var(--dn-toolbar-shadow);
        }
        .ped-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 36px;
          padding: 0 10px;
          border-radius: 6px;
          font-size: 0.8125rem;
          font-weight: 600;
          border: 1px solid var(--dn-border);
          background: var(--dn-bg-card);
          color: var(--dn-t2);
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .ped-action-btn:hover:not(:disabled) {
          background: var(--dn-bg-subtle);
          border-color: #3b82f6;
          color: var(--dn-t1);
        }
        .ped-action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .ped-icon-btn {
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          border-radius: 6px;
          border: 1px solid var(--dn-border);
          background: var(--dn-bg-card);
          color: var(--dn-t2);
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .ped-icon-btn:hover:not(:disabled) {
          background: var(--dn-bg-subtle);
          border-color: #3b82f6;
          color: var(--dn-t1);
        }
        .ped-icon-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {/* ── Header: shared standard layout (single tool icon, no file icon) ── */}
      <div className="px-6 pt-2">
        <ToolWorkspaceHeader
          tool={tool}
          onBack={onBack ?? onClear}
          countLabel={file.loading ? "Preparing…" : `${pageCount} ${pageCount === 1 ? "page" : "pages"}`}
          fileName={file.name}
          fileSize={file.size}
          badge={{ text: "Ready to edit", color: "#22c55e", bg: "rgba(34,197,94,0.11)", icon: <Check size={13} /> }}
          fullBleedDivider
          compactSpacing
        />
      </div>

      {/* ── Three-column workspace ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* Left: page thumbnails — transparent so it merges with the main editor
            workspace background (no separate dark block / vertical divider). */}
        <aside
          className="flex w-[176px] shrink-0 flex-col"
          style={{ background: "transparent" }}
        >
          {/* Section header */}
          <div className="flex h-[52px] shrink-0 items-center justify-between px-4" style={{ background: "transparent" }}>
            <h2 className="text-sm font-semibold" style={{ color: "var(--dn-t1)" }}>Pages</h2>
            <span className="text-sm font-medium" style={{ color: "var(--dn-t3)" }}>
              {file.loading ? "…" : pageCount}
            </span>
          </div>

          {/* Thumbnail grid */}
          <div className="pdf-editor-scroll min-h-0 flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-1 gap-4">
              {pages.map((item, index) => {
                const active = index === activeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className="group relative flex flex-col items-center bg-transparent"
                    style={{ border: "none", cursor: "pointer" }}
                  >
                    <div
                      style={{
                        width: "100%",
                        borderRadius: 4,
                        overflow: "hidden",
                        background: "#fff",
                        boxShadow: active
                          ? "0 0 0 2px #2563eb, 0 4px 12px rgba(37,99,235,0.18)"
                          : "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
                      }}
                    >
                      <PreviewSurface item={item} isThumbnail />
                    </div>
                    <span
                      className="mt-2 truncate text-center text-xs font-medium w-full"
                      style={{ color: active ? "#3b82f6" : "var(--dn-t3)" }}
                    >
                      {item.label || `Page ${index + 1}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Center: canvas — transparent so ambient blobs show through */}
        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col items-center overflow-hidden" style={{ background: "var(--dn-preview-bg)" }}>
          <div className="ped-tool-tab-bar pdf-editor-scroll absolute left-1/2 top-3 z-30 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-1.5 overflow-x-auto px-2 py-1.5">
            {editorToolTabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => switchTool(tab.id)}
                className={`ped-tool-tab ${activeTool === tab.id ? "ped-tool-tab-active" : "ped-tool-tab-inactive"}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="pdf-editor-scroll flex h-full min-h-0 w-full flex-col items-center overflow-auto px-8 pb-24 pt-20">
            <EditorCanvasV2
              item={activeItem}
              activeTool={activeTool}
              drawMode={drawMode}
              zoom={zoom}
              canvasHeight={pageHeight}
              onMeasurePage={setPageHeight}
              pageIndex={activeIndex}
              layers={layers}
              selectedLayerId={selectedLayerId}
              onSelectLayer={setSelectedLayerId}
              onPatchLayer={patchLayer}
              onBeginDrag={beginLayerDrag}
              onDuplicateLayer={duplicateLayer}
              onDeleteLayer={deleteLayer}
              onRotateLayer={rotateLayer}
              onCommitSnapshot={pushHistory}
              onTextFocus={beginTextEdit}
              onTextBlur={endTextEdit}
            />
          </div>

          {/* Floating controls — undo/redo + zoom + page counter, over the pages.
              Bottom-bar UI mirrors the convert tool pre-conversion page (glass buttons),
              buttons and behavior unchanged. */}
          <div
            className="absolute bottom-6 left-1/2 z-20 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 flex-nowrap items-center justify-center gap-2 overflow-x-auto whitespace-nowrap"
            style={{ background: "transparent", boxShadow: "none" }}
          >
            <button type="button" aria-disabled={history.length === 0} onClick={undo} title="Undo (Ctrl+Z)" className="dn-glassmorphism-button flex h-10 items-center gap-2 whitespace-nowrap rounded-[4px] border px-3 text-sm font-bold transition-colors">
              <Undo2 size={15} /> Undo
            </button>
            <button type="button" aria-disabled={future.length === 0} onClick={redo} title="Redo (Ctrl+Y)" className="dn-glassmorphism-button flex h-10 items-center gap-2 whitespace-nowrap rounded-[4px] border px-3 text-sm font-bold transition-colors">
              <Redo2 size={15} /> Redo
            </button>
            <div className="mx-1 h-5 w-px shrink-0" style={{ background: "var(--dn-border)" }} />
            <ConversionToolButton label="Zoom out" icon={<Minus size={15} />} compact onClick={() => setZoom(prev => Math.max(60, prev - 10))} />
            <button type="button" className="dn-glassmorphism-button h-10 min-w-[60px] whitespace-nowrap rounded-[4px] border px-4 text-sm font-extrabold transition-colors">{zoom}%</button>
            <ConversionToolButton label="Zoom in" icon={<Plus size={15} />} compact onClick={() => setZoom(prev => Math.min(160, prev + 10))} />
            <ConversionToolButton label="Pan / reset zoom" icon={<Hand size={15} />} compact onClick={() => setZoom(100)} />
            <div className="mx-1 h-5 w-px shrink-0" style={{ background: "var(--dn-border)" }} />
            <span className="dn-glassmorphism-button inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-[4px] border px-4 text-xs font-semibold">
              {activeIndex + 1} / {Math.max(pageCount, 1)}
            </span>
          </div>
        </main>
          </div>
        </div>

        {/* Right: settings sidebar — mirrors Merge PDF right sidebar exactly */}
        <aside
          className="relative z-20 flex h-full min-h-0 w-[320px] shrink-0 flex-col"
          style={{ background: "var(--dn-bg-card)", borderLeft: "1px solid var(--dn-border)" }}
        >
          {/* Active tool header — mirrors Merge PDF "Conversion Settings" section header */}
          <div className="flex h-[60.35px] shrink-0 items-center gap-3 px-5" style={{ borderBottom: "1px solid var(--dn-border)" }}>
            <div
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md"
              style={{ background: "var(--dn-selected-bg)", color: "#3b82f6" }}
            >
              {editorToolTabs.find(t => t.id === activeTool)?.icon}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold" style={{ color: "var(--dn-t1)" }}>{editorPanelTitle(activeTool)}</h2>
              <p className="mt-0.5 truncate text-xs" style={{ color: "var(--dn-t3)" }}>{editorPanelDescription(activeTool)}</p>
            </div>
          </div>

          {/* Scrollable settings body */}
          <div className="pdf-editor-scroll min-h-0 flex-1 overflow-y-auto">

            {/* Tool-specific settings — each EditorPanelSection already has px-5 py-4 + border-b */}
            <EditorSettingsSections
              activeTool={activeTool}
              selectedLayer={activeLayer}
              drawMode={drawMode}
              canvasHeight={pageHeight}
              onDrawModeChange={setDrawMode}
              onPatchSelected={patchActiveLayer}
              onDeleteSelected={() => activeLayer && deleteLayer(activeLayer.id)}
            />

            {/* Selected object properties — mirrors Merge PDF "Output Settings" section */}
            {activeLayer && (
              <section className="px-5 py-4" style={{ borderBottom: "1px solid var(--dn-border)" }}>
                <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--dn-t1)" }}>Selected Object</h3>
                <div className="space-y-3">
                  <EditorColorInput
                    label="Color"
                    value={activeLayer.color || "#0f172a"}
                    onChange={value => patchLayer(activeLayer.id, { color: value })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <EditorNumberField label="X" value={activeLayer.x} onChange={value => patchLayer(activeLayer.id, { x: clamp(value, 0, Math.max(0, 680 - activeLayer.width)) })} />
                    <EditorNumberField label="Y" value={activeLayer.y} onChange={value => patchLayer(activeLayer.id, { y: clamp(value, 0, Math.max(0, pageHeight - activeLayer.height)) })} />
                    <EditorNumberField label="Width" value={activeLayer.width} onChange={value => patchLayer(activeLayer.id, { width: clamp(value, 44, 680) })} />
                    <EditorNumberField label="Height" value={activeLayer.height} onChange={value => patchLayer(activeLayer.id, { height: clamp(value, 28, pageHeight) })} />
                    <EditorNumberField label="Rotate" value={activeLayer.rotation} onChange={value => patchLayer(activeLayer.id, { rotation: value })} />
                    <EditorNumberField label="Opacity %" value={Math.round(activeLayer.opacity * 100)} onChange={value => patchLayer(activeLayer.id, { opacity: clamp(value, 5, 100) / 100 })} />
                  </div>
                </div>
              </section>
            )}

            {/* File details — mirrors Merge PDF "File Details" section */}
            <section className="px-5 py-4">
              <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--dn-t1)" }}>File Details</h3>
              <div className="space-y-2.5">
                <OrganizeDetailRow label="File name" value={file.name.length > 20 ? file.name.slice(0, 18) + "…" : file.name} />
                <OrganizeDetailRow label="File size" value={formatBytes(file.size)} />
                <OrganizeDetailRow label="Total pages" value={file.loading ? "…" : String(pageCount)} />
                <OrganizeDetailRow label="Active tool" value={editorPanelTitle(activeTool) || "—"} />
                <OrganizeDetailRow label="Layers" value={String(layers.filter(l => !l.temporary).length)} />
              </div>
            </section>
          </div>

          {/* Sticky apply/save CTA — mirrors Merge PDF process button area */}
          <div className="z-10 p-5" style={{ background: `linear-gradient(to top, var(--dn-bg-card) 60%, transparent)`, borderTop: "1px solid var(--dn-border)" }}>
            <button
              type="button"
              onClick={applyActiveTool}
              className="flex h-11 w-full items-center justify-center gap-3 rounded-lg bg-blue-700 font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {editorPrimaryAction(activeTool)}
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              onClick={saveEditor}
              disabled={status === "processing"}
              className="mt-3 flex h-11 w-full items-center justify-center gap-3 rounded-lg bg-blue-700 font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "processing" ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Save & Apply
            </button>

            <p className="mt-3 flex items-center justify-center gap-2 text-xs font-medium" style={{ color: "var(--dn-t4)" }}>
              <Lock size={13} />
              Your files are secure and private
            </p>
          </div>
        </aside>
      </div>

    </div>
  );
}

function makeEditorLayerId(type: EditorToolKey) {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function editorSnapshotsEqual(a: EditorLayer[], b: EditorLayer[]) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// The editor renders the PDF page with the SAME pipeline as the conversion
// preview: a width-driven container (this exact formula) holding a natural
// aspect-ratio <img>. Keeping the formula identical means the editor page is
// pixel-for-pixel the same size as the conversion preview at any zoom.
function editorDisplayWidth(zoom: number) {
  return Math.max(360, zoom * 7);
}

// Editor coordinates are normalized to a fixed width (680) and a height that
// matches the page's real aspect ratio (canvasH). Height-dependent defaults are
// expressed as fractions of canvasH so every tool places correctly on portrait
// AND landscape pages instead of being tuned to a hardcoded 900px box.
function createEditorLayer(type: EditorToolKey, pageIndex: number, temporary = true, canvasH = 900): EditorLayer {
  const vy = (fraction: number) => Math.round(canvasH * fraction);
  const base = {
    id: makeEditorLayerId(type),
    type,
    pageIndex,
    rotation: 0,
    color: "#0f172a",
    opacity: 1,
    font: "Helvetica",
    fontSize: 24,
    align: "center" as const,
    bold: false,
    italic: false,
    underline: false,
    brushSize: 5,
    temporary,
    applied: false,
  };
  if (type === "highlight") return { ...base, x: 118, y: vy(0.382), width: 440, height: 36, color: "#facc15", opacity: 0.55, text: "" };
  if (type === "draw") return { ...base, x: 0, y: 0, width: 680, height: canvasH, color: "#2563eb", text: "[]" };
  if (type === "crop") return { ...base, x: 56, y: 64, width: 568, height: Math.max(80, canvasH - 128), text: "" };
  if (type === "redact") return { ...base, x: 156, y: vy(0.467), width: 360, height: 40, text: "" };
  if (type === "watermark") return { ...base, x: 92, y: vy(0.456), width: 500, height: 90, rotation: -24, color: "#2563eb", opacity: 0.22, fontSize: 52, text: "CONFIDENTIAL" };
  if (type === "page-numbers") return { ...base, x: 300, y: Math.max(0, canvasH - 54), width: 92, height: 34, color: "#ffffff", fontSize: 14, text: "Page 1" };
  if (type === "add-image") return { ...base, x: 180, y: vy(0.344), width: 320, height: 180, color: "#2563eb", text: "" };
  if (type === "annotate") return { ...base, x: 138, y: vy(0.291), width: 360, height: 90, color: "#1d4ed8", opacity: 0.95, fontSize: 18, text: "Annotation note" };
  return { ...base, x: 132, y: vy(0.271), width: 416, height: 72, color: "#0f172a", text: type === "add-text" ? "New text" : "Editable text area" };
}

function editorLayerBackground(layer: EditorLayer) {
  if (layer.type === "highlight") return "rgba(250,204,21,0.45)";
  if (layer.type === "redact") return "#020617";
  if (layer.type === "crop") return "transparent";
  if (layer.type === "add-image") return "transparent";
  if (layer.type === "page-numbers") return "#020617";
  if (layer.type === "annotate") return "transparent";
  return "transparent";
}

function renderEditorLayerContent(layer: EditorLayer, activeTool: EditorToolKey, handlers: { onInput: (value: string) => void; onFocus: () => void; onBlur: () => void }) {
  if (layer.type === "draw") {
    const paths = parseDrawPaths(layer.text);
    return (
      <svg className="h-full w-full" viewBox={`0 0 ${layer.width || 680} ${layer.height || 900}`} fill="none" preserveAspectRatio="none">
        {paths.map((points, index) => (
          <polyline key={index} points={points.map(point => `${point.x},${point.y}`).join(" ")} stroke={layer.color || "#2563eb"} strokeWidth={layer.brushSize ?? 5} strokeOpacity={layer.opacity ?? 1} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        ))}
      </svg>
    );
  }
  if (layer.type === "crop") return <div className="h-full w-full border-2 border-dashed border-cyan-500" />;
  if (layer.type === "add-image") {
    if (layer.text.startsWith("data:image/")) {
      return <img src={layer.text} alt="" className="h-full w-full object-contain" draggable={false} />;
    }
    return <div className="grid h-full w-full place-items-center border-2 border-dashed border-blue-500/70 text-sm font-bold text-blue-600">Upload image</div>;
  }
  const editable = layer.type === "edit" || layer.type === "add-text" || layer.type === "annotate";
  if (editable) {
    return <EditorEditableText layer={layer} activeTool={activeTool} onCommit={handlers.onInput} onFocus={handlers.onFocus} onBlur={handlers.onBlur} />;
  }
  return (
    <div
      data-editor-content="true"
      contentEditable={editable}
      suppressContentEditableWarning
      onFocus={handlers.onFocus}
      onBlur={handlers.onBlur}
      onInput={event => handlers.onInput(event.currentTarget.textContent || "")}
      className="grid h-full w-full place-items-center px-3 outline-none"
      style={{
        fontSize: layer.fontSize ?? (layer.type === "page-numbers" ? 14 : activeTool === "watermark" ? 52 : 24),
        color: layer.color,
        fontFamily: layer.font ? `${layer.font}, sans-serif` : "Helvetica, Arial, sans-serif",
        fontWeight: layer.bold ? 700 : 400,
        fontStyle: layer.italic ? "italic" : "normal",
        textDecoration: layer.underline ? "underline" : "none",
        letterSpacing: layer.type === "watermark" ? "0.12em" : 0,
        textAlign: layer.align ?? "center",
      }}
    >
      {layer.text}
    </div>
  );
}

function EditorEditableText({ layer, activeTool, onCommit, onFocus, onBlur }: { layer: EditorLayer; activeTool: EditorToolKey; onCommit: (value: string) => void; onFocus: () => void; onBlur: () => void }) {
  const textRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (textRef.current && textRef.current.textContent !== layer.text && document.activeElement !== textRef.current) {
      textRef.current.textContent = layer.text;
    }
  }, [layer.id, layer.text]);

  return (
    <div
      ref={textRef}
      data-editor-content="true"
      contentEditable
      suppressContentEditableWarning
      onFocus={onFocus}
      onBlur={event => {
        onCommit(event.currentTarget.textContent || "");
        onBlur();
      }}
      onKeyDown={event => event.stopPropagation()}
      className="flex h-full w-full items-center overflow-hidden px-3 outline-none"
      style={{
        fontSize: layer.fontSize ?? (activeTool === "watermark" ? 52 : 24),
        color: layer.color,
        fontFamily: layer.font ? `${layer.font}, sans-serif` : "Helvetica, Arial, sans-serif",
        fontWeight: layer.bold ? 700 : 400,
        fontStyle: layer.italic ? "italic" : "normal",
        textDecoration: layer.underline ? "underline" : "none",
        letterSpacing: layer.type === "watermark" ? "0.12em" : 0,
        textAlign: layer.align ?? "center",
        justifyContent: layer.align === "left" ? "flex-start" : layer.align === "right" ? "flex-end" : "center",
      }}
    >
      {layer.text}
    </div>
  );
}

function parseDrawPaths(value: string): Array<Array<{ x: number; y: number }>> {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.filter(Array.isArray) : [];
  } catch {
    return [];
  }
}

function snapToGrid(value: number) {
  return Math.round(value / 8) * 8;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function fitEditorImageToPage(naturalWidth: number, naturalHeight: number) {
  const maxWidth = 440;
  const maxHeight = 360;
  const ratio = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1);
  const width = Math.max(40, Math.round(naturalWidth * ratio));
  const height = Math.max(40, Math.round(naturalHeight * ratio));
  return {
    width,
    height,
    x: Math.round((680 - width) / 2),
    y: Math.round((900 - height) / 2),
  };
}

function EditorCanvasV2({
  item,
  activeTool,
  drawMode = "brush",
  zoom,
  canvasHeight,
  onMeasurePage,
  pageIndex,
  layers,
  selectedLayerId,
  onSelectLayer,
  onPatchLayer,
  onBeginDrag,
  onDuplicateLayer,
  onDeleteLayer,
  onRotateLayer,
  onCommitSnapshot,
  onTextFocus,
  onTextBlur,
}: {
  item?: PreviewItem;
  activeTool: EditorToolKey;
  drawMode?: "brush" | "eraser";
  zoom: number;
  canvasHeight: number;
  onMeasurePage: (height: number) => void;
  pageIndex: number;
  layers: EditorLayer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onPatchLayer: (id: string, patch: Partial<EditorLayer>, record?: boolean) => void;
  onBeginDrag: (event: React.PointerEvent, id: string, mode: "move" | "resize") => void;
  onDuplicateLayer: (id?: string | null) => void;
  onDeleteLayer: (id?: string | null) => void;
  onRotateLayer: (id?: string | null) => void;
  onCommitSnapshot: (snapshot: EditorLayer[]) => void;
  onTextFocus: () => void;
  onTextBlur: () => void;
}) {
  // Page is laid out exactly like the conversion preview: container width is
  // driven by zoom, the <img> keeps its natural aspect ratio. The overlay lives
  // in a 680-wide logical space scaled to that display width.
  const displayWidth = editorDisplayWidth(zoom);
  const coordScale = displayWidth / 680;
  const pageLayers = layers.filter(layer => layer.pageIndex === pageIndex && !(layer.type === "crop" && layer.applied && layer.id !== selectedLayerId));
  const pageRef = useRef<HTMLDivElement | null>(null);
  const drawSnapshotRef = useRef<string | null>(null);
  const drawingPathsRef = useRef<Array<Array<{ x: number; y: number }>>>([]);

  // Measure the rendered page image's true aspect ratio (from the shared
  // PreviewSurface <img>) so the overlay logical height and the backend export
  // canvas height match the original PDF exactly.
  useEffect(() => {
    const img = pageRef.current?.querySelector("img");
    if (!img) return;
    const measure = () => {
      if (!img.naturalWidth || !img.naturalHeight) return;
      const measured = clamp(Math.round((680 * img.naturalHeight) / img.naturalWidth), 200, 1400);
      onMeasurePage(measured);
    };
    if (img.complete) measure();
    else {
      img.addEventListener("load", measure, { once: true });
      return () => img.removeEventListener("load", measure);
    }
  }, [item?.thumbnail, onMeasurePage]);

  const activeDrawLayer = activeTool === "draw" ? pageLayers.find(layer => layer.type === "draw") : null;
  const getPagePoint = (event: React.PointerEvent | PointerEvent) => {
    const rect = pageRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * 680, 0, 680),
      y: clamp(((event.clientY - rect.top) / rect.height) * canvasHeight, 0, canvasHeight),
    };
  };

  // Vector erase: drop any drawn point within the eraser radius and split the
  // remaining points back into separate paths. Works in preview and export
  // because it just rewrites the draw layer's path data.
  const eraseAt = (point: { x: number; y: number }) => {
    if (!activeDrawLayer) return;
    const radius = (activeDrawLayer.brushSize ?? 5) + 8;
    const paths = parseDrawPaths(activeDrawLayer.text);
    const next: Array<Array<{ x: number; y: number }>> = [];
    let changed = false;
    for (const path of paths) {
      let current: Array<{ x: number; y: number }> = [];
      for (const p of path) {
        if (Math.hypot(p.x - point.x, p.y - point.y) <= radius) {
          changed = true;
          if (current.length > 1) next.push(current);
          current = [];
        } else {
          current.push(p);
        }
      }
      if (current.length > 1) next.push(current);
      else if (current.length === 1 && path.length === 1) next.push(current);
    }
    if (changed) onPatchLayer(activeDrawLayer.id, { text: JSON.stringify(next) }, false);
  };

  const beginErase = (event: React.PointerEvent) => {
    if (!activeDrawLayer || activeTool !== "draw") return;
    const target = event.target as HTMLElement;
    if (target.closest("button")) return;
    event.preventDefault();
    event.stopPropagation();
    onSelectLayer(activeDrawLayer.id);
    const snapshot = layers;
    eraseAt(getPagePoint(event));
    const onMove = (moveEvent: PointerEvent) => eraseAt(getPagePoint(moveEvent));
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      onCommitSnapshot(snapshot);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const beginDraw = (event: React.PointerEvent) => {
    if (!activeDrawLayer || activeTool !== "draw") return;
    if (drawMode === "eraser") { beginErase(event); return; }
    const target = event.target as HTMLElement;
    if (target.closest("button") || target.dataset.editorContent === "true") return;
    event.preventDefault();
    event.stopPropagation();
    onSelectLayer(activeDrawLayer.id);
    const start = getPagePoint(event);
    const existingPaths = parseDrawPaths(activeDrawLayer.text);
    const nextPaths = [...existingPaths, [start]];
    drawingPathsRef.current = nextPaths;
    drawSnapshotRef.current = activeDrawLayer.text;
    onPatchLayer(activeDrawLayer.id, { text: JSON.stringify(nextPaths), temporary: false }, false);

    const onMove = (moveEvent: PointerEvent) => {
      const point = getPagePoint(moveEvent);
      const paths = drawingPathsRef.current.length ? drawingPathsRef.current : nextPaths;
      const last = paths[paths.length - 1] || [];
      const previous = last[last.length - 1];
      if (previous && Math.hypot(previous.x - point.x, previous.y - point.y) < 3) return;
      paths[paths.length - 1] = [...last, point];
      drawingPathsRef.current = [...paths];
      onPatchLayer(activeDrawLayer.id, { text: JSON.stringify(paths), temporary: false }, false);
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      const finalText = JSON.stringify(drawingPathsRef.current);
      const initialText = drawSnapshotRef.current;
      drawSnapshotRef.current = null;
      drawingPathsRef.current = [];
      if (initialText !== finalText) onCommitSnapshot(layers);
      onPatchLayer(activeDrawLayer.id, { text: finalText, temporary: false }, false);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div className="mx-auto" style={{ width: displayWidth }}>
      <div
        ref={pageRef}
        className="relative origin-top-left bg-white"
        style={{ width: displayWidth, boxShadow: "var(--dn-page-shadow)", outline: "1px solid var(--dn-border)", cursor: activeTool === "draw" ? (drawMode === "eraser" ? "cell" : "crosshair") : "default" }}
        onPointerDown={event => {
          if (activeTool === "draw") beginDraw(event);
          else onSelectLayer(null);
        }}
      >
        {item ? (
          // Reuse the EXACT conversion-preview renderer: PreviewSurface paints the
          // page <img> at width:100% / height:auto (natural aspect, no object-fill,
          // no transform scale), so the page is pixel-identical to the convert page.
          <PreviewSurface item={item} />
        ) : (
          <div className="bg-white px-14 py-12 text-center" style={{ aspectRatio: "0.72" }}>
            <div className="mb-12 flex items-start justify-between">
              <h2 className="text-3xl font-bold text-slate-950"><span className="text-blue-600">DocNova</span> PDF</h2>
              <div className="h-16 w-16 bg-slate-900" />
            </div>
            <p className="mb-4 text-slate-500">This document is ready for editing</p>
            <div className="mx-auto mb-8 w-[420px] border px-10 py-6 text-3xl font-bold text-slate-950">Selected text block</div>
            <div className="mx-auto h-32 w-[460px] rounded bg-slate-100" />
          </div>
        )}

        {/* Editing overlay — absolutely positioned ON TOP of the same page image,
            in a 680xcanvasHeight logical space scaled to the displayed width so
            every tool's coordinates track the PDF page at the current zoom. */}
        <div className="absolute inset-0 overflow-hidden" style={{ pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: 680, height: canvasHeight, transformOrigin: "top left", transform: `scale(${coordScale})`, pointerEvents: "none" }}>
        {pageLayers.map(layer => {
          const selected = layer.id === selectedLayerId;
          const layerStyle: React.CSSProperties = {
            left: layer.x,
            top: layer.y,
            width: layer.width,
            height: layer.height,
            transform: `rotate(${layer.rotation}deg)`,
            opacity: layer.opacity,
            border: selected ? "2px dashed #2563eb" : layer.type === "crop" ? "1px dashed rgba(6,182,212,0.75)" : "1px solid transparent",
            background: editorLayerBackground(layer),
            color: layer.color,
            cursor: selected && (layer.type === "edit" || layer.type === "add-text") ? "text" : "move",
            pointerEvents: "auto",
          };
          return (
            <div
              key={layer.id}
              className="pdf-editor-layer absolute z-10"
              style={layerStyle}
              onPointerDown={event => {
                if (layer.type === "draw" && activeTool === "draw") return;
                if ((event.target as HTMLElement).dataset.editorContent === "true") {
                  event.stopPropagation();
                  onSelectLayer(layer.id);
                  return;
                }
                onBeginDrag(event, layer.id, "move");
              }}
              onClick={event => {
                event.stopPropagation();
                onSelectLayer(layer.id);
              }}
            >
              {selected && (
                <div className="absolute left-1/2 top-[-48px] z-30 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 shadow-xl">
                  <button type="button" aria-label="Move selection" className="grid h-8 w-8 cursor-move place-items-center rounded-md text-slate-600 transition hover:bg-blue-50 hover:text-blue-600" onPointerDown={event => onBeginDrag(event, layer.id, "move")}><PenLine size={16} /></button>
                  <button type="button" aria-label="Duplicate selection" className="grid h-8 w-8 place-items-center rounded-md text-slate-600 transition hover:bg-blue-50 hover:text-blue-600" onClick={event => { event.stopPropagation(); onDuplicateLayer(layer.id); }}><Copy size={16} /></button>
                  <button type="button" aria-label="Delete selection" className="grid h-8 w-8 place-items-center rounded-md text-slate-600 transition hover:bg-red-50 hover:text-red-600" onClick={event => { event.stopPropagation(); onDeleteLayer(layer.id); }}><Trash2 size={16} /></button>
                  <button type="button" aria-label="Rotate selection" className="grid h-8 w-8 place-items-center rounded-md text-slate-600 transition hover:bg-slate-100" onClick={event => { event.stopPropagation(); onRotateLayer(layer.id); }}><RotateCw size={16} /></button>
                </div>
              )}

              {renderEditorLayerContent(layer, activeTool, {
                onInput: value => onPatchLayer(layer.id, { text: value, temporary: false }, false),
                onFocus: onTextFocus,
                onBlur: onTextBlur,
              })}

              {selected && (
                <>
                  <span className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
                  <span className="absolute -bottom-1 -left-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
                  <button
                    type="button"
                    aria-label="Resize selection"
                    className="absolute -bottom-1.5 -right-1.5 h-4 w-4 rounded-full bg-blue-600 shadow"
                    onPointerDown={event => onBeginDrag(event, layer.id, "resize")}
                  />
                </>
              )}
            </div>
          );
        })}
        </div>
        </div>
      </div>
    </div>
  );
}

function EditorCanvas({ item, activeTool, zoom }: { item?: PreviewItem; activeTool: EditorToolKey; zoom: number }) {
  const scale = zoom / 100;
  return (
    <div className="mx-auto origin-top" style={{ width: 680 * scale, transform: "scale(" + scale + ")", transformOrigin: "top center" }}>
      <div className="relative min-h-[900px] w-[680px] overflow-hidden bg-white" style={{ boxShadow: "var(--dn-page-shadow)", outline: "1px solid var(--dn-border)" }}>
        {item?.thumbnail ? (
          // object-fill (not contain): the page must occupy the FULL 680x900
          // editor space because the backend maps that whole box onto the full
          // PDF page. Letterboxing here would offset crop/redact/text placement.
          <img src={item.thumbnail} alt={item.label} className="absolute inset-0 h-full w-full object-fill" />
        ) : (
          <div className="absolute inset-0 bg-white px-14 py-12 text-center">
            <div className="mb-12 flex items-start justify-between">
              <h2 className="text-3xl font-bold text-slate-950"><span className="text-blue-600">DocNova</span> PDF</h2>
              <div className="h-16 w-16 bg-slate-900" />
            </div>
            <p className="mb-4 text-slate-500">This document is ready for editing</p>
            <div className="mx-auto mb-8 w-[420px] border px-10 py-6 text-3xl font-bold text-slate-950">Selected text block</div>
            <div className="mx-auto h-32 w-[460px] rounded bg-slate-100" />
          </div>
        )}

        {/* floating selection toolbar — always white/light since it sits ON the page canvas */}
        <div className="absolute left-1/2 top-[178px] z-20 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 shadow-xl">
          <button type="button" aria-label="Edit selection" className="grid h-8 w-8 place-items-center rounded-md text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"><PenLine size={16} /></button>
          <button type="button" aria-label="Copy selection" className="grid h-8 w-8 place-items-center rounded-md text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"><Copy size={16} /></button>
          <button type="button" aria-label="Delete selection" className="grid h-8 w-8 place-items-center rounded-md text-slate-600 transition hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
          <button type="button" aria-label="More selection options" className="grid h-8 w-8 place-items-center rounded-md text-slate-600 transition hover:bg-slate-100"><MoreVertical size={16} /></button>
        </div>

        {(activeTool === "edit" || activeTool === "add-text") && (
          <div className="absolute left-[132px] top-[244px] z-10 w-[416px] border-2 border-dashed border-blue-500 bg-blue-50/35 px-5 py-4 text-center text-2xl font-bold text-slate-950">
            Editable text area
            <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-blue-600" />
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-blue-600" />
            <span className="absolute -bottom-1 -left-1 h-2 w-2 rounded-full bg-blue-600" />
            <span className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full bg-blue-600" />
          </div>
        )}
        {activeTool === "highlight" && <div className="absolute left-[118px] top-[344px] z-10 h-9 w-[440px] rounded bg-yellow-300/55" />}
        {activeTool === "draw" && (
          <svg className="absolute left-[140px] top-[390px] z-10 h-28 w-[390px]" viewBox="0 0 390 112" fill="none">
            <path d="M8 82 C70 8, 122 116, 186 42 S300 6, 382 78" stroke="#2563eb" strokeWidth="8" strokeLinecap="round" />
          </svg>
        )}
        {activeTool === "crop" && <div className="absolute inset-x-14 inset-y-16 z-10 border-2 border-dashed border-cyan-500 bg-cyan-500/5" />}
        {activeTool === "redact" && (
          <>
            <div className="absolute left-[156px] top-[420px] z-10 h-9 w-[360px] bg-slate-950" />
            <div className="absolute left-[190px] top-[476px] z-10 h-8 w-[292px] bg-slate-950" />
          </>
        )}
        {activeTool === "watermark" && <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 -rotate-24 text-6xl font-black tracking-[0.18em] text-blue-600/20">CONFIDENTIAL</div>}
        {activeTool === "page-numbers" && <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 rounded-full bg-slate-950 px-4 py-1 text-sm font-semibold text-white">Page 1</div>}
      </div>
    </div>
  );
}

function EditorSettingsPanel({
  activeTool,
  selectedLayer,
  onPatchSelected,
  onApplyActiveTool,
}: {
  activeTool: EditorToolKey;
  selectedLayer?: EditorLayer | null;
  onPatchSelected?: (patch: Partial<EditorLayer>) => void;
  onApplyActiveTool?: () => void;
}) {
  const active = editorToolTabs.find(item => item.id === activeTool) || editorToolTabs[0];
  return (
    <aside className="flex min-h-0 flex-col" style={{ borderLeft: "1px solid var(--dn-border)", background: "var(--dn-bg-card)" }}>
      <div className="flex shrink-0 items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--dn-border)" }}>
        <div className="grid h-11 w-11 place-items-center rounded-lg" style={{ background: "var(--dn-selected-bg)", color: "#3b82f6" }}>{active.icon}</div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold" style={{ color: "var(--dn-t1)" }}>{editorPanelTitle(activeTool)}</h3>
          <p className="mt-0.5 text-xs" style={{ color: "var(--dn-t3)" }}>{editorPanelDescription(activeTool)}</p>
        </div>
      </div>
      <div className="pdf-editor-scroll min-h-0 flex-1 overflow-y-auto">
        <EditorSettingsSections activeTool={activeTool} selectedLayer={selectedLayer} onPatchSelected={onPatchSelected} />
        {selectedLayer && (
          <EditorPanelSection title="Selected Object">
            <div className="mb-3">
              <EditorColorInput label="Color" value={selectedLayer.color || "#0f172a"} onChange={value => onPatchSelected?.({ color: value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <EditorNumberField label="X" value={selectedLayer.x} onChange={value => onPatchSelected?.({ x: value })} />
              <EditorNumberField label="Y" value={selectedLayer.y} onChange={value => onPatchSelected?.({ y: value })} />
              <EditorNumberField label="Width" value={selectedLayer.width} onChange={value => onPatchSelected?.({ width: Math.max(44, value) })} />
              <EditorNumberField label="Height" value={selectedLayer.height} onChange={value => onPatchSelected?.({ height: Math.max(28, value) })} />
              <EditorNumberField label="Rotate" value={selectedLayer.rotation} onChange={value => onPatchSelected?.({ rotation: value })} />
              <EditorNumberField label="Opacity" value={Math.round(selectedLayer.opacity * 100)} onChange={value => onPatchSelected?.({ opacity: clamp(value, 5, 100) / 100 })} />
            </div>
          </EditorPanelSection>
        )}
      </div>
      <div className="shrink-0 p-4" style={{ borderTop: "1px solid var(--dn-border)" }}>
        <button type="button" onClick={onApplyActiveTool} className="h-11 w-full rounded-lg text-sm font-semibold text-white transition hover:bg-blue-700" style={{ background: "#2563eb" }}>{editorPrimaryAction(activeTool)}</button>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────────────────────────
   EDITOR SETTINGS SECTIONS — every control is wired to the layer
   ───────────────────────────────────────────────────────────── */

const FONT_LIST = [
  "Inter", "Roboto", "Open Sans", "Lato", "Poppins", "Montserrat",
  "Helvetica", "Arial", "Times New Roman", "Georgia", "Courier New", "Verdana",
];

function EditorSettingsSections({
  activeTool,
  selectedLayer,
  drawMode = "brush",
  canvasHeight = 900,
  onDrawModeChange,
  onPatchSelected,
  onDeleteSelected,
}: {
  activeTool: EditorToolKey;
  selectedLayer?: EditorLayer | null;
  drawMode?: "brush" | "eraser";
  canvasHeight?: number;
  onDrawModeChange?: (mode: "brush" | "eraser") => void;
  onPatchSelected?: (patch: Partial<EditorLayer>) => void;
  onDeleteSelected?: () => void;
}) {
  const patch = (p: Partial<EditorLayer>) => onPatchSelected?.(p);

  // Keep objects inside the page: X within [0, pageWidth - objectWidth] and
  // Y within [0, pageHeight - objectHeight]. Page width is the normalized 680
  // editor space; page height tracks the real aspect ratio (canvasHeight).
  const PAGE_W = 680;
  const clampX = (value: number) => clamp(value, 0, Math.max(0, PAGE_W - (selectedLayer?.width ?? 0)));
  const clampY = (value: number) => clamp(value, 0, Math.max(0, canvasHeight - (selectedLayer?.height ?? 0)));

  /* ── Draw ── */
  if (activeTool === "draw") {
    return (
      <>
        <EditorPanelSection title="Mode">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onDrawModeChange?.("brush")}
              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-md border text-sm font-semibold transition"
              style={drawMode === "brush"
                ? { background: "var(--dn-selected-bg)", borderColor: "var(--dn-selected-border)", color: "#3b82f6" }
                : { background: "var(--dn-bg-subtle)", borderColor: "var(--dn-border)", color: "var(--dn-t2)" }}
            >
              <PenLine size={15} /> Brush
            </button>
            <button
              type="button"
              onClick={() => onDrawModeChange?.("eraser")}
              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-md border text-sm font-semibold transition"
              style={drawMode === "eraser"
                ? { background: "var(--dn-selected-bg)", borderColor: "var(--dn-selected-border)", color: "#3b82f6" }
                : { background: "var(--dn-bg-subtle)", borderColor: "var(--dn-border)", color: "var(--dn-t2)" }}
            >
              <Eraser size={15} /> Eraser
            </button>
          </div>
        </EditorPanelSection>
        <EditorPanelSection title={drawMode === "eraser" ? "Eraser" : "Brush"}>
          <EditorNumberField
            label="Brush size (px)"
            value={selectedLayer?.brushSize ?? 5}
            onChange={value => patch({ brushSize: clamp(value, 1, 40) })}
          />
          <EditorNumberField
            label="Opacity (%)"
            value={Math.round((selectedLayer?.opacity ?? 1) * 100)}
            onChange={value => patch({ opacity: clamp(value, 5, 100) / 100 })}
          />
          <EditorColorInput
            label="Stroke color"
            value={selectedLayer?.color ?? "#2563eb"}
            onChange={value => patch({ color: value })}
          />
          <EditorColorSwatches
            colors={["#0f172a", "#2563eb", "#ef4444", "#facc15", "#22c55e", "#a855f7"]}
            value={selectedLayer?.color ?? "#2563eb"}
            onChange={value => patch({ color: value })}
          />
        </EditorPanelSection>
        {selectedLayer && <EditorDeleteRow onDelete={onDeleteSelected} />}
      </>
    );
  }

  /* ── Crop ── */
  if (activeTool === "crop") {
    return (
      <>
        <EditorPanelSection title="Crop Area">
          <div className="grid grid-cols-2 gap-3">
            <EditorNumberField label="X" value={selectedLayer?.x ?? 56} onChange={value => patch({ x: clampX(value) })} />
            <EditorNumberField label="Y" value={selectedLayer?.y ?? 64} onChange={value => patch({ y: clampY(value) })} />
            <EditorNumberField label="Width" value={selectedLayer?.width ?? 568} onChange={value => patch({ width: clamp(value, 44, PAGE_W) })} />
            <EditorNumberField label="Height" value={selectedLayer?.height ?? 772} onChange={value => patch({ height: clamp(value, 44, canvasHeight) })} />
          </div>
        </EditorPanelSection>
        {selectedLayer && <EditorDeleteRow onDelete={onDeleteSelected} />}
      </>
    );
  }

  /* ── Redact ── */
  if (activeTool === "redact") {
    return (
      <>
        <EditorPanelSection title="Redaction">
          <EditorColorInput
            label="Redaction color"
            value={selectedLayer?.color ?? "#020617"}
            onChange={value => patch({ color: value })}
          />
          <EditorColorSwatches
            colors={["#020617", "#ef4444", "#1d4ed8", "#ffffff"]}
            value={selectedLayer?.color ?? "#020617"}
            onChange={value => patch({ color: value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <EditorNumberField label="Width" value={selectedLayer?.width ?? 360} onChange={value => patch({ width: Math.max(20, value) })} />
            <EditorNumberField label="Height" value={selectedLayer?.height ?? 40} onChange={value => patch({ height: Math.max(10, value) })} />
          </div>
        </EditorPanelSection>
        {selectedLayer && <EditorDeleteRow onDelete={onDeleteSelected} />}
      </>
    );
  }

  /* ── Watermark ── */
  if (activeTool === "watermark") {
    return (
      <>
        <EditorPanelSection title="Watermark Text">
          <textarea
            value={selectedLayer?.text ?? "CONFIDENTIAL"}
            onChange={e => patch({ text: e.target.value })}
            placeholder="Watermark text..."
            rows={2}
            className="w-full resize-none rounded-md p-3 text-sm outline-none transition focus:border-blue-500"
            style={{ border: "1px solid var(--dn-border)", background: "var(--dn-bg-subtle)", color: "var(--dn-t1)" }}
          />
        </EditorPanelSection>
        <EditorPanelSection title="Style">
          <EditorNumberField label="Font size" value={selectedLayer?.fontSize ?? 52} onChange={value => patch({ fontSize: clamp(value, 10, 120) })} />
          <EditorColorInput
            label="Color"
            value={selectedLayer?.color ?? "#2563eb"}
            onChange={value => patch({ color: value })}
          />
          <EditorColorSwatches
            colors={["#2563eb", "#ef4444", "#0f172a", "#64748b", "#f59e0b"]}
            value={selectedLayer?.color ?? "#2563eb"}
            onChange={value => patch({ color: value })}
          />
        </EditorPanelSection>
        <EditorPanelSection title="Placement">
          <div className="grid grid-cols-2 gap-3">
            <EditorNumberField label="Opacity (%)" value={Math.round((selectedLayer?.opacity ?? 0.22) * 100)} onChange={value => patch({ opacity: clamp(value, 1, 100) / 100 })} />
            <EditorNumberField label="Rotate (°)" value={selectedLayer?.rotation ?? -24} onChange={value => patch({ rotation: value })} />
            <EditorNumberField label="X" value={selectedLayer?.x ?? 92} onChange={value => patch({ x: clampX(value) })} />
            <EditorNumberField label="Y" value={selectedLayer?.y ?? 410} onChange={value => patch({ y: clampY(value) })} />
          </div>
        </EditorPanelSection>
        {selectedLayer && <EditorDeleteRow onDelete={onDeleteSelected} />}
      </>
    );
  }

  /* ── Page Numbers ── */
  if (activeTool === "page-numbers") {
    return (
      <>
        <EditorPanelSection title="Number Format">
          <div>
            <EditorLabel>Text template</EditorLabel>
            <input
              type="text"
              value={selectedLayer?.text ?? "Page 1"}
              onChange={e => patch({ text: e.target.value })}
              placeholder="e.g. Page 1"
              className="h-10 w-full rounded-md px-3 text-sm outline-none transition focus:border-blue-500"
              style={{ border: "1px solid var(--dn-border)", background: "var(--dn-bg-subtle)", color: "var(--dn-t1)" }}
            />
          </div>
        </EditorPanelSection>
        <EditorPanelSection title="Style">
          <EditorNumberField label="Font size" value={selectedLayer?.fontSize ?? 14} onChange={value => patch({ fontSize: clamp(value, 8, 36) })} />
          <EditorColorInput
            label="Color"
            value={selectedLayer?.color ?? "#ffffff"}
            onChange={value => patch({ color: value })}
          />
          <EditorColorSwatches
            colors={["#ffffff", "#0f172a", "#2563eb", "#64748b", "#ef4444"]}
            value={selectedLayer?.color ?? "#ffffff"}
            onChange={value => patch({ color: value })}
          />
        </EditorPanelSection>
        <EditorPanelSection title="Position">
          <div className="grid grid-cols-2 gap-3">
            <EditorNumberField label="X" value={selectedLayer?.x ?? 300} onChange={value => patch({ x: clampX(value) })} />
            <EditorNumberField label="Y" value={selectedLayer?.y ?? 846} onChange={value => patch({ y: clampY(value) })} />
          </div>
        </EditorPanelSection>
        {selectedLayer && <EditorDeleteRow onDelete={onDeleteSelected} />}
      </>
    );
  }

  /* ── Add Image ── */
  if (activeTool === "add-image") {
    const uploadImage = (file?: File) => {
      if (!file || !file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const src = String(reader.result || "");
        const img = new Image();
        img.onload = () => {
          const fit = fitEditorImageToPage(img.naturalWidth || 1, img.naturalHeight || 1);
          patch({ text: src, ...fit, temporary: false });
        };
        img.onerror = () => patch({ text: src, temporary: false });
        img.src = src;
      };
      reader.readAsDataURL(file);
    };
    return (
      <>
        <EditorPanelSection title="Image">
          <label
            className="flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm font-semibold transition hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-500"
            style={{ borderColor: "var(--dn-border)", background: "var(--dn-bg-subtle)", color: "var(--dn-t3)" }}
          >
            <ImageIcon size={20} />
            {selectedLayer?.text?.startsWith("data:image/") ? "Replace Image" : "Upload Image"}
            <input type="file" accept="image/*" className="hidden" onChange={e => uploadImage(e.target.files?.[0])} />
          </label>
        </EditorPanelSection>
        <EditorPanelSection title="Transform">
          <div className="grid grid-cols-2 gap-3">
            <EditorNumberField label="Width" value={selectedLayer?.width ?? 320} onChange={value => patch({ width: Math.max(32, value) })} />
            <EditorNumberField label="Height" value={selectedLayer?.height ?? 180} onChange={value => patch({ height: Math.max(32, value) })} />
            <EditorNumberField label="Opacity (%)" value={Math.round((selectedLayer?.opacity ?? 1) * 100)} onChange={value => patch({ opacity: clamp(value, 5, 100) / 100 })} />
            <EditorNumberField label="Rotate (°)" value={selectedLayer?.rotation ?? 0} onChange={value => patch({ rotation: value })} />
            <EditorNumberField label="X" value={selectedLayer?.x ?? 180} onChange={value => patch({ x: clampX(value) })} />
            <EditorNumberField label="Y" value={selectedLayer?.y ?? 310} onChange={value => patch({ y: clampY(value) })} />
          </div>
        </EditorPanelSection>
        {selectedLayer && <EditorDeleteRow onDelete={onDeleteSelected} />}
      </>
    );
  }

  /* ── Annotate / Highlight ── */
  if (activeTool === "annotate" || activeTool === "highlight") {
    const isHighlight = activeTool === "highlight";
    const defaultColors = isHighlight
      ? ["#fde047", "#bef264", "#93c5fd", "#fca5a5", "#d8b4fe"]
      : ["#2563eb", "#ef4444", "#f59e0b", "#22c55e", "#a855f7"];
    return (
      <>
        <EditorPanelSection title={isHighlight ? "Highlight Style" : "Annotation"}>
          <EditorColorInput
            label="Color"
            value={selectedLayer?.color ?? defaultColors[0]}
            onChange={value => patch({ color: value })}
          />
          <EditorColorSwatches
            colors={defaultColors}
            value={selectedLayer?.color ?? defaultColors[0]}
            onChange={value => patch({ color: value })}
          />
          <EditorNumberField
            label="Opacity (%)"
            value={Math.round((selectedLayer?.opacity ?? (isHighlight ? 0.55 : 0.8)) * 100)}
            onChange={value => patch({ opacity: clamp(value, 5, 100) / 100 })}
          />
          <div className="grid grid-cols-2 gap-3">
            <EditorNumberField label="Width" value={selectedLayer?.width ?? 440} onChange={value => patch({ width: Math.max(20, value) })} />
            <EditorNumberField label="Height" value={selectedLayer?.height ?? (isHighlight ? 36 : 90)} onChange={value => patch({ height: Math.max(10, value) })} />
          </div>
        </EditorPanelSection>
        {!isHighlight && (
          <EditorPanelSection title="Text Content">
            <textarea
              value={selectedLayer?.text ?? ""}
              onChange={e => patch({ text: e.target.value })}
              placeholder="Annotation text..."
              rows={3}
              className="w-full resize-none rounded-md p-3 text-sm outline-none transition focus:border-blue-500"
              style={{ border: "1px solid var(--dn-border)", background: "var(--dn-bg-subtle)", color: "var(--dn-t1)" }}
            />
          </EditorPanelSection>
        )}
        {selectedLayer && <EditorDeleteRow onDelete={onDeleteSelected} />}
      </>
    );
  }

  /* ── Edit Text / Add Text (default) ── */
  return (
    <>
      <EditorPanelSection title="Text Content">
        <textarea
          value={selectedLayer?.text ?? ""}
          onChange={e => patch({ text: e.target.value })}
          placeholder="Type your text..."
          rows={4}
          className="w-full resize-none rounded-md p-3 text-sm outline-none transition focus:border-blue-500"
          style={{ border: "1px solid var(--dn-border)", background: "var(--dn-bg-subtle)", color: "var(--dn-t1)" }}
        />
      </EditorPanelSection>

      <EditorPanelSection title="Typography">
        {/* Font family */}
        <EditorFontSelect
          value={selectedLayer?.font ?? "Helvetica"}
          onChange={value => patch({ font: value })}
        />

        {/* Font size + color in a row */}
        <div className="grid grid-cols-2 gap-3">
          <EditorNumberField
            label="Size (px)"
            value={selectedLayer?.fontSize ?? 24}
            onChange={value => patch({ fontSize: clamp(value, 8, 120) })}
          />
          <div>
            <EditorLabel>Color</EditorLabel>
            <label
              className="flex h-10 w-full cursor-pointer items-center gap-2 rounded-md px-3 text-sm font-semibold"
              style={{ border: "1px solid var(--dn-border)", background: "var(--dn-bg-subtle)", color: "var(--dn-t1)" }}
            >
              <input
                type="color"
                value={selectedLayer?.color ?? "#0f172a"}
                onChange={e => patch({ color: e.target.value })}
                className="h-6 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span className="truncate text-xs">{(selectedLayer?.color ?? "#0f172a").toUpperCase()}</span>
            </label>
          </div>
        </div>

        {/* Color swatches */}
        <EditorColorSwatches
          colors={["#0f172a", "#ffffff", "#2563eb", "#ef4444", "#22c55e", "#f59e0b"]}
          value={selectedLayer?.color ?? "#0f172a"}
          onChange={value => patch({ color: value })}
        />

        {/* Style toggles: Bold · Italic · Underline */}
        <div>
          <EditorLabel>Style</EditorLabel>
          <div className="flex gap-2">
            <EditorStyleButton
              active={!!selectedLayer?.bold}
              onClick={() => patch({ bold: !selectedLayer?.bold })}
              title="Bold"
            >
              <Bold size={15} />
            </EditorStyleButton>
            <EditorStyleButton
              active={!!selectedLayer?.italic}
              onClick={() => patch({ italic: !selectedLayer?.italic })}
              title="Italic"
            >
              <Italic size={15} />
            </EditorStyleButton>
            <EditorStyleButton
              active={!!selectedLayer?.underline}
              onClick={() => patch({ underline: !selectedLayer?.underline })}
              title="Underline"
            >
              <Underline size={15} />
            </EditorStyleButton>
          </div>
        </div>

        {/* Alignment */}
        <div>
          <EditorLabel>Alignment</EditorLabel>
          <div className="flex gap-2">
            {(["left", "center", "right", "justify"] as const).map((a, i) => {
              const icons = [<AlignLeft size={15} />, <AlignCenter size={15} />, <AlignRight size={15} />, <AlignJustify size={15} />];
              const isActive = (selectedLayer?.align ?? "center") === a;
              return (
                <EditorStyleButton key={a} active={isActive} onClick={() => patch({ align: a })} title={a}>
                  {icons[i]}
                </EditorStyleButton>
              );
            })}
          </div>
        </div>
      </EditorPanelSection>

      <EditorPanelSection title="Position">
        <div className="grid grid-cols-2 gap-3">
          <EditorNumberField label="X" value={selectedLayer?.x ?? 0} onChange={value => patch({ x: clampX(value) })} />
          <EditorNumberField label="Y" value={selectedLayer?.y ?? 0} onChange={value => patch({ y: clampY(value) })} />
          <EditorNumberField label="Width" value={selectedLayer?.width ?? 416} onChange={value => patch({ width: Math.max(44, value) })} />
          <EditorNumberField label="Height" value={selectedLayer?.height ?? 72} onChange={value => patch({ height: Math.max(20, value) })} />
          <EditorNumberField label="Rotate (°)" value={selectedLayer?.rotation ?? 0} onChange={value => patch({ rotation: value })} />
          <EditorNumberField label="Opacity (%)" value={Math.round((selectedLayer?.opacity ?? 1) * 100)} onChange={value => patch({ opacity: clamp(value, 5, 100) / 100 })} />
        </div>
      </EditorPanelSection>

      {selectedLayer && <EditorDeleteRow onDelete={onDeleteSelected} />}
    </>
  );
}

/* ─── Small reusable editor UI atoms ─── */

function EditorPanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="p-5" style={{ borderBottom: "1px solid var(--dn-border)" }}>
      <h4 className="mb-4 text-sm font-bold" style={{ color: "var(--dn-t1)" }}>{title}</h4>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function EditorLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--dn-t3)" }}>{children}</p>;
}

function EditorNumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const rounded = Math.round(value);
  return (
    <div>
      <EditorLabel>{label}</EditorLabel>
      <div
        className="flex h-10 w-full overflow-hidden rounded-md"
        style={{ border: "1px solid var(--dn-border)", background: "var(--dn-bg-subtle)" }}
      >
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); onChange(rounded - 1); }}
          className="flex h-full w-8 flex-shrink-0 items-center justify-center text-lg font-bold transition"
          style={{ color: "var(--dn-t3)", borderRight: "1px solid var(--dn-border)", background: "transparent" }}
          onMouseOver={e => { e.currentTarget.style.background = "var(--dn-bg-card)"; e.currentTarget.style.color = "var(--dn-t1)"; }}
          onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--dn-t3)"; }}
        >
          <Minus size={13} />
        </button>
        <input
          type="number"
          value={rounded}
          onChange={e => onChange(Number(e.target.value) || 0)}
          className="h-full min-w-0 flex-1 bg-transparent text-center text-sm font-semibold outline-none"
          style={{ color: "var(--dn-t1)", appearance: "textfield" as React.CSSProperties["appearance"] }}
        />
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); onChange(rounded + 1); }}
          className="flex h-full w-8 flex-shrink-0 items-center justify-center text-lg font-bold transition"
          style={{ color: "var(--dn-t3)", borderLeft: "1px solid var(--dn-border)", background: "transparent" }}
          onMouseOver={e => { e.currentTarget.style.background = "var(--dn-bg-card)"; e.currentTarget.style.color = "var(--dn-t1)"; }}
          onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--dn-t3)"; }}
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}

function EditorColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <EditorLabel>{label}</EditorLabel>
      <label
        className="flex h-10 cursor-pointer items-center gap-3 rounded-md px-3 text-sm font-semibold"
        style={{ border: "1px solid var(--dn-border)", background: "var(--dn-bg-subtle)", color: "var(--dn-t1)" }}
      >
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0" />
        <span>{value.toUpperCase()}</span>
      </label>
    </div>
  );
}

function EditorColorSwatches({ colors, value, onChange }: { colors: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map(c => (
        <button
          key={c}
          type="button"
          title={c}
          aria-label={`Color ${c}`}
          onClick={() => onChange(c)}
          className="h-7 w-7 rounded-md transition"
          style={{
            background: c,
            border: value.toLowerCase() === c.toLowerCase()
              ? "2px solid #3b82f6"
              : "1.5px solid var(--dn-border)",
            boxShadow: value.toLowerCase() === c.toLowerCase() ? "0 0 0 2px rgba(59,130,246,0.3)" : "none",
          }}
        />
      ))}
    </div>
  );
}

function EditorFontSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative">
      <EditorLabel>Font family</EditorLabel>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="flex h-10 w-full items-center justify-between rounded-md px-3 text-sm font-semibold transition"
        style={{ border: "1px solid var(--dn-border)", background: "var(--dn-bg-subtle)", color: "var(--dn-t1)", fontFamily: `${value}, sans-serif` }}
      >
        <span className="truncate">{value}</span>
        <ChevronDown size={15} style={{ color: "var(--dn-t3)", flexShrink: 0 }} />
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-md shadow-xl"
          style={{ border: "1px solid var(--dn-border)", background: "var(--dn-bg-card)", maxHeight: 240, overflowY: "auto" }}
        >
          {FONT_LIST.map(font => (
            <button
              key={font}
              type="button"
              onClick={() => { onChange(font); setOpen(false); }}
              className="flex h-9 w-full items-center px-3 text-sm transition"
              style={{
                fontFamily: `${font}, sans-serif`,
                background: value === font ? "var(--dn-selected-bg)" : "transparent",
                color: value === font ? "#3b82f6" : "var(--dn-t1)",
                fontWeight: value === font ? 700 : 400,
                textAlign: "left",
              }}
              onMouseOver={e => { if (value !== font) e.currentTarget.style.background = "var(--dn-bg-subtle)"; }}
              onMouseOut={e => { if (value !== font) e.currentTarget.style.background = "transparent"; }}
            >
              {font}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EditorStyleButton({ children, active, onClick, title }: { children: React.ReactNode; active: boolean; onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-md transition"
      style={{
        background: active ? "var(--dn-selected-bg)" : "var(--dn-bg-subtle)",
        border: active ? "1px solid rgba(59,130,246,0.4)" : "1px solid var(--dn-border)",
        color: active ? "#3b82f6" : "var(--dn-t2)",
      }}
    >
      {children}
    </button>
  );
}

function EditorDeleteRow({ onDelete }: { onDelete?: () => void }) {
  return (
    <section className="p-5" style={{ borderBottom: "1px solid var(--dn-border)" }}>
      <button
        type="button"
        onClick={onDelete}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold transition"
        style={{ border: "1px solid rgba(239,68,68,0.32)", background: "rgba(239,68,68,0.06)", color: "#ef4444" }}
        onMouseOver={e => { e.currentTarget.style.background = "rgba(239,68,68,0.14)"; e.currentTarget.style.borderColor = "#ef4444"; }}
        onMouseOut={e => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.32)"; }}
      >
        <Trash2 size={15} />
        Delete selected element
      </button>
    </section>
  );
}

function EditorToolbarButton({ children, label, onClick, disabled }: { children: React.ReactNode; label: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-md transition disabled:cursor-not-allowed disabled:opacity-40"
      style={{ border: "1px solid var(--dn-border)", background: "var(--dn-bg-subtle)", color: "var(--dn-t2)" }}
      onMouseOver={e => { if (!disabled) { e.currentTarget.style.background = "var(--dn-bg-card)"; e.currentTarget.style.color = "var(--dn-t1)"; } }}
      onMouseOut={e => { if (!disabled) { e.currentTarget.style.background = "var(--dn-bg-subtle)"; e.currentTarget.style.color = "var(--dn-t2)"; } }}
    >
      {children}
    </button>
  );
}

function editorToolFromToolId(toolId: string): EditorToolKey {
  const map: Record<string, EditorToolKey> = {
    "edit-pdf": "edit",
    "annotate-pdf": "annotate",
    "add-text": "add-text",
    "add-image-to-pdf": "add-image",
    "highlight-text": "highlight",
    "draw-on-pdf": "draw",
    "crop-pdf": "crop",
    "redact-pdf": "redact",
    "add-watermark": "watermark",
    "add-page-numbers": "page-numbers",
  };
  return map[toolId] || "edit";
}

function editorPanelTitle(activeTool: EditorToolKey) {
  return {
    edit: "Edit Text",
    annotate: "Annotate PDF",
    "add-text": "Add Text",
    "add-image": "Add Image",
    highlight: "Highlight",
    draw: "Draw",
    crop: "Crop PDF",
    redact: "Redact PDF",
    watermark: "Watermark",
    "page-numbers": "Page Numbers",
  }[activeTool];
}

function editorPanelDescription(activeTool: EditorToolKey) {
  return {
    edit: "Modify existing text and formatting",
    annotate: "Add comments, notes, and markups",
    "add-text": "Place new text anywhere",
    "add-image": "Insert images, logos, or signatures",
    highlight: "Mark important text or areas",
    draw: "Draw freehand on the page",
    crop: "Adjust the visible page area",
    redact: "Remove sensitive content",
    watermark: "Add text or image watermark",
    "page-numbers": "Add numbering to pages",
  }[activeTool];
}

function editorPrimaryAction(activeTool: EditorToolKey) {
  return {
    edit: "Apply Text Changes",
    annotate: "Apply Annotation",
    "add-text": "Add Text",
    "add-image": "Insert Image",
    highlight: "Apply Highlight",
    draw: "Apply Drawing",
    crop: "Apply Crop",
    redact: "Apply Redaction",
    watermark: "Apply Watermark",
    "page-numbers": "Apply Page Numbers",
  }[activeTool];
}

function ConversionToolButton({ icon, label, compact, onClick }: { icon: React.ReactNode; label: string; compact?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`dn-glassmorphism-button flex h-10 items-center whitespace-nowrap rounded-[4px] border text-sm font-bold transition-colors ${compact ? "w-10 justify-center px-0" : "gap-2 px-3"}`}
    >
      {icon}
      {!compact && <span>{label}</span>}
    </button>
  );
}

function ConversionPanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b p-5" style={{ borderColor: "var(--dn-border)" }}>
      <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--dn-t1)" }}>{title}</h3>
      {children}
    </div>
  );
}

function ConversionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 mt-4 text-sm" style={{ color: "var(--dn-t3)" }}>{children}</p>;
}

function ConversionSelect({ value }: { value: string }) {
  return (
    <button type="button" className="flex h-11 w-full items-center justify-between rounded-md border px-3 text-sm font-semibold" style={{ background: "var(--dn-bg-subtle)", borderColor: "var(--dn-border)", color: "var(--dn-t1)" }}>
      <span className="truncate">{value}</span>
      <ChevronDown size={16} style={{ color: "var(--dn-t3)" }} />
    </button>
  );
}

function ConversionToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="mt-5 flex w-full items-center justify-between gap-3 text-left text-sm" style={{ color: "var(--dn-t1)" }}>
      <span>{label}</span>
      <span className="relative h-6 w-10 rounded-full transition-colors" style={{ background: checked ? "#2563eb" : "var(--dn-border)" }}>
        <span className="absolute top-1 h-4 w-4 rounded-full bg-white transition-all" style={{ left: checked ? 20 : 4 }} />
      </span>
    </button>
  );
}

function ConversionRadio({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <button type="button" role="radio" aria-checked={checked} onClick={onClick} className="mb-3 flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left text-sm font-semibold transition-colors" style={{ background: checked ? "var(--dn-selected-bg)" : "var(--dn-bg-subtle)", borderColor: checked ? "#3b82f6" : "var(--dn-border)", color: checked ? "var(--dn-t1)" : "var(--dn-t2)" }}>
      <span className="grid h-5 w-5 place-items-center rounded-full border" style={{ background: checked ? "#2563eb" : "transparent", borderColor: checked ? "#2563eb" : "var(--dn-border2)" }}>
        {checked && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
      {label}
    </button>
  );
}

function ConversionDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-3 flex justify-between gap-4 text-sm">
      <span style={{ color: "var(--dn-t3)" }}>{label}</span>
      <span className="min-w-0 truncate font-semibold" style={{ color: "var(--dn-t1)" }}>{value}</span>
    </div>
  );
}

function conversionOutputMeta(tool: Tool) {
  const map: Record<string, { formatLabel: string; cta: string }> = {
    "pdf-to-word": { formatLabel: "Word (.docx)", cta: "Convert to Word" },
    "word-to-pdf": { formatLabel: "PDF (.pdf)", cta: "Convert to PDF" },
    "pdf-to-excel": { formatLabel: "Excel (.xlsx)", cta: "Convert to Excel" },
    "excel-to-pdf": { formatLabel: "PDF (.pdf)", cta: "Convert to PDF" },
    "pdf-to-powerpoint": { formatLabel: "PowerPoint (.pptx)", cta: "Convert to PowerPoint" },
    "powerpoint-to-pdf": { formatLabel: "PDF (.pdf)", cta: "Convert to PDF" },
    "pdf-to-jpg": { formatLabel: "JPG images (.zip)", cta: "Convert to JPG" },
    "jpg-to-pdf": { formatLabel: "PDF (.pdf)", cta: "Convert to PDF" },
    "png-to-pdf": { formatLabel: "PDF (.pdf)", cta: "Convert to PDF" },
    "pdf-to-images": { formatLabel: "Images (.zip)", cta: "Convert to Images" },
    "image-to-pdf": { formatLabel: "PDF (.pdf)", cta: "Convert to PDF" },
  };
  return map[tool.id] || { formatLabel: tool.outputFormat || "Output file", cta: tool.action };
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
        <DownloadResultCard output={output} label={"Download " + (tool.outputFormat || "Result")} onDownload={onDownload} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: output.items.length > 1 ? "220px minmax(0,1fr)" : "1fr", gap: "1rem" }}>
        {output.items.length > 1 && (
          <div style={{ display: "grid", gap: "0.55rem", maxHeight: 520, overflow: "auto" }}>
            {output.items.map(item => (
              <button key={item.id} type="button" onClick={() => setActiveItem(item)}
                style={{ display: "flex", alignItems: "center", gap: "0.6rem", textAlign: "left", borderRadius: "4px", border: activeItem?.id === item.id ? "1px solid #60a5fa" : "1px solid var(--dn-border)", background: activeItem?.id === item.id ? "var(--dn-selected-bg)" : "var(--dn-bg-subtle)", color: "var(--dn-t2)", padding: "0.55rem", cursor: "pointer" }}>
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
    <section style={{ borderRadius: "4px", padding: "1rem", background: "var(--dn-bg-card)", border: "1px solid var(--dn-border)", boxShadow: "var(--dn-shadow)" }}>
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

function OrganizeListPreview({
  items,
  activeItem,
  selectedIds,
  zoom,
  onZoom,
  onSetActive,
  onToggleSelect,
  onRotateActive,
  onAddFiles,
}: {
  items: PreviewItem[];
  activeItem?: PreviewItem;
  selectedIds: Set<string>;
  zoom: number;
  onZoom: (updater: (z: number) => number) => void;
  onSetActive: (id: string) => void;
  onToggleSelect: (item: PreviewItem) => void;
  onRotateActive: (degrees: string) => void;
  onAddFiles: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      {/* Left: page thumbnails (top-aligned, like the conversion preview page) */}
      <aside className="flex w-[172px] flex-shrink-0 flex-col border-r" style={{ borderColor: "var(--dn-border)" }}>
        <div className="flex shrink-0 items-center justify-between px-3 py-3">
          <h3 className="text-sm font-semibold" style={{ color: "var(--dn-t1)" }}>Pages</h3>
          <span className="text-sm font-semibold" style={{ color: "var(--dn-t3)" }}>{items.length}</span>
        </div>
        <div className="thumbnail-scroll grid auto-rows-max content-start min-h-0 flex-1 gap-4 overflow-y-auto p-3">
          {items.map(item => {
            const active = activeItem?.id === item.id;
            const selected = selectedIds.has(item.id);
            return (
              <div key={item.id} className="thumbnail-item" style={{ position: "relative" }}>
                <button type="button" onClick={() => onSetActive(item.id)} className="block w-full text-left" style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0 }}>
                  <div className={active ? "active-thumbnail" : ""} style={{ borderRadius: 8, overflow: "hidden", background: "#fff", border: "1px solid var(--dn-border)", boxShadow: "var(--dn-shadow)" }}>
                    <PreviewSurface item={item} isThumbnail rotation={item.rotation || 0} />
                  </div>
                  <p className="mt-2 truncate text-center text-xs font-semibold" style={{ color: active ? "#3b82f6" : "var(--dn-t3)" }}>{item.label}</p>
                </button>
                <span
                  role="checkbox"
                  aria-checked={selected}
                  tabIndex={0}
                  aria-label={selected ? "Deselect page" : "Select page"}
                  onClick={event => { event.stopPropagation(); onToggleSelect(item); }}
                  onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); onToggleSelect(item); } }}
                  style={{ position: "absolute", top: 6, left: 6, zIndex: 2, cursor: "pointer", borderRadius: 4, background: "var(--dn-bg-card)", boxShadow: "var(--dn-shadow)" }}
                >
                  <OrganizeCheckBox checked={selected} />
                </span>
              </div>
            );
          })}
          <button type="button" onClick={onAddFiles} className="flex min-h-16 w-full items-center justify-center gap-2 rounded-md border border-dashed text-xs font-semibold transition hover:border-blue-500 hover:text-blue-500" style={{ borderColor: "var(--dn-border)", background: "var(--dn-surface-2)", color: "var(--dn-t3)" }}>
            <Plus size={16} /> Add files
          </button>
        </div>
      </aside>

      {/* Center: large preview of the selected page */}
      <section className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="document-viewer flex min-h-0 flex-1 items-start justify-center overflow-auto p-8" style={{ background: "var(--dn-preview-bg)" }}>
          <div style={{ width: Math.max(360, zoom * 7), flexShrink: 0, display: "grid", justifyItems: "center", alignContent: "start", transition: "width 0.2s ease" }}>
            {activeItem ? (
              <div style={{ width: "100%", boxShadow: "var(--dn-page-shadow)" }}>
                <PreviewSurface item={activeItem} rotation={activeItem.rotation || 0} />
              </div>
            ) : <EmptyPanel text="Select a page to preview." />}
          </div>
        </div>

        {activeItem && (
          <div className="absolute bottom-6 left-1/2 z-20 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 flex-nowrap items-center justify-center gap-2 overflow-x-auto whitespace-nowrap" style={{ background: "transparent", boxShadow: "none" }}>
            <ConversionToolButton label="Zoom out" icon={<ZoomOut size={16} />} compact onClick={() => onZoom(z => Math.max(50, z - 10))} />
            <button type="button" className="dn-glassmorphism-button h-10 min-w-[60px] whitespace-nowrap rounded-[4px] border px-4 text-sm font-extrabold transition-colors">{zoom}%</button>
            <ConversionToolButton label="Zoom in" icon={<ZoomIn size={16} />} compact onClick={() => onZoom(z => Math.min(180, z + 10))} />
            <ConversionToolButton label="Rotate left" icon={<RotateCcw size={17} />} onClick={() => onRotateActive("-90")} />
            <ConversionToolButton label="Rotate right" icon={<RotateCw size={17} />} onClick={() => onRotateActive("90")} />
          </div>
        )}
      </section>
    </div>
  );
}

function PreviewSurface({ item, rotation = 0, isThumbnail = false }: { item: PreviewItem; rotation?: number; isThumbnail?: boolean }) {
  if (item.thumbnail) {
    if (isThumbnail) {
      return (
        <img src={item.thumbnail} alt={item.label} className="thumbnail-preview" style={{ transform: "rotate(" + rotation + "deg)", transition: "transform 0.2s ease", display: "block" }} />
      );
    }
    return (
      <div style={{ width: "100%", borderRadius: "4px", background: "#fff", display: "grid", placeItems: "center", overflow: "hidden" }}>
        <img src={item.thumbnail} alt={item.label} style={{ width: "100%", height: "auto", objectFit: "contain", transform: "rotate(" + rotation + "deg)", transition: "transform 0.2s ease", display: "block" }} />
      </div>
    );
  }

  if (item.kind === "pdf") {
    return (
      <div style={{ width: "100%", aspectRatio: "0.72", borderRadius: "4px", background: "linear-gradient(90deg,#ffffff,#f1f5f9,#ffffff)", border: "1px solid var(--dn-border)", display: "grid", placeItems: "center", color: "#94a3b8", fontWeight: 850, fontSize: "0.74rem" }}>
        Generating...
      </div>
    );
  }

  // Spreadsheet fallback (no rendered image): show the real cell grid as a table.
  if (item.kind === "spreadsheet" && item.rows && item.rows.length) {
    return <SpreadsheetSurface rows={item.rows} isThumbnail={isThumbnail} />;
  }

  // Presentation fallback: show the slide's real text outline as a slide card.
  if (item.kind === "presentation") {
    return <SlideTextSurface label={item.label} text={item.text} isThumbnail={isThumbnail} />;
  }

  return (
    <div style={{ width: "100%", aspectRatio: "0.72", borderRadius: "4px", background: "var(--dn-bg-card)", border: "1px solid var(--dn-border)", boxShadow: "var(--dn-page-shadow)", display: "grid", placeItems: "center", padding: "0.8rem", textAlign: "center" }}>
      <div>
        <FileKindIcon kind={item.kind} />
        <div style={{ color: "var(--dn-t2)", fontWeight: 850, fontSize: "0.78rem", marginTop: "0.6rem" }}>{item.label}</div>
        {item.text && <div style={{ color: "var(--dn-t4)", fontSize: "0.68rem", marginTop: "0.35rem", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.text}</div>}
      </div>
    </div>
  );
}

function SpreadsheetSurface({ rows, isThumbnail }: { rows: string[][]; isThumbnail?: boolean }) {
  const maxCols = rows.reduce((max, row) => Math.max(max, row.length), 0);
  const fontSize = isThumbnail ? "0.4rem" : "0.78rem";
  const cellPad = isThumbnail ? "1px 2px" : "5px 8px";
  return (
    <div style={{ width: "100%", borderRadius: "4px", overflow: "auto", background: "#fff", border: "1px solid var(--dn-border)", boxShadow: isThumbnail ? "none" : "var(--dn-page-shadow)" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize, color: "#0f172a", fontFamily: "Inter, system-ui, sans-serif" }}>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} style={{ background: r === 0 ? "#eef2fb" : r % 2 ? "#f8fafc" : "#ffffff" }}>
              {Array.from({ length: maxCols }).map((_, c) => {
                const value = row[c] ?? "";
                return (
                  <td
                    key={c}
                    style={{
                      border: "1px solid #e2e8f0",
                      padding: cellPad,
                      fontWeight: r === 0 ? 800 : 400,
                      whiteSpace: "nowrap",
                      maxWidth: isThumbnail ? 60 : 220,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SlideTextSurface({ label, text, isThumbnail }: { label: string; text?: string; isThumbnail?: boolean }) {
  return (
    <div style={{ width: "100%", aspectRatio: "1.6", borderRadius: "4px", background: "#fff", border: "1px solid var(--dn-border)", boxShadow: isThumbnail ? "none" : "var(--dn-page-shadow)", padding: isThumbnail ? "0.4rem" : "1.4rem", overflow: "hidden", color: "#0f172a", display: "flex", flexDirection: "column" }}>
      <div style={{ fontWeight: 850, fontSize: isThumbnail ? "0.5rem" : "1rem", marginBottom: isThumbnail ? "0.2rem" : "0.6rem", color: "#1d4ed8" }}>{label}</div>
      <div style={{ fontSize: isThumbnail ? "0.36rem" : "0.82rem", lineHeight: 1.5, whiteSpace: "pre-wrap", overflow: "hidden", flex: 1 }}>
        {text && text.trim() ? text : "No text on this slide."}
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
          <div style={{ width: Math.round(100 * zoom) + "%", maxWidth: item.thumbnail ? "none" : 760 }}>
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
    <button type="button" onClick={event => { event.stopPropagation(); onClick(); }} style={{ border: "1px solid var(--dn-badge-bd)", background: "var(--dn-badge-bg)", color: "var(--dn-badge-text)", borderRadius: 999, padding: "0.42rem 0.72rem", fontSize: "0.74rem", fontWeight: 750, cursor: "pointer", fontFamily: "'Inter', sans-serif", boxShadow: "0 0 18px var(--dn-selected-bg)" }}>
      {children}
    </button>
  );
}

function IconButton({ children, label, onClick, danger }: { children: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={event => { event.stopPropagation(); onClick(); }} style={{ width: 30, height: 30, border: "none", borderRadius: "4px", display: "grid", placeItems: "center", background: danger ? "rgba(239,68,68,0.12)" : "var(--dn-icon-bg)", color: danger ? "#f87171" : "var(--dn-t3)", cursor: "pointer" }}>
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
      <Stat label="Reduced" value={Math.max(0, Math.round((1 - ratio) * 100)) + "%"} />
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

// Standard header for ALL non-AI tool workspaces. Single row, flex
// justify-between: back button → tool icon → tool name + count, with the file
// name (text only) and size beneath on the left; status badge + any action
// buttons pushed to the far right. Exactly one icon (the tool icon) — never a
// file icon.
//   ←  [Tool Icon] Tool Name | Count
//      FileName.ext · File Size                            [Status Badge]
function ToolWorkspaceHeader({
  tool,
  onBack,
  countLabel,
  fileName,
  fileSize,
  badge,
  actions,
  fullBleedDivider = false,
  compactSpacing = false,
}: {
  tool: Tool;
  onBack?: () => void;
  countLabel: string;
  fileName?: string;
  fileSize?: number;
  badge?: { text: string; color: string; bg: string; icon?: React.ReactNode };
  actions?: React.ReactNode;
  fullBleedDivider?: boolean;
  compactSpacing?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-between gap-4 border-b ${compactSpacing ? "mb-0 pb-2" : "mb-4 pb-3"} ${fullBleedDivider ? "-mx-6 px-6" : ""}`}
      style={{ borderColor: "var(--dn-border)" }}
    >
      {/* Left: back arrow (icon-only, same size as the tool icon) → tool icon → tool name/count + file name/size */}
      <div className="flex min-w-0 items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            title="Back to upload"
            aria-label="Back to upload"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border transition-colors hover:border-blue-500"
            style={{ borderColor: "var(--dn-border)", background: "var(--dn-bg-card)", color: "var(--dn-t2)" }}
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-white" style={{ background: tool.iconGrad, boxShadow: `0 4px 14px ${tool.color}40` }}>
          <tool.icon size={20} color="#fff" />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex min-w-0 items-baseline gap-3">
            <h1 className="truncate text-xl font-bold" style={{ color: "var(--dn-t1)" }}>{tool.label}</h1>
            <span className="shrink-0 text-sm font-semibold text-blue-500">{countLabel}</span>
          </div>
          {fileName && (
            <p className="truncate text-sm" style={{ color: "var(--dn-t3)" }}>
              <span className="font-semibold" style={{ color: "var(--dn-t2)" }}>{fileName}</span>
              {fileSize != null && <> · {formatBytes(fileSize)}</>}
            </p>
          )}
        </div>
      </div>

      {/* Right: status badge + existing action buttons, pushed far right */}
      <div className="flex shrink-0 items-center gap-2">
        {badge && (
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold" style={{ background: badge.bg, color: badge.color }}>
            {badge.icon}
            {badge.text}
          </span>
        )}
        {actions}
      </div>
    </div>
  );
}

function PreviewLoadingPanel({ name, status }: { name: string; status?: string }) {
  return (
    <div style={{ width: "100%", aspectRatio: "0.72", borderRadius: "8px", background: "#fff", border: "1px solid var(--dn-border)", display: "grid", placeItems: "center", padding: "1.5rem", textAlign: "center", boxShadow: "var(--dn-page-shadow)" }}>
      <div style={{ display: "grid", gap: "0.75rem", justifyItems: "center" }}>
        <Loader2 size={28} className="animate-spin" style={{ color: "#3b82f6" }} />
        <div style={{ color: "var(--dn-t2)", fontWeight: 800, fontSize: "0.9rem" }}>{status || "Generating document preview…"}</div>
        <div style={{ color: "var(--dn-t4)", fontSize: "0.74rem", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
      </div>
    </div>
  );
}

function PreviewErrorPanel({ message }: { message: string }) {
  return (
    <div style={{ width: "100%", aspectRatio: "0.72", borderRadius: "8px", background: "var(--dn-bg-card)", border: "1px solid rgba(239,68,68,0.4)", display: "grid", placeItems: "center", padding: "1.5rem", textAlign: "center" }}>
      <div style={{ display: "grid", gap: "0.75rem", justifyItems: "center", maxWidth: 320 }}>
        <AlertCircle size={30} style={{ color: "#ef4444" }} />
        <div style={{ color: "var(--dn-t1)", fontWeight: 850, fontSize: "0.95rem" }}>Preview unavailable</div>
        <div style={{ color: "var(--dn-t3)", fontSize: "0.8rem", lineHeight: 1.5 }}>{message}</div>
      </div>
    </div>
  );
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
      rotation: 0,
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
      rotation: 0,
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
      rotation: 0,
    }));
  } catch (error) {
    // Spreadsheets/presentations surface a real error state instead of a
    // misleading placeholder card; the backend already returns graceful
    // text/row fallbacks inside successful responses.
    throw error;
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
  const rangeForTool = settings.conversionMode === "range" ? settings.pageRange.trim() : settings.conversionMode === "selected" ? selectedRange : "";
  const displayRange = rangeForTool || "All";

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
      const normalizedRotation = ((parseInt(settings.rotation || "0", 10) % 360) + 360) % 360;
      const pageRange = settings.rotationScope === "all" ? "" : selectedRange;
      const blob = normalizedRotation
        ? await pdfApi.rotatePDF(firstFile, String(normalizedRotation), pageRange)
        : firstFile.slice(0, firstFile.size, "application/pdf");
      return makeSingleOutput(blob, `${stripExtension(firstFile.name)}-rotated.pdf`, "pdf", [
        { label: "Rotation", value: `${normalizedRotation} deg` },
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
        rotation: item.rotation || 0,
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
        { label: "Pages", value: displayRange },
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
      const blob = await pdfApi.pdfToExcel(firstFile, rangeForTool, settings.extractMode);
      return makeSingleOutput(blob, `${stripExtension(firstFile.name)}.xlsx`, "spreadsheet", [
        { label: "Pages", value: displayRange },
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
      const blob = await pdfApi.pdfToPowerPoint(firstFile, rangeForTool);
      return makeSingleOutput(blob, `${stripExtension(firstFile.name)}.pptx`, "presentation", [
        { label: "Slides", value: displayRange },
      ]);
    }
    case "powerpoint-to-pdf": {
      const blob = await pdfApi.powerPointToPDF(firstFile, rangeForTool);
      return makeSingleOutput(blob, `${stripExtension(firstFile.name)}.pdf`, "pdf", [
        { label: "Slides", value: displayRange },
      ]);
    }
    case "pdf-to-jpg":
    case "pdf-to-images": {
      const result = await pdfApi.pdfToJpg(firstFile, {
        pageRange: rangeForTool,
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
      const editorLayers = parseEditorLayers(settings.editorLayers);
      const blob = await pdfApi.applyEditorEdits(firstFile, editorLayers, tool.id, 680, settings.editorCanvasHeight || 900);
      return makeSingleOutput(blob, `${stripExtension(firstFile.name)}-${tool.id}.pdf`, "pdf", [
        { label: "Previewed edit", value: settings.editTool || tool.label },
        { label: "Editor objects", value: String(editorLayers.length) },
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
    rotation: item.rotation || 0,
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
  if ([".xls", ".xlsx", ".csv"].includes(ext)) return "spreadsheet";
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
    rotation: 0,
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

function defaultOutputBaseName(tool: Tool, files: WorkflowFile[]) {
  const firstBase = stripExtension(files[0]?.name || "docnova");
  const suffixes: Record<string, string> = {
    "split-pdf": `${firstBase}-split`,
    "rotate-pdf": `${firstBase}-rotated`,
    "delete-pages": `${firstBase}-pages-deleted`,
    "extract-pages": `${firstBase}-selected-pages`,
    "compress-pdf": `${firstBase}-compressed`,
    "merge-pdf": "docnova-merged-selected",
    "reorder-pages": `${firstBase}-reorder-pages`,
    "insert-pages": `${firstBase}-insert-pages`,
    "resize-pdf": `${firstBase}-resize-pdf`,
  };
  return suffixes[tool.id] || `${firstBase}-${tool.id}`;
}

function parseEditorLayers(value: string): EditorLayer[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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
