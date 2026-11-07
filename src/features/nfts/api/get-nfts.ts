import { api } from "../../../lib/api/client";
import type { NFT } from "../../../mocks/fixtures/nfts";

interface GetNFTsResponse {
  data: NFT[];
  total: number;
}

export async function getNFTs(): Promise<GetNFTsResponse> {
  const response = await api.get<GetNFTsResponse>("/nfts");

  return response.data;
}
