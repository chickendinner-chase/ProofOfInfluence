import { ReactNode } from "react";
import { useAccessControl, UserRole } from "@/hooks/useAccessControl";

interface FeatureFlagProps {
  children: ReactNode;
  requiredRole: UserRole;
  fallback?: ReactNode;
}

/**
 * Component to conditionally render features based on user access level
 * Unlike AccessGuard, this is for inline feature toggling within a page
 */
export default function FeatureFlag({
  children,
  requiredRole,
  fallback = null,
}: FeatureFlagProps) {
  const accessControl = useAccessControl();

  const hasAccess = () => {
    switch (requiredRole) {
      case "guest":
        return true;
      case "web3_connected":
        return accessControl.isWeb3Connected;
      case "kyc_verified":
        return accessControl.isKYCVerified;
      default:
        return false;
    }
  };

  return <>{hasAccess() ? children : fallback}</>;
}
