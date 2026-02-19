import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "app-db.json");

const defaultDb = {
  users: [],
  progressByUser: {},
  preferencesByUser: {},
  lessons: [
    {
      id: "dys-1",
      type: "dyslexia",
      title: "Understanding Fractions",
      content:
        "A fraction represents part of a whole. If a pizza has 8 slices and you eat 2, you ate two-eighths.",
      question: "If you eat 4 of 8 slices, what fraction did you eat?",
      options: ["1/8", "1/2", "1/4"],
      answer: "1/2",
    },
    {
      id: "dys-2",
      type: "dyslexia",
      title: "Reading Comprehension",
      content:
        "Main idea means the most important point in a paragraph. Details explain and support that idea.",
      question: "What does supporting detail do?",
      options: ["Changes topic", "Supports the main idea", "Removes examples"],
      answer: "Supports the main idea",
    },
    {
      id: "insp-1",
      type: "inspiration",
      title: "You Are Building Skill Every Day",
      caption:
        "Progress is not always loud. Every small step is valid. Review one concept today and celebrate the effort.",
      transcript:
        "Take one short lesson today, write one sentence about what you understood, and you have already moved forward.",
    },
    {
      id: "insp-2",
      type: "inspiration",
      title: "Learning Is a Team Journey",
      caption:
        "Ask for support early. Shared understanding grows faster than silent struggle. You belong in this learning space.",
      transcript:
        "Find a peer, mentor, or teacher and send one question. Collaboration is a strength, not a weakness.",
    },
    {
      id: "insp-3",
      type: "inspiration",
      title: "Consistency Beats Intensity",
      caption:
        "Fifteen focused minutes every day can create powerful outcomes. Keep the rhythm and trust the process.",
      transcript:
        "Set a small daily learning slot, repeat it, and reflect weekly. Your system matters more than one perfect day.",
    },
  ],
};

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(String(password)).digest("hex");
}

async function readDb() {
  try {
    const raw = await readFile(DB_PATH, "utf8");
    return { ...defaultDb, ...JSON.parse(raw) };
  } catch {
    await mkdir(DB_DIR, { recursive: true });
    await writeFile(DB_PATH, JSON.stringify(defaultDb, null, 2), "utf8");
    return structuredClone(defaultDb);
  }
}

async function writeDb(db) {
  await mkdir(DB_DIR, { recursive: true });
  await writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

function defaultProgress(email) {
  return { email, lessonsCompleted: 0, weeklyConsistency: 0, skillMastery: 0 };
}

function defaultPreferences() {
  return {
    largeText: true,
    wideSpacing: true,
    focusLine: false,
    captionsEnabled: true,
    transcriptVisible: true,
    voiceAutoSpeak: false,
    accessibilityNeeds: [],
  };
}

export async function signupLocal({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) {
    const err = new Error("Email and password are required");
    err.status = 400;
    throw err;
  }

  const db = await readDb();
  if (db.users.some((u) => u.email === normalizedEmail)) {
    const err = new Error("User already exists");
    err.status = 409;
    throw err;
  }

  db.users.push({
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  });
  db.progressByUser[normalizedEmail] = defaultProgress(normalizedEmail);
  db.preferencesByUser[normalizedEmail] = defaultPreferences();
  await writeDb(db);

  return {
    message: "Signup successful",
    user: { email: normalizedEmail },
    token: crypto.randomBytes(16).toString("hex"),
  };
}

export async function loginLocal({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) {
    const err = new Error("Email and password are required");
    err.status = 400;
    throw err;
  }

  const db = await readDb();
  const user = db.users.find((u) => u.email === normalizedEmail);
  if (!user || user.passwordHash !== hashPassword(password)) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  if (!db.progressByUser[normalizedEmail]) {
    db.progressByUser[normalizedEmail] = defaultProgress(normalizedEmail);
  }
  if (!db.preferencesByUser[normalizedEmail]) {
    db.preferencesByUser[normalizedEmail] = defaultPreferences();
  }
  await writeDb(db);

  return {
    message: "Login successful",
    user: { email: normalizedEmail },
    token: crypto.randomBytes(16).toString("hex"),
  };
}

export async function getProgressLocal(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    const err = new Error("email is required");
    err.status = 400;
    throw err;
  }

  const db = await readDb();
  const progress =
    db.progressByUser[normalizedEmail] || defaultProgress(normalizedEmail);
  db.progressByUser[normalizedEmail] = progress;
  await writeDb(db);
  return { progress };
}

export async function updateProgressLocal(payload) {
  const normalizedEmail = normalizeEmail(payload?.email);
  if (!normalizedEmail) {
    const err = new Error("email is required");
    err.status = 400;
    throw err;
  }

  const db = await readDb();
  const current =
    db.progressByUser[normalizedEmail] || defaultProgress(normalizedEmail);
  const updated = {
    ...current,
    ...payload,
    email: normalizedEmail,
  };

  db.progressByUser[normalizedEmail] = updated;
  await writeDb(db);
  return { message: "Progress updated", progress: updated };
}

export async function getPreferencesLocal(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    const err = new Error("email is required");
    err.status = 400;
    throw err;
  }

  const db = await readDb();
  const preferences = {
    ...defaultPreferences(),
    ...(db.preferencesByUser[normalizedEmail] || {}),
  };
  db.preferencesByUser[normalizedEmail] = preferences;
  await writeDb(db);
  return { preferences };
}

export async function updatePreferencesLocal(payload) {
  const normalizedEmail = normalizeEmail(payload?.email);
  if (!normalizedEmail) {
    const err = new Error("email is required");
    err.status = 400;
    throw err;
  }

  const db = await readDb();
  const current = {
    ...defaultPreferences(),
    ...(db.preferencesByUser[normalizedEmail] || {}),
  };
  const updated = { ...current, ...payload, email: normalizedEmail };
  delete updated.password;
  db.preferencesByUser[normalizedEmail] = updated;
  await writeDb(db);
  return { message: "Preferences updated", preferences: updated };
}

export async function getLessonsLocal(type) {
  const db = await readDb();
  const lessons = type
    ? db.lessons.filter((lesson) => lesson.type === type)
    : db.lessons;
  return { lessons };
}
