import React, { useState, useEffect } from 'react';
import { Check, Calendar, Zap, ListTodo, ChevronRight, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SummaryResultPanelProps {
  result: string | null;
}

interface ParsedResult {
  overview: string;
  keyPoints: Array<{ title: string; desc: string }>;
  importantDates: Array<{ date: string; title: string }>;
  actionItems: Array<{ text: string; priority: string }>;
  conclusion: string;
}

export function SummaryResultPanel({ result }: SummaryResultPanelProps) {
  const [expandedKeys, setExpandedKeys] = useState<number[]>([0]); // Expand first bullet by default
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [parsedData, setParsedData] = useState<ParsedResult | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    if (!result) return;
    
    try {
      // Sometimes LLMs wrap json in markdown blocks despite instructions
      const cleanedResult = result.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedResult) as ParsedResult;
      
      // Validate schema loosely
      if (parsed.overview || parsed.keyPoints?.length > 0) {
        setParsedData(parsed);
        setIsFallback(false);
      } else {
        setIsFallback(true);
      }
    } catch (e) {
      console.warn("Failed to parse AI output as JSON, falling back to Markdown view", e);
      setIsFallback(true);
    }
  }, [result]);

  const toggleAccordion = (id: number) => {
    setExpandedKeys(prev => 
      prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]
    );
  };

  const toggleCheck = (id: number) => {
    setCheckedItems(prev => 
      prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]
    );
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  if (!result) return null;

  if (isFallback) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pb-8 prose prose-invert prose-blue max-w-none prose-headings:text-[#e2e8f0] prose-p:text-[#94a3b8] prose-li:text-[#94a3b8] prose-strong:text-[#dbe2f8]"
      >
        <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg mb-6 text-sm">
          <AlertTriangle size={16} /> 
          <span>Displaying raw AI output. Strict formatting failed.</span>
        </div>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {result}
        </ReactMarkdown>
      </motion.div>
    );
  }

  if (!parsedData) return null;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8 pb-8"
    >
      {/* SECTION 1: OVERVIEW */}
      {parsedData.overview && (
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-4 bg-[#3b82f6] rounded-full"></div>
            <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-[0.2em] flex items-center gap-2">
              Overview
            </span>
          </div>
          
          <div className="bg-[rgba(255,255,255,0.04)] rounded-[12px] px-6 pt-5 pb-8 shadow-inner">
            <p className="text-[#e2e8f0] text-[16px] leading-[1.8]">
              {parsedData.overview}
            </p>
          </div>
        </motion.div>
      )}

      {/* SECTION 2: KEY POINTS */}
      {parsedData.keyPoints && parsedData.keyPoints.length > 0 && (
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-4 bg-[#06b6d4] rounded-full"></div>
            <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-[0.2em] flex items-center gap-2">
              <Zap size={14} className="text-[#06b6d4]" /> Key Points
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {parsedData.keyPoints.map((point, index) => {
              const isExpanded = expandedKeys.includes(index);
              return (
                <div 
                  key={index} 
                  className="bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] border border-transparent hover:border-white/5 rounded-[12px] px-6 pt-5 pb-8 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                  onClick={() => toggleAccordion(index)}
                >
                  {/* Hover Glow Edge */}
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#06b6d4] to-[#3b82f6] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#06b6d4] shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
                      <span className="text-[16px] font-medium text-[#f1f5f9]">{point.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-[#475569] font-mono">0{index + 1}</span>
                      <ChevronRight size={14} className={`text-[#64748b] transition-transform duration-300 ${isExpanded ? 'rotate-90 text-[#dbe2f8]' : ''}`} />
                    </div>
                  </div>

                  {/* Accordion Content */}
                  <motion.div 
                    initial={false}
                    animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0, marginTop: isExpanded ? 12 : 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-[15px] text-[#94a3b8] leading-relaxed pl-5">
                      {point.desc}
                    </p>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* SECTION 3: IMPORTANT DATES */}
      {parsedData.importantDates && parsedData.importantDates.length > 0 && (
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-4 bg-[#8b5cf6] rounded-full"></div>
            <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-[0.2em] flex items-center gap-2">
              <Calendar size={14} className="text-[#8b5cf6]" /> Important Dates
            </span>
          </div>

          <div className="relative pl-4 py-2 mt-2">
            <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#3b82f6] to-[#8b5cf6] opacity-30"></div>
            <div className="flex flex-col gap-6">
              {parsedData.importantDates.map((event, idx) => (
                <div key={idx} className="relative flex items-center group cursor-pointer">
                  <div className="absolute left-[1.5px] w-[9px] h-[9px] rounded-full bg-[#1e293b] border-2 border-[#8b5cf6] z-10 group-hover:bg-[#8b5cf6] transition-colors shadow-[0_0_10px_rgba(139,92,246,0)] group-hover:shadow-[0_0_10px_rgba(139,92,246,0.6)]"></div>
                  <div className="ml-8 flex items-center gap-4 bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-full px-4 py-2 group-hover:bg-[rgba(255,255,255,0.05)] group-hover:border-[#8b5cf6]/30 transition-all duration-300 group-hover:translate-x-1">
                    <span className="text-[12px] font-mono text-[#06b6d4]">{event.date}</span>
                    <div className="w-[1px] h-3 bg-white/10"></div>
                    <span className="text-[13px] text-[#e2e8f0]">{event.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* SECTION 4: ACTION ITEMS */}
      {parsedData.actionItems && parsedData.actionItems.length > 0 && (
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-4 bg-[#f59e0b] rounded-full"></div>
            <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-[0.2em] flex items-center gap-2">
              <ListTodo size={14} className="text-[#f59e0b]" /> Action Items
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {parsedData.actionItems.map((item, index) => {
              const isChecked = checkedItems.includes(index);
              
              let pColor = 'text-[#f59e0b]';
              let pBg = 'bg-[#f59e0b]/10 border-[#f59e0b]/20';
              if (item.priority?.toLowerCase().includes('high')) {
                pColor = 'text-[#ef4444]'; pBg = 'bg-[#ef4444]/10 border-[#ef4444]/20';
              } else if (item.priority?.toLowerCase().includes('low')) {
                pColor = 'text-[#10b981]'; pBg = 'bg-[#10b981]/10 border-[#10b981]/20';
              }

              return (
                <div 
                  key={index}
                  onClick={() => toggleCheck(index)}
                  className={`flex items-center justify-between px-5 pt-4 pb-6 rounded-xl border cursor-pointer transition-all duration-300 ${isChecked ? 'bg-white/[0.01] border-transparent opacity-50' : 'bg-white/[0.03] border-white/5 hover:border-white/10'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-colors ${isChecked ? 'bg-[#10b981] border-[#10b981]' : 'border-white/20'}`}>
                      {isChecked && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={12} className="text-white" /></motion.div>}
                    </div>
                    <span className={`text-[15px] transition-all ${isChecked ? 'text-[#64748b] line-through decoration-[#64748b]/50' : 'text-[#e2e8f0]'}`}>
                      {item.text}
                    </span>
                  </div>
                  {!isChecked && item.priority && (
                    <div className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${pBg} ${pColor}`}>
                      {item.priority}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* SECTION 5: CONCLUSION */}
      {parsedData.conclusion && (
        <motion.div variants={itemVariants} className="flex flex-col gap-3 mt-2">
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-4 bg-[#10b981] rounded-full"></div>
            <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-[0.2em] flex items-center gap-2">
               Conclusion
            </span>
          </div>
          
          <div className="bg-[rgba(16,185,129,0.04)] border border-[rgba(16,185,129,0.15)] rounded-[12px] px-6 pt-5 pb-8 shadow-inner relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#10b981]"></div>
            <p className="text-[#e2e8f0] text-[16px] font-medium leading-[1.7] pl-2">
              {parsedData.conclusion}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
