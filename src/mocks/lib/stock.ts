import { nfts } from "../fixtures/nfts";

interface StockStore {
  sold?: Record<string, number>;
}

export function getAvailableStock(nftId: string): number {
  const nft = nfts.find((item) => item.id === nftId);

  if (!nft) return 0;

  try {
    const raw = localStorage.getItem("kurio:mock:checkout");

    if (!raw) return nft.available;

    const store = JSON.parse(raw) as StockStore;
    const sold = store.sold?.[nftId] ?? 0;

    if (typeof sold !== "number" || !Number.isSafeInteger(sold) || sold < 0) {
      return nft.available;
    }

    return Math.max(0, nft.available - sold);
  } catch {
    return nft.available;
  }
}
