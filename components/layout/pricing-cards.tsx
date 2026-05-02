"use client";

import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { PLANS } from "@/lib/constants/plans";
import { Link } from "@/lib/i18n/navigation";
import { cn } from "@/lib/utils";

export function PricingCards({ detailed = false }: { detailed?: boolean }) {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const t = useTranslations("pricing");

  const prices = useMemo(
    () =>
      PLANS.map((plan) => ({
        ...plan,
        price: billing === "monthly" ? plan.monthlyPrice : plan.annualMonthlyEquivalent,
      })),
    [billing],
  );

  return (
    <div className="space-y-8">
      <div className="mx-auto flex w-fit rounded-full border border-[#d3e2fb] bg-white p-1">
        <button
          type="button"
          onClick={() => setBilling("monthly")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-all",
            billing === "monthly" ? "bg-[#2f6fff] text-white" : "text-[#44648a]",
          )}
        >
          {t("monthly")}
        </button>
        <button
          type="button"
          onClick={() => setBilling("annual")}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-all",
            billing === "annual" ? "bg-[#2f6fff] text-white" : "text-[#44648a]",
          )}
        >
          {t("annual")}
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {prices.map((plan) => {
          const isFeatured = plan.id === "pro";
          return (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col rounded-3xl border p-8 transition-all duration-200",
                isFeatured
                  ? "border-[#2f6fff] bg-[#0b1a2b] text-white shadow-[0_20px_48px_rgba(47,111,255,0.2)]"
                  : "border-[#d3e2fb] bg-white text-[#0b1a2b] hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(47,111,255,0.08)]",
              )}
            >
              {isFeatured ? (
                <span className="mb-5 inline-block w-fit rounded-full bg-[#2f6fff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[1px] text-white">
                  {t("popular")}
                </span>
              ) : null}

              <p className="text-2xl font-bold tracking-tight">{plan.name}</p>
              <p className={cn("mt-2 text-sm", isFeatured ? "text-white/55" : "text-[#44648a]")}>
                {plan.id === "starter"
                  ? "Para começar com análise e organização financeira."
                  : plan.id === "pro"
                    ? "Para equipas que precisam escala, previsões e automação."
                    : "Para operações complexas com necessidades avançadas."}
              </p>

              <p className="mt-7 text-5xl font-extrabold leading-none tracking-tight">€{plan.price}</p>
              <p className={cn("mt-1 text-sm", isFeatured ? "text-white/45" : "text-[#6e8eb6]")}>por mês</p>

              <ul className="mt-7 flex flex-1 flex-col gap-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={cn(
                      "flex items-start gap-2 text-sm",
                      isFeatured ? "text-white/80" : "text-[#132f4a]",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full",
                        isFeatured ? "bg-[#2f6fff]" : "bg-[#e7f0ff]",
                      )}
                    >
                      <Check size={11} className={isFeatured ? "text-white" : "text-[#1f56d8]"} />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/register?plan=${plan.id}&billing=${billing}`}
                className={cn(
                  "mt-8 inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-medium transition-all",
                  isFeatured
                    ? "bg-[#2f6fff] text-white hover:bg-[#1f56d8]"
                    : "bg-[#0b1a2b] text-[#f8fbff] hover:-translate-y-0.5",
                )}
              >
                {t("start")}
              </Link>
            </div>
          );
        })}
      </div>

      {detailed ? (
        <div className="overflow-auto rounded-3xl border border-[#d3e2fb] bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-[#d3e2fb] bg-[#edf4ff]">
                <th className="px-5 py-4 text-left font-semibold text-[#132f4a]">Feature</th>
                <th className="px-5 py-4 text-left font-semibold text-[#132f4a]">Starter</th>
                <th className="px-5 py-4 text-left font-semibold text-[#132f4a]">Pro</th>
                <th className="px-5 py-4 text-left font-semibold text-[#132f4a]">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Organizações", "1", "5", "Ilimitadas"],
                ["Seats", "2", "10", "Ilimitados"],
                ["Mensagens IA", "50/mês", "Ilimitadas", "Ilimitadas + contexto"],
                ["Cenários Forecast", "1", "3", "3 + what-if"],
                ["API", "Não", "100k/mês", "Ilimitada"],
              ].map((row, idx) => (
                <tr key={row[0]} className={idx === 4 ? "" : "border-b border-[#eef4ff]"}>
                  {row.map((cell, cidx) => (
                    <td key={cell} className={cn("px-5 py-4", cidx === 0 ? "text-[#44648a]" : "text-[#132f4a]")}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}

              <tr className="border-t border-[#d3e2fb] bg-[#f8fbff]">
                <td className="px-5 py-4 text-[#44648a]">White-label completo</td>
                <td className="px-5 py-4 text-[#6e8eb6]"><X size={15} /></td>
                <td className="px-5 py-4 text-[#6e8eb6]"><X size={15} /></td>
                <td className="px-5 py-4 text-[#2f6fff]"><Check size={15} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
