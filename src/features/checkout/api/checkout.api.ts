import { api } from "../../../lib/api/client";

import type {
  CheckoutQuote,
  CheckoutQuoteInput,
  CreateOrderInput,
  Order,
} from "../types/checkout.types";

export async function createCheckoutQuote(
  input: CheckoutQuoteInput,
): Promise<CheckoutQuote> {
  const { data } = await api.post<CheckoutQuote>("/checkout/quote", input);

  return data;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const { idempotencyKey, ...payload } = input;

  const { data } = await api.post<Order>("/orders", payload, {
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
  });

  return data;
}

export async function getOrder(orderId: string): Promise<Order> {
  const { data } = await api.get<Order>(
    `/orders/${encodeURIComponent(orderId)}`,
  );

  return data;
}
