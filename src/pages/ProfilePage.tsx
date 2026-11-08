import { useState } from "react";
import { Link } from "@tanstack/react-router";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Save,
  UserRound,
  Wallet,
} from "lucide-react";

import { useAuthSession } from "../features/auth/hooks/use-auth-session";

import {
  useCollectorProfile,
  useUpdateCollectorProfile,
} from "../features/profile/hooks/use-profile";

import type { UpdateCollectorProfileInput } from "../features/profile/types/profile.types";

import { defaultNFTFilters } from "../features/nfts/types/nft-filters.types";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message: unknown = error.response?.data?.message;

    if (typeof message === "string") {
      return message;
    }
  }

  return "Não foi possível salvar o perfil.";
}

const emptyForm: UpdateCollectorProfileInput = {
  name: "",
  username: "",
  email: "",
  ens: "",
  walletNickname: "",
};

export function ProfilePage() {
  const session = useAuthSession();

  const { data: profile, isPending, isError, refetch } = useCollectorProfile();

  const updateProfile = useUpdateCollectorProfile();

  const [formState, setFormState] = useState<{
    source: typeof profile;
    values: UpdateCollectorProfileInput;
  }>({ source: profile, values: profile ? {
    name: profile.name,
    username: profile.username,
    email: profile.email,
    ens: profile.ens,
    walletNickname: profile.walletNickname,
  } : emptyForm });

  const form = formState.source === profile
    ? formState.values
    : profile
      ? {
          name: profile.name,
          username: profile.username,
          email: profile.email,
          ens: profile.ens,
          walletNickname: profile.walletNickname,
        }
      : emptyForm;

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function change(field: keyof UpdateCollectorProfileInput, value: string) {
    setMessage(null);
    setError(null);

    setFormState({
      source: profile,
      values: { ...form, [field]: value },
    });
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage(null);
    setError(null);

    try {
      await updateProfile.mutateAsync(form);
      setMessage("Perfil atualizado com sucesso!");
    } catch (caught) {
      setError(getErrorMessage(caught));
    }
  }

  if (!session) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center text-[#f0e8df]">
        <UserRound size={42} className="mx-auto text-[#d8924c]" />

        <h1 className="mt-5 text-2xl font-bold">
          Entre para acessar seu perfil
        </h1>

        <Link
          to="/login"
          className="mt-6 inline-block rounded-lg bg-[#d8924c] px-6 py-3 font-bold text-[#150e0b]"
        >
          Entrar
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#150e0b] px-4 py-10 text-[#f0e8df] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          search={defaultNFTFilters}
          className="inline-flex items-center gap-2 text-sm text-[#b99b80] hover:text-[#d8924c]"
        >
          <ArrowLeft size={16} />
          Voltar ao mercado
        </Link>

        <div className="mt-8">
          <h1 className="text-3xl font-bold">Minha conta</h1>

          <p className="mt-2 text-sm text-[#b99b80]">
            Gerencie suas informações de colecionador.
          </p>
        </div>

        <div className="mt-8 grid gap-7 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-[#493125] bg-[#241710] p-4">
            <Link
              to="/profile"
              className="flex items-center gap-3 rounded-lg bg-[#38251b] px-4 py-3 font-semibold text-[#d8924c]"
            >
              <UserRound size={19} />
              Meu perfil
            </Link>

            <Link
              to="/wallets"
              className="mt-2 flex items-center gap-3 rounded-lg px-4 py-3 text-[#b99b80] hover:bg-[#38251b] hover:text-[#f0e8df]"
            >
              <Wallet size={19} />
              Minhas carteiras
            </Link>
          </aside>

          <section className="rounded-2xl border border-[#493125] bg-[#241710] p-5 sm:p-8">
            <div className="flex items-center gap-3">
              <UserRound size={23} className="text-[#d8924c]" />

              <h2 className="text-xl font-bold">Informações pessoais</h2>
            </div>

            {isPending ? (
              <p role="status" className="mt-8 text-[#b99b80]">
                Carregando perfil...
              </p>
            ) : isError || !profile ? (
              <div className="mt-8">
                <p role="alert" className="text-red-300">
                  Não foi possível carregar o perfil.
                </p>

                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="mt-4 flex items-center gap-2 text-[#d8924c]"
                >
                  <RefreshCw size={16} />
                  Tentar novamente
                </button>
              </div>
            ) : (
              <form onSubmit={(event) => void save(event)} className="mt-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-2 block text-[#c9aa8c]">
                      Nome completo
                    </span>

                    <input
                      required
                      minLength={2}
                      maxLength={100}
                      value={form.name}
                      onChange={(event) => change("name", event.target.value)}
                      className="w-full rounded-lg border border-[#493125] bg-[#150e0b] px-4 py-3 outline-none focus:border-[#d8924c]"
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="mb-2 block text-[#c9aa8c]">Username</span>

                    <input
                      required
                      minLength={3}
                      maxLength={30}
                      value={form.username}
                      onChange={(event) =>
                        change("username", event.target.value)
                      }
                      className="w-full rounded-lg border border-[#493125] bg-[#150e0b] px-4 py-3 outline-none focus:border-[#d8924c]"
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="mb-2 block text-[#c9aa8c]">E-mail</span>

                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(event) => change("email", event.target.value)}
                      className="w-full rounded-lg border border-[#493125] bg-[#150e0b] px-4 py-3 outline-none focus:border-[#d8924c]"
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="mb-2 block text-[#c9aa8c]">
                      ENS (opcional)
                    </span>

                    <input
                      placeholder="colecionador.eth"
                      value={form.ens}
                      onChange={(event) => change("ens", event.target.value)}
                      className="w-full rounded-lg border border-[#493125] bg-[#150e0b] px-4 py-3 outline-none focus:border-[#d8924c]"
                    />
                  </label>

                  <label className="block text-sm sm:col-span-2">
                    <span className="mb-2 block text-[#c9aa8c]">
                      Apelido da carteira
                    </span>

                    <input
                      maxLength={50}
                      placeholder="Minha carteira principal"
                      value={form.walletNickname}
                      onChange={(event) =>
                        change("walletNickname", event.target.value)
                      }
                      className="w-full rounded-lg border border-[#493125] bg-[#150e0b] px-4 py-3 outline-none focus:border-[#d8924c]"
                    />
                  </label>
                </div>

                {message && (
                  <p
                    role="status"
                    className="mt-6 flex items-center gap-2 text-sm text-green-300"
                  >
                    <CheckCircle2 size={17} />
                    {message}
                  </p>
                )}

                {error && (
                  <p
                    role="alert"
                    className="mt-6 rounded-lg border border-red-700 bg-red-950/30 p-4 text-sm text-red-200"
                  >
                    {error}
                  </p>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    type="submit"
                    disabled={updateProfile.isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#d8924c] px-6 py-3 font-bold text-[#150e0b] disabled:opacity-50"
                  >
                    <Save size={18} />

                    {updateProfile.isPending
                      ? "Salvando..."
                      : "Salvar alterações"}
                  </button>

                  <Link
                    to="/wallets"
                    className="text-sm text-[#d8924c] hover:underline"
                  >
                    Gerenciar carteiras
                  </Link>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
