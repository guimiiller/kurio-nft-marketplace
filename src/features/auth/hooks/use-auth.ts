import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getCurrentUser, login, logout, signup } from "../api/auth.api";

import { clearSession, saveSession } from "../lib/session";

import { notifyAuthSessionChanged, useAuthSession } from "./use-auth-session";

import type {
  AuthResponse,
  LoginInput,
  SignupInput,
} from "../types/auth.types";

export const authQueryKeys = {
  currentUser: ["auth", "current-user"] as const,
};

function persistAuthentication(response: AuthResponse): void {
  saveSession({
    accessToken: response.accessToken,
    userId: response.user.id,
    expiresAt: response.expiresAt,
  });

  notifyAuthSessionChanged();
}

export function useCurrentUser() {
  const session = useAuthSession();

  return useQuery({
    queryKey: [...authQueryKeys.currentUser, session?.userId ?? "guest"],
    queryFn: getCurrentUser,
    enabled: Boolean(session),
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),

    onSuccess: (response) => {
      queryClient.clear();
      persistAuthentication(response);

      queryClient.setQueryData(
        [...authQueryKeys.currentUser, response.user.id],
        response.user,
      );
    },
  });
}

export function useSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SignupInput) => signup(input),

    onSuccess: (response) => {
      queryClient.clear();
      persistAuthentication(response);

      queryClient.setQueryData(
        [...authQueryKeys.currentUser, response.user.id],
        response.user,
      );
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,

    onSettled: () => {
      clearSession();
      queryClient.clear();
      notifyAuthSessionChanged();
    },
  });
}
