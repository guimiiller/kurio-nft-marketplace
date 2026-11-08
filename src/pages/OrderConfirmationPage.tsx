import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Copy,
  ShoppingBag,
  Wallet,
} from "lucide-react";

import { useAuthSession } from "../features/auth/hooks/use-auth-session";
import { useOrder } from "../features/checkout/hooks/use-checkout";
import { defaultNFTFilters } from "../features/nfts/types/nft-filters.types";

const walletLabels = {
  metamask: "MetaMask",
  walletconnect: "WalletConnect",
  coinbase: "Coinbase Wallet",
};

export function OrderConfirmationPage() {
  const { orderId } = useParams({
    from: "/orders/$orderId",
  });

  const session = useAuthSession();
  const { data: order, isPending, isError, refetch } = useOrder(orderId);

  if (!session) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center text-[#f0e8df]">
        <h1 className="text-2xl font-bold">Entre para consultar seu pedido</h1>
        <p className="mt-3 text-sm text-[#b99b80]">
          Os pedidos são privados e vinculados à conta utilizada na compra.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-block rounded-lg bg-[#d8924c] px-6 py-3 font-bold text-[#150e0b]"
        >
          Entrar
        </Link>
      </main>
    );
  }

  if (isPending) {
    return (
      <main
        role="status"
        className="mx-auto max-w-3xl px-4 py-20 text-center text-[#f0e8df]"
      >
        Consultando a confirmação do pedido...
      </main>
    );
  }

  if (isError || !order || order.status !== "confirmed") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center text-[#f0e8df]">
        <h1 className="text-2xl font-bold">
          Não foi possível confirmar este pedido
        </h1>
        <p className="mt-3 text-sm text-[#b99b80]">
          Verifique sua conta ou tente consultar novamente.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-lg bg-[#d8924c] px-5 py-3 font-bold text-[#150e0b]"
          >
            Tentar novamente
          </button>
          <Link
            to="/cart"
            className="rounded-lg border border-[#493125] px-5 py-3"
          >
            Voltar ao carrinho
          </Link>
        </div>
      </main>
    );
  }

  const createdAt = new Date(order.createdAt).toLocaleString("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <main className="min-h-screen bg-[#150e0b] px-4 pb-24 pt-10 text-[#f0e8df] md:px-6 md:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-[#493125] bg-[#241710] p-5 shadow-2xl md:p-10">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#352719]">
              <CheckCircle2 size={44} className="text-[#d8924c]" />
            </div>

            <h1 className="mt-6 text-2xl font-bold md:text-3xl">
              Pedido confirmado!
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#b99b80]">
              Seus colecionáveis foram registrados no pedido de demonstração da
              KURIO. Nenhuma transferência real de NFTs foi realizada.
            </p>
          </div>

          <div className="mt-9 grid gap-4 rounded-xl border border-[#493125] bg-[#1b110d] p-5 sm:grid-cols-2">
            <div className="min-w-0">
              <p className="text-xs text-[#b99b80]">ID do pedido</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="truncate font-mono text-xs text-[#f0e8df]">
                  {order.id}
                </span>
                <button
                  type="button"
                  onClick={() => void navigator.clipboard.writeText(order.id)}
                  aria-label="Copiar ID do pedido"
                  title="Copiar ID do pedido"
                  className="shrink-0 text-[#d8924c]"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-[#b99b80]">Data da compra</p>
              <p className="mt-2 flex items-center gap-2 text-sm">
                <Clock3 size={15} className="text-[#d8924c]" />
                {createdAt}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#b99b80]">Carteira selecionada</p>
              <p className="mt-2 flex items-center gap-2 text-sm">
                <Wallet size={15} className="text-[#d8924c]" />
                {walletLabels[order.walletType]}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#b99b80]">Valor total</p>
              <p className="mt-2 font-bold text-[#d8924c]">{order.total} ETH</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-[#493125] bg-[#1b110d] p-5">
            <p className="text-xs text-[#b99b80]">Endereço informado</p>
            <p className="mt-2 break-all font-mono text-xs leading-6">
              {order.walletAddress}
            </p>
          </div>

          <section className="mt-9">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-[#d8924c]" />
              <h2 className="text-lg font-bold">NFTs do pedido</h2>
            </div>

            <div className="mt-5 divide-y divide-[#493125]">
              {order.items.map((item) => (
                <div key={item.nftId} className="flex items-center gap-4 py-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{item.name}</p>
                    <p className="mt-1 text-xs text-[#b99b80]">
                      {item.quantity} edição(ões) · {item.network}
                    </p>
                  </div>

                  <strong className="text-sm text-[#d8924c]">
                    {item.total} ETH
                  </strong>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 space-y-3 border-t border-[#493125] pt-6 text-sm">
            <div className="flex justify-between">
              <span className="text-[#b99b80]">Subtotal</span>
              <span>{order.subtotal} ETH</span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#b99b80]">Desconto</span>
              <span className="text-green-300">-{order.discount} ETH</span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#b99b80]">Taxa de rede simulada</span>
              <span>{order.networkFee} ETH</span>
            </div>

            <div className="flex justify-between border-t border-[#493125] pt-5">
              <span className="font-bold">Total confirmado</span>
              <strong className="text-lg text-[#d8924c]">
                {order.total} ETH
              </strong>
            </div>
          </section>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/"
              search={defaultNFTFilters}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#d8924c] px-5 py-4 font-bold text-[#150e0b]"
            >
              <ArrowLeft size={17} />
              Voltar ao mercado
            </Link>

            <Link
              to="/cart"
              className="flex flex-1 items-center justify-center rounded-lg border border-[#493125] px-5 py-4 font-semibold"
            >
              Ver carrinho
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
