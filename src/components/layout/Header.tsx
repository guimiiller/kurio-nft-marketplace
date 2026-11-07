import { Link } from "@tanstack/react-router";
import { Search, ShoppingCart, LogIn } from "lucide-react";

import { defaultNFTFilters } from "../../features/nfts/types/nft-filters.types";
import { useCart } from "../../features/cart/hooks/use-cart";

export function Header() {
  const { data: cart } = useCart();

  const cartCount =
    cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

  return (
    <header className="hidden border-b border-[#39251b] bg-[#150e0b] md:block">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link
          to="/"
          search={defaultNFTFilters}
          className="text-xl font-bold tracking-widest text-[#f0e8df]"
        >
          KURIO
        </Link>

        <nav
          aria-label="Navegação principal"
          className="flex items-center gap-8"
        >
          <Link to="/" search={defaultNFTFilters} className="text-[#d8924c]">
            Início
          </Link>

          <span className="text-[#f0e8df]">Mercado</span>
          <span className="text-[#f0e8df]">Criadores</span>
          <span className="text-[#f0e8df]">Aprenda</span>
        </nav>

        <div className="flex items-center gap-5">
          <Link
            to="/"
            search={defaultNFTFilters}
            aria-label="Buscar NFTs"
            className="text-[#f0e8df] hover:text-[#d8924c]"
          >
            <Search size={19} />
          </Link>

          <Link
            to="/cart"
            aria-label={`Carrinho de NFTs, ${cartCount} itens`}
            className="relative text-[#f0e8df] hover:text-[#d8924c]"
          >
            <ShoppingCart size={19} />

            {cartCount > 0 && (
              <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d8924c] px-1 text-[10px] font-bold text-[#150e0b]">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="flex items-center gap-2 rounded bg-[#d8924c] px-4 py-2 text-sm font-bold text-[#150e0b]"
          >
            <LogIn size={16} />
            Entrar
          </button>
        </div>
      </div>
    </header>
  );
}
