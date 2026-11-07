import { http, HttpResponse } from "msw";
import { nfts } from "../fixtures/nfts";

export const nftHandlers = [
  http.get("/api/nfts", () => {
    return HttpResponse.json({
      data: nfts,
      total: nfts.length,
    });
  }),
];
