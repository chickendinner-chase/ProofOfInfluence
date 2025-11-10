/**
 * Merchant Access Control Hook
 * Checks if current user has merchant role and provides merchantId
 */

import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useMerchantAccess() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  // Check if user has merchant role
  // Note: Role checking logic may need to be adjusted based on actual user schema
  const isMerchant = user?.email?.includes('merchant') || user?.email?.includes('admin') || false; // TODO: Replace with actual role field
  
  // Use userId as merchantId by default (per Codex backend design)
  const merchantId = user?.id;

  return {
    isMerchant,
    isAdmin: user?.email?.includes('admin') || false,
    merchantId,
    canAccessMerchant: isMerchant,
  };
}

