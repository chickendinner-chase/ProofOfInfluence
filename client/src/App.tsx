import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import PublicProfile from "@/pages/PublicProfile";
import PaymentSuccess from "@/pages/PaymentSuccess";
import Recharge from "@/pages/Recharge";
import Whitepaper from "@/pages/Whitepaper";
import Services from "@/pages/Services";
import Tokenomics from "@/pages/Tokenomics";
import Roadmap from "@/pages/Roadmap";
import Profile from "@/pages/Profile";
import TradingApp from "@/pages/TradingApp";
import NotFound from "@/pages/not-found";

function Router() {
  // Note: We don't block page rendering while checking auth status
  // All public pages (Landing, Products, etc.) are immediately accessible
  // Auth state is only used by components that need it (Header, Dashboard, etc.)
  
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/app" component={TradingApp} />
      <Route path="/whitepaper" component={Whitepaper} />
      <Route path="/services" component={Services} />
      <Route path="/tokenomics" component={Tokenomics} />
      <Route path="/roadmap" component={Roadmap} />
      <Route path="/profile" component={Profile} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/recharge" component={Recharge} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/:username" component={PublicProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
