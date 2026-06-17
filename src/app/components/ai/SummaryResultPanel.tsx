import React, { useState, useEffect, useMemo } from 'react';
import { Check, Calendar, Zap, ListTodo, ChevronRight } from 'lucide-react';
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

/** Strip ```json / ``` fences and surrounding whitespace. */
function stripCodeFences(raw: string): string {
  return raw
    .replace(/^\s*```(?:json|markdown|md)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
}

/** Detect & parse the structured summary JSON schema. Returns null if not that shape. */
function tryParseSummary(raw: string): ParsedResult | null {
  const cleaned = stripCodeFences(raw);
  if (!cleaned.startsWith('{')) return null;
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const hasSummaryShape =
        typeof parsed.overview === 'string' ||
        Array.isArray(parsed.keyPoints) ||
        Array.isArray(parsed.importantDates) ||
        Array.isArray(parsed.actionItems) ||
        typeof parsed.conclusion === 'string';
      if (hasSummaryShape) {
        return {
          overview: typeof parsed.overview === 'string' ? parsed.overview : '',
          keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
          importantDates: Array.isArray(parsed.importantDates) ? parsed.importantDates : [],
          actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
          conclusion: typeof parsed.conclusion === 'string' ? parsed.conclusion : '',
        };
      }
    }
  } catch {
    return null;
  }
  return null;
}

/** Convert raw JSON (object/array) into readable Markdown, so the user never sees raw braces. */
function jsonToMarkdown(value: unknown, depth = 0): string {
  const indent = '  '.repeat(depth);
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value
      .map(item =>
        item && typeof item === 'object'
          ? `${indent}- ${jsonToMarkdown(item, depth + 1).trim()}`
          : `${indent}- ${jsonToMarkdown(item, depth + 1)}`
      )
      .join('\n');
  }
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, val]) => {
        const label = key.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        return val && typeof val === 'object'
          ? `${indent}**${label}:**\n${jsonToMarkdown(val, depth + 1)}`
          : `${indent}**${label}:** ${jsonToMarkdown(val, depth + 1)}`;
      })
      .join('\n\n');
  }
  return '';
}

/** Normalise any AI output into clean Markdown (used when it's not the summary schema). */
function toCleanMarkdown(raw: string): string {
  const cleaned = stripCodeFences(raw);
  if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
    try {
      const parsed = JSON.parse(cleaned);
      if (parsed && typeof parsed === 'object') return jsonToMarkdown(parsed);
    } catch {
      /* not valid JSON — treat as markdown below */
    }
  }
  return cleaned;
}

/**
 * Shared markdown styling. Text colours use the app's CSS theme variables so the
 * result is readable in BOTH dark and light mode. Accent colours stay constant.
 */
const markdownComponents = {
  h1: (props: any) => <h1 className="text-[24px] font-bold text-[var(--dn-t1)] mt-6 mb-3 first:mt-0" {...props} />,
  h2: (props: any) => <h2 className="text-[20px] font-bold text-[var(--dn-t1)] mt-6 mb-3 first:mt-0 flex items-center gap-2" {...props} />,
  h3: (props: any) => <h3 className="text-[17px] font-semibold text-[var(--dn-t2)] mt-5 mb-2" {...props} />,
  p: (props: any) => <p className="text-[15px] text-[var(--dn-t3)] leading-[1.8] mb-4" {...props} />,
  ul: (props: any) => <ul className="list-disc pl-6 mb-4 space-y-1.5 marker:text-[#3b82f6]" {...props} />,
  ol: (props: any) => <ol className="list-decimal pl-6 mb-4 space-y-1.5 marker:text-[#3b82f6]" {...props} />,
  li: (props: any) => <li className="text-[15px] text-[var(--dn-t2)] leading-[1.7]" {...props} />,
  strong: (props: any) => <strong className="font-semibold text-[var(--dn-t1)]" {...props} />,
  em: (props: any) => <em className="text-[var(--dn-t2)] italic" {...props} />,
  a: (props: any) => <a className="text-[#3b82f6] underline decoration-[#3b82f6]/40 hover:decoration-[#3b82f6] transition" target="_blank" rel="noreferrer" {...props} />,
  blockquote: (props: any) => (
    <blockquote
      className="border-l-[3px] border-[#3b82f6] pl-4 my-4 text-[var(--dn-t3)] italic py-2 rounded-r-lg"
      style={{ background: 'var(--dn-bg-subtle)' }}
      {...props}
    />
  ),
  // react-markdown v10: distinguish block vs inline by the language- className.
  code: ({ className, ...props }: any) =>
    /language-/.test(className || '') ? (
      <code className={`${className || ''} text-[13px] font-mono`} {...props} />
    ) : (
      <code
        className="px-1.5 py-0.5 rounded text-[13px] font-mono text-[#3b82f6]"
        style={{ background: 'var(--dn-bg-subtle)', border: '1px solid var(--dn-border)' }}
        {...props}
      />
    ),
  pre: (props: any) => (
    <pre
      className="block p-4 rounded-lg overflow-x-auto my-4 text-[var(--dn-t2)]"
      style={{ background: 'var(--dn-bg-subtle)', border: '1px solid var(--dn-border)' }}
      {...props}
    />
  ),
  hr: () => <hr className="my-6" style={{ borderColor: 'var(--dn-border)' }} />,
  table: (props: any) => (
    <div className="overflow-x-auto my-4 rounded-lg" style={{ border: '1px solid var(--dn-border)' }}>
      <table className="w-full text-[14px] border-collapse" {...props} />
    </div>
  ),
  thead: (props: any) => <thead style={{ background: 'var(--dn-bg-subtle)' }} {...props} />,
  th: (props: any) => <th className="text-left px-4 py-2.5 font-semibold text-[var(--dn-t1)]" style={{ borderBottom: '1px solid var(--dn-border)' }} {...props} />,
  td: (props: any) => <td className="px-4 py-2.5 text-[var(--dn-t3)]" style={{ borderBottom: '1px solid var(--dn-border)' }} {...props} />,
};

export function SummaryResultPanel({ result }: SummaryResultPanelProps) {
  const [expandedKeys, setExpandedKeys] = useState<number[]>([0]);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  useEffect(() => {
    setExpandedKeys([0]);
    setCheckedItems([]);
  }, [result]);

  const parsedData = useMemo(() => (result ? tryParseSummary(result) : null), [result]);
  const markdown = useMemo(() => (result && !parsedData ? toCleanMarkdown(result) : ''), [result, parsedData]);

  const toggleAccordion = (id: number) =>
    setExpandedKeys(prev => (prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]));
  const toggleCheck = (id: number) =>
    setCheckedItems(prev => (prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]));

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  if (!result) return null;

  // ── Non-summary tools (Translate, Rewrite, Email, OCR, Q&A, Tables…) → clean Markdown ──
  if (!parsedData) {
    const isEmpty = !markdown || markdown.trim().length === 0;
    if (isEmpty) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--dn-bg-subtle)', border: '1px solid var(--dn-border)' }}>
            <Zap size={20} style={{ color: 'var(--dn-t4)' }} />
          </div>
          <p className="text-[15px]" style={{ color: 'var(--dn-t2)' }}>The AI returned an empty response.</p>
          <p className="text-[13px] mt-1" style={{ color: 'var(--dn-t4)' }}>Try regenerating or adjusting your settings.</p>
        </div>
      );
    }
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pb-8 max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {markdown}
        </ReactMarkdown>
      </motion.div>
    );
  }

  // ── Structured summary schema ──
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-8 pb-8">
      {/* SECTION 1: OVERVIEW */}
      {parsedData.overview && (
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-4 bg-[#3b82f6] rounded-full"></div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: 'var(--dn-t3)' }}>
              Overview
            </span>
          </div>
          <div className="rounded-[12px] px-6 pt-5 pb-8" style={{ background: 'var(--dn-bg-subtle)', border: '1px solid var(--dn-border)' }}>
            <p className="text-[16px] leading-[1.8]" style={{ color: 'var(--dn-t1)' }}>{parsedData.overview}</p>
          </div>
        </motion.div>
      )}

      {/* SECTION 2: KEY POINTS */}
      {parsedData.keyPoints && parsedData.keyPoints.length > 0 && (
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-4 bg-[#06b6d4] rounded-full"></div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: 'var(--dn-t3)' }}>
              <Zap size={14} className="text-[#06b6d4]" /> Key Points
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {parsedData.keyPoints.map((point, index) => {
              const isExpanded = expandedKeys.includes(index);
              return (
                <div
                  key={index}
                  className="rounded-[12px] px-6 pt-5 pb-8 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                  style={{ background: 'var(--dn-bg-subtle)', border: '1px solid var(--dn-border)' }}
                  onClick={() => toggleAccordion(index)}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#06b6d4] to-[#3b82f6] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#06b6d4] shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
                      <span className="text-[16px] font-medium" style={{ color: 'var(--dn-t1)' }}>{point.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono" style={{ color: 'var(--dn-t4)' }}>0{index + 1}</span>
                      <ChevronRight size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} style={{ color: 'var(--dn-t3)' }} />
                    </div>
                  </div>
                  <motion.div
                    initial={false}
                    animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0, marginTop: isExpanded ? 12 : 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-[15px] leading-relaxed pl-5" style={{ color: 'var(--dn-t3)' }}>{point.desc}</p>
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
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: 'var(--dn-t3)' }}>
              <Calendar size={14} className="text-[#8b5cf6]" /> Important Dates
            </span>
          </div>
          <div className="relative pl-4 py-2 mt-2">
            <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#3b82f6] to-[#8b5cf6] opacity-30"></div>
            <div className="flex flex-col gap-6">
              {parsedData.importantDates.map((event, idx) => (
                <div key={idx} className="relative flex items-center group cursor-pointer">
                  <div className="absolute left-[1.5px] w-[9px] h-[9px] rounded-full border-2 border-[#8b5cf6] z-10 group-hover:bg-[#8b5cf6] transition-colors" style={{ background: 'var(--dn-bg-card)' }}></div>
                  <div className="ml-8 flex items-center gap-4 rounded-full px-4 py-2 transition-all duration-300 group-hover:translate-x-1" style={{ background: 'var(--dn-bg-subtle)', border: '1px solid var(--dn-border)' }}>
                    <span className="text-[12px] font-mono text-[#06b6d4]">{event.date}</span>
                    <div className="w-[1px] h-3" style={{ background: 'var(--dn-border)' }}></div>
                    <span className="text-[13px]" style={{ color: 'var(--dn-t1)' }}>{event.title}</span>
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
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: 'var(--dn-t3)' }}>
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
                  className="flex items-center justify-between px-5 pt-4 pb-6 rounded-xl cursor-pointer transition-all duration-300"
                  style={{ background: 'var(--dn-bg-subtle)', border: '1px solid var(--dn-border)', opacity: isChecked ? 0.5 : 1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-colors ${isChecked ? 'bg-[#10b981] border-[#10b981]' : ''}`} style={!isChecked ? { borderColor: 'var(--dn-border2)' } : {}}>
                      {isChecked && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={12} className="text-white" /></motion.div>}
                    </div>
                    <span className="text-[15px] transition-all" style={{ color: isChecked ? 'var(--dn-t4)' : 'var(--dn-t1)', textDecoration: isChecked ? 'line-through' : 'none' }}>
                      {item.text}
                    </span>
                  </div>
                  {!isChecked && item.priority && (
                    <div className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${pBg} ${pColor}`}>{item.priority}</div>
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
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: 'var(--dn-t3)' }}>
              Conclusion
            </span>
          </div>
          <div className="rounded-[12px] px-6 pt-5 pb-8 relative overflow-hidden" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.22)' }}>
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#10b981]"></div>
            <p className="text-[16px] font-medium leading-[1.7] pl-2" style={{ color: 'var(--dn-t1)' }}>{parsedData.conclusion}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
