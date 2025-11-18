import { Switch, Route } from "wouter";
import { ROUTES, DYNAMIC_ROUTES } from "./routes";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import PublicProfile from "@/pages/PublicProfile";
import PaymentSuccess from "@/pages/PaymentSuccess";
import Recharge from "@/pages/Recharge";
import Profile from "@/pages/Profile";
import UseCases from "@/pages/UseCases";
import Market from "@/pages/Market";
import TGE from "@/pages/TGE";
import EarlyBird from "@/pages/EarlyBird";
import Referral from "@/pages/Referral";
import Airdrop from "@/pages/Airdrop";
import Solutions from "@/pages/Solutions";
import Token from "@/pages/Token";
import Immortality from "@/pages/Immortality";
import RWAMarket from "@/pages/RWAMarket";
import About from "@/pages/About";
import NotFound from "@/pages/not-found";

/**
 * Router configuration component
 * 
 * Extracted from App.tsx to centralize route definitions and use route constants.
 * This makes route management easier and prevents hardcoded paths.
 */
export function AppRouter() {
  return (
    <Switch>
      {/* Home */}
      <Route path={ROUTES.HOME} component={Landing} />
      
      {/* Auth */}
      <Route path={ROUTES.LOGIN} component={Login} />
      
      {/* TGE & Campaign Routes */}
      <Route path={ROUTES.TGE} component={TGE} />
      <Route path={ROUTES.EARLY_BIRD} component={EarlyBird} />
      <Route path={ROUTES.REFERRAL} component={Referral} />
      <Route path={ROUTES.AIRDROP} component={Airdrop} />
      
      {/* New Consolidated Routes */}
      <Route path={ROUTES.SOLUTIONS} component={Solutions} />
      <Route path={ROUTES.TOKEN} component={Token} />
      <Route path={ROUTES.ABOUT} component={About} />
      <Route path={ROUTES.USE_CASES} component={UseCases} />
      
      {/* App routes (projectX) - More specific routes first */}
      <Route path={ROUTES.APP_SETTINGS} component={Profile} />
      <Route path={ROUTES.APP_RECHARGE} component={Recharge} />
      <Route path={ROUTES.APP_TRADE} component={Market} />
      <Route path={ROUTES.APP_RWA_MARKET} component={RWAMarket} />
      <Route path={ROUTES.APP_IMMORTALITY} component={Immortality} />
      <Route path={ROUTES.APP} component={Dashboard} />
      <Route path={ROUTES.PAYMENT_SUCCESS} component={PaymentSuccess} />
      
      {/* Dynamic User Profiles */}
      <Route path={DYNAMIC_ROUTES.USER_PROFILE} component={PublicProfile} />
      
      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

