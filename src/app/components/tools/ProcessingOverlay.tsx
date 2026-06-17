import { Loader2, Sparkles, BookOpen } from "lucide-react";

export interface ProcessingFile {
  name: string;
  size: number;
}

interface ProcessingOverlayProps {
  title: string;
  description: string;
  progressMessage?: string;
  files?: ProcessingFile[];
}

export function ProcessingOverlay({ title, description, progressMessage = "Processing Context", files }: ProcessingOverlayProps) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center pt-[100px] md:pt-[140px]" style={{ background: "var(--dn-bg)" }}>
      {/* Animated Background Blobs matching Upload Page */}
      <div className="dn-dark-blobs absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#2563eb]/15 rounded-full blur-[100px] animate-[drift1_25s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#0267b8]/15 rounded-full blur-[120px] animate-[drift2_30s_ease-in-out_infinite_reverse]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#b4c5ff]/5 rounded-full blur-[150px] animate-[drift1_40s_ease-in-out_infinite]"></div>
      </div>

      <style>{`
        @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 0.5; }
            100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes orb-glow {
            0% { box-shadow: 0 0 30px rgba(37, 99, 235, 0.4), inset 0 0 20px rgba(2, 103, 184, 0.8); }
            50% { box-shadow: 0 0 60px rgba(37, 99, 235, 0.8), inset 0 0 40px rgba(2, 103, 184, 1); }
            100% { box-shadow: 0 0 30px rgba(37, 99, 235, 0.4), inset 0 0 20px rgba(2, 103, 184, 0.8); }
        }
        @keyframes shimmer {
            100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Adding the exact structure from GenericAIToolPage.tsx */}
      <div className="flex flex-col items-center max-w-[520px] w-full mx-auto relative z-10 animate-in fade-in zoom-in duration-500" style={{ zoom: 0.75 }}>
        
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
        <h1 className="text-[32px] md:text-[40px] leading-tight font-semibold mb-2 text-center tracking-tight font-['Geist']" style={{ color: "var(--dn-t1)" }}>
          {title}
        </h1>
        <p className="text-[16px] text-center mb-10 max-w-md leading-relaxed" style={{ color: "var(--dn-t3)" }}>
          {description}
        </p>

        {/* Glassmorphic Progress & Metadata Card */}
        <div className="w-full backdrop-blur-xl border rounded-[6px] p-8 transition-all duration-500 relative" style={{ background: "var(--dn-bg-card)", borderColor: "var(--dn-border)", boxShadow: "0 0 30px rgba(37,99,235,0.05)" }}>
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>

          {/* Progress Header */}
          <div className="flex justify-between items-end mb-3">
            <span className="text-[12px] font-medium text-[#b4c5ff] uppercase tracking-widest font-['Geist']">{progressMessage}</span>
          </div>

          {/* Progress Track */}
          <div className="w-full h-1.5 rounded-full overflow-hidden mb-3 relative" style={{ background: "var(--dn-bg-subtle)" }}>
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#0267b8] via-[#2563eb] to-[#b4c5ff] w-[100%] rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)] transition-all duration-1000 ease-out">
              {/* Shimmer effect on progress bar */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>

          {/* Time Estimation */}
          <div className="flex justify-between items-center mb-8">
            <span className="text-[12px]" style={{ color: "var(--dn-t3)" }}>This might take a few moments</span>
          </div>

          {files && files.length > 0 && (
            <>
              {/* Divider */}
              <div className="h-px w-full mb-8" style={{ background: "linear-gradient(90deg, transparent, var(--dn-border), transparent)" }}></div>

              {/* File Metadata */}
              <div className="flex flex-col gap-3">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-4 rounded-[6px] p-3 border" style={{ background: "var(--dn-bg-subtle)", borderColor: "var(--dn-border)" }}>
                    <div className="w-12 h-12 rounded-[6px] flex items-center justify-center border shadow-inner" style={{ background: "var(--dn-bg-card)", borderColor: "var(--dn-border)" }}>
                      <BookOpen size={24} className="text-[#3b82f6]" />
                    </div>
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <span className="text-[14px] font-semibold truncate" style={{ color: "var(--dn-t1)" }}>
                        {file.name}
                      </span>
                      <span className="text-[12px]" style={{ color: "var(--dn-t3)" }}>
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center animate-pulse" style={{ background: "var(--dn-bg-subtle)" }}>
                      <div className="w-2 h-2 rounded-full bg-[#3b82f6]"></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
