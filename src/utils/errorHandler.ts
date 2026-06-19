export type ErrorCategory = 'upload' | 'conversion' | 'download' | 'auth' | 'network' | 'server' | 'ai' | 'validation' | 'general';

/**
 * Parses an HTTP Retry-After value (delta-seconds or HTTP-date) into a
 * positive number of seconds, or null if it can't be determined.
 */
const parseRetryAfter = (value: unknown): number | null => {
  if (value == null) return null;
  const raw = String(value).trim();
  if (raw === '') return null;
  // delta-seconds form, e.g. "59"
  if (/^\d+$/.test(raw)) {
    const secs = parseInt(raw, 10);
    return secs > 0 ? secs : null;
  }
  // HTTP-date form, e.g. "Wed, 21 Oct 2025 07:28:00 GMT"
  const when = Date.parse(raw);
  if (!Number.isNaN(when)) {
    const secs = Math.ceil((when - Date.now()) / 1000);
    return secs > 0 ? secs : null;
  }
  return null;
};

/**
 * Extracts a user-friendly error message from an unknown error object.
 * Logs the actual technical error to the console for developers.
 */
export const getFriendlyErrorMessage = (error: unknown, category: ErrorCategory = 'general'): string => {
  // Always log the full technical error for debugging
  console.error(`[DocNova Error | ${category.toUpperCase()}]`, error);

  let errorMsg = '';
  let status = 0;
  let details = '';
  let retryAfter: number | null = null;

  if (error instanceof Error) {
    errorMsg = error.message;
    const errObj = error as any;
    status = errObj.status || errObj.code || 0;
    details = errObj.details || '';
    retryAfter = parseRetryAfter(errObj.retryAfter);
  } else if (typeof error === 'string') {
    errorMsg = error;
  } else if (error && typeof error === 'object') {
    const errObj = error as any;
    errorMsg = errObj.message || errObj.error || errObj.details || JSON.stringify(errObj);
    status = errObj.status || errObj.code || 0;
    details = errObj.details || '';
    retryAfter = parseRetryAfter(errObj.retryAfter);
  }

  const combinedStr = `${errorMsg} ${details}`.toLowerCase();

  // 1. Rate Limits & Quotas (Check this first, since some 500 errors wrap 429 quota exceptions)
  if (status === 429 || combinedStr.includes('429') || combinedStr.includes('quota') || combinedStr.includes('resource_exhausted')) {
    if (retryAfter && retryAfter > 0) {
      return `Too many requests — please wait ${retryAfter}s and try again.`;
    }
    return 'Too many requests — please wait a moment and try again.';
  }

  // 2. Status Codes / HTTP Errors
  if (status === 500 || combinedStr.includes('500') || combinedStr.includes('internal server error')) {
    return 'Something went wrong. Please try again.';
  }
  if (status === 502 || combinedStr.includes('502') || combinedStr.includes('bad gateway')) {
    return 'Service is temporarily unavailable. Please try again shortly.';
  }
  if (status === 503 || combinedStr.includes('503') || combinedStr.includes('service unavailable')) {
    return 'This feature is temporarily unavailable. Please try again later.';
  }
  if (status === 504 || combinedStr.includes('504') || combinedStr.includes('gateway timeout') || combinedStr.includes('timeout')) {
    return 'The request took too long. Please try again.';
  }

  // 3. Network & Connection
  if (combinedStr.includes('network error') || combinedStr.includes('failed to fetch') || !navigator.onLine) {
    return 'Please check your internet connection and try again.';
  }

  // 4. Session / Auth
  if (status === 401 || combinedStr.includes('unauthorized') || combinedStr.includes('session expired')) {
    return 'Your session has expired. Please sign in again.';
  }
  if (status === 403 || combinedStr.includes('forbidden') || combinedStr.includes('access denied')) {
    return 'You do not have permission to access this feature.';
  }
  if (category === 'auth' || combinedStr.includes('auth')) {
    return 'Sign in failed. Please try again.';
  }

  // 5. File Validations
  if (combinedStr.includes('too large') || combinedStr.includes('exceeds')) {
    return 'The file is too large. Please upload a smaller file.';
  }
  if (combinedStr.includes('unsupported') || combinedStr.includes('mime') || combinedStr.includes('content-type')) {
    return 'This file type is not supported.';
  }
  if (combinedStr.includes('invalid file') || combinedStr.includes('corrupted')) {
    return 'The selected file appears to be invalid.';
  }

  // 6. Category Fallbacks (if no specific match was found but we know the context)
  if (category === 'upload') return 'File upload failed. Please try again.';
  if (category === 'conversion' || combinedStr.includes('merge') || combinedStr.includes('compress') || combinedStr.includes('split')) {
    return "We couldn't process this file. Please try again.";
  }
  if (category === 'download') return 'Download failed. Please try again.';
  if (category === 'validation') return 'The selected file appears to be invalid.';
  if (category === 'ai' || combinedStr.includes('gemini') || combinedStr.includes('ai')) {
    return 'The request could not be completed. Please try again.';
  }

  // 7. General PDF fallback
  if (combinedStr.includes('pdf')) {
    return "We couldn't process this document. Please try another file.";
  }

  // 8. Ultimate fallback
  return 'Something unexpected happened. Please try again.';
};
