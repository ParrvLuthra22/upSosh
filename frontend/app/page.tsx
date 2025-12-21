import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/src/components/FeaturesSection';
import { generateOrganizationSchema } from '@/src/lib/structuredData';

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationSchema()) }}
      />
      <HeroSection />
      <FeaturesSection />
    </main>
  );
}
