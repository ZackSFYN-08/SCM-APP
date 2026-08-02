"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { shipments as mockShipments } from "@/lib/mock-data";
import type { Shipment } from "@/lib/types";
import { subscribeShipments } from "@/lib/firebase/service";
import InteractiveMap from "@/components/shared/InteractiveMap";

export default function ShipmentMap() {
  const { t } = useTranslation();
  const [shipmentData, setShipmentData] = useState<Shipment[]>(mockShipments);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeShipments((data) => {
      if (data && data.length > 0) {
        setShipmentData(data);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="glass-card-static rounded-xl p-0 flex flex-col h-[380px] relative overflow-hidden"
    >
      {/* Title Badge */}
      <div className="absolute top-4 left-4 z-20 glass-panel px-4 py-2 rounded-lg flex items-center gap-3">
        <div className="w-2 h-2 rounded-full pulse-dot" />
        <h3 className="text-title-md font-semibold text-inverse-primary">
          {t("map.liveShipments")}
        </h3>
      </div>

      {/* Interactive Map */}
      <InteractiveMap
        shipments={shipmentData}
        selectedShipment={selectedShipment}
        onSelectShipment={setSelectedShipment}
        height="380px"
      />

      {/* Floating Info Card */}
      <div className="absolute bottom-4 right-4 z-20 glass-panel p-3 rounded-lg pointer-events-none">
        <div className="text-label-caps font-bold text-outline uppercase tracking-wider mb-1">
          {t("map.activeRoutes")}
        </div>
        <div className="text-headline-lg-mobile font-semibold text-white">
          {shipmentData.filter((s) => s.status === "delayed").length > 0
            ? `${shipmentData.filter((s) => s.status === "delayed").length} ${t("map.critical")}`
            : t("map.onSchedule")}
        </div>
        <div className="text-mono-data font-mono text-emerald-400 mt-1">
          {shipmentData.filter((s) => s.status === "in-transit").length} {t("shipments.inTransit")}
        </div>
      </div>
    </motion.div>
  );
}
