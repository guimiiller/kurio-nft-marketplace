import axios from "axios";

import { getSession } from "../../features/auth/lib/session";

export const api = axios.create({
  baseURL: "/api",
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const session = getSession();

  if (session) {
    config.headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  return config;
});
