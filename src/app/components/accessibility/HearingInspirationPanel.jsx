"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const SIGN_LANGUAGES = [
  { code: "ASL", name: "American Sign Language" },
  { code: "BSL", name: "British Sign Language" },
  { code: "ISL", name: "Indian Sign Language" },
  { code: "AUSLAN", name: "Australian Sign Language" },
];

const QUICK_PHRASES = [
  "Summarize this in simple words",
  "Give me 3 key takeaways",
  "Create a quick comprehension question",
  "Explain this for a beginner",
];

function toTranscriptSegments(story) {
  const text = String(story?.transcript || "");
  if (!text.trim()) return [];
  return text
    .split(".")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => ({
      id: `${story.id}-seg-${index}`,
      start: index * 4,
      end: index * 4 + 4,
      text: `${line}.`,
    }));
}

function formatTime(seconds) {
  const sec = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function HearingInspirationPanel() {
  const [stories, setStories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [user, setUser] = useState("");
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [showTranscript, setShowTranscript] = useState(true);
  const [signLanguage, setSignLanguage] = useState("ASL");
  const [signVideoUrl, setSignVideoUrl] = useState("");
  const [videoReady, setVideoReady] = useState(false);
  const [activeSegId, setActiveSegId] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [visualStatus, setVisualStatus] = useState("Ready");
  const [loading, setLoading] = useState(true);

  const videoRef = useRef(null);

  const segments = useMemo(() => toTranscriptSegments(selected), [selected]);
  const activeIndex = Math.max(
    0,
    segments.findIndex((seg) => seg.id === activeSegId),
  );
  const transcriptProgress = segments.length
    ? Math.round(((activeIndex + 1) / segments.length) * 100)
    : 0;

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser") || "";
    setUser(currentUser);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadStories = async () => {
      try {
        const res = await fetch("/api/lessons?type=inspiration");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load inspiration");
        const items = data.lessons || [];
        if (!isMounted) return;
        setStories(items);
        setSelected(items[0] || null);
      } catch {
        if (!isMounted) return;
        setStories([]);
        setSelected(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadStories();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/preferences?email=${encodeURIComponent(user)}`)
      .then((res) => res.json())
      .then((data) => {
        const prefs = data.preferences || {};
        setCaptionsEnabled(prefs.captionsEnabled ?? true);
        setShowTranscript(prefs.transcriptVisible ?? true);
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user,
        captionsEnabled,
        transcriptVisible: showTranscript,
      }),
    }).catch(() => {});
  }, [user, captionsEnabled, showTranscript]);

  useEffect(() => {
    const onToggle = (event) => {
      const detail = event.detail || {};
      if (typeof detail.captionsEnabled === "boolean") {
        setCaptionsEnabled(detail.captionsEnabled);
      }
      if (typeof detail.transcriptVisible === "boolean") {
        setShowTranscript(detail.transcriptVisible);
      }
    };
    window.addEventListener("cortex-accessibility-toggle", onToggle);
    return () => window.removeEventListener("cortex-accessibility-toggle", onToggle);
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("cortex-status-update", {
        detail: {
          aiThinking: chatLoading,
        },
      }),
    );
  }, [chatLoading]);

  useEffect(() => {
    if (!segments.length) {
      setActiveSegId("");
      return;
    }
    setActiveSegId(segments[0].id);
  }, [segments]);

  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const onTime = () => {
      if (!segments.length) return;
      const current = video.currentTime;
      const seg = segments.find((item) => current >= item.start && current < item.end);
      if (seg) setActiveSegId(seg.id);
    };
    video.addEventListener("timeupdate", onTime);
    return () => video.removeEventListener("timeupdate", onTime);
  }, [segments]);

  const jumpToSegment = (segment) => {
    setActiveSegId(segment.id);
    if (videoRef.current && videoReady) {
      videoRef.current.currentTime = segment.start;
      videoRef.current.play().catch(() => {});
    }
  };

  const uploadSignVideo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSignVideoUrl(url);
    setVideoReady(false);
    setVisualStatus(`Sign video loaded: ${file.name}`);
  };

  const sendChat = async (messageOverride) => {
    const message = (messageOverride || chatInput).trim();
    if (!message) return;

    setChatMessages((prev) => [...prev, { role: "user", text: message }]);
    setChatInput("");
    setChatLoading(true);
    setVisualStatus("AI tutor is generating response...");

    try {
      const res = await fetch("/api/assistant/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Hearing-impaired learner context. Content: ${selected?.caption || ""}. Question: ${message}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Tutor response failed");
      const reply = data.reply || "I could not generate a response.";
      setChatMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      setVisualStatus("AI tutor response ready.");
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: err.message || "Could not get tutor response." },
      ]);
      setVisualStatus("AI tutor failed.");
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-2xl bg-sky-50 p-6 shadow-sm ring-1 ring-sky-200">
        <p className="text-sky-900">Loading inspiration content...</p>
      </section>
    );
  }

  if (!selected) {
    return (
      <section className="rounded-2xl bg-sky-50 p-6 shadow-sm ring-1 ring-sky-200">
        <p className="text-sky-900">No inspiration content available.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-sky-50 p-6 shadow-sm ring-1 ring-sky-200">
      <h2 className="text-2xl font-bold text-sky-950">Inspiration for Hearing-Impaired Learners</h2>
      <p className="mt-2 text-sky-900">
        Caption-first content, sign-language layer, synced transcript, and text-based AI tutor.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {stories.map((story) => (
          <button
            key={story.id}
            onClick={() => setSelected(story)}
            className={`rounded-xl p-4 text-left ring-1 transition ${
              selected.id === story.id
                ? "bg-sky-700 text-white ring-sky-700"
                : "bg-white text-sky-950 ring-sky-200 hover:bg-sky-100"
            }`}
          >
            <p className="font-semibold">{story.title}</p>
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-xl bg-white p-4 ring-1 ring-sky-100">
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-700">Visual Cue Center</p>
        <div className="mt-2 grid gap-2 md:grid-cols-4">
          <Cue label="Captions" value={captionsEnabled ? "On" : "Off"} good={captionsEnabled} />
          <Cue label="Transcript" value={showTranscript ? "On" : "Off"} good={showTranscript} />
          <Cue label="Sign Layer" value={videoReady ? "Ready" : "Pending"} good={videoReady} />
          <Cue label="Tutor" value={chatLoading ? "Thinking" : "Ready"} good={!chatLoading} />
        </div>
        <p className="mt-2 text-xs text-sky-700">{visualStatus}</p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setCaptionsEnabled((v) => !v)}
          className="rounded-lg border border-sky-300 px-4 py-2 text-sm font-semibold text-sky-900 hover:bg-sky-100"
        >
          Captions: {captionsEnabled ? "On" : "Off"}
        </button>
        <button
          onClick={() => setShowTranscript((v) => !v)}
          className="rounded-lg border border-sky-300 px-4 py-2 text-sm font-semibold text-sky-900 hover:bg-sky-100"
        >
          Transcript: {showTranscript ? "On" : "Off"}
        </button>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="rounded-xl bg-white p-4 ring-1 ring-sky-100">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-700">Sign Language Layer</p>
          <label className="mt-3 block text-sm font-medium text-sky-900">
            Sign Language
            <select
              value={signLanguage}
              onChange={(e) => {
                setSignLanguage(e.target.value);
                setVisualStatus(`Switched sign language to ${e.target.value}.`);
              }}
              className="mt-1 w-full rounded-lg border border-sky-200 p-2 text-sm"
            >
              {SIGN_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.code})
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block text-sm font-medium text-sky-900">
            Upload sign-language video
            <input
              type="file"
              accept="video/*"
              onChange={uploadSignVideo}
              className="mt-1 block w-full text-sm text-sky-900"
            />
          </label>
          <p className="mt-2 text-xs text-sky-700">
            Provide a sign-language clip for this lesson to enable side-by-side visual learning.
          </p>
          <div className="mt-3 rounded-lg bg-slate-900 p-2">
            {signVideoUrl ? (
              <video
                ref={videoRef}
                src={signVideoUrl}
                controls
                className="w-full rounded-md"
                onCanPlay={() => {
                  setVideoReady(true);
                  setVisualStatus("Sign video ready.");
                }}
              />
            ) : (
              <div className="flex h-40 items-center justify-center rounded-md bg-slate-800 text-sm text-slate-200">
                No sign video uploaded yet
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 ring-1 ring-sky-100">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-700">Caption</p>
          {captionsEnabled ? (
            <p className="mt-2 text-lg text-sky-950">{selected.caption}</p>
          ) : (
            <p className="mt-2 text-sm text-sky-700">Captions are currently turned off.</p>
          )}
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-sky-700">
            Transcript Progress: {transcriptProgress}%
          </p>
          <div className="mt-2 h-2 rounded-full bg-sky-100">
            <div
              className="h-2 rounded-full bg-sky-500 transition-all"
              style={{ width: `${transcriptProgress}%` }}
            />
          </div>
        </div>
      </div>

      {showTranscript && (
        <div className="mt-5 rounded-xl bg-white p-4 ring-1 ring-sky-100">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-700">Synced Transcript</p>
          <div className="mt-3 space-y-2">
            {segments.map((seg) => (
              <button
                key={seg.id}
                onClick={() => jumpToSegment(seg)}
                className={`w-full rounded-lg p-3 text-left text-sm transition ${
                  activeSegId === seg.id
                    ? "bg-sky-700 text-white"
                    : "bg-sky-50 text-sky-900 hover:bg-sky-100"
                }`}
              >
                <span className="mr-2 font-semibold">{formatTime(seg.start)}</span>
                {seg.text}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 rounded-xl bg-white p-4 ring-1 ring-sky-100">
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-700">AI Text Tutor</p>
        <p className="mt-1 text-sm text-sky-900">
          Live text-based support with quick phrases, optimized for hearing-impaired learners.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_PHRASES.map((phrase) => (
            <button
              key={phrase}
              onClick={() => sendChat(phrase)}
              className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800 hover:bg-sky-200"
            >
              {phrase}
            </button>
          ))}
        </div>
        <div className="mt-3 max-h-56 space-y-2 overflow-auto rounded-lg bg-sky-50 p-3">
          {chatMessages.length === 0 && (
            <p className="text-sm text-sky-700">No messages yet. Ask the tutor anything.</p>
          )}
          {chatMessages.map((msg, idx) => (
            <div
              key={`${msg.role}-${idx}`}
              className={`rounded-lg p-2 text-sm ${
                msg.role === "user" ? "bg-sky-700 text-white" : "bg-white text-sky-900"
              }`}
            >
              <p className="text-[11px] font-semibold uppercase">
                {msg.role === "user" ? "You" : "AI Tutor"}
              </p>
              <p>{msg.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendChat();
            }}
            placeholder="Type your question..."
            className="w-full rounded-lg border border-sky-200 p-2 text-sm"
          />
          <button
            onClick={() => sendChat()}
            disabled={chatLoading}
            className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {chatLoading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </section>
  );
}

function Cue({ label, value, good }) {
  return (
    <div className={`rounded-lg p-2 text-xs ring-1 ${good ? "bg-emerald-50 ring-emerald-200" : "bg-amber-50 ring-amber-200"}`}>
      <p className="font-semibold text-slate-700">{label}</p>
      <p className="mt-1 text-slate-900">{value}</p>
    </div>
  );
}
