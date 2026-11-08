import { useSyncExternalStore } from "react";

import { getSession, type AuthSession } from "../lib/session";

const AUTH_SESSION_EVENT = "kurio:auth:changed";

let cachedRaw: string | null = null;
let cachedSession: AuthSession | null = null;

function getSnapshot(): AuthSession | null {
  const raw = sessionStorage.getItem("kurio:auth:session");

  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSession = getSession();
  }

  return cachedSession;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(AUTH_SESSION_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(AUTH_SESSION_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function notifyAuthSessionChanged(): void {
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function useAuthSession(): AuthSession | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
