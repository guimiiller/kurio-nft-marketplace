import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthSession } from "../../auth/hooks/use-auth-session";

import {
  createWallet,
  deleteWallet,
  getWallets,
  setPrimaryWallet,
  updateWallet,
} from "../api/wallets.api";

import type {
  CreateWalletInput,
  UpdateWalletInput,
} from "../types/wallet.types";

export const walletQueryKeys = {
  byUser: (userId: string) => ["wallets", userId] as const,
};

export function useWallets() {
  const session = useAuthSession();

  return useQuery({
    queryKey: walletQueryKeys.byUser(session?.userId ?? "guest"),
    queryFn: getWallets,
    enabled: Boolean(session),
    retry: false,
  });
}

function useInvalidateWallets() {
  const queryClient = useQueryClient();
  const session = useAuthSession();

  return async () => {
    if (!session) return;

    await queryClient.invalidateQueries({
      queryKey: walletQueryKeys.byUser(session.userId),
    });
  };
}

export function useCreateWallet() {
  const invalidate = useInvalidateWallets();

  return useMutation({
    mutationFn: (input: CreateWalletInput) => createWallet(input),
    onSuccess: invalidate,
  });
}

export function useUpdateWallet() {
  const invalidate = useInvalidateWallets();

  return useMutation({
    mutationFn: ({
      walletId,
      input,
    }: {
      walletId: string;
      input: UpdateWalletInput;
    }) => updateWallet(walletId, input),
    onSuccess: invalidate,
  });
}

export function useSetPrimaryWallet() {
  const invalidate = useInvalidateWallets();

  return useMutation({
    mutationFn: (walletId: string) => setPrimaryWallet(walletId),
    onSuccess: invalidate,
  });
}

export function useDeleteWallet() {
  const invalidate = useInvalidateWallets();

  return useMutation({
    mutationFn: (walletId: string) => deleteWallet(walletId),
    onSuccess: invalidate,
  });
}
