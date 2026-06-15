export function hardNavigate(path: string) {
  if (typeof window !== "undefined") {
    window.location.href = path;
  }
}
