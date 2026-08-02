"use client";

import { useEffect, useRef, Fragment } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Shipment } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

interface InteractiveMapContentProps {
  shipments: Shipment[];
  selectedShipment?: Shipment | null;
  onSelectShipment?: (shipment: Shipment) => void;
  height?: string;
  showControls?: boolean;
}

// Controller component to handle map movement (flyTo / fitBounds)
function MapController({
  shipments,
  selectedShipment,
}: {
  shipments: Shipment[];
  selectedShipment?: Shipment | null;
}) {
  const map = useMap();
  const prevSelectedId = useRef<string | null>(null);

  useEffect(() => {
    if (selectedShipment) {
      if (prevSelectedId.current !== selectedShipment.id) {
        const targetLat =
          selectedShipment.currentPosition?.lat ||
          selectedShipment.destination?.lat ||
          -6.2;
        const targetLng =
          selectedShipment.currentPosition?.lng ||
          selectedShipment.destination?.lng ||
          106.8;

        map.flyTo([targetLat, targetLng], 10, {
          duration: 1.5,
        });
        prevSelectedId.current = selectedShipment.id;
      }
    } else if (shipments.length > 0 && !prevSelectedId.current) {
      const points: [number, number][] = [];
      shipments.forEach((s) => {
        if (s.origin?.lat && s.origin?.lng) points.push([s.origin.lat, s.origin.lng]);
        if (s.destination?.lat && s.destination?.lng) points.push([s.destination.lat, s.destination.lng]);
        if (s.currentPosition?.lat && s.currentPosition?.lng) points.push([s.currentPosition.lat, s.currentPosition.lng]);
      });
      if (points.length > 0) {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  }, [selectedShipment, shipments, map]);

  return null;
}

// Helper to create custom Leaflet HTML DivIcons
function createOriginIcon(name?: string) {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div class="relative flex items-center justify-center">
        <div class="w-6 h-6 rounded-full bg-primary/30 border-2 border-primary-container flex items-center justify-center shadow-lg backdrop-blur-md">
          <div class="w-2.5 h-2.5 rounded-full bg-white"></div>
        </div>
        <div class="absolute -bottom-5 whitespace-nowrap bg-black/75 px-1.5 py-0.5 rounded text-[10px] font-bold text-inverse-primary border border-white/10 backdrop-blur-sm pointer-events-none">
          ${name || "Origin"}
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function createDestinationIcon(name?: string, status?: string) {
  const isDelayed = status === "delayed";
  const bgBorderColor = isDelayed
    ? "bg-error/30 border-error"
    : "bg-emerald-500/30 border-emerald-400";
  const dotColor = isDelayed ? "bg-error" : "bg-emerald-400";

  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div class="relative flex items-center justify-center">
        <div class="w-7 h-7 rounded-full ${bgBorderColor} border-2 flex items-center justify-center shadow-lg backdrop-blur-md">
          <div class="w-3 h-3 rounded-full ${dotColor} leaflet-marker-pulse"></div>
        </div>
        <div class="absolute -bottom-5 whitespace-nowrap bg-black/75 px-1.5 py-0.5 rounded text-[10px] font-bold text-white border border-white/10 backdrop-blur-sm pointer-events-none">
          ${name || "Destination"}
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function createVehicleIcon(shipmentNumber: string, status: string) {
  const isDelayed = status === "delayed";
  const isDelivered = status === "delivered";

  const colorClass = isDelayed
    ? "bg-error border-error text-white"
    : isDelivered
    ? "bg-emerald-500 border-emerald-400 text-white"
    : "bg-primary-container border-inverse-primary text-white";

  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div class="relative flex items-center justify-center group cursor-pointer">
        <div class="w-9 h-9 rounded-full ${colorClass} border-2 flex items-center justify-center shadow-xl backdrop-blur-md transition-transform transform hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
            <path d="M15 18H9"/>
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14v10"/>
            <circle cx="17" cy="18" r="2"/>
            <circle cx="7" cy="18" r="2"/>
          </svg>
        </div>
        <div class="absolute -top-6 whitespace-nowrap bg-black/85 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white border border-white/10 shadow-lg pointer-events-none">
          #${shipmentNumber}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

export default function InteractiveMapContent({
  shipments,
  selectedShipment,
  onSelectShipment,
  height = "400px",
}: InteractiveMapContentProps) {
  // Default map center (Java, Indonesia)
  const defaultCenter: [number, number] = [-6.6, 107.4];
  const defaultZoom = 7;

  return (
    <div className="w-full relative overflow-hidden" style={{ height }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full z-0 bg-[#121319]"
        style={{ height: "100%", width: "100%" }}
      >
        {/* CartoDB Dark Matter Tile Layer */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={19}
        />

        {/* Map Controller for auto-pan / bounds */}
        <MapController shipments={shipments} selectedShipment={selectedShipment} />

        {/* Render Shipments */}
        {shipments.map((shipment) => {
          const originPos: [number, number] = [
            shipment.origin.lat,
            shipment.origin.lng,
          ];
          const destPos: [number, number] = [
            shipment.destination.lat,
            shipment.destination.lng,
          ];
          const currPos: [number, number] = [
            shipment.currentPosition?.lat || (originPos[0] + destPos[0]) / 2,
            shipment.currentPosition?.lng || (originPos[1] + destPos[1]) / 2,
          ];

          const isSelected = selectedShipment?.id === shipment.id;
          const routeColor =
            shipment.status === "delayed"
              ? "#BA1A1A"
              : shipment.status === "delivered"
              ? "#10B981"
              : "#2563EB";

          return (
            <Fragment key={shipment.id}>
              {/* Origin to Current Line */}
              <Polyline
                positions={[originPos, currPos]}
                pathOptions={{
                  color: routeColor,
                  weight: isSelected ? 4 : 2.5,
                  opacity: isSelected ? 0.9 : 0.6,
                }}
              />

              {/* Current to Destination Line (Dashed) */}
              <Polyline
                positions={[currPos, destPos]}
                pathOptions={{
                  color: routeColor,
                  weight: isSelected ? 3 : 2,
                  dashArray: "6, 6",
                  opacity: isSelected ? 0.7 : 0.4,
                }}
              />

              {/* Origin Marker */}
              <Marker
                position={originPos}
                icon={createOriginIcon(shipment.origin.name)}
              />

              {/* Destination Marker */}
              <Marker
                position={destPos}
                icon={createDestinationIcon(
                  shipment.destination.name,
                  shipment.status
                )}
              />

              {/* Current Moving Position Marker */}
              <Marker
                position={currPos}
                icon={createVehicleIcon(
                  shipment.shipmentNumber,
                  shipment.status
                )}
                eventHandlers={{
                  click: () => onSelectShipment?.(shipment),
                }}
              >
                <Popup className="custom-dark-popup">
                  <div className="p-1 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5 gap-3">
                      <span className="font-bold text-white font-mono text-sm">
                        #{shipment.shipmentNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          shipment.status === "delayed"
                            ? "bg-error/20 text-error border border-error/30"
                            : shipment.status === "delivered"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-primary-container/20 text-inverse-primary border border-primary-container/30"
                        }`}
                      >
                        {shipment.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-outline block uppercase font-bold text-[9px]">
                          Driver
                        </span>
                        <span className="text-white font-medium">
                          {shipment.driver.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-outline block uppercase font-bold text-[9px]">
                          Vehicle ID
                        </span>
                        <span className="text-white font-mono">
                          {shipment.driver.vehicleId}
                        </span>
                      </div>
                      <div>
                        <span className="text-outline block uppercase font-bold text-[9px]">
                          Speed
                        </span>
                        <span className="text-white font-bold">
                          {shipment.speed} mph
                        </span>
                      </div>
                      <div>
                        <span className="text-outline block uppercase font-bold text-[9px]">
                          ETA
                        </span>
                        <span className="text-emerald-400 font-medium">
                          {shipment.eta}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-white/10 text-[10px] text-outline">
                      {shipment.origin.name} → {shipment.destination.name}
                    </div>

                    <button
                      onClick={() => onSelectShipment?.(shipment)}
                      className="w-full mt-1 bg-primary-container hover:bg-primary text-white py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Pilih Pengiriman
                    </button>
                  </div>
                </Popup>
              </Marker>
            </Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
