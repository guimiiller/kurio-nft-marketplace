import { http, HttpResponse } from "msw";
import { nfts } from "../fixtures/nfts";
import { getAuthenticatedUserId } from "../lib/auth";

import { ethToWei, weiToEth } from "../../features/cart/utils/eth";

import type { Cart, CartItem } from "../../features/cart/types/cart.types";

import type {
  CheckoutQuote,
  CheckoutQuoteItem,
  Order,
} from "../../features/checkout/types/checkout.types";

const QUOTE_TTL_MS = 5 * 60 * 1000;
const NETWORK_FEE_WEI = ethToWei("0.001");
const DISCOUNT_PERCENT = 10;

interface StoredQuote {
  userId: string;
  quote: CheckoutQuote;
}

interface StoredIdempotency {
  userId: string;
  fingerprint: string;
  orderId: string;
}

interface CheckoutStore {
  quotes: StoredQuote[];
  orders: Order[];
  idempotency: Record<string, StoredIdempotency>;
  sold: Record<string, number>;
}

const STORE_KEY = "kurio:mock:checkout";

function emptyStore(): CheckoutStore {
  return {
    quotes: [],
    orders: [],
    idempotency: {},
    sold: {},
  };
}

function readStore(): CheckoutStore {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return emptyStore();

    const parsed = JSON.parse(raw) as Partial<CheckoutStore>;

    return {
      quotes: Array.isArray(parsed.quotes) ? parsed.quotes : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      idempotency:
        parsed.idempotency && typeof parsed.idempotency === "object"
          ? parsed.idempotency
          : {},
      sold: parsed.sold && typeof parsed.sold === "object" ? parsed.sold : {},
    };
  } catch {
    return emptyStore();
  }
}

function saveStore(store: CheckoutStore): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

function cartKey(userId: string): string {
  return `kurio:cart:user:${userId}`;
}

function readCart(userId: string): Cart {
  try {
    const raw = localStorage.getItem(cartKey(userId));

    if (!raw) {
      return {
        items: [],
        couponCode: null,
        version: 1,
      };
    }

    const parsed = JSON.parse(raw) as Cart;

    if (
      !Array.isArray(parsed.items) ||
      !Number.isSafeInteger(parsed.version) ||
      parsed.version < 1
    ) {
      throw new Error("Carrinho inválido");
    }

    const items: CartItem[] = parsed.items.filter(
      (item) =>
        typeof item?.nftId === "string" &&
        Number.isSafeInteger(item.quantity) &&
        item.quantity > 0 &&
        nfts.some((nft) => nft.id === item.nftId),
    );

    return {
      items,
      couponCode: parsed.couponCode ?? null,
      version: parsed.version,
    };
  } catch {
    return {
      items: [],
      couponCode: null,
      version: 1,
    };
  }
}

function availableStock(nftId: string, store: CheckoutStore): number {
  const nft = nfts.find((item) => item.id === nftId);

  if (!nft) return 0;

  return Math.max(0, nft.available - (store.sold[nftId] ?? 0));
}

function unauthorized() {
  return HttpResponse.json(
    { message: "Faça login para continuar." },
    { status: 401 },
  );
}

function errorResponse(message: string, status: 400 | 404 | 409 | 410 | 422) {
  return HttpResponse.json({ message }, { status });
}

function buildQuote(
  userId: string,
  couponCode: string | null,
  store: CheckoutStore,
): CheckoutQuote | ReturnType<typeof HttpResponse.json> {
  const cart = readCart(userId);

  if (cart.items.length === 0) {
    return errorResponse("Seu carrinho está vazio.", 422);
  }

  const items: CheckoutQuoteItem[] = [];
  let subtotalWei = 0n;

  for (const cartItem of cart.items) {
    const nft = nfts.find((entry) => entry.id === cartItem.nftId);

    if (!nft) {
      return errorResponse("Um NFT do carrinho não existe mais.", 409);
    }

    if (cartItem.quantity > availableStock(nft.id, store)) {
      return errorResponse(`Estoque insuficiente para ${nft.name}.`, 409);
    }

    const lineTotalWei = ethToWei(nft.price) * BigInt(cartItem.quantity);

    subtotalWei += lineTotalWei;

    items.push({
      nftId: nft.id,
      name: nft.name,
      image: nft.image,
      quantity: cartItem.quantity,
      unitPrice: nft.price,
      total: weiToEth(lineTotalWei),
      network: nft.network,
    });
  }

  const discountWei =
    couponCode === "KURIO10"
      ? (subtotalWei * BigInt(DISCOUNT_PERCENT)) / 100n
      : 0n;

  const totalWei = subtotalWei - discountWei + NETWORK_FEE_WEI;

  return {
    id: crypto.randomUUID(),
    cartVersion: cart.version,
    items,
    couponCode,
    subtotal: weiToEth(subtotalWei),
    discount: weiToEth(discountWei),
    networkFee: weiToEth(NETWORK_FEE_WEI),
    total: weiToEth(totalWei),
    expiresAt: Date.now() + QUOTE_TTL_MS,
  };
}

function sameCart(cart: Cart, quote: CheckoutQuote): boolean {
  if (cart.version !== quote.cartVersion) {
    return false;
  }

  if (cart.items.length !== quote.items.length) {
    return false;
  }

  return quote.items.every((item) =>
    cart.items.some(
      (cartItem) =>
        cartItem.nftId === item.nftId && cartItem.quantity === item.quantity,
    ),
  );
}

function sameQuoteValues(first: CheckoutQuote, second: CheckoutQuote): boolean {
  return (
    first.subtotal === second.subtotal &&
    first.discount === second.discount &&
    first.networkFee === second.networkFee &&
    first.total === second.total &&
    first.items.length === second.items.length &&
    first.items.every((item) =>
      second.items.some(
        (other) =>
          item.nftId === other.nftId &&
          item.quantity === other.quantity &&
          item.unitPrice === other.unitPrice &&
          item.total === other.total,
      ),
    )
  );
}

export const checkoutHandlers = [
  http.post("/api/checkout/quote", async ({ request }) => {
    const userId = getAuthenticatedUserId(request);
    if (!userId) return unauthorized();

    const body = (await request.json().catch(() => null)) as {
      couponCode?: unknown;
    } | null;

    if (
      body?.couponCode !== null &&
      body?.couponCode !== undefined &&
      typeof body?.couponCode !== "string"
    ) {
      return errorResponse("Cupom inválido.", 400);
    }

    const couponCode =
      typeof body?.couponCode === "string"
        ? body.couponCode.trim().toUpperCase()
        : null;

    if (couponCode && couponCode !== "KURIO10") {
      return errorResponse("Cupom não encontrado ou expirado.", 422);
    }

    const store = readStore();
    const result = buildQuote(userId, couponCode || null, store);

    if (result instanceof Response) {
      return result;
    }

    store.quotes.push({
      userId,
      quote: result,
    });

    saveStore(store);

    return HttpResponse.json(result, {
      status: 201,
    });
  }),

  http.post("/api/orders", async ({ request }) => {
    const userId = getAuthenticatedUserId(request);
    if (!userId) return unauthorized();

    const idempotencyKey = request.headers.get("Idempotency-Key")?.trim();

    if (!idempotencyKey || idempotencyKey.length > 128) {
      return errorResponse("Chave de idempotência obrigatória.", 400);
    }

    const body = (await request.json().catch(() => null)) as {
      quoteId?: unknown;
      walletAddress?: unknown;
      walletType?: unknown;
    } | null;

    if (
      typeof body?.quoteId !== "string" ||
      typeof body.walletAddress !== "string" ||
      typeof body.walletType !== "string"
    ) {
      return errorResponse("Dados do pedido inválidos.", 400);
    }

    const quoteId = body.quoteId;
    const walletAddress = body.walletAddress.trim();
    const walletType = body.walletType;

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return errorResponse(
        "Informe um endereço de carteira Ethereum válido.",
        422,
      );
    }

    if (
      walletType !== "metamask" &&
      walletType !== "walletconnect" &&
      walletType !== "coinbase"
    ) {
      return errorResponse("Tipo de carteira inválido.", 422);
    }

    const store = readStore();

    const fingerprint = JSON.stringify({
      quoteId,
      walletAddress,
      walletType,
    });

    const idempotencyStorageKey = `${userId}:${idempotencyKey}`;

    const existing = store.idempotency[idempotencyStorageKey];

    // Idempotência vem ANTES de verificar a cotação.
    // Assim, uma repetição retorna o pedido original,
    // mesmo depois de o carrinho ter sido esvaziado.
    if (existing) {
      if (existing.fingerprint !== fingerprint) {
        return errorResponse(
          "Chave de idempotência reutilizada com dados diferentes.",
          409,
        );
      }

      const previousOrder = store.orders.find(
        (order) => order.id === existing.orderId && order.userId === userId,
      );

      if (!previousOrder) {
        return errorResponse("Pedido anterior não encontrado.", 409);
      }

      return HttpResponse.json(previousOrder);
    }

    const storedQuote = store.quotes.find(
      (entry) => entry.quote.id === quoteId && entry.userId === userId,
    );

    if (!storedQuote) {
      return errorResponse("Cotação não encontrada.", 404);
    }

    const quote = storedQuote.quote;

    if (Date.now() >= quote.expiresAt) {
      return errorResponse("Cotação expirada. Atualize os valores.", 410);
    }

    const cart = readCart(userId);

    if (!sameCart(cart, quote)) {
      return errorResponse(
        "O carrinho foi alterado. Gere uma nova cotação.",
        409,
      );
    }

    // Recalcula preços, taxas, descontos e estoque.
    // Não confia nos valores recebidos do cliente.
    const currentQuote = buildQuote(userId, quote.couponCode, store);

    if (currentQuote instanceof Response) {
      return currentQuote;
    }

    if (!sameQuoteValues(quote, currentQuote)) {
      return errorResponse("Os valores mudaram. Gere uma nova cotação.", 409);
    }

    const order: Order = {
      id: crypto.randomUUID(),
      userId,
      quoteId: quote.id,
      items: quote.items,
      couponCode: quote.couponCode,
      subtotal: quote.subtotal,
      discount: quote.discount,
      networkFee: quote.networkFee,
      total: quote.total,
      walletAddress,
      walletType,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    for (const item of quote.items) {
      store.sold[item.nftId] = (store.sold[item.nftId] ?? 0) + item.quantity;
    }

    store.orders.push(order);

    store.idempotency[idempotencyStorageKey] = {
      userId,
      fingerprint,
      orderId: order.id,
    };

    // Persiste pedido e estoque antes de limpar carrinho.
    saveStore(store);

    localStorage.setItem(
      cartKey(userId),
      JSON.stringify({
        items: [],
        couponCode: null,
        version: cart.version + 1,
      } satisfies Cart),
    );

    return HttpResponse.json(order, {
      status: 201,
    });
  }),

  http.get("/api/orders/:orderId", ({ request, params }) => {
    const userId = getAuthenticatedUserId(request);
    if (!userId) return unauthorized();

    const store = readStore();

    const order = store.orders.find(
      (entry) => entry.id === String(params.orderId) && entry.userId === userId,
    );

    if (!order) {
      return errorResponse("Pedido não encontrado.", 404);
    }

    return HttpResponse.json(order);
  }),
];
