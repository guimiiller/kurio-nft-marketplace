import { http, HttpResponse } from "msw";

import { nfts } from "../fixtures/nfts";
import { getAuthenticatedUserId } from "../lib/auth";

import type {
  FavoriteStatusResponse,
  FavoritesResponse,
} from "../../features/favorites/types/favorite.types";

function storageKey(userId: string): string {
  return `kurio:favorites:user:${userId}`;
}

function nftExists(nftId: string): boolean {
  return nfts.some((nft) => nft.id === nftId);
}

function readFavorites(userId: string): string[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));

    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return Array.from(
      new Set(
        parsed.filter(
          (id): id is string => typeof id === "string" && nftExists(id),
        ),
      ),
    );
  } catch {
    return [];
  }
}

function saveFavorites(userId: string, nftIds: string[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(nftIds));
}

function unauthorized() {
  return HttpResponse.json(
    {
      message: "Entre na sua conta para gerenciar favoritos.",
    },
    { status: 401 },
  );
}

function notFound() {
  return HttpResponse.json(
    {
      message: "NFT não encontrado.",
    },
    { status: 404 },
  );
}

export const favoritesHandlers = [
  http.get("/api/favorites", ({ request }) => {
    const userId = getAuthenticatedUserId(request);

    if (!userId) return unauthorized();

    const response: FavoritesResponse = {
      nftIds: readFavorites(userId),
    };

    return HttpResponse.json(response);
  }),

  http.post("/api/favorites", async ({ request }) => {
    const userId = getAuthenticatedUserId(request);

    if (!userId) return unauthorized();

    const body = (await request.json().catch(() => null)) as {
      nftId?: unknown;
    } | null;

    if (typeof body?.nftId !== "string") {
      return HttpResponse.json(
        { message: "ID do NFT inválido." },
        { status: 400 },
      );
    }

    const nftId = body.nftId;

    if (!nftExists(nftId)) {
      return notFound();
    }

    const favorites = readFavorites(userId);

    if (!favorites.includes(nftId)) {
      favorites.push(nftId);
      saveFavorites(userId, favorites);
    }

    const response: FavoriteStatusResponse = {
      nftId,
      isFavorite: true,
    };

    return HttpResponse.json(response, {
      status: 200,
    });
  }),

  http.delete("/api/favorites/:nftId", ({ request, params }) => {
    const userId = getAuthenticatedUserId(request);

    if (!userId) return unauthorized();

    const nftId = String(params.nftId);

    if (!nftExists(nftId)) {
      return notFound();
    }

    const favorites = readFavorites(userId);

    saveFavorites(
      userId,
      favorites.filter((id) => id !== nftId),
    );

    const response: FavoriteStatusResponse = {
      nftId,
      isFavorite: false,
    };

    return HttpResponse.json(response);
  }),
];
