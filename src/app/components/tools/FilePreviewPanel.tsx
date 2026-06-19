import { motion } from "motion/react";
import { ToolbarButton, PageCard, AddMoreFilesTile, Label, Select, ToggleRow, DetailRow, CheckBox } from "./OrganizeComponents";
import { ArrowLeft, ArrowRight, ChevronDown, Copy, CornerDownRight, FileText, Grid2X2, List, Loader2, Lock, Plus, RotateCcw, RotateCw, Trash2, X, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

export interface PreviewPage {
  id: string;
  fileId: string;
  fileName: string;
  pageIndex: number;
  pageNumber: number;
  thumbnail?: string;
  rotation?: number;
}

export interface PreviewFile {
  id: string;
  name: string;
  size: number;
  pages: PreviewPage[];
  loading?: boolean;
  error?: string;
  previewStatus?: string;
}

export interface QueuePage extends PreviewPage {
  order: number;
}

interface FilePreviewPanelProps {
  files: PreviewFile[];
  queue: QueuePage[];
  selectedPageIds: Set<string>;
  draggingQueueId: string | null;
  estimatedSize: string;
  onTogglePage: (page: PreviewPage) => void;
  onSelectFile: (fileId: string) => void;
  onDeselectFile: (fileId: string) => void;
  onRemoveFile: (fileId: string) => void;
  onSelectAllFiles: () => void;
  onClearSelection: () => void;
  onInvertSelection: () => void;
  onRemoveQueuePage: (pageId: string) => void;
  onDragStart: (pageId: string) => void;
  onDropOnQueuePage: (pageId: string) => void;
  processing?: boolean;
  onProcess?: () => void;
  onInsertFile?: (index: number) => void;
  onRotatePage?: (pageId: string, angle: number) => void;
  onDuplicatePage?: (pageId: string) => void;
  outputFileName?: string;
  onOutputFileNameChange?: (value: string) => void;
  onBack?: () => void;
  /** Tool identity for the header — renders the single tool icon (no file icon). */
  title?: string;
  icon?: React.ReactNode;
  iconStyle?: React.CSSProperties;
}



export function FilePreviewPanel({
  files,
  queue,
  selectedPageIds,
  draggingQueueId,
  estimatedSize,
  onTogglePage,
  onSelectFile,
  onDeselectFile,
  onRemoveFile,
  onSelectAllFiles,
  onClearSelection,
  onInvertSelection,
  onRemoveQueuePage,
  onDragStart,
  onDropOnQueuePage,
  processing,
  onProcess,
  onInsertFile,
  onRotatePage,
  onDuplicatePage,
  outputFileName = "docnova-merged-selected",
  onOutputFileNameChange,
  onBack,
  title = "Merge Files",
  icon,
  iconStyle,
}: FilePreviewPanelProps) {
  const [previewPage, setPreviewPage] = useState<PreviewPage | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  // List-mode (preview-style) state: which page is shown large + its zoom.
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const totalPages = files.reduce((sum, file) => sum + file.pages.length, 0);
  const allPages = files.flatMap(file => file.pages);
  const activePage = allPages.find(page => page.id === activePageId) || allPages[0];
  const selectedQueuePages = queue.filter(page => selectedPageIds.has(page.id));
  const hasSelectedPages = selectedQueuePages.length > 0;
  const addFiles = () => onInsertFile?.(queue.length);
  const rotateSelected = (angle: number) => {
    selectedQueuePages.forEach(page => onRotatePage?.(page.id, angle));
  };
  const deleteSelected = () => {
    selectedQueuePages.forEach(page => onRemoveQueuePage(page.id));
  };
  const duplicateSelected = () => {
    selectedQueuePages.forEach(page => onDuplicatePage?.(page.id));
  };

  return (
    <div className="flex flex-1 w-full overflow-hidden bg-transparent" style={{ color: "var(--dn-t1)" }}>

      {/* Center Workspace */}
      <section className="flex min-w-0 flex-1 flex-col bg-transparent">
        {/* Header */}
        <div className="flex h-16 flex-shrink-0 items-center gap-4 px-6">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              title="Back to upload"
              aria-label="Back to upload"
              className="flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-sm font-semibold transition-colors"
              style={{ borderColor: "var(--dn-border)", background: "var(--dn-bg-card)", color: "var(--dn-t2)" }}
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}
          <div className="flex h-9 w-9 items-center justify-center rounded-md shadow-sm text-white" style={iconStyle ?? { background: "var(--dn-bg-subtle)", color: "var(--dn-t2)" }}>
            {icon ?? <FileText size={20} />}
          </div>
          <div className="flex min-w-0 items-baseline gap-3">
            <h1 className="truncate text-lg font-semibold" style={{ color: "var(--dn-t1)" }}>{title}</h1>
            <span className="text-sm font-medium text-blue-500">{files.length} {files.length === 1 ? "file" : "files"} selected</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex h-auto min-h-14 flex-shrink-0 items-center justify-between gap-4 px-6 py-2 border-b" style={{ borderColor: "var(--dn-border)" }}>
          <div className="flex min-w-0 flex-nowrap items-center gap-2 overflow-x-auto">
            <ToolbarButton icon={<CheckBox checked={selectedPageIds.size === totalPages && totalPages > 0} />} text="Select all" onClick={selectedPageIds.size === totalPages ? onClearSelection : onSelectAllFiles} />
            <div className="mx-1 h-6 w-px" style={{ background: "var(--dn-border)" }} />
            <ToolbarButton icon={<Plus size={17} />} text="Add files" dropdown onClick={addFiles} />
            <div className="mx-1 h-6 w-px" style={{ background: "var(--dn-border)" }} />
            <ToolbarButton icon={<RotateCcw size={17} />} text="Rotate left" disabled={!hasSelectedPages} onClick={() => rotateSelected(-90)} />
            <ToolbarButton icon={<RotateCw size={17} />} text="Rotate right" disabled={!hasSelectedPages} onClick={() => rotateSelected(90)} />
            <ToolbarButton icon={<Copy size={17} />} text="Duplicate" disabled={!hasSelectedPages || !onDuplicatePage} onClick={duplicateSelected} />
            <ToolbarButton icon={<Trash2 size={17} />} text="Delete" muted={!hasSelectedPages} disabled={!hasSelectedPages} onClick={deleteSelected} />
          </div>

          <div className="flex flex-shrink-0 items-center gap-4">
            <button type="button" className="flex items-center gap-2 text-sm transition-colors" style={{ color: "var(--dn-t2)" }}>
              Sort: <span className="font-medium" style={{ color: "var(--dn-t1)" }}>Custom</span> <ChevronDown size={15} />
            </button>

            <div className="flex overflow-hidden rounded-md border shadow-sm" style={{ borderColor: "var(--dn-border)", background: "var(--dn-bg-card)" }}>
              <button
                type="button"
                aria-label="List view"
                title="List view"
                onClick={() => setViewMode("list")}
                className="p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: viewMode === "list" ? "#3b82f6" : "var(--dn-t2)", background: viewMode === "list" ? "rgba(59,130,246,0.1)" : "transparent" }}
              >
                <List size={18} />
              </button>
              <button
                type="button"
                aria-label="Grid view"
                title="Grid view"
                onClick={() => setViewMode("grid")}
                className="p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: viewMode === "grid" ? "#3b82f6" : "var(--dn-t2)", background: viewMode === "grid" ? "rgba(59,130,246,0.1)" : "transparent" }}
              >
                <Grid2X2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Pages — grid view (unchanged) */}
        {viewMode === "grid" ? (
          <div className="custom-scrollbar flex-1 overflow-y-auto p-6 md:p-8">
            {files.map((file, fileIndex) => (
              <div key={file.id} className="mb-8">
                <div className="mb-5 flex items-start gap-2">
                  <CornerDownRight size={18} className="mt-1 flex-shrink-0 text-blue-500" />
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-medium" style={{ color: "var(--dn-t1)" }}>{file.name}</h2>
                    <p className="mt-0.5 text-xs font-medium text-blue-500">
                      {file.loading ? "Generating preview..." : `${file.pages.length} pages`}
                    </p>
                    {file.previewStatus && (
                      <p className="mt-0.5 text-xs font-medium" style={{ color: "var(--dn-t3)" }}>{file.previewStatus}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {file.pages.map((page, index) => (
                    <motion.div key={page.id} layout>
                      <PageCard
                        page={{
                          id: page.id,
                          label: `Page ${page.pageNumber}`,
                          fileName: page.fileName,
                          pageNumber: page.pageNumber,
                          totalPages: file.pages.length || 1,
                          thumbnail: page.thumbnail,
                          rotation: page.rotation,
                        }}
                        selected={selectedPageIds.has(page.id)}
                        onToggle={() => onTogglePage(page)}
                        onPreview={() => setPreviewPage(page)}
                        onDragStart={() => onDragStart(page.id)}
                        onDrop={() => onDropOnQueuePage(page.id)}
                        isFirst={index === 0}
                        onRotate={onRotatePage}
                        onDelete={onRemoveQueuePage}
                        onDuplicate={onDuplicatePage}
                      />
                    </motion.div>
                  ))}
                  {fileIndex === files.length - 1 && (
                    <AddMoreFilesTile
                      onClick={() => onInsertFile?.(queue.length)}
                      referenceThumbnail={file.pages[file.pages.length - 1]?.thumbnail}
                      referenceRotation={file.pages[file.pages.length - 1]?.rotation || 0}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List view — preview-style workspace (thumbnails + large canvas) */
          <div className="flex min-h-0 flex-1 overflow-hidden">
            {/* Left: page thumbnails, top-aligned */}
            <aside className="flex w-[172px] flex-shrink-0 flex-col border-r" style={{ borderColor: "var(--dn-border)" }}>
              <div className="flex shrink-0 items-center justify-between px-3 py-3">
                <h3 className="text-sm font-semibold" style={{ color: "var(--dn-t1)" }}>Pages</h3>
                <span className="text-sm font-semibold" style={{ color: "var(--dn-t3)" }}>{totalPages}</span>
              </div>
              <div className="custom-scrollbar grid auto-rows-max content-start min-h-0 flex-1 gap-4 overflow-y-auto p-3">
                {allPages.map(page => {
                  const active = activePage?.id === page.id;
                  const selected = selectedPageIds.has(page.id);
                  return (
                    <div
                      key={page.id}
                      style={{ position: "relative", width: "100%" }}
                      draggable
                      onDragStart={() => onDragStart(page.id)}
                      onDragOver={event => event.preventDefault()}
                      onDrop={() => onDropOnQueuePage(page.id)}
                    >
                      <button type="button" onClick={() => setActivePageId(page.id)} className="block w-full text-left" style={{ border: "none", background: "transparent", padding: 0, cursor: "pointer" }}>
                        <div style={{ borderRadius: 8, overflow: "hidden", background: "#fff", border: active ? "1px solid var(--dn-selected-border)" : "1px solid var(--dn-border)", boxShadow: active ? "0 0 0 2px var(--dn-selected-border)" : "var(--dn-shadow)" }}>
                          {page.thumbnail ? (
                            <img src={page.thumbnail} alt="" style={{ display: "block", width: "100%", height: "auto", transform: `rotate(${page.rotation || 0}deg)` }} />
                          ) : (
                            <div style={{ aspectRatio: "0.72", display: "grid", placeItems: "center", color: "var(--dn-t4)", fontSize: "0.7rem", fontWeight: 700 }}>Generating</div>
                          )}
                        </div>
                        <p className="mt-2 truncate text-center text-xs font-semibold" style={{ color: active ? "#3b82f6" : "var(--dn-t3)" }}>Page {page.pageNumber}</p>
                      </button>
                      <span
                        role="checkbox"
                        aria-checked={selected}
                        tabIndex={0}
                        aria-label={selected ? "Deselect page" : "Select page"}
                        onClick={event => { event.stopPropagation(); onTogglePage(page); }}
                        onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); onTogglePage(page); } }}
                        className="grid h-5 w-5 place-items-center rounded-sm text-white"
                        style={{ position: "absolute", top: 6, left: 6, zIndex: 2, cursor: "pointer", background: selected ? "#2563eb" : "var(--dn-icon-bg)", boxShadow: "var(--dn-shadow)" }}
                      >
                        {selected && <CheckBox checked />}
                      </span>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => onInsertFile?.(queue.length)}
                  className="flex min-h-16 w-full items-center justify-center gap-2 rounded-md border border-dashed text-xs font-semibold transition hover:border-blue-500 hover:text-blue-500"
                  style={{ borderColor: "var(--dn-border)", background: "var(--dn-surface-2)", color: "var(--dn-t3)" }}
                >
                  <Plus size={16} /> Add files
                </button>
              </div>
            </aside>

            {/* Center: large preview of the selected page */}
            <section className="relative flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="flex min-h-0 flex-1 items-start justify-center overflow-auto p-8" style={{ background: "var(--dn-preview-bg)" }}>
                <div style={{ width: Math.max(360, zoom * 7), flexShrink: 0, display: "grid", justifyItems: "center", alignContent: "start", transition: "width 0.2s ease" }}>
                  {activePage ? (
                    <div style={{ width: "100%", borderRadius: 4, overflow: "hidden", background: "#fff", boxShadow: "var(--dn-page-shadow)" }}>
                      {activePage.thumbnail ? (
                        <img src={activePage.thumbnail} alt={`Page ${activePage.pageNumber}`} style={{ display: "block", width: "100%", height: "auto", transform: `rotate(${activePage.rotation || 0}deg)` }} />
                      ) : (
                        <div style={{ aspectRatio: "0.72", display: "grid", placeItems: "center", color: "var(--dn-t4)", fontWeight: 700 }}>Generating preview…</div>
                      )}
                    </div>
                  ) : (
                    <div style={{ color: "var(--dn-t4)", fontWeight: 700, padding: "2rem" }}>Select a page to preview.</div>
                  )}
                </div>
              </div>

              {activePage && (
                <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-nowrap items-center justify-center gap-2 whitespace-nowrap">
                  <FloatingToolButton label="Zoom out" onClick={() => setZoom(z => Math.max(50, z - 10))}><ZoomOut size={16} /></FloatingToolButton>
                  <span className="flex h-10 min-w-[60px] items-center justify-center rounded-[4px] border px-4 text-sm font-extrabold" style={{ background: "var(--dn-toolbar-bg)", borderColor: "var(--dn-toolbar-border)", color: "var(--dn-toolbar-text)", boxShadow: "var(--dn-toolbar-shadow)" }}>{zoom}%</span>
                  <FloatingToolButton label="Zoom in" onClick={() => setZoom(z => Math.min(180, z + 10))}><ZoomIn size={16} /></FloatingToolButton>
                  <FloatingToolButton label="Rotate left" onClick={() => onRotatePage?.(activePage.id, -90)}><RotateCcw size={17} /></FloatingToolButton>
                  <FloatingToolButton label="Rotate right" onClick={() => onRotatePage?.(activePage.id, 90)}><RotateCw size={17} /></FloatingToolButton>
                </div>
              )}
            </section>
          </div>
        )}
      </section>

      {/* Right Sidebar */}
      <aside className="relative z-20 flex w-[320px] flex-shrink-0 flex-col border-l" style={{ borderColor: "var(--dn-border)", background: "var(--dn-bg-card)" }}>
        <div className="flex-1 overflow-hidden">

          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--dn-border)" }}>
            <h2 className="mb-3 text-sm font-semibold" style={{ color: "var(--dn-t1)" }}>Conversion Settings</h2>
            <Label text="Merge mode" />
            <Select text="Merge all files" />
            <ToggleRow text="Preserve original quality" active />
            <ToggleRow text="Extract text if possible" active={false} />
          </div>

          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--dn-border)" }}>
            <h2 className="mb-3 text-sm font-semibold" style={{ color: "var(--dn-t1)" }}>Output Settings</h2>
            <Label text="Output format" />
            <Select text="PDF" />
            <Label text="Save to" />
            <Select text="Downloads folder" />
            <Label text="File name" />
            <input
              type="text"
              value={outputFileName}
              onChange={event => onOutputFileNameChange?.(event.target.value)}
              className="h-9 w-full rounded-md border px-3 text-sm font-semibold outline-none transition focus:border-blue-500"
              style={{ borderColor: "var(--dn-border)", background: "var(--dn-bg-subtle)", color: "var(--dn-t1)" }}
            />
          </div>

          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--dn-border)" }}>
            <h2 className="mb-3 text-sm font-semibold" style={{ color: "var(--dn-t1)" }}>File Details</h2>
            <DetailRow label="Total files" value={files.length} />
            <DetailRow label="Total pages" value={totalPages} />
            <DetailRow label="Estimated size" value={estimatedSize} />
          </div>
        </div>

        <div className="z-10 p-5 pt-5 relative">
          <div className="absolute inset-x-0 top-0 h-4 -translate-y-full bg-gradient-to-t from-[var(--dn-bg-card)] to-transparent pointer-events-none" />
          <button
            onClick={onProcess}
            disabled={processing || queue.length === 0}
            className="flex h-11 w-full items-center justify-center gap-3 rounded-lg bg-blue-700 font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? <Loader2 size={20} className="animate-spin" /> : "Merge Selected"}
            {!processing && <ArrowRight size={20} />}
          </button>

          <p className="mt-3 flex items-center justify-center gap-2 text-xs font-medium" style={{ color: "var(--dn-t4)" }}>
            <Lock size={14} />
            Your files are secure and private
          </p>
        </div>
      </aside>

      {previewPage && (
        <div
          onClick={() => setPreviewPage(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            background: "rgba(2,6,23,0.72)",
            backdropFilter: "blur(18px)",
            display: "grid",
            placeItems: "center",
            padding: "2rem",
          }}
        >
          <div
            onClick={event => event.stopPropagation()}
            style={{
              width: "min(92vw, 860px)",
              maxHeight: "92vh",
              borderRadius: 20,
              border: "1px solid var(--dn-border)",
              background: "var(--dn-bg-card)",
              boxShadow: "var(--dn-shadow)",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 1rem", borderBottom: "1px solid var(--dn-border)" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: "var(--dn-t1)", fontWeight: 850, fontSize: "0.92rem" }}>Page {previewPage.pageNumber}</div>
                <div style={{ color: "var(--dn-t4)", fontSize: "0.74rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{previewPage.fileName}</div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPage(null)}
                style={{ marginLeft: "auto", width: 34, height: 34, border: "none", borderRadius: 10, background: "var(--dn-icon-bg)", color: "var(--dn-t2)", display: "grid", placeItems: "center", cursor: "pointer" }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ maxHeight: "calc(92vh - 68px)", overflow: "auto", background: "var(--dn-bg-subtle)", padding: "1rem" }}>
              {previewPage.thumbnail ? (
                <img src={previewPage.thumbnail} alt={`${previewPage.fileName} page ${previewPage.pageNumber}`} style={{ display: "block", width: "100%", height: "auto", background: "var(--dn-bg-card)", borderRadius: 12 }} />
              ) : (
                <div style={{ minHeight: 520, borderRadius: 12, background: "var(--dn-bg-card)", display: "grid", placeItems: "center", color: "var(--dn-t4)", fontWeight: 850 }}>Preview still generating...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IconButton({ children, label, onClick, danger }: { children: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={event => {
        event.stopPropagation();
        onClick();
      }}
      style={{
        width: 32,
        height: 32,
        border: "1px solid var(--dn-border)",
        borderRadius: "8px",
        display: "grid",
        placeItems: "center",
        background: danger ? "rgba(239,68,68,0.1)" : "var(--dn-bg-subtle)",
        color: danger ? "#f87171" : "var(--dn-t2)",
        cursor: "pointer",
      }}
      className="hover:bg-blue-500/10 transition-all duration-200"
    >
      {children}
    </button>
  );
}

function FloatingToolButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-[4px] border transition-colors"
      style={{ background: "var(--dn-toolbar-bg)", borderColor: "var(--dn-toolbar-border)", color: "var(--dn-toolbar-text)", boxShadow: "var(--dn-toolbar-shadow)", backdropFilter: "blur(16px)" }}
    >
      {children}
    </button>
  );
}

function InsertZone({ onInsert }: { onInsert: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 group h-[400px] w-12 z-10 -mx-6">
      <div className="w-0.5 h-[80%] bg-blue-100 group-hover:bg-blue-400 transition-colors relative rounded-full">
        <button
          onClick={onInsert}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md shadow-blue-500/20 transition-transform hover:scale-110"
          title="Insert File Here"
        >
          <Plus size={18} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
