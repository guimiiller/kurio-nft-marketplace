import { useNFTs } from "../features/nfts/hooks/use-nfts";
import { NFTCard } from "../features/nfts/components/NFTCard";
import { Search, SlidersHorizontal, ArrowRight } from "lucide-react";

export function HomePage() {
  const { data, isPending, isError, refetch } = useNFTs();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 md:px-6 md:pt-8">
      {/* Busca mobile */}
      <div className="mb-5 flex gap-3 md:hidden">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-[#2b1a15] px-4 py-3 text-[#d8924c]">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Buscar NFTs</span>
          <input
            type="search"
            placeholder="Explorar coleções"
            className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-[#b99b80]"
          />
        </label>

        <button
          type="button"
          aria-label="Abrir filtros"
          className="rounded-xl bg-[#d8924c] p-3 text-[#150e0b]"
          disabled
          title="Filtros em desenvolvimento"
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>

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

        <div className="overflow-hidden rounded-2xl ">
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
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
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
            <p className="text-xs text-[#b99b80]">
              {data.total} NFTs encontrados
            </p>
          )}
        </div>

        {isPending ? (
          <div
            role="status"
            aria-label="Carregando catálogo de NFTs"
            className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
          >
            {Array.from({ length: 8 }).map((_, index) => (
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
          <p className="rounded-xl bg-[#2b1a15] p-6 text-[#b99b80]">
            Nenhum NFT encontrado.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {data.data.map((nft) => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
