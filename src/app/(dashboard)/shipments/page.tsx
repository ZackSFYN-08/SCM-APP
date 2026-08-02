"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  MapPin,
  ZoomIn,
  ZoomOut,
  Clock,
  AlertTriangle,
  Truck,
  User,
  Thermometer,
  Package,
  Gauge,
  X,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { shipmentActivities } from "@/lib/mock-data";
import type { Shipment } from "@/lib/types";
import { relativeTime, getStatusBgColor } from "@/lib/utils";
import { subscribeShipments } from "@/lib/firebase/service";
import { useToast } from "@/components/shared/Toast";
import InteractiveMap from "@/components/shared/InteractiveMap";

const dotColors: Record<string, string> = {
  emerald: "bg-emerald-400",
  blue: "bg-primary-container",
  red: "bg-error",
  gray: "bg-outline",
  amber: "bg-amber-400",
};

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewRouteOpen, setIsNewRouteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t, locale } = useTranslation();
  const { showToast, ToastComponent } = useToast();

  const [newRouteForm, setNewRouteForm] = useState({
    originCity: "",
    destinationCity: "",
    courierName: "",
    scheduledDays: 3,
  });

  useEffect(() => {
    const unsubscribe = subscribeShipments((data) => {
      setShipments(data);
    });
    return () => unsubscribe();
  }, []);

  // Filter shipments by search
  const filteredShipments = shipments.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.shipmentNumber.toLowerCase().includes(q) ||
      s.driver.name.toLowerCase().includes(q) ||
      (s.destination.name || "").toLowerCase().includes(q)
    );
  });

  const handleNewRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setIsNewRouteOpen(false);
    showToast(
      locale === "id" ? "Rute baru berhasil dibuat!" : "New route created successfully!",
      "success"
    );
    setNewRouteForm({ originCity: "", destinationCity: "", courierName: "", scheduledDays: 3 });
  };

  const activeShipment = selectedShipment || filteredShipments[0];

  const inTransitCount = shipments.filter((s) => s.status === "in-transit").length;
  const pendingCount = shipments.filter((s) => s.status === "pending").length;
  const delayedCount = shipments.filter((s) => s.status === "delayed").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h2 className="text-display-lg font-bold text-white tracking-tight">
            {t("shipments.title")}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full pulse-dot" />
            <p className="text-body-sm text-outline">{t("shipments.subtitle")}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
            <input
              type="text"
              placeholder={t("shipments.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input rounded-lg pl-10 pr-4 py-2 text-body-sm text-inverse-on-surface placeholder:text-outline/50 w-[200px]"
            />
          </div>
          <button
            onClick={() => setIsNewRouteOpen(true)}
            className="btn-primary px-4 py-2 rounded-lg text-body-sm font-medium flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {t("shipments.newRoute")}
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Map + Shipment Telemetry Detail */}
        <div className="xl:col-span-2 space-y-6">
          {/* Fleet Map */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card-static rounded-xl h-[480px] relative overflow-hidden flex flex-col"
          >
            {/* Map Header */}
            <div className="absolute top-4 left-4 z-20 glass-panel px-4 py-2 rounded-lg flex items-center gap-2">
              <MapPin className="w-4 h-4 text-inverse-primary" />
              <span className="text-body-sm font-semibold text-inverse-primary">
                {t("shipments.globalFleet")}
              </span>
            </div>

            {/* Interactive Leaflet Map */}
            <InteractiveMap
              shipments={filteredShipments}
              selectedShipment={activeShipment}
              onSelectShipment={setSelectedShipment}
              height="480px"
            />
          </motion.div>

          {/* Selected Shipment Telemetry Card */}
          {activeShipment && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card-static rounded-xl p-5"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-container/20 border border-primary-container/30 flex items-center justify-center shrink-0">
                    <Truck className="w-6 h-6 text-primary-container" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-title-md font-bold text-white">
                        {t("shipments.shipment")} #{activeShipment.shipmentNumber}
                      </h3>
                      <span
                        className={`badge text-[10px] ${getStatusBgColor(
                          activeShipment.status === "in-transit"
                            ? "processing"
                            : activeShipment.status === "delivered"
                            ? "delivered"
                            : activeShipment.status
                        )}`}
                      >
                        {activeShipment.status === "in-transit"
                          ? t("shipments.inTransit")
                          : activeShipment.status}
                      </span>
                    </div>
                    <p className="text-body-sm text-outline mt-0.5">
                      {activeShipment.origin.name} → {activeShipment.destination.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-label-caps font-bold text-outline uppercase tracking-wider">
                      ETA
                    </p>
                    <p className="text-body-sm font-bold text-emerald-400 mt-0.5">
                      {activeShipment.eta}
                    </p>
                  </div>
                  <div className="text-right border-l border-white/10 pl-6">
                    <p className="text-label-caps font-bold text-outline uppercase tracking-wider">
                      {t("shipments.currentSpeed")}
                    </p>
                    <p className="text-headline-lg font-bold text-white">
                      {activeShipment.speed}{" "}
                      <span className="text-body-sm font-normal text-outline">mph</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Telemetry Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-1">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <User className="w-4 h-4 text-primary-container shrink-0" />
                  <div>
                    <p className="text-label-caps font-bold text-outline uppercase text-[10px]">
                      {t("shipments.driver")}
                    </p>
                    <p className="text-body-sm font-semibold text-white">
                      {activeShipment.driver.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <Gauge className="w-4 h-4 text-secondary-container shrink-0" />
                  <div>
                    <p className="text-label-caps font-bold text-outline uppercase text-[10px]">
                      {t("shipments.vehicleId")}
                    </p>
                    <p className="text-mono-data font-mono font-semibold text-white">
                      {activeShipment.driver.vehicleId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <Thermometer className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-label-caps font-bold text-outline uppercase text-[10px]">
                      {t("shipments.temperature")}
                    </p>
                    <p className="text-body-sm font-semibold text-emerald-400">
                      {activeShipment.temperature || 38}°F{" "}
                      <span className="text-label-caps text-outline uppercase text-[9px]">
                        ({activeShipment.temperatureStatus || "stable"})
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-label-caps font-bold text-outline uppercase text-[10px]">
                      Terakhir Diperbarui
                    </p>
                    <p className="text-body-sm font-semibold text-white">
                      {relativeTime(activeShipment.lastUpdated as Date)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-2">
                <div className="flex justify-between items-center text-label-caps font-bold text-outline uppercase text-[10px] mb-1.5">
                  <span>Kemajuan Pengiriman</span>
                  <span className="text-primary-container font-mono">65% Selesai</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary-container via-secondary-container to-emerald-400 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "65%" }}
                    transition={{ duration: 1.5, delay: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          {/* Shipment Card List */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card-static rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-inverse-primary" />
                <h3 className="text-title-md font-semibold text-inverse-primary">
                  {t("shipments.allShipments")}
                </h3>
              </div>
              <span className="text-xs font-bold font-mono text-outline bg-white/5 px-2 py-0.5 rounded">
                {filteredShipments.length}
              </span>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {filteredShipments.map((shipment) => (
                <div
                  key={shipment.id}
                  onClick={() => setSelectedShipment(shipment)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                    activeShipment?.id === shipment.id
                      ? "bg-primary-container/15 border border-primary-container/40 shadow-lg"
                      : "hover:bg-white/[0.03] border border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        shipment.status === "in-transit"
                          ? "bg-primary-container pulse-dot"
                          : shipment.status === "delayed"
                          ? "bg-error"
                          : shipment.status === "delivered"
                          ? "bg-emerald-400"
                          : "bg-amber-400"
                      }`}
                    />
                    <div>
                      <p className="text-body-sm font-semibold text-white">
                        {shipment.shipmentNumber}
                      </p>
                      <p className="text-label-caps text-outline">
                        {shipment.driver.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        shipment.status === "delayed"
                          ? "text-error"
                          : shipment.status === "delivered"
                          ? "text-emerald-400"
                          : "text-primary-container"
                      }`}
                    >
                      {shipment.status === "in-transit"
                        ? t("shipments.inTransit")
                        : shipment.status}
                    </span>
                    <p className="text-[10px] font-mono text-outline/60 mt-0.5">
                      ETA: {shipment.eta}
                    </p>
                  </div>
                </div>
              ))}
              {filteredShipments.length === 0 && (
                <div className="py-6 text-center">
                  <p className="text-body-sm text-outline">
                    {locale === "id" ? "Tidak ditemukan" : "No results"}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Queue Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card-static rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-inverse-primary" />
              <h3 className="text-title-md font-semibold text-inverse-primary">
                {t("shipments.queueSummary")}
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-body-sm text-outline">{t("shipments.inTransitCount")}</span>
                <span className="text-title-md font-bold text-primary-container">
                  {inTransitCount || 142}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-white/5">
                <span className="text-body-sm text-outline">{t("shipments.pendingDispatch")}</span>
                <span className="text-title-md font-bold text-white">
                  {pendingCount || 38}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-error" />
                  <span className="text-body-sm text-error">{t("shipments.exceptions")}</span>
                </div>
                <span className="text-title-md font-bold text-error">{delayedCount || 3}</span>
              </div>
            </div>
          </motion.div>

          {/* Live Updates */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card-static rounded-xl p-5"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-inverse-primary" />
                <h3 className="text-title-md font-semibold text-inverse-primary">
                  {t("shipments.liveUpdates")}
                </h3>
              </div>
              {delayedCount > 0 && (
                <span className="badge-danger">
                  {delayedCount} {t("shipments.alert")}
                </span>
              )}
            </div>

            <div className="space-y-0">
              {shipmentActivities.map((activity, index) => {
                const message = activity.translationKey ? t(activity.translationKey) : activity.message;
                return (
                  <div
                    key={activity.id}
                    className={`flex gap-3 py-3 ${
                      activity.color === "red"
                        ? "bg-error/5 -mx-5 px-5 border-l-2 border-error rounded-r-lg"
                        : ""
                    }`}
                  >
                    <div className="relative flex flex-col items-center">
                      <div
                        className={`w-2 h-2 rounded-full ${dotColors[activity.color]} mt-1.5 z-10 shrink-0`}
                      />
                      {index < shipmentActivities.length - 1 && (
                        <div className="w-px flex-1 bg-outline-variant/20 mt-1" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-label-caps font-bold text-outline uppercase tracking-wider mb-1">
                        {relativeTime(activity.timestamp as Date)}
                      </p>
                      <p className="text-body-sm text-white/90 leading-relaxed">
                        {message.split(/(#\S+)/g).map((part, i) =>
                          part.startsWith("#") ? (
                            <span key={i} className="font-semibold text-inverse-primary">
                              {part}
                            </span>
                          ) : (
                            <span key={i}>{part}</span>
                          )
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

    {/* Modal: New Route */}
    <AnimatePresence>
      {isNewRouteOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-white/10 relative shadow-2xl"
          >
            <button
              onClick={() => setIsNewRouteOpen(false)}
              className="absolute top-4 right-4 text-outline hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-title-lg font-bold text-white mb-6">
              {t("shipments.newShipmentTitle")}
            </h3>
            <form onSubmit={handleNewRouteSubmit} className="space-y-4">
              <div>
                <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2">
                  {t("shipments.originCity")}
                </label>
                <input
                  type="text"
                  required
                  value={newRouteForm.originCity}
                  onChange={(e) => setNewRouteForm({ ...newRouteForm, originCity: e.target.value })}
                  className="w-full glass-input rounded-lg px-4 py-2.5 text-body-sm text-white"
                  placeholder="e.g. Jakarta"
                />
              </div>
              <div>
                <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2">
                  {t("shipments.destinationCity")}
                </label>
                <input
                  type="text"
                  required
                  value={newRouteForm.destinationCity}
                  onChange={(e) => setNewRouteForm({ ...newRouteForm, destinationCity: e.target.value })}
                  className="w-full glass-input rounded-lg px-4 py-2.5 text-body-sm text-white"
                  placeholder="e.g. Surabaya"
                />
              </div>
              <div>
                <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2">
                  {t("shipments.courierName")}
                </label>
                <input
                  type="text"
                  required
                  value={newRouteForm.courierName}
                  onChange={(e) => setNewRouteForm({ ...newRouteForm, courierName: e.target.value })}
                  className="w-full glass-input rounded-lg px-4 py-2.5 text-body-sm text-white"
                  placeholder="e.g. A. Santoso"
                />
              </div>
              <div>
                <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2">
                  {t("shipments.scheduledDays")}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newRouteForm.scheduledDays}
                  onChange={(e) => setNewRouteForm({ ...newRouteForm, scheduledDays: Number(e.target.value) })}
                  className="w-full glass-input rounded-lg px-4 py-2.5 text-body-sm text-white"
                />
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setIsNewRouteOpen(false)}
                  className="btn-ghost px-4 py-2 rounded-lg text-body-sm font-semibold"
                >
                  {t("shipments.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-5 py-2 rounded-lg text-body-sm font-semibold flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    t("shipments.createRoute")
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Toast */}
    {ToastComponent}
  </div>
  );
}
