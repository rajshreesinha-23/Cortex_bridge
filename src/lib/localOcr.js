export function localOcrFallback() {
  return {
    text: "",
    message:
      "OCR backend is not connected yet. Please upload a text file or use voice dictation.",
    source: "local-fallback",
  };
}
