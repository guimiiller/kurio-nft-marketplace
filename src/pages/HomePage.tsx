import { Link } from "@tanstack/react-router";

export function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#150e0b]">
      <h1 className="text-5xl font-bold text-[#d8924c]">KURIO</h1>

      <p className="mt-4 text-[#f0e8df]">NFT Marketplace</p>

      <Link
        to="/"
        className="mt-6 rounded-md bg-[#d8924c] px-6 py-3 font-bold text-[#150e0b]"
      >
        Explorar NFTs
      </Link>
    </main>
  );
}
