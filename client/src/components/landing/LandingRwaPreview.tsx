import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { ThemedCard } from "@/components/themed";
import { Section } from "@/components/layout/Section";
import { TrendingUp } from "lucide-react";

export function LandingRwaPreview() {
  const { theme } = useTheme();
  const { t } = useI18n();

  const assets = [
    { name: t('landing.rwa.card1_name'), roi: t('landing.rwa.card1_roi') },
    { name: t('landing.rwa.card2_name'), roi: t('landing.rwa.card2_roi') },
    { name: t('landing.rwa.card3_name'), roi: t('landing.rwa.card3_roi') },
  ];

  return (
      <Section title={t('landing.rwa.title')} subtitle={t('landing.rwa.subtitle')}>
        <div className="grid gap-4 md:grid-cols-3">
          {assets.map((asset) => (
            <ThemedCard key={asset.name} hover className="p-6">
               <TrendingUp className={cn(
                  'w-8 h-8 mb-3',
                  theme === 'cyberpunk' ? 'text-green-400' : 'text-green-600'
                )} />
              <h4 className="font-bold text-lg mb-1">{asset.name}</h4>
              <div className="text-2xl font-bold text-green-500">{asset.roi}</div>
            </ThemedCard>
          ))}
        </div>
      </Section>
  );
}
