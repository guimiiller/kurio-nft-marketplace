import { Link } from "@tanstack/react-router";

import { defaultNFTFilters } from "../features/nfts/types/nft-filters.types";

export function NotFoundPage() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl font-bold text-[#d8924c]">404</h1>

      <h2 className="mt-4 text-2xl font-bold text-[#f0e8df]">
        Página não encontrada
      </h2>

      <p className="mt-3 max-w-md text-[#b99b80]">
        A página que você está procurando não existe ou foi movida.
      </p>

      <Link
        to="/"
        search={defaultNFTFilters}
        className="mt-6 rounded-md bg-[#d8924c] px-5 py-3 font-bold text-[#150e0b] transition-colors hover:bg-[#e6a866]"
      >
        Voltar ao início
      </Link>
    </main>
  );
}
