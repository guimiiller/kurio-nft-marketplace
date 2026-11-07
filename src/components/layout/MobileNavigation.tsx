import { Link } from "@tanstack/react-router";
import { Heart, Home, ShoppingCart, UserRound } from "lucide-react";

export function MobileNavigation() {
  return (
    <nav
      aria-label="Navegação mobile"
      className="fixed inset-x-0 bottom-0 z-50 flex h-18 items-center justify-around rounded-t-3xl border-t border-[#39251b] bg-[#2b1a15] pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <Link to="/" aria-label="Início" className="text-[#d8924c]">
        <Home size={23} />
      </Link>

      <span aria-label="Favoritos" className="text-[#f0e8df]">
        <Heart size={23} />
      </span>

      <span aria-label="Carrinho" className="text-[#f0e8df]">
        <ShoppingCart size={23} />
      </span>

      <span aria-label="Perfil" className="text-[#f0e8df]">
        <UserRound size={23} />
      </span>
    </nav>
  );
}
