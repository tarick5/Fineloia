import {
  BarChart3,
  BellRing,
  Bot,
  ChartNoAxesCombined,
  FileText,
  Handshake,
  LineChart,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { SiteShell } from "@/components/layout/site-shell";
import { PricingCards } from "@/components/layout/pricing-cards";
import { DemoDashboardMockup } from "@/components/dashboard/demo-dashboard-mockup";
import { Link } from "@/lib/i18n/navigation";

const iconMap = [BarChart3, LineChart, BellRing, FileText, Bot, ShieldCheck];

export default function LandingPage() {
  const t = useTranslations("landing");
  const features = t.raw("features") as string[];
  const faq = t.raw("faq") as Array<{ q: string; a: string }>;

  return (
    <SiteShell>
      <section className="rose-hero">
        <div className="fade-in">
          <div className="rose-hero-tag">
            <span />
            AI CFO
          </div>
          <h1 className="rose-hero-title">
            O teu CFO<br />
            <em>inteligente</em>,<br />
            sempre online.
          </h1>
          <p className="rose-hero-subtitle">{t("heroSubtitle")}</p>
          <div className="rose-hero-actions">
            <Link href="/register" className="rose-btn-accent">
              {t("heroCta")}
            </Link>
            <Link href="/#como-funciona" className="rose-btn-dark">
              {t("heroSecondary")}
            </Link>
          </div>
        </div>

        <div className="fade-in fade-in-delay-1">
          <DemoDashboardMockup />
        </div>
      </section>

      <div className="rose-marquee-section">
        <div className="rose-marquee-track">
          {[
            "Dashboard Financeiro Completo",
            "Importação CSV + Manual",
            "Relatórios com IA",
            "Previsões por Cenário",
            "Conselheiro IA em Chat",
            "Benchmarking por País e Sector",
            "Alertas de Tesouraria",
            "Sem movimentar dinheiro",
            "Dashboard Financeiro Completo",
            "Importação CSV + Manual",
            "Relatórios com IA",
            "Previsões por Cenário",
            "Conselheiro IA em Chat",
            "Benchmarking por País e Sector",
            "Alertas de Tesouraria",
            "Sem movimentar dinheiro",
          ].map((item) => (
            <span className="rose-marquee-item" key={item}>
              {item}
            </span>
          ))}
        </div>
      </div>

      <section className="rose-section rose-how-section" id="como-funciona">
        <div className="rose-container">
          <span className="rose-section-tag">Como Funciona</span>
          <h2 className="rose-section-title fade-in">Tudo o que precisas para gerir finanças com confiança</h2>

          <div className="rose-feature-grid fade-in">
            {features.map((feature, index) => {
              const Icon = iconMap[index % iconMap.length];
              return (
                <div className="rose-feature-card" key={feature}>
                  <div className="rose-feature-icon">
                    <Icon size={20} />
                  </div>
                  <h3 className="rose-feature-title">{feature}</h3>
                  <p className="rose-feature-text">
                    Análise orientada por IA com métricas claras, recomendações accionáveis e contexto de negócio.
                  </p>
                  <div className="rose-feature-stat">
                    {index === 0 ? "5min" : index === 1 ? "24/7" : index === 2 ? "3x" : index === 3 ? "100%" : index === 4 ? "90d" : "50+"}
                    <span>
                      {index === 0
                        ? " setup"
                        : index === 1
                          ? " monitorização"
                          : index === 2
                            ? " clareza"
                            : index === 3
                              ? " automatizado"
                              : index === 4
                                ? " forecast"
                                : " insights"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rose-dark-split" id="para-empresas">
        <div className="fade-in">
          <span className="rose-section-tag">Para Empresas</span>
          <h2 className="rose-section-title">A tua estratégia financeira numa só plataforma</h2>
          <p className="rose-dark-description">
            Centraliza transacções, KPIs, forecasts e alertas. A Fineloia recomenda acções com base nos teus dados, mas nunca movimenta dinheiro.
          </p>

          <div className="rose-stat-large">
            <span className="rose-stat-num">3×</span>
            <span className="rose-stat-unit">mais clareza executiva</span>
          </div>

          <div className="rose-pills">
            <div className="rose-pill"><span className="rose-pill-dot" /> Multi-organização</div>
            <div className="rose-pill"><span className="rose-pill-dot" /> Relatórios investidores</div>
            <div className="rose-pill"><span className="rose-pill-dot" /> Alertas de risco</div>
            <div className="rose-pill"><span className="rose-pill-dot" /> Benchmark sectorial</div>
          </div>

          <Link href="/register" className="rose-btn-accent">
            Começar Grátis
          </Link>
        </div>

        <div className="fade-in fade-in-delay-1">
          <div className="rose-panel">
            <div className="mb-5 flex min-h-[150px] items-center justify-between rounded-xl border border-[#d3e2fb] bg-[#edf4ff] px-6 py-7">
              <div>
                <p className="text-sm font-medium text-[#132f4a]">Fineloia Dashboard</p>
                <p className="text-xs text-[#44648a]">Receita, margem, runway e alerts em tempo real</p>
              </div>
              <TrendingUp size={28} color="#2f6fff" />
            </div>
            <div className="rose-panel-grid">
              {[
                ["Runway", "8.7m", <ChartNoAxesCombined key="runway" size={20} color="#1f56d8" />],
                ["Margem", "22%", <Sparkles key="margem" size={20} color="#1f56d8" />],
                ["Alertas", "3", <BellRing key="alerts" size={20} color="#1f56d8" />],
              ].map(([name, value, icon]) => (
                <div className="rose-product-card" key={String(name)}>
                  <div className="rose-product-top">{icon}</div>
                  <div className="rose-product-bottom">
                    <p className="rose-product-name">{name}</p>
                    <p className="rose-product-price">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rose-light-split">
        <div className="fade-in">
          <div className="rounded-3xl border border-[#d3e2fb] bg-white p-8 shadow-[0_20px_48px_rgba(47,111,255,0.08)]">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#e7f0ff] to-[#c8dcff]">
                <Handshake size={22} color="#1f56d8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0b1a2b]">Conselheiro IA</p>
                <p className="text-xs text-[#6e8eb6]">Resposta contextual em menos de 3 segundos</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl bg-[#edf4ff] p-3 text-sm text-[#132f4a] break-words">
                Devo contratar agora?
              </div>
              <div className="rounded-xl bg-[#f8fbff] p-3 text-sm text-[#44648a] break-words">
                Com runway de 8.7 meses, recomendo contratar só após reduzir o burn rate em 10%.
              </div>
              <div className="rounded-xl bg-[#edf4ff] p-3 text-sm text-[#132f4a] break-words">
                Quando atinjo break-even?
              </div>
              <div className="rounded-xl bg-[#f8fbff] p-3 text-sm text-[#44648a] break-words">
                Mantendo o crescimento actual, previsão de break-even em 6 meses.
              </div>
            </div>
          </div>
        </div>

        <div className="fade-in fade-in-delay-1">
          <span className="rose-section-tag">Conselheiro IA</span>
          <h2 className="rose-section-title" style={{ marginBottom: "24px" }}>
            Conselhos claros, sem jargão
          </h2>
          <p style={{ color: "var(--gray-600)", fontSize: "16px", lineHeight: "1.7", marginBottom: "32px" }}>
            O teu CFO IA responde com números da tua empresa, recomenda acções concretas e mantém linguagem simples para decisões mais rápidas.
          </p>
          <ul className="rose-check-list">
            <li className="rose-check-item">Chat com contexto financeiro completo</li>
            <li className="rose-check-item">Previsões conservador / realista / optimista</li>
            <li className="rose-check-item">Alertas de tesouraria e margem automáticos</li>
            <li className="rose-check-item">Recomendações semanais accionáveis</li>
            <li className="rose-check-item">Streaming de resposta em tempo real</li>
          </ul>
          <Link href="/register" className="rose-btn-accent">
            Criar Conta
          </Link>
        </div>
      </section>

      <section className="rose-pricing-section" id="precos">
        <div className="rose-container">
          <span className="rose-section-tag">Preços</span>
          <h2 className="rose-section-title fade-in">Planos simples para cada fase da tua empresa</h2>
          <PricingCards detailed />
        </div>
      </section>

      <section className="rose-reviews-section" id="reviews">
        <div className="rose-container">
          <span className="rose-section-tag">Testemunhos</span>
          <h2 className="rose-section-title fade-in">Equipas reais, decisões melhores</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                name: "Marta Costa",
                role: "CEO · Tech Startup",
                quote: "A Fineloia trouxe disciplina financeira. Hoje decidimos com dados, não intuição.",
              },
              {
                name: "João Ribeiro",
                role: "COO · PME Industrial",
                quote: "Detectámos risco de tesouraria com 2 meses de antecedência e corrigimos a tempo.",
              },
              {
                name: "Helena Sousa",
                role: "CFO · E-commerce",
                quote: "Os relatórios para investidores ficaram mais rápidos e muito mais claros.",
              },
            ].map((review, index) => (
              <div
                className={`rounded-2xl bg-[var(--cream)] p-7 ${index === 1 ? "fade-in-delay-1" : index === 2 ? "fade-in-delay-2" : ""} fade-in`}
                key={review.name}
              >
                <p className="mb-2 font-semibold text-[var(--black)]">{review.name}</p>
                <p className="mb-4 text-xs text-[var(--gray-400)]">{review.role}</p>
                <p className="text-sm italic text-[var(--gray-600)]">“{review.quote}”</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rose-section" id="faq" style={{ background: "var(--cream)" }}>
        <div className="rose-container">
          <span className="rose-section-tag">FAQ</span>
          <h2 className="rose-section-title fade-in">Dúvidas antes de começar?</h2>
          <div className="rose-faq-list">
            {faq.map((item) => (
              <div className="rose-faq-item" key={item.q}>
                <p className="rose-faq-q">{item.q}</p>
                <p className="rose-faq-a">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rose-cta" id="comecar">
        <div className="rose-cta-badge">Começa Hoje</div>
        <h2 className="rose-cta-title">{t("ctaTitle")}</h2>
        <p className="rose-cta-text">
          Junta a tua empresa ao ecossistema Fineloia e ganha clareza financeira diária com IA.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/register" className="rose-btn-accent">
            {t("ctaButton")}
          </Link>
          <Link href="/pricing" className="rose-btn-light">
            Ver preços
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
