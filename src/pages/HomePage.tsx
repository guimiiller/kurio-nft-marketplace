import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useNFTs } from "../features/nfts/hooks/use-nfts";
import { NFTCard } from "../features/nfts/components/NFTCard";
import {
  defaultNFTFilters,
  type NFTFilters,
  type NFTSort,
} from "../features/nfts/types/nft-filters.types";

const categories = ["Arte digital", "Colecionáveis"];
const networks = ["Ethereum", "Polygon"];

const inputClass =
  "w-full rounded-lg border border-[#493125] bg-[#241710] px-3 py-2.5 text-sm text-[#f0e8df] outline-none focus:border-[#d8924c]";

export function HomePage() {
  const filters = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });

  const [searchInput, setSearchInput] = useState(filters.search);
  const [minPriceInput, setMinPriceInput] = useState(filters.minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(filters.maxPrice);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    setSearchInput(filters.search);
    setMinPriceInput(filters.minPrice);
    setMaxPriceInput(filters.maxPrice);
  }, [filters.search, filters.minPrice, filters.maxPrice]);

  const { data, isPending, isError, refetch } = useNFTs(filters);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / filters.limit));

  function updateFilters(changes: Partial<NFTFilters>) {
    void navigate({
      search: (previous) => ({
        ...previous,
        ...changes,
        page: changes.page ?? 1,
      }),
      replace: true,
    });
  }

  function clearFilters() {
    setSearchInput("");
    setMinPriceInput("");
    setMaxPriceInput("");

    void navigate({
      search: defaultNFTFilters,
      replace: true,
    });
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateFilters({ search: searchInput.trim() });
  }

  function submitPrices(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validPrice = (value: string) =>
      value === "" || /^\d+(\.\d+)?$/.test(value);

    if (!validPrice(minPriceInput) || !validPrice(maxPriceInput)) {
      return;
    }

    if (
      minPriceInput !== "" &&
      maxPriceInput !== "" &&
      Number(minPriceInput) > Number(maxPriceInput)
    ) {
      return;
    }

    updateFilters({
      minPrice: minPriceInput,
      maxPrice: maxPriceInput,
    });
  }

  const hasActiveFilters =
    filters.search !== "" ||
    filters.category !== "" ||
    filters.network !== "" ||
    filters.minPrice !== "" ||
    filters.maxPrice !== "" ||
    filters.sort !== "recent";

  const filterControls = (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-bold text-[#f0e8df]">Categorias</h3>

        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category}
              className="flex cursor-pointer items-center gap-3 text-sm text-[#c9aa8c]"
            >
              <input
                type="radio"
                name="category"
                checked={filters.category === category}
                onChange={() => updateFilters({ category })}
                className="accent-[#d8924c]"
              />
              {category}
            </label>
          ))}

          <label className="flex cursor-pointer items-center gap-3 text-sm text-[#c9aa8c]">
            <input
              type="radio"
              name="category"
              checked={filters.category === ""}
              onChange={() => updateFilters({ category: "" })}
              className="accent-[#d8924c]"
            />
            Todas
          </label>
        </div>
      </div>

      <div className="border-t border-[#493125] pt-5">
        <h3 className="mb-3 text-sm font-bold text-[#f0e8df]">Blockchain</h3>

        <div className="space-y-2">
          {networks.map((network) => (
            <label
              key={network}
              className="flex cursor-pointer items-center gap-3 text-sm text-[#c9aa8c]"
            >
              <input
                type="radio"
                name="network"
                checked={filters.network === network}
                onChange={() => updateFilters({ network })}
                className="accent-[#d8924c]"
              />
              {network}
            </label>
          ))}

          <label className="flex cursor-pointer items-center gap-3 text-sm text-[#c9aa8c]">
            <input
              type="radio"
              name="network"
              checked={filters.network === ""}
              onChange={() => updateFilters({ network: "" })}
              className="accent-[#d8924c]"
            />
            Todas
          </label>
        </div>
      </div>

      <form onSubmit={submitPrices} className="border-t border-[#493125] pt-5">
        <h3 className="mb-3 text-sm font-bold text-[#f0e8df]">Preço (ETH)</h3>

        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1">
            <span className="text-xs text-[#b99b80]">Mínimo</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={minPriceInput}
              onChange={(event) => setMinPriceInput(event.target.value)}
              className={inputClass}
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs text-[#b99b80]">Máximo</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="5.00"
              value={maxPriceInput}
              onChange={(event) => setMaxPriceInput(event.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <button
          type="submit"
          className="mt-3 w-full rounded-lg bg-[#d8924c] px-3 py-2.5 text-sm font-bold text-[#150e0b] hover:bg-[#e6a866]"
        >
          Aplicar preço
        </button>
      </form>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#493125] px-3 py-2.5 text-sm text-[#f0e8df] hover:border-[#d8924c]"
        >
          <X size={16} />
          Limpar filtros
        </button>
      )}
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 md:px-6 md:pt-8">
      {/* Busca mobile */}
      <div className="mb-5 flex gap-3 md:hidden">
        <form
          onSubmit={submitSearch}
          role="search"
          className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-[#2b1a15] px-4 py-3"
        >
          <Search
            size={18}
            className="shrink-0 text-[#d8924c]"
            aria-hidden="true"
          />

          <label htmlFor="mobile-nft-search" className="sr-only">
            Buscar NFTs
          </label>

          <input
            id="mobile-nft-search"
            type="search"
            placeholder="Explorar coleções"
            className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-[#b99b80]"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </form>

        <button
          type="button"
          aria-label={showMobileFilters ? "Fechar filtros" : "Abrir filtros"}
          aria-expanded={showMobileFilters}
          aria-controls="mobile-nft-filters"
          onClick={() => setShowMobileFilters((previous) => !previous)}
          className="rounded-xl bg-[#d8924c] p-3 text-[#150e0b]"
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {showMobileFilters && (
        <div
          id="mobile-nft-filters"
          className="mb-6 rounded-xl border border-[#493125] bg-[#2b1a15] p-5 md:hidden"
        >
          <h2 className="mb-5 text-lg font-bold">Filtros</h2>
          {filterControls}
        </div>
      )}

      {/* Hero */}
      <section className="mb-10 grid items-center gap-6 rounded-2xl bg-[#241710] p-5 md:grid-cols-2 md:bg-transparent md:p-0">
        <div className="md:px-5">
          <p className="mb-3 text-xs tracking-widest text-[#c9aa8c]">
            Bem-vindo à Kurio
          </p>

          <h1 className="max-w-xl text-2xl font-bold uppercase leading-tight text-[#f0e8df] md:text-4xl lg:text-5xl">
            Seja dono do futuro da arte digital
          </h1>

          <p className="mt-4 max-w-lg text-xs leading-6 text-[#b99b80] md:text-sm">
            Descubra NFTs selecionados de criadores emergentes e consagrados.
            Colecione arte digital rara, apoie artistas e tenha uma parte da
            cultura da internet.
          </p>

          <a
            href="#catalogo"
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#d8924c] px-5 py-3 text-sm font-bold text-[#150e0b] hover:bg-[#e6a866]"
          >
            Explorar NFTs
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>

        <div className="overflow-hidden rounded-2xl">
          <img
            src="/images/emerald-ape.png"
            alt="Emerald Ape, macaco com óculos verdes e jaqueta verde"
            className="aspect-square w-full object-contain"
            fetchPriority="high"
          />
        </div>
      </section>

      {/* Catálogo */}
      <section id="catalogo" aria-labelledby="catalogo-titulo">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs text-[#b99b80]">Explore a coleção</p>
            <h2
              id="catalogo-titulo"
              className="text-xl font-bold text-[#f0e8df] md:text-2xl"
            >
              Todos os NFTs
            </h2>
          </div>

          {!isPending && !isError && (
            <p className="text-xs text-[#b99b80]">{total} NFTs encontrados</p>
          )}
        </div>

        <div className="grid gap-7 md:grid-cols-[230px_minmax(0,1fr)]">
          {/* Filtros desktop */}
          <aside
            aria-label="Filtros do catálogo"
            className="hidden h-fit rounded-xl border border-[#493125] bg-[#2b1a15] p-5 md:block"
          >
            <h2 className="mb-5 text-lg font-bold text-[#f0e8df]">Filtros</h2>
            {filterControls}
          </aside>

          {/* Resultados */}
          <div className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <form
                onSubmit={submitSearch}
                role="search"
                className="hidden min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#493125] bg-[#241710] px-3 md:flex"
              >
                <Search
                  size={18}
                  className="shrink-0 text-[#d8924c]"
                  aria-hidden="true"
                />

                <label htmlFor="desktop-nft-search" className="sr-only">
                  Buscar NFTs
                </label>

                <input
                  id="desktop-nft-search"
                  type="search"
                  placeholder="Buscar NFTs..."
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[#f0e8df] outline-none placeholder:text-[#b99b80]"
                />

                <button
                  type="submit"
                  className="text-xs font-bold text-[#d8924c]"
                >
                  Buscar
                </button>
              </form>

              <label className="flex items-center gap-2 text-xs text-[#b99b80]">
                Ordenar por
                <select
                  value={filters.sort}
                  onChange={(event) =>
                    updateFilters({
                      sort: event.target.value as NFTSort,
                    })
                  }
                  className="rounded-lg border border-[#493125] bg-[#241710] px-3 py-2.5 text-sm text-[#f0e8df] outline-none focus:border-[#d8924c]"
                >
                  <option value="recent">Mais recentes</option>
                  <option value="price-asc">Menor preço</option>
                  <option value="price-desc">Maior preço</option>
                </select>
              </label>
            </div>

            {isPending ? (
              <div
                role="status"
                aria-label="Carregando catálogo de NFTs"
                className="grid grid-cols-2 gap-4 lg:grid-cols-3"
              >
                {Array.from({ length: 9 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="aspect-square rounded-xl bg-[#2b1a15]" />
                    <div className="mt-3 h-4 w-3/4 rounded bg-[#2b1a15]" />
                    <div className="mt-2 h-4 w-1/2 rounded bg-[#2b1a15]" />
                  </div>
                ))}
                <span className="sr-only">Carregando NFTs...</span>
              </div>
            ) : isError ? (
              <div
                role="alert"
                className="rounded-xl border border-[#6d3d2e] bg-[#2b1a15] p-6"
              >
                <p>Não foi possível carregar os NFTs.</p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="mt-4 rounded-md bg-[#d8924c] px-4 py-2 font-bold text-[#150e0b]"
                >
                  Tentar novamente
                </button>
              </div>
            ) : data.data.length === 0 ? (
              <div className="rounded-xl bg-[#2b1a15] p-6 text-center">
                <p className="text-[#b99b80]">
                  Nenhum NFT encontrado para esses filtros.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-sm font-bold text-[#d8924c] underline"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3">
                {data.data.map((nft) => (
                  <NFTCard key={nft.id} nft={nft} />
                ))}
              </div>
            )}

            {!isPending && !isError && totalPages > 1 && (
              <nav
                aria-label="Paginação do catálogo"
                className="mt-10 flex items-center justify-center gap-4"
              >
                <button
                  type="button"
                  aria-label="Página anterior"
                  disabled={filters.page <= 1}
                  onClick={() => updateFilters({ page: filters.page - 1 })}
                  className="rounded-lg border border-[#493125] p-2 text-[#f0e8df] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={20} />
                </button>

                <span className="text-sm text-[#c9aa8c]">
                  Página {filters.page} de {totalPages}
                </span>

                <button
                  type="button"
                  aria-label="Próxima página"
                  disabled={filters.page >= totalPages}
                  onClick={() => updateFilters({ page: filters.page + 1 })}
                  className="rounded-lg border border-[#493125] p-2 text-[#f0e8df] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={20} />
                </button>
              </nav>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
