import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCheckoutQuote,
  createOrder,
  getOrder,
} from "../api/checkout.api";

import { useAuthSession } from "../../auth/hooks/use-auth-session";
import { cartQueryKeys } from "../../cart/hooks/use-cart";

export function useCheckoutQuote() {
  return useMutation({
    mutationFn: createCheckoutQuote,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const session = useAuthSession();

  return useMutation({
    mutationFn: createOrder,

    onSuccess: async () => {
      if (!session) return;

      await queryClient.invalidateQueries({
        queryKey: cartQueryKeys.byUser(session.userId),
      });
    },
  });
}

export function useOrder(orderId: string) {
  const session = useAuthSession();

  return useQuery({
    queryKey: ["orders", session?.userId, orderId],
    queryFn: () => getOrder(orderId),
    enabled: Boolean(session && orderId),
    retry: false,
  });
}
