import type { NFT } from "../../nfts/types/nft.types";

export interface NFTUpdatedEvent {
  nft: NFT;
}

export interface OrderUpdatedEvent {
  orderId: string;
  userId: string;
  version: number;
}
