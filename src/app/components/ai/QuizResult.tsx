import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, X, ListChecks, RotateCcw } from 'lucide-react';
import { markdownComponents } from './SummaryResultPanel';
import { parseQuiz, stripFences, LETTER_LABELS as LETTERS, type QuizQuestion } from './aiResultParsers';

export type { QuizQuestion };
export { parseQuiz };

export function QuizResult({ result }: { result: string }) {
  const questions = useMemo(() => parseQuiz(result), [result]);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const hasAnswerKey = questions.some(q => q.answer >= 0);

  if (questions.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pb-8 max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {stripFences(result)}
        </ReactMarkdown>
      </motion.div>
    );
  }

  const answeredCount = Object.keys(selected).length;
  const score = questions.reduce((n, q, i) => n + (q.answer >= 0 && selected[i] === q.answer ? 1 : 0), 0);

  const reset = () => {
    setSelected({});
    setSubmitted(false);
  };

  return (
    <div className="pb-8 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] flex items-center gap-2" style={{ color: 'var(--dn-t3)' }}>
          <ListChecks size={14} className="text-[#f59e0b]" /> {questions.length} Question{questions.length === 1 ? '' : 's'}
        </span>
        {submitted && hasAnswerKey && (
          <span className="text-[13px] font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
            Score: {score} / {questions.length}
          </span>
        )}
      </div>

      {questions.map((q, qi) => {
        const chosen = selected[qi];
        return (
          <div key={qi} className="rounded-[12px] p-5" style={{ background: 'var(--dn-bg-subtle)', border: '1px solid var(--dn-border)' }}>
            <div className="flex gap-3 mb-4">
              <span className="text-[13px] font-bold text-[#f59e0b] shrink-0">Q{qi + 1}</span>
              <p className="text-[15px] font-medium leading-[1.6]" style={{ color: 'var(--dn-t1)' }}>{q.question}</p>
            </div>
            <div className="flex flex-col gap-2">
              {q.options.map((opt, oi) => {
                const isChosen = chosen === oi;
                const isCorrect = q.answer === oi;
                let style: React.CSSProperties = { background: 'var(--dn-bg-card)', border: '1px solid var(--dn-border)', color: 'var(--dn-t2)' };
                if (submitted && isCorrect) style = { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)', color: 'var(--dn-t1)' };
                else if (submitted && isChosen && !isCorrect) style = { background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.4)', color: 'var(--dn-t1)' };
                else if (isChosen) style = { background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.45)', color: 'var(--dn-t1)' };
                return (
                  <button
                    key={oi}
                    disabled={submitted}
                    onClick={() => setSelected(prev => ({ ...prev, [qi]: oi }))}
                    className="flex items-center gap-3 text-left px-4 py-2.5 rounded-lg text-[14px] transition-all disabled:cursor-default"
                    style={style}
                  >
                    <span className="grid place-items-center w-6 h-6 rounded-full text-[12px] font-semibold shrink-0" style={{ border: '1px solid var(--dn-border2)' }}>
                      {LETTERS[oi]}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {submitted && isCorrect && <Check size={16} className="text-[#10b981] shrink-0" />}
                    {submitted && isChosen && !isCorrect && <X size={16} className="text-[#ef4444] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="flex gap-3 pt-1">
        {!submitted ? (
          <button
            onClick={() => setSubmitted(true)}
            disabled={answeredCount === 0}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-white font-semibold text-[14px] transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ListChecks size={16} /> {hasAnswerKey ? 'Check Answers' : 'Submit'}
          </button>
        ) : (
          <button
            onClick={reset}
            className="flex-1 py-3 rounded-xl font-semibold text-[14px] transition-all flex items-center justify-center gap-2"
            style={{ background: 'var(--dn-bg-subtle)', border: '1px solid var(--dn-border)', color: 'var(--dn-t1)' }}
          >
            <RotateCcw size={16} /> Try Again
          </button>
        )}
      </div>
      {!hasAnswerKey && submitted && (
        <p className="text-[12px] text-center" style={{ color: 'var(--dn-t4)' }}>
          No answer key was provided in the output, so this quiz can't be auto-scored.
        </p>
      )}
    </div>
  );
}
