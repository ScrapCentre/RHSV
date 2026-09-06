import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // Validate that the incoming locale is one of our supported locales.
  // Fall back to defaultLocale if not.
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "en" | "hi")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (
      await import(`../messages/${locale}.json`)
    ).default,
  };
});
