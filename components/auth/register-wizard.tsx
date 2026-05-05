"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { SUPPORTED_CURRENCIES } from "@/lib/constants/currencies";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type WizardData = {
  email: string;
  password: string;
  companyName: string;
  country: string;
  sector: string;
  size: string;
  currency: string;
  importPreference: string;
};

const sizes = ["1-10", "11-50", "51-200", "201-1000", "1000+"];
const MIN_PASSWORD_LENGTH = 8;

export function RegisterWizard() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const searchParams = useSearchParams();

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "1";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<WizardData>({
    email: "",
    password: "",
    companyName: "",
    country: "Portugal",
    sector: "Technology",
    size: sizes[1],
    currency: "EUR",
    importPreference: "CSV",
  });

  async function handleFinish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (form.password.length < MIN_PASSWORD_LENGTH) {
      setStep(1);
      setError(t("passwordMin", { min: MIN_PASSWORD_LENGTH }));
      return;
    }

    if (!supabase || isDemoMode) {
      setLoading(true);
      router.push("/demo-dashboard");
      router.refresh();
      return;
    }

    setLoading(true);

    const plan = searchParams.get("plan") ?? "starter";
    const billing = searchParams.get("billing") ?? "monthly";

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          company_name: form.companyName,
          country: form.country,
        },
      },
    });

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? "Could not create account.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/organizations/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: data.user.id,
        companyName: form.companyName,
        country: form.country,
        sector: form.sector,
        size: form.size,
        currency: form.currency,
        plan,
        billingCycle: billing,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Could not finish onboarding.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  function handleNextStep() {
    setError(null);

    if (step === 1) {
      if (
        !form.email.trim() ||
        !form.password ||
        !form.companyName.trim() ||
        !form.country.trim() ||
        !form.sector.trim()
      ) {
        setError(t("step1Required"));
        return;
      }

      if (form.password.length < MIN_PASSWORD_LENGTH) {
        setError(t("passwordMin", { min: MIN_PASSWORD_LENGTH }));
        return;
      }
    }

    setStep((prev) => Math.min(4, prev + 1));
  }

  return (
    <Card className="mx-auto w-full max-w-2xl border-0 bg-transparent shadow-none">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleFinish} className="space-y-6">
          <div className="grid gap-2">
            <p className="text-sm text-muted-foreground">
              {step === 1 ? t("step1") : step === 2 ? t("step2") : step === 3 ? t("step3") : t("step4")}
            </p>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${(step / 4) * 100}%` }} />
            </div>
          </div>

          {step === 1 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  required
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  minLength={MIN_PASSWORD_LENGTH}
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  required
                />
                <p className="text-xs text-muted-foreground">{t("passwordHint", { min: MIN_PASSWORD_LENGTH })}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company name</Label>
                <Input
                  id="companyName"
                  value={form.companyName}
                  onChange={(event) => setForm((prev) => ({ ...prev, companyName: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
                  required
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="sector">Sector</Label>
                <Input
                  id="sector"
                  value={form.sector}
                  onChange={(event) => setForm((prev) => ({ ...prev, sector: event.target.value }))}
                  required
                />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-2">
              <Label htmlFor="size">Team size</Label>
              <Select
                id="size"
                value={form.size}
                onChange={(event) => setForm((prev) => ({ ...prev, size: event.target.value }))}
              >
                {sizes.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-2">
              <Label htmlFor="currency">Main currency</Label>
              <Select
                id="currency"
                value={form.currency}
                onChange={(event) => setForm((prev) => ({ ...prev, currency: event.target.value }))}
              >
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-2">
              <Label htmlFor="importPreference">How do you prefer to import data?</Label>
              <Select
                id="importPreference"
                value={form.importPreference}
                onChange={(event) => setForm((prev) => ({ ...prev, importPreference: event.target.value }))}
              >
                <option value="CSV">CSV upload</option>
                <option value="Manual">Manual input</option>
                <option value="API">Connect via API</option>
              </Select>
            </div>
          ) : null}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={step === 1 || loading}
              onClick={() => setStep((prev) => Math.max(1, prev - 1))}
            >
              {t("back")}
            </Button>

            {step < 4 ? (
              <Button type="button" disabled={loading} onClick={handleNextStep}>
                {t("next")}
              </Button>
            ) : (
              <Button disabled={loading} type="submit">
                {loading ? "..." : t("submit")}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
