import { useTranslations } from "next-intl";
import { SiteShell } from "@/components/layout/site-shell";
import { PricingCards } from "@/components/layout/pricing-cards";

export default function PricingPage() {
  const t = useTranslations("pricing");

  return (
    <SiteShell>
      <section className="rose-hero" style={{ minHeight: "auto", paddingBottom: "64px" }}>
        <div className="fade-in">
          <div className="rose-hero-tag">
            <span />
            Planos Fineloia
          </div>
          <h1 className="rose-hero-title">
            Preços
            <br />
            <em>transparentes</em>
          </h1>
          <p className="rose-hero-subtitle">{t("subtitle")}</p>
        </div>

        <div className="fade-in fade-in-delay-1">
          <div className="rose-mockup">
            <div className="rose-mockup-grid">
              <div className="rose-mock-card">
                <h4>Trial</h4>
                <p>14 dias</p>
              </div>
              <div className="rose-mock-card">
                <h4>Desconto anual</h4>
                <p>20%</p>
              </div>
              <div className="rose-mock-card rose-mock-wide">
                <h4>Plano mais escolhido</h4>
                <p style={{ fontSize: "18px" }}>Pro · escalável para equipas em crescimento</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rose-pricing-section">
        <div className="rose-container">
          <h2 className="rose-section-title" style={{ marginBottom: "42px" }}>
            {t("title")}
          </h2>
          <PricingCards detailed />
        </div>
      </section>
    </SiteShell>
  );
}
