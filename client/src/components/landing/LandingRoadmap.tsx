import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { ThemedCard } from "@/components/themed";
import { Section } from "@/components/layout/Section";

export function LandingRoadmap() {
  const { theme } = useTheme();
  const { t } = useI18n();

  const phases = [
      t('landing.roadmap.phase1'),
      t('landing.roadmap.phase2'),
      t('landing.roadmap.phase3'),
      t('landing.roadmap.phase4'),
  ];

  return (
    <Section title={t('landing.roadmap.title')}>
      <ThemedCard className="p-6">
        <div className="space-y-4">
            {phases.map((phase, i) => (
                <div key={i} className="flex items-center gap-4">
                    <div className={cn(
                        "w-3 h-3 rounded-full",
                         theme === 'cyberpunk' ? "bg-cyan-500" : "bg-blue-600"
                    )}></div>
                    <div className="font-medium">{phase}</div>
                </div>
            ))}
        </div>
      </ThemedCard>
    </Section>
  );
}
