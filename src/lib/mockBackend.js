import {
  getLessonsLocal,
  getPreferencesLocal,
  getProgressLocal,
  loginLocal,
  signupLocal,
  updatePreferencesLocal,
  updateProgressLocal,
} from "@/lib/localDb";

export function isMockMode() {
  return process.env.USE_MOCK_API === "true" || process.env.USE_LOCAL_DB === "true";
}

export async function mockSignup(payload) {
  return signupLocal(payload || {});
}

export async function mockLogin(payload) {
  return loginLocal(payload || {});
}

export async function mockGetProgress(email) {
  return getProgressLocal(email);
}

export async function mockUpdateProgress(payload) {
  return updateProgressLocal(payload || {});
}

export async function mockGetPreferences(email) {
  return getPreferencesLocal(email);
}

export async function mockUpdatePreferences(payload) {
  return updatePreferencesLocal(payload || {});
}

export async function mockGetLessons(type) {
  return getLessonsLocal(type);
}
