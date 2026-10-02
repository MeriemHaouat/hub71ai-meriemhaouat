"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { ABU_DHABI_CENTER } from "@/lib/areas";
import { TYPE_COLORS, TYPE_LABELS, type Report } from "@/lib/types";

function pinIcon(color: string, isNew: boolean) {
  return L.divIcon({
    className: "",
    html: `<span class="rafiki-pin ${isNew ? "rafiki-pin--new" : ""}" style="background:${color}"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });
}

// Pans the map to the newest report when it changes.
function FlyTo({ report }: { report: Report | null }) {
  const map = useMap();
  useEffect(() => {
    if (report) {
      map.flyTo([report.lat, report.lng], Math.max(map.getZoom(), 13), {
        duration: 1.1,
      });
    }
  }, [report, map]);
  return null;
}

export default function MapView({
  reports,
  newestId,
}: {
  reports: Report[];
  newestId: string | null;
}) {
  const newest = reports.find((r) => r.id === newestId) ?? null;

  return (
    <MapContainer
      center={ABU_DHABI_CENTER}
      zoom={11}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {reports.map((r) => (
        <Marker
          key={r.id}
          position={[r.lat, r.lng]}
          icon={pinIcon(TYPE_COLORS[r.type] ?? TYPE_COLORS.other, r.id === newestId)}
        >
          <Popup>
            <div className="space-y-1">
              <div
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: TYPE_COLORS[r.type] ?? TYPE_COLORS.other }}
              >
                {TYPE_LABELS[r.type] ?? "Tip"} · {r.area}
              </div>
              <div className="text-sm text-black">{r.detail}</div>
            </div>
          </Popup>
        </Marker>
      ))}
      <FlyTo report={newest} />
    </MapContainer>
  );
}
