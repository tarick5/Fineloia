import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="rose-auth-shell">
      <div className="rose-auth-container">
        <section className="rose-auth-showcase fade-in">
          <div className="rose-auth-kicker">
            <span />
            Finanças com IA
          </div>
          <h1 className="rose-auth-title">
            Bem-vindo de volta ao teu <em>CFO IA</em>
          </h1>
          <p className="rose-auth-copy">
            Acede ao dashboard, acompanha métricas críticas e recebe recomendações accionáveis para decisões
            financeiras mais seguras.
          </p>
          <div className="rose-auth-pills">
            <div className="rose-auth-pill">Alertas de tesouraria</div>
            <div className="rose-auth-pill">Forecasts por cenário</div>
            <div className="rose-auth-pill">Chat CFO em tempo real</div>
          </div>
        </section>

        <section className="rose-auth-form-wrap fade-in fade-in-delay-1">
          <LoginForm />
        </section>
      </div>
    </div>
  );
}
