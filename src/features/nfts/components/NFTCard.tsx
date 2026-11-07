import type { NFT } from "../types/nft.types";

interface NFTCardProps {
  nft: NFT;
}

export function NFTCard({ nft }: NFTCardProps) {
  return (
    <article className="group min-w-0">
      <div className="aspect-square overflow-hidden rounded-xl bg-[#2b1a15]">
        <img
          src={nft.image}
          alt={`Arte digital ${nft.name}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none"
        />
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="truncate text-sm font-medium text-[#f0e8df]">
          {nft.name}
        </h3>

        <p className="text-base font-bold text-[#d8924c]">{nft.price} ETH</p>
      </div>
    </article>
  );
}
