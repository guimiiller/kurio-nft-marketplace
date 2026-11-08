const SESSION_STORAGE_KEY = "kurio:auth:session";

export interface AuthSession {
  accessToken: string;
  userId: string;
  expiresAt: number;
}

export function getSession(): AuthSession | null {
  const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);

  if (!raw) return null;

  try {
    const session: unknown = JSON.parse(raw);

    if (
      typeof session !== "object" ||
      session === null ||
      !("accessToken" in session) ||
      !("userId" in session) ||
      !("expiresAt" in session) ||
      typeof session.accessToken !== "string" ||
      typeof session.userId !== "string" ||
      typeof session.expiresAt !== "number"
    ) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    if (Date.now() >= session.expiresAt) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    return session as AuthSession;
  } catch {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function saveSession(session: AuthSession): void {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}
