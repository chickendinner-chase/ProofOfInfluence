import { useQuery } from "@tanstack/react-query";

interface MeProfileData {
  profile: {
    id: string;
    name: string;
    bio: string | null;
    avatarUrl: string | null;
    googleUrl: string | null;
    twitterUrl: string | null;
    weiboUrl: string | null;
    tiktokUrl: string | null;
    isPublic: boolean;
    totalViews: number;
  };
  user: {
    id: string;
    username: string | null;
    email: string | null;
    walletAddress: string | null;
    role: string;
  };
  links: Array<{
    id: string;
    title: string;
    url: string;
    visible: boolean;
    position: number;
    clicks: number;
  }>;
  stats: {
    views: number;
    referralsCount: number;
    linkClicks: number;
  };
}

export function useMeProfile() {
  const { data, isLoading, error, refetch } = useQuery<MeProfileData>({
    queryKey: ['/api/profile/me'],
    queryFn: async () => {
      const res = await fetch('/api/profile/me', {
        credentials: 'include',
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      return res.json();
    },
    retry: 1,
  });

  return {
    data: data || null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

