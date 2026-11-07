import { useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Star,
} from "lucide-react";

import { useNFT } from "../features/nfts/hooks/use-nft";
import { defaultNFTFilters } from "../features/nfts/types/nft-filters.types";
import type { NFT } from "../features/nfts/types/nft.types";

function multiplyETH(price: string, quantity: number): string {
  const [integer, fraction = ""] = price.split(".");
  const decimals = fraction.length;

  const units = BigInt(integer + fraction.padEnd(decimals, "0"));
  const result = units * BigInt(quantity);

  if (decimals === 0) return result.toString();

  const padded = result.toString().padStart(decimals + 1, "0");
  const whole = padded.slice(0, -decimals);
  const decimal = padded.slice(-decimals).replace(/0+$/, "");

  return decimal ? `${whole}.${decimal}` : whole;
}

export function NFTDetailPage() {
  const { nftId } = useParams({ from: "/nft/$nftId" });

  const { data: nft, isPending, isError, refetch } = useNFT(nftId);

  if (isPending) {
    return (
      <main
        role="status"
        aria-label="Carregando detalhes do NFT"
        className="mx-auto max-w-7xl px-4 py-8 md:px-6"
      >
        <div className="grid animate-pulse gap-8 lg:grid-cols-2">
          <div className="aspect-square rounded-3xl bg-[#2b1a15]" />
          <div className="space-y-5">
            <div className="h-9 w-3/4 rounded bg-[#2b1a15]" />
            <div className="h-6 w-1/3 rounded bg-[#2b1a15]" />
            <div className="h-24 rounded bg-[#2b1a15]" />
          </div>
        </div>
        <span className="sr-only">Carregando NFT...</span>
      </main>
    );
  }

  if (isError || !nft) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#f0e8df]">
          Não foi possível carregar este NFT.
        </h1>

        <p className="mt-3 text-[#b99b80]">
          O NFT pode não existir ou ocorreu um erro na consulta.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-lg bg-[#d8924c] px-5 py-3 font-bold text-[#150e0b]"
          >
            Tentar novamente
          </button>

          <Link
            to="/"
            search={defaultNFTFilters}
            className="rounded-lg border border-[#493125] px-5 py-3 text-[#f0e8df]"
          >
            Voltar ao catálogo
          </Link>
        </div>
      </main>
    );
  }

  return <NFTDetailContent key={nft.id} nft={nft} />;
}

function NFTDetailContent({ nft }: { nft: NFT }) {
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);

  const available = Math.max(0, nft.available);
  const totalPrice = multiplyETH(nft.price, quantity);

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    setQuantity((current) => Math.min(available, current + 1));
  }

  const favoriteButton = (
    <button
      type="button"
      onClick={() => setFavorite((current) => !current)}
      aria-label={
        favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
      }
      aria-pressed={favorite}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#352119] text-[#d8924c] transition-colors hover:bg-[#493125]"
    >
      <Heart size={19} fill={favorite ? "currentColor" : "none"} />
    </button>
  );

  const quantityControl = (
    <div className="flex items-center gap-3">
      <span className="text-xs font-bold text-[#b99b80]">Qtd.</span>

      <button
        type="button"
        onClick={decreaseQuantity}
        disabled={quantity <= 1 || available === 0}
        aria-label="Diminuir quantidade"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d8924c] text-[#150e0b] disabled:opacity-40"
      >
        <Minus size={14} />
      </button>

      <output className="min-w-4 text-center text-sm font-bold">
        {available === 0 ? 0 : quantity}
      </output>

      <button
        type="button"
        onClick={increaseQuantity}
        disabled={quantity >= available}
        aria-label="Aumentar quantidade"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d8924c] text-[#150e0b] disabled:opacity-40"
      >
        <Plus size={14} />
      </button>
    </div>
  );

  const purchasePanel = (
    <div className="rounded-2xl bg-[#2b1a15] p-4 md:border md:border-[#493125] md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        {quantityControl}

        <div className="text-right">
          <span className="block text-xs text-[#b99b80]">Total</span>
          <strong className="text-lg text-[#d8924c]">
            {available === 0 ? "0" : totalPrice} ETH
          </strong>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-3">
        <button
          type="button"
          disabled
          title="Disponível após a integração do carrinho"
          className="rounded-full bg-[#d8924c] px-5 py-3 text-sm font-bold text-[#150e0b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Comprar NFT
        </button>

        <button
          type="button"
          disabled
          aria-label="Adicionar ao carrinho"
          title="Disponível após a integração do carrinho"
          className="flex items-center justify-center rounded-full border border-[#493125] px-4 text-[#d8924c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ShoppingCart size={19} />
        </button>
      </div>

      {available === 0 && (
        <p className="mt-3 text-center text-xs text-[#d8924c]">
          NFT indisponível no momento.
        </p>
      )}
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-4 md:px-6 md:pb-16 md:pt-8">
      {/* Navegação desktop */}
      <nav aria-label="Caminho de navegação" className="mb-6 hidden md:block">
        <Link
          to="/"
          search={defaultNFTFilters}
          className="inline-flex items-center gap-2 text-sm text-[#c9aa8c] hover:text-[#d8924c]"
        >
          <ArrowLeft size={16} />
          Início / Mercado
        </Link>
      </nav>

      {/* Card principal */}
      <div className="overflow-hidden rounded-[28px] bg-[#241710] md:overflow-visible md:rounded-none md:bg-transparent">
        <div className="grid gap-0 md:gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
          {/* Galeria */}
          <section
            aria-label={`Galeria de ${nft.name}`}
            className="min-w-0 p-3 md:p-0"
          >
            <div className="relative overflow-hidden rounded-[22px] bg-[#2b1a15]">
              <img
                src={nft.image}
                alt={`Arte do NFT ${nft.name}`}
                className="aspect-square w-full object-cover"
                fetchPriority="high"
              />

              {/* Voltar mobile */}
              <Link
                to="/"
                search={defaultNFTFilters}
                aria-label="Voltar ao mercado"
                className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#352119]/90 text-[#d8924c] md:hidden"
              >
                <ArrowLeft size={19} />
              </Link>

              <div className="absolute right-3 top-3">{favoriteButton}</div>
            </div>

            {/* Miniaturas apenas desktop */}
            <div className="mt-4 hidden grid-cols-4 gap-3 md:grid">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-lg border border-[#493125] bg-[#2b1a15]"
                >
                  <img
                    src={nft.image}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Informações */}
          <section className="min-w-0 px-4 pb-4 pt-2 md:px-0 md:py-0">
            <div className="flex items-start justify-between gap-3">
              <h1 className="min-w-0 text-xl font-bold leading-tight text-[#f0e8df] md:text-4xl">
                {nft.name}
              </h1>

              <span className="flex shrink-0 items-center gap-1 rounded-full border border-[#80532f] px-2 py-1 text-[11px] text-[#d8924c]">
                <Star size={12} fill="currentColor" />
                Colecionável
              </span>
            </div>

            <p className="mt-3 text-xs leading-5 text-[#c9aa8c] md:mt-5 md:text-sm md:leading-7">
              Um colecionável digital da coleção Kurio Editions, disponível na
              rede {nft.network}.
            </p>

            <div className="mt-4 space-y-2 text-xs text-[#b99b80] md:mt-6 md:space-y-3 md:text-sm">
              <div>
                <span className="font-bold text-[#c9aa8c]">Edição:</span>
                <span className="ml-2 rounded-full border border-[#493125] px-2 py-1">
                  #{nft.id.padStart(4, "0")}
                </span>
                <span className="ml-2 text-[#d8924c]">
                  {available > 0 ? "DISPONÍVEL" : "ESGOTADO"}
                </span>
              </div>

              <p>ID do token: #{nft.id.padStart(4, "0")}</p>
              <p>Coleção: Kurio Editions</p>
              <p>Categoria: {nft.category}</p>
              <p>Blockchain: {nft.network}</p>
              <p>Unidades disponíveis: {available}</p>
            </div>

            <div className="mt-5 md:mt-8">{purchasePanel}</div>

            <div className="mt-4 hidden items-center gap-2 text-xs text-[#b99b80] md:flex">
              <ShieldCheck size={18} className="text-[#d8924c]" />
              Plataforma de colecionáveis digitais Kurio.
            </div>
          </section>
        </div>
      </div>

      {/* Detalhes adicionais desktop */}
      <section className="mt-12 hidden border-t border-[#493125] pt-8 md:block">
        <h2 className="text-xl font-bold text-[#f0e8df]">Detalhes do NFT</h2>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#c9aa8c]">
          {nft.name} faz parte da coleção Kurio Editions. O item pertence à
          categoria {nft.category} e está disponível na blockchain {nft.network}
          .
        </p>
      </section>
    </main>
  );
}
