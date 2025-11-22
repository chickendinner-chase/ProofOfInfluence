import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { Section } from "@/components/layout/Section";

export function LandingHighlights() {
  const { theme } = useTheme();
  const { t } = useI18n();

  return (
    <Section className="py-8">
      <div className="flex flex-col md:flex-row gap-4 justify-around items-center bg-slate-900/50 p-6 rounded-lg border border-slate-800">
          <div className="text-center">
              <div className={cn("text-xl font-bold", theme === 'cyberpunk' ? "text-cyan-400" : "text-blue-600")}>
                  {t('landing.highlights.immortality')}
              </div>
          </div>
          <div className="w-px h-8 bg-slate-700 hidden md:block"></div>
          <div className="text-center">
              <div className={cn("text-xl font-bold", theme === 'cyberpunk' ? "text-purple-400" : "text-green-600")}>
                  {t('landing.highlights.tge')}
              </div>
          </div>
      </div>
    </Section>
  );
}
