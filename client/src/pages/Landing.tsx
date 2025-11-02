import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, Link as LinkIcon, Sparkles, Github } from "lucide-react";
import { SiGoogle, SiX } from "react-icons/si";
import ThemeToggle from "@/components/ThemeToggle";
import StripePayment from "@/components/StripePayment";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Your Web3-enabled link-in-bio
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Connect your social presence with Web3. Share your links, connect your wallet, and become eligible for exclusive airdrops.
            </p>
          </div>

          {/* Stripe Payment Component */}
          <StripePayment />

          {/* Alternative: Sign in with Google */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Already have an account?
            </p>
            <Button 
              variant="outline" 
              onClick={handleLogin}
              data-testid="button-login"
            >
              <SiGoogle className="mr-2 h-4 w-4" />
              Sign in with Google
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-4xl">
            <Card className="p-6 space-y-3 hover-elevate">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <SiGoogle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Social Login</h3>
              <p className="text-sm text-muted-foreground">
                Sign in with your Google account. No complicated setup, just one click to get started.
              </p>
            </Card>

            <Card className="p-6 space-y-3 hover-elevate">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Connect Wallet</h3>
              <p className="text-sm text-muted-foreground">
                Link your crypto wallet to become eligible for exclusive airdrops and Web3 features.
              </p>
            </Card>

            <Card className="p-6 space-y-3 hover-elevate">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <LinkIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Custom Links</h3>
              <p className="text-sm text-muted-foreground">
                Showcase all your important links in one beautiful, customizable page.
              </p>
            </Card>
          </div>

          <div className="mt-16 space-y-6 w-full max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold">Perfect for</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 text-left">
                <Sparkles className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Content Creators</h4>
                  <p className="text-sm text-muted-foreground">Share all your social links in one place</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <Wallet className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Web3 Enthusiasts</h4>
                  <p className="text-sm text-muted-foreground">Connect wallet for airdrop eligibility</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <Github className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Developers</h4>
                  <p className="text-sm text-muted-foreground">Showcase projects and GitHub profile</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <SiX className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Social Media</h4>
                  <p className="text-sm text-muted-foreground">Connect all your social platforms</p>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-20 text-center">
            <p className="text-sm text-muted-foreground">
              Powered by Replit × Web3
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
