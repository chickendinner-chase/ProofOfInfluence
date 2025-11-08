import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Eye, LogOut } from "lucide-react";
import WalletConnectButton from "@/components/WalletConnectButton";
import ThemeToggle from "@/components/ThemeToggle";
import ProfileEditor from "@/components/ProfileEditor";
import LinkEditor, { type LinkEditorData } from "@/components/LinkEditor";
import AddLinkButton from "@/components/AddLinkButton";
import AnalyticsView from "@/components/AnalyticsView";
import ReservePoolPanel from "@/components/ReservePoolPanel";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Profile, Link, User } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const [profileForm, setProfileForm] = useState<Profile | null>(null);
  const [usernameDraft, setUsernameDraft] = useState("");
  const [linksForm, setLinksForm] = useState<LinkEditorData[]>([]);
  const [linksToDelete, setLinksToDelete] = useState<string[]>([]);

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

  useEffect(() => {
    if (profile) {
      setProfileForm(profile);
    }
  }, [profile]);

  useEffect(() => {
    setUsernameDraft(user?.username || "");
  }, [user?.username]);

  useEffect(() => {
    const mappedLinks = links.map(link => ({
      id: link.id,
      title: link.title,
      url: link.url,
      visible: link.visible,
      clicks: link.clicks,
      position: link.position,
      isNew: false,
      isDirty: false,
    }));
    setLinksForm(mappedLinks);
    setLinksToDelete([]);
  }, [links]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<Profile> & { username?: string }) => {
      const res = await apiRequest("PATCH", "/api/profile", data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      const { username: updatedUsername, ...profileUpdates } = variables;

      if (Object.keys(profileUpdates).length > 0) {
        queryClient.setQueryData<Profile | undefined>(["/api/profile"], (prev) =>
          prev ? { ...prev, ...profileUpdates } : prev,
        );
      }

      if (updatedUsername !== undefined) {
        queryClient.setQueryData<User | undefined>(["/api/auth/user"], (prev) =>
          prev ? { ...prev, username: updatedUsername || null } : prev,
        );
      }

      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      if (updatedUsername !== undefined) {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      }

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

  const saveLinksMutation = useMutation({
    mutationFn: async (
      payload: {
        toCreate: LinkEditorData[];
        toUpdate: LinkEditorData[];
        toDelete: string[];
      },
    ) => {
      const requests: Promise<unknown>[] = [];

      payload.toCreate.forEach((link) => {
        requests.push(
          apiRequest("POST", "/api/links", {
            title: link.title,
            url: link.url,
            position: link.position ?? 0,
            visible: link.visible,
          }).then((res) => res.json()),
        );
      });

      payload.toUpdate.forEach((link) => {
        const updateData: Partial<Link> = {
          title: link.title,
          url: link.url,
          visible: link.visible,
          position: link.position,
        };
        requests.push(apiRequest("PATCH", `/api/links/${link.id}`, updateData).then((res) => res.json()));
      });

      payload.toDelete.forEach((id) => {
        requests.push(apiRequest("DELETE", `/api/links/${id}`));
      });

      await Promise.all(requests);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Links updated",
        description: "Your link changes have been saved",
      });

      queryClient.setQueryData<Link[] | undefined>(["/api/links"], (prev) => {
        if (!prev) return prev;

        let updated = prev.filter((link) => !variables.toDelete.includes(link.id));

        updated = updated.map((link) => {
          const changed = variables.toUpdate.find((item) => item.id === link.id);
          if (changed) {
            return {
              ...link,
              title: changed.title,
              url: changed.url,
              visible: changed.visible,
              position: changed.position ?? link.position,
            };
          }
          return link;
        });

        return updated;
      });

      setLinksToDelete([]);
      setLinksForm((prev) =>
        prev
          .filter((link) => !variables.toDelete.includes(link.id))
          .map((link, index) => ({ ...link, position: index, isNew: false, isDirty: false })),
      );

      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save link changes",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handlePreview = () => {
    const hasUnsavedChanges = hasProfileChanges || hasLinkChanges;
    if (hasUnsavedChanges) {
      toast({
        title: "Save required",
        description: "Please save your changes before previewing",
        variant: "destructive",
      });
      return;
    }

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
    const nextPosition = linksForm.length > 0 ? Math.max(...linksForm.map(link => link.position ?? 0)) + 1 : 0;
    const tempId = `temp-${Date.now()}`;

    setLinksForm((prev) => ([
      ...prev,
      {
        id: tempId,
        title: "New Link",
        url: "https://",
        visible: true,
        clicks: 0,
        position: nextPosition,
        isNew: true,
        isDirty: true,
      },
    ]));
  };

  const handleUpdateLink = (id: string, updates: Partial<LinkEditorData>) => {
    setLinksForm((prev) =>
      prev.map((link) =>
        link.id === id
          ? {
              ...link,
              ...updates,
              isDirty: link.isNew
                ? true
                : (() => {
                    const original = links.find((item) => item.id === id);
                    if (!original) return true;
                    return (
                      (updates.title ?? link.title) !== original.title ||
                      (updates.url ?? link.url) !== original.url ||
                      (updates.visible ?? link.visible) !== original.visible
                    );
                  })(),
            }
          : link,
      ),
    );
  };

  const handleDeleteLink = (id: string) => {
    setLinksForm((prev) => {
      const target = prev.find((link) => link.id === id);
      if (target && !target.isNew) {
        setLinksToDelete((prevDelete) => (prevDelete.includes(id) ? prevDelete : [...prevDelete, id]));
      }
      return prev.filter((link) => link.id !== id);
    });
  };

  const handleProfileChange = (updates: Partial<Profile> & { username?: string }) => {
    const { username: usernameUpdate, ...profileUpdates } = updates;

    if (Object.keys(profileUpdates).length > 0) {
      setProfileForm((prev) => (prev ? { ...prev, ...profileUpdates } : prev));
    }

    if (usernameUpdate !== undefined) {
      setUsernameDraft(usernameUpdate);
    }
  };

  const handleSaveProfile = () => {
    if (!profile || !profileForm) return;

    const updates: Partial<Profile> & { username?: string } = {};

    if (profileForm.name !== profile.name) {
      updates.name = profileForm.name;
    }

    if ((profileForm.bio ?? null) !== (profile.bio ?? null)) {
      updates.bio = profileForm.bio ?? null;
    }

    if ((profileForm.avatarUrl ?? null) !== (profile.avatarUrl ?? null)) {
      updates.avatarUrl = profileForm.avatarUrl ?? null;
    }

    if ((profileForm.googleUrl ?? null) !== (profile.googleUrl ?? null)) {
      updates.googleUrl = profileForm.googleUrl ?? null;
    }

    if ((profileForm.twitterUrl ?? null) !== (profile.twitterUrl ?? null)) {
      updates.twitterUrl = profileForm.twitterUrl ?? null;
    }

    if ((profileForm.weiboUrl ?? null) !== (profile.weiboUrl ?? null)) {
      updates.weiboUrl = profileForm.weiboUrl ?? null;
    }

    if ((profileForm.tiktokUrl ?? null) !== (profile.tiktokUrl ?? null)) {
      updates.tiktokUrl = profileForm.tiktokUrl ?? null;
    }

    if ((profileForm.isPublic ?? null) !== (profile.isPublic ?? null)) {
      updates.isPublic = profileForm.isPublic;
    }

    if (usernameDraft !== (user?.username || "")) {
      updates.username = usernameDraft || undefined;
    }

    if (Object.keys(updates).length === 0) {
      return;
    }

    updateProfileMutation.mutate(updates);
  };

  const handleSaveLinks = () => {
    const orderedLinks = linksForm.map((link, index) => ({ ...link, position: index }));
    const toCreate = orderedLinks.filter((link) => link.isNew);
    const toUpdate = orderedLinks.filter((link) => !link.isNew && link.isDirty);
    const toDelete = linksToDelete;

    if (toCreate.length === 0 && toUpdate.length === 0 && toDelete.length === 0) {
      return;
    }

    saveLinksMutation.mutate({ toCreate, toUpdate, toDelete });
  };

  const isLoading = userLoading || profileLoading || linksLoading;

  const hasProfileChanges = useMemo(() => {
    if (!profile || !profileForm) return false;

    const usernameChanged = usernameDraft !== (user?.username || "");

    const fieldChanged = <K extends keyof Profile>(key: K) => (profileForm[key] ?? null) !== (profile[key] ?? null);

    return (
      fieldChanged("name") ||
      fieldChanged("bio") ||
      fieldChanged("avatarUrl") ||
      fieldChanged("googleUrl") ||
      fieldChanged("twitterUrl") ||
      fieldChanged("weiboUrl") ||
      fieldChanged("tiktokUrl") ||
      fieldChanged("isPublic") ||
      usernameChanged
    );
  }, [profile, profileForm, usernameDraft, user?.username]);

  const hasLinkChanges = useMemo(() => {
    if (linksToDelete.length > 0) {
      return true;
    }

    return linksForm.some((link) => link.isNew || link.isDirty);
  }, [linksForm, linksToDelete]);

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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold">projectX</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePreview}
              data-testid="button-preview"
              disabled={hasProfileChanges || hasLinkChanges}
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
            <TabsTrigger value="reserve-pool" data-testid="tab-reserve-pool">
              Reserve Pool
            </TabsTrigger>
            <TabsTrigger value="merchant" data-testid="tab-merchant">
              Merchant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="max-w-2xl mx-auto">
              {profileForm && (
                <ProfileEditor
                  profile={profileForm}
                  username={usernameDraft}
                  onChange={handleProfileChange}
                  onSave={handleSaveProfile}
                  canSave={hasProfileChanges}
                  isSaving={updateProfileMutation.isPending}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="links" className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={handleSaveLinks}
                disabled={!hasLinkChanges || saveLinksMutation.isPending}
                data-testid="button-save-links"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Link Changes
              </Button>
            </div>
            <div className="max-w-2xl mx-auto space-y-4">
              {linksForm.map((link) => (
                <LinkEditor
                  key={link.id}
                  link={link}
                  onUpdate={handleUpdateLink}
                  onDelete={handleDeleteLink}
                  disabled={saveLinksMutation.isPending}
                />
              ))}
              <AddLinkButton onClick={handleAddLink} disabled={saveLinksMutation.isPending} />
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

          <TabsContent value="reserve-pool">
            <ReservePoolPanel />
          </TabsContent>

          <TabsContent value="merchant">
            <div className="space-y-6">
              <div className="p-8 rounded-xl bg-gradient-to-r from-purple-900/20 to-purple-800/10 border border-purple-700/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full bg-purple-400 animate-pulse"></div>
                  <span className="text-lg font-semibold text-purple-300">商家后台开发中</span>
                </div>
                <p className="text-slate-300 leading-relaxed mb-4">
                  商家后台管理界面正在开发中，将提供以下功能：
                </p>
                <ul className="space-y-2 text-sm text-slate-400 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>产品/服务自主定价管理</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>订单管理与状态跟踪</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>税务报表生成与导出</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>交易数据统计分析</span>
                  </li>
                </ul>
                <div className="pt-4 border-t border-purple-700/30">
                  <p className="text-xs text-slate-400 italic">
                    ⏳ 等待 Codex 完成商家后台后端接口
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
