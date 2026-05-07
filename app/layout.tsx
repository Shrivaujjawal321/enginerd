import type { Metadata } from "next";
import { Geist, Geist_Mono, Hind } from "next/font/google";
import { Toaster } from "sonner";
import { auth } from "@/auth";
import { SessionProvider } from "@/components/auth/session-provider";
import { PostHogProvider } from "@/components/shared/posthog-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Hind covers Devanagari — used as a fallback whenever Hindi script appears
// inside Hinglish content (e.g. "मेमोरी", "हाँ"). Geist has no Devanagari
// glyphs, so without this the browser falls back to a system default and the
// content reader looks broken on the Hindi-script bits.
const hind = Hind({
  variable: "--font-hind",
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "EngiNerd — A shortcut to becoming an engineer",
    template: "%s · EngiNerd",
  },
  description:
    "Curated roadmaps, deep subject content in Hinglish, DSA practice, and direct paths to MNC interviews for Indian engineering students.",
  keywords: [
    "engineering",
    "roadmap",
    "DSA practice",
    "Hinglish",
    "Java full stack",
    "MNC interviews",
    "EngiNerd",
  ],
  authors: [{ name: "EngiNerd" }],
  metadataBase: new URL("https://enginerd.in"),
  openGraph: {
    title: "EngiNerd — A shortcut to becoming an engineer",
    description:
      "Hinglish-first learning platform for Indian engineers. Roadmaps, subjects, DSA practice, and careers — all in one place.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${hind.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-slate-100">
        {/* Skip-to-content link — invisible until focused via Tab.
            WCAG 2.4.1 (Bypass Blocks) Level A. Lets keyboard + AT users
            jump past the navbar/sidebar on every page. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-violet-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
        >
          Skip to content
        </a>
        <SessionProvider session={session}>
          <PostHogProvider>{children}</PostHogProvider>
        </SessionProvider>
        <Toaster
          position="top-right"
          theme="dark"
          richColors={false}
          toastOptions={{
            classNames: {
              toast:
                "!glass !border-white/10 !text-slate-100 !rounded-xl !shadow-2xl",
              title: "!text-slate-50 !font-medium",
              description: "!text-slate-400",
              actionButton: "!gradient-primary !text-white",
              cancelButton: "!bg-white/10 !text-slate-200",
              error: "!border-rose-500/30 !text-rose-200",
              success: "!border-emerald-500/30 !text-emerald-200",
            },
          }}
        />
      </body>
    </html>
  );
}
