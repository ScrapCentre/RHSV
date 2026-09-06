const BASE_URL = "https://www.scrapcentre.com";

/**
 * Generates canonical and hreflang alternate URLs for bilingual Next.js routing.
 * Follows 'as-needed' locale prefix:
 * - English (default): unprefixed (e.g., https://www.scrapcentre.com/about)
 * - Hindi: /hi prefix (e.g., https://www.scrapcentre.com/hi/about)
 * - x-default: points to the default English URL
 *
 * @param locale Current active locale ('en' | 'hi')
 * @param path Relative path (e.g., '/about', '/contact', '' for home)
 */
export function getAlternates(locale: "en" | "hi", path: string = "") {
  const cleanPath = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  const normalizedPath = cleanPath === "/" ? "" : cleanPath;

  const enUrl = `${BASE_URL}${normalizedPath}`;
  const hiUrl = `${BASE_URL}/hi${normalizedPath}`;

  const canonical = locale === "hi" ? hiUrl : enUrl;

  return {
    canonical,
    languages: {
      en: enUrl,
      hi: hiUrl,
      "x-default": enUrl,
    },
  };
}
