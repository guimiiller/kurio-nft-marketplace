import { useNFTs } from "../features/nfts/hooks/use-nfts";

export function HomePage() {
  const { data, isPending, isError, refetch } = useNFTs();

  if (isPending) {
    return (
      <main className="min-h-screen p-10 text-white">Carregando NFTs...</main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen p-10 text-white">
        <p>Erro ao carregar NFTs.</p>

        <button
          onClick={() => void refetch()}
          className="mt-4 rounded bg-[#d8924c] px-4 py-2 text-black"
        >
          Tentar novamente
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#150e0b] p-10 text-white">
      <h1 className="mb-8 text-4xl font-bold text-[#d8924c]">KURIO</h1>

      <h2 className="mb-6 text-2xl font-bold">Catálogo de NFTs</h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.data.map((nft) => (
          <article key={nft.id} className="rounded-xl bg-[#2b1a15] p-4">
            <h3 className="text-lg font-bold">{nft.name}</h3>

            <p className="mt-2 text-[#d8924c]">{nft.price} ETH</p>

            <p className="mt-2 text-sm text-gray-400">Rede: {nft.network}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
