import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Heart,
  LogIn,
  LogOut,
  Search,
  ShoppingCart,
  UserRound,
  Wallet,
} from "lucide-react";

import { defaultNFTFilters } from "../../features/nfts/types/nft-filters.types";
import { useCurrentUser, useLogout } from "../../features/auth/hooks/use-auth";
import { useAuthSession } from "../../features/auth/hooks/use-auth-session";
import { useCart } from "../../features/cart/hooks/use-cart";

export function Header() {
  const session = useAuthSession();
  const { data: user } = useCurrentUser();
  const { data: cart } = useCart();
  const logout = useLogout();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const cartCount =
    cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  async function handleLogout() {
    setMenuOpen(false);

    try {
      await logout.mutateAsync();
      window.location.assign("/");
    } catch {
      // A sessão permanece ativa se a operação falhar.
    }
  }

  const menuLinkClass =
    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-[#f0e8df] transition-colors hover:bg-[#352119] hover:text-[#d8924c]";

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

          <Link
            to="/"
            search={defaultNFTFilters}
            hash="catalogo"
            className="text-[#f0e8df] hover:text-[#d8924c]"
          >
            Mercado
          </Link>

          <span className="text-[#f0e8df]">Criadores</span>
          <span className="text-[#f0e8df]">Aprenda</span>
        </nav>

        <div className="flex items-center gap-5">
          <Link
            to="/"
            search={defaultNFTFilters}
            hash="catalogo"
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

          {session && user ? (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
                aria-expanded={menuOpen}
                aria-haspopup="true"
                aria-controls="kurio-account-menu"
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-[#f0e8df] transition-colors hover:bg-[#241710] hover:text-[#d8924c]"
              >
                <UserRound size={18} />

                <span className="max-w-28 truncate">
                  {user.name.split(" ")[0]}
                </span>

                <ChevronDown
                  size={15}
                  className={`transition-transform ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {menuOpen && (
                <div
                  id="kurio-account-menu"
                  className="absolute right-0 top-full z-50 mt-3 w-64 rounded-xl border border-[#493125] bg-[#241710] p-2 shadow-2xl"
                >
                  <div className="border-b border-[#493125] px-3 py-3">
                    <p className="truncate text-sm font-bold text-[#f0e8df]">
                      {user.name}
                    </p>

                    <p className="mt-1 truncate text-xs text-[#b99b80]">
                      {user.email}
                    </p>
                  </div>

                  <nav aria-label="Menu da conta" className="space-y-1 py-2">
                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className={menuLinkClass}
                    >
                      <UserRound size={18} />
                      Meu perfil
                    </Link>

                    <Link
                      to="/wallets"
                      onClick={() => setMenuOpen(false)}
                      className={menuLinkClass}
                    >
                      <Wallet size={18} />
                      Minhas carteiras
                    </Link>

                    <Link
                      to="/favorites"
                      onClick={() => setMenuOpen(false)}
                      className={menuLinkClass}
                    >
                      <Heart size={18} />
                      Meus favoritos
                    </Link>
                  </nav>

                  <div className="border-t border-[#493125] pt-2">
                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      disabled={logout.isPending}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-[#d8924c] hover:bg-[#352119] disabled:opacity-50"
                    >
                      <LogOut size={18} />
                      {logout.isPending ? "Saindo..." : "Sair da conta"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded bg-[#d8924c] px-4 py-2 text-sm font-bold text-[#150e0b]"
            >
              <LogIn size={16} />
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
