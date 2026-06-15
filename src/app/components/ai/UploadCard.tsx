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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
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
      <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-900/30 flex items-center justify-center text-blue-500">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="text-white font-medium truncate max-w-[250px] sm:max-w-xs">{file.name}</h3>
            <p className="text-gray-400 text-sm">{formatSize(file.size)} • PDF Document</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {}} // Trigger a hidden input to replace file if needed
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2 text-sm"
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
      className={`bg-[var(--dn-bg-card)] backdrop-blur-xl border border-[var(--dn-border)] rounded-[6px] p-8 flex flex-col items-center justify-center text-center hover:border-[var(--dn-accent)] transition-colors cursor-pointer group relative overflow-hidden h-[650px] w-full ${isDragActive ? 'border-[var(--dn-accent)]' : ''}`}
    >
      <input {...getInputProps()} />
      <div className={`absolute inset-0 group-hover:bg-[#b4c5ff]/5 transition-colors duration-500 rounded-[6px] ${isDragActive ? 'bg-[#b4c5ff]/10' : ''}`}></div>
      <div className="w-16 h-16 rounded-full bg-[var(--dn-border)] border border-[var(--dn-border)] flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500 z-10">
        <ArrowUpToLine size={32} className="text-[#2563eb]" />
      </div>
      <h3 className="text-2xl font-semibold text-[var(--dn-t1)] mb-2 z-10">
        {isDragActive ? 'Drop Document Here' : 'Drag & Drop Document'}
      </h3>
      <p className="text-base text-[var(--dn-t3)] mb-6 z-10">
        Supports PDF, DOCX, TXT (Max 50MB)
      </p>
      <button className="bg-[var(--dn-border)] hover:bg-[var(--dn-border)] border border-[var(--dn-border)] text-[var(--dn-t1)] px-6 py-2 rounded-full font-medium text-sm transition-all z-10">
        Browse Files
      </button>
    </div>
  );
}
