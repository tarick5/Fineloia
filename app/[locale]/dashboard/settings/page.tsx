import { SectionPlaceholder } from "@/components/dashboard/section-placeholder";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <SectionPlaceholder
          title="Company"
          description="Edit company info, logo, base currency, and regional preferences."
        />
        <SectionPlaceholder
          title="Team"
          description="Invite members and manage owner/admin/viewer roles."
        />
        <SectionPlaceholder
          title="Plan & Billing"
          description="Upgrade or downgrade plan through Stripe checkout and customer portal."
        />
        <SectionPlaceholder
          title="Integrations"
          description="Manage import settings and scoped integrations as they become available."
        />
        <SectionPlaceholder
          title="Notifications"
          description="Choose supported alert channels for generated financial warnings."
        />
        <SectionPlaceholder
          title="GDPR"
          description="Export data and request account deletion from this section."
        />
      </div>
    </div>
  );
}
