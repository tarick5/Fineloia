import { Link } from "@/lib/i18n/navigation";
import Image from "next/image";

type DashboardSection =
  | "overview"
  | "treasury"
  | "results"
  | "transactions"
  | "forecasts"
  | "advisor"
  | "alerts"
  | "reports"
  | "settings";

type DashboardPeriod = "7d" | "30d" | "90d";

const sectionLabels: Record<DashboardSection, string> = {
  overview: "Visão Geral",
  treasury: "Tesouraria",
  results: "Resultados",
  transactions: "Transacções",
  forecasts: "Previsões",
  advisor: "Conselheiro IA",
  alerts: "Alertas",
  reports: "Relatórios",
  settings: "Definições",
};

function toSection(value?: string): DashboardSection {
  if (!value) return "overview";
  if (value in sectionLabels) return value as DashboardSection;
  return "overview";
}

function toPeriod(value?: string): DashboardPeriod {
  if (value === "7d" || value === "90d") return value;
  return "30d";
}

function periodValues(period: DashboardPeriod) {
  if (period === "7d") {
    return {
      revenue: "€36k",
      runway: "8.5m",
      recommendation: "Ajustar orçamento semanal de marketing em -8% para preservar margem.",
    };
  }

  if (period === "90d") {
    return {
      revenue: "€388k",
      runway: "9.1m",
      recommendation: "Renegociar cloud + reduzir despesas variáveis para adicionar +1.4 meses de runway.",
    };
  }

  return {
    revenue: "€142k",
    runway: "8.7m",
    recommendation: "Reduzir cloud spend em 11% para ganhar +1.1 meses de runway.",
  };
}

export function DemoDashboardMockup({
  interactive = false,
  section,
  period,
  showBadges = true,
  fullscreen = false,
}: {
  interactive?: boolean;
  section?: string;
  period?: string;
  showBadges?: boolean;
  fullscreen?: boolean;
}) {
  const activeSection = toSection(section);
  const activePeriod = toPeriod(period);
  const values = periodValues(activePeriod);

  const navItems: Array<{ key: DashboardSection; label: string; group: "principal" | "intel" | "conta" }> = [
    { key: "overview", label: "Visão Geral", group: "principal" },
    { key: "treasury", label: "Tesouraria", group: "principal" },
    { key: "results", label: "Resultados", group: "principal" },
    { key: "forecasts", label: "Previsões", group: "intel" },
    { key: "advisor", label: "Conselheiro IA", group: "intel" },
    { key: "alerts", label: "Alertas", group: "intel" },
    { key: "reports", label: "Relatórios", group: "conta" },
    { key: "settings", label: "Definições", group: "conta" },
  ];

  function sectionHref(nextSection: DashboardSection) {
    return `/demo-dashboard?section=${nextSection}&period=${activePeriod}`;
  }

  function periodHref(nextPeriod: DashboardPeriod) {
    return `/demo-dashboard?section=${activeSection}&period=${nextPeriod}`;
  }

  function renderNavItem(item: { key: DashboardSection; label: string }) {
    const active = activeSection === item.key;
    const className = `hero-mini-side-item ${active ? "hero-mini-side-item-active" : ""}`;

    if (!interactive) {
      return (
        <p className={className} key={item.key}>
          {item.label}
        </p>
      );
    }

    return (
      <Link
        key={item.key}
        href={sectionHref(item.key)}
        className={className}
        style={{ display: "block", width: "100%", textDecoration: "none" }}
      >
        {item.label}
      </Link>
    );
  }

  function renderPeriodTab(tab: DashboardPeriod) {
    const active = activePeriod === tab;
    const className = `hero-mini-tab ${active ? "hero-mini-tab-active" : ""}`;

    if (!interactive) {
      return (
        <span className={className} key={tab}>
          {tab}
        </span>
      );
    }

    return (
      <Link key={tab} href={periodHref(tab)} className={className}>
        {tab}
      </Link>
    );
  }

  const wrapperClass = fullscreen ? "demo-dashboard-full" : "rose-mockup";

  return (
    <div className={wrapperClass}>
      <div className="hero-mini-dash">
        <div className="hero-mini-topbar">
          <div className="hero-mini-brand">
            <Image
              src="/brand/fineloia-logo-transparent.png"
              alt="Fineloia"
              width={1147}
              height={419}
              className="h-8 w-auto object-contain md:h-9"
            />
          </div>
          <div className="hero-mini-topbar-right">
            <span className="hero-mini-org">JQServices LDA</span>
            <span className="hero-mini-pill">EUR</span>
          </div>
        </div>

        <div className="hero-mini-layout">
          <aside className="hero-mini-sidebar">
            <span className="hero-mini-side-label">Principal</span>
            {navItems.filter((item) => item.group === "principal").map(renderNavItem)}
            <span className="hero-mini-side-label">Inteligência</span>
            {navItems.filter((item) => item.group === "intel").map(renderNavItem)}
            <span className="hero-mini-side-label">Conta</span>
            {navItems.filter((item) => item.group === "conta").map(renderNavItem)}
          </aside>

          <div className="hero-mini-main">
            <div className="hero-mini-main-head">
              <p className="hero-mini-main-title">{sectionLabels[activeSection]}</p>
              <div className="hero-mini-tabs">
                {(["7d", "30d", "90d"] as const).map(renderPeriodTab)}
              </div>
            </div>

            <div className="hero-mini-metrics">
              <div className="hero-mini-metric">
                <p className="hero-mini-metric-label">Receita este mês</p>
                <p className="hero-mini-metric-value">{values.revenue}</p>
              </div>
              <div className="hero-mini-metric">
                <p className="hero-mini-metric-label">Runway</p>
                <p className="hero-mini-metric-value">{values.runway}</p>
              </div>
            </div>

            <div className="hero-mini-reco">
              <p className="hero-mini-reco-label">Recomendação da semana</p>
              <p className="hero-mini-reco-text">{values.recommendation}</p>
            </div>

            <div className="hero-mini-charts">
              <div className="hero-mini-chart-card">
                <div className="hero-mini-card-head">
                  <span>Receita vs Despesas</span>
                  <span>6m</span>
                </div>
                <svg viewBox="0 0 240 70" preserveAspectRatio="none" aria-hidden="true">
                  <rect x="8" y="36" width="11" height="28" rx="3" fill="#2f6fff" />
                  <rect x="21" y="44" width="11" height="20" rx="3" fill="#c8dcff" />
                  <rect x="45" y="30" width="11" height="34" rx="3" fill="#2f6fff" />
                  <rect x="58" y="40" width="11" height="24" rx="3" fill="#c8dcff" />
                  <rect x="82" y="26" width="11" height="38" rx="3" fill="#2f6fff" />
                  <rect x="95" y="37" width="11" height="27" rx="3" fill="#c8dcff" />
                  <rect x="119" y="22" width="11" height="42" rx="3" fill="#2f6fff" />
                  <rect x="132" y="33" width="11" height="31" rx="3" fill="#c8dcff" />
                  <rect x="156" y="16" width="11" height="48" rx="3" fill="#1f56d8" />
                  <rect x="169" y="28" width="11" height="36" rx="3" fill="#c8dcff" />
                  <rect x="193" y="10" width="11" height="54" rx="3" fill="#1f56d8" />
                  <rect x="206" y="23" width="11" height="41" rx="3" fill="#c8dcff" />
                </svg>
              </div>

              <div className="hero-mini-donut-card">
                <div className="hero-mini-card-head">
                  <span>Despesas</span>
                </div>
                <div className="hero-mini-donut-wrap">
                  <svg viewBox="0 0 72 72" aria-hidden="true">
                    <circle cx="36" cy="36" r="23" fill="none" stroke="#e7f0ff" strokeWidth="9" />
                    <circle
                      cx="36"
                      cy="36"
                      r="23"
                      fill="none"
                      stroke="#2f6fff"
                      strokeWidth="9"
                      strokeDasharray="92 144.5"
                      strokeLinecap="round"
                      transform="rotate(-90 36 36)"
                    />
                    <circle
                      cx="36"
                      cy="36"
                      r="23"
                      fill="none"
                      stroke="#92b6ff"
                      strokeWidth="9"
                      strokeDasharray="32 144.5"
                      strokeDashoffset="-92"
                      strokeLinecap="round"
                      transform="rotate(-90 36 36)"
                    />
                    <circle
                      cx="36"
                      cy="36"
                      r="23"
                      fill="none"
                      stroke="#c8dcff"
                      strokeWidth="9"
                      strokeDasharray="20 144.5"
                      strokeDashoffset="-124"
                      strokeLinecap="round"
                      transform="rotate(-90 36 36)"
                    />
                    <text x="36" y="39" textAnchor="middle" className="hero-mini-donut-value">
                      €31.8k
                    </text>
                  </svg>
                  <div className="hero-mini-donut-legend">
                    <p>
                      <span className="hero-mini-dl-dot hero-mini-dl-op" /> Op. 42%
                    </p>
                    <p>
                      <span className="hero-mini-dl-dot hero-mini-dl-mk" /> Mkt 15%
                    </p>
                    <p>
                      <span className="hero-mini-dl-dot hero-mini-dl-rh" /> RH 8%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-mini-bottom">
              <div className="hero-mini-list-card">
                <div className="hero-mini-card-head">
                  <span>Últimas transacções</span>
                </div>
                <ul className="hero-mini-list">
                  <li>
                    <span>AWS Cloud</span>
                    <strong>-€2.340</strong>
                  </li>
                  <li>
                    <span>Cliente Acme</span>
                    <strong className="hero-mini-positive">+€8.500</strong>
                  </li>
                  <li>
                    <span>Google Ads</span>
                    <strong>-€1.200</strong>
                  </li>
                </ul>
              </div>

              <div className="hero-mini-ai-card">
                <div className="hero-mini-card-head">
                  <span>Conselheiro Fineloia</span>
                  <span className="hero-mini-online">● online</span>
                </div>
                <p className="hero-mini-ai-text">
                  Margem subiu <strong>+3pp</strong>. Reduzir cloud spend em 11% adiciona{" "}
                  <strong>+1.1 meses de runway</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBadges ? (
        <>
          <div className="rose-hero-badge">+2.400 empresas activas</div>
          <div className="rose-hero-badge-alt">Alertas críticos em tempo real</div>
        </>
      ) : null}
    </div>
  );
}
