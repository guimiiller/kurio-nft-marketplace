import { http, HttpResponse } from "msw";

import { nfts } from "../fixtures/nfts";
import { getAuthenticatedUserId } from "../lib/auth";
import { getAvailableStock } from "../lib/stock";

import type {
  Cart,
  CartItem,
  CartResponse,
} from "../../features/cart/types/cart.types";

function emptyCart(): Cart {
  return {
    items: [],
    couponCode: null,
    version: 1,
  };
}

function getCartStorageKey(userId: string): string {
  return `kurio:cart:user:${userId}`;
}

function readCart(userId: string): Cart {
  try {
    const stored = localStorage.getItem(getCartStorageKey(userId));

    if (!stored) return emptyCart();

    const parsed: unknown = JSON.parse(stored);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("items" in parsed) ||
      !Array.isArray(parsed.items)
    ) {
      return emptyCart();
    }

    const candidate = parsed as Cart;

    const items: CartItem[] = candidate.items.filter(
      (item) =>
        typeof item?.nftId === "string" &&
        Number.isSafeInteger(item.quantity) &&
        item.quantity > 0 &&
        nfts.some((nft) => nft.id === item.nftId),
    );

    return {
      items,
      couponCode:
        typeof candidate.couponCode === "string" ? candidate.couponCode : null,
      version:
        Number.isSafeInteger(candidate.version) && candidate.version > 0
          ? candidate.version
          : 1,
    };
  } catch {
    return emptyCart();
  }
}

function saveCart(userId: string, cart: Cart): void {
  localStorage.setItem(getCartStorageKey(userId), JSON.stringify(cart));
}

function toResponse(cart: Cart): CartResponse {
  return {
    items: cart.items.flatMap((item) => {
      const nft = nfts.find((entry) => entry.id === item.nftId);

      if (!nft) return [];

      return [
        {
          nftId: nft.id,
          quantity: item.quantity,
          name: nft.name,
          image: nft.image,
          price: nft.price,
          available: getAvailableStock(nft.id),
          network: nft.network,
        },
      ];
    }),

    couponCode: cart.couponCode,
    version: cart.version,
  };
}

function parseQuantity(value: unknown): number | null {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0
    ? value
    : null;
}

function invalidQuantity() {
  return HttpResponse.json(
    {
      message: "A quantidade deve ser um inteiro positivo.",
    },
    { status: 400 },
  );
}

function unauthorized() {
  return HttpResponse.json(
    {
      message: "Você precisa entrar na sua conta para acessar o carrinho.",
    },
    { status: 401 },
  );
}

export const cartHandlers = [
  http.get("/api/cart", ({ request }) => {
    const userId = getAuthenticatedUserId(request);

    if (!userId) return unauthorized();

    return HttpResponse.json(toResponse(readCart(userId)));
  }),

  http.post("/api/cart/items", async ({ request }) => {
    const userId = getAuthenticatedUserId(request);

    if (!userId) return unauthorized();

    const body = (await request.json().catch(() => null)) as {
      nftId?: unknown;
      quantity?: unknown;
    } | null;

    const nftId = body?.nftId;

    if (typeof nftId !== "string") {
      return HttpResponse.json({ message: "NFT inválido." }, { status: 400 });
    }

    const nft = nfts.find((entry) => entry.id === nftId);

    if (!nft) {
      return HttpResponse.json(
        { message: "NFT não encontrado." },
        { status: 404 },
      );
    }

    const quantity = parseQuantity(body?.quantity);

    if (quantity === null) return invalidQuantity();

    const cart = readCart(userId);

    const existing = cart.items.find((item) => item.nftId === nftId);

    const nextQuantity = (existing?.quantity ?? 0) + quantity;

    const available = getAvailableStock(nftId);

    if (!Number.isSafeInteger(nextQuantity) || nextQuantity > available) {
      return HttpResponse.json(
        {
          message: `Estoque insuficiente. Disponível: ${available}.`,
        },
        { status: 409 },
      );
    }

    if (existing) {
      existing.quantity = nextQuantity;
    } else {
      cart.items.push({ nftId, quantity });
    }

    cart.version += 1;
    saveCart(userId, cart);

    return HttpResponse.json(toResponse(cart), {
      status: 201,
    });
  }),

  http.patch("/api/cart/items/:nftId", async ({ params, request }) => {
    const userId = getAuthenticatedUserId(request);

    if (!userId) return unauthorized();

    const nftId = String(params.nftId);
    const cart = readCart(userId);

    const existing = cart.items.find((item) => item.nftId === nftId);

    if (!existing) {
      return HttpResponse.json(
        {
          message: "Item não encontrado no carrinho.",
        },
        { status: 404 },
      );
    }

    const body = (await request.json().catch(() => null)) as {
      quantity?: unknown;
    } | null;

    const quantity = parseQuantity(body?.quantity);

    if (quantity === null) return invalidQuantity();

    const nft = nfts.find((entry) => entry.id === nftId);

    if (!nft) {
      return HttpResponse.json(
        { message: "NFT não encontrado." },
        { status: 404 },
      );
    }

    const available = getAvailableStock(nftId);

    if (quantity > available) {
      return HttpResponse.json(
        {
          message: `Estoque insuficiente. Disponível: ${available}.`,
        },
        { status: 409 },
      );
    }

    existing.quantity = quantity;
    cart.version += 1;

    saveCart(userId, cart);

    return HttpResponse.json(toResponse(cart));
  }),

  http.delete("/api/cart/items/:nftId", ({ params, request }) => {
    const userId = getAuthenticatedUserId(request);

    if (!userId) return unauthorized();

    const nftId = String(params.nftId);
    const cart = readCart(userId);

    const exists = cart.items.some((item) => item.nftId === nftId);

    if (!exists) {
      return HttpResponse.json(
        {
          message: "Item não encontrado no carrinho.",
        },
        { status: 404 },
      );
    }

    cart.items = cart.items.filter((item) => item.nftId !== nftId);

    cart.version += 1;
    saveCart(userId, cart);

    return HttpResponse.json(toResponse(cart));
  }),
];
