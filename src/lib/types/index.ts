import { Timestamp } from "firebase/firestore";

// ===== Inventory =====
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  totalStock: number;
  reorderPoint: number;
  warehouseId: string;
  warehouseName: string;
  status: "good" | "low" | "depleted";
  distribution: number; // 0-100 percentage
  icon: string;
  lastUpdated: Timestamp | Date;
  drainRate?: string; // e.g., "Real-time drain"
  expectedDate?: string;
}

// ===== Orders =====
export type OrderStatus = "draft" | "approved" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  totalValue: number;
  customer: string;
  createdBy: string;
  assignedTo: string;
  priority: "low" | "medium" | "high" | "urgent";
  timestamps: {
    created: Timestamp | Date;
    updated: Timestamp | Date;
    approved?: Timestamp | Date;
    shipped?: Timestamp | Date;
    delivered?: Timestamp | Date;
  };
}

// ===== Shipments =====
export type ShipmentStatus = "pending" | "in-transit" | "delivered" | "delayed";

export interface GeoPoint {
  lat: number;
  lng: number;
  name?: string;
}

export interface Shipment {
  id: string;
  shipmentNumber: string;
  status: ShipmentStatus;
  origin: GeoPoint;
  destination: GeoPoint;
  currentPosition: GeoPoint;
  eta: string;
  driver: {
    name: string;
    vehicleId: string;
  };
  speed: number;
  temperature?: number;
  temperatureStatus?: "stable" | "warning" | "critical";
  orderId?: string;
  lastUpdated: Timestamp | Date;
}

// ===== Suppliers =====
export type SupplierStatus = "preferred" | "standard" | "probation";

export interface Supplier {
  id: string;
  name: string;
  initials: string;
  status: SupplierStatus;
  otdScore: number; // On-time delivery %
  qualityRating: number; // %
  riskIndex: number;
  riskLevel: "low" | "medium" | "high";
  contactEmail: string;
  contractEnd?: Timestamp | Date;
}

// ===== Users =====
export type UserRole = "admin" | "manager" | "warehouse" | "procurement" | "finance";

export interface AppUser {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  permissions: Record<string, boolean>;
  lastActive: Timestamp | Date;
  status: "active" | "offline";
  avatarUrl?: string;
}

// ===== Notifications =====
export type NotificationType = "shipment" | "order" | "inventory" | "system" | "approval";
export type NotificationSeverity = "info" | "warning" | "critical";

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  severity: NotificationSeverity;
  read: boolean;
  userId: string;
  createdAt: Timestamp | Date;
  referenceId?: string;
}

export interface ActivityLogEntry {
  id: string;
  type: "shipment" | "order" | "inventory" | "system" | "auth" | "approval";
  message: string;
  translationKey?: string;
  details?: string;
  userId: string;
  userName: string;
  timestamp: Timestamp | Date;
  icon?: string;
  color: "emerald" | "blue" | "red" | "gray" | "amber";
}


// ===== KPI =====
export interface KPIData {
  label: string;
  translationKey?: string;
  value: string | number;
  trend: number; // percentage change
  trendDirection: "up" | "down" | "stable";
  icon: string;
  color: string;
}

// ===== Chart Data =====
export interface ChartDataPoint {
  name: string;
  demand: number;
  inventory: number;
}

export interface LeadTimeData {
  month: string;
  target: number;
  actual: number;
}

// ===== Supplier Metrics =====
export interface SupplierMetricCard {
  label: string;
  value: string;
  trend: string;
  trendDirection: "up" | "down";
  trendColor: "emerald" | "red" | "amber";
  icon: string;
}

// ===== Navigation =====
export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

// ===== Sidebar State =====
export interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapse: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}
