"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const HELP_COMMANDS = [
  "go to home",
  "go to dashboard",
  "open inclusive studio",
  "open accessibility settings",
  "go to login",
  "go to signup",
  "go to about",
  "scroll down",
  "scroll up",
  "go back",
  "read this page",
  "stop speaking",
];

export default function VoiceCommandNavigator() {
  const router = useRouter();
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("Voice command ready.");
  const [heard, setHeard] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const supported = useMemo(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }, []);

  const speak = (text) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const readPage = () => {
    const main = document.querySelector("main");
    const content = main?.innerText?.trim() || document.body?.innerText?.trim() || "";
    if (!content) {
      setStatus("No readable content found.");
      return;
    }
    speak(content.slice(0, 2500));
    setStatus("Reading current page.");
  };

  const runCommand = (rawText) => {
    const text = normalize(rawText);
    setHeard(rawText);

    if (!text) return;

    if (text.includes("help") || text.includes("commands")) {
      setShowHelp(true);
      setStatus("Showing voice commands.");
      return;
    }

    if (text.includes("go to home") || text.includes("open home")) {
      router.push("/");
      setStatus("Navigating to home.");
      return;
    }
    if (text.includes("go to dashboard") || text.includes("open dashboard")) {
      router.push("/dashboard");
      setStatus("Navigating to dashboard.");
      return;
    }
    if (
      text.includes("open inclusive studio") ||
      text.includes("go to studio") ||
      text.includes("open studio")
    ) {
      router.push("/learn");
      setStatus("Opening Inclusive Studio.");
      return;
    }
    if (text.includes("accessibility settings") || text.includes("open settings")) {
      router.push("/settings/accessibility");
      setStatus("Opening accessibility settings.");
      return;
    }
    if (text.includes("go to login") || text.includes("open login")) {
      router.push("/login");
      setStatus("Navigating to login.");
      return;
    }
    if (
      text.includes("go to sign up") ||
      text.includes("go to signup") ||
      text.includes("open sign up") ||
      text.includes("open signup")
    ) {
      router.push("/signup");
      setStatus("Navigating to signup.");
      return;
    }
    if (text.includes("go to about") || text.includes("open about")) {
      router.push("/about");
      setStatus("Navigating to about.");
      return;
    }

    if (text.includes("go back")) {
      window.history.back();
      setStatus("Going back.");
      return;
    }
    if (text.includes("scroll down")) {
      window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
      setStatus("Scrolling down.");
      return;
    }
    if (text.includes("scroll up")) {
      window.scrollBy({ top: -window.innerHeight * 0.8, behavior: "smooth" });
      setStatus("Scrolling up.");
      return;
    }
    if (text.includes("top of page") || text.includes("scroll to top")) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setStatus("Scrolling to top.");
      return;
    }
    if (text.includes("read this page")) {
      readPage();
      return;
    }
    if (text.includes("stop speaking")) {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setStatus("Stopped speaking.");
      return;
    }
    if (text.includes("dark mode")) {
      document.documentElement.classList.toggle("dark");
      setStatus("Toggled dark mode.");
      return;
    }

    setStatus("Command not recognized. Say 'help commands'.");
  };

  const startListening = () => {
    if (!supported) {
      setStatus("Voice commands are not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setStatus("Listening for command...");
      window.dispatchEvent(
        new CustomEvent("cortex-status-update", { detail: { listening: true } }),
      );
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      runCommand(transcript);
    };

    recognition.onerror = () => {
      setStatus("Voice command failed. Try again.");
      setListening(false);
      window.dispatchEvent(
        new CustomEvent("cortex-status-update", { detail: { listening: false } }),
      );
    };

    recognition.onend = () => {
      setListening(false);
      window.dispatchEvent(
        new CustomEvent("cortex-status-update", { detail: { listening: false } }),
      );
    };

    recognition.start();
  };

  useEffect(() => {
    const onGlobalStart = () => startListening();
    window.addEventListener("cortex-start-voice-command", onGlobalStart);
    return () => window.removeEventListener("cortex-start-voice-command", onGlobalStart);
  }, [supported]);

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs rounded-2xl bg-white/95 p-3 shadow-xl ring-1 ring-slate-200 backdrop-blur">
      <p className="text-xs font-semibold text-slate-700">Voice Commands</p>
      <button
        onClick={startListening}
        className="mt-2 w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        {listening ? "Listening..." : "Speak Command"}
      </button>
      <button
        onClick={() => setShowHelp((v) => !v)}
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        {showHelp ? "Hide" : "Show"} Commands
      </button>
      <p className="mt-2 text-xs text-slate-600">{status}</p>
      {heard && <p className="mt-1 text-[11px] text-slate-500">Heard: "{heard}"</p>}
      {showHelp && (
        <div className="mt-2 max-h-36 overflow-auto rounded-lg bg-slate-50 p-2">
          {HELP_COMMANDS.map((cmd) => (
            <p key={cmd} className="text-[11px] text-slate-700">
              {cmd}
            </p>
          ))}
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
