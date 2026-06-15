import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Download, MessageSquare, RotateCcw, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface AIOutputPanelProps {
  data: string;
  onRegenerate: () => void;
}

export function AIOutputPanel({ data, onRegenerate }: AIOutputPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([data], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "DocNova_Result.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
          Generated Result
        </h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopy}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
          <button 
            onClick={handleDownloadTxt}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Download TXT"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 overflow-y-auto max-h-[500px]" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1D4ED8 transparent' }}>
        <div className="prose prose-invert prose-sm max-w-none prose-headings:text-blue-400 prose-a:text-blue-500">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {data}
          </ReactMarkdown>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-2">
        <button 
          onClick={onRegenerate}
          className="flex items-center justify-center gap-2 py-2.5 bg-[#1a1a1a] border border-gray-800 hover:border-gray-600 text-gray-300 rounded-lg text-sm font-medium transition-colors"
        >
          <RotateCcw size={16} />
          Regenerate
        </button>
        <button 
          className="flex items-center justify-center gap-2 py-2.5 bg-blue-900/30 border border-blue-500/30 hover:bg-blue-900/50 hover:border-blue-500/50 text-blue-300 rounded-lg text-sm font-medium transition-colors"
        >
          <MessageSquare size={16} />
          Ask Follow-up
        </button>
      </div>
    </motion.div>
  );
}
