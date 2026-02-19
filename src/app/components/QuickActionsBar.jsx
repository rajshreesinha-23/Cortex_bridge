"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const initialStatus = {
  speaking: false,
  listening: false,
  cameraOn: false,
  aiThinking: false,
  signMode: false,
};

export default function QuickActionsBar() {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [transcriptVisible, setTranscriptVisible] = useState(true);
  const [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
    const onStatus = (event) => {
      setStatus((prev) => ({ ...prev, ...(event.detail || {}) }));
    };
    window.addEventListener("cortex-status-update", onStatus);
    return () => window.removeEventListener("cortex-status-update", onStatus);
  }, []);

  useEffect(() => {
    const user = localStorage.getItem("currentUser") || "";
    setCurrentUser(user);
    if (!user) return;

    fetch(`/api/preferences?email=${encodeURIComponent(user)}`)
      .then((res) => res.json())
      .then((data) => {
        const prefs = data?.preferences || {};
        if (typeof prefs.captionsEnabled === "boolean") {
          setCaptionsEnabled(prefs.captionsEnabled);
        }
        if (typeof prefs.transcriptVisible === "boolean") {
          setTranscriptVisible(prefs.transcriptVisible);
        }
      })
      .catch(() => {});
  }, []);

  const publishAccessibilityToggle = (payload) => {
    window.dispatchEvent(
      new CustomEvent("cortex-accessibility-toggle", {
        detail: payload,
      }),
    );
  };

  const savePrefs = async (next) => {
    if (!currentUser) return;
    try {
      await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser,
          ...next,
        }),
      });
    } catch {
      // no-op
    }
  };

  const speakPage = () => {
    if (!("speechSynthesis" in window)) return;
    const main = document.querySelector("main");
    const content = main?.innerText?.trim() || document.body.innerText.trim();
    if (!content) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content.slice(0, 2500));
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const toggleCaptions = () => {
    const next = !captionsEnabled;
    setCaptionsEnabled(next);
    publishAccessibilityToggle({ captionsEnabled: next });
    savePrefs({ captionsEnabled: next });
  };

  const toggleTranscript = () => {
    const next = !transcriptVisible;
    setTranscriptVisible(next);
    publishAccessibilityToggle({ transcriptVisible: next });
    savePrefs({ transcriptVisible: next });
  };

  const statusItems = useMemo(
    () => [
      { label: "Speaking", active: status.speaking },
      { label: "Listening", active: status.listening },
      { label: "Camera", active: status.cameraOn },
      { label: "AI", active: status.aiThinking },
      { label: "Sign", active: status.signMode },
    ],
    [status],
  );

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[min(96vw,850px)] -translate-x-1/2 rounded-2xl bg-white/95 p-3 shadow-xl ring-1 ring-slate-200 backdrop-blur">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={speakPage}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          Speak Page
        </button>
        <button
          onClick={() => window.dispatchEvent(new Event("cortex-start-voice-command"))}
          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          Voice Command
        </button>
        <button
          onClick={toggleCaptions}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Captions: {captionsEnabled ? "On" : "Off"}
        </button>
        <button
          onClick={toggleTranscript}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Transcript: {transcriptVisible ? "On" : "Off"}
        </button>
        <button
          onClick={() => router.push("/settings/accessibility")}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Settings
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {statusItems.map((item) => (
          <span
            key={item.label}
            className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
              item.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
            }`}
          >
            {item.label}: {item.active ? "On" : "Off"}
          </span>
        ))}
      </div>
    </div>
  );
}
