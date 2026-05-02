"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/lib/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Select } from "@/components/ui/select";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Select
      value={locale}
      onChange={(event) =>
        router.replace(pathname, { locale: event.target.value as (typeof routing.locales)[number] })
      }
      className="h-9 w-[88px] border-[#d3e2fb] bg-[var(--white)] text-[#44648a]"
    >
      {routing.locales.map((loc) => (
        <option key={loc} value={loc}>
          {loc.toUpperCase()}
        </option>
      ))}
    </Select>
  );
}
