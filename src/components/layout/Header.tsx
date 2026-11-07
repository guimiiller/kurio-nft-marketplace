import { Link } from "@tanstack/react-router";
import { Search, ShoppingCart, LogIn } from "lucide-react";

export function Header() {
  return (
    <header className="hidden border-b border-[#39251b] bg-[#150e0b] md:block">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link
          to="/"
          className="text-xl font-bold tracking-widest text-[#f0e8df]"
        >
          KURIO
        </Link>

        <nav
          aria-label="Navegação principal"
          className="flex items-center gap-8"
        >
          <Link to="/" className="text-[#d8924c]">
            Início
          </Link>

          <span className="text-[#f0e8df]">Mercado</span>
          <span className="text-[#f0e8df]">Criadores</span>
          <span className="text-[#f0e8df]">Aprenda</span>
        </nav>

        <div className="flex items-center gap-5">
          <button type="button" aria-label="Buscar NFTs">
            <Search size={19} />
          </button>

          <span aria-label="Carrinho de NFTs">
            <ShoppingCart size={19} />
          </span>

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
