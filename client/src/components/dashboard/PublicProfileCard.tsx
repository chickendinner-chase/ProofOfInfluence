import React, { useState } from "react";
import { useMeProfile } from "@/hooks/useMeProfile";
import { useTheme } from "@/contexts/ThemeContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ThemedCard, ThemedButton } from "@/components/themed";
import { cn } from "@/lib/utils";
import {
  Share2,
  Eye,
  Users,
  MousePointerClick,
  Copy,
  ExternalLink,
  Loader2,
  User as UserIcon,
  AlertCircle,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function PublicProfileCard() {
  const { theme } = useTheme();
  const { data, isLoading, error, refetch } = useMeProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);

  const togglePublicMutation = useMutation({
    mutationFn: async (isPublic: boolean) => {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isPublic }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to update profile');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile/me'] });
      refetch();
    },
  });

  const handleCopyLink = () => {
    if (!data?.user?.username) return;
    
    const profileUrl = `${window.location.origin}/${data.user.username}`;
    navigator.clipboard.writeText(profileUrl);
    toast({ title: "Profile link copied to clipboard!" });
  };

  const handlePreview = () => {
    if (!data?.user?.username) return;
    window.open(`/${data.user.username}`, '_blank');
  };

  const handleTogglePublic = async () => {
    if (!data?.profile) return;
    
    setIsTogglingPublic(true);
    try {
      await togglePublicMutation.mutateAsync(!data.profile.isPublic);
      toast({
        title: data.profile.isPublic ? "Profile is now private" : "Profile is now public",
      });
    } catch (error) {
      toast({
        title: "Failed to update profile visibility",
        variant: "destructive",
      });
    } finally {
      setIsTogglingPublic(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <ThemedCard className="p-6">
        <div className="flex items-center justify-center h-48">
          <Loader2 className={cn(
            "w-8 h-8 animate-spin",
            theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-500'
          )} />
        </div>
      </ThemedCard>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <ThemedCard className="p-6">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">Failed to load profile data</span>
        </div>
      </ThemedCard>
    );
  }

  const profileUrl = data.user.username 
    ? `${window.location.origin}/${data.user.username}`
    : null;

  const roleLabel = data.user.role === 'ai' ? 'AI Agent' : 'Human';

  return (
    <ThemedCard className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {data.profile.avatarUrl ? (
            <img
              src={data.profile.avatarUrl}
              alt={data.profile.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-cyan-400/20"
            />
          ) : (
            <div className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center',
              theme === 'cyberpunk'
                ? 'bg-gradient-to-br from-cyan-400/40 to-pink-500/40'
                : 'bg-gradient-to-br from-blue-200 to-purple-200'
            )}>
              <UserIcon className="w-8 h-8 opacity-60" />
            </div>
          )}
          <div>
            <h3 className={cn(
              'font-bold text-lg',
              theme === 'cyberpunk' ? 'font-orbitron' : 'font-fredoka'
            )}>
              {data.profile.name}
            </h3>
            <div className="flex items-center gap-2 text-sm opacity-70">
              {data.user.username ? (
                <span>@{data.user.username}</span>
              ) : (
                <span className="text-yellow-500">No username set</span>
              )}
              <span>•</span>
              <span className={cn(
                "px-2 py-0.5 rounded text-xs",
                theme === 'cyberpunk'
                  ? 'bg-cyan-400/20 text-cyan-300'
                  : 'bg-blue-100 text-blue-700'
              )}>
                {roleLabel}
              </span>
            </div>
          </div>
        </div>
        
        {/* Public Toggle */}
        <div className="flex items-center gap-2">
          <Label htmlFor="public-toggle" className="text-xs opacity-70">
            Public
          </Label>
          <Switch
            id="public-toggle"
            checked={data.profile.isPublic}
            onCheckedChange={handleTogglePublic}
            disabled={isTogglingPublic || !data.user.username}
          />
        </div>
      </div>

      {/* Profile URL */}
      {profileUrl && (
        <div className={cn(
          "p-3 rounded-lg mb-4",
          theme === 'cyberpunk'
            ? 'bg-slate-900/60 border border-cyan-400/20'
            : 'bg-slate-50 border border-slate-200'
        )}>
          <div className="text-xs opacity-70 mb-1">Public Profile URL</div>
          <div className="flex items-center gap-2">
            <code className={cn(
              "flex-1 text-sm truncate",
              theme === 'cyberpunk' ? 'text-cyan-300' : 'text-blue-600'
            )}>
              {profileUrl}
            </code>
            <button
              onClick={handleCopyLink}
              className={cn(
                "p-1.5 rounded transition-all",
                theme === 'cyberpunk'
                  ? 'hover:bg-cyan-400/20 text-cyan-400'
                  : 'hover:bg-blue-100 text-blue-600'
              )}
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handlePreview}
              className={cn(
                "p-1.5 rounded transition-all",
                theme === 'cyberpunk'
                  ? 'hover:bg-cyan-400/20 text-cyan-400'
                  : 'hover:bg-blue-100 text-blue-600'
              )}
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {!data.user.username && (
        <div className={cn(
          "p-3 rounded-lg mb-4 text-sm",
          theme === 'cyberpunk'
            ? 'bg-yellow-400/10 border border-yellow-400/30 text-yellow-300'
            : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
        )}>
          Set your username in Profile Settings to enable public profile
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className={cn(
          "text-center p-3 rounded-lg",
          theme === 'cyberpunk'
            ? 'bg-slate-900/40 border border-cyan-400/10'
            : 'bg-slate-50 border border-slate-100'
        )}>
          <Eye className={cn(
            "w-5 h-5 mx-auto mb-1",
            theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-500'
          )} />
          <div className={cn(
            "text-lg font-bold",
            theme === 'cyberpunk' ? 'font-rajdhani text-cyan-300' : 'font-poppins text-blue-600'
          )}>
            {data.stats.views}
          </div>
          <div className="text-xs opacity-70">Views</div>
        </div>

        <div className={cn(
          "text-center p-3 rounded-lg",
          theme === 'cyberpunk'
            ? 'bg-slate-900/40 border border-cyan-400/10'
            : 'bg-slate-50 border border-slate-100'
        )}>
          <Users className={cn(
            "w-5 h-5 mx-auto mb-1",
            theme === 'cyberpunk' ? 'text-pink-400' : 'text-purple-500'
          )} />
          <div className={cn(
            "text-lg font-bold",
            theme === 'cyberpunk' ? 'font-rajdhani text-pink-300' : 'font-poppins text-purple-600'
          )}>
            {data.stats.referralsCount}
          </div>
          <div className="text-xs opacity-70">Referrals</div>
        </div>

        <div className={cn(
          "text-center p-3 rounded-lg",
          theme === 'cyberpunk'
            ? 'bg-slate-900/40 border border-cyan-400/10'
            : 'bg-slate-50 border border-slate-100'
        )}>
          <MousePointerClick className={cn(
            "w-5 h-5 mx-auto mb-1",
            theme === 'cyberpunk' ? 'text-green-400' : 'text-green-500'
          )} />
          <div className={cn(
            "text-lg font-bold",
            theme === 'cyberpunk' ? 'font-rajdhani text-green-300' : 'font-poppins text-green-600'
          )}>
            {data.stats.linkClicks}
          </div>
          <div className="text-xs opacity-70">Link Clicks</div>
        </div>
      </div>
    </ThemedCard>
  );
}

