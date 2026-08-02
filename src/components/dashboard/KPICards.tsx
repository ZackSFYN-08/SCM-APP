"use client";

import { motion } from "framer-motion";
import {
  Package,
  FileText,
  Truck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
} from "lucide-react";
import { dashboardKPIs } from "@/lib/mock-data";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { formatNumber } from "@/lib/utils";
import { getKPIMetrics } from "@/lib/firebase/service";
import { useState, useEffect } from "react";
import type { KPIData } from "@/lib/types";

const iconMap: Record<string, React.ElementType> = {
  Package,
  FileText,
  Truck,
  AlertTriangle,
};

const bgColors = [
  "bg-primary/10",
  "bg-secondary/10",
  "bg-primary-container/10",
  "bg-error/10",
];

const hoverBgColors = [
  "group-hover:bg-primary/20",
  "group-hover:bg-secondary/20",
  "group-hover:bg-primary-container/20",
  "group-hover:bg-error/20",
];

export default function KPICards() {
  const [kpis, setKpis] = useState<KPIData[]>(dashboardKPIs);
  const { t } = useTranslation();

  useEffect(() => {
    async function loadKPIs() {
      const metrics = await getKPIMetrics();
      if (metrics) {
        setKpis((prev) => {
          const updated = [...prev];
          updated[0] = { ...updated[0], value: 12000 + metrics.totalProducts * 35 };
          updated[1] = { ...updated[1], value: metrics.totalOrders };
          updated[2] = { ...updated[2], value: metrics.activeShipments };
          updated[3] = { ...updated[3], value: metrics.lateRiskCount };
          return updated;
        });
      }
    }
    loadKPIs();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = iconMap[kpi.icon] || Package;
        const label = kpi.translationKey ? t(kpi.translationKey) : kpi.label;
        const formattedValue = typeof kpi.value === "number" ? formatNumber(kpi.value) : kpi.value;

        return (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="glass-card p-4 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden group cursor-default"
          >
            {/* Glow Background */}
            <div
              className={`absolute -right-4 -top-4 w-16 h-16 ${bgColors[index]} rounded-full blur-xl ${hoverBgColors[index]} transition-all duration-300`}
            />

            {/* Top Row */}
            <div className="flex justify-between items-start relative z-10">
              <span className="text-label-caps font-bold text-outline uppercase tracking-[0.05em]">
                {label}
              </span>
              <Icon className={`w-5 h-5 ${kpi.color}`} />
            </div>

            {/* Value + Trend */}
            <div className="relative z-10">
              <div className="text-headline-lg font-semibold text-white">
                {formattedValue}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {kpi.trendDirection === "up" && (
                  <>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-mono-data font-mono text-emerald-400">
                      +{kpi.trend}%
                    </span>
                  </>
                )}
                {kpi.trendDirection === "down" && (
                  <>
                    <TrendingDown className="w-3.5 h-3.5 text-error" />
                    <span className="text-mono-data font-mono text-error">
                      {kpi.trend}%
                    </span>
                  </>
                )}
                {kpi.trendDirection === "stable" && (
                  <>
                    <ArrowLeftRight className="w-3.5 h-3.5 text-outline" />
                    <span className="text-mono-data font-mono text-outline">
                      {t("kpi.stable")}
                    </span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
