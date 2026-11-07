import { api } from "../../../lib/api/client";
import type { NFT } from "../types/nft.types";

export async function getNFTById(
  id: string,
  signal?: AbortSignal,
): Promise<NFT> {
  const response = await api.get<NFT>(`/nfts/${encodeURIComponent(id)}`, {
    signal,
  });

  return response.data;
}
