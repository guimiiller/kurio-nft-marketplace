import { api } from "../../../lib/api/client";

import type {
  AuthResponse,
  AuthUser,
  LoginInput,
  SignupInput,
} from "../types/auth.types";

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", input);

  return data;
}

export async function signup(input: SignupInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/signup", input);

  return data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>("/auth/me");

  return data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
