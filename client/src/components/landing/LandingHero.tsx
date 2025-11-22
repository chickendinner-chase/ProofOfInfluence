import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/routes";
import { ThemedButton, ThemedCard } from "@/components/themed";
import { Section } from "@/components/layout/Section";
import { Link } from "wouter";

export function LandingHero() {
  const { theme } = useTheme();
  const { t } = useI18n();

  const titleStyles = theme === 'cyberpunk'
    ? 'text-3xl md:text-5xl font-extrabold leading-tight font-orbitron tracking-tight'
    : 'text-3xl md:text-5xl font-extrabold leading-tight font-fredoka';

  const subtitleStyles = theme === 'cyberpunk'
    ? 'mt-4 max-w-xl text-sm md:text-base text-slate-300 font-rajdhani'
    : 'mt-4 max-w-xl text-sm md:text-base text-slate-600 font-poppins';

  return (
    <Section className="pt-12 pb-16 md:pt-16 md:pb-24">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <h1 className={titleStyles}>
             {t('landing.hero.title')}
          </h1>
          <p className={subtitleStyles}>
            {t('landing.hero.subtitle')}
          </p>

          <div className="mt-6 flex gap-3 flex-wrap">
            <Link href={ROUTES.APP_IMMORTALITY}>
              <ThemedButton emphasis>
                {t('landing.hero.cta_start')}
              </ThemedButton>
            </Link>
            <Link href={ROUTES.WHITEPAPER}>
              <ThemedButton variant="outline">
                {t('landing.hero.cta_whitepaper')}
              </ThemedButton>
            </Link>
          </div>
        </div>

        <ThemedCard className="p-6">
           <div className={cn(
              'text-xs mb-3',
              theme === 'cyberpunk' ? 'text-cyan-200/80 font-rajdhani' : 'text-slate-500 font-poppins'
            )}>
              {theme === 'cyberpunk' ? 'LIVE • Trading Panel' : 'PLAY • Level Panel'}
            </div>
            <div className="space-y-3">
              <div className={cn(
                'p-4 rounded-lg',
                theme === 'cyberpunk'
                  ? 'bg-slate-900/60 border border-cyan-400/20'
                  : 'bg-slate-50 border border-slate-200'
              )}>
                <div className="text-sm font-semibold mb-2">
                  {theme === 'cyberpunk' ? 'Market Overview' : 'Your Progress'}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="opacity-70">TVL</div>
                    <div className="font-bold text-lg">$12.3M</div>
                  </div>
                  <div>
                    <div className="opacity-70">APR</div>
                    <div className="font-bold text-lg text-green-500">7.8%</div>
                  </div>
                </div>
              </div>
            </div>
        </ThemedCard>
      </div>
    </Section>
  );
}
