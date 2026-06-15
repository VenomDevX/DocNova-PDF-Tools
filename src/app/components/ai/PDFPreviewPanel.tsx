import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { CheckSquare, Square, ZoomIn, ZoomOut, ChevronUp, ChevronDown } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFPreviewPanelProps {
  file: File;
  selectedPages: number[];
  onPageSelect: (pages: number[]) => void;
}

export function PDFPreviewPanel({ file, selectedPages, onPageSelect }: PDFPreviewPanelProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState(0.9);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    if (selectedPages.length === 0) {
      onPageSelect(Array.from({ length: numPages }, (_, i) => i + 1));
    }
  };

  const togglePage = (pageNum: number) => {
    if (selectedPages.includes(pageNum)) {
      onPageSelect(selectedPages.filter(p => p !== pageNum));
    } else {
      onPageSelect([...selectedPages, pageNum].sort((a, b) => a - b));
    }
  };

  const handleSelectAll = () => {
    if (selectedPages.length === numPages) {
      onPageSelect([]);
    } else {
      onPageSelect(Array.from({ length: numPages }, (_, i) => i + 1));
    }
  };

  return (
    <div className="flex-1 flex flex-col relative w-full h-full min-h-0">
      {/* Floating Select All Button */}
      <div className="absolute top-4 left-4 z-20">
        <button 
          onClick={handleSelectAll}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors backdrop-blur-md"
        >
          {selectedPages.length === numPages ? <CheckSquare size={16} /> : <Square size={16} />}
          {selectedPages.length === numPages ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Scrollable PDF Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center custom-scrollbar">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center h-full text-blue-400 gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-mono">Loading PDF...</p>
            </div>
          }
          className="flex flex-col items-center gap-8"
        >
          {Array.from(new Array(numPages), (el, index) => (
            <div 
              key={`page_${index + 1}`} 
              className={`relative group cursor-pointer transition-all duration-300 shadow-2xl ${
                selectedPages.includes(index + 1) ? 'ring-4 ring-blue-500 rounded-sm scale-[1.02]' : 'hover:scale-[1.01] opacity-80 hover:opacity-100'
              }`}
              onClick={() => togglePage(index + 1)}
            >
              <div className={`absolute top-3 left-3 z-10 w-8 h-8 rounded-lg backdrop-blur-md border flex items-center justify-center transition-colors ${
                selectedPages.includes(index + 1) ? 'border-blue-500 bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'border-gray-400/50 bg-black/40 text-transparent group-hover:text-white/70'
              }`}>
                <CheckSquare size={18} className={selectedPages.includes(index + 1) ? "opacity-100" : "opacity-0 group-hover:opacity-100"} />
              </div>
              
              <div className="absolute bottom-3 right-3 z-10 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md text-xs text-white font-mono shadow-lg border border-white/10">
                Page {index + 1}
              </div>

              <Page 
                pageNumber={index + 1} 
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="bg-white"
              />
            </div>
          ))}
        </Document>
      </div>

      {/* Floating Zoom Controls Pill */}
      {numPages > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#1a1f24]/90 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 shadow-2xl z-20">
          <div className="flex items-center gap-1 border-r border-white/10 pr-3">
            <button 
              onClick={() => document.querySelector('.custom-scrollbar')?.scrollBy({ top: -500, behavior: 'smooth' })}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronUp size={18} />
            </button>
            <span className="font-mono text-xs text-white px-2">{selectedPages.length} / {numPages}</span>
            <button 
              onClick={() => document.querySelector('.custom-scrollbar')?.scrollBy({ top: 500, behavior: 'smooth' })}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronDown size={18} />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setScale(s => Math.max(0.5, s - 0.2))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ZoomOut size={16} />
            </button>
            <span className="font-mono text-xs text-white w-12 text-center">{Math.round(scale * 100)}%</span>
            <button 
              onClick={() => setScale(s => Math.min(2.0, s + 0.2))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
