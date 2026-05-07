import { Sidebar, MobileBottomTabs } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

/**
 * Dashboard layout — quiet, dense, no decorative animation.
 *
 * Phase 4 dropped the AnimatedOrbs background that used to drift behind every
 * dashboard surface. UI panel review called it out as the #1 visual-noise
 * offender on workspace pages — Linear, Notion, Mintlify never animate the
 * dashboard background. Marketing keeps the orbs.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 px-3 pb-24 pt-6 sm:px-6 md:pb-12 lg:px-10"
          >
            {children}
          </main>
        </div>
      </div>
      <MobileBottomTabs />
    </>
  );
}
