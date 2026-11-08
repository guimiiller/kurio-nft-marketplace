import { http, HttpResponse } from "msw";

import { getAuthenticatedUserId } from "../lib/auth";

import type {
  CollectorProfile,
  UpdateCollectorProfileInput,
} from "../../features/profile/types/profile.types";

interface StoredMockUser {
  id: string;
  name: string;
  username: string;
  email: string;
}

function profileKey(userId: string): string {
  return `kurio:profile:user:${userId}`;
}

function getRegisteredUser(userId: string): StoredMockUser | null {
  try {
    const raw = localStorage.getItem("kurio:mock:users");

    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return null;

    const user = parsed.find(
      (entry) =>
        typeof entry === "object" && entry !== null && entry.id === userId,
    );

    return user ?? null;
  } catch {
    return null;
  }
}

function readProfile(userId: string): CollectorProfile {
  const user = getRegisteredUser(userId);

  const fallback: CollectorProfile = {
    userId,
    name: user?.name ?? "",
    username: user?.username ?? "",
    email: user?.email ?? "",
    ens: "",
    walletNickname: "",
  };

  try {
    const raw = localStorage.getItem(profileKey(userId));

    if (!raw) return fallback;

    const stored = JSON.parse(raw) as Partial<CollectorProfile>;

    return {
      userId,
      name: typeof stored.name === "string" ? stored.name : fallback.name,
      username:
        typeof stored.username === "string"
          ? stored.username
          : fallback.username,
      email: typeof stored.email === "string" ? stored.email : fallback.email,
      ens: typeof stored.ens === "string" ? stored.ens : "",
      walletNickname:
        typeof stored.walletNickname === "string" ? stored.walletNickname : "",
    };
  } catch {
    return fallback;
  }
}

function unauthorized() {
  return HttpResponse.json(
    { message: "Faça login para acessar seu perfil." },
    { status: 401 },
  );
}

function validationError(message: string) {
  return HttpResponse.json({ message }, { status: 422 });
}

export const profileHandlers = [
  http.get("/api/profile", ({ request }) => {
    const userId = getAuthenticatedUserId(request);

    if (!userId) return unauthorized();

    return HttpResponse.json(readProfile(userId));
  }),

  http.patch("/api/profile", async ({ request }) => {
    const userId = getAuthenticatedUserId(request);

    if (!userId) return unauthorized();

    const body = (await request
      .json()
      .catch(() => null)) as Partial<UpdateCollectorProfileInput> | null;

    if (
      !body ||
      typeof body.name !== "string" ||
      typeof body.username !== "string" ||
      typeof body.email !== "string" ||
      typeof body.ens !== "string" ||
      typeof body.walletNickname !== "string"
    ) {
      return validationError("Preencha os campos do perfil corretamente.");
    }

    const name = body.name.trim();
    const username = body.username.trim();
    const email = body.email.trim().toLowerCase();
    const ens = body.ens.trim().toLowerCase();
    const walletNickname = body.walletNickname.trim();

    if (name.length < 2 || name.length > 100) {
      return validationError("O nome deve ter entre 2 e 100 caracteres.");
    }

    if (!/^[a-zA-Z0-9_.]{3,30}$/.test(username)) {
      return validationError(
        "O username deve ter entre 3 e 30 caracteres, usando letras, números, ponto ou underline.",
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return validationError("E-mail inválido.");
    }

    if (ens && !/^[a-z0-9][a-z0-9-]*\.eth$/.test(ens)) {
      return validationError("Informe um ENS válido, como colecionador.eth.");
    }

    if (walletNickname.length > 50) {
      return validationError(
        "O apelido da carteira pode ter até 50 caracteres.",
      );
    }

    // Impede que outra conta escolha um username ou
    // e-mail já utilizado por um usuário diferente.
    const rawUsers = localStorage.getItem("kurio:mock:users");

    let users: StoredMockUser[] = [];

    try {
      const parsed: unknown = rawUsers ? JSON.parse(rawUsers) : [];

      if (Array.isArray(parsed)) {
        users = parsed as StoredMockUser[];
      }
    } catch {
      users = [];
    }

    const conflict = users.some(
      (user) =>
        user.id !== userId &&
        (user.username.toLowerCase() === username.toLowerCase() ||
          user.email.toLowerCase() === email),
    );

    if (conflict) {
      return HttpResponse.json(
        {
          message: "Este username ou e-mail já está sendo utilizado.",
        },
        { status: 409 },
      );
    }

    const profile: CollectorProfile = {
      userId,
      name,
      username,
      email,
      ens,
      walletNickname,
    };

    localStorage.setItem(profileKey(userId), JSON.stringify(profile));

    // Mantém os dados básicos sincronizados com /auth/me
    // e com o login mockado.
    const nextUsers = users.map((user) =>
      user.id === userId ? { ...user, name, username, email } : user,
    );

    if (nextUsers.length > 0) {
      localStorage.setItem("kurio:mock:users", JSON.stringify(nextUsers));
    }

    return HttpResponse.json(profile);
  }),
];
