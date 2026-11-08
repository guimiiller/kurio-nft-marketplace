import { useState } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import axios from "axios";

import {
  ArrowLeft,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Star,
} from "lucide-react";

import { FavoriteButton } from "../components/favorites/FavoriteButton";
import { useNFT } from "../features/nfts/hooks/use-nft";
import { defaultNFTFilters } from "../features/nfts/types/nft-filters.types";
import type { NFT } from "../features/nfts/types/nft.types";

import { useAddCartItem, useCart } from "../features/cart/hooks/use-cart";
import { multiplyEth } from "../features/cart/utils/eth";
import { useAuthSession } from "../features/auth/hooks/use-auth-session";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message: unknown = error.response?.data?.message;

    if (typeof message === "string") {
      return message;
    }
  }

  return "Não foi possível adicionar o NFT. Tente novamente.";
}

export function NFTDetailPage() {
  const { nftId } = useParams({
    from: "/nft/$nftId",
  });

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
  const navigate = useNavigate();
  const session = useAuthSession();

  const [quantity, setQuantity] = useState(1);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const addItem = useAddCartItem();
  const { data: cart, isPending: isCartPending } = useCart();

  const available = Math.max(0, nft.available);
  const totalPrice = multiplyEth(nft.price, quantity);

  const quantityInCart =
    cart?.items.find((item) => item.nftId === nft.id)?.quantity ?? 0;

  const remaining = Math.max(0, available - quantityInCart);

  const isCartLoading = Boolean(session) && isCartPending;
  const isBusy = addItem.isPending || isCartLoading;

  const canAdd =
    !isBusy && available > 0 && quantity > 0 && quantity <= remaining;

  function decreaseQuantity() {
    setFeedback(null);
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    setFeedback(null);
    setQuantity((current) => Math.min(Math.max(1, remaining), current + 1));
  }

  async function handleAddToCart(goToCart: boolean) {
    if (isBusy || available === 0) {
      return;
    }

    setFeedback(null);

    if (!session) {
      await navigate({ to: "/login" });
      return;
    }

    if (quantity > remaining) {
      setFeedback({
        type: "error",
        message:
          remaining === 0
            ? "Todas as unidades disponíveis já estão no seu carrinho."
            : `Você pode adicionar mais ${remaining} unidade(s) deste NFT.`,
      });

      return;
    }

    try {
      await addItem.mutateAsync({
        nftId: nft.id,
        quantity,
      });

      if (goToCart) {
        await navigate({ to: "/cart" });
        return;
      }

      setFeedback({
        type: "success",
        message: `${quantity} unidade(s) adicionada(s) ao carrinho!`,
      });

      setQuantity(1);
    } catch (error) {
      setFeedback({
        type: "error",
        message: getErrorMessage(error),
      });
    }
  }

  const favoriteButton = (
    <FavoriteButton
      nftId={nft.id}
      className="h-9! w-9! rounded-full! border-0! bg-[#352119]! p-0! hover:bg-[#493125]! md:h-10! md:w-10!"
    />
  );

  const quantityControl = (
    <div className="flex items-center gap-2 md:gap-3">
      <span className="text-xs font-bold text-[#b99b80]">Qtd.</span>

      <button
        type="button"
        onClick={decreaseQuantity}
        disabled={isBusy || quantity <= 1 || remaining === 0}
        aria-label="Diminuir quantidade"
        className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d8924c] text-[#150e0b] disabled:opacity-40 md:h-7 md:w-7"
      >
        <Minus size={13} />
      </button>

      <output className="min-w-4 text-center text-sm font-bold">
        {available === 0 ? 0 : quantity}
      </output>

      <button
        type="button"
        onClick={increaseQuantity}
        disabled={isBusy || quantity >= remaining}
        aria-label="Aumentar quantidade"
        className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d8924c] text-[#150e0b] disabled:opacity-40 md:h-7 md:w-7"
      >
        <Plus size={13} />
      </button>
    </div>
  );

  const purchasePanel = (
    <div className="rounded-xl bg-[#2b1a15] p-3 md:rounded-2xl md:border md:border-[#493125] md:p-5">
      <div className="mb-3 flex items-center justify-between gap-2 md:mb-4">
        {quantityControl}

        <div className="text-right">
          <span className="block text-[10px] text-[#b99b80] md:text-xs">
            Total
          </span>

          <strong className="text-base text-[#d8924c] md:text-lg">
            {available === 0 ? "0" : totalPrice} ETH
          </strong>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2 md:gap-3">
        <button
          type="button"
          onClick={() => void handleAddToCart(true)}
          disabled={!canAdd}
          className="rounded-full bg-[#d8924c] px-4 py-2.5 text-xs font-bold text-[#150e0b] disabled:cursor-not-allowed disabled:opacity-60 md:px-5 md:py-3 md:text-sm"
        >
          {addItem.isPending ? "Processando..." : "Comprar NFT"}
        </button>

        <button
          type="button"
          onClick={() => void handleAddToCart(false)}
          disabled={!canAdd}
          aria-label="Adicionar ao carrinho"
          title="Adicionar ao carrinho"
          className="flex items-center justify-center rounded-full border border-[#493125] px-3 text-[#d8924c] disabled:cursor-not-allowed disabled:opacity-60 md:px-4"
        >
          <ShoppingCart size={18} />
        </button>
      </div>

      {feedback && (
        <p
          role={feedback.type === "error" ? "alert" : "status"}
          className={`mt-3 text-center text-xs ${
            feedback.type === "error" ? "text-red-300" : "text-green-300"
          }`}
        >
          {feedback.message}
        </p>
      )}

      {available === 0 && (
        <p className="mt-3 text-center text-xs text-[#d8924c]">
          NFT indisponível no momento.
        </p>
      )}

      {available > 0 && remaining === 0 && !isCartLoading && session && (
        <p className="mt-3 text-center text-xs text-[#d8924c]">
          Todas as unidades disponíveis já estão no carrinho.
          <Link to="/cart" className="ml-1 underline">
            Ver carrinho
          </Link>
        </p>
      )}

      {available > 0 && remaining > 0 && remaining < quantity && (
        <p className="mt-3 text-center text-xs text-[#d8924c]">
          Restam {remaining} unidade(s) para adicionar.
        </p>
      )}
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-3 md:px-6 md:pb-16 md:pt-8">
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

      <div className="overflow-hidden rounded-3xl bg-[#241710] md:overflow-visible md:rounded-none md:bg-transparent">
        <div className="grid gap-0 md:gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
          {/* Galeria */}
          <section
            aria-label={`Galeria de ${nft.name}`}
            className="min-w-0 p-3 pb-0 md:p-0"
          >
            <div className="relative mx-auto max-w-90 overflow-hidden rounded-[18px] bg-[#2b1a15] md:max-w-none md:rounded-[22px]">
              <img
                src={nft.image}
                alt={`Arte do NFT ${nft.name}`}
                className="aspect-1.25/1 w-full object-cover object-center md:aspect-square"
                fetchPriority="high"
              />

              <Link
                to="/"
                search={defaultNFTFilters}
                aria-label="Voltar ao mercado"
                className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#352119]/90 text-[#d8924c] md:hidden"
              >
                <ArrowLeft size={18} />
              </Link>

              <div className="absolute right-3 top-3">{favoriteButton}</div>
            </div>

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
          <section className="min-w-0 px-3 pb-4 pt-3 md:px-0 md:py-0">
            <div className="flex items-start justify-between gap-2">
              <h1 className="min-w-0 text-lg font-bold leading-tight text-[#f0e8df] md:text-4xl">
                {nft.name}
              </h1>

              <span className="flex shrink-0 items-center gap-1 rounded-full border border-[#80532f] px-2 py-1 text-[10px] text-[#d8924c] md:text-[11px]">
                <Star size={11} fill="currentColor" />
                Colecionável
              </span>
            </div>

            <p className="mt-2 text-[11px] leading-[1.6] text-[#c9aa8c] md:mt-5 md:text-sm md:leading-7">
              Um colecionável digital da coleção Kurio Editions, disponível na
              rede {nft.network}.
            </p>

            <div className="mt-3 space-y-1.5 text-[11px] text-[#b99b80] md:mt-6 md:space-y-3 md:text-sm">
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

            <div className="mt-4 md:mt-8">{purchasePanel}</div>

            <div className="mt-4 hidden items-center gap-2 text-xs text-[#b99b80] md:flex">
              <ShieldCheck size={18} className="text-[#d8924c]" />
              Plataforma de colecionáveis digitais Kurio.
            </div>
          </section>
        </div>
      </div>

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
