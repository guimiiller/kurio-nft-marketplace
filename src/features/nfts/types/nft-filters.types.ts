export type NFTSort = "recent" | "price-asc" | "price-desc";

export interface NFTFilters {
  search: string;
  category: string;
  network: string;
  minPrice: string;
  maxPrice: string;
  sort: NFTSort;
  page: number;
  limit: number;
}

export const defaultNFTFilters: NFTFilters = {
  search: "",
  category: "",
  network: "",
  minPrice: "",
  maxPrice: "",
  sort: "recent",
  page: 1,
  limit: 9,
};
