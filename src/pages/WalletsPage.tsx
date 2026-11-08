import { useState } from "react";
import { Link } from "@tanstack/react-router";
import axios from "axios";
import {
  CheckCircle2,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  Star,
  Trash2,
  UserRound,
  Wallet,
  X,
} from "lucide-react";

import { useAuthSession } from "../features/auth/hooks/use-auth-session";

import {
  useCreateWallet,
  useDeleteWallet,
  useSetPrimaryWallet,
  useUpdateWallet,
  useWallets,
} from "../features/wallets/hooks/use-wallets";

import type {
  CollectorWallet,
  WalletProvider,
} from "../features/wallets/types/wallet.types";

const providerLabels: Record<WalletProvider, string> = {
  metamask: "MetaMask",
  walletconnect: "WalletConnect",
  coinbase: "Coinbase Wallet",
  other: "Outra carteira",
};

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message: unknown = error.response?.data?.message;
    if (typeof message === "string") return message;
  }

  return "Não foi possível realizar a operação.";
}

function shortAddress(address: string): string {
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

export function WalletsPage() {
  const session = useAuthSession();

  const { data: wallets, isPending, isError, refetch } = useWallets();

  const createWallet = useCreateWallet();
  const updateWallet = useUpdateWallet();
  const setPrimary = useSetPrimaryWallet();
  const deleteWallet = useDeleteWallet();

  const [address, setAddress] = useState("");
  const [nickname, setNickname] = useState("");
  const [provider, setProvider] = useState<WalletProvider>("metamask");

  const [editingId, setEditingId] = useState<string | null>(null);

  const [editNickname, setEditNickname] = useState("");
  const [editProvider, setEditProvider] = useState<WalletProvider>("metamask");

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const busy =
    createWallet.isPending ||
    updateWallet.isPending ||
    setPrimary.isPending ||
    deleteWallet.isPending;

  function clearFeedback() {
    setError(null);
    setMessage(null);
  }

  async function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();

    try {
      await createWallet.mutateAsync({
        address,
        nickname,
        provider,
      });

      setAddress("");
      setNickname("");
      setProvider("metamask");
      setMessage("Carteira cadastrada com sucesso.");
    } catch (caught) {
      setError(getErrorMessage(caught));
    }
  }

  function startEditing(wallet: CollectorWallet) {
    clearFeedback();
    setEditingId(wallet.id);
    setEditNickname(wallet.nickname);
    setEditProvider(wallet.provider);
  }

  async function saveEdit(walletId: string) {
    clearFeedback();

    try {
      await updateWallet.mutateAsync({
        walletId,
        input: {
          nickname: editNickname,
          provider: editProvider,
        },
      });

      setEditingId(null);
      setMessage("Carteira atualizada.");
    } catch (caught) {
      setError(getErrorMessage(caught));
    }
  }

  async function makePrimary(walletId: string) {
    clearFeedback();

    try {
      await setPrimary.mutateAsync(walletId);
      setMessage("Carteira principal atualizada.");
    } catch (caught) {
      setError(getErrorMessage(caught));
    }
  }

  async function removeWallet(wallet: CollectorWallet) {
    const confirmed = window.confirm(
      `Deseja remover a carteira "${wallet.nickname}"?`,
    );

    if (!confirmed) return;

    clearFeedback();

    try {
      await deleteWallet.mutateAsync(wallet.id);
      setEditingId(null);
      setMessage("Carteira removida.");
    } catch (caught) {
      setError(getErrorMessage(caught));
    }
  }

  if (!session) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center text-[#f0e8df]">
        <Wallet size={42} className="mx-auto text-[#d8924c]" />
        <h1 className="mt-5 text-2xl font-bold">
          Entre para gerenciar suas carteiras
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
        <h1 className="text-3xl font-bold">Minhas carteiras</h1>
        <p className="mt-2 text-sm text-[#b99b80]">
          Organize os endereços da sua coleção.
        </p>

        <div className="mt-8 grid gap-7 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-[#493125] bg-[#241710] p-4">
            <Link
              to="/profile"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-[#b99b80] hover:bg-[#38251b]"
            >
              <UserRound size={19} />
              Meu perfil
            </Link>

            <Link
              to="/wallets"
              className="mt-2 flex items-center gap-3 rounded-lg bg-[#38251b] px-4 py-3 font-semibold text-[#d8924c]"
            >
              <Wallet size={19} />
              Minhas carteiras
            </Link>
          </aside>

          <div className="space-y-7">
            <section className="rounded-2xl border border-[#493125] bg-[#241710] p-5 sm:p-8">
              <div className="flex items-center gap-3">
                <Wallet size={23} className="text-[#d8924c]" />
                <h2 className="text-xl font-bold">Carteiras cadastradas</h2>
              </div>

              {isPending ? (
                <p role="status" className="mt-6 text-[#b99b80]">
                  Carregando carteiras...
                </p>
              ) : isError ? (
                <div className="mt-6">
                  <p role="alert" className="text-red-300">
                    Não foi possível carregar as carteiras.
                  </p>
                  <button
                    type="button"
                    onClick={() => void refetch()}
                    className="mt-3 text-[#d8924c]"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : !wallets?.length ? (
                <div className="mt-6 rounded-xl border border-dashed border-[#493125] p-8 text-center">
                  <Wallet size={34} className="mx-auto text-[#d8924c]" />
                  <p className="mt-3 font-semibold">
                    Nenhuma carteira cadastrada
                  </p>
                  <p className="mt-2 text-sm text-[#b99b80]">
                    Adicione sua primeira carteira abaixo.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {wallets.map((wallet) => (
                    <article
                      key={wallet.id}
                      className={`rounded-xl border p-5 ${
                        wallet.isPrimary
                          ? "border-[#d8924c] bg-[#352119]"
                          : "border-[#493125] bg-[#1c120e]"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold">{wallet.nickname}</h3>

                            {wallet.isPrimary && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#493125] px-2 py-1 text-xs text-[#d8924c]">
                                <Star size={12} />
                                Principal
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-sm text-[#b99b80]">
                            {providerLabels[wallet.provider]}
                          </p>

                          <p
                            className="mt-2 break-all font-mono text-xs text-[#c9aa8c]"
                            title={wallet.address}
                          >
                            <span className="sm:hidden">
                              {shortAddress(wallet.address)}
                            </span>
                            <span className="hidden sm:inline">
                              {wallet.address}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => startEditing(wallet)}
                            aria-label={`Editar ${wallet.nickname}`}
                            className="rounded-lg border border-[#493125] p-2 text-[#d8924c] disabled:opacity-50"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void removeWallet(wallet)}
                            aria-label={`Remover ${wallet.nickname}`}
                            className="rounded-lg border border-[#493125] p-2 text-red-300 disabled:opacity-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>

                      {!wallet.isPrimary && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void makePrimary(wallet.id)}
                          className="mt-4 flex items-center gap-2 text-sm text-[#d8924c] disabled:opacity-50"
                        >
                          <Star size={15} />
                          Definir como principal
                        </button>
                      )}

                      {editingId === wallet.id && (
                        <div className="mt-5 space-y-3 border-t border-[#493125] pt-5">
                          <input
                            aria-label="Editar apelido"
                            value={editNickname}
                            onChange={(event) =>
                              setEditNickname(event.target.value)
                            }
                            className="w-full rounded-lg border border-[#493125] bg-[#150e0b] px-4 py-3 outline-none focus:border-[#d8924c]"
                          />

                          <select
                            aria-label="Editar provedor"
                            value={editProvider}
                            onChange={(event) =>
                              setEditProvider(
                                event.target.value as WalletProvider,
                              )
                            }
                            className="w-full rounded-lg border border-[#493125] bg-[#150e0b] px-4 py-3"
                          >
                            {Object.entries(providerLabels).map(
                              ([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ),
                            )}
                          </select>

                          <div className="flex gap-3">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void saveEdit(wallet.id)}
                              className="flex items-center gap-2 rounded-lg bg-[#d8924c] px-4 py-2 font-bold text-[#150e0b] disabled:opacity-50"
                            >
                              <Save size={16} />
                              Salvar
                            </button>

                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => setEditingId(null)}
                              className="flex items-center gap-2 rounded-lg border border-[#493125] px-4 py-2"
                            >
                              <X size={16} />
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-[#493125] bg-[#241710] p-5 sm:p-8">
              <div className="flex items-center gap-3">
                <Plus size={23} className="text-[#d8924c]" />
                <h2 className="text-xl font-bold">Adicionar carteira</h2>
              </div>

              <form
                onSubmit={(event) => void add(event)}
                className="mt-6 space-y-5"
              >
                <label className="block text-sm">
                  <span className="mb-2 block text-[#c9aa8c]">Apelido</span>
                  <input
                    required
                    minLength={2}
                    maxLength={50}
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                    placeholder="Minha carteira"
                    className="w-full rounded-lg border border-[#493125] bg-[#150e0b] px-4 py-3 outline-none focus:border-[#d8924c]"
                  />
                </label>

                <label className="block text-sm">
                  <span className="mb-2 block text-[#c9aa8c]">Provedor</span>
                  <select
                    value={provider}
                    onChange={(event) =>
                      setProvider(event.target.value as WalletProvider)
                    }
                    className="w-full rounded-lg border border-[#493125] bg-[#150e0b] px-4 py-3"
                  >
                    {Object.entries(providerLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm">
                  <span className="mb-2 block text-[#c9aa8c]">
                    Endereço Ethereum
                  </span>
                  <input
                    required
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="0x..."
                    spellCheck={false}
                    className="w-full rounded-lg border border-[#493125] bg-[#150e0b] px-4 py-3 font-mono text-sm outline-none focus:border-[#d8924c]"
                  />
                </label>

                <p className="flex items-start gap-2 text-xs leading-5 text-[#b99b80]">
                  <ShieldCheck
                    size={16}
                    className="mt-0.5 shrink-0 text-[#d8924c]"
                  />
                  Cadastro demonstrativo. Não conectamos a carteira nem
                  solicitamos chaves privadas.
                </p>

                <button
                  type="submit"
                  disabled={busy}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#d8924c] px-6 py-3 font-bold text-[#150e0b] disabled:opacity-50"
                >
                  <Plus size={18} />
                  {createWallet.isPending
                    ? "Adicionando..."
                    : "Adicionar carteira"}
                </button>
              </form>
            </section>

            {message && (
              <p
                role="status"
                className="flex items-center gap-2 rounded-lg border border-green-900 bg-green-950/20 p-4 text-sm text-green-300"
              >
                <CheckCircle2 size={18} />
                {message}
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-700 bg-red-950/30 p-4 text-sm text-red-200"
              >
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
