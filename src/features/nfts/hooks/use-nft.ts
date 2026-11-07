import { useQuery } from "@tanstack/react-query";
import { getNFTById } from "../api/get-nft-by-id";

export function useNFT(id: string) {
  return useQuery({
    queryKey: ["nft", id],
    queryFn: ({ signal }) => getNFTById(id, signal),
    retry: (failureCount, error) => {
      const status =
        typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { status?: number } }).response?.status
          : undefined;

      if (status === 404) return false;

      return failureCount < 2;
    },
  });
}
