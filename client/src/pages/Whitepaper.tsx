import React, { useEffect, useState } from "react";
import { useLocation, useRoute, Link as WouterLink } from "wouter";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { ThemedCard, ThemedButton } from "@/components/themed";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { ArrowLeft, FileText, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface WhitepaperDoc {
  content: string;
  path: string;
}

export default function Whitepaper() {
  const [location] = useLocation();
  const { theme } = useTheme();
  const [doc, setDoc] = useState<WhitepaperDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Try to get route params for nested paths
  const [, paramsNested] = useRoute("/docs/whitepaper/:dir/:file");
  const [, paramsSingle] = useRoute("/docs/whitepaper/:file");

  // Extract file path from URL
  const getFilePath = () => {
    if (location === "/docs/whitepaper" || location === "/docs/whitepaper/") {
      return "README.md";
    }
    
    // Check for nested path (e.g., projectex/overview.md)
    if (paramsNested?.dir && paramsNested?.file) {
      const filePath = `${paramsNested.dir}/${paramsNested.file}`;
      return filePath.endsWith(".md") ? filePath : `${filePath}.md`;
    }
    
    // Check for single file path (e.g., tokenomics.md)
    if (paramsSingle?.file) {
      const filePath = paramsSingle.file;
      return filePath.endsWith(".md") ? filePath : `${filePath}.md`;
    }
    
    // Fallback: extract from location
    const match = location.match(/^\/docs\/whitepaper\/(.+)$/);
    if (match) {
      const filePath = match[1];
      return filePath.endsWith(".md") ? filePath : `${filePath}.md`;
    }
    return "README.md";
  };

  useEffect(() => {
    const loadDocument = async () => {
      setLoading(true);
      setError(null);
      try {
        const filePath = getFilePath();
        const response = await fetch(`/api/docs/whitepaper/${filePath}`);
        if (!response.ok) {
          throw new Error("Document not found");
        }
        const data = await response.json();
        setDoc(data);
      } catch (err: any) {
        setError(err.message || "Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [location]);

  const docLinks = [
    { label: "白皮书概览", path: "README.md", href: "/docs/whitepaper" },
    { label: "价值互联网", path: "value-internet.md", href: "/docs/whitepaper/value-internet.md" },
    { label: "ProjectEX 平台", path: "projectex/overview.md", href: "/docs/whitepaper/projectex/overview.md" },
    { label: "Cyber Immortality", path: "cyber-immortality/overview.md", href: "/docs/whitepaper/cyber-immortality/overview.md" },
    { label: "代币经济学", path: "tokenomics.md", href: "/docs/whitepaper/tokenomics.md" },
    { label: "贡献指南", path: "contributing.md", href: "/docs/whitepaper/contributing.md" },
    { label: "API 文档", path: "api-docs.md", href: "/docs/whitepaper/api-docs.md" },
  ];

  return (
    <PageLayout>
      <Section>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <WouterLink href="/token">
                <ThemedButton variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回
                </ThemedButton>
              </WouterLink>
              <div>
                <h1 className={cn(
                  'text-2xl md:text-3xl font-bold mb-2',
                  theme === 'cyberpunk' ? 'font-orbitron' : 'font-fredoka'
                )}>
                  <BookOpen className={cn(
                    'w-6 h-6 inline mr-2',
                    theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
                  )} />
                  Acee 白皮书
                </h1>
                <p className="text-sm opacity-70">
                  Building the Value Internet
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {/* Sidebar - Document Navigation */}
            <div className="md:col-span-1">
              <ThemedCard className="p-4 sticky top-4">
                <h3 className={cn(
                  'font-bold mb-4 flex items-center gap-2',
                  theme === 'cyberpunk' ? 'font-rajdhani text-cyan-200' : 'font-poppins text-slate-900'
                )}>
                  <FileText className="w-4 h-4" />
                  文档目录
                </h3>
                <ul className="space-y-2 text-sm">
                  {docLinks.map((link) => (
                    <li key={link.path}>
                      <WouterLink
                        href={link.href}
                        className={cn(
                          'block p-2 rounded transition-colors cursor-pointer',
                          location === link.href || (link.href === "/docs/whitepaper" && location === "/docs/whitepaper/")
                            ? theme === 'cyberpunk'
                              ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40'
                              : 'bg-blue-100 text-blue-600 border border-blue-300'
                            : theme === 'cyberpunk'
                              ? 'hover:bg-slate-800 text-slate-300'
                              : 'hover:bg-slate-100 text-slate-600'
                        )}
                      >
                        {link.label}
                      </WouterLink>
                    </li>
                  ))}
                </ul>
              </ThemedCard>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3">
              <ThemedCard className="p-6 md:p-8">
                {loading && (
                  <div className="text-center py-12">
                    <div className={cn(
                      'inline-block animate-spin rounded-full h-8 w-8 border-b-2',
                      theme === 'cyberpunk' ? 'border-cyan-400' : 'border-blue-600'
                    )} />
                    <p className="mt-4 text-sm opacity-70">加载文档中...</p>
                  </div>
                )}

                {error && (
                  <div className="text-center py-12">
                    <p className="text-red-500 mb-4">{error}</p>
                    <WouterLink href="/token">
                      <ThemedButton variant="outline">
                        返回代币页面
                      </ThemedButton>
                    </WouterLink>
                  </div>
                )}

                {doc && !loading && !error && (
                  <div className={cn(
                    'prose prose-invert max-w-none',
                    theme === 'cyberpunk' 
                      ? 'prose-headings:text-cyan-200 prose-p:text-slate-300 prose-a:text-cyan-400 prose-strong:text-white prose-code:text-green-400'
                      : 'prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-blue-600 prose-strong:text-slate-900 prose-code:text-green-600'
                  )}>
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className={cn(
                            'text-3xl font-bold mb-4 mt-8',
                            theme === 'cyberpunk' ? 'font-orbitron text-cyan-200' : 'font-fredoka text-slate-900'
                          )}>
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className={cn(
                            'text-2xl font-bold mb-3 mt-6',
                            theme === 'cyberpunk' ? 'font-orbitron text-cyan-300' : 'font-fredoka text-slate-800'
                          )}>
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className={cn(
                            'text-xl font-semibold mb-2 mt-4',
                            theme === 'cyberpunk' ? 'font-rajdhani text-cyan-300' : 'font-poppins text-slate-800'
                          )}>
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className={cn(
                            'mb-4 leading-relaxed',
                            theme === 'cyberpunk' ? 'text-slate-300' : 'text-slate-700'
                          )}>
                            {children}
                          </p>
                        ),
                        code: ({ children, className }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code className={cn(
                              'px-1.5 py-0.5 rounded text-sm',
                              theme === 'cyberpunk'
                                ? 'bg-slate-800 text-green-400 border border-cyan-400/20'
                                : 'bg-slate-100 text-green-600 border border-slate-200'
                            )}>
                              {children}
                            </code>
                          ) : (
                            <code className={cn(
                              'block p-4 rounded-lg mb-4 overflow-x-auto text-sm',
                              theme === 'cyberpunk'
                                ? 'bg-slate-900 text-green-400 border border-cyan-400/20'
                                : 'bg-slate-50 text-green-600 border border-slate-200'
                            )}>
                              {children}
                            </code>
                          );
                        },
                        ul: ({ children }) => (
                          <ul className={cn(
                            'list-disc pl-6 mb-4 space-y-2',
                            theme === 'cyberpunk' ? 'text-slate-300' : 'text-slate-700'
                          )}>
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className={cn(
                            'list-decimal pl-6 mb-4 space-y-2',
                            theme === 'cyberpunk' ? 'text-slate-300' : 'text-slate-700'
                          )}>
                            {children}
                          </ol>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className={cn(
                            'border-l-4 pl-4 py-2 my-4 italic',
                            theme === 'cyberpunk'
                              ? 'border-cyan-400/50 bg-slate-900/50'
                              : 'border-blue-300 bg-blue-50'
                          )}>
                            {children}
                          </blockquote>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            className={cn(
                              'underline hover:no-underline',
                              theme === 'cyberpunk' ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-700'
                            )}
                            target={href?.startsWith('http') ? '_blank' : undefined}
                            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {doc.content}
                    </ReactMarkdown>
                  </div>
                )}
              </ThemedCard>
            </div>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
}

