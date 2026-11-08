import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Home, ShoppingCart, UserRound } from "lucide-react";

import { defaultNFTFilters } from "../../features/nfts/types/nft-filters.types";
import { useAuthSession } from "../../features/auth/hooks/use-auth-session";
import { useCart } from "../../features/cart/hooks/use-cart";

export function MobileNavigation() {
  const session = useAuthSession();
  const { data: cart } = useCart();

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const cartCount =
    cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

  const activeClass = "text-[#d8924c]";
  const inactiveClass = "text-[#f0e8df]";

  const homeActive = pathname === "/";
  const favoritesActive = pathname === "/favorites";
  const cartActive = pathname === "/cart" || pathname === "/checkout";
  const profileActive = pathname === "/profile" || pathname === "/wallets";

  return (
    <nav
      aria-label="Navegação mobile"
      className="fixed inset-x-0 bottom-0 z-50 flex h-18 items-center justify-around rounded-t-3xl border-t border-[#39251b] bg-[#2b1a15] pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <Link
        to="/"
        search={defaultNFTFilters}
        aria-label="Início"
        aria-current={homeActive ? "page" : undefined}
        className={homeActive ? activeClass : inactiveClass}
      >
        <Home size={23} />
      </Link>

      <Link
        to={session ? "/favorites" : "/login"}
        aria-label="Meus favoritos"
        aria-current={favoritesActive ? "page" : undefined}
        className={favoritesActive ? activeClass : inactiveClass}
      >
        <Heart size={23} fill={favoritesActive ? "currentColor" : "none"} />
      </Link>

      <Link
        to="/cart"
        aria-label={`Carrinho, ${cartCount} itens`}
        aria-current={cartActive ? "page" : undefined}
        className={`relative ${cartActive ? activeClass : inactiveClass}`}
      >
        <ShoppingCart size={23} />

        {cartCount > 0 && (
          <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d8924c] px-1 text-[10px] font-bold text-[#150e0b]">
            {cartCount}
          </span>
        )}
      </Link>

      <Link
        to={session ? "/profile" : "/login"}
        aria-label={session ? "Meu perfil" : "Entrar"}
        aria-current={profileActive ? "page" : undefined}
        className={profileActive ? activeClass : inactiveClass}
      >
        <UserRound size={23} />
      </Link>
    </nav>
  );
}
