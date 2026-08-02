"use client";

import { motion } from "framer-motion";
import { History } from "lucide-react";
import { liveActivities } from "@/lib/mock-data";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { relativeTime, formatCurrency } from "@/lib/utils";
import { useState, useEffect } from "react";
import { subscribeOrders } from "@/lib/firebase/service";
import type { ActivityLogEntry } from "@/lib/types";

const dotColors: Record<string, string> = {
  emerald: "bg-emerald-400",
  blue: "bg-primary-container",
  red: "bg-error",
  gray: "bg-outline",
  amber: "bg-amber-400",
};

export default function LiveActivityFeed() {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<ActivityLogEntry[]>(liveActivities);

  useEffect(() => {
    const unsubscribe = subscribeOrders((ordersList) => {
      const liveLogs: ActivityLogEntry[] = ordersList.slice(0, 5).map((order) => ({
        id: `live-ord-${order.id}`,
        type: "order",
        message: `${order.customer} membuat pesanan ${order.orderNumber} senilai ${formatCurrency(order.totalValue)}`,
        userName: order.createdBy,
        userId: "system",
        timestamp: order.timestamps.created,
        color: order.status === "delivered" ? "emerald" : "blue",
      }));
      
      setActivities((prev) => {
        const merged = [...liveLogs];
        prev.forEach((oldAct) => {
          if (!merged.some((m) => m.id === oldAct.id)) {
            merged.push(oldAct);
          }
        });
        return merged.slice(0, 10);
      });
    }, 10);

    return () => unsubscribe();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card-static rounded-xl p-4 md:p-6 flex flex-col h-[420px]"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5">
        <h3 className="text-title-md font-semibold text-inverse-primary">
          {t("activity.title")}
        </h3>
        <History className="w-5 h-5 text-outline" />
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-0">
        {activities.map((activity, index) => {
          const message = activity.translationKey ? t(activity.translationKey) : activity.message;

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              className="flex gap-3 py-3"
            >
              {/* Timeline Dot + Line */}
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-2 h-2 rounded-full ${dotColors[activity.color]} mt-1.5 z-10 shrink-0`}
                />
                {index < liveActivities.length - 1 && (
                  <div className="w-px flex-1 bg-outline-variant/20 mt-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-1">
                <p className="text-body-sm text-white/90 leading-relaxed">
                  {activity.details ? (
                    <>
                      {message.split(activity.details)[0]}
                      <span className="font-mono text-secondary-container text-mono-data">
                        {activity.details}
                      </span>
                      {message.split(activity.details)[1]}
                    </>
                  ) : (
                    <>
                      {message.includes("#") ? (
                        <>
                          {message.split(/(#\S+)/g).map((part, i) =>
                            part.startsWith("#") ? (
                              <span key={i} className="font-semibold text-inverse-primary">
                                {part}
                              </span>
                            ) : (
                              <span key={i}>{part}</span>
                            )
                          )}
                        </>
                      ) : (
                        message.split(/(\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b)/g).map((part, i) => {
                          const boldWords = ["Microchips", "Shipment", "System", "Microchip", "Pengiriman", "Sistem"];
                          if (boldWords.some(w => part.includes(w))) {
                            return <span key={i} className="font-semibold">{part}</span>;
                          }
                          return <span key={i}>{part}</span>;
                        })
                      )}
                    </>
                  )}
                </p>
                <p className="text-label-caps font-bold text-outline uppercase tracking-wider mt-1">
                  {relativeTime(activity.timestamp as Date)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
