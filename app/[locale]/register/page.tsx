import { RegisterWizard } from "@/components/auth/register-wizard";

export default function RegisterPage() {
  return (
    <div className="rose-auth-shell">
      <div className="rose-auth-container">
        <section className="rose-auth-showcase fade-in">
          <div className="rose-auth-kicker">
            <span />
            Trial de 14 dias
          </div>
          <h1 className="rose-auth-title">
            Cria a tua conta e activa o teu <em>CFO IA</em>
          </h1>
          <p className="rose-auth-copy">
            Em poucos passos, ligas a empresa à Fineloia e começas a transformar dados financeiros em decisões
            estratégicas.
          </p>
          <div className="rose-auth-pills">
            <div className="rose-auth-pill">Sem cartão de crédito</div>
            <div className="rose-auth-pill">Onboarding guiado</div>
            <div className="rose-auth-pill">Relatórios automáticos</div>
          </div>
        </section>

        <section className="rose-auth-form-wrap fade-in fade-in-delay-1">
          <RegisterWizard />
        </section>
      </div>
    </div>
  );
}
