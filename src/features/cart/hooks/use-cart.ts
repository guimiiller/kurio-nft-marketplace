import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
} from "../api/cart.api";

import type {
  CartResponse,
  CartItemInput,
  UpdateCartItemInput,
} from "../types/cart.types";

export const cartQueryKey = ["cart"] as const;

export function useCart() {
  return useQuery({
    queryKey: cartQueryKey,
    queryFn: getCart,
  });
}

export function useAddCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CartItemInput) => addCartItem(input),

    onSuccess: (cart: CartResponse) => {
      queryClient.setQueryData(cartQueryKey, cart);
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nftId, quantity }: { nftId: string; quantity: number }) => {
      const input: UpdateCartItemInput = { quantity };
      return updateCartItem(nftId, input);
    },

    onSuccess: (cart: CartResponse) => {
      queryClient.setQueryData(cartQueryKey, cart);
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nftId: string) => removeCartItem(nftId),

    onSuccess: (cart: CartResponse) => {
      queryClient.setQueryData(cartQueryKey, cart);
    },
  });
}
