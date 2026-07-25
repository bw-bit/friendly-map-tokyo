import { ChevronRight, CircleCheck, CircleMinus } from "lucide-react";
import {
  confirmedFeatureKeys,
  featureLabels,
  type AccessCard,
  type Locale
} from "../domain/accessCard";
import { FeatureIcon } from "./FeatureIcon";

interface VenueListProps {
  venues: AccessCard[];
  selectedVenueId: string | null;
  locale: Locale;
  onSelect: (id: string) => void;
}

function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function VenueList({
  venues,
  selectedVenueId,
  locale,
  onSelect
}: VenueListProps) {
  return (
    <div className="venue-list">
      <div className="results-count" aria-live="polite">
        <strong>
          {venues.length}
          {locale === "ja" ? "件見つかりました" : " places found"}
        </strong>
        <span>
          {locale === "ja"
            ? "確認済みの根拠だけを絞り込みに使用"
            : "Filters use confirmed evidence only"}
        </span>
      </div>
      {venues.length === 0 ? (
        <div className="empty-state">
          <p>条件に合う場所が見つかりませんでした。</p>
          <p>条件を減らすか、別のキーワードをお試しください。</p>
        </div>
      ) : (
        venues.map((venue, index) => {
          const confirmed = confirmedFeatureKeys(venue);
          const hasUnconfirmed = venue.features.some(
            (feature) => feature.status === "unconfirmed"
          );
          return (
            <button
              key={venue.id}
              type="button"
              className={`venue-row ${selectedVenueId === venue.id ? "selected" : ""}`}
              aria-current={selectedVenueId === venue.id ? "true" : undefined}
              onClick={() => onSelect(venue.id)}
            >
              <span className="venue-index" aria-hidden="true">
                {index + 1}
              </span>
              <span className="venue-row-main">
                <span className="venue-title">{venue.name[locale]}</span>
                <span className="venue-address">{venue.address[locale]}</span>
                <span className="feature-icon-row" aria-label="確認済み条件">
                  {confirmed.slice(0, 4).map((key) => (
                    <span
                      key={key}
                      className="feature-mini"
                      title={featureLabels[key][locale]}
                    >
                      <FeatureIcon feature={key} />
                    </span>
                  ))}
                </span>
                <span className={`review-state ${hasUnconfirmed ? "mixed" : ""}`}>
                  {hasUnconfirmed ? (
                    <CircleMinus aria-hidden="true" size={17} />
                  ) : (
                    <CircleCheck aria-hidden="true" size={17} />
                  )}
                  {hasUnconfirmed
                    ? locale === "ja"
                      ? "一部未確認"
                      : "Partly unconfirmed"
                    : locale === "ja"
                      ? "掲載内容を確認済み"
                      : "Listing reviewed"}
                  <span>・{formatDate(venue.lastReviewedAt, locale)}</span>
                </span>
              </span>
              <ChevronRight className="row-chevron" aria-hidden="true" size={22} />
            </button>
          );
        })
      )}
    </div>
  );
}

