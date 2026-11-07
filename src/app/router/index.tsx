import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

import {
  defaultNFTFilters,
  type NFTFilters,
} from "../../features/nfts/types/nft-filters.types";

import { AppLayout } from "../../components/layout/AppLayout";
import { HomePage } from "../../pages/HomePage";
import { NotFoundPage } from "../../pages/NotFoundPage";

const rootRoute = createRootRoute({
  component: AppLayout,
  notFoundComponent: NotFoundPage,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: (search: Record<string, unknown>): NFTFilters => {
    const getString = (key: string) =>
      typeof search[key] === "string" ? (search[key] as string) : "";

    const rawPage = Number(search.page);
    const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

    const allowedSorts = ["recent", "price-asc", "price-desc"] as const;
    const rawSort = getString("sort");

    const sort =
      allowedSorts.find((value) => value === rawSort) ?? defaultNFTFilters.sort;

    return {
      ...defaultNFTFilters,
      search: getString("search"),
      category: getString("category"),
      network: getString("network"),
      minPrice: getString("minPrice"),
      maxPrice: getString("maxPrice"),
      sort,
      page,
    };
  },
  component: HomePage,
});

const routeTree = rootRoute.addChildren([homeRoute]);

export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFoundPage,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
