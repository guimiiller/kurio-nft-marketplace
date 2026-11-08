import { api } from "../../../lib/api/client";

import type {
  FavoriteStatusResponse,
  FavoritesResponse,
} from "../types/favorite.types";

export async function getFavorites(): Promise<FavoritesResponse> {
  const { data } = await api.get<FavoritesResponse>("/favorites");

  return data;
}

export async function addFavorite(
  nftId: string,
): Promise<FavoriteStatusResponse> {
  const { data } = await api.post<FavoriteStatusResponse>("/favorites", {
    nftId,
  });

  return data;
}

export async function removeFavorite(
  nftId: string,
): Promise<FavoriteStatusResponse> {
  const { data } = await api.delete<FavoriteStatusResponse>(
    `/favorites/${encodeURIComponent(nftId)}`,
  );

  return data;
}
