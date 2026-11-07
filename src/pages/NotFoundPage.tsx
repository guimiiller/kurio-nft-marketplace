import { Link } from "@tanstack/react-router";

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>

      <p>Página não encontrada.</p>

      <Link to="/" className="text-[#d8924c] underline">
        Voltar para o início
      </Link>
    </main>
  );
}
