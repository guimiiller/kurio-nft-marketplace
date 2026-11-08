export type WalletProvider =
  | "metamask"
  | "walletconnect"
  | "coinbase"
  | "other";

export interface CollectorWallet {
  id: string;
  userId: string;
  address: string;
  nickname: string;
  provider: WalletProvider;
  isPrimary: boolean;
  createdAt: string;
}

export interface CreateWalletInput {
  address: string;
  nickname: string;
  provider: WalletProvider;
}

export interface UpdateWalletInput {
  nickname: string;
  provider: WalletProvider;
}
