export interface MockSession {
  userId: string;
  expiresAt: number;
}

const SESSIONS_KEY = "kurio:mock:sessions";

function readSessions(): Record<string, MockSession> {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);

    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    return parsed as Record<string, MockSession>;
  } catch {
    return {};
  }
}

export function getAuthenticatedUserId(request: Request): string | null {
  const authorization = request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length);
  const sessions = readSessions();
  const session = sessions[token];

  if (
    !session ||
    typeof session.userId !== "string" ||
    typeof session.expiresAt !== "number"
  ) {
    return null;
  }

  if (Date.now() >= session.expiresAt) {
    delete sessions[token];

    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));

    return null;
  }

  return session.userId;
}
