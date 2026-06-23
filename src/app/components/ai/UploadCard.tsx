import React, { useCallback } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import { FileText, ArrowUpToLine, X, RefreshCw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// AI tools accept documents (PDF / Word / Excel) and images. Kept in one place so
// the dropzone and the file-preview/validation logic agree on what's allowed.
export const AI_UPLOAD_ACCEPT: Accept = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'image/bmp': ['.bmp'],
};

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // matches the backend document cap

interface UploadCardProps {
  file: File | null;
  onFileDrop: (file: File | null) => void;
  /** Tool-specific heading shown in the empty dropzone. */
  title?: string;
  /** Tool-specific value-prop line under the heading. */
  subtitle?: string;
  /** Tool-specific hint (file types / limits). */
  hint?: string;
  /** Tool-specific icon for the dropzone. */
  Icon?: LucideIcon;
  /** Override the accepted file types (defaults to the shared AI set). */
  accept?: Accept;
}

export function UploadCard({ file, onFileDrop, title, subtitle, hint, Icon = ArrowUpToLine, accept = AI_UPLOAD_ACCEPT }: UploadCardProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileDrop(acceptedFiles[0]);
    }
  }, [onFileDrop]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    maxSize: MAX_UPLOAD_BYTES,
    noClick: false,
  });

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (file) {
    return (
      <div className="rounded-2xl p-6 flex items-center justify-between" style={{ background: "var(--dn-bg-card)", border: "1px solid var(--dn-border)", boxShadow: "var(--dn-shadow)" }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[#2563eb]" style={{ background: "rgba(37,99,235,0.12)" }}>
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-medium truncate max-w-[250px] sm:max-w-xs" style={{ color: "var(--dn-t1)" }}>{file.name}</h3>
            <p className="text-sm" style={{ color: "var(--dn-t3)" }}>{formatSize(file.size)} • PDF Document</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={open}
            className="p-2 rounded-lg transition-colors flex items-center gap-2 text-sm hover:bg-[var(--dn-bg-subtle)]"
            style={{ color: "var(--dn-t3)" }}
          >
            <RefreshCw size={16} /> <span className="hidden sm:inline">Replace</span>
          </button>
          <button 
            onClick={() => onFileDrop(null)}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <X size={16} /> <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className="rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer group relative overflow-hidden h-[650px] w-full"
      style={{
        background: 'var(--dn-bg-card)',
        border: `1.5px dashed ${isDragActive ? '#2563eb' : 'var(--dn-border2)'}`,
        boxShadow: 'var(--dn-shadow)',
      }}
    >
      <input {...getInputProps()} />
      {/* Soft hover/drag glow */}
      <div
        className="absolute inset-0 transition-opacity duration-500 rounded-2xl pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 38%, rgba(37,99,235,0.10), transparent 60%)', opacity: isDragActive ? 1 : 0 }}
      ></div>
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500 z-10"
        style={{ background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.22)' }}
      >
        <Icon size={34} className="text-[#2563eb]" />
      </div>
      <h3 className="text-2xl font-bold mb-2 z-10" style={{ color: 'var(--dn-t1)' }}>
        {isDragActive ? 'Drop your file here' : (title ?? 'Drag & Drop Document')}
      </h3>
      <p className="text-[15px] mb-1 z-10" style={{ color: 'var(--dn-t2)' }}>
        {subtitle ?? 'Drag & drop, or click to browse'}
      </p>
      <p className="text-[13px] mb-7 z-10" style={{ color: 'var(--dn-t4)' }}>
        Click to browse · {hint ?? 'PDF · up to 50MB'}
      </p>
      <button
        className="px-6 py-2.5 rounded-full font-semibold text-sm transition-all z-10 inline-flex items-center gap-2 text-white shadow-[0_6px_18px_rgba(37,99,235,0.3)] hover:scale-[1.03] active:scale-95"
        style={{ background: 'linear-gradient(135deg,#2563eb,#0267b8)' }}
      >
        <ArrowUpToLine size={16} /> Browse Files
      </button>
    </div>
  );
}
