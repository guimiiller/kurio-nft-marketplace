import { Link } from "@tanstack/react-router";

import { FavoriteButton } from "../../../components/favorites/FavoriteButton";
import type { NFT } from "../types/nft.types";

interface NFTCardProps {
  nft: NFT;
}

export function NFTCard({ nft }: NFTCardProps) {
  return (
    <article className="group min-w-0">
      <div className="relative">
        <Link
          to="/nft/$nftId"
          params={{ nftId: nft.id }}
          className="block overflow-hidden rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#d8924c]"
        >
          <div className="aspect-square overflow-hidden bg-[#2b1a15]">
            <img
              src={nft.image}
              alt={`Arte digital ${nft.name}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none"
            />
          </div>
        </Link>

        <div className="absolute right-3 top-3 z-10">
          <FavoriteButton
            nftId={nft.id}
            className="h-10! w-10! rounded-full! border-0! bg-[#352119]! p-0! hover:bg-[#493125]!"
          />
        </div>
      </div>

      <Link
        to="/nft/$nftId"
        params={{ nftId: nft.id }}
        className="mt-3 block space-y-1 rounded outline-none focus-visible:ring-2 focus-visible:ring-[#d8924c]"
      >
        <h3 className="truncate text-sm font-medium text-[#f0e8df] group-hover:text-[#d8924c]">
          {nft.name}
        </h3>

        <p className="text-base font-bold text-[#d8924c]">{nft.price} ETH</p>
      </Link>
    </article>
  );
}
