import {
  ChevronRight,
  CircleCheck,
  CircleMinus,
  ExternalLink,
  MessageSquareText,
  X
} from "lucide-react";
import {
  featureLabels,
  type AccessCard,
  type Locale
} from "../domain/accessCard";
import { FeatureIcon } from "./FeatureIcon";

interface VenueDetailProps {
  venue: AccessCard;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onClose: () => void;
  onCorrection: () => void;
}

function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", {
    dateStyle: "medium",
    timeZone: "Asia/Tokyo"
  }).format(new Date(value));
}

export function VenueDetail({
  venue,
  locale,
  onLocaleChange,
  onClose,
  onCorrection
}: VenueDetailProps) {
  const hasUnconfirmed = venue.features.some(
    (feature) => feature.status === "unconfirmed"
  );

  return (
    <aside
      className="venue-detail"
      aria-label={`${venue.name[locale]} Access Card`}
      data-testid="venue-detail"
    >
      <div className="sheet-handle" aria-hidden="true" />
      <div className="detail-header">
        <div>
          <p className="detail-category">{venue.category[locale]}</p>
          <h1>{venue.name[locale]}</h1>
          <p>{venue.address[locale]}</p>
        </div>
        <button
          type="button"
          className="icon-button close-detail"
          aria-label="詳細を閉じる"
          onClick={onClose}
        >
          <X aria-hidden="true" />
        </button>
      </div>
      <div className="detail-meta">
        <span className={hasUnconfirmed ? "mixed" : ""}>
          {hasUnconfirmed ? (
            <CircleMinus aria-hidden="true" size={18} />
          ) : (
            <CircleCheck aria-hidden="true" size={18} />
          )}
          {hasUnconfirmed
            ? locale === "ja"
              ? "一部未確認"
              : "Partly unconfirmed"
            : locale === "ja"
              ? "掲載内容を確認済み"
              : "Listing reviewed"}
        </span>
        <span>
          {locale === "ja" ? "最終確認 " : "Last reviewed "}
          {formatDate(venue.lastReviewedAt, locale)}
        </span>
      </div>
      <div className="access-tabs" role="tablist" aria-label="Access Cardの言語">
        <button
          type="button"
          role="tab"
          aria-selected={locale === "ja"}
          onClick={() => onLocaleChange("ja")}
        >
          日本語
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={locale === "en"}
          onClick={() => onLocaleChange("en")}
        >
          ENGLISH
        </button>
      </div>
      <div className="detail-scroll">
        <section className="access-summary" aria-labelledby="access-card-title">
          <h2 id="access-card-title">Access Card</h2>
          <p>{venue.accessCards[locale].summary}</p>
        </section>
        <div className="evidence-list">
          {venue.features.map((feature) => (
            <details
              key={feature.key}
              className={`evidence-row evidence-${feature.status}`}
            >
              <summary>
                <span className="evidence-icon">
                  <FeatureIcon feature={feature.key} size={21} />
                </span>
                <span className="evidence-copy">
                  <strong>{featureLabels[feature.key][locale]}</strong>
                  <span>{feature.detail[locale]}</span>
                </span>
                <span className="evidence-status">
                  {feature.status === "confirmed"
                    ? locale === "ja"
                      ? "確認済み"
                      : "Confirmed"
                    : feature.status === "unconfirmed"
                      ? locale === "ja"
                        ? "未確認"
                        : "Unconfirmed"
                      : locale === "ja"
                        ? "利用不可"
                        : "Not available"}
                </span>
                <ChevronRight aria-hidden="true" size={19} />
              </summary>
              <div className="evidence-detail">
                <p>
                  <strong>{locale === "ja" ? "根拠: " : "Evidence: "}</strong>
                  {feature.evidence.sourceLabel[locale]}
                </p>
                <p>
                  <strong>{locale === "ja" ? "証拠日時: " : "Observed: "}</strong>
                  {formatDate(feature.evidence.observedAt, locale)}
                </p>
                {feature.evidence.url ? (
                  <a href={feature.evidence.url} target="_blank" rel="noreferrer">
                    {locale === "ja" ? "根拠を見る" : "View evidence"}
                    <ExternalLink aria-hidden="true" size={14} />
                  </a>
                ) : null}
              </div>
            </details>
          ))}
        </div>
      </div>
      <div className="detail-actions">
        <a
          className="button secondary"
          href={venue.googleMapsUrl}
          target="_blank"
          rel="noreferrer"
        >
          <ExternalLink aria-hidden="true" size={18} />
          Google Mapsで開く
        </a>
        <button className="button primary" type="button" onClick={onCorrection}>
          <MessageSquareText aria-hidden="true" size={18} />
          情報修正を依頼
        </button>
      </div>
    </aside>
  );
}

