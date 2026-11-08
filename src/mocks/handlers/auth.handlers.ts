import { http, HttpResponse } from "msw";

import type {
  AuthUser,
  LoginInput,
  SignupInput,
} from "../../features/auth/types/auth.types";

interface StoredUser extends AuthUser {
  password: string;
}

interface StoredSession {
  userId: string;
  expiresAt: number;
}

const USERS_KEY = "kurio:mock:users";
const SESSIONS_KEY = "kurio:mock:sessions";

const SESSION_DURATION = 24 * 60 * 60 * 1000;

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function getUsers(): StoredUser[] {
  return readStorage<StoredUser[]>(USERS_KEY, []);
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSessions(): Record<string, StoredSession> {
  return readStorage<Record<string, StoredSession>>(SESSIONS_KEY, {});
}

function saveSessions(sessions: Record<string, StoredSession>) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

function publicUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
  };
}

function createSession(user: StoredUser) {
  const accessToken = crypto.randomUUID();
  const expiresAt = Date.now() + SESSION_DURATION;

  const sessions = getSessions();

  sessions[accessToken] = {
    userId: user.id,
    expiresAt,
  };

  saveSessions(sessions);

  return {
    user: publicUser(user),
    accessToken,
    expiresAt,
  };
}

function getAuthenticatedUser(request: Request): StoredUser | null {
  const authorization = request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length);
  const sessions = getSessions();
  const session = sessions[token];

  if (!session) return null;

  if (Date.now() >= session.expiresAt) {
    delete sessions[token];
    saveSessions(sessions);
    return null;
  }

  return getUsers().find((user) => user.id === session.userId) ?? null;
}

export const authHandlers = [
  http.post("/api/auth/signup", async ({ request }) => {
    const body = (await request.json().catch(() => null)) as SignupInput | null;

    const name = body?.name?.trim();
    const username = body?.username?.trim();
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password;

    if (
      !name ||
      !username ||
      !email ||
      !password ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      password.length < 8
    ) {
      return HttpResponse.json(
        {
          message:
            "Preencha os campos corretamente. A senha deve ter pelo menos 8 caracteres.",
        },
        { status: 400 },
      );
    }

    const users = getUsers();

    if (users.some((user) => user.email === email)) {
      return HttpResponse.json(
        { message: "Este e-mail já está cadastrado." },
        { status: 409 },
      );
    }

    if (
      users.some(
        (user) => user.username.toLowerCase() === username.toLowerCase(),
      )
    ) {
      return HttpResponse.json(
        { message: "Este nome de usuário já está em uso." },
        { status: 409 },
      );
    }

    const user: StoredUser = {
      id: crypto.randomUUID(),
      name,
      username,
      email,
      password,
    };

    saveUsers([...users, user]);

    return HttpResponse.json(createSession(user), {
      status: 201,
    });
  }),

  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json().catch(() => null)) as LoginInput | null;

    const email = body?.email?.trim().toLowerCase();
    const password = body?.password;

    const user = getUsers().find(
      (item) => item.email === email && item.password === password,
    );

    if (!user) {
      return HttpResponse.json(
        { message: "E-mail ou senha inválidos." },
        { status: 401 },
      );
    }

    return HttpResponse.json(createSession(user));
  }),

  http.get("/api/auth/me", ({ request }) => {
    const user = getAuthenticatedUser(request);

    if (!user) {
      return HttpResponse.json(
        { message: "Sessão inválida ou expirada." },
        { status: 401 },
      );
    }

    return HttpResponse.json(publicUser(user));
  }),

  http.post("/api/auth/logout", ({ request }) => {
    const authorization = request.headers.get("Authorization");

    if (authorization?.startsWith("Bearer ")) {
      const token = authorization.slice("Bearer ".length);
      const sessions = getSessions();

      delete sessions[token];
      saveSessions(sessions);
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
