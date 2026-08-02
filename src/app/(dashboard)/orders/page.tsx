"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck as TruckIcon,
  Package,
  FileText,
  XCircle,
} from "lucide-react";
import { formatCurrency, relativeTime, getStatusBgColor, USD_TO_IDR_RATE } from "@/lib/utils";
import type { OrderStatus, Order } from "@/lib/types";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { subscribeOrders, createOrder, updateOrderStatus } from "@/lib/firebase/service";
import { X } from "lucide-react";

const statusIcons: Record<OrderStatus, React.ElementType> = {
  draft: FileText,
  approved: CheckCircle,
  processing: Clock,
  shipped: TruckIcon,
  delivered: Package,
  cancelled: XCircle,
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "all">("all");
  const { t, locale } = useTranslation();

  // Modals state
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState({
    customerName: "",
    productName: "",
    quantity: 10,
    unitPrice: 150000 / USD_TO_IDR_RATE,
    priority: "medium" as "low" | "medium" | "high" | "urgent"
  });

  useEffect(() => {
    const unsubscribe = subscribeOrders((data) => {
      setOrders(data);
      setIsLoading(false);
    }, 100); // Fetch up to 100 orders

    return () => unsubscribe();
  }, []);

  const handleNewOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createOrder(newOrderForm);
      setIsNewOrderOpen(false);
      // Reset form
      setNewOrderForm({
        customerName: "",
        productName: "",
        quantity: 10,
        unitPrice: 150000 / USD_TO_IDR_RATE,
        priority: "medium"
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (status: OrderStatus) => {
    if (!selectedOrder) return;
    try {
      await updateOrderStatus(selectedOrder.id, status);
      setSelectedOrder(null);
    } catch (error) {
      console.error(error);
    }
  };

  const statusLabels: Record<OrderStatus, string> = {
    draft: t("orders.statusDraft"),
    approved: t("orders.statusApproved"),
    processing: t("orders.statusProcessing"),
    shipped: t("orders.statusShipped"),
    delivered: t("orders.statusDelivered"),
    cancelled: t("orders.statusCancelled"),
  };

  const filterTabs: { label: string; value: OrderStatus | "all" }[] = [
    { label: t("orders.filterAll"), value: "all" },
    { label: t("orders.filterDraft"), value: "draft" },
    { label: t("orders.filterApproved"), value: "approved" },
    { label: t("orders.filterProcessing"), value: "processing" },
    { label: t("orders.filterShipped"), value: "shipped" },
    { label: t("orders.filterDelivered"), value: "delivered" },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || order.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const orderStats = {
    total: orders.length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    value: orders.reduce((sum, o) => sum + o.totalValue, 0),
  };

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
            {t("orders.title")}
          </h2>
          <p className="text-body-lg text-outline mt-1">
            {t("orders.subtitle")}
          </p>
        </div>
        <button
          onClick={() => setIsNewOrderOpen(true)}
          className="btn-primary px-4 py-2 rounded-lg text-body-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> {t("orders.newOrder")}
        </button>
      </motion.div>

      {/* Order Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: t("orders.totalOrders"), value: orderStats.total, color: "text-white" },
          { label: t("orders.processing"), value: orderStats.processing, color: "text-primary-container" },
          { label: t("orders.shipped"), value: orderStats.shipped, color: "text-emerald-400" },
          { label: t("orders.totalValue"), value: formatCurrency(orderStats.value), color: "text-inverse-primary" },
        ].map((stat, i) => (
          <div key={stat.label} className="glass-card p-4 rounded-xl">
            <p className="text-label-caps font-bold text-outline uppercase tracking-wider">
              {stat.label}
            </p>
            <p className={`text-headline-lg-mobile font-bold mt-1 ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
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
            placeholder={t("orders.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input rounded-lg pl-10 pr-4 py-2 text-body-sm text-inverse-on-surface placeholder:text-outline/50 w-full sm:w-[240px]"
          />
        </div>
      </motion.div>

      {/* Order Cards */}
      <div className="space-y-3">
        {filteredOrders.map((order, index) => {
          const StatusIcon = statusIcons[order.status];

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + index * 0.05 }}
              onClick={() => setSelectedOrder(order)}
              className="glass-card rounded-xl p-5 cursor-pointer group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Order Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    <StatusIcon className={`w-5 h-5 ${order.status === "delivered" ? "text-emerald-400" : order.status === "draft" ? "text-outline" : "text-primary-container"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-body-sm font-semibold text-white font-mono">
                        {order.orderNumber}
                      </span>
                      <span className={`badge text-[10px] ${getStatusBgColor(order.status)}`}>
                        {statusLabels[order.status]}
                      </span>
                      {order.priority === "urgent" && (
                        <span className="badge-danger text-[10px]">{t("orders.urgent")}</span>
                      )}
                      {order.priority === "high" && (
                        <span className="badge-warning text-[10px]">{t("orders.high")}</span>
                      )}
                    </div>
                    <p className="text-body-sm text-outline mt-1">
                      {order.customer}
                    </p>
                    <p className="text-label-caps font-bold text-outline/60 mt-1">
                      {order.items.length} {t("orders.item")} •{" "}
                      {t("orders.created")} {relativeTime(order.timestamps.created as Date)}
                    </p>
                  </div>
                </div>

                {/* Right: Value + Arrow */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-headline-lg-mobile font-bold text-white">
                      {formatCurrency(order.totalValue)}
                    </p>
                    <p className="text-label-caps font-bold text-outline mt-0.5">
                      {t("orders.lastUpdate")}: {relativeTime(order.timestamps.updated as Date)}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-outline group-hover:text-inverse-primary transition-colors" />
                </div>
              </div>

              {/* Status Timeline (for non-draft orders) */}
              {order.status !== "draft" && (
                <div className="mt-4 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-0">
                    {(["draft", "approved", "processing", "shipped", "delivered"] as OrderStatus[]).map(
                      (step, i, arr) => {
                        const stepIndex = arr.indexOf(order.status);
                        const isCompleted = i <= stepIndex;
                        const isCurrent = i === stepIndex;

                        return (
                          <div key={step} className="flex items-center flex-1 last:flex-none">
                            <div
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                isCompleted
                                  ? isCurrent
                                    ? "bg-primary-container glow-blue"
                                    : "bg-emerald-400"
                                  : "bg-white/10"
                              }`}
                            />
                            {i < arr.length - 1 && (
                              <div
                                className={`h-px flex-1 mx-1 ${
                                  i < stepIndex ? "bg-emerald-400/50" : "bg-white/5"
                                }`}
                              />
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                  <div className="flex justify-between mt-1.5">
                    {[
                      t("orders.timelineDraft"),
                      t("orders.timelineApproved"),
                      t("orders.timelineProcessing"),
                      t("orders.timelineShipped"),
                      t("orders.timelineDelivered"),
                    ].map((label) => (
                      <span key={label} className="text-[10px] text-outline/60 font-bold uppercase">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Modal: New Order */}
      {isNewOrderOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-white/10 relative shadow-2xl min-w-[320px] sm:min-w-[480px] scrollbar-thin">
            <button
              onClick={() => setIsNewOrderOpen(false)}
              className="absolute top-4 right-4 text-outline hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-title-lg font-bold text-white mb-6">
              {locale === "id" ? "Buat Pesanan Baru" : "Create New Order"}
            </h3>
            <form onSubmit={handleNewOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2">
                  Nama Pelanggan / Customer Name
                </label>
                <input
                  type="text"
                  required
                  value={newOrderForm.customerName}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, customerName: e.target.value })}
                  className="w-full glass-input rounded-lg px-4 py-2.5 text-body-sm text-white"
                  placeholder="e.g. PT Sinar Harapan"
                />
              </div>
              <div>
                <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2">
                  Nama Produk / Product Name
                </label>
                <input
                  type="text"
                  required
                  value={newOrderForm.productName}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, productName: e.target.value })}
                  className="w-full glass-input rounded-lg px-4 py-2.5 text-body-sm text-white"
                  placeholder="e.g. Core Board v2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2 h-8">
                    Jumlah / Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newOrderForm.quantity}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, quantity: Number(e.target.value) })}
                    className="w-full glass-input rounded-lg px-4 py-2.5 text-body-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2 h-8">
                    Harga Satuan / Unit Price
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={locale === "id" ? Math.round(newOrderForm.unitPrice * USD_TO_IDR_RATE) : newOrderForm.unitPrice}
                    onChange={(e) => setNewOrderForm({ 
                      ...newOrderForm, 
                      unitPrice: locale === "id" ? Number(e.target.value) / USD_TO_IDR_RATE : Number(e.target.value) 
                    })}
                    className="w-full glass-input rounded-lg px-4 py-2.5 text-body-sm text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2">
                  Prioritas / Priority
                </label>
                <select
                  value={newOrderForm.priority}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, priority: e.target.value as any })}
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
                  onClick={() => setIsNewOrderOpen(false)}
                  className="btn-ghost px-4 py-2 rounded-lg text-body-sm font-semibold"
                >
                  Batal / Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-5 py-2 rounded-lg text-body-sm font-semibold flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Simpan / Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Order Details */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-white/10 relative shadow-2xl min-w-[320px] sm:min-w-[480px] scrollbar-thin">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-outline hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-title-lg font-bold text-white mb-2">
              {selectedOrder.orderNumber}
            </h3>
            <p className="text-body-sm text-outline mb-6">
              Customer: {selectedOrder.customer}
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-label-caps font-bold text-outline uppercase tracking-wider mb-2">
                  Detail Item
                </p>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-b-0">
                    <div>
                      <p className="text-body-sm font-semibold text-white">{item.name}</p>
                      <p className="text-xs text-outline">{item.quantity} x {formatCurrency(item.unitPrice)}</p>
                    </div>
                    <span className="text-body-sm font-bold text-white">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 mt-1 border-t border-white/10">
                  <span className="text-body-sm font-semibold text-outline">Total Value</span>
                  <span className="text-title-md font-bold text-inverse-primary">
                    {formatCurrency(selectedOrder.totalValue)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-label-caps font-bold text-outline uppercase tracking-wider">Status</p>
                  <span className={`badge text-[10px] mt-1 ${getStatusBgColor(selectedOrder.status)}`}>
                    {statusLabels[selectedOrder.status]}
                  </span>
                </div>
                <div>
                  <p className="text-label-caps font-bold text-outline uppercase tracking-wider">Priority</p>
                  <span className={`badge text-[10px] mt-1 ${selectedOrder.priority === "urgent" || selectedOrder.priority === "high" ? "bg-error/20 text-error" : "bg-white/10 text-outline"}`}>
                    {selectedOrder.priority.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Status advancement actions */}
              <div className="border-t border-white/10 pt-4 mt-6">
                <p className="text-label-caps font-bold text-outline uppercase tracking-wider mb-3">
                  Ubah Status / Progress Order
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.status === "draft" && (
                    <button
                      onClick={() => handleUpdateStatus("approved")}
                      className="px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-400 text-body-sm font-semibold transition-colors cursor-pointer"
                    >
                      Setujui / Approve
                    </button>
                  )}
                  {selectedOrder.status === "approved" && (
                    <button
                      onClick={() => handleUpdateStatus("processing")}
                      className="px-4 py-2 rounded-lg bg-primary-container/20 hover:bg-primary-container/35 text-inverse-primary text-body-sm font-semibold transition-colors cursor-pointer"
                    >
                      Proses / Process
                    </button>
                  )}
                  {selectedOrder.status === "processing" && (
                    <button
                      onClick={() => handleUpdateStatus("shipped")}
                      className="px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 text-amber-400 text-body-sm font-semibold transition-colors cursor-pointer"
                    >
                      Kirim / Ship Cargo
                    </button>
                  )}
                  {selectedOrder.status === "shipped" && (
                    <button
                      onClick={() => handleUpdateStatus("delivered")}
                      className="px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-400 text-body-sm font-semibold transition-colors cursor-pointer"
                    >
                      Terkirim / Deliver
                    </button>
                  )}
                  {selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
                    <button
                      onClick={() => handleUpdateStatus("cancelled")}
                      className="px-4 py-2 rounded-lg bg-error/15 hover:bg-error/30 text-error text-body-sm font-semibold transition-colors ml-auto cursor-pointer"
                    >
                      Batalkan / Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
