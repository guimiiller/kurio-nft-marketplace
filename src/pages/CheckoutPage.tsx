import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  Tag,
  Wallet,
} from "lucide-react";

import { useAuthSession } from "../features/auth/hooks/use-auth-session";
import { useCart } from "../features/cart/hooks/use-cart";
import {
  useCheckoutQuote,
  useCreateOrder,
} from "../features/checkout/hooks/use-checkout";
import type {
  CheckoutQuote,
  CreateOrderInput,
} from "../features/checkout/types/checkout.types";

function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message: unknown = error.response?.data?.message;
    if (typeof message === "string") return message;
  }
  return "Não foi possível concluir a operação. Tente novamente.";
}

type WalletType = CreateOrderInput["walletType"];

const walletOptions: {
  value: WalletType;
  label: string;
}[] = [
  { value: "metamask", label: "MetaMask" },
  { value: "walletconnect", label: "WalletConnect" },
  { value: "coinbase", label: "Coinbase Wallet" },
];

export function CheckoutPage() {
  const session = useAuthSession();
  const navigate = useNavigate();

  const { data: cart, isPending: cartPending, isError: cartError } = useCart();

  const { mutateAsync: requestQuote, isPending: quotePending } =
    useCheckoutQuote();

  const createOrder = useCreateOrder();

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [quoteResult, setQuoteResult] = useState<{ fingerprint: string; value: CheckoutQuote } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  const [collectorName, setCollectorName] = useState("");
  const [collectorEmail, setCollectorEmail] = useState("");
  const [walletType, setWalletType] = useState<WalletType>("metamask");
  const [walletAddress, setWalletAddress] = useState("");

  const idempotencyKey = useRef<string>(crypto.randomUUID());
  const quoteRequestSequence = useRef(0);

  const cartVersion = cart?.version;
  const cartHasItems = Boolean(cart?.items.length);
  const cartFingerprint = cart
    ? JSON.stringify({
        version: cart.version,
        items: cart.items.map((item) => ({
          nftId: item.nftId,
          quantity: item.quantity,
        })),
      })
    : null;

  const currentFingerprint = session && cartHasItems && cartFingerprint
    ? JSON.stringify({
        userId: session.userId,
        cart: cartFingerprint,
        coupon: appliedCoupon,
      })
    : null;

  const quote =
    quoteResult?.fingerprint === currentFingerprint
      ? quoteResult.value
      : null;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!currentFingerprint) return;

    const fingerprint = currentFingerprint;
    const sequence = ++quoteRequestSequence.current;
    let cancelled = false;

    void requestQuote({ couponCode: appliedCoupon })
      .then((result) => {
        if (cancelled || sequence !== quoteRequestSequence.current) return;
        setQuoteResult({ fingerprint, value: result });
        setQuoteError(null);
      })
      .catch((error: unknown) => {
        if (cancelled || sequence !== quoteRequestSequence.current) return;
        setQuoteError(errorMessage(error));
      });

    return () => {
      cancelled = true;
    };
  }, [currentFingerprint, appliedCoupon, requestQuote]);

  async function refreshQuote() {
    if (!session || !cartHasItems || !currentFingerprint) return;

    const sequence = ++quoteRequestSequence.current;
    setQuoteResult(null);
    setQuoteError(null);
    setOrderError(null);
    idempotencyKey.current = crypto.randomUUID();

    try {
      const result = await requestQuote({
        couponCode: appliedCoupon,
      });

      if (sequence === quoteRequestSequence.current) {
        setQuoteResult({ fingerprint: currentFingerprint, value: result });
      }
    } catch (error) {
      if (sequence === quoteRequestSequence.current) {
        setQuoteError(errorMessage(error));
      }
    }
  }

  function applyCoupon() {
    const normalized = couponInput.trim().toUpperCase() || null;

    if (normalized === appliedCoupon) {
      void refreshQuote();
      return;
    }

    setQuoteError(null);
    setOrderError(null);
    setAppliedCoupon(normalized);
  }

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOrderError(null);

    if (!session || !quote || createOrder.isPending) return;

    if (Date.now() >= quote.expiresAt) {
      setOrderError("A cotação expirou. Atualize os valores.");
      return;
    }

    if (quote.cartVersion !== cartVersion) {
      setOrderError("O carrinho mudou. Atualize a cotação.");
      return;
    }

    if (!collectorName.trim()) {
      setOrderError("Informe o nome do colecionador.");
      return;
    }

    if (!collectorEmail.trim()) {
      setOrderError("Informe o e-mail do colecionador.");
      return;
    }

    const normalizedAddress = walletAddress.trim();

    if (!/^0x[a-fA-F0-9]{40}$/.test(normalizedAddress)) {
      setOrderError(
        "Informe um endereço Ethereum válido: 0x seguido de 40 caracteres hexadecimais.",
      );
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        quoteId: quote.id,
        walletAddress: normalizedAddress,
        walletType,
        idempotencyKey: idempotencyKey.current,
      });

      await navigate({
        to: "/orders/$orderId",
        params: { orderId: order.id },
      });
    } catch (error) {
      setOrderError(errorMessage(error));
    }
  }

  if (!session) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center text-[#f0e8df]">
        <Wallet size={42} className="mx-auto text-[#d8924c]" />
        <h1 className="mt-5 text-2xl font-bold">
          Entre para finalizar a compra
        </h1>
        <p className="mt-3 text-[#b99b80]">
          O checkout está disponível para colecionadores autenticados.
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

  if (cartPending) {
    return (
      <main
        role="status"
        className="mx-auto max-w-7xl px-4 py-16 text-[#f0e8df]"
      >
        Carregando checkout...
      </main>
    );
  }

  if (cartError) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 text-[#f0e8df]">
        <p role="alert">Não foi possível carregar o carrinho.</p>
        <Link to="/cart" className="mt-4 inline-block text-[#d8924c]">
          Voltar ao carrinho
        </Link>
      </main>
    );
  }

  if (!cartHasItems) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-20 text-center text-[#f0e8df]">
        <Wallet size={42} className="mx-auto text-[#d8924c]" />
        <h1 className="mt-5 text-2xl font-bold">Seu carrinho está vazio</h1>
        <Link
          to="/cart"
          className="mt-6 inline-block rounded-lg bg-[#d8924c] px-6 py-3 font-bold text-[#150e0b]"
        >
          Voltar ao carrinho
        </Link>
      </main>
    );
  }

  const quoteExpired = quote ? now >= quote.expiresAt : false;

  return (
    <main className="min-h-screen bg-[#150e0b] px-4 pb-24 pt-8 text-[#f0e8df] md:px-6 md:py-12">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-8 flex items-center gap-2 text-sm text-[#b99b80]">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 hover:text-[#d8924c]"
          >
            <ArrowLeft size={16} />
            Carrinho
          </Link>
          <span>/</span>
          <span className="text-[#f0e8df]">Pagamento</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Finalizar compra</h1>
          <p className="mt-2 text-sm text-[#b99b80]">
            Revise os dados do colecionador e a carteira de destino.
          </p>
        </div>

        <form
          onSubmit={(event) => void submitOrder(event)}
          className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]"
        >
          <div className="space-y-6">
            <section className="rounded-2xl border border-[#493125] bg-[#241710] p-5 md:p-7">
              <h2 className="text-lg font-bold">Informações do colecionador</h2>
              <p className="mt-2 text-xs text-[#b99b80]">
                Estes dados são usados apenas nesta demonstração.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-2 block text-[#c9aa8c]">
                    Nome completo
                  </span>
                  <input
                    required
                    value={collectorName}
                    onChange={(event) => setCollectorName(event.target.value)}
                    placeholder="Seu nome"
                    className="w-full rounded-lg border border-[#493125] bg-[#150e0b] px-4 py-3 outline-none focus:border-[#d8924c]"
                  />
                </label>

                <label className="block text-sm">
                  <span className="mb-2 block text-[#c9aa8c]">E-mail</span>
                  <input
                    required
                    type="email"
                    value={collectorEmail}
                    onChange={(event) => setCollectorEmail(event.target.value)}
                    placeholder="seu@email.com"
                    className="w-full rounded-lg border border-[#493125] bg-[#150e0b] px-4 py-3 outline-none focus:border-[#d8924c]"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-[#493125] bg-[#241710] p-5 md:p-7">
              <div className="flex items-center gap-3">
                <Wallet size={22} className="text-[#d8924c]" />
                <h2 className="text-lg font-bold">Carteira de destino</h2>
              </div>

              <p className="mt-3 text-sm text-[#b99b80]">
                Selecione o tipo e informe o endereço que receberia os NFTs.
                Esta demonstração não conecta nem movimenta uma carteira real.
              </p>

              <div className="mt-6 space-y-3">
                {walletOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                      walletType === option.value
                        ? "border-[#d8924c] bg-[#352119]"
                        : "border-[#493125] bg-[#1c120e]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="walletType"
                      value={option.value}
                      checked={walletType === option.value}
                      onChange={() => setWalletType(option.value)}
                      className="accent-[#d8924c]"
                    />
                    <span className="font-semibold">{option.label}</span>
                    {walletType === option.value && (
                      <CheckCircle2
                        size={18}
                        className="ml-auto text-[#d8924c]"
                      />
                    )}
                  </label>
                ))}
              </div>

              <label className="mt-6 block text-sm">
                <span className="mb-2 block text-[#c9aa8c]">
                  Endereço Ethereum
                </span>
                <input
                  required
                  value={walletAddress}
                  onChange={(event) => setWalletAddress(event.target.value)}
                  placeholder="0x..."
                  spellCheck={false}
                  autoComplete="off"
                  className="w-full rounded-lg border border-[#493125] bg-[#150e0b] px-4 py-3 font-mono text-sm outline-none focus:border-[#d8924c]"
                />
              </label>

              <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-[#b99b80]">
                <ShieldCheck
                  size={17}
                  className="mt-0.5 shrink-0 text-[#d8924c]"
                />
                Não solicitamos seed phrase, chave privada ou assinatura. O
                pedido é processado exclusivamente no mock.
              </div>
            </section>
          </div>

          <aside className="rounded-2xl border border-[#493125] bg-[#241710] p-5 md:p-6">
            <div className="flex items-center gap-2">
              <CreditCard size={21} className="text-[#d8924c]" />
              <h2 className="text-xl font-bold">Resumo do pedido</h2>
            </div>

            <div className="mt-6 space-y-4">
              {cart?.items.map((item) => (
                <div key={item.nftId} className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {item.name}
                    </p>
                    <p className="text-xs text-[#b99b80]">
                      {item.quantity} edição(ões)
                    </p>
                  </div>
                  <span className="text-xs text-[#d8924c]">
                    {item.price} ETH
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-[#493125] pt-6">
              <label
                htmlFor="coupon"
                className="mb-2 flex items-center gap-2 text-sm font-semibold"
              >
                <Tag size={16} className="text-[#d8924c]" />
                Cupom de desconto
              </label>

              <div className="flex gap-2">
                <input
                  id="coupon"
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value)}
                  placeholder="Código do cupom"
                  className="min-w-0 flex-1 rounded-lg border border-[#493125] bg-[#150e0b] px-3 py-3 text-sm uppercase outline-none focus:border-[#d8924c]"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={quotePending || createOrder.isPending}
                  className="rounded-lg border border-[#d8924c] px-4 text-sm font-bold text-[#d8924c] disabled:opacity-50"
                >
                  Aplicar
                </button>
              </div>

              <p className="mt-2 text-xs text-[#b99b80]">
                Cupom de demonstração: KURIO10
              </p>
            </div>

            {quoteError && (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-red-700 bg-red-950/30 p-3 text-sm text-red-200"
              >
                {quoteError}
              </p>
            )}

            {quotePending && !quote && (
              <p role="status" className="mt-5 text-sm text-[#b99b80]">
                Calculando cotação...
              </p>
            )}

            {quote && (
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-[#b99b80]">Subtotal</span>
                  <span>{quote.subtotal} ETH</span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-[#b99b80]">Desconto</span>
                  <span className="text-green-300">-{quote.discount} ETH</span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-[#b99b80]">Taxa de rede</span>
                  <span>{quote.networkFee} ETH</span>
                </div>

                {quote.couponCode && (
                  <p className="text-xs text-green-300">
                    Cupom {quote.couponCode} aplicado.
                  </p>
                )}

                <div className="border-t border-[#493125] pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold">Total</span>
                    <strong className="text-xl text-[#d8924c]">
                      {quote.total} ETH
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {(quoteError || quoteExpired) && (
              <button
                type="button"
                onClick={() => void refreshQuote()}
                disabled={quotePending}
                className="mt-5 flex items-center gap-2 text-sm text-[#d8924c] disabled:opacity-50"
              >
                <RefreshCw size={15} />
                Atualizar cotação
              </button>
            )}

            {orderError && (
              <p
                role="alert"
                className="mt-5 rounded-lg border border-red-700 bg-red-950/30 p-3 text-sm text-red-200"
              >
                {orderError}
              </p>
            )}

            <button
              type="submit"
              disabled={
                !quote ||
                quoteExpired ||
                quotePending ||
                createOrder.isPending ||
                Boolean(quoteError)
              }
              className="mt-7 w-full rounded-lg bg-[#d8924c] px-5 py-4 font-bold text-[#150e0b] transition-colors hover:bg-[#e6a663] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createOrder.isPending
                ? "Confirmando pedido..."
                : "Confirmar pedido"}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-[#b99b80]">
              A confirmação só será exibida após a resposta da API. Nenhuma
              transação real será executada.
            </p>
          </aside>
        </form>
      </div>
    </main>
  );
}
