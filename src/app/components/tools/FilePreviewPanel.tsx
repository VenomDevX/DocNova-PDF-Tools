import { motion } from "motion/react";
import { Check, Eye, FileText, GripVertical, Loader2, Trash2, X } from "lucide-react";
import { useState } from "react";
import type React from "react";

export interface PreviewPage {
  id: string;
  fileId: string;
  fileName: string;
  pageIndex: number;
  pageNumber: number;
  thumbnail?: string;
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
}

const panelStyle: React.CSSProperties = {
  border: "1px solid var(--dn-border)",
  background: "var(--dn-bg-card)",
  boxShadow: "var(--dn-shadow)",
};

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
}: FilePreviewPanelProps) {
  const [previewPage, setPreviewPage] = useState<PreviewPage | null>(null);
  const totalPages = files.reduce((sum, file) => sum + file.pages.length, 0);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: "1rem", alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ ...panelStyle, borderRadius: "18px", padding: "1rem", display: "flex", gap: "0.65rem", flexWrap: "wrap", alignItems: "center" }}>
          <ToolbarButton onClick={onSelectAllFiles}>Select All Files</ToolbarButton>
          <ToolbarButton onClick={onClearSelection}>Clear Selection</ToolbarButton>
          <ToolbarButton onClick={onInvertSelection}>Invert Selection</ToolbarButton>
          <div style={{ marginLeft: "auto", color: "var(--dn-t3)", fontSize: "0.78rem" }}>
            {queue.length} selected / {totalPages} pages
          </div>
        </div>

        {files.map(file => (
          <section key={file.id} style={{ ...panelStyle, borderRadius: "20px", padding: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(59,130,246,0.14)", display: "grid", placeItems: "center", color: "#60a5fa" }}>
                <FileText size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: "var(--dn-t1)", fontWeight: 750, fontSize: "0.92rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                <div style={{ color: "var(--dn-t4)", fontSize: "0.72rem" }}>{formatBytes(file.size)} • {file.pages.length || "..."} pages</div>
                {file.previewStatus && <div style={{ color: "#93c5fd", fontSize: "0.72rem", fontWeight: 750, marginTop: "0.18rem" }}>{file.previewStatus}</div>}
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: "0.45rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                <ToolbarButton onClick={() => onSelectFile(file.id)}>Select All</ToolbarButton>
                <ToolbarButton onClick={() => onDeselectFile(file.id)}>Deselect All</ToolbarButton>
                <IconButton label="Remove file" onClick={() => onRemoveFile(file.id)} danger>
                  <Trash2 size={14} />
                </IconButton>
              </div>
            </div>

            {file.loading && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(118px,1fr))", gap: "0.8rem" }}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} style={{ height: 168, borderRadius: 14, background: "var(--dn-bg-subtle)", border: "1px solid var(--dn-border)" }} />
                ))}
              </div>
            )}

            {file.error && (
              <div style={{ color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 12, padding: "0.85rem", fontSize: "0.84rem" }}>{file.error}</div>
            )}

            {!file.loading && !file.error && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "0.9rem" }}>
                {file.pages.map(page => {
                  const selected = selectedPageIds.has(page.id);
                  return (
                    <motion.div
                      key={page.id}
                      role="button"
                      tabIndex={0}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onTogglePage(page)}
                      onDoubleClick={() => setPreviewPage(page)}
                      onKeyDown={event => {
                        if (event.key === "Enter" || event.key === " ") onTogglePage(page);
                      }}
                      style={{
                        position: "relative",
                        border: selected ? "2px solid #3b82f6" : "1px solid rgba(148,163,184,0.18)",
                        background: selected ? "rgba(37,99,235,0.12)" : "var(--dn-bg-card)",
                        borderRadius: 14,
                        padding: "0.45rem",
                        cursor: "pointer",
                        boxShadow: selected ? "0 0 28px rgba(59,130,246,0.24)" : "var(--dn-shadow)",
                        color: "var(--dn-t1)",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      <button
                        type="button"
                        title="Open large preview"
                        aria-label={`Open ${page.fileName} page ${page.pageNumber} preview`}
                        onClick={event => {
                          event.stopPropagation();
                          setPreviewPage(page);
                        }}
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          zIndex: 2,
                          width: 30,
                          height: 30,
                          border: "1px solid rgba(96,165,250,0.32)",
                          borderRadius: 9,
                          background: "rgba(2,6,23,0.72)",
                          color: "#bfdbfe",
                          display: "grid",
                          placeItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        <Eye size={14} />
                      </button>
                      {page.thumbnail ? (
                        <img src={page.thumbnail} alt={`${page.fileName} page ${page.pageNumber}`} style={{ width: "100%", aspectRatio: "0.72", objectFit: "contain", borderRadius: 10, background: "#fff" }} />
                      ) : (
                        <div style={{ width: "100%", aspectRatio: "0.72", borderRadius: 10, background: "linear-gradient(90deg,#ffffff,#f1f5f9,#ffffff)", border: "1px solid rgba(148,163,184,0.24)", display: "grid", placeItems: "center", color: "#94a3b8", fontWeight: 850, fontSize: "0.74rem" }}>
                          Generating...
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem", marginTop: "0.45rem", color: selected ? "#93c5fd" : "var(--dn-t3)", fontSize: "0.74rem", fontWeight: 700 }}>
                        {selected && <Check size={12} />} Page {page.pageNumber}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>

      <aside style={{ ...panelStyle, borderRadius: "20px", padding: "1rem", position: "sticky", top: 96 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <div>
            <div style={{ color: "var(--dn-t1)", fontWeight: 850, fontSize: "0.98rem" }}>Merge Queue</div>
            <div style={{ color: "var(--dn-t4)", fontSize: "0.72rem" }}>{queue.length} pages • est. {estimatedSize}</div>
          </div>
          <Loader2 size={16} style={{ opacity: 0 }} />
        </div>

        {queue.length === 0 ? (
          <div style={{ minHeight: 180, border: "1px dashed var(--dn-border2)", borderRadius: 14, background: "var(--dn-bg-subtle)", display: "grid", placeItems: "center", color: "var(--dn-t4)", textAlign: "center", padding: "1rem", fontSize: "0.82rem" }}>
            Select pages to build the final merge order.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", maxHeight: "58vh", overflow: "auto", paddingRight: "0.15rem" }}>
            {queue.map((page, index) => (
              <motion.div
                key={page.id}
                layout
                draggable
                onDragStart={() => onDragStart(page.id)}
                onDragOver={event => event.preventDefault()}
                onDrop={() => onDropOnQueuePage(page.id)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "18px 42px minmax(0,1fr) 28px",
                  gap: "0.55rem",
                  alignItems: "center",
                  padding: "0.45rem",
                  borderRadius: 12,
                  border: draggingQueueId === page.id ? "1px solid #60a5fa" : "1px solid var(--dn-border)",
                  background: "var(--dn-bg-card)",
                  cursor: "grab",
                }}
              >
                <GripVertical size={14} color="var(--dn-t4)" />
                {page.thumbnail ? (
                  <img src={page.thumbnail} alt="" style={{ width: 42, height: 54, objectFit: "cover", borderRadius: 7, background: "#fff" }} />
                ) : (
                  <div style={{ width: 42, height: 54, borderRadius: 7, background: "#fff", border: "1px solid var(--dn-border)" }} />
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: "var(--dn-t1)", fontWeight: 750, fontSize: "0.78rem" }}>#{index + 1} • Page {page.pageNumber}</div>
                  <div style={{ color: "var(--dn-t4)", fontSize: "0.68rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{page.fileName}</div>
                </div>
                <IconButton label="Remove page" onClick={() => onRemoveQueuePage(page.id)} danger>
                  <X size={13} />
                </IconButton>
              </motion.div>
            ))}
          </div>
        )}
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
                style={{ marginLeft: "auto", width: 34, height: 34, border: "none", borderRadius: 10, background: "rgba(148,163,184,0.12)", color: "var(--dn-t2)", display: "grid", placeItems: "center", cursor: "pointer" }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ maxHeight: "calc(92vh - 68px)", overflow: "auto", background: "var(--dn-bg-subtle)", padding: "1rem" }}>
              {previewPage.thumbnail ? (
                <img src={previewPage.thumbnail} alt={`${previewPage.fileName} page ${previewPage.pageNumber}`} style={{ display: "block", width: "100%", height: "auto", background: "#fff", borderRadius: 12 }} />
              ) : (
                <div style={{ minHeight: 520, borderRadius: 12, background: "#fff", display: "grid", placeItems: "center", color: "#94a3b8", fontWeight: 850 }}>Preview still generating...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolbarButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: "1px solid var(--dn-badge-bd)",
        background: "var(--dn-badge-bg)",
        color: "var(--dn-badge-text)",
        borderRadius: 999,
        padding: "0.42rem 0.72rem",
        fontSize: "0.74rem",
        fontWeight: 750,
        cursor: "pointer",
        fontFamily: "'Inter', sans-serif",
        boxShadow: "0 0 18px rgba(37,99,235,0.12)",
      }}
    >
      {children}
    </button>
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
        width: 28,
        height: 28,
        border: "none",
        borderRadius: 8,
        display: "grid",
        placeItems: "center",
        background: danger ? "rgba(239,68,68,0.12)" : "rgba(148,163,184,0.12)",
        color: danger ? "#f87171" : "var(--dn-t3)",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
