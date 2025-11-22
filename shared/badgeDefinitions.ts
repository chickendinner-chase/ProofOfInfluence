/**
 * Badge Definitions - Static mapping of 12 badge types
 * These correspond to badgeType values (1-12) from the AchievementBadges contract
 */

export interface BadgeDefinition {
  id: number; // badgeType from contract (1-12)
  name: string;
  description: string;
  icon?: string; // Optional icon name/emoji
  order: number; // Display order
  color: string; // Tailwind gradient classes
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 1,
    name: "Early Adopter",
    description: "Joined during the early-bird campaign",
    icon: "🚀",
    order: 1,
    color: "from-blue-400 to-cyan-500",
  },
  {
    id: 2,
    name: "Referral Master",
    description: "Referred 10+ users to the platform",
    icon: "👥",
    order: 2,
    color: "from-purple-400 to-pink-500",
  },
  {
    id: 3,
    name: "Task Completer",
    description: "Completed all early-bird tasks",
    icon: "✅",
    order: 3,
    color: "from-green-400 to-emerald-500",
  },
  {
    id: 4,
    name: "Market Trader",
    description: "Made 50+ successful trades",
    icon: "📈",
    order: 4,
    color: "from-orange-400 to-red-500",
  },
  {
    id: 5,
    name: "Profit Master",
    description: "Achieved 100% PnL profit",
    icon: "💰",
    order: 5,
    color: "from-yellow-400 to-amber-500",
  },
  {
    id: 6,
    name: "Community Hero",
    description: "Active community contributor",
    icon: "🌟",
    order: 6,
    color: "from-indigo-400 to-blue-500",
  },
  {
    id: 7,
    name: "AI Agent Creator",
    description: "Created an AI agent",
    icon: "🤖",
    order: 7,
    color: "from-teal-400 to-cyan-500",
  },
  {
    id: 8,
    name: "Badge Collector",
    description: "Collected 5+ badges",
    icon: "🏆",
    order: 8,
    color: "from-rose-400 to-pink-500",
  },
  {
    id: 9,
    name: "Staking Pioneer",
    description: "Staked POI tokens",
    icon: "🔒",
    order: 9,
    color: "from-violet-400 to-purple-500",
  },
  {
    id: 10,
    name: "Governance Voter",
    description: "Participated in governance",
    icon: "🗳️",
    order: 10,
    color: "from-sky-400 to-blue-500",
  },
  {
    id: 11,
    name: "NFT Collector",
    description: "Collected RWA NFTs",
    icon: "🎨",
    order: 11,
    color: "from-fuchsia-400 to-purple-500",
  },
  {
    id: 12,
    name: "Immortality User",
    description: "Used Immortality AI chat feature",
    icon: "♾️",
    order: 12,
    color: "from-amber-400 to-yellow-500",
  },
];

/**
 * Get badge definition by badgeType ID
 */
export function getBadgeDefinition(badgeType: number): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find((badge) => badge.id === badgeType);
}

/**
 * Get all badge definitions sorted by order
 */
export function getAllBadgeDefinitions(): BadgeDefinition[] {
  return [...BADGE_DEFINITIONS].sort((a, b) => a.order - b.order);
}
