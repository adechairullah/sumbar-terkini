'use client';

import React, { useState } from 'react';
import { EditorialNavbar } from '@/components/editorial/EditorialNavbar';
import { EditorialHero } from '@/components/editorial/EditorialHero';
import { PlatformAnalyticsSection } from '@/components/editorial/PlatformAnalyticsSection';
import { RateCardPricingSection } from '@/components/editorial/RateCardPricingSection';
import { PortfolioShowcaseSection } from '@/components/editorial/PortfolioShowcaseSection';
import { OrderCalculatorSection } from '@/components/editorial/OrderCalculatorSection';
import { TermsAccordionSection } from '@/components/editorial/TermsAccordionSection';
import { EditorialFooter } from '@/components/editorial/EditorialFooter';
import { MobileStickyCta } from '@/components/editorial/MobileStickyCta';

export function PublicMediaKitView() {
  const [selectedPackageId, setSelectedPackageId] = useState<string>('combo-reels');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-700 selection:text-white">
      {/* 1. Navbar */}
      <EditorialNavbar />

      {/* 2. Brand Profile & Hero */}
      <EditorialHero />

      {/* 3. Social Media Analytics & Demographics */}
      <PlatformAnalyticsSection />

      {/* 4. Rate Card & Pricing Packages */}
      <RateCardPricingSection onSelectPackage={setSelectedPackageId} />

      {/* 5. Instagram Collaboration Portfolio Grid */}
      <PortfolioShowcaseSection />

      {/* 6. Interactive Order Calculator + WhatsApp Generator */}
      <OrderCalculatorSection
        selectedPackageId={selectedPackageId}
        onSelectPackage={setSelectedPackageId}
      />

      {/* 7. Terms & Conditions Accordion */}
      <TermsAccordionSection />

      {/* 8. Footer */}
      <EditorialFooter />

      {/* 9. Mobile Sticky CTA Bar */}
      <MobileStickyCta />
    </div>
  );
}
