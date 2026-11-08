import { Link } from "@tanstack/react-router";
import { ArrowLeft, Heart, RefreshCw } from "lucide-react";

import { FavoriteButton } from "../components/favorites/FavoriteButton";
import { useAuthSession } from "../features/auth/hooks/use-auth-session";
import { useFavorites } from "../features/favorites/hooks/use-favorites";
import { useNFT } from "../features/nfts/hooks/use-nft";
import { defaultNFTFilters } from "../features/nfts/types/nft-filters.types";

export function FavoritesPage() {
  const session = useAuthSession();

  const { data: favorites, isPending, isError, refetch } = useFavorites();

  if (!session) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center text-[#f0e8df]">
        <Heart size={42} className="mx-auto text-[#d8924c]" />

        <h1 className="mt-5 text-2xl font-bold">
          Entre para ver seus favoritos
        </h1>

        <Link
          to="/login"
          className="mt-6 inline-block rounded-lg bg-[#d8924c] px-6 py-3 font-bold text-[#150e0b]"
        >
          Entrar
        </Link>
      </main>
    );
  }

  const favoriteIds = favorites?.nftIds ?? [];

  return (
    <main className="min-h-screen bg-[#150e0b] px-4 py-10 text-[#f0e8df] sm:px-6">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/"
          search={defaultNFTFilters}
          className="inline-flex items-center gap-2 text-sm text-[#b99b80] hover:text-[#d8924c]"
        >
          <ArrowLeft size={16} />
          Voltar ao mercado
        </Link>

        <div className="mt-8 flex items-center gap-3">
          <Heart size={29} className="text-[#d8924c]" />

          <div>
            <h1 className="text-3xl font-bold">Meus favoritos</h1>

            <p className="mt-2 text-sm text-[#b99b80]">
              Seus NFTs salvos para acompanhar depois.
            </p>
          </div>
        </div>

        {isPending ? (
          <div
            role="status"
            className="mt-8 rounded-xl border border-[#493125] bg-[#241710] p-8 text-[#b99b80]"
          >
            Carregando favoritos...
          </div>
        ) : isError ? (
          <div className="mt-8 rounded-xl border border-[#493125] bg-[#241710] p-8">
            <p role="alert">Não foi possível carregar seus favoritos.</p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 inline-flex items-center gap-2 text-[#d8924c]"
            >
              <RefreshCw size={16} />
              Tentar novamente
            </button>
          </div>
        ) : favoriteIds.length === 0 ? (
          <div className="mt-8 rounded-xl border border-[#493125] bg-[#241710] px-6 py-16 text-center">
            <Heart size={42} className="mx-auto text-[#d8924c]" />

            <h2 className="mt-5 text-xl font-bold">
              Você ainda não tem favoritos
            </h2>

            <p className="mt-2 text-sm text-[#b99b80]">
              Explore o mercado e salve os NFTs que mais gostar.
            </p>

            <Link
              to="/"
              search={defaultNFTFilters}
              className="mt-6 inline-block rounded-lg bg-[#d8924c] px-6 py-3 font-bold text-[#150e0b]"
            >
              Explorar NFTs
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-6 text-sm text-[#b99b80]">
              {favoriteIds.length} NFT(s) salvo(s)
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {favoriteIds.map((nftId) => (
                <FavoriteNFTCard key={nftId} nftId={nftId} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function FavoriteNFTCard({ nftId }: { nftId: string }) {
  const { data: nft, isPending, isError, refetch } = useNFT(nftId);

  if (isPending) {
    return (
      <article
        role="status"
        aria-label="Carregando NFT favorito"
        className="animate-pulse overflow-hidden rounded-xl border border-[#493125] bg-[#241710]"
      >
        <div className="aspect-square bg-[#352119]" />

        <div className="space-y-3 p-4">
          <div className="h-5 w-3/4 rounded bg-[#352119]" />
          <div className="h-4 w-1/2 rounded bg-[#352119]" />
        </div>
      </article>
    );
  }

  if (isError || !nft) {
    return (
      <article className="rounded-xl border border-[#493125] bg-[#241710] p-5">
        <p className="text-sm text-red-300">
          Não foi possível carregar este NFT.
        </p>

        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 inline-flex items-center gap-2 text-sm text-[#d8924c]"
        >
          <RefreshCw size={15} />
          Tentar novamente
        </button>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-xl border border-[#493125] bg-[#241710]">
      <Link
        to="/nft/$nftId"
        params={{ nftId: nft.id }}
        className="block overflow-hidden"
      >
        <img
          src={nft.image}
          alt={`Arte do NFT ${nft.name}`}
          loading="lazy"
          className="aspect-square w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </Link>

      <div className="p-4">
        <Link
          to="/nft/$nftId"
          params={{ nftId: nft.id }}
          className="font-bold text-[#f0e8df] hover:text-[#d8924c]"
        >
          {nft.name}
        </Link>

        <p className="mt-2 text-xs text-[#b99b80]">
          {nft.network} · {nft.category}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="font-bold text-[#d8924c]">{nft.price} ETH</span>

          <FavoriteButton nftId={nft.id} />
        </div>
      </div>
    </article>
  );
}
