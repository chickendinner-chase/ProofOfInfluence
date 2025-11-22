import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { ThemedCard, ThemedButton } from "@/components/themed";
import { Section } from "@/components/layout/Section";
import { Rocket, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { ROUTES } from "@/routes";

export function LandingTgeSection() {
  const { theme } = useTheme();
  const { t } = useI18n();

  return (
    <Section>
        <ThemedCard className="p-8 text-center">
          <Rocket className={cn(
            'w-12 h-12 mx-auto mb-4',
            theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
          )} />
          <h3 className={cn(
            'text-2xl font-bold mb-2',
            theme === 'cyberpunk' ? 'font-orbitron' : 'font-fredoka'
          )}>
            {t('landing.highlights.tge')}
          </h3>
          <p className="text-sm opacity-80 mb-6 max-w-2xl mx-auto">
            {t('landing.highlights.tge_desc')}
          </p>
          <div className="flex justify-center gap-3">
            <Link href={ROUTES.TGE}>
              <ThemedButton emphasis size="lg">
                {t('landing.hero.cta_start')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </ThemedButton>
            </Link>
          </div>
        </ThemedCard>
    </Section>
  );
}
