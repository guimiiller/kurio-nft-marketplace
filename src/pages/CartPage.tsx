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

    if (typeof message === "string") {
      return message;
    }
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

  const totalItems =
    cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

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
    <main className="min-h-screen bg-[#150e0b] px-4 pb-28 pt-4 text-[#f0e8df] sm:px-6 md:py-12">
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

        <div className="relative mb-5 flex items-center justify-center md:mb-8 md:justify-start md:gap-4">
          <Link
            to="/"
            search={defaultNFTFilters}
            aria-label="Voltar ao mercado"
            className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full bg-[#352119] text-[#d8924c] md:static md:h-10 md:w-10 md:rounded-lg md:border md:border-[#503629]"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="text-center md:text-left">
            <h1 className="text-base font-bold md:text-3xl">
              Carrinho de NFTs
            </h1>

            <p className="mt-1 hidden text-sm text-[#a99b91] md:block">
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
                className="mb-5 rounded-lg border border-red-700 bg-red-950/30 p-4 text-sm text-red-200"
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
              <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
                <section
                  aria-label="Itens do carrinho"
                  className="space-y-2 md:overflow-hidden md:rounded-xl md:border md:border-[#39251b] md:bg-[#241710] md:space-y-0"
                >
                  <div className="hidden grid-cols-[minmax(0,1fr)_100px_120px_90px] gap-4 border-b border-[#39251b] px-6 py-5 text-xs font-semibold uppercase tracking-wider text-[#a99b91] md:grid">
                    <span>NFT</span>
                    <span>Preço</span>
                    <span>Edições</span>
                    <span>Total</span>
                  </div>

                  <div className="space-y-2 md:divide-y md:divide-[#39251b] md:space-y-0">
                    {cart.items.map((item) => (
                      <article
                        key={item.nftId}
                        className="relative grid grid-cols-[76px_minmax(0,1fr)] gap-3 rounded-xl bg-[#241710] p-2.5 sm:grid-cols-[90px_minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_100px_120px_90px] md:items-center md:gap-4 md:rounded-none md:bg-transparent md:p-6"
                      >
                        <div className="contents md:flex md:min-w-0 md:items-center md:gap-4">
                          <Link
                            to="/nft/$nftId"
                            params={{ nftId: item.nftId }}
                            className="row-span-2 self-start md:row-span-1 md:shrink-0"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-19 w-19 rounded-lg object-cover sm:h-22.5 sm:w-22.5 md:h-20 md:w-20"
                            />
                          </Link>

                          <div className="min-w-0">
                            <Link
                              to="/nft/$nftId"
                              params={{ nftId: item.nftId }}
                              className="block truncate text-xs font-bold hover:text-[#d8924c] sm:text-sm md:text-base"
                            >
                              {item.name}
                            </Link>

                            <p className="mt-1 text-[10px] text-[#a99b91] md:text-xs">
                              Unidades disponíveis: {item.available}
                            </p>

                            <p className="mt-1 hidden text-xs text-[#a99b91] md:block">
                              {item.network}
                            </p>

                            <button
                              type="button"
                              disabled={isMutating}
                              onClick={() => void remove(item.nftId)}
                              className="mt-2 hidden items-center gap-1 text-xs text-[#d8924c] hover:text-[#f1b67c] disabled:opacity-50 md:flex"
                              aria-label={`Remover ${item.name}`}
                            >
                              <Trash2 size={14} />
                              Remover
                            </button>
                          </div>
                        </div>

                        <div className="col-start-2 row-start-2 flex items-center text-sm font-bold text-[#d8924c] md:col-auto md:row-auto md:block md:font-normal md:text-[#f0e8df]">
                          <span>{item.price} ETH</span>
                        </div>

                        <div className="col-span-2 flex items-center justify-end gap-2 md:col-auto md:block">
                          <span className="mr-auto text-[10px] text-[#a99b91] md:hidden">
                            Quantidade
                          </span>

                          <div className="inline-flex items-center gap-1 md:gap-0 md:rounded-lg md:border md:border-[#503629]">
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
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-[#352119] text-[#d8924c] disabled:opacity-30 md:h-9 md:w-9 md:rounded-none md:bg-transparent md:text-[#f0e8df]"
                            >
                              <Minus size={13} />
                            </button>

                            <span className="min-w-5 text-center text-xs font-bold md:min-w-8 md:text-sm">
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
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-[#352119] text-[#d8924c] disabled:opacity-30 md:h-9 md:w-9 md:rounded-none md:bg-transparent md:text-[#f0e8df]"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <button
                            type="button"
                            disabled={isMutating}
                            onClick={() => void remove(item.nftId)}
                            aria-label={`Remover ${item.name}`}
                            className="ml-2 flex h-7 w-7 items-center justify-center text-[#d8924c] disabled:opacity-50 md:hidden"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div className="hidden text-sm font-bold text-[#d8924c] md:block">
                          {multiplyEth(item.price, item.quantity)} ETH
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <aside className="rounded-xl bg-[#241710] p-4 md:border md:border-[#39251b] md:p-6">
                  <h2 className="sr-only md:not-sr-only md:mb-4 md:text-xl md:font-bold">
                    Resumo da carteira
                  </h2>

                  <div className="mb-4 flex items-center gap-2 rounded-full bg-[#352119] p-1">
                    <div className="min-w-0 flex-1 px-3 text-xs text-[#b99b80]">
                      Cupom disponível: KURIO10
                    </div>

                    <Link
                      to="/checkout"
                      className="shrink-0 rounded-full bg-[#a96d3c] px-4 py-2 text-xs font-bold text-[#f0e8df]"
                    >
                      Aplicar
                    </Link>
                  </div>

                  <div className="space-y-3 text-xs md:text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-[#a99b91]">Itens</span>
                      <span>{totalItems}</span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-[#a99b91]">Subtotal</span>
                      <span>{subtotal} ETH</span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-[#a99b91]">Desconto</span>
                      <span className="text-right text-[#a99b91]">
                        A calcular no checkout
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-[#a99b91]">Taxa de rede</span>
                      <span className="text-right text-[#a99b91]">
                        A calcular no checkout
                      </span>
                    </div>
                  </div>

                  <div className="my-4 border-t border-[#503629] md:my-6" />

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold md:text-base">
                      Subtotal atual
                    </span>

                    <span className="text-base font-bold text-[#d8924c] md:text-xl">
                      {subtotal} ETH
                    </span>
                  </div>

                  <p className="mt-3 text-[11px] leading-5 text-[#a99b91] md:mt-4 md:text-xs">
                    O valor final será calculado após a aplicação de descontos e
                    taxas.
                  </p>

                  <Link
                    to="/checkout"
                    className="mt-5 block w-full rounded-full bg-[#d8924c] px-5 py-3.5 text-center text-sm font-bold text-[#150e0b] hover:bg-[#e6a663] md:mt-6 md:rounded-lg md:py-4"
                  >
                    Conectar e finalizar
                  </Link>

                  <Link
                    to="/"
                    search={defaultNFTFilters}
                    className="mt-4 block text-center text-xs text-[#d8924c] hover:underline md:mt-5 md:text-sm"
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
