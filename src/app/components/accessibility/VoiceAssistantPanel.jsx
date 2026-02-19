"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const defaultPrompts = [
  "Read the lesson summary",
  "What should I learn next?",
  "Give me a short motivation message",
];

const RECENT_UPLOADS_KEY = "voice_recent_uploads";

export default function VoiceAssistantPanel() {
  const [text, setText] = useState(
    "Welcome to Cortex Bridge. I can read lessons and guide learning by voice.",
  );
  const [assistantReply, setAssistantReply] = useState("");
  const [listening, setListening] = useState(false);
  const [asking, setAsking] = useState(false);
  const [status, setStatus] = useState("");
  const [spoken, setSpoken] = useState("");
  const [ariaMessage, setAriaMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileLoaded, setFileLoaded] = useState(false);
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState("");
  const [rate, setRate] = useState(0.95);
  const [autoSpeakReply, setAutoSpeakReply] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recentUploads, setRecentUploads] = useState([]);
  const [scanCameraOn, setScanCameraOn] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);

  const fileInputRef = useRef(null);
  const scanVideoRef = useRef(null);
  const scanCanvasRef = useRef(null);
  const scanStreamRef = useRef(null);

  const supportsTts = typeof window !== "undefined" && "speechSynthesis" in window;
  const supportsStt = useMemo(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_UPLOADS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setRecentUploads(parsed);
      }
    } catch {
      // no-op
    }
  }, []);

  useEffect(() => {
    if (!supportsTts) return;
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices() || [];
      setVoices(available);
      if (!voiceName && available.length > 0) {
        const preferred =
          available.find((v) => v.lang?.toLowerCase().startsWith("en")) || available[0];
        setVoiceName(preferred?.name || "");
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [supportsTts, voiceName]);

  useEffect(() => {
    return () => {
      if (scanStreamRef.current) {
        scanStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("cortex-status-update", {
        detail: { speaking: isSpeaking, listening, aiThinking: asking },
      }),
    );
  }, [isSpeaking, listening, asking]);

  const announce = (message) => {
    setStatus(message);
    setAriaMessage(message);
  };

  const getSelectedVoice = () => voices.find((v) => v.name === voiceName);

  const speakText = (value) => {
    if (!supportsTts) {
      announce("Text-to-speech is not available in this browser.");
      return;
    }
    const content = String(value || "").trim();
    if (!content) {
      announce("No text to speak.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.rate = rate;
    const selectedVoice = getSelectedVoice();
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    }
    utterance.onpause = () => setIsPaused(true);
    utterance.onresume = () => setIsPaused(false);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      announce("Speech complete.");
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      announce("Speech failed. Try again.");
    };
    setIsPaused(false);
    announce("Speaking...");
    window.speechSynthesis.speak(utterance);
  };

  const askAssistant = async (input) => {
    const message = String(input || "").trim();
    if (!message) return;

    setAsking(true);
    announce("Thinking...");

    try {
      const res = await fetch("/api/assistant/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Assistant request failed");
      }
      const reply = data.reply || "I could not generate a response.";
      setAssistantReply(reply);
      setText(reply);
      announce(data.source === "backend" ? "AI response received." : "Local assistant response.");
      if (autoSpeakReply) speakText(reply);
    } catch (err) {
      announce(err.message || "Assistant request failed.");
    } finally {
      setAsking(false);
    }
  };

  const stopSpeaking = () => {
    if (!supportsTts) return;
    window.speechSynthesis.cancel();
    setIsPaused(false);
    setIsSpeaking(false);
    announce("Stopped.");
  };

  const pauseResume = () => {
    if (!supportsTts) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      announce("Resumed.");
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsSpeaking(false);
      announce("Paused.");
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
    announce("File picker opened.");
  };

  const pushRecentUpload = (item) => {
    setRecentUploads((prev) => {
      const next = [item, ...prev.filter((p) => p.name !== item.name)].slice(0, 8);
      localStorage.setItem(RECENT_UPLOADS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const loadUploadedText = (name, content) => {
    const clean = String(content || "").trim();
    if (!clean) {
      announce("Uploaded file is empty.");
      return;
    }

    const clipped = clean.length > 10000 ? `${clean.slice(0, 10000)} ...` : clean;
    setText(clipped);
    setFileName(name);
    setFileLoaded(true);
    pushRecentUpload({ name, content: clipped });
    announce(`Loaded file: ${name}. Say "read uploaded file" to listen.`);
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const lower = file.name.toLowerCase();
    const isTextLike =
      file.type.startsWith("text/") ||
      file.type === "application/json" ||
      file.type === "application/xml" ||
      lower.endsWith(".txt") ||
      lower.endsWith(".md") ||
      lower.endsWith(".csv") ||
      lower.endsWith(".json") ||
      lower.endsWith(".xml");

    if (!isTextLike) {
      announce("Unsupported file type. Upload .txt, .md, .csv, .json, or .xml.");
      return;
    }

    try {
      const content = await file.text();
      loadUploadedText(file.name, content);
    } catch {
      announce("Could not read the uploaded file.");
    } finally {
      if (event.target) event.target.value = "";
    }
  };

  const startListening = () => {
    if (!supportsStt) {
      announce("Voice input is not available in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      announce("Listening...");
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setSpoken(transcript);
      if (!transcript) return;

      const cmd = transcript.trim().toLowerCase();
      if (cmd.includes("open file picker") || cmd.includes("upload file")) {
        openFilePicker();
        return;
      }
      if (cmd.includes("read uploaded file") || cmd.includes("read file")) {
        if (fileLoaded) speakText(text);
        else announce("No file loaded yet.");
        return;
      }
      if (cmd === "stop") {
        stopSpeaking();
        return;
      }
      if (cmd === "pause") {
        if (!isPaused) pauseResume();
        return;
      }
      if (cmd === "resume") {
        if (isPaused) pauseResume();
        return;
      }

      setText(transcript);
      askAssistant(transcript);
    };

    recognition.onerror = () => {
      announce("Voice input failed. Try again.");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      announce("Voice input complete.");
    };

    recognition.start();
  };

  const startScanCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        announce("Camera scanning is not available in this browser.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      scanStreamRef.current = stream;
      if (scanVideoRef.current) {
        scanVideoRef.current.srcObject = stream;
        await scanVideoRef.current.play();
      }
      setScanCameraOn(true);
      announce("Scan camera started. Use capture to extract text.");
    } catch {
      announce("Could not start scan camera.");
    }
  };

  const stopScanCamera = () => {
    if (scanStreamRef.current) {
      scanStreamRef.current.getTracks().forEach((t) => t.stop());
      scanStreamRef.current = null;
    }
    if (scanVideoRef.current) {
      scanVideoRef.current.srcObject = null;
    }
    setScanCameraOn(false);
    announce("Scan camera stopped.");
  };

  const captureAndExtract = async () => {
    const video = scanVideoRef.current;
    const canvas = scanCanvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
      announce("Camera preview not ready.");
      return;
    }

    setScanLoading(true);
    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);
      const image = canvas.toDataURL("image/jpeg", 0.9);

      const res = await fetch("/api/ocr/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OCR failed");

      const extracted = (data.text || "").trim();
      if (!extracted) {
        announce(data.message || "No text detected from scan.");
        return;
      }
      loadUploadedText("camera-scan.txt", extracted);
    } catch (err) {
      announce(err.message || "Could not extract text from image.");
    } finally {
      setScanLoading(false);
    }
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-2xl font-bold text-slate-900">Voice Assistant</h2>
      <p className="mt-2 text-slate-600">
        Speech-first support for visually impaired learners with voice input and read-aloud.
      </p>
      <p className="sr-only" aria-live="polite">
        {ariaMessage}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {defaultPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => setText(prompt)}
            className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200"
          >
            {prompt}
          </button>
        ))}
      </div>

      <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="speech-text">
        Speech text
      </label>
      <textarea
        id="speech-text"
        aria-label="Speech text input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        className="mt-2 w-full rounded-xl border border-slate-300 p-3 focus:border-emerald-500 focus:outline-none"
      />

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Voice
          <select
            aria-label="Voice selection"
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm"
          >
            {voices.length === 0 && <option value="">Default voice</option>}
            {voices.map((voice) => (
              <option key={`${voice.name}-${voice.lang}`} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Reading speed ({rate.toFixed(2)}x)
          <input
            type="range"
            min="0.6"
            max="1.4"
            step="0.05"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="mt-2 w-full"
          />
        </label>
      </div>

      <div className="mt-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
        <p className="text-sm font-semibold text-slate-700">Upload File For Read-Aloud</p>
        <p className="mt-1 text-xs text-slate-500">
          Voice command: say "open file picker", then "read uploaded file".
        </p>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleUpload}
          accept=".txt,.md,.csv,.json,.xml,text/plain,text/markdown,text/csv,application/json,application/xml"
          className="sr-only"
          aria-label="Upload text file for read aloud"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={openFilePicker}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
          >
            Open File Picker
          </button>
          <button
            onClick={() => (fileLoaded ? speakText(text) : announce("No file loaded yet."))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
          >
            Read Uploaded File
          </button>
        </div>
        {fileName && <p className="mt-2 text-xs text-slate-500">Loaded: {fileName}</p>}
      </div>

      <div className="mt-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
        <p className="text-sm font-semibold text-slate-700">Scan Document With Camera (OCR)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={startScanCamera}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
          >
            Start Scan Camera
          </button>
          <button
            onClick={captureAndExtract}
            disabled={!scanCameraOn || scanLoading}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
          >
            {scanLoading ? "Extracting..." : "Capture & Extract"}
          </button>
          <button
            onClick={stopScanCamera}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
          >
            Stop Scan
          </button>
        </div>
        {scanCameraOn && (
          <div className="mt-3">
            <video ref={scanVideoRef} className="w-full max-w-md rounded-lg bg-black" muted playsInline />
            <canvas ref={scanCanvasRef} className="hidden" />
          </div>
        )}
      </div>

      {recentUploads.length > 0 && (
        <div className="mt-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-sm font-semibold text-slate-700">Recent uploads</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {recentUploads.map((item, idx) => (
              <button
                key={`${item.name}-${idx}`}
                onClick={() => loadUploadedText(item.name, item.content)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={() => speakText(text)}
          className="rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
        >
          Speak
        </button>
        <button
          onClick={() => askAssistant(text)}
          disabled={asking}
          className="rounded-xl bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {asking ? "Thinking..." : "Ask AI Coach"}
        </button>
        <button
          onClick={stopSpeaking}
          className="rounded-xl bg-slate-700 px-4 py-2 font-medium text-white hover:bg-slate-800"
        >
          Stop
        </button>
        <button
          onClick={pauseResume}
          className="rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-800 hover:bg-slate-100"
        >
          {isPaused ? "Resume" : "Pause"}
        </button>
        <button
          onClick={startListening}
          disabled={listening}
          className="rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-800 hover:bg-slate-100 disabled:opacity-60"
        >
          {listening ? "Listening..." : "Voice Input"}
        </button>
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={autoSpeakReply}
          onChange={(e) => setAutoSpeakReply(e.target.checked)}
        />
        Auto-read AI replies
      </label>

      {status && <p className="mt-3 text-sm text-slate-600">{status}</p>}
      {spoken && <p className="mt-1 text-sm text-slate-500">Transcript: {spoken}</p>}
      {assistantReply && (
        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 ring-1 ring-slate-200">
          <p className="font-semibold text-slate-900">Assistant Reply</p>
          <p className="mt-1">{assistantReply}</p>
        </div>
      )}
    </section>
  );
}
