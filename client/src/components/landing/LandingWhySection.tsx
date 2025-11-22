import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { ThemedCard } from "@/components/themed";
import { Section } from "@/components/layout/Section";
import { Zap, Globe, Lock } from "lucide-react";

export function LandingWhySection() {
  const { theme } = useTheme();
  const { t } = useI18n();

  const features = [
    {
      icon: Zap,
      title: t('landing.why.card1_title'),
      desc: t('landing.why.card1_desc'),
    },
    {
      icon: Globe,
      title: t('landing.why.card2_title'),
      desc: t('landing.why.card2_desc'),
    },
    {
      icon: Lock,
      title: t('landing.why.card3_title'),
      desc: t('landing.why.card3_desc'),
    },
  ];

  return (
      <Section title={t('landing.why.title')} subtitle={t('landing.why.desc')}>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <ThemedCard key={feature.title} hover className="p-5">
                <Icon className={cn(
                  'w-10 h-10 mb-3',
                  theme === 'cyberpunk' ? 'text-cyan-400' : 'text-blue-600'
                )} />
                <h3 className={cn(
                  'text-base font-semibold mb-2',
                  theme === 'cyberpunk' ? 'font-rajdhani' : 'font-poppins'
                )}>
                  {feature.title}
                </h3>
                <p className="text-sm opacity-80">{feature.desc}</p>
              </ThemedCard>
            );
          })}
        </div>
      </Section>
  );
}
