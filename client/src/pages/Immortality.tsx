import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/hooks/useAuth";
import { useDemoUser } from "@/hooks/useDemoUser";
import { ImmortalityChat } from "@/components/ImmortalityChat";
import { ImmortalityTopBar } from "@/components/immortality/ImmortalityTopBar";
import { ImmortalitySidebar } from "@/components/immortality/ImmortalitySidebar";

interface ImmortalityBalanceResponse {
  credits: number;
  poiCredits: number;
}

export default function Immortality() {
  const { isAuthenticated } = useAuth();
  const demoUser = useDemoUser();

  // Contract actions local states
  const [usdcAmount, setUsdcAmount] = useState<string>("");
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [unstakeAmount, setUnstakeAmount] = useState<string>("");

  // Include demo user ID in query key to trigger refetch when switching
  const demoUserId = demoUser.selectedDemoUserId;
  const balanceQueryKey = demoUserId 
    ? ["/api/immortality/balance", { demoUserId }]
    : ["/api/immortality/balance"];

  const { data: balance, isFetching } = useQuery<ImmortalityBalanceResponse>({
    queryKey: balanceQueryKey,
    enabled: isAuthenticated,
  });

  const credits = balance?.credits ?? 0;
  const poiCredits = balance?.poiCredits ?? 0;

  return (
    <PageLayout>
      {/* Top Bar - Fixed */}
      <ImmortalityTopBar
        credits={credits}
        poiCredits={poiCredits}
        isFetching={isFetching}
        agentStatus="Online"
      />

      {/* Main Content Area - Two Column Layout */}
      <div className="container mx-auto px-4 py-4 lg:py-6">
        <div className="grid gap-4 lg:gap-6 lg:grid-cols-[1fr,380px]">
          {/* Left: Chat Panel (Main Area - 70-75%) */}
          <div className="min-h-[calc(100vh-180px)] lg:min-h-[calc(100vh-200px)]">
            <ImmortalityChat />
          </div>

          {/* Right: Sidebar (25-30% - Collapsible) */}
          <div className="lg:sticky lg:top-[80px] lg:h-[calc(100vh-120px)] lg:max-h-[calc(100vh-120px)]">
            <ImmortalitySidebar
              usdcAmount={usdcAmount}
              setUsdcAmount={setUsdcAmount}
              stakeAmount={stakeAmount}
              setStakeAmount={setStakeAmount}
              unstakeAmount={unstakeAmount}
              setUnstakeAmount={setUnstakeAmount}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
