import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, ChevronDown, ShoppingCart, Briefcase } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import WalletConnectButton from "@/components/WalletConnectButton";

interface HeaderProps {
  lang?: "zh" | "en";
}

export default function Header({ lang = "zh" }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  // Main navigation items (simplified)
  const mainNavItems = lang === "zh" 
    ? [
        { label: "首页", href: "/" },
        { label: "现货交易", href: "/app/market", icon: ShoppingCart, highlight: true },
        { label: "RWA市场", href: "/app", icon: Briefcase },
        { label: "ProjectX", href: "/products" },
      ]
    : [
        { label: "Home", href: "/" },
        { label: "Spot Trading", href: "/app/market", icon: ShoppingCart, highlight: true },
        { label: "RWA Market", href: "/app", icon: Briefcase },
        { label: "ProjectX", href: "/products" },
      ];

  // Resources dropdown items
  const resourceItems = lang === "zh"
    ? [
        { label: "创作者专区", href: "/for-creators" },
        { label: "品牌专区", href: "/for-brands" },
        { label: "应用案例", href: "/use-cases" },
        { label: "Token & 文档", href: "/token-docs" },
        { label: "合规", href: "/compliance" },
        { label: "更新日志", href: "/changelog" },
        { label: "公司", href: "/company" },
      ]
    : [
        { label: "For Creators", href: "/for-creators" },
        { label: "For Brands", href: "/for-brands" },
        { label: "Use Cases", href: "/use-cases" },
        { label: "Token & Docs", href: "/token-docs" },
        { label: "Compliance", href: "/compliance" },
        { label: "Changelog", href: "/changelog" },
        { label: "Company", href: "/company" },
      ];

  const resourcesLabel = lang === "zh" ? "资源" : "Resources";
  const projectXLabel = lang === "zh" ? "projectX" : "projectX";
  const loginLabel = lang === "zh" ? "登录" : "Login";

  return (
    <header className="border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <Link href="/">
          <div className="font-semibold text-lg text-white cursor-pointer hover:text-slate-300 transition-colors">
            ACEE Ventures
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-sm">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <a
                  className={`flex items-center gap-1.5 hover:text-white transition-colors ${
                    location === item.href ? "text-white font-semibold" : "text-slate-400"
                  } ${item.highlight ? "text-blue-400 font-semibold" : ""}`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.label}
                </a>
              </Link>
            );
          })}

          {/* Resources Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors outline-none">
              {resourcesLabel}
              <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-700">
              {resourceItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href}>
                    <a className="w-full text-slate-300 hover:text-white cursor-pointer">
                      {item.label}
                    </a>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Wallet Connect - Desktop */}
          <div className="hidden md:block">
            <WalletConnectButton />
          </div>

          {/* projectX / Login Link */}
          {isAuthenticated ? (
            <Link href="/app">
              <Button
                variant="default"
                className="bg-white text-slate-900 hover:bg-slate-100"
              >
                {projectXLabel}
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button
                variant="outline"
                className="border-slate-700 hover:bg-slate-800"
              >
                {loginLabel}
              </Button>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900">
          <nav className="flex flex-col p-4 space-y-2">
            {/* Main Navigation */}
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <a
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors ${
                      location === item.href
                        ? "text-white bg-slate-800 font-semibold"
                        : "text-slate-400"
                    } ${item.highlight ? "text-blue-400 font-semibold" : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {item.label}
                  </a>
                </Link>
              );
            })}

            {/* Resources Section */}
            <div className="pt-2">
              <div className="px-4 py-2 text-xs text-slate-500 uppercase font-semibold">
                {resourcesLabel}
              </div>
              {resourceItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={`block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors ${
                      location === item.href ? "text-white bg-slate-800" : "text-slate-400"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                </Link>
              ))}
            </div>

            {/* Wallet Connect - Mobile */}
            <div className="pt-4 border-t border-slate-800">
              <WalletConnectButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
