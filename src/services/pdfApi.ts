// src/services/pdfApi.ts
// Service for communicating with the Flask backend

type ImportMetaWithEnv = ImportMeta & {
  readonly env?: {
    readonly VITE_API_URL?: string;
  };
};

export const API_BASE_URL = (import.meta as ImportMetaWithEnv).env?.VITE_API_URL || 'http://localhost:5000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SplitPDFResponse {
  pages: Array<{ page: number; pdf: string }>;
  total: number;
}

export interface PDFToJPGResponse {
  images: Array<{ page: number; image: string }>;
  total: number;
  returned?: number;
}

export interface GenericPreviewItem {
  label: string;
  thumbnail?: string;
  text?: string;
  rows?: string[][];
}

export interface GenericPreviewResponse {
  kind: string;
  total: number;
  items: GenericPreviewItem[];
  metadata?: Record<string, unknown>;
}

export interface OCRResponse {
  text: string;
  outputType?: string;
  metadata?: Record<string, unknown>;
}

export interface ResultJobItem {
  name: string;
  size: number;
  kind: string;
}

export interface ResultJobSummaryItem {
  label: string;
  value: string;
}

export interface ResultJobResponse {
  jobId: string;
  outputFileName: string;
  outputFileSize: number;
  pageCount: number;
  previewUrl: string;
  downloadUrl: string;
  deleteUrl: string;
  toolType: string;
  toolLabel: string;
  outputFormat: string;
  kind: string;
  createdAt: string;
  summary: ResultJobSummaryItem[];
  items: ResultJobItem[];
}

export interface ResultPreviewResponse {
  kind: string;
  total: number;
  pages?: Array<{ page: number; image: string }>;
  items?: ResultJobItem[];
  text?: string;
}

export interface MergeSelectedSourceFile {
  id: string;
  file: File;
}

export interface MergeSelectedPage {
  fileId: string;
  fileName: string;
  pageIndex: number;
  pageNumber: number;
  rotation?: number;
  order: number;
}

class PDFApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async healthCheck(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return {
        success: response.ok,
        data: await response.json(),
      };
    } catch (error) {
      return {
        success: false,
        error: 'Backend not reachable',
      };
    }
  }

  async mergePDFs(files: File[]): Promise<Blob | null> {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const response = await fetch(`${this.baseURL}/api/merge-pdf`, {
        method: 'POST',
        body: formData,
      });

      await this.throwIfError(response, 'Failed to merge PDFs');

      return await response.blob();
    } catch (error) {
      console.error('Merge PDF error:', error);
      throw error;
    }
  }

  async compressPDF(file: File, compression = 'medium'): Promise<Blob | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('compression', compression);

      const response = await fetch(`${this.baseURL}/api/compress-pdf`, {
        method: 'POST',
        body: formData,
      });

      await this.throwIfError(response, 'Failed to compress PDF');

      return await response.blob();
    } catch (error) {
      console.error('Compress PDF error:', error);
      throw error;
    }
  }

  async splitPDF(file: File, pageRange = ''): Promise<SplitPDFResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (pageRange) formData.append('pageRange', pageRange);

      const response = await fetch(`${this.baseURL}/api/split-pdf`, {
        method: 'POST',
        body: formData,
      });

      await this.throwIfError(response, 'Failed to split PDF');

      return await response.json();
    } catch (error) {
      console.error('Split PDF error:', error);
      throw error;
    }
  }

  async extractPages(file: File, pageRange: string): Promise<Blob | null> {
    return this.postPDFWithParams('/api/extract-pages', file, { pageRange }, 'Failed to extract pages');
  }

  async deletePages(file: File, pageRange: string): Promise<Blob | null> {
    return this.postPDFWithParams('/api/delete-pages', file, { pageRange }, 'Failed to delete pages');
  }

  async rotatePDF(file: File, rotation: string, pageRange = ''): Promise<Blob | null> {
    return this.postPDFWithParams('/api/rotate-pdf', file, { rotation, pageRange }, 'Failed to rotate PDF');
  }

  async encryptPDF(file: File, password: string, mode = 'lock-pdf'): Promise<Blob | null> {
    return this.postPDFWithParams(`/api/${mode}`, file, { password }, 'Failed to protect PDF');
  }

  async decryptPDF(file: File, password: string, mode = 'unlock-pdf'): Promise<Blob | null> {
    return this.postPDFWithParams(`/api/${mode}`, file, { password }, 'Failed to unlock PDF');
  }

  async pdfToJpg(file: File, params: Record<string, string> = {}): Promise<PDFToJPGResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      Object.entries(params).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      const response = await fetch(`${this.baseURL}/api/pdf-to-jpg`, {
        method: 'POST',
        body: formData,
      });

      await this.throwIfError(response, 'Failed to convert PDF to JPG');

      return await response.json();
    } catch (error) {
      console.error('PDF to JPG error:', error);
      throw error;
    }
  }

  async generatePDFThumbnails(file: File): Promise<PDFToJPGResponse> {
    return this.previewPDF(file);
  }

  async previewPDF(file: File, params: Record<string, string> = {}): Promise<PDFToJPGResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      Object.entries(params).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      const response = await fetch(`${this.baseURL}/api/preview/pdf`, {
        method: 'POST',
        body: formData,
      });

      await this.throwIfError(response, 'Failed to generate PDF thumbnails');

      return await response.json();
    } catch (error) {
      console.error('PDF thumbnail error:', error);
      throw error;
    }
  }

  async previewDocument(file: File): Promise<GenericPreviewResponse> {
    return this.postPreview('/api/preview/document', file, 'Failed to preview document');
  }

  async previewSpreadsheet(file: File): Promise<GenericPreviewResponse> {
    return this.postPreview('/api/preview/spreadsheet', file, 'Failed to preview spreadsheet');
  }

  async previewPresentation(file: File): Promise<GenericPreviewResponse> {
    return this.postPreview('/api/preview/presentation', file, 'Failed to preview presentation');
  }

  async previewImage(file: File): Promise<GenericPreviewResponse> {
    return this.postPreview('/api/preview/image', file, 'Failed to preview image');
  }

  async previewOutput(file: File): Promise<GenericPreviewResponse | PDFToJPGResponse> {
    return this.postPreview('/api/output/preview', file, 'Failed to preview output');
  }

  async mergeSelectedPDFs(files: MergeSelectedSourceFile[], selectedPages: MergeSelectedPage[]): Promise<Blob | null> {
    try {
      const formData = new FormData();
      files.forEach(source => formData.append('files', source.file));
      formData.append('fileIds', JSON.stringify(files.map(source => source.id)));
      formData.append('selectedPages', JSON.stringify(selectedPages));

      const response = await fetch(`${this.baseURL}/api/pdf/merge-selected`, {
        method: 'POST',
        body: formData,
      });

      await this.throwIfError(response, 'Failed to merge selected pages');

      return await response.blob();
    } catch (error) {
      console.error('Merge selected PDF error:', error);
      throw error;
    }
  }

  async jpgToPDF(files: File[], params: Record<string, string> = {}): Promise<Blob | null> {
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      Object.entries(params).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      const response = await fetch(`${this.baseURL}/api/jpg-to-pdf`, {
        method: 'POST',
        body: formData,
      });

      await this.throwIfError(response, 'Failed to convert JPG to PDF');

      return await response.blob();
    } catch (error) {
      console.error('JPG to PDF error:', error);
      throw error;
    }
  }

  async wordToPDF(file: File, options: Record<string, string> = {}): Promise<Blob | null> {
    return this.postFileWithParams('/api/word-to-pdf', file, options, 'Failed to convert Word to PDF');
  }

  async pdfToWord(file: File, pageRange = '', preserveLayout = true): Promise<Blob | null> {
    return this.postFileWithParams('/api/pdf-to-word', file, { pageRange, preserveLayout: String(preserveLayout) }, 'Failed to convert PDF to Word');
  }

  async pdfToExcel(file: File, pageRange = '', extractMode = 'tables'): Promise<Blob | null> {
    return this.postFileWithParams('/api/pdf-to-excel', file, { pageRange, extractMode }, 'Failed to convert PDF to Excel');
  }

  async excelToPDF(file: File, options: Record<string, string> = {}): Promise<Blob | null> {
    return this.postFileWithParams('/api/excel-to-pdf', file, options, 'Failed to convert Excel to PDF');
  }

  async pdfToPowerPoint(file: File, pageRange = ''): Promise<Blob | null> {
    return this.postFileWithParams('/api/pdf-to-powerpoint', file, { pageRange }, 'Failed to convert PDF to PowerPoint');
  }

  async powerPointToPDF(file: File, pageRange = ''): Promise<Blob | null> {
    return this.postFileWithParams('/api/powerpoint-to-pdf', file, { pageRange }, 'Failed to convert PowerPoint to PDF');
  }

  async applyEditorEdits(file: File, layers: unknown[], toolId: string, canvasWidth = 680, canvasHeight = 900): Promise<Blob | null> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('layers', JSON.stringify(layers || []));
    formData.append('toolId', toolId);
    formData.append('canvasWidth', String(canvasWidth));
    formData.append('canvasHeight', String(canvasHeight));

    const response = await fetch(`${this.baseURL}/api/pdf/apply-editor-edits`, {
      method: 'POST',
      body: formData,
    });

    await this.throwIfError(response, 'Failed to apply PDF editor changes');
    return await response.blob();
  }

  async ocr(file: File, lang = 'eng', pageRange = '', outputType = 'txt'): Promise<OCRResponse> {
    return this.postFileJSON<OCRResponse>('/api/ocr', file, { lang, pageRange, outputType }, 'Failed to run OCR');
  }

  async createResultJob(
    blob: Blob,
    metadata: {
      outputFileName: string;
      toolType: string;
      toolLabel: string;
      outputFormat?: string;
      summary?: ResultJobSummaryItem[];
      items?: ResultJobItem[];
    },
  ): Promise<ResultJobResponse> {
    const formData = new FormData();
    formData.append('file', blob, metadata.outputFileName);
    formData.append('outputFileName', metadata.outputFileName);
    formData.append('toolType', metadata.toolType);
    formData.append('toolLabel', metadata.toolLabel);
    formData.append('outputFormat', metadata.outputFormat || '');
    formData.append('summary', JSON.stringify(metadata.summary || []));
    formData.append('items', JSON.stringify(metadata.items || []));

    const response = await fetch(`${this.baseURL}/api/result/create`, {
      method: 'POST',
      body: formData,
    });

    await this.throwIfError(response, 'Failed to create result page');
    return this.withAbsoluteResultUrls(await response.json());
  }

  async getResultJob(jobId: string): Promise<ResultJobResponse> {
    const response = await fetch(`${this.baseURL}/api/result/${encodeURIComponent(jobId)}`, { cache: "no-store" });
    await this.throwIfError(response, 'Failed to load result');
    return this.withAbsoluteResultUrls(await response.json());
  }

  async getResultPreview(jobId: string, params: Record<string, string> = {}): Promise<ResultPreviewResponse> {
    const query = new URLSearchParams(params);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    const response = await fetch(`${this.baseURL}/api/result/${encodeURIComponent(jobId)}/preview${suffix}`, { cache: "no-store" });
    await this.throwIfError(response, 'Failed to load result preview');
    return await response.json();
  }

  async deleteResultJob(jobId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/result/${encodeURIComponent(jobId)}`, {
      method: 'DELETE',
    });
    await this.throwIfError(response, 'Failed to delete result');
  }

  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  base64ToBlob(base64: string, mimeType: string): Blob {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType });
  }

  private async postPDFWithParams(
    endpoint: string,
    file: File,
    params: Record<string, string>,
    fallback: string,
  ): Promise<Blob | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      Object.entries(params).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      await this.throwIfError(response, fallback);
      return await response.blob();
    } catch (error) {
      console.error(`${endpoint} error:`, error);
      throw error;
    }
  }

  private async postFileWithParams(
    endpoint: string,
    file: File,
    params: Record<string, string>,
    fallback: string,
  ): Promise<Blob | null> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      Object.entries(params).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      await this.throwIfError(response, fallback);
      return await response.blob();
    } catch (error) {
      console.error(`${endpoint} error:`, error);
      throw error;
    }
  }

  private async postFileJSON<T>(
    endpoint: string,
    file: File,
    params: Record<string, string>,
    fallback: string,
  ): Promise<T> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      Object.entries(params).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      await this.throwIfError(response, fallback);
      return await response.json();
    } catch (error) {
      console.error(`${endpoint} error:`, error);
      throw error;
    }
  }

  private async postPreview(endpoint: string, file: File, fallback: string): Promise<GenericPreviewResponse> {
    return this.postFileJSON<GenericPreviewResponse>(endpoint, file, {}, fallback);
  }

  private withAbsoluteResultUrls(job: ResultJobResponse): ResultJobResponse {
    return {
      ...job,
      previewUrl: this.toAbsoluteUrl(job.previewUrl),
      downloadUrl: this.toAbsoluteUrl(job.downloadUrl),
      deleteUrl: this.toAbsoluteUrl(job.deleteUrl),
    };
  }

  private toAbsoluteUrl(url: string): string {
    if (!url || /^https?:\/\//i.test(url)) return url;
    return `${this.baseURL}${url.startsWith('/') ? url : `/${url}`}`;
  }

  private async throwIfError(response: Response, fallback: string): Promise<void> {
    if (response.ok) return;

    let errorData: any = {};
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      errorData = await response.json();
    } else {
      errorData.error = await response.text();
    }

    const err = new Error(errorData.error || errorData.message || errorData.note || fallback) as any;
    err.status = response.status;
    err.details = errorData.details;
    err.retryAfter = response.headers.get('Retry-After');
    throw err;
  }
}

export const pdfApi = new PDFApiService();

export const chatWithAI = async (messages: Array<{role: string, content: string}>, file?: File | null, model: string = 'gemini-3.5-flash'): Promise<string> => {
  let response;
  if (file) {
    const formData = new FormData();
    formData.append('messages', JSON.stringify(messages));
    formData.append('model', model);
    formData.append('file', file);
    response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: 'POST',
      body: formData
    });
  } else {
    response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, model })
    });
  }
  
  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data.error || 'Failed to communicate with AI') as any;
    err.status = response.status;
    err.details = data.details;
    err.retryAfter = response.headers.get('Retry-After');
    throw err;
  }
  return data.result;
};
