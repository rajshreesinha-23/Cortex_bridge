"use client";

import { useEffect, useRef, useState } from "react";

export default function MotionDetectionPanel() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const signIntervalRef = useRef(null);
  const previousFrameRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [status, setStatus] = useState("Camera is off.");
  const [movementScore, setMovementScore] = useState(0);
  const [lightingScore, setLightingScore] = useState(0);
  const [stabilityScore, setStabilityScore] = useState(0);
  const [visibilityScore, setVisibilityScore] = useState(0);
  const [framingScore, setFramingScore] = useState(0);
  const [qualityGuidance, setQualityGuidance] = useState(
    "Start camera to get quality guidance.",
  );
  const [signMode, setSignMode] = useState(false);
  const [speechAssistMode, setSpeechAssistMode] = useState(true);
  const [supportedLanguages, setSupportedLanguages] = useState([]);
  const [signLanguage, setSignLanguage] = useState("ASL");
  const [detectingSign, setDetectingSign] = useState(false);
  const [signText, setSignText] = useState("");
  const [signToken, setSignToken] = useState("");
  const [signCandidates, setSignCandidates] = useState([]);
  const [signConfidence, setSignConfidence] = useState(null);
  const [inferenceMs, setInferenceMs] = useState(0);
  const [messageTokens, setMessageTokens] = useState([]);
  const [supportSignals, setSupportSignals] = useState([]);
  const [error, setError] = useState("");

  const stopMonitoring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (signIntervalRef.current) {
      clearInterval(signIntervalRef.current);
      signIntervalRef.current = null;
    }
    previousFrameRef.current = null;
    setDetectingSign(false);
  };

  const stopCamera = () => {
    stopMonitoring();
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
    setStatus("Camera is off.");
  };

  const getUserMediaCompat = async () => {
    if (typeof navigator === "undefined") {
      throw new Error("Camera is only available in browser.");
    }

    const isLocalHost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (!window.isSecureContext && !isLocalHost) {
      throw new Error(
        "Camera requires HTTPS. Open this app with https:// or use localhost.",
      );
    }

    const constraints = { video: { facingMode: "user" }, audio: false };

    if (navigator.mediaDevices?.getUserMedia) {
      return navigator.mediaDevices.getUserMedia(constraints);
    }

    const legacyGetUserMedia =
      navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;

    if (!legacyGetUserMedia) {
      throw new Error("Camera API not supported in this browser/webview.");
    }

    return new Promise((resolve, reject) => {
      legacyGetUserMedia.call(navigator, constraints, resolve, reject);
    });
  };

  const startMonitoring = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    stopMonitoring();

    intervalRef.current = setInterval(() => {
      if (!video.videoWidth || !video.videoHeight) return;

      canvas.width = 160;
      canvas.height = 120;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let luminanceSum = 0;
      let brightPixels = 0;
      let centerBrightPixels = 0;
      let sampledPixels = 0;

      const centerXMin = Math.floor(canvas.width * 0.25);
      const centerXMax = Math.floor(canvas.width * 0.75);
      const centerYMin = Math.floor(canvas.height * 0.2);
      const centerYMax = Math.floor(canvas.height * 0.8);

      for (let y = 0; y < canvas.height; y += 2) {
        for (let x = 0; x < canvas.width; x += 2) {
          const i = (y * canvas.width + x) * 4;
          const r = frame[i];
          const g = frame[i + 1];
          const b = frame[i + 2];
          const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          luminanceSum += lum;
          sampledPixels += 1;

          const isBright = lum > 45;
          if (isBright) {
            brightPixels += 1;
            if (x >= centerXMin && x <= centerXMax && y >= centerYMin && y <= centerYMax) {
              centerBrightPixels += 1;
            }
          }
        }
      }

      if (previousFrameRef.current) {
        let diff = 0;
        const sampleStep = 16;

        for (let i = 0; i < frame.length; i += sampleStep) {
          diff += Math.abs(frame[i] - previousFrameRef.current[i]);
        }

        const normalized = Math.min(100, Math.round(diff / 1200));
        setMovementScore(normalized);
        setStabilityScore(Math.max(0, 100 - normalized));

        if (normalized > 20) {
          setStatus("Movement detected.");
        } else {
          setStatus("No major movement.");
        }
      }

      const avgLuminance = sampledPixels ? luminanceSum / sampledPixels : 0;
      const nextLightingScore = Math.max(0, Math.min(100, Math.round((avgLuminance / 180) * 100)));
      const nextVisibilityScore = sampledPixels
        ? Math.round((brightPixels / sampledPixels) * 100)
        : 0;

      const centerAreaPixels =
        ((centerXMax - centerXMin) / 2) * ((centerYMax - centerYMin) / 2);
      const centerVisibility = centerAreaPixels
        ? Math.round((centerBrightPixels / centerAreaPixels) * 100)
        : 0;
      const nextFramingScore = Math.max(0, Math.min(100, centerVisibility));

      setLightingScore(nextLightingScore);
      setVisibilityScore(nextVisibilityScore);
      setFramingScore(nextFramingScore);
      setQualityGuidance(
        buildGuidance({
          lighting: nextLightingScore,
          visibility: nextVisibilityScore,
          framing: nextFramingScore,
        }),
      );

      previousFrameRef.current = new Uint8ClampedArray(frame);
    }, 220);
  };

  const detectSignFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.6);
    setDetectingSign(true);
    const t0 = performance.now();

    try {
      const res = await fetch("/api/sign-language/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageDataUrl,
          movementScore,
          signLanguage,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Sign detection failed");
      }

      setSignText(data.text || "");
      setSignToken(data.token || data.text || "");
      setSignCandidates(data.candidates || []);
      setSignConfidence(
        typeof data.confidence === "number" ? Math.round(data.confidence * 100) : null,
      );
      setInferenceMs(Math.round(performance.now() - t0));
    } catch (err) {
      setError(err.message || "Sign detection failed");
    } finally {
      setDetectingSign(false);
    }
  };

  const startSignDetection = () => {
    if (!signMode || !cameraOn) return;

    if (signIntervalRef.current) {
      clearInterval(signIntervalRef.current);
    }

    signIntervalRef.current = setInterval(() => {
      detectSignFrame();
    }, 1200);
  };

  const startCamera = async () => {
    setError("");

    try {
      const stream = await getUserMediaCompat();

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;
      await video.play();
      setCameraOn(true);
      setStatus("Camera active. Monitoring movement...");
      startMonitoring();
      if (signMode) {
        startSignDetection();
      }
    } catch (err) {
      setError(
        err?.message || "Camera permission denied or camera not available.",
      );
      setStatus("Unable to start camera.");
    }
  };

  useEffect(() => {
    if (cameraOn && signMode) {
      startSignDetection();
    }

    if (!signMode && signIntervalRef.current) {
      clearInterval(signIntervalRef.current);
      signIntervalRef.current = null;
      setDetectingSign(false);
    }
  }, [cameraOn, signMode, signLanguage]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("cortex-status-update", {
        detail: {
          cameraOn,
          signMode,
          aiThinking: detectingSign,
        },
      }),
    );
  }, [cameraOn, signMode, detectingSign]);

  useEffect(() => {
    fetch("/api/sign-language/supported")
      .then((res) => res.json())
      .then((data) => {
        const languages = data?.languages || [];
        setSupportedLanguages(languages);
      })
      .catch(() => {});
  }, []);

  const addDetectedWord = () => {
    if (!signToken) return;
    setMessageTokens((prev) => [...prev, signToken]);
  };

  const clearMessage = () => {
    setMessageTokens([]);
  };

  const speakMessage = () => {
    const sentence = messageTokens.join(" ").trim();
    if (!sentence || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const signals = [];

    if (signMode && signConfidence !== null && signConfidence >= 55) {
      signals.push({
        id: "sign_comm",
        label: "Sign-language communication pattern detected",
        confidence: signConfidence,
      });
    }

    if (speechAssistMode && messageTokens.length >= 2) {
      signals.push({
        id: "speech_assist",
        label: "Speech-impaired assist behavior active",
        confidence: Math.min(95, 40 + messageTokens.length * 10),
      });
    }

    if (cameraOn && framingScore >= 55 && stabilityScore >= 55 && movementScore <= 45) {
      signals.push({
        id: "motor_stability",
        label: "Stable gesture framing suitable for motion-based learning",
        confidence: Math.min(92, Math.round((framingScore + stabilityScore) / 2)),
      });
    }

    setSupportSignals(signals);
  }, [
    cameraOn,
    signMode,
    signConfidence,
    speechAssistMode,
    messageTokens,
    framingScore,
    stabilityScore,
    movementScore,
  ]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <section className="rounded-2xl bg-rose-50 p-6 shadow-sm ring-1 ring-rose-200">
      <h2 className="text-2xl font-bold text-rose-950">Motion Detection Studio</h2>
      <p className="mt-2 text-rose-900">
        Camera-based movement tracking for gesture-enabled interaction and physical engagement.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-[1.3fr,1fr]">
        <div className="rounded-xl bg-black p-2">
          <video
            ref={videoRef}
            className="aspect-video w-full rounded-lg object-cover"
            muted
            playsInline
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="rounded-xl bg-white p-4 ring-1 ring-rose-100">
          <p className="text-sm text-rose-700">Status</p>
          <p className="mt-1 font-semibold text-rose-950">{status}</p>
          <p className="mt-4 text-sm text-rose-700">Movement Score</p>
          <p className="text-3xl font-extrabold text-rose-700">{movementScore}%</p>
          <div className="mt-2 h-2 rounded-full bg-rose-100">
            <div
              className="h-2 rounded-full bg-rose-500 transition-all"
              style={{ width: `${movementScore}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <Metric label="Lighting" value={lightingScore} />
            <Metric label="Stability" value={stabilityScore} />
            <Metric label="Visibility" value={visibilityScore} />
            <Metric label="Framing" value={framingScore} />
          </div>
          <p className="mt-3 text-xs text-rose-800">{qualityGuidance}</p>
          {signMode && (
            <div className="mt-3 rounded bg-rose-50 p-2 text-xs ring-1 ring-rose-100">
              <p className="font-semibold text-rose-800">Model Performance</p>
              <p className="mt-1 text-rose-900">
                Confidence: {signConfidence !== null ? `${signConfidence}%` : "N/A"} | Inference:{" "}
                {inferenceMs ? `${inferenceMs} ms` : "N/A"}
              </p>
            </div>
          )}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={() => setSpeechAssistMode((v) => !v)}
          className="rounded-xl border border-rose-300 px-4 py-2 font-semibold text-rose-900 hover:bg-rose-100"
        >
          {speechAssistMode ? "Disable" : "Enable"} Speech-Impaired Assist
        </button>
        <button
          onClick={() => setSignMode((v) => !v)}
          className="rounded-xl border border-rose-300 px-4 py-2 font-semibold text-rose-900 hover:bg-rose-100"
        >
          {signMode ? "Disable" : "Enable"} Sign Language Mode
        </button>
        <button
          onClick={startCamera}
          disabled={cameraOn}
          className="rounded-xl bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
        >
          Start Camera
        </button>
        <button
          onClick={stopCamera}
          className="rounded-xl border border-rose-300 px-4 py-2 font-semibold text-rose-900 hover:bg-rose-100"
        >
          Stop Camera
        </button>
      </div>

      {signMode && (
        <div className="mt-5 rounded-xl bg-white p-4 ring-1 ring-rose-100">
          <div className="mb-3">
            <label className="text-sm font-semibold text-rose-700">Sign Language</label>
            <select
              value={signLanguage}
              onChange={(e) => setSignLanguage(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-rose-200 p-2 text-sm text-rose-900"
            >
              {(supportedLanguages.length
                ? supportedLanguages
                : [{ code: "ASL", name: "American Sign Language" }]
              ).map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.code})
                </option>
              ))}
            </select>
          </div>

          <p className="text-sm font-semibold text-rose-700">Sign Language Detection</p>
          <p className="mt-1 text-rose-900">
            {detectingSign ? "Detecting signs..." : signText || "No sign interpreted yet."}
          </p>
          {signConfidence !== null && (
            <p className="mt-1 text-sm text-rose-700">Confidence: {signConfidence}%</p>
          )}
          {signCandidates.length > 0 && (
            <p className="mt-1 text-xs text-rose-700">
              Candidates: {signCandidates.map((c) => c.token).join(", ")}
            </p>
          )}
          <p className="mt-2 text-xs text-rose-700">
            For full recognition, connect your backend model at `/sign-language/detect`.
          </p>

          {speechAssistMode && (
            <div className="mt-4 rounded-lg bg-rose-50 p-3">
              <p className="text-sm font-semibold text-rose-800">Speech-Impaired Communication</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={addDetectedWord}
                  disabled={!signToken}
                  className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Add Detected Word
                </button>
                <button
                  onClick={clearMessage}
                  className="rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-900"
                >
                  Clear Message
                </button>
                <button
                  onClick={speakMessage}
                  disabled={!messageTokens.length}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Speak Message
                </button>
              </div>
              <div className="mt-3 rounded-lg bg-white p-3 ring-1 ring-rose-100">
                <p className="text-xs uppercase tracking-wide text-rose-700">Output Message</p>
                <p className="mt-1 text-xl font-bold text-rose-900">
                  {messageTokens.join(" ") || "..."}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 rounded-xl bg-white p-4 ring-1 ring-rose-100">
        <p className="text-sm font-semibold text-rose-700">Assistive Detection Signals</p>
        {supportSignals.length === 0 ? (
          <p className="mt-2 text-sm text-rose-900">
            No assistive communication signal detected yet. Start camera and use sign mode.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {supportSignals.map((signal) => (
              <div key={signal.id} className="rounded-lg bg-rose-50 p-2 ring-1 ring-rose-100">
                <p className="text-sm font-semibold text-rose-900">{signal.label}</p>
                <p className="text-xs text-rose-700">Confidence: {signal.confidence}%</p>
              </div>
            ))}
          </div>
        )}
        <p className="mt-2 text-xs text-rose-700">
          This is assistive behavior inference only, not a medical diagnosis.
        </p>
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded bg-rose-50 p-2 ring-1 ring-rose-100">
      <p className="text-[11px] text-rose-700">{label}</p>
      <p className="font-semibold text-rose-900">{value}%</p>
    </div>
  );
}

function buildGuidance({ lighting, visibility, framing }) {
  const tips = [];
  if (lighting < 40) tips.push("Improve room lighting.");
  if (visibility < 35) tips.push("Increase contrast between hands and background.");
  if (framing < 35) tips.push("Keep hands centered in the frame.");
  if (tips.length === 0) return "Quality looks good for sign communication.";
  return tips.join(" ");
}
