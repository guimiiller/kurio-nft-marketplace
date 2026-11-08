import type {
  NFTUpdatedEvent,
  OrderUpdatedEvent,
} from "../../features/realtime/types/realtime.types";

type RealtimeEvent =
  | ["nft.updated", NFTUpdatedEvent]
  | ["order.updated", OrderUpdatedEvent];

type Listener = (event: RealtimeEvent) => void;

const listeners = new Set<Listener>();

export function subscribeToMockRealtime(listener: Listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function emitMockNFTUpdated(event: NFTUpdatedEvent) {
  for (const listener of listeners) {
    listener(["nft.updated", event]);
  }
}

export function emitMockOrderUpdated(event: OrderUpdatedEvent) {
  for (const listener of listeners) {
    listener(["order.updated", event]);
  }
}

if (import.meta.env.DEV) {
  Object.assign(window, {
    __kurioRealtime: {
      emitNFTUpdated: emitMockNFTUpdated,
      emitOrderUpdated: emitMockOrderUpdated,
      listenerCount: () => listeners.size,
    },
  });
}
