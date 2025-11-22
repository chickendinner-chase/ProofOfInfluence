import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Section } from "@/components/layout/Section";
import { RwaMarket as RwaMarketComponent } from "@/components/rwa/RwaMarket";

export default function RWAMarket() {
  return (
    <PageLayout>
      <Section className="pt-12">
        <RwaMarketComponent />
      </Section>
    </PageLayout>
  );
}
