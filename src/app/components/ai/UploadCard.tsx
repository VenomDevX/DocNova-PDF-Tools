import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, ArrowUpToLine, X, RefreshCw } from 'lucide-react';

interface UploadCardProps {
  file: File | null;
  onFileDrop: (file: File | null) => void;
}

export function UploadCard({ file, onFileDrop }: UploadCardProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileDrop(acceptedFiles[0]);
    }
  }, [onFileDrop]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
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
        <ArrowUpToLine size={34} className="text-[#2563eb]" />
      </div>
      <h3 className="text-2xl font-bold mb-2 z-10" style={{ color: 'var(--dn-t1)' }}>
        {isDragActive ? 'Drop your document here' : 'Drag & Drop Document'}
      </h3>
      <p className="text-[15px] mb-7 z-10" style={{ color: 'var(--dn-t3)' }}>
        or click to browse · Supports PDF (Max 50MB)
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
