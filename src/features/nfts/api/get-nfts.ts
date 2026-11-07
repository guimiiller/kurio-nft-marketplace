import { api } from "../../../lib/api/client";
import type { GetNFTsResponse } from "../types/nft.types";

export async function getNFTs(): Promise<GetNFTsResponse> {
  const response = await api.get<GetNFTsResponse>("/nfts");

  return response.data;
}
