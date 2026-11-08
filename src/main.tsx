import React from "react";
import ReactDOM from "react-dom/client";
import { AppProviders } from "./app/providers/AppProviders";
import "./index.css";

async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MOCKS !== "true") {
    return;
  }

  const { worker } = await import("./mocks/browser");

  await worker.start({
    onUnhandledRequest(request, print) {
      const url = new URL(request.url);

      if (!url.pathname.startsWith("/api/")) {
        return;
      }

      print.warning();
    },
  });
}

async function bootstrap() {
  await enableMocking();

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <AppProviders />
    </React.StrictMode>,
  );
}

void bootstrap();
