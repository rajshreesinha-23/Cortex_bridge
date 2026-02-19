const BACKEND_BASE_URL = process.env.BACKEND_API_BASE_URL;
const BACKEND_API_KEY = process.env.BACKEND_API_KEY;

function ensureConfig() {
  if (!BACKEND_BASE_URL || !BACKEND_API_KEY) {
    throw new Error(
      "Missing backend config. Set BACKEND_API_BASE_URL and BACKEND_API_KEY in your environment.",
    );
  }
}

export async function backendRequest(path, options = {}) {
  ensureConfig();

  const url = new URL(path, BACKEND_BASE_URL).toString();

  const headers = {
    "Content-Type": "application/json",
    "x-api-key": BACKEND_API_KEY,
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Backend request failed with status ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    err.details = data;
    throw err;
  }

  return data;
}
