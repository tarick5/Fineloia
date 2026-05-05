import { DemoDashboardMockup } from "@/components/dashboard/demo-dashboard-mockup";

export default function DemoDashboardPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const section = typeof searchParams?.section === "string" ? searchParams.section : undefined;
  const period = typeof searchParams?.period === "string" ? searchParams.period : undefined;

  return (
    <div className="min-h-screen bg-[#f8fbff]">
      <DemoDashboardMockup interactive section={section} period={period} showBadges={false} fullscreen />
    </div>
  );
}
