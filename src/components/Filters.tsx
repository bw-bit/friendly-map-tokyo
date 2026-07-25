import { List, Map, Search, SlidersHorizontal, X } from "lucide-react";
import {
  featureKeys,
  featureLabels,
  type FeatureKey
} from "../domain/accessCard";

interface FiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  selectedFeatures: FeatureKey[];
  onToggleFeature: (feature: FeatureKey) => void;
  onClear: () => void;
  mobileView: "map" | "list";
  onMobileViewChange: (view: "map" | "list") => void;
}

export function Filters({
  query,
  onQueryChange,
  selectedFeatures,
  onToggleFeature,
  onClear,
  mobileView,
  onMobileViewChange
}: FiltersProps) {
  return (
    <section className="filter-bar" aria-label="場所を絞り込む">
      <label className="search-field">
        <Search aria-hidden="true" size={22} />
        <span className="sr-only">場所・駅名・キーワードで検索</span>
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="場所・駅名・キーワードで検索"
        />
      </label>
      <div className="filter-heading">
        <SlidersHorizontal aria-hidden="true" size={19} />
        <span>条件を選ぶ</span>
      </div>
      <div className="filter-options" role="group" aria-label="具体的な条件">
        {featureKeys.map((key) => {
          const selected = selectedFeatures.includes(key);
          return (
            <button
              key={key}
              type="button"
              className={`filter-chip ${selected ? "selected" : ""}`}
              aria-pressed={selected}
              onClick={() => onToggleFeature(key)}
            >
              {featureLabels[key].shortJa}
              {selected ? <X aria-hidden="true" size={15} /> : null}
            </button>
          );
        })}
        {selectedFeatures.length ? (
          <button className="clear-filters" type="button" onClick={onClear}>
            すべてクリア
          </button>
        ) : null}
      </div>
      <div className="mobile-view-switch" aria-label="表示切り替え">
        <button
          type="button"
          aria-pressed={mobileView === "map"}
          className={mobileView === "map" ? "active" : ""}
          onClick={() => onMobileViewChange("map")}
        >
          <Map aria-hidden="true" size={19} />
          地図
        </button>
        <button
          type="button"
          aria-pressed={mobileView === "list"}
          className={mobileView === "list" ? "active" : ""}
          onClick={() => onMobileViewChange("list")}
        >
          <List aria-hidden="true" size={19} />
          一覧
        </button>
      </div>
    </section>
  );
}

