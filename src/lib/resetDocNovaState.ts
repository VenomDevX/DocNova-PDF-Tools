export function resetDocNovaState(toolSlug?: string, jobId?: string) {
  if (typeof window === "undefined") return;

  const keys = [
    "docnova-current-job",
    "docnova-current-tool",
    "docnova-uploaded-files",
    "docnova-selected-pages",
    "docnova-preview-data",
    "docnova-output-result",
    "docnova-conversion-result",
    "docnova-processing-state",
    "docnova-thumbnails",
    "docnova-result",
    "docnova-files",
  ];

  try {
    keys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    Object.keys(localStorage).forEach((key) => {
      if (key === "docnova-theme" || key === "docnova-sidebar-collapsed") return;

      if (
        key.startsWith("docnova-") ||
        (toolSlug && key.includes(toolSlug)) ||
        (jobId && key.includes(jobId))
      ) {
        localStorage.removeItem(key);
      }
    });

    Object.keys(sessionStorage).forEach((key) => {
      if (
        key.startsWith("docnova-") ||
        (toolSlug && key.includes(toolSlug)) ||
        (jobId && key.includes(jobId))
      ) {
        if (key !== "guestMode") {
          sessionStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.warn("Could not clear DocNova storage", error);
  }
}
