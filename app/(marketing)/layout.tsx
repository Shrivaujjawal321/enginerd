import { AnimatedOrbs } from "@/components/shared/animated-orbs";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnimatedOrbs />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
