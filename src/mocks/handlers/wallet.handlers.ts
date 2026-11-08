import { http, HttpResponse } from "msw";

import { getAuthenticatedUserId } from "../lib/auth";

import type {
  CollectorWallet,
  WalletProvider,
} from "../../features/wallets/types/wallet.types";

function storageKey(userId: string): string {
  return `kurio:wallets:user:${userId}`;
}

function readWallets(userId: string): CollectorWallet[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));

    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is CollectorWallet =>
        typeof item === "object" &&
        item !== null &&
        item.userId === userId &&
        typeof item.id === "string" &&
        typeof item.address === "string" &&
        typeof item.nickname === "string" &&
        typeof item.provider === "string" &&
        typeof item.isPrimary === "boolean" &&
        typeof item.createdAt === "string",
    );
  } catch {
    return [];
  }
}

function saveWallets(userId: string, wallets: CollectorWallet[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(wallets));
}

function unauthorized() {
  return HttpResponse.json(
    { message: "Faça login para gerenciar carteiras." },
    { status: 401 },
  );
}

function error(message: string, status: 400 | 404 | 409 | 422) {
  return HttpResponse.json({ message }, { status });
}

function isWalletProvider(value: unknown): value is WalletProvider {
  return (
    value === "metamask" ||
    value === "walletconnect" ||
    value === "coinbase" ||
    value === "other"
  );
}

function validAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export const walletHandlers = [
  http.get("/api/wallets", ({ request }) => {
    const userId = getAuthenticatedUserId(request);

    if (!userId) return unauthorized();

    return HttpResponse.json(readWallets(userId));
  }),

  http.post("/api/wallets", async ({ request }) => {
    const userId = getAuthenticatedUserId(request);

    if (!userId) return unauthorized();

    const body = (await request.json().catch(() => null)) as {
      address?: unknown;
      nickname?: unknown;
      provider?: unknown;
    } | null;

    if (
      typeof body?.address !== "string" ||
      typeof body.nickname !== "string" ||
      !isWalletProvider(body.provider)
    ) {
      return error("Dados da carteira inválidos.", 400);
    }

    const address = body.address.trim();
    const nickname = body.nickname.trim();

    if (!validAddress(address)) {
      return error("Informe um endereço Ethereum válido.", 422);
    }

    if (nickname.length < 2 || nickname.length > 50) {
      return error("O apelido deve ter entre 2 e 50 caracteres.", 422);
    }

    const wallets = readWallets(userId);

    if (
      wallets.some(
        (wallet) => wallet.address.toLowerCase() === address.toLowerCase(),
      )
    ) {
      return error("Esta carteira já está cadastrada.", 409);
    }

    const wallet: CollectorWallet = {
      id: crypto.randomUUID(),
      userId,
      address,
      nickname,
      provider: body.provider,
      isPrimary: wallets.length === 0,
      createdAt: new Date().toISOString(),
    };

    wallets.push(wallet);
    saveWallets(userId, wallets);

    return HttpResponse.json(wallet, {
      status: 201,
    });
  }),

  http.patch("/api/wallets/:walletId", async ({ request, params }) => {
    const userId = getAuthenticatedUserId(request);

    if (!userId) return unauthorized();

    const wallets = readWallets(userId);

    const wallet = wallets.find((item) => item.id === String(params.walletId));

    if (!wallet) {
      return error("Carteira não encontrada.", 404);
    }

    const body = (await request.json().catch(() => null)) as {
      nickname?: unknown;
      provider?: unknown;
    } | null;

    if (
      typeof body?.nickname !== "string" ||
      !isWalletProvider(body.provider)
    ) {
      return error("Dados da carteira inválidos.", 400);
    }

    const nickname = body.nickname.trim();

    if (nickname.length < 2 || nickname.length > 50) {
      return error("O apelido deve ter entre 2 e 50 caracteres.", 422);
    }

    wallet.nickname = nickname;
    wallet.provider = body.provider;

    saveWallets(userId, wallets);

    return HttpResponse.json(wallet);
  }),

  http.patch("/api/wallets/:walletId/primary", ({ request, params }) => {
    const userId = getAuthenticatedUserId(request);

    if (!userId) return unauthorized();

    const wallets = readWallets(userId);

    const wallet = wallets.find((item) => item.id === String(params.walletId));

    if (!wallet) {
      return error("Carteira não encontrada.", 404);
    }

    for (const item of wallets) {
      item.isPrimary = item.id === wallet.id;
    }

    saveWallets(userId, wallets);

    return HttpResponse.json(wallet);
  }),

  http.delete("/api/wallets/:walletId", ({ request, params }) => {
    const userId = getAuthenticatedUserId(request);

    if (!userId) return unauthorized();

    const wallets = readWallets(userId);
    const walletId = String(params.walletId);

    const removed = wallets.find((item) => item.id === walletId);

    if (!removed) {
      return error("Carteira não encontrada.", 404);
    }

    const remaining = wallets.filter((item) => item.id !== walletId);

    if (removed.isPrimary && remaining.length > 0) {
      remaining[0].isPrimary = true;
    }

    saveWallets(userId, remaining);

    return new HttpResponse(null, {
      status: 204,
    });
  }),
];
