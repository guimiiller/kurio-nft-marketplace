import { api } from "../../../lib/api/client";
import type { GetNFTsResponse } from "../types/nft.types";
import type { NFTFilters } from "../types/nft-filters.types";

export async function getNFTs(
  filters: NFTFilters,
  signal?: AbortSignal,
): Promise<GetNFTsResponse> {
  const response = await api.get<GetNFTsResponse>("/nfts", {
    params: filters,
    signal,
  });

  return response.data;
}
