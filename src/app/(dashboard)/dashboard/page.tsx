"use client";

import KPICards from "@/components/dashboard/KPICards";
import InventoryDemandChart from "@/components/dashboard/InventoryDemandChart";
import LiveActivityFeed from "@/components/dashboard/LiveActivityFeed";
import ShipmentMap from "@/components/dashboard/ShipmentMap";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { dashboardKPIs, inventoryDemandData } from "@/lib/mock-data";
import { exportDashboardCSV } from "@/lib/exportUtils";
import { useToast } from "@/components/shared/Toast";

export default function DashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { showToast, ToastComponent } = useToast();

  const handleExport = () => {
    try {
      exportDashboardCSV(dashboardKPIs, inventoryDemandData);
      showToast(t("export.success"), "success");
    } catch {
      showToast(t("export.error"), "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2"
      >
        <div>
          <h2 className="text-display-lg font-bold text-white tracking-tight">
            {t("dashboard.title")}
          </h2>
          <p className="text-body-lg text-outline mt-1">
            {t("dashboard.subtitle")}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="btn-ghost px-4 py-2 rounded-lg text-body-sm font-medium cursor-pointer"
          >
            {t("dashboard.exportReport")}
          </button>
          <button
            onClick={() => router.push("/orders")}
            className="btn-primary px-4 py-2 rounded-lg text-body-sm font-medium cursor-pointer"
          >
            {t("dashboard.newOrder")}
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <KPICards />

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <InventoryDemandChart />
        </div>
        <div>
          <LiveActivityFeed />
        </div>
      </div>

      {/* Map Section */}
      <ShipmentMap />

      {/* Toast */}
      {ToastComponent}
    </div>
  );
}
