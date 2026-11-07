import { api } from "../../../lib/api/client";

import type {
  CartResponse,
  CartItemInput,
  UpdateCartItemInput,
} from "../types/cart.types";

export async function getCart(): Promise<CartResponse> {
  const response = await api.get<CartResponse>("/cart");

  return response.data;
}

export async function addCartItem(input: CartItemInput): Promise<CartResponse> {
  const response = await api.post<CartResponse>("/cart/items", input);

  return response.data;
}

export async function updateCartItem(
  nftId: string,
  input: UpdateCartItemInput,
): Promise<CartResponse> {
  const response = await api.patch<CartResponse>(
    `/cart/items/${encodeURIComponent(nftId)}`,
    input,
  );

  return response.data;
}

export async function removeCartItem(nftId: string): Promise<CartResponse> {
  const response = await api.delete<CartResponse>(
    `/cart/items/${encodeURIComponent(nftId)}`,
  );

  return response.data;
}
