import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../api/cart.api";

import { useAuthSession } from "../../auth/hooks/use-auth-session";

import type {
  CartItemInput,
  CartResponse,
  UpdateCartItemInput,
} from "../types/cart.types";

export const cartQueryKeys = {
  all: ["cart"] as const,

  byUser: (userId: string) => ["cart", userId] as const,
};

export function useCart() {
  const session = useAuthSession();

  return useQuery({
    queryKey: cartQueryKeys.byUser(session?.userId ?? "guest"),
    queryFn: getCart,
    enabled: Boolean(session),
    retry: false,
  });
}

export function useAddCartItem() {
  const queryClient = useQueryClient();
  const session = useAuthSession();

  return useMutation({
    mutationFn: (input: CartItemInput) => addCartItem(input),

    onSuccess: (cart: CartResponse) => {
      if (!session) return;

      queryClient.setQueryData(cartQueryKeys.byUser(session.userId), cart);
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const session = useAuthSession();

  return useMutation({
    mutationFn: ({
      nftId,
      input,
    }: {
      nftId: string;
      input: UpdateCartItemInput;
    }) => updateCartItem(nftId, input),

    onSuccess: (cart: CartResponse) => {
      if (!session) return;

      queryClient.setQueryData(cartQueryKeys.byUser(session.userId), cart);
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const session = useAuthSession();

  return useMutation({
    mutationFn: (nftId: string) => removeCartItem(nftId),

    onSuccess: (cart: CartResponse) => {
      if (!session) return;

      queryClient.setQueryData(cartQueryKeys.byUser(session.userId), cart);
    },
  });
}
