import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  RefreshCw,
} from "lucide-react";
import axios from "axios";

import {
  useCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "../features/cart/hooks/use-cart";
import { ethToWei, multiplyEth, weiToEth } from "../features/cart/utils/eth";
import { useAuthSession } from "../features/auth/hooks/use-auth-session";
import { defaultNFTFilters } from "../features/nfts/types/nft-filters.types";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message: unknown = error.response?.data?.message;
    if (typeof message === "string") return message;
  }

  return "Não foi possível atualizar o carrinho. Tente novamente.";
}

export function CartPage() {
  const session = useAuthSession();
  const { data: cart, isPending, isError, refetch } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  const [actionError, setActionError] = useState<string | null>(null);

  const isMutating = updateItem.isPending || removeItem.isPending;

  const subtotalWei = (cart?.items ?? []).reduce(
    (total, item) => total + ethToWei(multiplyEth(item.price, item.quantity)),
    0n,
  );

  const subtotal = weiToEth(subtotalWei);

  async function changeQuantity(nftId: string, quantity: number) {
    setActionError(null);

    try {
      await updateItem.mutateAsync({
        nftId,
        input: { quantity },
      });
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  }

  async function remove(nftId: string) {
    setActionError(null);

    try {
      await removeItem.mutateAsync(nftId);
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  }

  return (
    <main className="min-h-screen bg-[#150e0b] px-4 py-8 text-[#f0e8df] sm:px-6 md:py-12">
      <div className="mx-auto max-w-7xl">
        <nav
          aria-label="Caminho de navegação"
          className="mb-8 hidden items-center gap-2 text-sm text-[#a99b91] md:flex"
        >
          <Link
            to="/"
            search={defaultNFTFilters}
            className="hover:text-[#d8924c]"
          >
            Início
          </Link>
          <span>/</span>
          <span>Mercado</span>
          <span>/</span>
          <span className="text-[#f0e8df]">Carrinho</span>
        </nav>

        <div className="mb-8 flex items-center gap-4">
          <Link
            to="/"
            search={defaultNFTFilters}
            aria-label="Voltar ao mercado"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#503629] hover:border-[#d8924c]"
          >
            <ArrowLeft size={19} />
          </Link>

          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Carrinho de NFTs</h1>
            <p className="mt-1 text-sm text-[#a99b91]">
              Revise sua seleção antes de finalizar.
            </p>
          </div>
        </div>

        {!session ? (
          <div className="flex flex-col items-center rounded-xl border border-[#39251b] bg-[#241710] px-6 py-16 text-center">
            <ShoppingBag size={44} className="mb-5 text-[#d8924c]" />
            <h2 className="text-xl font-bold">
              Entre para acessar seu carrinho
            </h2>
            <p className="mt-2 max-w-sm text-sm text-[#a99b91]">
              Seus NFTs ficam associados à sua conta.
            </p>
            <Link
              to="/login"
              className="mt-7 rounded-lg bg-[#d8924c] px-6 py-3 font-bold text-[#150e0b]"
            >
              Entrar
            </Link>
          </div>
        ) : isPending ? (
          <div
            role="status"
            className="rounded-xl border border-[#39251b] bg-[#241710] p-8 text-[#b9a79a]"
          >
            Carregando seu carrinho...
          </div>
        ) : isError || !cart ? (
          <div
            role="alert"
            className="rounded-xl border border-[#70402f] bg-[#241710] p-8"
          >
            <p>Não foi possível carregar o carrinho.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 flex items-center gap-2 rounded-lg bg-[#d8924c] px-4 py-2 font-semibold text-[#150e0b]"
            >
              <RefreshCw size={16} />
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            {actionError && (
              <div
                role="alert"
                className="mb-6 rounded-lg border border-red-700 bg-red-950/30 p-4 text-sm text-red-200"
              >
                {actionError}
              </div>
            )}

            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center rounded-xl border border-[#39251b] bg-[#241710] px-6 py-16 text-center">
                <ShoppingBag size={44} className="mb-5 text-[#d8924c]" />
                <h2 className="text-xl font-bold">Seu carrinho está vazio</h2>
                <p className="mt-2 max-w-sm text-sm text-[#a99b91]">
                  Explore o mercado e encontre NFTs para sua coleção.
                </p>
                <Link
                  to="/"
                  search={defaultNFTFilters}
                  className="mt-7 rounded-lg bg-[#d8924c] px-6 py-3 font-bold text-[#150e0b]"
                >
                  Explorar NFTs
                </Link>
              </div>
            ) : (
              <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
                <section
                  aria-label="Itens do carrinho"
                  className="overflow-hidden rounded-xl border border-[#39251b] bg-[#241710]"
                >
                  <div className="hidden grid-cols-[minmax(0,1fr)_100px_120px_90px] gap-4 border-b border-[#39251b] px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[#a99b91] md:grid">
                    <span>NFT</span>
                    <span>Preço</span>
                    <span>Edições</span>
                    <span>Total</span>
                  </div>

                  <div className="divide-y divide-[#39251b]">
                    {cart.items.map((item) => (
                      <article
                        key={item.nftId}
                        className="flex flex-col gap-4 p-4 sm:p-6 md:grid md:grid-cols-[minmax(0,1fr)_100px_120px_90px] md:items-center md:gap-4"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <Link
                            to="/nft/$nftId"
                            params={{ nftId: item.nftId }}
                            className="shrink-0"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-20 w-20 rounded-lg object-cover sm:h-24 sm:w-24"
                            />
                          </Link>

                          <div className="min-w-0">
                            <Link
                              to="/nft/$nftId"
                              params={{ nftId: item.nftId }}
                              className="block truncate font-semibold hover:text-[#d8924c]"
                            >
                              {item.name}
                            </Link>
                            <p className="mt-1 text-xs text-[#a99b91]">
                              {item.network}
                            </p>
                            <button
                              type="button"
                              disabled={isMutating}
                              onClick={() => void remove(item.nftId)}
                              className="mt-3 flex items-center gap-1 text-xs text-[#d8924c] hover:text-[#f1b67c] disabled:opacity-50"
                              aria-label={`Remover ${item.name}`}
                            >
                              <Trash2 size={14} />
                              Remover
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm md:block">
                          <span className="text-[#a99b91] md:hidden">
                            Preço unitário
                          </span>
                          <span>{item.price} ETH</span>
                        </div>

                        <div className="flex items-center justify-between md:block">
                          <span className="text-sm text-[#a99b91] md:hidden">
                            Quantidade
                          </span>
                          <div className="inline-flex items-center rounded-lg border border-[#503629]">
                            <button
                              type="button"
                              disabled={isMutating || item.quantity <= 1}
                              onClick={() =>
                                void changeQuantity(
                                  item.nftId,
                                  item.quantity - 1,
                                )
                              }
                              aria-label={`Diminuir quantidade de ${item.name}`}
                              className="flex h-9 w-9 items-center justify-center disabled:opacity-30"
                            >
                              <Minus size={15} />
                            </button>

                            <span className="min-w-8 text-center text-sm font-bold">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              disabled={
                                isMutating || item.quantity >= item.available
                              }
                              onClick={() =>
                                void changeQuantity(
                                  item.nftId,
                                  item.quantity + 1,
                                )
                              }
                              aria-label={`Aumentar quantidade de ${item.name}`}
                              className="flex h-9 w-9 items-center justify-center disabled:opacity-30"
                            >
                              <Plus size={15} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm font-bold text-[#d8924c] md:block">
                          <span className="text-[#a99b91] md:hidden">
                            Total
                          </span>
                          <span>
                            {multiplyEth(item.price, item.quantity)} ETH
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <aside className="rounded-xl border border-[#39251b] bg-[#241710] p-6">
                  <h2 className="text-xl font-bold">Resumo da carteira</h2>

                  <div className="mt-6 flex justify-between text-sm">
                    <span className="text-[#a99b91]">Itens</span>
                    <span>
                      {cart.items.reduce(
                        (total, item) => total + item.quantity,
                        0,
                      )}
                    </span>
                  </div>

                  <div className="mt-4 flex justify-between text-sm">
                    <span className="text-[#a99b91]">Subtotal</span>
                    <span>{subtotal} ETH</span>
                  </div>

                  <div className="mt-4 flex justify-between text-sm">
                    <span className="text-[#a99b91]">Desconto</span>
                    <span>A calcular no checkout</span>
                  </div>

                  <div className="mt-4 flex justify-between text-sm">
                    <span className="text-[#a99b91]">Taxa de rede</span>
                    <span>A calcular no checkout</span>
                  </div>

                  <div className="my-6 border-t border-[#503629]" />

                  <div className="flex items-center justify-between">
                    <span className="font-bold">Subtotal atual</span>
                    <span className="text-xl font-bold text-[#d8924c]">
                      {subtotal} ETH
                    </span>
                  </div>

                  <p className="mt-4 text-xs leading-5 text-[#a99b91]">
                    O valor final será calculado após a aplicação de descontos e
                    taxas.
                  </p>

                  <Link
                    to="/checkout"
                    className="mt-6 block w-full rounded-lg bg-[#d8924c] px-5 py-4 text-center font-bold text-[#150e0b] hover:bg-[#e6a663]"
                  >
                    Conectar e finalizar
                  </Link>

                  <Link
                    to="/"
                    search={defaultNFTFilters}
                    className="mt-5 block text-center text-sm text-[#d8924c] hover:underline"
                  >
                    Continuar comprando
                  </Link>
                </aside>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
