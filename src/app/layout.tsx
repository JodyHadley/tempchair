import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/layout/providers";
import { HelpBanner } from "@/components/ui/help-banner";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tempchair.com"),
  title: {
    default: "TempChair — Dental Temp Staffing in Boise & Treasure Valley",
    template: "%s | TempChair",
  },
  description:
    "Dental temp staffing for the Treasure Valley. Connect Boise-area clinics with hygienists, assistants, and dentists — no agency markup.",
  applicationName: "TempChair",
  keywords: [
    "dental temp staffing Boise",
    "dental hygienist temp jobs Idaho",
    "temp dental assistant Boise",
    "dental temp agency Boise",
    "dental staffing Treasure Valley",
    "TempChair",
  ],
  authors: [{ name: "TempChair", url: "https://www.tempchair.com" }],
  creator: "TempChair",
  publisher: "TempChair",
  category: "healthcare",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.tempchair.com",
    siteName: "TempChair",
    title: "TempChair — Dental Temp Staffing in Boise & Treasure Valley",
    description:
      "Connect clinics with hygienists, assistants, and dentists for temporary shifts. Local to Boise — no agency markup.",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "TempChair — dental temp staffing",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "TempChair — Dental Temp Staffing in Boise",
    description:
      "Connect clinics with hygienists, assistants, and dentists for temporary shifts. Local to Boise — no agency markup.",
    images: ["/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    // Bold filled mark — readable at 16–32px (thin line-art chair is not)
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Header />
          <HelpBanner />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
