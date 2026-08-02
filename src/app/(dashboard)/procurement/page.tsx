"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  ChevronRight,
  Clock,
  CheckCircle,
  Package,
  FileText,
  Truck,
  XCircle,
  TrendingUp,
  Users,
  Timer,
  DollarSign,
  X,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { formatCurrency, relativeTime, getStatusBgColor } from "@/lib/utils";
import {
  purchaseOrders,
  suppliers,
  supplierRadarData,
  procurementMetrics,
  type PurchaseOrder,
} from "@/lib/mock-data";

const statusIcons: Record<string, React.ElementType> = {
  draft: FileText,
  pending: Clock,
  approved: CheckCircle,
  in_progress: Truck,
  received: Package,
  cancelled: XCircle,
};

const metricIcons = [Users, Clock, Timer, DollarSign];

export default function ProcurementPage() {
  const { t, locale } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isNewPOOpen, setIsNewPOOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newPOForm, setNewPOForm] = useState({
    supplierId: suppliers[0]?.id || "",
    productName: "",
    quantity: 100,
    unitCost: 100,
    priority: "medium" as "low" | "medium" | "high" | "urgent",
  });

  const filterTabs = [
    { label: t("procurement.filterAll"), value: "all" },
    { label: t("procurement.filterDraft"), value: "draft" },
    { label: t("procurement.filterPending"), value: "pending" },
    { label: t("procurement.filterApproved"), value: "approved" },
    { label: t("procurement.filterInProgress"), value: "in_progress" },
    { label: t("procurement.filterReceived"), value: "received" },
  ];

  const filteredPOs = purchaseOrders.filter((po) => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === "all" || po.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const statusLabels: Record<string, string> = {
    draft: locale === "id" ? "Draf" : "Draft",
    pending: locale === "id" ? "Tertunda" : "Pending",
    approved: locale === "id" ? "Disetujui" : "Approved",
    in_progress: locale === "id" ? "Berjalan" : "In Progress",
    received: locale === "id" ? "Diterima" : "Received",
    cancelled: locale === "id" ? "Dibatalkan" : "Cancelled",
  };

  const handleNewPOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate saving
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setIsNewPOOpen(false);
    setNewPOForm({
      supplierId: suppliers[0]?.id || "",
      productName: "",
      quantity: 100,
      unitCost: 100,
      priority: "medium",
    });
  };

  const radarData = supplierRadarData.map((d) => ({
    ...d,
    metric:
      locale === "id"
        ? d.metric
        : {
            Kualitas: "Quality",
            Biaya: "Cost",
            Pengiriman: "Delivery",
            Kelincahan: "Agility",
          }[d.metric] || d.metric,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4"
      >
        <div>
          <h2 className="text-display-lg font-bold text-white tracking-tight">
            {t("procurement.title")}
          </h2>
          <p className="text-body-lg text-outline mt-1">
            {t("procurement.subtitle")}
          </p>
        </div>
        <button
          onClick={() => setIsNewPOOpen(true)}
          className="btn-primary px-4 py-2 rounded-lg text-body-sm font-medium flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {t("procurement.newPO")}
        </button>
      </motion.div>

      {/* Metric Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {procurementMetrics.map((metric, index) => {
          const Icon = metricIcons[index];
          const label = metric.translationKey
            ? t(metric.translationKey)
            : metric.label;
          return (
            <div
              key={metric.label}
              className="glass-card p-4 rounded-xl relative overflow-hidden group"
            >
              <div className="flex justify-between items-start">
                <span className="text-label-caps font-bold text-outline uppercase tracking-wider">
                  {label}
                </span>
                <Icon className="w-5 h-5 text-primary-container" />
              </div>
              <p className="text-headline-lg-mobile font-bold text-white mt-2">
                {metric.value}
              </p>
              <span
                className={`text-mono-data font-mono ${metric.trendColor} mt-1`}
              >
                {metric.trend}
              </span>
            </div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Purchase Orders List */}
        <div className="xl:col-span-2 space-y-4">
          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
          >
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {filterTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveFilter(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-body-sm font-medium whitespace-nowrap transition-colors ${
                    activeFilter === tab.value
                      ? "bg-primary-container/20 text-inverse-primary border border-primary-container/30"
                      : "text-outline hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="text"
                placeholder={t("procurement.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input rounded-lg pl-10 pr-4 py-2 text-body-sm text-inverse-on-surface placeholder:text-outline/50 w-full sm:w-[240px]"
              />
            </div>
          </motion.div>

          {/* PO Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex items-center gap-2 mb-2"
          >
            <Package className="w-5 h-5 text-inverse-primary" />
            <h3 className="text-title-md font-semibold text-inverse-primary">
              {t("procurement.activePOs")}
            </h3>
          </motion.div>

          {/* PO Cards */}
          <div className="space-y-3">
            {filteredPOs.map((po, index) => {
              const StatusIcon = statusIcons[po.status] || FileText;
              const statusColor =
                po.status === "received"
                  ? "text-emerald-400"
                  : po.status === "cancelled"
                  ? "text-error"
                  : po.status === "in_progress"
                  ? "text-primary-container"
                  : "text-outline";

              return (
                <motion.div
                  key={po.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  onClick={() => setSelectedPO(po)}
                  className="glass-card rounded-xl p-5 cursor-pointer group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        <StatusIcon
                          className={`w-5 h-5 ${statusColor}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-body-sm font-semibold text-white font-mono">
                            {po.poNumber}
                          </span>
                          <span
                            className={`badge text-[10px] ${getStatusBgColor(
                              po.status === "in_progress"
                                ? "processing"
                                : po.status === "received"
                                ? "delivered"
                                : po.status
                            )}`}
                          >
                            {statusLabels[po.status]}
                          </span>
                          {po.priority === "urgent" && (
                            <span className="badge-danger text-[10px]">
                              {locale === "id" ? "MENDESAK" : "URGENT"}
                            </span>
                          )}
                          {po.priority === "high" && (
                            <span className="badge-warning text-[10px]">
                              {locale === "id" ? "TINGGI" : "HIGH"}
                            </span>
                          )}
                        </div>
                        <p className="text-body-sm text-outline mt-1">
                          {po.supplierName}
                        </p>
                        <p className="text-label-caps font-bold text-outline/60 mt-1">
                          {po.items.length} {t("procurement.items")} •{" "}
                          {t("procurement.expectedDelivery")}:{" "}
                          {po.expectedDelivery}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-headline-lg-mobile font-bold text-white">
                          {formatCurrency(po.totalCost)}
                        </p>
                        <p className="text-label-caps font-bold text-outline mt-0.5">
                          {relativeTime(po.createdAt)}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-outline group-hover:text-inverse-primary transition-colors" />
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {filteredPOs.length === 0 && (
              <div className="glass-card-static rounded-xl p-10 text-center">
                <Package className="w-12 h-12 text-outline/30 mx-auto mb-3" />
                <p className="text-body-sm text-outline">
                  {locale === "id"
                    ? "Tidak ada PO ditemukan."
                    : "No purchase orders found."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Supplier Radar + Top Suppliers */}
        <div className="space-y-6">
          {/* Supplier Radar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card-static rounded-xl p-5 h-[320px] flex flex-col"
          >
            <h3 className="text-title-md font-semibold text-inverse-primary mb-2">
              {t("procurement.supplierScorecard")}
            </h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: "#737686", fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    tick={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Radar
                    name={t("analytics.performance")}
                    dataKey="value"
                    stroke="#2563EB"
                    fill="#2563EB"
                    fillOpacity={0.15}
                    strokeWidth={2}
                    animationDuration={1500}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Top Suppliers List */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card-static rounded-xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-inverse-primary" />
              <h3 className="text-title-md font-semibold text-inverse-primary">
                {locale === "id" ? "Pemasok Teratas" : "Top Suppliers"}
              </h3>
            </div>

            <div className="space-y-3">
              {suppliers.slice(0, 4).map((supplier) => (
                <div
                  key={supplier.id}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-inverse-primary">
                        {supplier.initials}
                      </span>
                    </div>
                    <div>
                      <p className="text-body-sm font-semibold text-white">
                        {supplier.name}
                      </p>
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          supplier.riskLevel === "low"
                            ? "text-emerald-400"
                            : supplier.riskLevel === "medium"
                            ? "text-amber-400"
                            : "text-error"
                        }`}
                      >
                        OTD: {supplier.otdScore}%
                      </span>
                    </div>
                  </div>
                  <span
                    className={`badge text-[10px] ${getStatusBgColor(
                      supplier.status
                    )}`}
                  >
                    {supplier.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal: New PO */}
      <AnimatePresence>
        {isNewPOOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-white/10 relative shadow-2xl"
            >
              <button
                onClick={() => setIsNewPOOpen(false)}
                className="absolute top-4 right-4 text-outline hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-title-lg font-bold text-white mb-6">
                {t("procurement.createPOTitle")}
              </h3>
              <form onSubmit={handleNewPOSubmit} className="space-y-4">
                <div>
                  <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2">
                    {t("procurement.supplierSelect")}
                  </label>
                  <select
                    value={newPOForm.supplierId}
                    onChange={(e) =>
                      setNewPOForm({
                        ...newPOForm,
                        supplierId: e.target.value,
                      })
                    }
                    className="w-full glass-input rounded-lg px-4 py-2.5 text-body-sm text-white bg-black/80"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2">
                    {t("procurement.productName")}
                  </label>
                  <input
                    type="text"
                    required
                    value={newPOForm.productName}
                    onChange={(e) =>
                      setNewPOForm({
                        ...newPOForm,
                        productName: e.target.value,
                      })
                    }
                    className="w-full glass-input rounded-lg px-4 py-2.5 text-body-sm text-white"
                    placeholder="e.g. Motor Servo Alpha"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2 h-8">
                      {t("procurement.quantity")}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newPOForm.quantity}
                      onChange={(e) =>
                        setNewPOForm({
                          ...newPOForm,
                          quantity: Number(e.target.value),
                        })
                      }
                      className="w-full glass-input rounded-lg px-4 py-2.5 text-body-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2 h-8">
                      {t("procurement.unitCost")}
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newPOForm.unitCost}
                      onChange={(e) =>
                        setNewPOForm({
                          ...newPOForm,
                          unitCost: Number(e.target.value),
                        })
                      }
                      className="w-full glass-input rounded-lg px-4 py-2.5 text-body-sm text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2">
                    {t("procurement.priority")}
                  </label>
                  <select
                    value={newPOForm.priority}
                    onChange={(e) =>
                      setNewPOForm({
                        ...newPOForm,
                        priority: e.target.value as typeof newPOForm.priority,
                      })
                    }
                    className="w-full glass-input rounded-lg px-4 py-2.5 text-body-sm text-white bg-black/80"
                  >
                    <option value="low">LOW</option>
                    <option value="medium">MEDIUM</option>
                    <option value="high">HIGH</option>
                    <option value="urgent">URGENT</option>
                  </select>
                </div>
                <div className="flex gap-3 justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setIsNewPOOpen(false)}
                    className="btn-ghost px-4 py-2 rounded-lg text-body-sm font-semibold"
                  >
                    {t("procurement.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary px-5 py-2 rounded-lg text-body-sm font-semibold flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      t("procurement.save")
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: PO Detail */}
      <AnimatePresence>
        {selectedPO && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-white/10 relative shadow-2xl"
            >
              <button
                onClick={() => setSelectedPO(null)}
                className="absolute top-4 right-4 text-outline hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-title-lg font-bold text-white mb-2">
                {selectedPO.poNumber}
              </h3>
              <p className="text-body-sm text-outline mb-6">
                {locale === "id" ? "Pemasok" : "Supplier"}:{" "}
                {selectedPO.supplierName}
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-label-caps font-bold text-outline uppercase tracking-wider mb-2">
                    {locale === "id" ? "Detail Item" : "Item Details"}
                  </p>
                  {selectedPO.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-b-0"
                    >
                      <div>
                        <p className="text-body-sm font-semibold text-white">
                          {item.name}
                        </p>
                        <p className="text-xs text-outline">
                          {item.quantity} x {formatCurrency(item.unitCost)}
                        </p>
                      </div>
                      <span className="text-body-sm font-bold text-white">
                        {formatCurrency(item.quantity * item.unitCost)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3 mt-1 border-t border-white/10">
                    <span className="text-body-sm font-semibold text-outline">
                      Total
                    </span>
                    <span className="text-title-md font-bold text-inverse-primary">
                      {formatCurrency(selectedPO.totalCost)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-label-caps font-bold text-outline uppercase tracking-wider">
                      Status
                    </p>
                    <span
                      className={`badge text-[10px] mt-1 ${getStatusBgColor(
                        selectedPO.status === "in_progress"
                          ? "processing"
                          : selectedPO.status === "received"
                          ? "delivered"
                          : selectedPO.status
                      )}`}
                    >
                      {statusLabels[selectedPO.status]}
                    </span>
                  </div>
                  <div>
                    <p className="text-label-caps font-bold text-outline uppercase tracking-wider">
                      {t("procurement.expectedDelivery")}
                    </p>
                    <p className="text-body-sm text-white mt-1">
                      {selectedPO.expectedDelivery}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
