import { renderAsync } from "docx-preview";
import html2canvas from "html2canvas";

export interface DocxRenderResult {
  /** One JPEG data URL per rendered page. */
  thumbnails: string[];
}

const MAX_PREVIEW_PAGES = 30;

/**
 * Renders a real .docx file into per-page image data URLs in the browser.
 *
 * Uses docx-preview to render the document's actual formatting (headings,
 * tables, lists, inline images) into paginated section elements, then
 * rasterizes each page with html2canvas. Legacy .doc binaries cannot be
 * parsed and will throw, so callers can surface a proper error state.
 */
export async function renderDocxToThumbnails(file: File): Promise<DocxRenderResult> {
  if (file.name.toLowerCase().endsWith(".doc") && !file.name.toLowerCase().endsWith(".docx")) {
    throw new Error("Legacy .doc files can't be previewed. Please upload a .docx file.");
  }

  const arrayBuffer = await file.arrayBuffer();

  // Offscreen host kept in the document (not display:none) so layout/fonts
  // resolve correctly for html2canvas. Positioned far off-screen instead.
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-10000px";
  host.style.top = "0";
  host.style.width = "816px"; // ~ US Letter at 96dpi; docx-preview sizes pages itself
  host.style.background = "#ffffff";
  host.style.zIndex = "-1";
  host.style.pointerEvents = "none";
  document.body.appendChild(host);

  try {
    try {
      await renderAsync(arrayBuffer, host, undefined, {
        className: "docnova-docx",
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        breakPages: true,
        renderHeaders: true,
        renderFooters: true,
        experimental: true,
      });
    } catch (err) {
      // docx-preview reads the .docx as a ZIP via JSZip; an invalid/renamed or
      // corrupted file fails with "Can't find end of central directory...".
      // Surface a clear, actionable message instead of the raw library error.
      const msg = err instanceof Error ? err.message : String(err);
      if (/central directory|is this a zip file|corrupt/i.test(msg)) {
        throw new Error("This file isn't a valid .docx document. It may be corrupted or saved in an older format — please re-save it as a .docx and try again.");
      }
      throw err;
    }

    const pages = Array.from(host.querySelectorAll<HTMLElement>("section.docnova-docx"));
    const targets = pages.length ? pages : [host];

    const thumbnails: string[] = [];
    for (const page of targets.slice(0, MAX_PREVIEW_PAGES)) {
      const canvas = await html2canvas(page, {
        backgroundColor: "#ffffff",
        scale: 1.5,
        useCORS: true,
        logging: false,
      });
      thumbnails.push(canvas.toDataURL("image/jpeg", 0.85));
    }

    if (thumbnails.length === 0) {
      throw new Error("No previewable pages were found in this document.");
    }

    return { thumbnails };
  } finally {
    document.body.removeChild(host);
  }
}
