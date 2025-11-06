import { ReactNode } from "react";
import { useAccessControl, UserRole } from "@/hooks/useAccessControl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Lock, Wallet, ShieldCheck } from "lucide-react";

interface AccessGuardProps {
  children: ReactNode;
  requiredRole: UserRole;
  fallback?: ReactNode;
}

/**
 * Component to guard content based on user access level
 * Shows appropriate message and CTA if user doesn't have required permissions
 */
export default function AccessGuard({
  children,
  requiredRole,
  fallback,
}: AccessGuardProps) {
  const accessControl = useAccessControl();

  // Check if user has required role
  const hasAccess = () => {
    switch (requiredRole) {
      case "guest":
        return true; // Everyone can access guest content
      case "web3_connected":
        return accessControl.isWeb3Connected;
      case "kyc_verified":
        return accessControl.isKYCVerified;
      default:
        return false;
    }
  };

  if (hasAccess()) {
    return <>{children}</>;
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default access denied messages based on required role
  const getAccessDeniedMessage = () => {
    switch (requiredRole) {
      case "web3_connected":
        return {
          icon: Wallet,
          title: "需要连接钱包",
          description: "请连接您的 Web3 钱包以访问此功能",
          action: "连接钱包",
          href: "/dashboard",
        };
      case "kyc_verified":
        return {
          icon: ShieldCheck,
          title: "需要 KYC 认证",
          description: "此功能需要完成身份验证（KYC）才能使用",
          action: "开始认证",
          href: "/dashboard?kyc=true",
        };
      default:
        return {
          icon: Lock,
          title: "访问受限",
          description: "您没有权限访问此内容",
          action: "了解更多",
          href: "/",
        };
    }
  };

  const message = getAccessDeniedMessage();
  const Icon = message.icon;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 bg-slate-800/50 border-slate-700 text-center">
        <div className="space-y-6">
          <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto">
            <Icon className="w-8 h-8 text-slate-300" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {message.title}
            </h2>
            <p className="text-slate-400">{message.description}</p>
          </div>
          <Link href={message.href}>
            <Button
              size="lg"
              className="w-full bg-white text-slate-900 hover:bg-slate-100"
            >
              {message.action}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
