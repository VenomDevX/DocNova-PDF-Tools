// Pure, React-free parsers that turn the model's free-form text/markdown output
// into structured data for the interactive AI result renderers (Quiz, Flashcards).
// Kept dependency-free so the logic is easy to unit-test and reuse.

export interface Flashcard {
  front: string;
  back: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  /** Index into `options` of the correct answer, or -1 if unknown. */
  answer: number;
}

/** Strip ```json / ``` fences and surrounding whitespace. */
export function stripFences(raw: string): string {
  return raw
    .replace(/^\s*```(?:json|markdown|md)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
}

/** Remove markdown emphasis/list markers from a line so prefixes match cleanly. */
function clean(line: string): string {
  return line
    .replace(/\*\*/g, '')
    .replace(/^\s*[-*>]\s+/, '')
    .trim();
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function letterToIndex(letter: string): number {
  return LETTERS.indexOf((letter || '').toUpperCase());
}

// ─── Flashcards ──────────────────────────────────────────────────────────────

const FC_FRONT_RE = /^(?:\*+\s*)?(?:Q(?:uestion)?|Front|Term|Prompt)\s*\d*\s*[:.)\-]\s*(.*)$/i;
const FC_BACK_RE = /^(?:\*+\s*)?(?:A(?:nswer)?|Back|Definition|Response)\s*\d*\s*[:.)\-]\s*(.*)$/i;
const FC_CARD_RE = /^(?:\*+\s*)?(?:Card|Flashcard)\s*\d+\s*[:.)\-]?\s*$/i;

/**
 * Parse the model's flashcard output (markdown or JSON) into front/back pairs.
 * Tolerant of several common shapes; returns [] when nothing card-like is found
 * so the caller can fall back to plain markdown.
 */
export function parseFlashcards(raw: string): Flashcard[] {
  const cleaned = stripFences(raw);
  if (!cleaned) return [];

  // 1) JSON array of objects with front/back or question/answer keys.
  if (cleaned.startsWith('[') || cleaned.startsWith('{')) {
    try {
      const data = JSON.parse(cleaned);
      const arr = Array.isArray(data) ? data : Array.isArray((data as any).flashcards) ? (data as any).flashcards : null;
      if (arr) {
        const cards = arr
          .map((c: any) => ({
            front: String(c.front ?? c.question ?? c.term ?? c.q ?? '').trim(),
            back: String(c.back ?? c.answer ?? c.definition ?? c.a ?? '').trim(),
          }))
          .filter((c: Flashcard) => c.front && c.back);
        if (cards.length) return cards;
      }
    } catch {
      /* fall through to line parsing */
    }
  }

  // 2) Line-based Q/A scanning.
  const cards: Flashcard[] = [];
  let cur: Flashcard | null = null;
  let target: 'front' | 'back' | null = null;

  const push = () => {
    if (cur && cur.front.trim() && cur.back.trim()) cards.push({ front: cur.front.trim(), back: cur.back.trim() });
  };

  for (const rawLine of cleaned.split('\n')) {
    const line = clean(rawLine);
    if (!line) continue;

    if (FC_CARD_RE.test(line)) {
      push();
      cur = { front: '', back: '' };
      target = 'front';
      continue;
    }

    const front = line.match(FC_FRONT_RE);
    if (front) {
      // A new front marker starts a new card once the current one already has a back.
      if (cur && cur.back.trim()) {
        push();
        cur = null;
      }
      if (!cur) cur = { front: '', back: '' };
      cur.front = front[1] || '';
      target = 'front';
      continue;
    }

    const back = line.match(FC_BACK_RE);
    if (back) {
      if (!cur) cur = { front: '', back: '' };
      cur.back = back[1] || '';
      target = 'back';
      continue;
    }

    // Continuation line for the current side.
    if (cur && target) {
      cur[target] = (cur[target] ? cur[target] + ' ' : '') + line;
    }
  }
  push();

  return cards;
}

// ─── Quiz ────────────────────────────────────────────────────────────────────

const Q_OPTION_RE = /^(?:\*+\s*)?\(?([A-Fa-f])[).:]\s*(.+)$/;
const Q_QUESTION_RE = /^(?:\*+\s*)?(?:Q(?:uestion)?\s*)?(\d+)[).:]\s*(.+)$/i;
const Q_INLINE_ANSWER_RE = /^(?:\*+\s*)?(?:Correct\s*)?Answer\s*[:.\-]?\s*\(?([A-Fa-f])\b/i;
const Q_ANSWERKEY_HEADER_RE = /answer\s*key|^answers?\s*[:.]?\s*$/i;

/**
 * Parse multiple-choice quiz output (markdown or JSON) into structured questions.
 * Handles options labelled A–F and a trailing "Answer Key" section, as well as
 * inline "Answer: C" lines. Returns [] when nothing quiz-like is found.
 */
export function parseQuiz(raw: string): QuizQuestion[] {
  const cleaned = stripFences(raw);
  if (!cleaned) return [];

  // 1) JSON array of { question, options, answer }.
  if (cleaned.startsWith('[') || cleaned.startsWith('{')) {
    try {
      const data = JSON.parse(cleaned);
      const arr = Array.isArray(data) ? data : Array.isArray((data as any).questions) ? (data as any).questions : null;
      if (arr) {
        const qs: QuizQuestion[] = arr
          .map((q: any) => {
            const options = (q.options ?? q.choices ?? []).map((o: any) => String(o).trim()).filter(Boolean);
            let answer = -1;
            const a = q.answer ?? q.correct ?? q.correctAnswer;
            if (typeof a === 'number') answer = a;
            else if (typeof a === 'string') {
              const byLetter = letterToIndex(a.trim()[0] || '');
              answer = byLetter >= 0 && byLetter < options.length ? byLetter : options.findIndex((o: string) => o.toLowerCase() === a.trim().toLowerCase());
            }
            return { question: String(q.question ?? q.q ?? '').trim(), options, answer };
          })
          .filter((q: QuizQuestion) => q.question && q.options.length >= 2);
        if (qs.length) return qs;
      }
    } catch {
      /* fall through */
    }
  }

  // 2) Line-based parsing. Split off the answer-key section first.
  const lines = cleaned.split('\n');
  const keyByNumber: Record<number, number> = {};
  let bodyEnd = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const l = clean(lines[i]);
    if (Q_ANSWERKEY_HEADER_RE.test(l) && !Q_OPTION_RE.test(l)) {
      bodyEnd = i;
      for (let j = i + 1; j < lines.length; j++) {
        const m = clean(lines[j]).match(/^\(?(\d+)\)?[).:\-]?\s*\(?([A-Fa-f])\b/);
        if (m) keyByNumber[parseInt(m[1], 10)] = letterToIndex(m[2]);
      }
      break;
    }
  }

  const questions: QuizQuestion[] = [];
  let cur: (QuizQuestion & { number: number }) | null = null;

  const push = () => {
    if (cur && cur.question && cur.options.length >= 2) {
      let answer = cur.answer;
      if (answer < 0 && keyByNumber[cur.number] !== undefined) answer = keyByNumber[cur.number];
      questions.push({ question: cur.question, options: cur.options, answer });
    }
  };

  for (let i = 0; i < bodyEnd; i++) {
    const line = clean(lines[i]);
    if (!line) continue;

    const opt = line.match(Q_OPTION_RE);
    if (opt && cur) {
      cur.options.push(opt[2].trim());
      continue;
    }

    const inline = line.match(Q_INLINE_ANSWER_RE);
    if (inline && cur) {
      cur.answer = letterToIndex(inline[1]);
      continue;
    }

    const q = line.match(Q_QUESTION_RE);
    if (q && !opt) {
      push();
      cur = { number: parseInt(q[1], 10), question: q[2].trim(), options: [], answer: -1 };
      continue;
    }

    // Continuation of the question stem (before options start).
    if (cur && cur.options.length === 0) {
      cur.question = (cur.question ? cur.question + ' ' : '') + line;
    }
  }
  push();

  return questions;
}

export const LETTER_LABELS = LETTERS;
