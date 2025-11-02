import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { SiGoogle, SiX, SiSinaweibo, SiTiktok } from "react-icons/si";
import ProfileAvatar from "./ProfileAvatar";
import type { Profile } from "@shared/schema";

interface ProfileEditorProps {
  profile: Profile;
  username?: string | null;
  onUpdate: (updates: Partial<Profile> & { username?: string }) => void;
  isPending?: boolean;
}

export default function ProfileEditor({ profile, username, onUpdate, isPending }: ProfileEditorProps) {
  const handleAvatarUpload = () => {
    console.log("Avatar upload clicked");
  };

  const bioLength = profile.bio?.length || 0;
  const maxBioLength = 200;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-3">
          <ProfileAvatar
            src={profile.avatarUrl || undefined}
            alt={profile.name}
            fallback={profile.name.slice(0, 2).toUpperCase()}
          />
          <Button variant="outline" size="sm" onClick={handleAvatarUpload} data-testid="button-upload-avatar">
            <Upload className="mr-2 h-4 w-4" />
            Upload Avatar
          </Button>
        </div>

        <div>
          <Label htmlFor="profile-name" className="text-sm font-medium mb-1.5 block">
            Display Name
          </Label>
          <Input
            id="profile-name"
            value={profile.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Your name"
            data-testid="input-profile-name"
            disabled={isPending}
          />
        </div>

        <div>
          <Label htmlFor="username" className="text-sm font-medium mb-1.5 block">
            Username
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">/</span>
            <Input
              id="username"
              value={username || ""}
              onChange={(e) => {
                const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                onUpdate({ username: value });
              }}
              placeholder="your-username"
              data-testid="input-username"
              disabled={isPending}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Your public profile will be available at /{username || "your-username"}
          </p>
        </div>

        <div>
          <Label htmlFor="profile-bio" className="text-sm font-medium mb-1.5 block">
            Bio
          </Label>
          <Textarea
            id="profile-bio"
            value={profile.bio || ""}
            onChange={(e) => onUpdate({ bio: e.target.value })}
            placeholder="Tell people about yourself"
            maxLength={maxBioLength}
            rows={3}
            data-testid="input-profile-bio"
            disabled={isPending}
          />
          <p className="text-xs text-muted-foreground mt-1" data-testid="text-bio-count">
            {bioLength}/{maxBioLength} characters
          </p>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold mb-3">Social Media Links</h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="google-url" className="text-sm font-medium mb-1.5 flex items-center gap-2">
                <SiGoogle className="h-4 w-4" />
                Google Profile
              </Label>
              <Input
                id="google-url"
                value={profile.googleUrl || ""}
                onChange={(e) => onUpdate({ googleUrl: e.target.value || null })}
                placeholder="https://..."
                data-testid="input-google-url"
                disabled={isPending}
              />
            </div>

            <div>
              <Label htmlFor="twitter-url" className="text-sm font-medium mb-1.5 flex items-center gap-2">
                <SiX className="h-4 w-4" />
                X (Twitter)
              </Label>
              <Input
                id="twitter-url"
                value={profile.twitterUrl || ""}
                onChange={(e) => onUpdate({ twitterUrl: e.target.value || null })}
                placeholder="https://x.com/..."
                data-testid="input-twitter-url"
                disabled={isPending}
              />
            </div>

            <div>
              <Label htmlFor="weibo-url" className="text-sm font-medium mb-1.5 flex items-center gap-2">
                <SiSinaweibo className="h-4 w-4" />
                Weibo
              </Label>
              <Input
                id="weibo-url"
                value={profile.weiboUrl || ""}
                onChange={(e) => onUpdate({ weiboUrl: e.target.value || null })}
                placeholder="https://weibo.com/..."
                data-testid="input-weibo-url"
                disabled={isPending}
              />
            </div>

            <div>
              <Label htmlFor="tiktok-url" className="text-sm font-medium mb-1.5 flex items-center gap-2">
                <SiTiktok className="h-4 w-4" />
                TikTok
              </Label>
              <Input
                id="tiktok-url"
                value={profile.tiktokUrl || ""}
                onChange={(e) => onUpdate({ tiktokUrl: e.target.value || null })}
                placeholder="https://tiktok.com/@..."
                data-testid="input-tiktok-url"
                disabled={isPending}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
