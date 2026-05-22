import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { BottomNav } from "@/components/bottom-nav";
import { PWARegister } from "@/components/pwa-register";
import { RecruiterProvider } from "@/components/recruiter-provider";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HYREME Recruiter",
  description:
    "Recruiter-first workspace for discovering video resumes, messaging candidates, and scheduling interviews.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hyreme",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${spaceGrotesk.variable} h-full`}
    >
      <body className="min-h-full bg-[var(--background)] pb-24 text-[var(--foreground)] antialiased sm:pb-28">
        <RecruiterProvider>
          {children}
          <BottomNav />
          <PWARegister />
        </RecruiterProvider>
      </body>
    </html>
  );
}
