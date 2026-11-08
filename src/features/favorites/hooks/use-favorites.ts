import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthSession } from "../../auth/hooks/use-auth-session";

import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../api/favorites.api";

import type {
  FavoriteStatusResponse,
  FavoritesResponse,
} from "../types/favorite.types";

export const favoriteQueryKeys = {
  byUser: (userId: string) => ["favorites", userId] as const,
};

export function useFavorites() {
  const session = useAuthSession();

  return useQuery({
    queryKey: favoriteQueryKeys.byUser(session?.userId ?? "guest"),
    queryFn: getFavorites,
    enabled: Boolean(session),
    retry: false,
  });
}

export function useToggleFavorite() {
  const session = useAuthSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nftId,
      isFavorite,
    }: {
      nftId: string;
      isFavorite: boolean;
    }): Promise<FavoriteStatusResponse> => {
      if (!session) {
        throw new Error("Entre na sua conta para gerenciar favoritos.");
      }

      return isFavorite ? removeFavorite(nftId) : addFavorite(nftId);
    },

    onSuccess: (result) => {
      if (!session) return;

      const queryKey = favoriteQueryKeys.byUser(session.userId);

      queryClient.setQueryData<FavoritesResponse>(queryKey, (previous) => {
        const ids = new Set(previous?.nftIds ?? []);

        if (result.isFavorite) {
          ids.add(result.nftId);
        } else {
          ids.delete(result.nftId);
        }

        return {
          nftIds: Array.from(ids),
        };
      });
    },
  });
}
