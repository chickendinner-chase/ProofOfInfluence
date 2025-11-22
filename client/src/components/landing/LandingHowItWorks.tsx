import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { ThemedCard } from "@/components/themed";
import { Section } from "@/components/layout/Section";

export function LandingHowItWorks() {
  const { theme } = useTheme();
  const { t } = useI18n();

  const steps = [
    { title: t('landing.how.step1_title'), desc: t('landing.how.step1_desc'), step: 1 },
    { title: t('landing.how.step2_title'), desc: t('landing.how.step2_desc'), step: 2 },
    { title: t('landing.how.step3_title'), desc: t('landing.how.step3_desc'), step: 3 },
  ];

  return (
    <Section title={t('landing.how.title')}>
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <ThemedCard key={s.step} className="p-6 relative">
            <div className={cn(
              "absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold",
              theme === 'cyberpunk' ? "bg-cyan-500 text-black" : "bg-blue-600 text-white"
            )}>
              {s.step}
            </div>
            <h3 className="text-xl font-bold mb-2 mt-2">{s.title}</h3>
            <p className="opacity-80">{s.desc}</p>
          </ThemedCard>
        ))}
      </div>
    </Section>
  );
}
