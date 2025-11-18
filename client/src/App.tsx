import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WagmiProvider } from 'wagmi';
import { config } from './lib/wagmi';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppRouter } from "./routerConfig";

function Router() {
  // Note: We don't block page rendering while checking auth status
  // All public pages (Landing, Products, etc.) are immediately accessible
  // Auth state is only used by components that need it (Header, Dashboard, etc.)
  
  return <AppRouter />;
}

function App() {
  return (
    <ThemeProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}

export default App;
