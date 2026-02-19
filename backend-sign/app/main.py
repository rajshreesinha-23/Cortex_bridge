import base64
import os
from typing import List, Optional

import cv2
import numpy as np
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.buffer import SessionBuffer
from app.landmarks import LandmarkExtractor
from app.model import SignTransformer

SUPPORTED_LANGUAGES = ["ASL", "BSL", "ISL", "AUSLAN"]

LABELS_BY_LANGUAGE = {
  "ASL": ["HELLO", "THANK YOU", "PLEASE", "HELP", "YES", "NO"],
  "BSL": ["HELLO", "THANK YOU", "PLEASE", "HELP", "YES", "NO"],
  "ISL": ["NAMASTE", "THANK YOU", "PLEASE", "HELP", "YES", "NO"],
  "AUSLAN": ["HELLO", "THANK YOU", "PLEASE", "HELP", "YES", "NO"],
}

WEIGHTS_PATH = os.getenv("SIGN_MODEL_WEIGHTS", "weights/sign_model.pt")
WINDOW = int(os.getenv("SIGN_WINDOW", "32"))
FEATURE_DIM = 162

app = FastAPI(title="Sign Language Detection API", version="0.1.0")

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

device = "cuda" if torch.cuda.is_available() else "cpu"
extractor = LandmarkExtractor()
buffer = SessionBuffer(window=WINDOW, feat_dim=FEATURE_DIM)

# Single shared model; route by language label set.
model = SignTransformer(
  input_dim=FEATURE_DIM,
  d_model=256,
  nhead=8,
  layers=4,
  num_classes=max(len(labels) for labels in LABELS_BY_LANGUAGE.values()),
)
model.to(device).eval()

weights_loaded = False
if os.path.exists(WEIGHTS_PATH):
  state = torch.load(WEIGHTS_PATH, map_location=device)
  model.load_state_dict(state, strict=False)
  weights_loaded = True


class DetectRequest(BaseModel):
  image: str
  movementScore: Optional[float] = 0
  signLanguage: Optional[str] = "ASL"
  sessionId: Optional[str] = "default"


class Candidate(BaseModel):
  token: str
  confidence: float


class DetectResponse(BaseModel):
  text: str
  token: str
  confidence: float
  language: str
  candidates: List[Candidate]


def decode_data_url(data_url: str):
  if not data_url:
    raise ValueError("Image payload is empty")

  b64_part = data_url.split(",")[-1]
  raw = base64.b64decode(b64_part)
  arr = np.frombuffer(raw, np.uint8)
  image = cv2.imdecode(arr, cv2.IMREAD_COLOR)
  if image is None:
    raise ValueError("Invalid image payload")
  return image


def heuristic_response(sign_language: str, movement_score: float):
  labels = LABELS_BY_LANGUAGE.get(sign_language, LABELS_BY_LANGUAGE["ASL"])
  if movement_score < 20:
    return {
      "text": "NO_CLEAR_SIGN",
      "token": "NO_CLEAR_SIGN",
      "confidence": 0.18,
      "language": sign_language,
      "candidates": [],
    }

  idx = 0 if movement_score > 60 else 1 if movement_score > 40 else 2
  idx = min(idx, len(labels) - 1)
  token = labels[idx]

  return {
    "text": token,
    "token": token,
    "confidence": min(0.85, 0.25 + movement_score / 100.0),
    "language": sign_language,
    "candidates": [
      {"token": labels[0], "confidence": 0.62},
      {"token": labels[min(1, len(labels) - 1)], "confidence": 0.23},
      {"token": labels[min(2, len(labels) - 1)], "confidence": 0.15},
    ],
  }


@app.get("/health")
def health():
  return {
    "ok": True,
    "weights_loaded": weights_loaded,
    "device": device,
    "supported_languages": SUPPORTED_LANGUAGES,
  }


@app.get("/sign-language/supported")
def supported():
  return {"languages": [{"code": code, "name": code} for code in SUPPORTED_LANGUAGES]}


@app.post("/sign-language/detect", response_model=DetectResponse)
def detect_sign(req: DetectRequest):
  sign_language = (req.signLanguage or "ASL").upper()
  if sign_language not in SUPPORTED_LANGUAGES:
    sign_language = "ASL"

  try:
    frame = decode_data_url(req.image)
  except ValueError as err:
    raise HTTPException(status_code=400, detail=str(err)) from err

  # If no trained weights are present, return deterministic heuristic output.
  if not weights_loaded:
    return heuristic_response(sign_language, float(req.movementScore or 0))

  feat = extractor.extract_feature_vector(frame)
  session_id = req.sessionId or "default"
  buffer.push(session_id, feat)
  window_arr = buffer.get_window(session_id)

  labels = LABELS_BY_LANGUAGE.get(sign_language, LABELS_BY_LANGUAGE["ASL"])

  x = torch.tensor(window_arr, dtype=torch.float32).unsqueeze(0).to(device)
  with torch.no_grad():
    logits = model(x)
    logits = logits[:, : len(labels)]
    probs = torch.softmax(logits, dim=-1).cpu().numpy()[0]

  top_idx = probs.argsort()[::-1][:3]
  candidates = [{"token": labels[i], "confidence": float(probs[i])} for i in top_idx]

  best = top_idx[0]
  return {
    "text": labels[best],
    "token": labels[best],
    "confidence": float(probs[best]),
    "language": sign_language,
    "candidates": candidates,
  }
