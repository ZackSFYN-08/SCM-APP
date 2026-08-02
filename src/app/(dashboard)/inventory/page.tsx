"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Plus,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Package,
  Cpu,
  ArrowRightLeft,
  Battery,
  Droplets,
  Settings,
  Cog,
  X,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { relativeTime, getStatusBgColor } from "@/lib/utils";
import { subscribeInventory, createProduct, updateProductStock } from "@/lib/firebase/service";
import type { InventoryItem } from "@/lib/types";
import FilterDropdown from "@/components/shared/FilterDropdown";

const iconMap: Record<string, React.ElementType> = {
  Cog,
  Cpu,
  ArrowRightLeft,
  Battery,
  Droplets,
  Settings,
  Package,
};

const ITEMS_PER_PAGE = 10;

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string[]>([]);
  const { t, locale } = useTranslation();

  // Modals state
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newProductForm, setNewProductForm] = useState({
    name: "",
    sku: "",
    category: "Smart Devices",
    initialStock: 500,
    reorderPoint: 200
  });

  const [adjustStockForm, setAdjustStockForm] = useState({
    stockLevel: 0,
    reorderPoint: 0
  });

  useEffect(() => {
    const unsubscribe = subscribeInventory((data) => {
      setInventoryItems(data);
    });
    return () => unsubscribe();
  }, []);

  const handleNewProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createProduct(newProductForm);
      await updateProductStock(newProductForm.sku, newProductForm.initialStock, newProductForm.reorderPoint);
      setIsNewProductOpen(false);
      // Reset form
      setNewProductForm({
        name: "",
        sku: "",
        category: "Smart Devices",
        initialStock: 500,
        reorderPoint: 200
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdjustStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSubmitting(true);
    try {
      await updateProductStock(selectedProduct.sku, adjustStockForm.stockLevel, adjustStockForm.reorderPoint);
      setSelectedProduct(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set adjust form values when row clicked
  const handleRowClick = (product: InventoryItem) => {
    setSelectedProduct(product);
    setAdjustStockForm({
      stockLevel: product.totalStock,
      reorderPoint: product.reorderPoint
    });
  };

  const criticalItems = inventoryItems.filter((item) => item.status === "low" || item.status === "depleted");

  const filteredItems = useMemo(() => {
    let items = inventoryItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesWarehouse =
        selectedWarehouse === "all" || item.warehouseId === selectedWarehouse;
      const matchesStatus =
        statusFilters.length === 0 || statusFilters.includes(item.status);
      const matchesCategory =
        categoryFilters.length === 0 || categoryFilters.includes(item.category);
      return matchesSearch && matchesWarehouse && matchesStatus && matchesCategory;
    });

    // Sort
    if (sortBy.length > 0) {
      const sort = sortBy[0];
      items = [...items].sort((a, b) => {
        if (sort === "name") return a.name.localeCompare(b.name);
        if (sort === "stock") return b.totalStock - a.totalStock;
        if (sort === "updated") {
          const dateA = a.lastUpdated instanceof Date ? a.lastUpdated.getTime() : 0;
          const dateB = b.lastUpdated instanceof Date ? b.lastUpdated.getTime() : 0;
          return dateB - dateA;
        }
        return 0;
      });
    }

    return items;
  }, [inventoryItems, searchQuery, selectedWarehouse, statusFilters, categoryFilters, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedWarehouse, statusFilters, categoryFilters, sortBy]);

  // Get unique categories for filter
  const categories = useMemo(
    () => [...new Set(inventoryItems.map((item) => item.category))],
    [inventoryItems]
  );

  const statusFilterOptions = [
    { label: t("inventory.statusGood"), value: "good" },
    { label: t("inventory.statusLow"), value: "low" },
    { label: t("inventory.statusDepleted"), value: "depleted" },
  ];

  const categoryFilterOptions = categories.map((cat) => ({
    label: cat,
    value: cat,
  }));

  const sortOptions = [
    { label: t("filter.sortName"), value: "name" },
    { label: t("filter.sortStock"), value: "stock" },
    { label: t("filter.sortUpdated"), value: "updated" },
  ];

  return (
    <div className="space-y-6">
      {/* Critical Stock Alert Banner */}
      {criticalItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-error/10 border border-error/20 rounded-xl px-5 py-4 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div>
            <span className="text-body-sm font-semibold text-error">
              {t("inventory.criticalAlert")}{" "}
            </span>
            <span className="text-body-sm text-white/80">
              {criticalItems.length} {t("inventory.criticalAlertMsg")}
            </span>
          </div>
        </motion.div>
      )}

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h2 className="text-display-lg font-bold text-white tracking-tight">
            {t("inventory.title")}
          </h2>
          <p className="text-body-lg text-outline mt-1">
            {t("inventory.subtitle")}
          </p>
        </div>
        <button
          onClick={() => setIsNewProductOpen(true)}
          className="btn-primary px-4 py-2 rounded-lg text-body-sm font-medium flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {locale === "id" ? "Tambah Item" : "Add Item"}
        </button>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input
            type="text"
            placeholder={t("inventory.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input rounded-lg pl-10 pr-4 py-2.5 text-body-sm text-inverse-on-surface placeholder:text-outline/50"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="glass-input rounded-lg px-4 py-2.5 text-body-sm text-inverse-on-surface appearance-none cursor-pointer min-w-[160px]"
          >
            <option value="all">{t("inventory.allWarehouses")}</option>
            <option value="wh-1">{t("inventory.warehouseA")}</option>
            <option value="wh-2">{t("inventory.warehouseB")}</option>
            <option value="wh-3">{t("inventory.warehouseC")}</option>
          </select>
          <FilterDropdown
            label={t("filter.byStatus")}
            options={statusFilterOptions}
            selectedValues={statusFilters}
            onSelectionChange={setStatusFilters}
            icon={<SlidersHorizontal className="w-4 h-4 text-inverse-primary" />}
          />
          <FilterDropdown
            label={t("filter.sortBy")}
            options={sortOptions}
            selectedValues={sortBy}
            onSelectionChange={setSortBy}
            multiSelect={false}
          />
        </div>
      </motion.div>

      {/* Inventory Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card-static rounded-xl overflow-hidden"
      >
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/5">
          <div className="col-span-4 table-header">{t("inventory.itemDetails")}</div>
          <div className="col-span-2 table-header">{t("inventory.skuCategory")}</div>
          <div className="col-span-1 table-header text-right">{t("inventory.totalStock")}</div>
          <div className="col-span-2 table-header text-center">{t("inventory.distribution")}</div>
          <div className="col-span-1 table-header text-right">{t("inventory.reorderPt")}</div>
          <div className="col-span-2 table-header text-right">{t("inventory.status")}</div>
        </div>

        {/* Table Rows */}
        {paginatedItems.map((item, index) => {
          const Icon = iconMap[item.icon] || Package;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + index * 0.05 }}
              onClick={() => handleRowClick(item)}
              className="custom-table-row grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 items-center cursor-pointer hover:bg-white/[0.02]"
            >
              {/* Item Details */}
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-inverse-primary" />
                </div>
                <div>
                  <p className="text-body-sm font-semibold text-white">
                    {item.name}
                  </p>
                  <p className="text-label-caps font-bold text-outline mt-0.5">
                    {item.drainRate ? (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-error" />
                        <span className="text-error">{item.drainRate}</span>
                      </span>
                    ) : item.expectedDate ? (
                      <span className="text-outline/60 line-through mr-1">{t("inventory.expected")}: {item.expectedDate}</span>
                    ) : (
                      `${t("inventory.updated")} ${relativeTime(item.lastUpdated as Date)}`
                    )}
                  </p>
                </div>
              </div>

              {/* SKU / Category */}
              <div className="col-span-2">
                <p className="text-mono-data font-mono text-inverse-primary/80">
                  {item.sku}
                </p>
                <p className="text-label-caps font-bold text-outline mt-0.5">
                  {item.category}
                </p>
              </div>

              {/* Total Stock */}
              <div className="col-span-1 text-right">
                <span
                  className={`text-body-sm font-semibold ${
                    item.status === "low"
                      ? "text-error"
                      : item.status === "depleted"
                      ? "text-outline/50"
                      : "text-white"
                  }`}
                >
                  {item.totalStock.toLocaleString()}
                </span>
              </div>

              {/* Distribution Bar */}
              <div className="col-span-2 px-2">
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.status === "good"
                        ? "bg-gradient-to-r from-primary-container to-tertiary-container"
                        : item.status === "low"
                        ? "bg-gradient-to-r from-primary-container to-amber-500"
                        : "bg-outline/30"
                    }`}
                    style={{ width: `${item.distribution}%` }}
                  />
                </div>
              </div>

              {/* Reorder Point */}
              <div className="col-span-1 text-right">
                <span className="text-body-sm text-outline">
                  {item.reorderPoint.toLocaleString()}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-2 flex justify-end">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-caps font-bold uppercase tracking-wider ${getStatusBgColor(
                    item.status
                  )}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.status === "good"
                        ? "bg-emerald-400"
                        : item.status === "low"
                        ? "bg-error"
                        : "bg-outline"
                    }`}
                  />
                  {item.status === "good"
                    ? t("inventory.statusGood")
                    : item.status === "low"
                    ? t("inventory.statusLow")
                    : t("inventory.statusDepleted")}
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* Pagination */}
        <div className="flex justify-between items-center px-5 py-3 border-t border-white/5">
          <span className="text-body-sm text-outline">
            {t("inventory.showing")} {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredItems.length)} {t("inventory.to")} {Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)} {t("inventory.of")} {filteredItems.length} {t("inventory.items")}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-ghost px-3 py-1.5 rounded-lg text-body-sm flex items-center gap-1 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> {t("inventory.prev")}
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-body-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-primary-container text-white"
                      : "text-outline hover:bg-white/5"
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-ghost px-3 py-1.5 rounded-lg text-body-sm flex items-center gap-1 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              {t("inventory.next")} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* FAB: Add Item */}
      <button
        onClick={() => setIsNewProductOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 btn-primary rounded-full flex items-center justify-center shadow-lg z-30 hover:scale-105 transition-transform cursor-pointer"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal: New Product */}
      {isNewProductOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-white/10 relative shadow-2xl min-w-[320px] sm:min-w-[480px] scrollbar-thin">
            <button
              onClick={() => setIsNewProductOpen(false)}
              className="absolute top-4 right-4 text-outline hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-title-lg font-bold text-white mb-6">
              {locale === "id" ? "Tambah Produk Baru" : "Add New Product"}
            </h3>
            <form onSubmit={handleNewProductSubmit} className="space-y-4">
              <div>
                <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2">
                  Nama Item / Item Name
                </label>
                <input
                  type="text"
                  required
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  className="w-full glass-input rounded-lg px-4 py-2.5 text-body-sm text-white"
                  placeholder="e.g. Lithium-Ion Battery Pack"
                />
              </div>
              <div>
                <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  required
                  value={newProductForm.sku}
                  onChange={(e) => setNewProductForm({ ...newProductForm, sku: e.target.value })}
                  className="w-full glass-input rounded-lg px-4 py-2.5 text-body-sm text-white"
                  placeholder="e.g. SKU-BAT-LI-99"
                />
              </div>
              <div>
                <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2">
                  Kategori / Category
                </label>
                <select
                  value={newProductForm.category}
                  onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                  className="w-full glass-input rounded-lg px-4 py-2.5 text-body-sm text-white bg-black/80"
                >
                  <option value="Smart Devices">Smart Devices</option>
                  <option value="Microchips & Board">Microchips & Board</option>
                  <option value="Power & Batteries">Power & Batteries</option>
                  <option value="Industrial Fluids">Industrial Fluids</option>
                  <option value="Belts & Infrastructure">Belts & Infrastructure</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2 h-8">
                    Stok Awal / Initial Stock
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newProductForm.initialStock}
                    onChange={(e) => setNewProductForm({ ...newProductForm, initialStock: Number(e.target.value) })}
                    className="w-full glass-input rounded-lg px-4 py-2.5 text-body-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2 h-8">
                    Titik Pesan / Reorder Point
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newProductForm.reorderPoint}
                    onChange={(e) => setNewProductForm({ ...newProductForm, reorderPoint: Number(e.target.value) })}
                    className="w-full glass-input rounded-lg px-4 py-2.5 text-body-sm text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setIsNewProductOpen(false)}
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

      {/* Modal: Adjust Stock / Reorder Point */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-white/10 relative shadow-2xl min-w-[320px] sm:min-w-[480px] scrollbar-thin">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-outline hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-title-lg font-bold text-white mb-2">
              {selectedProduct.name}
            </h3>
            <p className="text-body-sm text-outline mb-6">
              SKU: {selectedProduct.sku} • {selectedProduct.category}
            </p>
            <form onSubmit={handleAdjustStockSubmit} className="space-y-4">
              <div>
                <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2">
                  Sesuaikan Total Stok / Adjust Stock Level
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={adjustStockForm.stockLevel}
                  onChange={(e) => setAdjustStockForm({ ...adjustStockForm, stockLevel: Number(e.target.value) })}
                  className="w-full glass-input rounded-lg px-4 py-2.5 text-body-sm text-white"
                />
              </div>
              <div>
                <label className="block text-label-caps font-bold text-outline uppercase tracking-wider mb-2">
                  Sesuaikan Titik Pesan / Adjust Reorder Point
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={adjustStockForm.reorderPoint}
                  onChange={(e) => setAdjustStockForm({ ...adjustStockForm, reorderPoint: Number(e.target.value) })}
                  className="w-full glass-input rounded-lg px-4 py-2.5 text-body-sm text-white"
                />
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
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
                    "Perbarui / Update"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
