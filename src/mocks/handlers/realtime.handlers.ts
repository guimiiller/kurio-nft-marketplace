import { ws } from "msw";

import { subscribeToMockRealtime } from "../realtime/events";

const PING_INTERVAL_MS = 25_000;
const PING_TIMEOUT_MS = 20_000;

const realtimeSocket = ws.link(`${window.location.origin}/`);

export const realtimeHandlers = [
  realtimeSocket.addEventListener("connection", (connection) => {
    const client = connection.client;

    let closed = false;
    let connected = false;
    let awaitingPong = false;

    let pingInterval: ReturnType<typeof setInterval> | undefined;
    let pongTimeout: ReturnType<typeof setTimeout> | undefined;

    function cleanup() {
      if (closed) {
        return;
      }

      closed = true;
      connected = false;

      if (pingInterval !== undefined) {
        clearInterval(pingInterval);
      }

      if (pongTimeout !== undefined) {
        clearTimeout(pongTimeout);
      }

      unsubscribe();
    }

    function sendPing() {
      if (closed || !connected || awaitingPong) {
        return;
      }

      awaitingPong = true;

      try {
        client.send("2");

        pongTimeout = setTimeout(() => {
          if (!closed && awaitingPong) {
            cleanup();
            client.close();
          }
        }, PING_TIMEOUT_MS);
      } catch {
        cleanup();
      }
    }

    const unsubscribe = subscribeToMockRealtime(([eventName, payload]) => {
      if (!connected || closed) {
        return;
      }

      try {
        client.send(`42${JSON.stringify([eventName, payload])}`);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn("[KURIO] Falha ao enviar evento realtime:", error);
        }
      }
    });

    client.addEventListener("message", (event) => {
      if (closed || typeof event.data !== "string") {
        return;
      }

      const packet = event.data;

      if (packet === "40" || packet.startsWith("40{")) {
        client.send(
          `40${JSON.stringify({
            sid: crypto.randomUUID(),
          })}`,
        );

        connected = true;

        if (pingInterval === undefined) {
          pingInterval = setInterval(sendPing, PING_INTERVAL_MS);
        }

        return;
      }

      if (packet === "3") {
        awaitingPong = false;

        if (pongTimeout !== undefined) {
          clearTimeout(pongTimeout);
          pongTimeout = undefined;
        }

        return;
      }

      if (packet === "2") {
        client.send("3");
      }
    });

    client.addEventListener("close", cleanup);
    connection.server.addEventListener("close", cleanup);

    client.send(
      `0${JSON.stringify({
        sid: crypto.randomUUID(),
        upgrades: [],
        pingInterval: PING_INTERVAL_MS,
        pingTimeout: PING_TIMEOUT_MS,
        maxPayload: 1_000_000,
      })}`,
    );
  }),
];
