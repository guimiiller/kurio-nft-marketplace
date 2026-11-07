export interface NFT {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  network: string;
  available: number;
  version: number;
}

export interface GetNFTsResponse {
  data: NFT[];
  total: number;
}
