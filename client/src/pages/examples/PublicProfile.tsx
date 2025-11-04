import PublicProfile, { type PublicProfileData } from "../PublicProfile";
import sampleAvatar from "@assets/generated_images/Sample_profile_avatar_7ce2fd78.png";

export default function PublicProfileExample() {
  const mockData: PublicProfileData = {
    profile: {
      name: "John Doe",
      bio: "Web3 enthusiast | Developer | Creator",
      avatarUrl: sampleAvatar,
      googleUrl: "https://google.com",
      twitterUrl: "https://twitter.com",
      weiboUrl: "https://weibo.com",
      tiktokUrl: "https://tiktok.com",
      totalViews: 8924,
    },
    links: [
      { id: "1", title: "My Website", url: "https://example.com", visible: true },
      { id: "2", title: "GitHub Profile", url: "https://github.com", visible: true },
      { id: "3", title: "Twitter", url: "https://twitter.com", visible: true },
      { id: "4", title: "YouTube Channel", url: "https://youtube.com", visible: true },
      { id: "5", title: "LinkedIn", url: "https://linkedin.com", visible: false },
    ],
    user: {
      walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      username: "johndoe",
    },
  };

  return <PublicProfile previewData={mockData} />;
}
