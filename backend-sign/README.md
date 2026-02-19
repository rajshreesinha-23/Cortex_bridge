# backend-sign

FastAPI sign-language backend scaffold for Cortex Bridge.

## Endpoints

- `GET /health`
- `GET /sign-language/supported`
- `POST /sign-language/detect`

`POST /sign-language/detect` request:

```json
{
  "image": "data:image/jpeg;base64,...",
  "movementScore": 42,
  "signLanguage": "ASL",
  "sessionId": "user-123"
}
```

Response:

```json
{
  "text": "HELLO",
  "token": "HELLO",
  "confidence": 0.91,
  "language": "ASL",
  "candidates": [
    { "token": "HELLO", "confidence": 0.91 },
    { "token": "THANK YOU", "confidence": 0.05 },
    { "token": "PLEASE", "confidence": 0.02 }
  ]
}
```

## Run

```bash
cd backend-sign
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Open health:

```bash
curl http://localhost:8001/health
```

## Weights

By default, the service expects model weights at:

- `backend-sign/weights/sign_model.pt`

Set a custom path with:

```bash
export SIGN_MODEL_WEIGHTS=/absolute/path/to/sign_model.pt
```

If weights are not present, the API still runs and returns heuristic predictions so frontend integration can be tested.

## Connect to Next.js app

In `/Users/ananyasinha/Desktop/Cortex_bridge/.env.local`:

```env
USE_LOCAL_SIGN_FALLBACK=false
BACKEND_API_BASE_URL=http://localhost:8001
BACKEND_API_KEY=dev-key
```

Your Next.js server route sends `x-api-key` to backend. If you do not validate API keys yet, just ignore that header for now.
