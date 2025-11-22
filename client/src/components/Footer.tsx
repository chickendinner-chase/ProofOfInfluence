import { Link } from "wouter";
import { ROUTES } from "@/routes";

interface FooterProps {
  lang?: "zh" | "en";
}

export default function Footer({ lang = "zh" }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const footerLinks = lang === "zh"
    ? {
        products: { label: "产品", href: ROUTES.SOLUTIONS },
        creators: { label: "创作者", href: ROUTES.SOLUTIONS },
        brands: { label: "品牌", href: ROUTES.SOLUTIONS },
        useCases: { label: "应用案例", href: ROUTES.USE_CASES },
        whitepaper: { label: "白皮书", href: ROUTES.WHITEPAPER },
        tokenomics: { label: "代币经济", href: `${ROUTES.WHITEPAPER}/tokenomics.md` },
        compliance: { label: "合规", href: ROUTES.ABOUT },
        changelog: { label: "更新日志", href: ROUTES.ABOUT },
        company: { label: "公司", href: ROUTES.ABOUT },
      }
    : {
        products: { label: "Products", href: ROUTES.SOLUTIONS },
        creators: { label: "For Creators", href: ROUTES.SOLUTIONS },
        brands: { label: "For Brands", href: ROUTES.SOLUTIONS },
        useCases: { label: "Use Cases", href: ROUTES.USE_CASES },
        whitepaper: { label: "Whitepaper", href: ROUTES.WHITEPAPER },
        tokenomics: { label: "Tokenomics", href: `${ROUTES.WHITEPAPER}/tokenomics.md` },
        compliance: { label: "Compliance", href: ROUTES.ABOUT },
        changelog: { label: "Changelog", href: ROUTES.ABOUT },
        company: { label: "Company", href: ROUTES.ABOUT },
      };

  return (
    <footer className="border-t border-slate-800 mt-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-bold text-xl text-white mb-4">ACEE Ventures</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              {lang === "zh"
                ? "您的一站式 Web3 产品发行平台。我们帮助品牌方、开发者和创作者轻松进入加密世界。"
                : "Your one-stop Web3 product issuance platform. We empower brands, developers, and creators to seamlessly enter the crypto space."}
            </p>
          </div>

          {/* Products & Services */}
          <div>
            <h4 className="font-semibold text-white mb-4">
              {lang === "zh" ? "产品与服务" : "Products & Services"}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={footerLinks.products.href} className="text-slate-400 hover:text-white transition-colors">
                  {footerLinks.products.label}
                </Link>
              </li>
              <li>
                <Link href={footerLinks.creators.href} className="text-slate-400 hover:text-white transition-colors">
                  {footerLinks.creators.label}
                </Link>
              </li>
              <li>
                <Link href={footerLinks.brands.href} className="text-slate-400 hover:text-white transition-colors">
                  {footerLinks.brands.label}
                </Link>
              </li>
              <li>
                <Link href={footerLinks.useCases.href} className="text-slate-400 hover:text-white transition-colors">
                  {footerLinks.useCases.label}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-white mb-4">
              {lang === "zh" ? "资源" : "Resources"}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={footerLinks.whitepaper.href} className="text-slate-400 hover:text-white transition-colors">
                  {footerLinks.whitepaper.label}
                </Link>
              </li>
              <li>
                <Link href={footerLinks.tokenomics.href} className="text-slate-400 hover:text-white transition-colors">
                  {footerLinks.tokenomics.label}
                </Link>
              </li>
              <li>
                <Link href={footerLinks.compliance.href} className="text-slate-400 hover:text-white transition-colors">
                  {footerLinks.compliance.label}
                </Link>
              </li>
              <li>
                <Link href={footerLinks.changelog.href} className="text-slate-400 hover:text-white transition-colors">
                  {footerLinks.changelog.label}
                </Link>
              </li>
              <li>
                <Link href={footerLinks.company.href} className="text-slate-400 hover:text-white transition-colors">
                  {footerLinks.company.label}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © {currentYear} ACEE Ventures. {lang === "zh" ? "保留所有权利。" : "All rights reserved."}
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">
              {lang === "zh" ? "隐私政策" : "Privacy Policy"}
            </a>
            <a href="#" className="hover:text-white transition-colors">
              {lang === "zh" ? "服务条款" : "Terms of Service"}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
