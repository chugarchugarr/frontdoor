import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App.tsx";
import { Toaster } from "@/components/ui/sonner";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { initializeClientEnvironment } from "@adaptive-ai/sdk/client";
import { RootErrorBoundary } from "@/components/error-boundary";
import { TooltipProvider } from "@/components/ui/tooltip";

// Suppress known third-party console noise (Omada chat widget uses outdated remarkable)
const _origWarn = console.warn;
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === "string" && args[0].includes("linkify option is removed")) return;
  _origWarn(...args);
};

initializeClientEnvironment({
  appId: import.meta.env.VITE_APP_ID,
  rootUrl: import.meta.env.VITE_ROOT_URL,
  baseUrl: import.meta.env.VITE_BASE_URL,
  isTesting: !import.meta.env.PROD,
  realtimeDomain: import.meta.env.VITE_REALTIME_DOMAIN,
  boxId: import.meta.env.VITE_BOX_ID,
});

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider delayDuration={400}>
            <App />
          </TooltipProvider>
          <Toaster />
        </QueryClientProvider>
      </BrowserRouter>
    </RootErrorBoundary>
  </StrictMode>,
);
