const SITE_URL = "https://localeconomydata.com";
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;

type MetaInput = {
  title: string;
  description: string;
  path?: string;
  type?: string;
  image?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

const ensureMeta = (selector: string, create: () => HTMLMetaElement) => {
  let node = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!node) {
    node = create();
    document.head.appendChild(node);
  }
  return node;
};

const setMetaName = (name: string, content: string) => {
  ensureMeta(`meta[name="${name}"]`, () => {
    const meta = document.createElement("meta");
    meta.setAttribute("name", name);
    return meta;
  }).setAttribute("content", content);
};

const setMetaProperty = (property: string, content: string) => {
  ensureMeta(`meta[property="${property}"]`, () => {
    const meta = document.createElement("meta");
    meta.setAttribute("property", property);
    return meta;
  }).setAttribute("content", content);
};

export const canonicalUrl = (path = window.location.pathname) => `${SITE_URL}${path.split("?")[0] || "/"}`;

export function updateSeo({ title, description, path, type = "website", image = DEFAULT_IMAGE, jsonLd }: MetaInput) {
  const url = canonicalUrl(path);
  document.title = title;
  setMetaName("description", description);
  setMetaProperty("og:title", title);
  setMetaProperty("og:description", description);
  setMetaProperty("og:type", type);
  setMetaProperty("og:url", url);
  setMetaProperty("og:image", image);
  setMetaName("twitter:card", "summary_large_image");
  setMetaName("twitter:title", title);
  setMetaName("twitter:description", description);
  setMetaName("twitter:image", image);

  let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = url;

  document.querySelectorAll("script[data-seo-jsonld='true']").forEach((node) => node.remove());
  if (jsonLd) {
    const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
    for (const item of items) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.seoJsonld = "true";
      script.text = JSON.stringify(item);
      document.head.appendChild(script);
    }
  }
}

export const slugify = (value: string) => value.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export { SITE_URL };
