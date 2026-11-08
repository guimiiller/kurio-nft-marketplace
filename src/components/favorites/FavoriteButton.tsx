import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import axios from "axios";

import { useAuthSession } from "../../features/auth/hooks/use-auth-session";

import {
  useFavorites,
  useToggleFavorite,
} from "../../features/favorites/hooks/use-favorites";

interface FavoriteButtonProps {
  nftId: string;
  className?: string;
  showLabel?: boolean;
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message: unknown = error.response?.data?.message;

    if (typeof message === "string") {
      return message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Não foi possível atualizar o favorito.";
}

export function FavoriteButton({
  nftId,
  className = "",
  showLabel = false,
}: FavoriteButtonProps) {
  const navigate = useNavigate();
  const session = useAuthSession();

  const { data: favorites, isPending, isError, refetch } = useFavorites();

  const toggleFavorite = useToggleFavorite();

  const [error, setError] = useState<string | null>(null);

  const isFavorite = favorites?.nftIds.includes(nftId) ?? false;

  const isBusy = toggleFavorite.isPending || (Boolean(session) && isPending);

  async function handleClick() {
    setError(null);

    if (!session) {
      await navigate({ to: "/login" });
      return;
    }

    if (isError) {
      await refetch();
      return;
    }

    try {
      await toggleFavorite.mutateAsync({
        nftId,
        isFavorite,
      });
    } catch (caught) {
      setError(getErrorMessage(caught));
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={isBusy}
        aria-label={
          isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
        }
        aria-pressed={isFavorite}
        title={
          isError
            ? "Erro ao carregar favoritos. Clique para tentar novamente."
            : isFavorite
              ? "Remover dos favoritos"
              : "Adicionar aos favoritos"
        }
        className={`inline-flex items-center justify-center gap-2 rounded-lg border border-[#503629] bg-[#241710] px-3 py-3 text-[#d8924c] transition hover:border-[#d8924c] disabled:cursor-wait disabled:opacity-50 ${className}`}
      >
        <Heart size={19} fill={isFavorite ? "currentColor" : "none"} />

        {showLabel && (
          <span className="text-sm font-semibold">
            {isFavorite ? "Favoritado" : "Favoritar"}
          </span>
        )}
      </button>

      {error && (
        <span role="alert" className="max-w-52 text-xs text-red-300">
          {error}
        </span>
      )}

      {isError && !error && (
        <span role="alert" className="max-w-52 text-xs text-red-300">
          Falha ao carregar favoritos.
        </span>
      )}
    </div>
  );
}
