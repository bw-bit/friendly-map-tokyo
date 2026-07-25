import { useEffect, useMemo, useState } from "react";
import { sampleVenues } from "./data/sampleVenues";
import {
  featureKeys,
  filterCards,
  type AccessCard,
  type FeatureKey,
  type Locale
} from "./domain/accessCard";
import { AdminPage } from "./components/AdminPage";
import { CorrectionDialog } from "./components/CorrectionDialog";
import { Filters } from "./components/Filters";
import { Header } from "./components/Header";
import { MapPanel } from "./components/MapPanel";
import { VenueDetail } from "./components/VenueDetail";
import { VenueList } from "./components/VenueList";

function readQueryState() {
  const params = new URLSearchParams(window.location.search);
  const selectedFeatures = (params.get("features") ?? "")
    .split(",")
    .filter((value): value is FeatureKey =>
      featureKeys.includes(value as FeatureKey)
    );
  return {
    query: params.get("q") ?? "",
    selectedFeatures,
    selectedVenueId: params.get("venue"),
    view: params.get("view") === "list" ? ("list" as const) : ("map" as const)
  };
}

export function App() {
  if (window.location.pathname.startsWith("/admin")) {
    return <AdminPage />;
  }
  return <ConsumerApp />;
}

function ConsumerApp() {
  const initial = readQueryState();
  const [venues, setVenues] = useState<AccessCard[]>(sampleVenues);
  const [query, setQuery] = useState(initial.query);
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureKey[]>(
    initial.selectedFeatures
  );
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(
    initial.selectedVenueId ?? sampleVenues[0].id
  );
  const [locale, setLocale] = useState<Locale>("ja");
  const [mobileView, setMobileView] = useState<"map" | "list">(initial.view);
  const [dataNotice, setDataNotice] = useState<string | null>(null);
  const [correctionOpen, setCorrectionOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/venues", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("venue_fetch_failed");
        return (await response.json()) as {
          venues: AccessCard[];
          sampleDataActive: boolean;
        };
      })
      .then((data) => {
        setVenues(data.venues);
        if (data.sampleDataActive) {
          setDataNotice("現在はサンプルデータを表示しています");
        }
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setDataNotice("接続できないため端末内のサンプルデータを表示しています");
        }
      });
    return () => controller.abort();
  }, []);

  const filteredVenues = useMemo(
    () => filterCards(venues, query, selectedFeatures),
    [venues, query, selectedFeatures]
  );
  const selectedVenue =
    filteredVenues.find((venue) => venue.id === selectedVenueId) ??
    venues.find((venue) => venue.id === selectedVenueId) ??
    filteredVenues[0] ??
    null;

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedFeatures.length) params.set("features", selectedFeatures.join(","));
    if (selectedVenue) params.set("venue", selectedVenue.id);
    if (mobileView === "list") params.set("view", "list");
    const next = `${window.location.pathname}${params.size ? `?${params}` : ""}`;
    window.history.replaceState(null, "", next);
  }, [mobileView, query, selectedFeatures, selectedVenue]);

  function toggleFeature(feature: FeatureKey) {
    setSelectedFeatures((current) =>
      current.includes(feature)
        ? current.filter((item) => item !== feature)
        : [...current, feature]
    );
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#results">
        検索結果へ移動
      </a>
      <Header locale={locale} onLocaleChange={setLocale} />
      <Filters
        query={query}
        onQueryChange={setQuery}
        selectedFeatures={selectedFeatures}
        onToggleFeature={toggleFeature}
        onClear={() => setSelectedFeatures([])}
        mobileView={mobileView}
        onMobileViewChange={setMobileView}
      />
      {dataNotice ? (
        <div className="data-notice" role="status">
          {dataNotice}
        </div>
      ) : null}
      <main className="workspace">
        <section
          id="results"
          className={`results-pane ${mobileView === "list" ? "mobile-active" : ""}`}
          aria-label="検索結果一覧"
        >
          <VenueList
            venues={filteredVenues}
            selectedVenueId={selectedVenue?.id ?? null}
            locale={locale}
            onSelect={setSelectedVenueId}
          />
        </section>
        <section
          className={`map-pane ${mobileView === "map" ? "mobile-active" : ""}`}
          aria-label="地図と施設詳細"
        >
          <MapPanel
            venues={filteredVenues}
            selectedVenueId={selectedVenue?.id ?? null}
            onSelect={setSelectedVenueId}
          />
          {selectedVenue ? (
            <VenueDetail
              venue={selectedVenue}
              locale={locale}
              onLocaleChange={setLocale}
              onClose={() => setSelectedVenueId(null)}
              onCorrection={() => setCorrectionOpen(true)}
            />
          ) : null}
        </section>
      </main>
      {selectedVenue ? (
        <CorrectionDialog
          open={correctionOpen}
          venue={selectedVenue}
          onClose={() => setCorrectionOpen(false)}
        />
      ) : null}
    </div>
  );
}

