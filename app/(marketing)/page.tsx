import { Hero } from "@/components/marketing/hero";
import { FeatureCards } from "@/components/marketing/feature-cards";
import { Pricing } from "@/components/marketing/pricing";
import { FinalCta } from "@/components/marketing/final-cta";

/**
 * Steve Jobs landing — one demo moment, then minimal supporting context.
 *
 * Killed (Phase 4): pipeline.tsx (AI agent flowchart bragging),
 * built-different.tsx (marquee), testimonials.tsx (fabricated reviews).
 *
 * Kept: feature cards (3 paths), pricing (Free + Pro), final CTA.
 * Everything else is on subpages — no marketing kitchen sink.
 */
export default function LandingPage() {
  return (
    <>
      <Hero />
      <FeatureCards />
      <Pricing />
      <FinalCta />
    </>
  );
}
