import type { Metadata } from "next";

export const siteConfig = {
  name: "LocalEconomyData",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://localeconomydata.com",
  description: "County-level business expansion, workforce, and local economy intelligence.",
  creator: "Westley Sturhan"
};

export function metadata({
  title,
  description,
  path = "/",
  type = "website"
}: {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article";
}): Metadata {
  const url = `${siteConfig.url}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type,
      images: [{ url: `${siteConfig.url}/og-image.svg`, width: 1200, height: 630, alt: siteConfig.name }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteConfig.url}/og-image.svg`]
    }
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    creator: siteConfig.creator
  };
}

export function breadcrumbsJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`
    }))
  };
}

export function articleJsonLd(title: string, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `${siteConfig.url}${path}`,
    author: { "@type": "Person", name: siteConfig.creator },
    publisher: { "@type": "Organization", name: siteConfig.name }
  };
}

export function datasetJsonLd(name: string, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name,
    description,
    url: `${siteConfig.url}${path}`,
    publisher: { "@type": "Organization", name: siteConfig.name },
    variableMeasured: ["workforce", "industry fit", "cost competitiveness", "market access", "unemployment", "education"]
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}
