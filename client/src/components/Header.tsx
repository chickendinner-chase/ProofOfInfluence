import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
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

  const navItems = lang === "zh" 
    ? [
        { label: "首页", href: "/" },
        { label: "产品", href: "/products" },
        { label: "创作者", href: "/for-creators" },
        { label: "品牌", href: "/for-brands" },
        { label: "应用案例", href: "/use-cases" },
        { label: "Token & 文档", href: "/token-docs" },
        { label: "合规", href: "/compliance" },
        { label: "更新日志", href: "/changelog" },
        { label: "公司", href: "/company" },
      ]
    : [
        { label: "Home", href: "/" },
        { label: "Products", href: "/products" },
        { label: "For Creators", href: "/for-creators" },
        { label: "For Brands", href: "/for-brands" },
        { label: "Use Cases", href: "/use-cases" },
        { label: "Token & Docs", href: "/token-docs" },
        { label: "Compliance", href: "/compliance" },
        { label: "Changelog", href: "/changelog" },
        { label: "Company", href: "/company" },
      ];

  const dashboardLabel = lang === "zh" ? "控制面板" : "Dashboard";
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
        <nav className="hidden lg:flex gap-6 text-sm">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className={`hover:text-white transition-colors ${
                  location === item.href ? "text-white font-semibold" : "text-slate-400"
                }`}
              >
                {item.label}
              </a>
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Wallet Connect - Desktop */}
          <div className="hidden md:block">
            <WalletConnectButton />
          </div>

          {/* Dashboard Link */}
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button
                variant="default"
                className="bg-white text-slate-900 hover:bg-slate-100"
              >
                {dashboardLabel}
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard">
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
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={`block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors ${
                    location === item.href
                      ? "text-white bg-slate-800 font-semibold"
                      : "text-slate-400"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              </Link>
            ))}
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
