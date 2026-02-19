export function localAssistantReply(message) {
  const normalized = String(message || "").toLowerCase();

  if (!normalized.trim()) {
    return "Tell me what you are learning, and I will guide you step by step.";
  }

  if (normalized.includes("fraction")) {
    return "Start with halves and quarters. Draw one shape, split it evenly, and label each part.";
  }

  if (normalized.includes("motivat") || normalized.includes("inspire")) {
    return "You are building ability through repetition. One focused lesson today is meaningful progress.";
  }

  if (normalized.includes("dyslex")) {
    return "Use large text, extra spacing, and read-aloud mode. Work in short chunks and check understanding after each chunk.";
  }

  return "Try this plan: read one short section, summarize it in one line, answer one question, then move to the next section.";
}
