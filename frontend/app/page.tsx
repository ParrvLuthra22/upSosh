import HeroSection from '@/components/sections/HeroSection';
import MarqueeBand from '@/components/sections/MarqueeBand';
import HowItWorks from '@/components/sections/HowItWorks';
import FeaturedEvents from '@/components/sections/FeaturedEvents';
import AIPlanner from '@/components/sections/AIPlanner';
import Testimonials from '@/components/sections/Testimonials';
import CTAFooterSection from '@/components/sections/CTAFooterSection';
import { generateOrganizationSchema } from '@/src/lib/structuredData';

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationSchema()) }}
      />
      <HeroSection />
      <MarqueeBand />
      <HowItWorks />
      <FeaturedEvents />
      <AIPlanner />
      <Testimonials />
      <CTAFooterSection />
    </>
  );
}
