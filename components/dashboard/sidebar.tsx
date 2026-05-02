"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Bell,
  Bot,
  ChartColumnBig,
  CircleDollarSign,
  Cog,
  CreditCard,
  FileChartColumnIncreasing,
  FolderKanban,
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
      <div className="flex h-16 items-center gap-2 border-b border-[#6e8eb6]/25 px-6">
        <FolderKanban className="h-5 w-5 text-[#f8fbff]" />
        <div>
          <p className="text-sm text-[#92b6ff]/70">Fineloia</p>
          <p className="text-sm font-semibold text-[#f8fbff]">{organizationName}</p>
        </div>
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
