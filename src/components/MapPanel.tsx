import { useEffect, useRef } from "react";
import L from "leaflet";
import type { AccessCard } from "../domain/accessCard";

interface MapPanelProps {
  venues: AccessCard[];
  selectedVenueId: string | null;
  onSelect: (id: string) => void;
}

export function MapPanel({
  venues,
  selectedVenueId,
  onSelect
}: MapPanelProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!hostRef.current || mapRef.current) return;
    const map = L.map(hostRef.current, {
      center: [35.6812, 139.7065],
      zoom: 12,
      zoomControl: true,
      keyboard: true
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19
    }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = venues.map((venue, index) => {
      const selected = venue.id === selectedVenueId;
      const marker = L.marker([venue.location.lat, venue.location.lng], {
        title: venue.name.ja,
        keyboard: true,
        icon: L.divIcon({
          className: "venue-map-marker-wrap",
          html: `<span class="venue-map-marker${selected ? " selected" : ""}" aria-hidden="true"><b>${index + 1}</b></span>`,
          iconSize: [42, 50],
          iconAnchor: [21, 48]
        })
      });
      marker.on("click", () => onSelectRef.current(venue.id));
      marker.addTo(map);
      return marker;
    });

    if (venues.length > 0 && map.getSize().x < 600) {
      const selected =
        venues.find((venue) => venue.id === selectedVenueId) ?? venues[0];
      map.setView([selected.location.lat - 0.025, selected.location.lng], 11);
    } else if (venues.length > 0) {
      const bounds = L.latLngBounds(
        venues.map((venue) => [venue.location.lat, venue.location.lng])
      );
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 14 });
    }
  }, [selectedVenueId, venues]);

  return (
    <>
      <div
        ref={hostRef}
        className="map"
        role="region"
        aria-label="東京の施設地図。マーカーはキーボードでも選択できます"
        data-testid="venue-map"
      />
      <p className="map-fallback">
        地図画像が読み込めない場合も、一覧からすべての施設情報を確認できます。
      </p>
    </>
  );
}
