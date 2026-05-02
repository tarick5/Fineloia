import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("nav");

  return (
    <div className="min-h-screen">
      <header className="rose-nav">
        <Link href="/" className="rose-nav-logo">
          Fineloia
          <span className="rose-nav-logo-dot" />
        </Link>

        <nav>
          <ul className="rose-nav-links">
            <li>
              <Link className="rose-nav-link" href="/#como-funciona">
                Como Funciona
              </Link>
            </li>
            <li>
              <Link className="rose-nav-link" href="/#para-empresas">
                Para Empresas
              </Link>
            </li>
            <li>
              <Link className="rose-nav-link" href="/pricing">
                {t("pricing")}
              </Link>
            </li>
            <li>
              <Link className="rose-nav-link" href="/#faq">
                FAQ
              </Link>
            </li>
            <li>
              <Link className="rose-nav-cta" href="/register">
                {t("cta")}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link href="/login" className="rose-nav-link md:hidden">
            {t("login")}
          </Link>
        </div>
      </header>

      <main>{children}</main>

      <footer className="rose-footer">
        <div>
          <Link href="/" className="rose-nav-logo !text-white">
            Fineloia
            <span className="rose-nav-logo-dot" />
          </Link>
          <p className="rose-footer-tagline">
            O CFO IA que ajuda empresas a analisar, prever e decidir melhor sem executar pagamentos.
          </p>
        </div>

        <div className="rose-footer-right">
          <ul className="rose-footer-nav">
            <li>
              <Link href="/">Início</Link>
            </li>
            <li>
              <Link href="/pricing">Preços</Link>
            </li>
            <li>
              <Link href="/login">Login</Link>
            </li>
            <li>
              <Link href="/register">Registo</Link>
            </li>
            <li>
              <span>EN</span>
            </li>
            <li>
              <span>PT</span>
            </li>
            <li>
              <span>FR</span>
            </li>
            <li>
              <span>ES</span>
            </li>
            <li>
              <span>AR</span>
            </li>
          </ul>
          <p className="rose-footer-copy">© {new Date().getFullYear()} Fineloia. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
