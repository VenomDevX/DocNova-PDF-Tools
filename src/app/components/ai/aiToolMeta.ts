// Per-AI-tool presentation metadata.
// Drives the upload section (copy/hint) and the result rendering for each AI tool,
// so every tool reads as purpose-built instead of one generic PDF flow.
// Frontend-only: `resultKind` decides which renderer parses the model's existing output.

export type AIResultKind = 'summary' | 'quiz' | 'flashcards' | 'table' | 'markdown';

export interface AIToolMeta {
  /** Big heading shown in the upload dropzone. */
  uploadTitle: string;
  /** One-line value-prop shown under the heading. */
  uploadSubtitle: string;
  /** Small hint line (file types / limits). */
  uploadHint: string;
  /** How the generated result should be rendered. */
  resultKind: AIResultKind;
  /** Section label shown above the result content. */
  resultHeading: string;
  /** Empty-state title when the model returns nothing usable. */
  emptyTitle: string;
  /** Empty-state hint. */
  emptyHint: string;
}

const PDF_HINT = 'PDF, Word, Excel or image · up to 25MB';

export const AI_TOOL_META: Record<string, AIToolMeta> = {
  'pdf-summary': {
    uploadTitle: 'Drop a PDF to summarize',
    uploadSubtitle: "We'll pull the key points, dates, and conclusions",
    uploadHint: PDF_HINT,
    resultKind: 'summary',
    resultHeading: 'Document Summary',
    emptyTitle: 'No summary was produced',
    emptyHint: 'Try regenerating or adjusting the length and style.',
  },
  'pdf-chat': {
    uploadTitle: 'Upload a PDF to chat with',
    uploadSubtitle: 'Ask anything — answers stay grounded in your document',
    uploadHint: PDF_HINT,
    resultKind: 'markdown',
    resultHeading: 'Chat Starter',
    emptyTitle: 'No starter was produced',
    emptyHint: 'Regenerate, or ask your first question below.',
  },
  'email-writer': {
    uploadTitle: 'Describe your email',
    uploadSubtitle: 'Set the goal, tone, and recipient',
    uploadHint: 'No file needed',
    resultKind: 'markdown',
    resultHeading: 'Drafted Email',
    emptyTitle: 'No email was drafted',
    emptyHint: 'Add a bit more detail to your request and try again.',
  },
  'smart-rewriter': {
    uploadTitle: 'Upload a PDF to rewrite',
    uploadSubtitle: 'Cleaner, clearer text — same meaning',
    uploadHint: PDF_HINT,
    resultKind: 'markdown',
    resultHeading: 'Rewritten Text',
    emptyTitle: 'Nothing was rewritten',
    emptyHint: 'Try regenerating or a different tone.',
  },
  'ocr-extractor': {
    uploadTitle: 'Upload a scanned PDF',
    uploadSubtitle: "We'll read the text off the page accurately",
    uploadHint: PDF_HINT,
    resultKind: 'markdown',
    resultHeading: 'Extracted Text',
    emptyTitle: 'No text could be extracted',
    emptyHint: 'Make sure the scan is legible, then try again.',
  },
  'resume-analyzer': {
    uploadTitle: 'Upload your resume',
    uploadSubtitle: 'Scored against standard industry expectations',
    uploadHint: PDF_HINT,
    resultKind: 'markdown',
    resultHeading: 'Resume Analysis',
    emptyTitle: 'No analysis was produced',
    emptyHint: 'Try regenerating with the resume PDF.',
  },
  'quiz-generator': {
    uploadTitle: 'Upload a PDF to quiz yourself',
    uploadSubtitle: 'Auto-generated multiple-choice questions',
    uploadHint: PDF_HINT,
    resultKind: 'quiz',
    resultHeading: 'Your Quiz',
    emptyTitle: 'No quiz was generated',
    emptyHint: 'Try a content-rich PDF, then regenerate.',
  },
  'flashcards': {
    uploadTitle: 'Upload a PDF to study',
    uploadSubtitle: "We'll turn the key concepts into flip cards",
    uploadHint: PDF_HINT,
    resultKind: 'flashcards',
    resultHeading: 'Your Flashcards',
    emptyTitle: 'No flashcards were generated',
    emptyHint: 'Try a content-rich PDF, then regenerate.',
  },
  'translator': {
    uploadTitle: 'Upload a PDF to translate',
    uploadSubtitle: 'Meaning and layout preserved',
    uploadHint: PDF_HINT,
    resultKind: 'markdown',
    resultHeading: 'Translation',
    emptyTitle: 'Nothing was translated',
    emptyHint: 'Pick a target language and try again.',
  },
  'table-extractor': {
    uploadTitle: 'Upload a PDF with tables',
    uploadSubtitle: "We'll pull them into clean, exportable tables",
    uploadHint: PDF_HINT,
    resultKind: 'table',
    resultHeading: 'Extracted Tables',
    emptyTitle: 'No tables were found',
    emptyHint: 'Make sure the PDF contains tabular data, then retry.',
  },
  'contract-review': {
    uploadTitle: 'Upload a contract to review',
    uploadSubtitle: 'Risks, obligations, and key terms flagged in plain English',
    uploadHint: PDF_HINT,
    resultKind: 'markdown',
    resultHeading: 'Contract Review',
    emptyTitle: 'No review was produced',
    emptyHint: 'Try regenerating with the contract PDF.',
  },
  'document-categorizer': {
    uploadTitle: 'Upload a document to categorize',
    uploadSubtitle: 'Auto-sorted with suggested tags',
    uploadHint: PDF_HINT,
    resultKind: 'markdown',
    resultHeading: 'Categories & Tags',
    emptyTitle: 'No categories were produced',
    emptyHint: 'Try regenerating with the document.',
  },
  'mind-maps': {
    uploadTitle: 'Upload a PDF to map',
    uploadSubtitle: 'Concepts organized into a structured outline',
    uploadHint: PDF_HINT,
    resultKind: 'markdown',
    resultHeading: 'Mind Map',
    emptyTitle: 'No mind map was produced',
    emptyHint: 'Try regenerating with the document.',
  },
  'study-assistant': {
    uploadTitle: 'Upload a paper to study',
    uploadSubtitle: 'Your personal AI tutor explains and quizzes you',
    uploadHint: PDF_HINT,
    resultKind: 'markdown',
    resultHeading: 'Study Notes',
    emptyTitle: 'No study notes were produced',
    emptyHint: 'Try regenerating with the paper.',
  },
};

/** Resolve metadata for a tool id, falling back to the summarizer's layout. */
export function getAIToolMeta(toolId: string | undefined): AIToolMeta {
  return (toolId && AI_TOOL_META[toolId]) || AI_TOOL_META['pdf-summary'];
}
