import type { Metadata } from "next";

/** Canonical site origin (www — production redirects apex → www). */
export const siteConfig = {
  name: "TempChair",
  shortName: "TempChair",
  url: "https://www.tempchair.com",
  locale: "en_US",
  description:
    "Dental temp staffing for the Treasure Valley. Connect Boise-area clinics with hygienists, assistants, and dentists — no agency markup.",
  keywords: [
    "dental temp staffing Boise",
    "dental hygienist temp jobs Idaho",
    "temp dental assistant Boise",
    "dental temp agency Boise",
    "fill dental chair Boise",
    "dental staffing Treasure Valley",
    "TempChair",
  ],
  /** Default share image (absolute path under public/) */
  ogImage: "/icon.png",
} as const;

type BuildMetadataInput = {
  title: string;
  description: string;
  /** Path starting with / e.g. /pricing */
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
  /** Override OG/Twitter image path */
  image?: string;
  /**
   * Use absolute title (no "| TempChair" template).
   * Defaults true for home path `/`.
   */
  absoluteTitle?: boolean;
};

/**
 * Build consistent page Metadata with Open Graph + Twitter + canonical.
 */
export function createMetadata({
  title,
  description,
  path = "/",
  keywords,
  noIndex = false,
  image = siteConfig.ogImage,
  absoluteTitle = path === "/",
}: BuildMetadataInput): Metadata {
  const url = path === "/" ? siteConfig.url : `${siteConfig.url}${path}`;
  const imageUrl = image.startsWith("http") ? image : image;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: keywords ?? [...siteConfig.keywords],
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 512,
          height: 512,
          alt: `${siteConfig.name} — dental temp staffing`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [imageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
  };
}
