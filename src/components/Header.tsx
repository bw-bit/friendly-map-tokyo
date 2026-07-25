import { Globe2 } from "lucide-react";
import type { Locale } from "../domain/accessCard";

interface HeaderProps {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

export function Header({ locale, onLocaleChange }: HeaderProps) {
  return (
    <header className="site-header">
      <a href="/" className="brand" aria-label="やさしい東京マップ ホーム">
        やさしい東京マップ
      </a>
      <nav className="header-actions" aria-label="言語と管理">
        <div className="language-control" aria-label="表示言語">
          <Globe2 aria-hidden="true" size={20} />
          <button
            type="button"
            className={locale === "ja" ? "active" : ""}
            aria-pressed={locale === "ja"}
            onClick={() => onLocaleChange("ja")}
          >
            日本語
          </button>
          <span aria-hidden="true">/</span>
          <button
            type="button"
            className={locale === "en" ? "active" : ""}
            aria-pressed={locale === "en"}
            onClick={() => onLocaleChange("en")}
          >
            EN
          </button>
        </div>
        <a className="admin-link" href="/admin">
          管理用インポート
        </a>
      </nav>
    </header>
  );
}

