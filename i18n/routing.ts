import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "pt", "fr", "es", "ar"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});
