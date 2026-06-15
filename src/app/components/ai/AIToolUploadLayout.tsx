import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'motion/react';
import { 
  SlidersHorizontal, FileText, Activity, Upload, Cloud, 
  FolderSync, LineChart, Scale, FlaskConical, MessageSquare 
} from 'lucide-react';
import { Tool } from '../../data/tools';

interface AIToolUploadLayoutProps {
  onFileDrop: (file: File) => void;
  tool: Tool;
  settings: any;
  setSettings: (settings: any) => void;
}

export function AIToolUploadLayout({ onFileDrop, tool, settings, setSettings }: AIToolUploadLayoutProps) {
  const [isExtractCitations, setIsExtractCitations] = useState(false);
  const [summaryMode, setSummaryMode] = useState('executive'); // executive, deep, tldr
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileDrop(acceptedFiles[0]);
      }
    }
  });

  return (
    <div className="ai-upload-theme flex-1 h-full p-4 md:px-6 md:py-4 overflow-hidden w-full flex flex-col relative selection:bg-[var(--color-primary)]/30 selection:text-[var(--color-primary-fixed)]">
      <style>{`
        .ai-upload-theme {
          --color-surface: #0a0a0a;
          --color-on-surface: #ffffff;
          --color-on-surface-variant: #94a3b8;
          --color-outline-variant: rgba(255,255,255,0.1);

          --color-primary: #3b82f6;
          --color-secondary: #8b5cf6;
          --color-error: #ef4444;

          --color-background: #020817;
          
          background: transparent;
          color: var(--color-on-surface);
          font-family: 'Inter', sans-serif;
          
          /* Hide scrollbar for Chrome, Safari and Opera */
          &::-webkit-scrollbar {
            display: none;
          }
          /* Hide scrollbar for IE, Edge and Firefox */
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        body, .dn-main-wrap {
          background: radial-gradient(circle at 50% 0%, #051B3A 0%, #020817 70%) !important;
        }
        
        nav {
          background: transparent !important;
          border-bottom: none !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
        }

        .ai-glass-card {
            background-color: rgba(5, 27, 58, 0.4);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.05);
            transition: all 0.3s ease;
        }
        
        .ai-glass-card:hover {
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 30px rgba(59, 130, 246, 0.15);
        }

        .ai-glass-panel {
            background-color: rgba(3, 18, 38, 0.5);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            transition: all 0.2s ease;
        }
        
        .ai-glass-panel:hover {
            background-color: rgba(59, 130, 246, 0.1);
            border-color: rgba(59, 130, 246, 0.3);
        }

        .ai-primary-gradient-btn {
            background: linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%);
            color: #ffffff;
            background-size: 200% auto;
            transition: 0.5s;
        }
        
        .ai-primary-gradient-btn:hover {
            background-position: right center;
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
        }
        
        @keyframes ai-subtle-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
        }
        
        .ai-animate-float {
            animation: ai-subtle-float 4s ease-in-out infinite;
        }
        
        .ai-text-gradient {
            background: linear-gradient(135deg, #fff 0%, #93c5fd 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
      `}</style>

      <header className="mb-2 flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-0.5 ai-text-gradient">Upload your first doc</h2>
          <p className="text-sm text-[#94a3b8]">Your Documents, Finally Understood.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1 min-h-0">
        {/* Configuration Column */}
        <div className="md:col-span-3 flex flex-col gap-3 h-full">
          <div className="ai-glass-card rounded-xl p-3 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2 mb-3">
              <SlidersHorizontal size={20} color="var(--color-primary)" />
              <h3 className="text-lg font-semibold text-[var(--color-on-surface)]">Configuration</h3>
            </div>
            
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-1.5 block">Summarization Mode</label>
                <div className="flex flex-col gap-1.5">
                  {[
                    { id: 'executive', title: 'Executive Summary', desc: 'Concise bullet points for C-level review.' },
                    { id: 'deep', title: 'Deep Analysis', desc: 'Extracts all key arguments and data points.' },
                    { id: 'tldr', title: 'TL;DR', desc: 'A single, dense paragraph overview.' }
                  ].map((mode) => (
                    <label key={mode.id} className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${summaryMode === mode.id ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--color-outline-variant)]/20 hover:bg-white/5'}`}>
                      <input 
                        type="radio" 
                        name="mode" 
                        value={mode.id}
                        checked={summaryMode === mode.id}
                        onChange={() => {
                           setSummaryMode(mode.id);
                           setSettings({ ...settings, outputStyle: mode.id === 'executive' ? 'Bullet Points' : mode.id === 'deep' ? 'Detailed Analysis' : 'Summary Paragraph' });
                        }}
                        className="form-radio text-[var(--color-primary)] bg-[var(--color-surface)] border-[var(--color-outline-variant)] focus:ring-[var(--color-primary)] focus:ring-offset-[var(--color-surface)]" 
                      />
                      <div className="flex flex-col">
                        <span className={`text-sm ${summaryMode === mode.id ? 'font-medium' : ''} text-[var(--color-on-surface)]`}>{mode.title}</span>
                        <span className="text-[10px] leading-tight text-[var(--color-on-surface-variant)]">{mode.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mt-3 border-t border-[var(--color-outline-variant)]/10 pt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]">Length Output</label>
                  <span className="font-mono text-sm text-[var(--color-primary)]">{settings.summaryLength || 'Medium'}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="3" 
                  value={settings.summaryLength === 'Short' ? 1 : settings.summaryLength === 'Long' ? 3 : 2}
                  onChange={(e) => {
                    const val = e.target.value === '1' ? 'Short' : e.target.value === '3' ? 'Long' : 'Medium';
                    setSettings({ ...settings, summaryLength: val });
                  }}
                  className="w-full h-1 bg-[var(--color-surface-container-highest)] rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]" 
                />
                <div className="flex justify-between text-xs text-[var(--color-outline)] mt-1 font-medium">
                  <span>Short</span>
                  <span>Long</span>
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-[var(--color-on-surface)]">Extract Citations</span>
                <button 
                  onClick={() => setIsExtractCitations(!isExtractCitations)}
                  className={`w-10 h-5 rounded-full relative transition-colors focus:outline-none ${isExtractCitations ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-container-highest)]'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isExtractCitations ? 'right-1' : 'left-1'}`}></span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="md:col-span-6 flex flex-col h-full">
          <div 
            {...getRootProps()}
            className={`ai-glass-card rounded-xl flex-1 flex flex-col items-center justify-center p-3 border-2 border-dashed transition-colors group relative overflow-hidden cursor-pointer ${isDragActive ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[var(--color-outline-variant)]/30 hover:border-[var(--color-primary)]/50'}`}
          >
            <input {...getInputProps()} />
            <div className="absolute inset-0 bg-[var(--color-primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            
            <div className="flex justify-center gap-3 mb-4 relative">
              <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full"></div>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ai-animate-float shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 rotate-[-12deg] backdrop-blur-xl">
                <FileText size={20} className="text-rose-400" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center ai-animate-float border border-blue-400/30 z-10 backdrop-blur-xl" style={{ animationDelay: '-1s', boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)' }}>
                <tool.icon size={28} className="text-blue-400" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ai-animate-float shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/10 rotate-[12deg] backdrop-blur-xl" style={{ animationDelay: '-2s' }}>
                <Activity size={20} className="text-emerald-400" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1 text-center">Drag & Drop Upload</h3>
            <p className="text-xs text-slate-400 mb-4 text-center max-w-xs">
                Drop your PDF files here to begin intelligent processing with {tool.label}.
            </p>
            
            <button className="ai-primary-gradient-btn px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:shadow-[var(--color-primary)]/25 transition-all mb-4 flex items-center gap-2">
              <Upload size={16} />
              Browse Files
            </button>
            
            <div className="flex items-center gap-3 w-full max-w-sm">
              <div className="h-px bg-[var(--color-outline-variant)]/20 flex-1"></div>
              <span className="text-[10px] font-medium text-[var(--color-on-surface-variant)] uppercase tracking-wider">Or import from</span>
              <div className="h-px bg-[var(--color-outline-variant)]/20 flex-1"></div>
            </div>
            
            <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
              <button className="ai-glass-panel px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors border border-white/5">
                <Cloud size={16} color="var(--color-on-surface)" />
                <span className="text-sm text-[var(--color-on-surface)]">Drive</span>
              </button>
              <button className="ai-glass-panel px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors border border-white/5">
                <FolderSync size={16} color="var(--color-on-surface)" />
                <span className="text-sm text-[var(--color-on-surface)]">Dropbox</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Presets Column */}
        <div className="md:col-span-3 flex flex-col gap-3 h-full">
          <div className="ai-glass-card rounded-xl p-3 flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2 mb-2">
              <Scale size={18} color="var(--color-secondary)" />
              <h3 className="text-lg font-semibold text-[var(--color-on-surface)]">Quick Presets</h3>
            </div>
            <p className="text-xs text-[var(--color-on-surface-variant)] mb-2">Apply specialized context to your summary.</p>
            
            <div className="flex flex-col gap-1.5">
              {[
                { id: 'finance', icon: LineChart, title: 'Financial Report', desc: 'Focuses on metrics, risks, and forecasts.' },
                { id: 'legal', icon: Scale, title: 'Legal Contract', desc: 'Highlights obligations and liability clauses.' },
                { id: 'research', icon: FlaskConical, title: 'Research Paper', desc: 'Extracts methodology and core findings.' },
                { id: 'meeting', icon: MessageSquare, title: 'Meeting Transcript', desc: 'Generates action items and decisions.' },
              ].map((preset) => (
                <button 
                  key={preset.id}
                  onClick={() => {
                    setSettings({ ...settings, presetContext: preset.id });
                  }}
                  className={`ai-glass-panel p-2 rounded-xl flex items-start gap-2 hover:bg-white/5 hover:border-[var(--color-primary)]/30 transition-all text-left group w-full ${settings.presetContext === preset.id ? 'border-[var(--color-primary)]/50 bg-[var(--color-primary)]/5' : ''}`}
                >
                  <div className="w-6 h-6 rounded-lg bg-[var(--color-surface-container-highest)] flex items-center justify-center shrink-0 group-hover:bg-[var(--color-primary)]/20 transition-colors mt-0.5">
                    <preset.icon size={12} className="text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-primary)] transition-colors" />
                  </div>
                  <div>
                    <span className="text-xs text-[var(--color-on-surface)] block font-medium mb-0.5">{preset.title}</span>
                    <span className="text-[9px] leading-tight text-[var(--color-on-surface-variant)] block">{preset.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
