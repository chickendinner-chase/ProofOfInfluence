import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import type { RouteComponentProps } from "wouter";
import ProfileAvatar from "@/components/ProfileAvatar";
import ThemeToggle from "@/components/ThemeToggle";
import WalletConnectButton from "@/components/WalletConnectButton";
import { UniswapSwapCard } from "@/components/UniswapSwapCard";
import { Copy, ExternalLink, Edit, Coins } from "lucide-react";
import { SiGoogle, SiX, SiSinaweibo, SiTiktok } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import type { Profile as ProfileRecord, Link as LinkRecord, User } from "@shared/schema";

export type Profile = {
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
  googleUrl?: string | null;
  twitterUrl?: string | null;
  weiboUrl?: string | null;
  tiktokUrl?: string | null;
  totalViews: number;
};

export type Link = {
  id: string;
  title: string;
  url: string;
  visible: boolean;
};

export type PublicProfileData = {
  profile: Profile;
  links: Link[];
  user: {
    walletAddress?: string | null;
    username?: string | null;
  };
};

type PublicProfileProps = Partial<RouteComponentProps<{ username: string }>> & {
  previewData?: PublicProfileData;
};

type ApiResponse = {
  profile: ProfileRecord;
  links: LinkRecord[];
  user: User;
};

export default function PublicProfile(props?: PublicProfileProps) {
  const { previewData } = props ?? {};
  const params = useParams<{ username: string }>();
  const username = params?.username;
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  // Get current logged-in user
  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
  });

  const {
    data,
    isLoading,
    error,
  } = useQuery<ApiResponse>({
    queryKey: ["/api/profile", username],
    queryFn: async () => {
      const response = await fetch(`/api/profile/${username}`);
      if (!response.ok) {
        throw new Error('Profile not found');
      }
      return response.json();
    },
    enabled: !previewData && !!username,
  });

  const trackClickMutation = useMutation({
    mutationFn: async (linkId: string) => {
      await apiRequest("POST", `/api/links/${linkId}/click`, {});
    },
  });

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleLinkClick = (linkId: string, url: string) => {
    if (!previewData) {
      trackClickMutation.mutate(linkId);
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address copied",
      description: "Wallet address copied to clipboard",
    });
  };

  if (!previewData && isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="absolute top-4 right-4 flex flex-wrap items-center justify-end gap-2">
          {isAuthenticated && <WalletConnectButton />}
          <ThemeToggle />
        </div>
        <div className="max-w-md mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-32 w-32 rounded-full" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!previewData && (error || !data)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="absolute top-4 right-4 flex flex-wrap items-center justify-end gap-2">
          {isAuthenticated && <WalletConnectButton />}
          <ThemeToggle />
        </div>
        <div className="text-center space-y-4 p-8">
          <h1 className="text-3xl font-bold">Profile not found</h1>
          <p className="text-muted-foreground">
            The user @{username} does not exist or has not published their profile.
          </p>
        </div>
      </div>
    );
  }

  const resolvedData = previewData ?? (data ? mapApiResponse(data) : undefined);

  if (!resolvedData) {
    return null;
  }

  const { profile, links, user } = resolvedData;
  const visibleLinks = links.filter((link) => link.visible);

  // Check if current user is viewing their own profile
  const activeUsername = previewData?.user?.username ?? username;
  const isOwnProfile = previewData ? true : currentUser?.username === activeUsername;

  const socialLinks = [
    { url: profile.googleUrl, icon: SiGoogle, label: "Google", testId: "link-google" },
    { url: profile.twitterUrl, icon: SiX, label: "X", testId: "link-twitter" },
    { url: profile.weiboUrl, icon: SiSinaweibo, label: "Weibo", testId: "link-weibo" },
    { url: profile.tiktokUrl, icon: SiTiktok, label: "TikTok", testId: "link-tiktok" },
  ].filter((social) => social.url || false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="absolute top-4 right-4 flex flex-wrap items-center justify-end gap-2">
        {isOwnProfile && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (previewData) return;
                setLocation("/recharge");
              }}
              disabled={!!previewData}
              data-testid="button-recharge"
            >
              <Coins className="mr-2 h-4 w-4" />
              充值
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (previewData) return;
                setLocation("/dashboard");
              }}
              disabled={!!previewData}
              data-testid="button-edit"
            >
              <Edit className="mr-2 h-4 w-4" />
              编辑资料
            </Button>
          </>
        )}
        {isAuthenticated && <WalletConnectButton />}
        <ThemeToggle />
      </div>

      <div className="max-w-lg mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col items-center text-center space-y-3 mb-8">
          <ProfileAvatar
            src={profile.avatarUrl || undefined}
            alt={profile.name}
            fallback={profile.name.slice(0, 2).toUpperCase()}
            size="large"
          />

          <h1 className="text-3xl md:text-4xl font-bold" data-testid="text-profile-name">
            {profile.name}
          </h1>

          {profile.bio && (
            <p className="text-lg leading-relaxed text-muted-foreground max-w-md" data-testid="text-profile-bio">
              {profile.bio}
            </p>
          )}

          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3 mt-2">
              {socialLinks.map((social) => (
                <Button
                  key={social.label}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  asChild
                  data-testid={social.testId}
                >
                  <a
                    href={social.url || ""}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                </Button>
              ))}
            </div>
          )}

          {user.walletAddress && (
            <div className="flex items-center gap-2 bg-muted/50 backdrop-blur px-4 py-2 rounded-xl mt-4">
              <span className="text-sm font-mono tracking-tight" data-testid="text-wallet-address">
                {truncateAddress(user.walletAddress)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  if (user.walletAddress) {
                    copyAddress(user.walletAddress);
                  }
                }}
                data-testid="button-copy-wallet"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                asChild
                data-testid="link-etherscan-wallet"
              >
                <a
                  href={`https://etherscan.io/address/${user.walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          )}

          <div className="mt-8 w-full">
            <UniswapSwapCard walletAddress={currentUser?.walletAddress} />
          </div>

          <p className="text-xs md:text-sm text-muted-foreground" data-testid="text-profile-views">
            {profile.totalViews.toLocaleString()} profile views
          </p>
        </div>

        <div className="space-y-4">
          {visibleLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id, link.url)}
              className="w-full py-4 md:py-5 px-6 rounded-2xl bg-muted/50 backdrop-blur hover-elevate active-elevate-2 transition-all duration-200 text-left"
              data-testid={`link-${link.id}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-base md:text-lg">{link.title}</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>

        {visibleLinks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No links added yet</p>
          </div>
        )}

        <footer className="mt-16 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by LinkTree Web3
          </p>
        </footer>
      </div>
    </div>
  );
}

function mapApiResponse(data: ApiResponse): PublicProfileData {
  return {
    profile: {
      name: data.profile.name,
      bio: data.profile.bio,
      avatarUrl: data.profile.avatarUrl,
      googleUrl: data.profile.googleUrl,
      twitterUrl: data.profile.twitterUrl,
      weiboUrl: data.profile.weiboUrl,
      tiktokUrl: data.profile.tiktokUrl,
      totalViews: data.profile.totalViews,
    },
    links: data.links.map((link) => ({
      id: link.id,
      title: link.title,
      url: link.url,
      visible: link.visible,
    })),
    user: {
      walletAddress: data.user.walletAddress,
      username: data.user.username,
    },
  };
}
