"use client";

import { useState } from "react";
import { useRouter } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Plus } from "lucide-react";

type CreateOrganizationDialogProps = {
  canCreate: boolean;
  currentPlan: "starter" | "pro" | "enterprise";
  currentOrganizationCount: number;
};

export function CreateOrganizationDialog({
  canCreate,
  currentPlan,
  currentOrganizationCount,
}: CreateOrganizationDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxOrganizations = currentPlan === "enterprise" ? Number.MAX_SAFE_INTEGER : currentPlan === "pro" ? 2 : 1;
  const remaining = Math.max(0, maxOrganizations - currentOrganizationCount);

  async function handleCreate() {
    if (!canCreate || !companyName.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setError("This experience is unavailable in demo mode.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You need to be signed in to create another company.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/organizations/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        companyName: companyName.trim(),
      }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string; organizationId?: string } | null;

    if (!response.ok || !payload?.organizationId) {
      setError(payload?.error ?? "Could not create company.");
      setLoading(false);
      return;
    }

    setLoading(false);
    setIsOpen(false);
    setCompanyName("");
    router.refresh();
  }

  if (!canCreate) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="icon"
        variant="outline"
        aria-label="Add company"
        className="h-9 w-9 rounded-full"
        onClick={() => setIsOpen((value) => !value)}
      >
        <Plus className="h-4 w-4" />
      </Button>

      {isOpen ? (
        <div className="absolute right-6 top-16 z-20 w-[320px] rounded-2xl border border-[#d3e2fb] bg-white p-4 shadow-xl">
          <p className="text-sm font-semibold text-[#0b1a2b]">Add company</p>
          <p className="mt-1 text-xs text-muted-foreground">
            You can add up to {remaining} more {remaining === 1 ? "company" : "companies"} with your current plan.
          </p>

          <div className="mt-4 space-y-2">
            <Label htmlFor="company-name">Company name</Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              placeholder="Acme Ltd"
            />
          </div>

          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

          <div className="mt-4 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleCreate} disabled={loading || !companyName.trim()}>
              {loading ? "..." : "Create"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
