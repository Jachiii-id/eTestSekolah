const STORAGE_KEY = 'etest.session';

export interface StoredSession {
  id: string;
  role: 'student' | 'admin';
}

/** Stands in for Firebase Auth's session persistence now that login is a
 * plain Firestore credential check with no auth token — purely a UX
 * convenience (survive refresh), not a security boundary. */
export function saveSession(session: StoredSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}
