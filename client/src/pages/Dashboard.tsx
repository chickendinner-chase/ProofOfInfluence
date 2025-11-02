import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Eye, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import WalletConnectButton from "@/components/WalletConnectButton";
import ThemeToggle from "@/components/ThemeToggle";
import ProfileEditor from "@/components/ProfileEditor";
import LinkEditor, { type LinkEditorData } from "@/components/LinkEditor";
import AddLinkButton from "@/components/AddLinkButton";
import AnalyticsView from "@/components/AnalyticsView";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Profile, Link, User } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showPreview, setShowPreview] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  const { data: links = [], isLoading: linksLoading } = useQuery<Link[]>({
    queryKey: ["/api/links"],
    enabled: !!user,
  });

  const { data: analytics } = useQuery<{
    totalClicks: number;
    totalViews: number;
    topLinks: Array<{ title: string; clicks: number }>;
  }>({
    queryKey: ["/api/analytics"],
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<Profile> & { username?: string }) => {
      const res = await apiRequest("PATCH", "/api/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile updated",
        description: "Your changes have been saved",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const updateLinkMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Link> }) => {
      const res = await apiRequest("PATCH", `/api/links/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/links/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({
        title: "Link deleted",
      });
    },
  });

  const createLinkMutation = useMutation({
    mutationFn: async (data: { title: string; url: string; position: number; visible: boolean }) => {
      const res = await apiRequest("POST", "/api/links", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handlePreview = () => {
    if (user?.username) {
      window.open(`/${user.username}`, "_blank");
    } else {
      toast({
        title: "Username required",
        description: "Please set a username first",
        variant: "destructive",
      });
    }
  };

  const handleAddLink = () => {
    const maxPosition = links.length > 0 ? Math.max(...links.map(l => l.position)) : -1;
    createLinkMutation.mutate({
      title: "New Link",
      url: "https://",
      position: maxPosition + 1,
      visible: true,
    });
  };

  const handleUpdateLink = (id: string, updates: Partial<LinkEditorData>) => {
    updateLinkMutation.mutate({ id, data: updates });
  };

  const handleDeleteLink = (id: string) => {
    deleteLinkMutation.mutate(id);
  };

  const handleUpdateProfile = (updates: Partial<Profile> & { username?: string }) => {
    updateProfileMutation.mutate(updates);
  };

  const isLoading = userLoading || profileLoading || linksLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <Skeleton className="h-8 w-48" />
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-12 w-full max-w-md" />
          <Skeleton className="h-64 w-full max-w-2xl" />
        </div>
      </div>
    );
  }

  const linksData: LinkEditorData[] = links.map(link => ({
    id: link.id,
    title: link.title,
    url: link.url,
    visible: link.visible,
    clicks: link.clicks,
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold">LinkTree Web3</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePreview}
              data-testid="button-preview"
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <WalletConnectButton />
            <ThemeToggle />
            <Button
              variant="ghost"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile" data-testid="tab-profile">
              Profile
            </TabsTrigger>
            <TabsTrigger value="links" data-testid="tab-links">
              Links
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="max-w-2xl mx-auto">
              {profile && (
                <ProfileEditor 
                  profile={profile}
                  username={user?.username}
                  onUpdate={handleUpdateProfile}
                  isPending={updateProfileMutation.isPending}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="links" className="space-y-4">
            <div className="max-w-2xl mx-auto space-y-4">
              {linksData.map((link) => (
                <LinkEditor
                  key={link.id}
                  link={link}
                  onUpdate={handleUpdateLink}
                  onDelete={handleDeleteLink}
                />
              ))}
              <AddLinkButton onClick={handleAddLink} />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="max-w-2xl mx-auto">
              {analytics && (
                <AnalyticsView
                  totalClicks={analytics.totalClicks}
                  totalViews={analytics.totalViews}
                  topLinks={analytics.topLinks}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
