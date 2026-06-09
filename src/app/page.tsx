import HeroSection from '@/components/sections/HeroSection';
import LogoMarquee from '@/components/ui/LogoMarquee';
import CompareSection from '@/components/sections/CompareSection';
import InfoLoopSection from '@/components/sections/InfoLoopSection';
import ValueCardsSection from '@/components/sections/ValueCardsSection';
import MetricsBar from '@/components/sections/MetricsBar';
import StorySection from '@/components/sections/StorySection';
import SocialProof from '@/components/sections/SocialProof';
import SecuritySection from '@/components/sections/SecuritySection';
import BetaSection from '@/components/sections/BetaSection';
import FAQSection from '@/components/sections/FAQSection';
import Footer from '@/components/sections/Footer';

export default function Home() {
  return (
    <main>
      <HeroSection />

      <LogoMarquee />

      <CompareSection />

      <InfoLoopSection />

      <ValueCardsSection />

      <MetricsBar />

      <SecuritySection />

      <StorySection />

      <SocialProof />

      <BetaSection />

      <FAQSection />

      <Footer />
    </main>
  );
}
