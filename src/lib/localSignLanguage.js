import { SUPPORTED_SIGN_LANGUAGES } from "@/lib/signLanguages";

const HEURISTIC_WORDS = {
  ASL: ["HELLO", "THANK YOU", "HELP"],
  BSL: ["HELLO", "THANK YOU", "PLEASE"],
  ISL: ["NAMASTE", "THANK YOU", "HELP"],
  AUSLAN: ["HELLO", "THANK YOU", "HELP"],
};

export function localSignLanguageDetect(payload) {
  const score = Number(payload?.movementScore || 0);
  const language = String(payload?.signLanguage || "ASL").toUpperCase();
  const words = HEURISTIC_WORDS[language] || HEURISTIC_WORDS.ASL;

  if (score < 20) {
    return {
      text: "No clear sign detected yet. Raise hands into frame and improve lighting.",
      token: null,
      confidence: 0.18,
      language,
      candidates: [],
      source: "local-heuristic",
    };
  }

  const bucket = score >= 60 ? 0 : score >= 40 ? 1 : 2;
  const token = words[bucket];

  return {
    text: token,
    token,
    confidence: Math.min(0.85, 0.25 + score / 100),
    language,
    candidates: words.map((w, i) => ({
      token: w,
      confidence: Math.max(0.15, 0.65 - i * 0.18),
    })),
    source: "local-heuristic",
  };
}

export function getSupportedSignLanguages() {
  return SUPPORTED_SIGN_LANGUAGES;
}
