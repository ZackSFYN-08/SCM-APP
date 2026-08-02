"use client";

import dynamic from "next/dynamic";
import type { Shipment } from "@/lib/types";
import { MapPin } from "lucide-react";

interface InteractiveMapProps {
  shipments: Shipment[];
  selectedShipment?: Shipment | null;
  onSelectShipment?: (shipment: Shipment) => void;
  height?: string;
}

// Dynamically load the Leaflet Map component (no SSR)
const DynamicMap = dynamic(
  () => import("./InteractiveMapContent"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#121319] flex items-center justify-center flex-col gap-3 rounded-xl border border-white/5">
        <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center animate-pulse">
          <MapPin className="w-5 h-5 text-inverse-primary" />
        </div>
        <p className="text-body-sm text-outline font-mono">
          Memuat Peta Telemetri...
        </p>
      </div>
    ),
  }
);

export default function InteractiveMap(props: InteractiveMapProps) {
  return <DynamicMap {...props} />;
}
