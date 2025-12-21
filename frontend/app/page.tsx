import HeroSection from '@/components/HeroSection';
import WhatIsUpSoshSection from '@/components/WhatIsUpSoshSection';
import ToggleDemoSection from '@/components/ToggleDemoSection';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import DownloadCTASection from '@/components/DownloadCTASection';
import { generateOrganizationSchema } from '@/src/lib/structuredData';

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationSchema()) }}
      />
      <HeroSection />
      <WhatIsUpSoshSection />
      <ToggleDemoSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <DownloadCTASection />
    </main>
  );
}
