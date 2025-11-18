import React, { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton, ThemedTable, ThemedBadge } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Shield,
  Zap,
  Search,
  Filter,
} from "lucide-react";
import CompactSwapCard from "@/components/CompactSwapCard";

export default function Market() {
  const { theme } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  // Market data (example)
  const pools = [
    {
      asset: "USDC Pool A",
      apr: "7.8%",
      tvl: "$12.3M",
      change24h: "+1.2%",
      risk: "low",
      trending: true,
    },
    {
      asset: "wETH Pool X",
      apr: "4.1%",
      tvl: "$8.7M",
      change24h: "-0.8%",
      risk: "low",
      trending: false,
    },
    {
      asset: "POI LP",
      apr: "12.6%",
      tvl: "$2.1M",
      change24h: "+4.3%",
      risk: "medium",
      trending: true,
    },
    {
      asset: "BTC-USD",
      apr: "6.2%",
      tvl: "$24.5M",
      change24h: "+2.1%",
      risk: "low",
      trending: false,
    },
    {
      asset: "ETH Staking",
      apr: "5.4%",
      tvl: "$18.2M",
      change24h: "+0.9%",
      risk: "low",
      trending: true,
    },
  ];

  const filters = [
    { id: "all", label: "All", icon: null },
    { id: "trending", label: "Trending", icon: Flame },
    { id: "low-risk", label: "Low Risk", icon: Shield },
    { id: "high-apr", label: "High APR", icon: Zap },
  ];

  const filteredPools = pools.filter((pool) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "trending") return pool.trending;
    if (selectedFilter === "low-risk") return pool.risk === "low";
    if (selectedFilter === "high-apr") return parseFloat(pool.apr) > 7;
    return true;
  });

  return (
    <PageLayout>
      {/* Header Section with Swap Card */}
      <Section>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Header Content - Takes 2 columns */}
          <div className="lg:col-span-2 lg:order-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={cn(
              'text-2xl font-bold',
              theme === 'cyberpunk' ? 'font-orbitron text-cyan-100' : 'font-fredoka text-slate-900'
            )}>
              {theme === 'cyberpunk' ? '现货交易' : 'Spot Trade'}
            </h1>
            <p className="text-sm opacity-70 mt-1">
              {theme === 'cyberpunk' 
                ? '发现并投资流动性池' 
                : 'Discover and invest in liquidity pools'}
            </p>
          </div>

          {/* Search (placeholder) */}
          <div className="hidden md:block">
            <ThemedButton variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Search
            </ThemedButton>
          </div>
        </div>

        {/* Market Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <ThemedCard className="p-5">
            <div className="text-xs opacity-70 mb-1">Total TVL</div>
            <div className={cn(
              'text-2xl font-bold',
              theme === 'cyberpunk' ? 'font-orbitron text-cyan-300' : 'font-poppins text-blue-600'
            )}>
              $65.8M
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-green-500">
              <TrendingUp className="w-3 h-3" />
              +5.2%
            </div>
          </ThemedCard>

          <ThemedCard className="p-5">
            <div className="text-xs opacity-70 mb-1">24h Volume</div>
            <div className={cn(
              'text-2xl font-bold',
              theme === 'cyberpunk' ? 'font-orbitron text-pink-300' : 'font-poppins text-green-600'
            )}>
              $4.2M
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-green-500">
              <TrendingUp className="w-3 h-3" />
              +12.4%
            </div>
          </ThemedCard>

          <ThemedCard className="p-5">
            <div className="text-xs opacity-70 mb-1">Active Pools</div>
            <div className={cn(
              'text-2xl font-bold',
              theme === 'cyberpunk' ? 'font-orbitron text-purple-300' : 'font-poppins text-purple-600'
            )}>
              42
            </div>
          </ThemedCard>

          <ThemedCard className="p-5">
            <div className="text-xs opacity-70 mb-1">Avg APR</div>
            <div className={cn(
              'text-2xl font-bold',
              theme === 'cyberpunk' ? 'font-orbitron text-green-300' : 'font-poppins text-green-600'
            )}>
              6.8%
            </div>
          </ThemedCard>
        </div>
          </div>
          
          {/* Swap Card - Takes 1 column */}
          <div className="lg:col-span-1 lg:order-2">
            <CompactSwapCard />
          </div>
        </div>
      </Section>

      {/* Filters */}
      <Section>
        <ThemedCard className="p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className={cn(
              'w-5 h-5',
              theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
            )} />
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <ThemedBadge
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  variant={selectedFilter === filter.id ? "default" : undefined}
                  className={cn(
                    'cursor-pointer',
                    selectedFilter === filter.id &&
                    (theme === 'cyberpunk'
                      ? 'bg-cyan-400/20 border-cyan-400/50'
                      : 'bg-blue-600 text-white border-blue-600')
                  )}
                >
                  {Icon && <Icon className="w-3 h-3 mr-1" />}
                  {filter.label}
                </ThemedBadge>
              );
            })}
          </div>
        </ThemedCard>
      </Section>

      {/* Market Table */}
      <Section>
        <ThemedCard className="p-6">
          <ThemedTable
            headers={["Asset/Pool", "APR", "TVL", "24h", "Risk", "Action"]}
            rows={filteredPools.map((pool) => [
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                  theme === 'cyberpunk'
                    ? 'bg-cyan-400/20 text-cyan-300'
                    : 'bg-blue-100 text-blue-600'
                )}>
                  {pool.asset.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">{pool.asset}</div>
                  {pool.trending && (
                    <div className="flex items-center gap-1 text-xs text-orange-500">
                      <Flame className="w-3 h-3" />
                      Trending
                    </div>
                  )}
                </div>
              </div>,

              <span className={cn(
                'font-bold text-lg',
                theme === 'cyberpunk' ? 'text-green-400' : 'text-green-600'
              )}>
                {pool.apr}
              </span>,

              <span className="font-medium">{pool.tvl}</span>,

              <div className="flex items-center gap-1">
                {pool.change24h.startsWith('+') ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-500">{pool.change24h}</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span className="text-red-500">{pool.change24h}</span>
                  </>
                )}
              </div>,

              <ThemedBadge variant={pool.risk === "low" ? "success" : "warning"}>
                {pool.risk === "low" ? "Low Risk" : "Medium"}
              </ThemedBadge>,

              <ThemedButton size="sm" emphasis>
                Join Pool
              </ThemedButton>,
            ])}
          />
        </ThemedCard>
      </Section>

      {/* Pool Details CTA */}
      <Section>
        <ThemedCard className="p-8 text-center">
          <h3 className={cn(
            'text-xl font-bold mb-2',
            theme === 'cyberpunk' ? 'font-orbitron text-cyan-200' : 'font-fredoka text-slate-900'
          )}>
            Not sure which pool to join?
          </h3>
          <p className="text-sm opacity-80 mb-6 max-w-2xl mx-auto">
            Learn more about liquidity pools, risk factors, and how to maximize your returns
          </p>
          <div className="flex justify-center gap-3">
            <ThemedButton emphasis>
              Pool Guide
            </ThemedButton>
            <ThemedButton variant="outline">
              Risk Calculator
            </ThemedButton>
          </div>
        </ThemedCard>
      </Section>
    </PageLayout>
  );
}
