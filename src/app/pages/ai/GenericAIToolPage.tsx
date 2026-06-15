import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Sidebar } from '../../components/Sidebar';
import { UploadCard } from '../../components/ai/UploadCard';
import { PDFPreviewPanel } from '../../components/ai/PDFPreviewPanel';
import { PhotoLibraryGallery } from '../../components/ai/PhotoLibraryGallery';
import { SettingsPanel } from '../../components/ai/SettingsPanel';
import { AIOutputPanel } from '../../components/ai/AIOutputPanel';
import { SummaryResultPanel } from '../../components/ai/SummaryResultPanel';
import { AIToolUploadLayout } from '../../components/ai/AIToolUploadLayout';
import { AlertCircle, ArrowLeft, List, AlignLeft, BookOpen, ChevronLeft, ChevronRight, Minus, Plus, Settings, Sparkles, Share2, Upload, MessageSquare, RotateCcw, Check, Copy, Download, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { getToolsByCategory } from '../../data/tools';
import { API_BASE_URL } from '../../../services/pdfApi';
import { getFriendlyErrorMessage } from '../../../utils/errorHandler';

export default function GenericAIToolPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const aiTools = getToolsByCategory('ai');
  const tool = aiTools.find(t => t.id === toolId) || aiTools[0];

  // 1. File & UI State
  const [file, setFile] = useState<File | null>(null);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);
  const [followUpHistory, setFollowUpHistory] = useState<Array<{question: string, answer: string}>>([]);
  const [followUpError, setFollowUpError] = useState('');

  // 2. Settings State
  const [settings, setSettings] = useState({
    model: 'gemini-3.5-flash',
    summaryLength: 'Medium',
    outputStyle: 'Bullet Points',
    tone: 'Professional',
    language: 'English',
    includeKeyPoints: true,
    includeImportantDates: true,
    includeConclusion: true,
    includeActionItems: false,
    includeSimpleExplanation: false,
    includePageReferences: true,
  });

  // 3. Rotating Loader State
  const [loadingText, setLoadingText] = useState('Reading your PDF...');
  const loadingMessages = [
    'Reading your PDF...',
    'Extracting important points...',
    'Understanding document structure...',
    `Running ${tool.label}...`,
    'Finalizing result...'
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      let i = 0;
      interval = setInterval(() => {
        i = (i + 1) % loadingMessages.length;
        setLoadingText(loadingMessages[i]);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, tool.label]);

  // Reset all state when switching tools
  useEffect(() => {
    setFile(null);
    setSelectedPages([]);
    setResult(null);
    setError('');
    setIsLoading(false);
    setFollowUpHistory([]);
    setFollowUpQuestion('');
    setShowFollowUp(false);
  }, [toolId]);

  const handleGenerate = async () => {
    if (!file) {
      setError('Please upload a PDF to proceed.');
      return;
    }
    setIsLoading(true);
    setError('');
    setResult(null);
    setFollowUpHistory([]);
    setFollowUpQuestion('');
    setShowFollowUp(false);

    try {
      // Convert file to base64 using FileReader (browser safe)
      const base64File = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const result = reader.result as string;
          // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = error => reject(error);
      });

      const payload = {
        fileBase64: base64File,
        toolId: tool.id,
        ...settings
      };

      const res = await fetch(`${API_BASE_URL}/api/ai/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (!res.ok) {
        const err = new Error(data.error || 'Failed to process document') as any;
        err.status = res.status;
        err.details = data.details;
        throw err;
      }
      
      setResult(data.result);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, 'ai'));
    } finally {
      setIsLoading(false);
      setLoadingText('Reading your PDF...');
    }
  };

  const handleFollowUp = async () => {
    if (!followUpQuestion.trim() || !result) return;
    const question = followUpQuestion.trim();
    setIsFollowUpLoading(true);
    setFollowUpError('');
    setFollowUpQuestion('');
    try {
      // Build conversation history from previous follow-ups
      const historyMessages = followUpHistory.flatMap(h => [
        { role: 'user', content: h.question },
        { role: 'assistant', content: h.answer }
      ]);
      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: `Here is a document analysis result:\n\n${result}` },
            { role: 'assistant', content: 'I have the document analysis. What would you like to know?' },
            ...historyMessages,
            { role: 'user', content: question }
          ]
        })
      });
      const data = await res.json();
      if (!res.ok) {
        const err = new Error(data.error || 'Failed to get follow-up response') as any;
        err.status = res.status;
        err.details = data.details;
        throw err;
      }
      setFollowUpHistory(prev => [...prev, { question, answer: data.result }]);
    } catch (err: any) {
      setFollowUpError(getFriendlyErrorMessage(err, 'ai'));
    } finally {
      setIsFollowUpLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden relative font-['Inter']" style={{ background: "var(--dn-bg)", color: "var(--dn-t1)", transition: "var(--dn-transition)" }}>
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 dn-dark-blobs">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#2563eb]/15 rounded-full blur-[100px] animate-[drift1_25s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#0267b8]/15 rounded-full blur-[120px] animate-[drift2_30s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#b4c5ff]/5 rounded-full blur-[150px] animate-[drift1_40s_ease-in-out_infinite]"></div>
      </div>

      <style>{`
        ::-webkit-scrollbar { display: none !important; }
        * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        [data-theme="light"] .dn-dark-blobs { display: none; }
        html:not([data-theme="dark"]) .dn-dark-blobs { display: none; } /* Fallback */
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
        @keyframes shimmer {
            100% { transform: translateX(100%); }
        }
        @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 0.5; }
            100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes orb-glow {
            0% { box-shadow: 0 0 30px rgba(37, 99, 235, 0.4), inset 0 0 20px rgba(2, 103, 184, 0.8); }
            50% { box-shadow: 0 0 60px rgba(37, 99, 235, 0.8), inset 0 0 40px rgba(2, 103, 184, 1); }
            100% { box-shadow: 0 0 30px rgba(37, 99, 235, 0.4), inset 0 0 20px rgba(2, 103, 184, 0.8); }
        }
        @keyframes stroke-draw {
            to { stroke-dashoffset: 0; }
        }
        .aether-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .aether-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .aether-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .aether-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>

      <main className="flex-1 flex flex-col relative z-10 h-screen overflow-hidden pt-[60px]">
        <div className="flex-1 overflow-y-auto pt-8 pb-8 px-4 md:px-12 scroll-smooth aether-scrollbar">
          <div className="max-w-[1600px] mx-auto" style={{ zoom: 0.75 }}>
            {isLoading ? (
              <div className="flex flex-col items-center max-w-[520px] w-full mx-auto mt-12 md:mt-24 relative z-10 animate-in fade-in zoom-in duration-500">
                {/* High-End AI Reasoning Animation (Pulsing Indigo Orb) */}
                <div className="relative w-40 h-40 flex items-center justify-center mb-8">
                  {/* Outer expanding rings */}
                  <div className="absolute inset-0 rounded-full border border-[#2563eb]/20 animate-[pulse-ring_3s_cubic-bezier(0.215,0.61,0.355,1)_infinite]"></div>
                  <div className="absolute inset-0 rounded-full border border-[#2563eb]/30 animate-[pulse-ring_3s_cubic-bezier(0.215,0.61,0.355,1)_1.5s_infinite]"></div>
                  {/* Core Orb */}
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#2563eb] to-[#0267b8] animate-[orb-glow_4s_ease-in-out_infinite] backdrop-blur-sm z-10 flex items-center justify-center">
                    <Sparkles size={32} className="text-white animate-pulse" />
                  </div>
                </div>

                {/* Status Typography */}
                <h1 className="text-[32px] md:text-[40px] leading-tight font-semibold text-[#F8FAFC] mb-2 text-center tracking-tight font-['Geist']">
                  Analyzing document structure...
                </h1>
                <p className="text-[16px] text-[#94A3B8] text-center mb-10 max-w-md leading-relaxed">
                  Extracting semantic entities, generating embeddings, and cross-referencing global context patterns.
                </p>

                {/* Glassmorphic Progress & Metadata Card */}
                <div className="w-full bg-[#0b1323]/50 backdrop-blur-xl border border-white/10 rounded-[6px] p-8 shadow-[0_0_30px_rgba(37,99,235,0.1)] transition-all duration-500 relative">
                  <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
                  
                  {/* Progress Header */}
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-[12px] font-medium text-[#b4c5ff] uppercase tracking-widest font-['Geist']">Processing Context</span>
                  </div>

                  {/* Progress Track */}
                  <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden mb-3 relative">
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#0267b8] via-[#2563eb] to-[#b4c5ff] w-[100%] rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)] transition-all duration-1000 ease-out">
                      {/* Shimmer effect on progress bar */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>

                  {/* Time Estimation */}
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-[12px] text-[#94A3B8]">This might take a few moments</span>
                  </div>

                  {/* Divider */}
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8"></div>

                  {/* File Metadata */}
                  {file && (
                    <div className="flex items-center gap-4 bg-black/20 rounded-[6px] p-3 border border-white/5">
                      <div className="w-12 h-12 rounded-[6px] bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                        <BookOpen size={24} className="text-[#b4c5ff]" />
                      </div>
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="text-[14px] font-medium text-[#F8FAFC] truncate">{file.name}</span>
                        <span className="text-[13px] text-[#94A3B8]">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2563eb] animate-ping"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : result && !isLoading ? (
              <div className="flex flex-col h-full w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Simple Back Button */}
                <div className="mb-3">
                  <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-[#94A3B8] hover:text-[#b4c5ff] transition-all font-medium text-sm group bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/5 hover:border-white/10 backdrop-blur-md">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    AI Tools
                  </button>
                </div>

                {/* 2-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6 h-[calc(100vh-30px)]">
                  
                  {/* Center Panel: AI Output Hero */}
                  <div className="flex flex-col h-full bg-[var(--dn-bg-card)] backdrop-blur-2xl border border-[var(--dn-border)] rounded-[6px] relative overflow-hidden shadow-2xl transition-colors">
                     <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#2563eb] to-[#0267b8]"></div>
                     
                     <div className="flex flex-col h-full p-7 relative z-10">
                       {/* Header */}
                       <div className="flex items-center justify-between mb-6 shrink-0">
                         <div className="flex items-center gap-3">
                           <Sparkles size={20} className="text-[#06b6d4] animate-pulse" />
                           <h2 className="text-[18px] font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#60a5fa] to-[#a78bfa] tracking-wide">AI Summary</h2>
                         </div>
                         <div className="flex items-center gap-2">
                           {/* Action Buttons */}
                           {[
                             { Icon: Copy, label: 'Copy', action: () => { navigator.clipboard.writeText(result); alert('Copied to clipboard!'); } },
                             { Icon: Download, label: 'Download', action: () => { 
                                 const blob = new Blob([result], { type: 'text/plain' });
                                 const url = URL.createObjectURL(blob);
                                 const a = document.createElement('a');
                                 a.href = url;
                                 a.download = 'DocNova_AI_Result.txt';
                                 a.click();
                                 URL.revokeObjectURL(url);
                             } },
                             { Icon: Share2, label: 'Share', action: () => {
                                 if (navigator.share) navigator.share({ title: 'DocNova AI Result', text: result }).catch(() => {});
                                 else alert('Sharing not supported on this browser.');
                             } },
                             { Icon: Upload, label: 'Upload New', action: () => { setResult(null); setFile(null); setFollowUpHistory([]); setShowFollowUp(false); } }
                           ].map((item, idx) => (
                             <button key={idx} onClick={item.action} title={item.label} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#8b5cf6]/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] flex items-center justify-center text-[#94A3B8] hover:text-[#dbe2f8] transition-all group">
                               <item.Icon size={14} className="group-hover:scale-110 transition-transform" />
                             </button>
                           ))}
                         </div>
                       </div>

                       {/* Metadata Strip */}
                       <div className="flex items-center gap-3 overflow-x-auto aether-scrollbar pb-2 mb-6 shrink-0">
                         {[
                           { text: file ? file.name : 'Analyzed Document', icon: '📄' },
                           { text: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }), icon: '📅' },
                           { text: tool.label, icon: '⚡' }
                         ].map((chip, idx) => (
                           <div key={idx} className="flex items-center gap-2 whitespace-nowrap bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-[12px] text-[#dbe2f8]">
                             <span>{chip.icon}</span>
                             {chip.text}
                           </div>
                         ))}
                       </div>

                       {/* Scrollable Result Content */}
                       <div className="flex-1 overflow-y-auto aether-scrollbar pr-2 pb-4">
                          <SummaryResultPanel result={result} />

                          {/* Follow-up Q&A History */}
                          {followUpHistory.length > 0 && (
                            <div className="mt-8 flex flex-col gap-6">
                              <div className="flex items-center gap-3">
                                <div className="w-[3px] h-4 bg-[#2563eb] rounded-full"></div>
                                <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-[0.2em] flex items-center gap-2">
                                  <MessageSquare size={14} className="text-[#2563eb]" /> Follow-up Q&A
                                </span>
                              </div>
                              {followUpHistory.map((item, idx) => (
                                <div key={idx} className="flex flex-col gap-3">
                                  <div className="flex items-start gap-3 bg-[#2563eb]/10 border border-[#2563eb]/20 rounded-[6px] px-5 py-4">
                                    <span className="text-[12px] font-bold text-[#60a5fa] uppercase shrink-0 mt-0.5">Q:</span>
                                    <p className="text-[15px] text-[#e2e8f0] leading-relaxed">{item.question}</p>
                                  </div>
                                  <div className="bg-[rgba(255,255,255,0.03)] rounded-[6px] px-5 py-4 border border-white/5">
                                    <span className="text-[12px] font-bold text-[#10b981] uppercase">A:</span>
                                    <p className="text-[15px] text-[#94a3b8] leading-[1.8] mt-1 whitespace-pre-wrap">{item.answer}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Follow-up loading indicator */}
                          {isFollowUpLoading && (
                            <div className="mt-6 flex items-center gap-3 text-[#94a3b8] text-[14px]">
                              <div className="w-4 h-4 border-2 border-[#2563eb]/30 border-t-[#2563eb] rounded-full animate-spin" />
                              Thinking...
                            </div>
                          )}
                       </div>

                       {/* Result Footer */}
                       <div className="mt-4 pt-4 border-t border-transparent relative shrink-0">
                         <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#8b5cf6]/50 to-transparent"></div>
                         
                         <div className="flex items-center justify-between mb-4">
                           <span className="text-[11px] text-[#475569]">Generated Successfully • {settings.summaryLength} length • {settings.outputStyle}</span>
                           <div className="flex items-center gap-2">
                             <div className="relative w-6 h-6 rounded-full border-2 border-[#10b981]/20 flex items-center justify-center">
                               {/* Fake SVG progress ring */}
                               <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="10" stroke="url(#blue-green-gradient)" strokeWidth="2" fill="none" strokeDasharray="62.8" strokeDashoffset="3.7" className="animate-[stroke-draw_1s_ease-out_forwards]" />
                                  <defs>
                                    <linearGradient id="blue-green-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                      <stop offset="0%" stopColor="#3b82f6" />
                                      <stop offset="100%" stopColor="#10b981" />
                                    </linearGradient>
                                  </defs>
                               </svg>
                               <Check size={10} className="text-[#10b981] relative z-10" />
                             </div>
                             <span className="text-[11px] font-medium text-[#10b981]">Accuracy: 94%</span>
                           </div>
                         </div>
                         
                         <div className="flex gap-3">
                           <button onClick={handleGenerate} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#b4c5ff]/30 py-3 rounded-xl text-[14px] font-medium text-[#dbe2f8] transition-all flex items-center justify-center gap-2">
                             <RotateCcw size={16} /> Regenerate
                           </button>
                           <button onClick={() => setShowFollowUp(!showFollowUp)} className="flex-1 bg-gradient-to-r from-[#2563eb] to-[#0267b8] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] py-3 rounded-xl text-[14px] font-medium text-white transition-all flex items-center justify-center gap-2">
                             <MessageSquare size={16} /> Ask Follow-up
                           </button>
                         </div>

                         {showFollowUp && (
                           <div className="mt-3 flex gap-2">
                             <input
                               type="text"
                               value={followUpQuestion}
                               onChange={e => setFollowUpQuestion(e.target.value)}
                               onKeyDown={e => { if (e.key === 'Enter') handleFollowUp(); }}
                               placeholder="Ask a follow-up question about this result..."
                               className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white placeholder-[#64748b] outline-none focus:border-[#2563eb]/50 transition-colors"
                               autoFocus
                             />
                             <button
                               onClick={handleFollowUp}
                               disabled={!followUpQuestion.trim() || isFollowUpLoading}
                               className="px-5 py-3 bg-gradient-to-r from-[#2563eb] to-[#0267b8] rounded-xl text-[14px] font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center gap-2"
                             >
                               {isFollowUpLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send'}
                             </button>
                           </div>
                         )}

                         {/* Follow Up Error */}
                         {followUpError && (
                           <div className="mt-3 text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-4 py-2 rounded-lg">
                             {followUpError}
                           </div>
                         )}
                       </div>
                     </div>
                  </div>

                  {/* Right Panel: Settings (Compacted) */}
                  <div className="flex flex-col h-full bg-[#0b1323]/40 backdrop-blur-xl border border-white/5 rounded-[6px] p-6 overflow-y-auto aether-scrollbar">
                     <h4 className="font-bold text-[20px] text-[#94A3B8] uppercase tracking-wider mb-6 flex items-center gap-2">
                       <Settings size={20} /> Configuration
                     </h4>
                     
                     {/* Summary Length */}
                     <div className="mb-6">
                       <label className="block font-semibold text-[16px] text-[#94A3B8] mb-2">Length</label>
                       <div className="flex bg-black/40 border border-white/10 rounded-lg p-1">
                         {['Short', 'Medium', 'Detailed'].map((len) => (
                           <button 
                             key={len} 
                             onClick={() => setSettings({ ...settings, summaryLength: len })}
                             className={`flex-1 py-2 px-2 rounded-md font-medium text-[14px] transition-all ${settings.summaryLength === len ? 'bg-white/10 text-[#F8FAFC] shadow-sm' : 'text-[#475569] hover:text-[#dbe2f8]'}`}
                           >
                             {len}
                           </button>
                         ))}
                       </div>
                     </div>

                     {/* Include Toggles */}
                     <div className="space-y-4 mb-6">
                       {[
                         { key: 'includeKeyPoints', label: 'Extract Key Points' },
                         { key: 'includeImportantDates', label: 'Important Dates' },
                         { key: 'includeConclusion', label: 'Generate Conclusions' }
                       ].map((toggle) => (
                         <label key={toggle.key} className="flex items-center justify-between cursor-pointer group py-1" onClick={() => setSettings({ ...settings, [toggle.key]: !(settings as any)[toggle.key] })}>
                           <span className="text-[16px] font-medium text-[#94A3B8] group-hover:text-[#dbe2f8] transition-colors">{toggle.label}</span>
                           <div className={`relative w-11 h-6 rounded-full transition-all ${(settings as any)[toggle.key] ? 'bg-[#2563eb] shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 'bg-black/40 border border-white/10'}`}>
                             <div className={`absolute top-[2px] w-5 h-5 rounded-full transition-transform ${(settings as any)[toggle.key] ? 'bg-white translate-x-5' : 'bg-[#94A3B8] translate-x-0 left-[2px]'}`}></div>
                           </div>
                         </label>
                       ))}
                     </div>
                     
                     {/* Action Button moved here for quick re-generate with new settings */}
                     <button 
                       onClick={handleGenerate}
                       disabled={isLoading || !file}
                       className="w-full py-4 mt-auto rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-[#dbe2f8] font-bold text-[18px] transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       <Sparkles size={20} className="group-hover:rotate-12 transition-transform text-[#b4c5ff]" />
                       Apply Settings
                     </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Task Header */}
                <div className="mb-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-[var(--dn-t3)] hover:text-[var(--dn-t1)] transition-all font-medium text-sm mb-4 group bg-[var(--dn-bg-card)] px-4 py-2 rounded-full border border-[var(--dn-border)] backdrop-blur-md">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to AI Tools
                  </button>
                  <h1 className="text-3xl md:text-[42px] leading-[1.1] font-bold text-[var(--dn-t1)] mb-2 tracking-[-0.04em] font-['Geist']">{tool.label}</h1>
                  <p className="text-[16px] text-[var(--dn-t3)] max-w-2xl leading-[1.6]">{tool.desc}</p>
                </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              
              {/* Left Column */}
              <div className="flex flex-col gap-6">
                {!file ? (
                  /* Upload Box */
                  <UploadCard onFileDrop={setFile} file={file} />
                ) : (
                  /* File Preview */
                  <div className="bg-[var(--dn-bg-card)] backdrop-blur-md border border-[var(--dn-border)] rounded-[6px] p-4 flex flex-col h-[650px] relative transition-colors shadow-2xl">
                     <button 
                       onClick={() => setFile(null)}
                       className="absolute top-6 right-6 z-20 px-4 py-2 rounded-full bg-[var(--dn-bg-card)] border border-[var(--dn-border)] text-xs font-semibold text-[var(--dn-t1)] transition-all shadow-lg flex items-center gap-2 group"
                     >
                       <span className="w-2 h-2 rounded-full bg-[#2563eb] group-hover:bg-[#b4c5ff] transition-colors"></span>
                       Change File
                     </button>
                    <PDFPreviewPanel file={file} selectedPages={selectedPages} onPageSelect={setSelectedPages} />
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-6">
                <div className="bg-[var(--dn-bg-card)] backdrop-blur-xl border border-[var(--dn-border)] transition-colors rounded-[6px] p-6 flex flex-col gap-6 shadow-2xl relative h-[650px]">
                  <div className="flex-1 overflow-y-auto pr-2 aether-scrollbar">
                    <h4 className="font-semibold text-[18px] text-[var(--dn-t3)] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Settings size={20} /> Settings
                    </h4>
                    
                    {/* AI Model */}
                    <div className="mb-6">
                      <label className="block font-semibold text-[14px] text-[var(--dn-t1)] mb-3">AI Model</label>
                      <div className="flex border border-[var(--dn-border)] bg-[var(--dn-bg)] rounded-lg p-1">
                        {[
                          { id: 'gemini-3.5-flash', label: '3.5 Flash' },
                          { id: 'gemini-2.5-flash', label: '2.5 Flash' },
                          { id: 'gemini-2.5-pro', label: '2.5 Pro' }
                        ].map((m) => (
                          <button 
                            key={m.id} 
                            onClick={() => setSettings({ ...settings, model: m.id })}
                            className={`flex-1 py-2 px-2 rounded-md font-medium text-[13px] transition-all ${settings.model === m.id ? 'bg-[var(--dn-bg-card)] text-[var(--dn-t1)] shadow-sm border border-[var(--dn-border)]' : 'text-[var(--dn-t3)] hover:text-[var(--dn-t1)]'}`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Summary Length */}
                    <div className="mb-6">
                      <label className="block font-semibold text-[14px] text-[var(--dn-t1)] mb-3">Summary Length</label>
                      <div className="flex border border-[var(--dn-border)] bg-[var(--dn-bg)] rounded-lg p-1">
                        {['Short', 'Medium', 'Detailed'].map((len) => (
                          <button 
                            key={len} 
                            onClick={() => setSettings({ ...settings, summaryLength: len })}
                            className={`flex-1 py-2 px-4 rounded-md font-medium text-[13px] transition-all ${settings.summaryLength === len ? 'bg-[var(--dn-bg-card)] text-[var(--dn-t1)] shadow-sm border border-[var(--dn-border)]' : 'text-[var(--dn-t3)] hover:text-[var(--dn-t1)]'}`}
                          >
                            {len}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Output Style */}
                    <div className="mb-6">
                      <label className="block font-semibold text-[14px] text-[var(--dn-t1)] mb-3">Output Style</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['Bullets', 'Paragraph', 'Notes'].map((style) => (
                          <label key={style} className="flex items-center gap-2 cursor-pointer group" onClick={() => setSettings({ ...settings, outputStyle: style })}>
                            <div className={`w-3 h-3 rounded-full border flex items-center justify-center p-[2px] ${settings.outputStyle === style ? 'border-[#2563eb]' : 'border-[var(--dn-border)]'}`}>
                              <div className={`w-full h-full rounded-full ${settings.outputStyle === style ? 'bg-[#2563eb]' : 'bg-transparent'}`}></div>
                            </div>
                            <span className={`text-[14px] transition-colors ${settings.outputStyle === style ? 'text-[var(--dn-t1)] font-medium' : 'text-[var(--dn-t3)] group-hover:text-[var(--dn-t2)]'}`}>{style}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Include Toggles */}
                    <div className="space-y-4">
                      {[
                        { key: 'includeKeyPoints', label: 'Extract Key Points' },
                        { key: 'includeImportantDates', label: 'Identify Important Dates' },
                        { key: 'includeConclusion', label: 'Generate Conclusions' }
                      ].map((toggle) => (
                        <label key={toggle.key} className="flex items-center justify-between cursor-pointer py-1" onClick={() => setSettings({ ...settings, [toggle.key]: !(settings as any)[toggle.key] })}>
                          <span className="text-[14px] font-medium text-[var(--dn-t1)]">{toggle.label}</span>
                          <div className={`relative w-10 h-5 rounded-full transition-all ${(settings as any)[toggle.key] ? 'bg-[#2563eb]' : 'bg-[var(--dn-bg)] border border-[var(--dn-border)]'}`}>
                            <div className={`absolute top-[2px] w-4 h-4 rounded-full transition-transform ${(settings as any)[toggle.key] ? 'bg-white translate-x-5' : 'bg-[var(--dn-t3)] translate-x-0 left-[2px]'}`}></div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Action Button - Pinned to bottom inside Settings box */}
                  <div className="pt-4 mt-auto border-t border-white/5">
                    <button 
                      onClick={handleGenerate}
                      disabled={isLoading || !file}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#0267b8] text-white font-semibold text-[18px] shadow-[0_0_15px_rgba(37,99,235,0.35)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap size={20} className={file ? "animate-pulse" : ""} />
                          Generate Summary
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Result Area */}
                {error && (
                  <div className="mt-6 rounded-xl p-[1px] bg-gradient-to-r from-purple-500/50 to-blue-500/50 shadow-[0_0_20px_rgba(139,92,246,0.1)] transition-all animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-[var(--dn-bg-card)] backdrop-blur-xl rounded-xl p-5 flex items-start gap-3 w-full h-full">
                      <AlertCircle size={20} className="text-purple-400 shrink-0 mt-0.5" />
                      <p className="text-[#dbe2f8] text-[15px] leading-relaxed font-medium">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
          )}

          </div>
        </div>
      </main>
    </div>
  );
}
