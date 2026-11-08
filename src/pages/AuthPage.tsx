import { useState, type FormEvent } from "react";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import axios from "axios";
import { ArrowLeft, Eye, EyeOff, X } from "lucide-react";

import { useLogin, useSignup } from "../features/auth/hooks/use-auth";
import { defaultNFTFilters } from "../features/nfts/types/nft-filters.types";

interface AuthPageProps {
  mode: "login" | "signup";
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message: unknown = error.response?.data?.message;

    if (typeof message === "string") return message;
  }

  return "Não foi possível concluir a operação. Tente novamente.";
}

export function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate();
  const router = useRouter();

  const loginMutation = useLogin();
  const signupMutation = useSignup();

  const isSignup = mode === "signup";
  const isPending = loginMutation.isPending || signupMutation.isPending;

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    setError(null);

    try {
      if (isSignup) {
        await signupMutation.mutateAsync({
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
        });
      } else {
        await loginMutation.mutateAsync({
          email: email.trim(),
          password,
        });
      }

      await router.invalidate();
      await navigate({
        to: "/",
        search: defaultNFTFilters,
      });
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    }
  }

  const inputClass =
    "w-full rounded-lg border border-[#493125] bg-[#150e0b] px-4 py-3 outline-none transition-colors focus:border-[#d8924c]";

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#150e0b] px-4 py-6 text-[#f0e8df] md:fixed md:inset-0 md:z-50 md:flex md:min-h-0 md:items-center md:justify-center md:overflow-y-auto md:bg-black/75 md:px-6 md:py-6">
      <div
        className={`mx-auto w-full max-w-md rounded-2xl border border-[#493125] bg-[#241710] px-5 shadow-2xl sm:px-8 ${
          isSignup ? "py-5 md:py-6" : "py-7"
        }`}
      >
        <div className="relative mb-5 flex min-h-9 items-center justify-center">
          <Link
            to="/"
            search={defaultNFTFilters}
            aria-label="Voltar ao mercado"
            className="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full text-[#d8924c] hover:bg-[#352119] md:hidden"
          >
            <ArrowLeft size={22} />
          </Link>

          <span className="text-xl font-black tracking-[0.3em] text-[#d8924c]">
            KURIO
          </span>

          <Link
            to="/"
            search={defaultNFTFilters}
            aria-label="Fechar"
            className="absolute right-0 hidden h-9 w-9 items-center justify-center rounded-full text-[#d8924c] hover:bg-[#352119] md:flex"
          >
            <X size={21} />
          </Link>
        </div>

        <h1 className="text-center text-2xl font-bold">
          {isSignup ? "Crie sua conta" : "Bem-vindo de volta"}
        </h1>

        <p className="mt-2 text-center text-sm text-[#b99b80]">
          {isSignup
            ? "Entre para o universo dos colecionáveis digitais."
            : "Acesse sua conta e continue sua coleção."}
        </p>

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className={isSignup ? "mt-5 space-y-3" : "mt-7 space-y-4"}
        >
          {isSignup && (
            <>
              <div>
                <label
                  htmlFor="auth-name"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Nome completo
                </label>
                <input
                  id="auth-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={inputClass}
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label
                  htmlFor="auth-username"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Nome de usuário
                </label>
                <input
                  id="auth-username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className={inputClass}
                  placeholder="seuusuario"
                />
              </div>
            </>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="mb-1.5 block text-sm font-medium"
            >
              E-mail
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="mb-1.5 block text-sm font-medium"
            >
              Senha
            </label>

            <div className="relative">
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
                minLength={isSignup ? 8 : undefined}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`${inputClass} pr-12`}
                placeholder="Digite sua senha"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute inset-y-0 right-3 flex items-center text-[#b99b80]"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-800 bg-red-950/30 p-3 text-sm text-red-200"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-[#d8924c] px-5 py-3 font-bold text-[#150e0b] transition-colors hover:bg-[#e6a866] disabled:cursor-wait disabled:opacity-60"
          >
            {isPending ? "Aguarde..." : isSignup ? "Criar conta" : "Entrar"}
          </button>
        </form>

        <p
          className={`text-center text-sm text-[#b99b80] ${
            isSignup ? "mt-4" : "mt-6"
          }`}
        >
          {isSignup ? "Já possui uma conta?" : "Ainda não tem conta?"}{" "}
          <Link
            to={isSignup ? "/login" : "/signup"}
            className="font-bold text-[#d8924c] hover:underline"
          >
            {isSignup ? "Entrar" : "Cadastre-se"}
          </Link>
        </p>

        <p
          className={`text-center text-xs leading-5 text-[#8f7a6b] ${
            isSignup ? "mt-3" : "mt-6"
          }`}
        >
          Ambiente demonstrativo. Não utilize senhas reais.
        </p>
      </div>
    </main>
  );
}
