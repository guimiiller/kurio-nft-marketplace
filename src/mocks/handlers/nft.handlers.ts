import { http, HttpResponse } from "msw";

import { nfts } from "../fixtures/nfts";
import type { NFTSort } from "../../features/nfts/types/nft-filters.types";

export const nftHandlers = [
  http.get("/api/nfts", ({ request }) => {
    const url = new URL(request.url);
    const params = url.searchParams;

    const search = (params.get("search") ?? "").trim().toLowerCase();
    const category = params.get("category") ?? "";
    const network = params.get("network") ?? "";
    const minPrice = params.get("minPrice") ?? "";
    const maxPrice = params.get("maxPrice") ?? "";
    const sort = (params.get("sort") ?? "recent") as NFTSort;

    const rawPage = Number(params.get("page") ?? 1);
    const rawLimit = Number(params.get("limit") ?? 9);

    const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

    const limit =
      Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 50) : 9;

    const isValidPrice = (value: string) =>
      value === "" || /^\d+(\.\d+)?$/.test(value);

    if (!isValidPrice(minPrice) || !isValidPrice(maxPrice)) {
      return HttpResponse.json(
        { message: "Faixa de preço inválida." },
        { status: 400 },
      );
    }

    const min = minPrice === "" ? null : Number(minPrice);
    const max = maxPrice === "" ? null : Number(maxPrice);

    if (min !== null && max !== null && min > max) {
      return HttpResponse.json(
        {
          message: "O preço mínimo não pode superar o máximo.",
        },
        { status: 400 },
      );
    }

    const filtered = nfts
      .filter((nft) => {
        const price = Number(nft.price);

        return (
          nft.name.toLowerCase().includes(search) &&
          (!category || nft.category === category) &&
          (!network || nft.network === network) &&
          (min === null || price >= min) &&
          (max === null || price <= max)
        );
      })
      .sort((a, b) => {
        if (sort === "price-asc") {
          return Number(a.price) - Number(b.price);
        }

        if (sort === "price-desc") {
          return Number(b.price) - Number(a.price);
        }

        return 0;
      });

    const total = filtered.length;
    const start = (page - 1) * limit;

    return HttpResponse.json({
      data: filtered.slice(start, start + limit),
      total,
    });
  }),

  http.get("/api/nfts/:id", ({ params }) => {
    const nft = nfts.find((item) => item.id === String(params.id));

    if (!nft) {
      return HttpResponse.json(
        { message: "NFT não encontrado." },
        { status: 404 },
      );
    }

    return HttpResponse.json(nft);
  }),
];
