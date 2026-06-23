import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { RotateCw, Layers } from 'lucide-react';
import { markdownComponents } from './SummaryResultPanel';
import { parseFlashcards, stripFences, type Flashcard } from './aiResultParsers';

export type { Flashcard };
export { parseFlashcards };

function FlipCard({ card, index, flipped, onFlip }: { card: Flashcard; index: number; flipped: boolean; onFlip: () => void }) {
  return (
    <button
      onClick={onFlip}
      className="group relative h-[200px] w-full text-left [perspective:1200px] focus:outline-none"
      aria-label={`Flashcard ${index + 1}, tap to flip`}
    >
      <div
        className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
        style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex flex-col rounded-[14px] p-5 [backface-visibility:hidden]"
          style={{ background: 'var(--dn-bg-subtle)', border: '1px solid var(--dn-border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#3b82f6]">Question</span>
            <span className="text-[11px] font-mono" style={{ color: 'var(--dn-t4)' }}>{String(index + 1).padStart(2, '0')}</span>
          </div>
          <div className="flex-1 overflow-y-auto aether-scrollbar">
            <p className="text-[15px] font-medium leading-[1.6]" style={{ color: 'var(--dn-t1)' }}>{card.front}</p>
          </div>
          <span className="mt-3 inline-flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--dn-t4)' }}>
            <RotateCw size={12} /> Tap to reveal
          </span>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col rounded-[14px] p-5 [backface-visibility:hidden] [transform:rotateY(180deg)]"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.30)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#10b981]">Answer</span>
            <span className="text-[11px] font-mono" style={{ color: 'var(--dn-t4)' }}>{String(index + 1).padStart(2, '0')}</span>
          </div>
          <div className="flex-1 overflow-y-auto aether-scrollbar">
            <p className="text-[15px] leading-[1.7]" style={{ color: 'var(--dn-t1)' }}>{card.back}</p>
          </div>
          <span className="mt-3 inline-flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--dn-t4)' }}>
            <RotateCw size={12} /> Tap to flip back
          </span>
        </div>
      </div>
    </button>
  );
}

export function FlashcardsResult({ result }: { result: string }) {
  const cards = useMemo(() => parseFlashcards(result), [result]);
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const allFlipped = cards.length > 0 && flipped.size === cards.length;

  // Couldn't parse cards — render the raw output as markdown so nothing is lost.
  if (cards.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pb-8 max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {stripFences(result)}
        </ReactMarkdown>
      </motion.div>
    );
  }

  const toggle = (i: number) =>
    setFlipped(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  return (
    <div className="pb-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: 'var(--dn-t3)' }}>
          <Layers size={14} className="text-[#ec4899]" /> {cards.length} Flashcard{cards.length === 1 ? '' : 's'}
        </span>
        <button
          onClick={() => setFlipped(allFlipped ? new Set() : new Set(cards.map((_, i) => i)))}
          className="text-[12px] font-medium px-3 py-1.5 rounded-full transition-colors"
          style={{ background: 'var(--dn-bg-subtle)', border: '1px solid var(--dn-border)', color: 'var(--dn-t2)' }}
        >
          {allFlipped ? 'Show all questions' : 'Reveal all answers'}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card, i) => (
          <FlipCard key={i} card={card} index={i} flipped={flipped.has(i)} onFlip={() => toggle(i)} />
        ))}
      </div>
    </div>
  );
}
