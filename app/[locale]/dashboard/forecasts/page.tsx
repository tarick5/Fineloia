import { requireUser } from "@/lib/auth";
import { getOrganizationForUser } from "@/lib/dashboard-data";
import { ForecastGenerator } from "@/components/dashboard/forecast-generator";

export default async function ForecastsPage() {
  const user = await requireUser();
  const organization = await getOrganizationForUser(user.id);

  if (!organization) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Forecasts</h1>
      <ForecastGenerator organizationId={organization.id} />
    </div>
  );
}
