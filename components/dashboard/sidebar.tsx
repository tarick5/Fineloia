"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  Bell,
  Bot,
  ChartColumnBig,
  CircleDollarSign,
  Cog,
  CreditCard,
  FileChartColumnIncreasing,
  Landmark,
  LayoutDashboard,
} from "lucide-react";
import { usePathname } from "@/lib/i18n/navigation";
import { Link } from "@/lib/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SidebarProps = {
  alertCount?: number;
  organizationName?: string;
};

export function DashboardSidebar({
  alertCount = 0,
  organizationName = "Organization",
}: SidebarProps) {
  const t = useTranslations("dashboard.nav");
  const pathname = usePathname();

  const items = useMemo(
    () => [
      { href: "/dashboard", label: t("overview"), icon: LayoutDashboard },
      { href: "/dashboard/treasury", label: t("treasury"), icon: Landmark },
      { href: "/dashboard/results", label: t("results"), icon: ChartColumnBig },
      { href: "/dashboard/transactions", label: t("transactions"), icon: CreditCard },
      { href: "/dashboard/reports", label: t("reports"), icon: FileChartColumnIncreasing },
      { href: "/dashboard/forecasts", label: t("forecasts"), icon: CircleDollarSign },
      { href: "/dashboard/advisor", label: t("advisor"), icon: Bot },
      { href: "/dashboard/alerts", label: t("alerts"), icon: Bell },
      { href: "/dashboard/settings", label: t("settings"), icon: Cog },
    ],
    [t],
  );

  return (
    <aside className="hidden w-[280px] border-r border-[#d3e2fb] bg-gradient-to-b from-[#0b1a2b] to-[#132f4a] text-[#92b6ff] lg:block">
      <div className="flex h-16 items-center justify-between border-b border-[#6e8eb6]/25 px-6">
        <Image
          src="/brand/fineloia-logo-transparent.png"
          alt="Fineloia"
          width={1147}
          height={419}
          className="h-10 w-auto object-contain brightness-0 invert"
        />
        <p className="max-w-[120px] truncate text-xs font-medium text-[#92b6ff]/80">{organizationName}</p>
      </div>

      <nav className="space-y-1 p-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-[#2f6fff]/25 text-[#f8fbff]"
                  : "text-[#92b6ff]/85 hover:bg-white/10 hover:text-[#f8fbff]",
              )}
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              {item.href === "/dashboard/alerts" && alertCount > 0 ? (
                <Badge variant="critical">{alertCount}</Badge>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
