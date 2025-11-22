import React from "react";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingHighlights } from "@/components/landing/LandingHighlights";
import { LandingWhySection } from "@/components/landing/LandingWhySection";
import { LandingTgeSection } from "@/components/landing/LandingTgeSection";
import { LandingRwaPreview } from "@/components/landing/LandingRwaPreview";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingRoadmap } from "@/components/landing/LandingRoadmap";

export default function Landing() {
  return (
    <LandingLayout>
      <LandingHero />
      <LandingHighlights />
      <LandingWhySection />
      <LandingTgeSection />
      <LandingRwaPreview />
      <LandingHowItWorks />
      <LandingRoadmap />
    </LandingLayout>
  );
}
