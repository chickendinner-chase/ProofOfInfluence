import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, ChevronDown, ShoppingCart, Briefcase, Palette, Settings, Languages } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import WalletConnectButton from "@/components/WalletConnectButton";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/i18n";
import { SUPPORTED_LOCALES, LOCALE_LABELS } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/routes";

interface HeaderProps {
  lang?: "zh" | "en";
}

export default function Header({ lang = "zh" }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  const { isAdmin } = useAdminAccess();
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale } = useI18n();

  // Hide Connect Wallet and Login button on /login page
  const isLoginPage = location === ROUTES.LOGIN;

  // Main navigation items (simplified)
  const mainNavItems = lang === "zh" 
    ? [
        { label: "首页", href: ROUTES.HOME },
        { label: "现货交易", href: ROUTES.APP_TRADE, icon: ShoppingCart, highlight: true },
        { label: "RWA市场", href: ROUTES.APP_RWA_MARKET, icon: Briefcase },
        { label: "ProjectEX", href: ROUTES.APP },
      ]
    : [
        { label: "Home", href: ROUTES.HOME },
        { label: "Spot Trading", href: ROUTES.APP_TRADE, icon: ShoppingCart, highlight: true },
        { label: "RWA Market", href: ROUTES.APP_RWA_MARKET, icon: Briefcase },
        { label: "ProjectEX", href: ROUTES.APP },
      ];

  // Resources dropdown items
  const isDev = import.meta.env.MODE === "development" || import.meta.env.DEV;
  const resourceItems = lang === "zh"
    ? [
        { label: "解决方案", href: ROUTES.SOLUTIONS },
        { label: "应用案例", href: ROUTES.USE_CASES },
        { label: "Token 文档", href: ROUTES.TOKEN },
        { label: "关于我们", href: ROUTES.ABOUT },
        { label: "TGE 启动", href: ROUTES.TGE },
        { label: "早鸟空投", href: ROUTES.EARLY_BIRD },
        ...(isDev ? [{ label: "合约调试", href: ROUTES.APP_DEV_CONTRACTS }] : []),
        ...(isAdmin ? [{ label: "AgentKit 配置", href: ROUTES.APP_DEV_AGENTKIT }] : []),
      ]
    : [
        { label: "Solutions", href: ROUTES.SOLUTIONS },
        { label: "Use Cases", href: ROUTES.USE_CASES },
        { label: "Token Docs", href: ROUTES.TOKEN },
        { label: "About Us", href: ROUTES.ABOUT },
        { label: "TGE Launch", href: ROUTES.TGE },
        { label: "Early-Bird", href: ROUTES.EARLY_BIRD },
        { label: "Company", href: ROUTES.ABOUT },
        ...(isDev ? [{ label: "Dev / Contracts", href: ROUTES.APP_DEV_CONTRACTS }] : []),
        ...(isAdmin ? [{ label: "AgentKit Config", href: ROUTES.APP_DEV_AGENTKIT }] : []),
      ];

  const resourcesLabel = lang === "zh" ? "资源" : "Resources";
  const projectEXLabel = lang === "zh" ? "ProjectEX" : "ProjectEX";
  const loginLabel = lang === "zh" ? "登录" : "Login";
  const settingsLabel = lang === "zh" ? "设置" : "Settings";

  const headerStyles = theme === 'cyberpunk'
    ? 'border-b border-cyan-400/20 bg-slate-950/95 backdrop-blur-sm'
    : 'border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm';

  const logoStyles = theme === 'cyberpunk'
    ? 'font-semibold text-lg text-cyan-100 hover:text-cyan-300 transition-colors font-orbitron'
    : 'font-semibold text-lg text-slate-900 hover:text-blue-600 transition-colors font-fredoka';

  return (
    <header className={cn('sticky top-0 z-50', headerStyles)}>
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <Link href={ROUTES.HOME}>
          <div className={cn('cursor-pointer', logoStyles)}>
            ACEE Ventures
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-sm">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 hover:text-white transition-colors ${
                  location === item.href ? "text-white font-semibold" : "text-slate-400"
                } ${item.highlight ? "text-blue-400 font-semibold" : ""}`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {item.label}
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
                  <Link
                    href={item.href}
                    className="w-full text-slate-300 hover:text-white cursor-pointer"
                  >
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                'p-2 rounded-md transition-all outline-none',
                theme === 'cyberpunk'
                  ? 'hover:bg-cyan-400/10 text-cyan-300'
                  : 'hover:bg-slate-100 text-slate-700'
              )}
              aria-label="Select language"
              title="Switch language"
            >
              <Languages className="w-5 h-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className={cn(
              theme === 'cyberpunk'
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-slate-200'
            )}>
              {Object.entries(SUPPORTED_LOCALES).map(([key, value]) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => setLocale(value)}
                  className={cn(
                    'cursor-pointer',
                    locale === value && 'bg-cyan-400/10 text-cyan-300',
                    theme === 'cyberpunk'
                      ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  )}
                >
                  {LOCALE_LABELS[value]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={cn(
              'p-2 rounded-md transition-all',
              theme === 'cyberpunk'
                ? 'hover:bg-cyan-400/10 text-cyan-300'
                : 'hover:bg-slate-100 text-slate-700'
            )}
            aria-label="Toggle theme"
            title={theme === 'cyberpunk' ? 'Switch to Playful theme' : 'Switch to Cyberpunk theme'}
          >
            <Palette className="w-5 h-5" />
          </button>

          {/* Wallet Connect - Desktop (hidden on login page) */}
          {!isLoginPage && (
            <div className="hidden md:block">
              <WalletConnectButton />
            </div>
          )}

          {/* projectEX / Login Link (hidden on login page) */}
          {!isLoginPage && (
            <>
              {isAuthenticated ? (
                <>
                  <Link href={ROUTES.APP}>
                    <Button
                      variant="default"
                      className="bg-white text-slate-900 hover:bg-slate-100"
                    >
                      {projectEXLabel}
                    </Button>
                  </Link>
                  <Link href={ROUTES.APP_SETTINGS}>
                    <Button
                      variant="outline"
                      className="border-slate-700 hover:bg-slate-800"
                      title={settingsLabel}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href={ROUTES.LOGIN}>
                  <Button
                    variant="outline"
                    className="border-slate-700 hover:bg-slate-800"
                  >
                    {loginLabel}
                  </Button>
                </Link>
              )}
            </>
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
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors ${
                    location === item.href
                      ? "text-white bg-slate-800 font-semibold"
                      : "text-slate-400"
                  } ${item.highlight ? "text-blue-400 font-semibold" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.label}
                </Link>
              );
            })}

            {/* Resources Section */}
            <div className="pt-2">
              <div className="px-4 py-2 text-xs text-slate-500 uppercase font-semibold">
                {resourcesLabel}
              </div>
              {resourceItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors ${
                    location === item.href ? "text-white bg-slate-800" : "text-slate-400"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Wallet Connect - Mobile (hidden on login page) */}
            {!isLoginPage && (
              <div className="pt-4 border-t border-slate-800">
                <WalletConnectButton />
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
