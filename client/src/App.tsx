import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
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
import Products from "@/pages/Products";
import ForCreators from "@/pages/ForCreators";
import ForBrands from "@/pages/ForBrands";
import UseCases from "@/pages/UseCases";
import TokenDocs from "@/pages/TokenDocs";
import Compliance from "@/pages/Compliance";
import Changelog from "@/pages/Changelog";
import Company from "@/pages/Company";
import NotFound from "@/pages/not-found";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import type { User } from "@shared/schema";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Fetch user data when authenticated
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
  });

  // Redirect to user's public profile after login (only on homepage)
  useEffect(() => {
    if (isAuthenticated && user?.username && location === "/") {
      setLocation(`/${user.username}`);
    }
  }, [isAuthenticated, user, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Home */}
      <Route path="/" component={Landing} />
      
      {/* Information Architecture Routes */}
      <Route path="/products" component={Products} />
      <Route path="/for-creators" component={ForCreators} />
      <Route path="/for-brands" component={ForBrands} />
      <Route path="/use-cases" component={UseCases} />
      <Route path="/token-docs" component={TokenDocs} />
      <Route path="/compliance" component={Compliance} />
      <Route path="/changelog" component={Changelog} />
      <Route path="/company" component={Company} />
      
      {/* Legacy Routes (keep for backwards compatibility) */}
      <Route path="/whitepaper" component={Whitepaper} />
      <Route path="/services" component={Services} />
      <Route path="/tokenomics" component={Tokenomics} />
      <Route path="/roadmap" component={Roadmap} />
      
      {/* App & Dashboard */}
      <Route path="/app" component={TradingApp} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/recharge" component={Recharge} />
      <Route path="/payment-success" component={PaymentSuccess} />
      
      {/* Dynamic User Profiles */}
      <Route path="/:username" component={PublicProfile} />
      
      {/* 404 */}
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
