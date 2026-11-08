import { api } from "../../../lib/api/client";

import type {
  CollectorWallet,
  CreateWalletInput,
  UpdateWalletInput,
} from "../types/wallet.types";

export async function getWallets(): Promise<CollectorWallet[]> {
  const { data } = await api.get<CollectorWallet[]>("/wallets");

  return data;
}

export async function createWallet(
  input: CreateWalletInput,
): Promise<CollectorWallet> {
  const { data } = await api.post<CollectorWallet>("/wallets", input);

  return data;
}

export async function updateWallet(
  walletId: string,
  input: UpdateWalletInput,
): Promise<CollectorWallet> {
  const { data } = await api.patch<CollectorWallet>(
    `/wallets/${encodeURIComponent(walletId)}`,
    input,
  );

  return data;
}

export async function setPrimaryWallet(
  walletId: string,
): Promise<CollectorWallet> {
  const { data } = await api.patch<CollectorWallet>(
    `/wallets/${encodeURIComponent(walletId)}/primary`,
  );

  return data;
}

export async function deleteWallet(walletId: string): Promise<void> {
  await api.delete(`/wallets/${encodeURIComponent(walletId)}`);
}
