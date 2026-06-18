import React from "react";
import { Check, ChevronDown, Plus } from "lucide-react";

export function ToolbarButton({ icon, text, dropdown, muted, disabled, onClick }: any) {
  const inactive = muted || disabled;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={event => {
        if (disabled) return;
        onClick?.(event);
      }}
      className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-md px-3 text-sm font-medium shadow-sm transition-colors"
      style={{
        background: "var(--dn-bg-card)",
        border: inactive ? "1px solid transparent" : "1px solid var(--dn-border)",
        color: inactive ? "var(--dn-t4)" : "var(--dn-t1)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.68 : 1,
      }}
      onMouseOver={e => !inactive && (e.currentTarget.style.color = "#3b82f6", e.currentTarget.style.borderColor = "#3b82f6")}
      onMouseOut={e => !inactive && (e.currentTarget.style.color = "var(--dn-t1)", e.currentTarget.style.borderColor = "var(--dn-border)")}
    >
      {icon}
      {text}
      {dropdown && <ChevronDown size={15} />}
    </button>
  );
}

export function PageCard({
  page,
  onToggle,
  selected,
  isFirst,
  onPreview,
  onDragStart,
  onDrop,
}: any) {
  return (
    <div className="group relative flex min-w-0 flex-col bg-transparent items-center justify-end h-full">
      <button
        type="button"
        onClick={onToggle}
        onDoubleClick={event => {
          event.stopPropagation();
          onPreview?.();
        }}
        draggable={Boolean(onDragStart)}
        onDragStart={onDragStart}
        onDragOver={event => onDrop && event.preventDefault()}
        onDrop={onDrop}
        className="relative block text-left transition-shadow"
        style={{
          cursor: onDragStart ? "grab" : "pointer",
          background: "transparent",
          boxShadow: selected ? "0 0 0 2px #2563eb" : "none",
          borderRadius: "4px",
          width: "100%",
          height: "auto",
        }}
      >
        <span
          className={`absolute left-2 top-2 z-10 grid h-5 w-5 place-items-center rounded-sm text-white transition-opacity ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          style={{
            background: selected ? "#2563eb" : "rgba(15,23,42,0.42)",
          }}
        >
          {selected && <Check size={11} strokeWidth={3} />}
        </span>

        {page.thumbnail ? (
          <img
            src={page.thumbnail}
            alt=""
            className="block w-full h-auto"
            style={{ 
              transform: `rotate(${page.rotation || 0}deg)`, 
              background: "#fff",
              borderRadius: "4px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
              objectFit: "contain",
            }}
          />
        ) : (
          <div className="w-full aspect-[1/1.414] grid place-items-center text-xs font-medium" style={{ background: "var(--dn-bg-subtle)", color: "var(--dn-t3)", borderRadius: "4px" }}>
            Generating...
          </div>
        )}
      </button>

      <span className="mt-2 truncate text-center text-xs font-medium w-full" style={{ color: "var(--dn-t2)" }}>
        {page.label || `Page ${page.pageNumber}`}
      </span>

      {isFirst && (
        <div className="sr-only">
          <p>{page.fileName}</p>
          <p>{page.totalPages} pages</p>
        </div>
      )}
    </div>
  );
}

export function AddMoreFilesTile({ onClick, referenceThumbnail, className = "" }: any) {
  const [aspectRatio, setAspectRatio] = React.useState("1 / 1.414");

  React.useEffect(() => {
    if (!referenceThumbnail) {
      setAspectRatio("1 / 1.414");
      return;
    }

    const image = new Image();
    image.onload = () => {
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      if (width > 0 && height > 0) setAspectRatio(`${width} / ${height}`);
    };
    image.src = referenceThumbnail;
  }, [referenceThumbnail]);

  return (
    <div className={`flex min-w-0 flex-col items-center justify-end bg-transparent ${className}`}>
      <button
        type="button"
        onClick={onClick}
        className="group flex w-full flex-col items-center justify-center rounded-[4px] border border-dashed p-3 text-center transition hover:border-blue-500 hover:bg-blue-500/10"
        style={{ borderColor: "var(--dn-border2)", background: "var(--dn-surface-2)", aspectRatio }}
      >
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full border transition group-hover:border-blue-500 group-hover:text-blue-500" style={{ borderColor: "var(--dn-border)", background: "var(--dn-bg-card)", color: "var(--dn-t3)" }}>
          <Plus size={20} />
        </div>
        <p className="text-sm font-semibold leading-tight text-blue-500">Add more files</p>
        <p className="mt-1 px-1 text-[11px] leading-snug" style={{ color: "var(--dn-t4)" }}>PDF, Word, Excel, Image, PowerPoint</p>
      </button>
      <span className="mt-2 h-4 w-full" />
    </div>
  );
}

export function Label({ text, label, children }: any) {
  const content = children ?? text ?? label;
  return <p className="mb-1.5 mt-3 text-xs font-medium" style={{ color: "var(--dn-t2)" }}>{content}</p>;
}

export function Select({ text, value, label }: any) {
  const content = value ?? text ?? label;
  return (
    <button type="button" className="flex h-9 w-full items-center justify-between rounded-md border px-3 text-sm shadow-sm transition-colors hover:opacity-80" style={{ borderColor: "var(--dn-border)", background: "var(--dn-bg-subtle)", color: "var(--dn-t1)" }}>
      <span className="truncate">{content}</span>
      <ChevronDown size={16} style={{ color: "var(--dn-t3)" }} />
    </button>
  );
}

export function ToggleRow({ text, label, children, active, checked, onToggle }: any) {
  const content = children ?? text ?? label;
  const isActive = checked ?? active;
  return (
    <div className="mt-4 flex cursor-pointer items-center justify-between" onClick={onToggle}>
      <span className="text-sm" style={{ color: "var(--dn-t1)" }}>{content}</span>
      <span className={`relative h-5 w-9 rounded-full transition-colors ${isActive ? 'bg-blue-600' : ''}`} style={!isActive ? { background: "var(--dn-border)" } : {}}>
        <span className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isActive ? 'right-1' : 'left-1'}`} />
      </span>
    </div>
  );
}

export function RadioRow({ text, label, children, active, checked, onClick, disabled }: any) {
  const content = children ?? text ?? label;
  const isActive = checked ?? active;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={Boolean(isActive)}
      disabled={disabled}
      onClick={event => {
        if (disabled) return;
        onClick?.(event);
      }}
      className="mt-2 flex min-h-11 w-full items-center gap-3 rounded-md border px-3 py-2 text-left text-sm font-medium transition-colors"
      style={{
        background: isActive ? "var(--dn-selected-bg)" : "var(--dn-bg-subtle)",
        borderColor: isActive ? "var(--dn-selected-border)" : "var(--dn-border)",
        color: isActive ? "var(--dn-t1)" : "var(--dn-t2)",
        boxShadow: isActive ? "inset 0 0 0 1px rgba(59,130,246,0.18), 0 8px 22px rgba(37,99,235,0.12)" : "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.62 : 1,
      }}
      onMouseOver={event => {
        if (disabled || isActive) return;
        event.currentTarget.style.borderColor = "rgba(59,130,246,0.52)";
        event.currentTarget.style.background = "rgba(59,130,246,0.07)";
      }}
      onMouseOut={event => {
        if (disabled || isActive) return;
        event.currentTarget.style.borderColor = "var(--dn-border)";
        event.currentTarget.style.background = "var(--dn-bg-subtle)";
      }}
    >
      <span
        className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-md border transition-colors"
        style={{
          background: isActive ? "#2563eb" : "transparent",
          borderColor: isActive ? "#2563eb" : "var(--dn-border2)",
          color: "#fff",
        }}
      >
        {isActive && <Check size={12} strokeWidth={3} />}
      </span>
      <span className="min-w-0 leading-snug">{content}</span>
    </button>
  );
}

export function DetailRow({ label, value }: any) {
  return (
    <div className="mb-2 flex justify-between text-sm">
      <span style={{ color: "var(--dn-t2)" }}>{label}</span>
      <span className="font-medium" style={{ color: "var(--dn-t1)" }}>{value}</span>
    </div>
  );
}

export function CheckBox({ checked }: any) {
  return (
    <span className={`grid h-4 w-4 place-items-center rounded border ${checked ? 'bg-blue-600 border-blue-600' : ''}`} style={!checked ? { background: "var(--dn-bg-card)", border: "1px solid var(--dn-border)" } : {}}>
      {checked && <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.33333 2.5L3.75 7.08333L1.66667 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </span>
  );
}
