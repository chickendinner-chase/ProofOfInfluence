import React from 'react';
import { PageLayout } from '../layout/PageLayout';

interface LandingLayoutProps {
  children: React.ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <PageLayout>
      {children}
    </PageLayout>
  );
}
