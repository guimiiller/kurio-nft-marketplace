import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAuthSession } from "../../auth/hooks/use-auth-session";
import type { NFT } from "../../nfts/types/nft.types";
import type {
  NFTUpdatedEvent,
  OrderUpdatedEvent,
} from "../types/realtime.types";

function isNFT(value: unknown): value is NFT {
  if (!value || typeof value !== "object") {
    return false;
  }

  const nft = value as Partial<NFT>;

  return (
    typeof nft.id === "string" &&
    typeof nft.name === "string" &&
    typeof nft.price === "string" &&
    typeof nft.image === "string" &&
    typeof nft.category === "string" &&
    typeof nft.network === "string" &&
    typeof nft.available === "number" &&
    Number.isInteger(nft.version) &&
    (nft.version ?? -1) >= 0
  );
}

function isNFTUpdatedEvent(value: unknown): value is NFTUpdatedEvent {
  if (!value || typeof value !== "object") {
    return false;
  }

  return isNFT((value as Partial<NFTUpdatedEvent>).nft);
}

function isOrderUpdatedEvent(value: unknown): value is OrderUpdatedEvent {
  if (!value || typeof value !== "object") {
    return false;
  }

  const event = value as Partial<OrderUpdatedEvent>;

  return (
    typeof event.orderId === "string" &&
    typeof event.userId === "string" &&
    typeof event.version === "number" &&
    Number.isInteger(event.version) &&
    event.version >= 0
  );
}

export function useRealtime() {
  const queryClient = useQueryClient();
  const session = useAuthSession();

  const userId = session?.userId;

  useEffect(() => {
    if (import.meta.env.VITE_ENABLE_MOCKS !== "true") {
      return;
    }

    let disposed = false;
    let connectedBefore = false;

    let cleanupSocket: (() => void) | undefined;

    function synchronize() {
      void queryClient.invalidateQueries({
        queryKey: ["nfts"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["nft"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["orders"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    }

    function handleNFTUpdated(payload: unknown) {
      if (!isNFTUpdatedEvent(payload)) {
        return;
      }

      const incoming = payload.nft;

      const current = queryClient.getQueryData<NFT>(["nft", incoming.id]);

      if (current && incoming.version <= current.version) {
        return;
      }

      if (current) {
        queryClient.setQueryData<NFT>(["nft", incoming.id], incoming);
      }

      void queryClient.invalidateQueries({
        queryKey: ["nfts"],
      });

      if (!current) {
        void queryClient.invalidateQueries({
          queryKey: ["nft", incoming.id],
        });
      }
    }

    function handleOrderUpdated(payload: unknown) {
      if (!isOrderUpdatedEvent(payload)) {
        return;
      }

      if (!userId || payload.userId !== userId) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: ["orders", userId, payload.orderId],
      });
    }

    async function connectRealtime() {
      try {
        console.info("[KURIO] Carregando Socket.IO dinamicamente...");

        const { io } = await import("socket.io-client");

        if (disposed) {
          return;
        }

        console.info("[KURIO] Criando conexão após inicialização do MSW...");

        const socket = io(window.location.origin, {
          path: "/socket.io/",
          transports: ["websocket"],
          forceNew: true,
          autoConnect: false,
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 10000,
        });

        function handleConnect() {
          if (connectedBefore) {
            synchronize();
          }

          connectedBefore = true;

          console.info("[KURIO] Socket.IO conectado:", socket.id);
        }

        function handleConnectError(error: Error) {
          console.warn("[KURIO] Socket.IO:", error.message);
        }

        socket.on("connect", handleConnect);
        socket.on("connect_error", handleConnectError);

        socket.on("nft.updated", handleNFTUpdated);
        socket.on("order.updated", handleOrderUpdated);

        cleanupSocket = () => {
          socket.removeAllListeners();
          socket.disconnect();
        };

        if (disposed) {
          cleanupSocket();
          return;
        }

        socket.connect();
      } catch (error) {
        if (!disposed) {
          console.error("[KURIO] Falha ao inicializar realtime:", error);
        }
      }
    }

    void connectRealtime();

    return () => {
      disposed = true;
      cleanupSocket?.();
    };
  }, [queryClient, userId]);
}
