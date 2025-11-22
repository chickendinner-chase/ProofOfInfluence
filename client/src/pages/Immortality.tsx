import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ImmortalityChat } from "@/components/ImmortalityChat";

export default function Immortality() {
  return (
    <PageLayout className="flex flex-col min-h-screen">
      {/* Main Content Area - ChatGPT Style: Full-width centered chat */}
      <div className="flex-1 flex justify-center min-h-0">
        <div className="w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl px-4 py-6 pb-8 flex flex-col">
          <div className="flex-1 min-h-0">
            <ImmortalityChat />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
