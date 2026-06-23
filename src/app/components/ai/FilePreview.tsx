import React, { useEffect, useState } from 'react';
import { FileText, Table2, FileType2, FileQuestion } from 'lucide-react';
import { PDFPreviewPanel } from './PDFPreviewPanel';

interface FilePreviewProps {
  file: File;
  selectedPages: number[];
  onPageSelect: (pages: number[]) => void;
}

type Kind = 'pdf' | 'image' | 'word' | 'excel' | 'other';

function detectKind(file: File): Kind {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  if (type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  if (type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp)$/.test(name)) return 'image';
  if (name.endsWith('.docx') || type.includes('wordprocessingml')) return 'word';
  if (name.endsWith('.xlsx') || type.includes('spreadsheetml')) return 'excel';
  return 'other';
}

function formatSize(bytes: number): string {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Previews an uploaded AI-tool file by type: PDFs use the paged PDF viewer,
 * images render inline, and Office documents show a file card (they're parsed
 * server-side on generate, so an in-browser render isn't needed).
 */
export function FilePreview({ file, selectedPages, onPageSelect }: FilePreviewProps) {
  const kind = detectKind(file);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    if (kind !== 'image') return;
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, kind]);

  if (kind === 'pdf') {
    return <PDFPreviewPanel file={file} selectedPages={selectedPages} onPageSelect={onPageSelect} />;
  }

  if (kind === 'image') {
    return (
      <div className="flex-1 w-full flex items-center justify-center overflow-auto aether-scrollbar p-4">
        {imgUrl && (
          <img
            src={imgUrl}
            alt={file.name}
            className="max-w-full max-h-full object-contain rounded-xl"
            style={{ boxShadow: 'var(--dn-shadow)' }}
          />
        )}
      </div>
    );
  }

  // Word / Excel / other → file card with the right icon + a short note.
  const meta =
    kind === 'word'
      ? { Icon: FileText, label: 'Word Document', color: '#2563eb' }
      : kind === 'excel'
        ? { Icon: Table2, label: 'Excel Spreadsheet', color: '#16a34a' }
        : { Icon: FileQuestion, label: 'Document', color: 'var(--dn-t3)' };

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center text-center px-6">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'var(--dn-bg-subtle)', border: '1px solid var(--dn-border)' }}
      >
        <meta.Icon size={36} style={{ color: meta.color }} />
      </div>
      <h3 className="text-lg font-semibold mb-1 max-w-[320px] truncate" style={{ color: 'var(--dn-t1)' }} title={file.name}>
        {file.name}
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--dn-t3)' }}>
        {formatSize(file.size)} · {meta.label}
      </p>
      <div
        className="flex items-center gap-2 text-[13px] px-4 py-2 rounded-full max-w-[360px]"
        style={{ background: 'var(--dn-bg-subtle)', border: '1px solid var(--dn-border)', color: 'var(--dn-t3)' }}
      >
        <FileType2 size={14} />
        Ready to analyze — the text will be extracted when you generate.
      </div>
    </div>
  );
}
