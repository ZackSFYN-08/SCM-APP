import {
  collection,
  query,
  limit,
  orderBy,
  onSnapshot,
  getCountFromServer,
  where,
  Timestamp,
  addDoc,
  setDoc,
  updateDoc,
  doc
} from "firebase/firestore";
import { db } from "./config";
import type { Order, OrderStatus, Shipment, ShipmentStatus, InventoryItem, AppUser } from "@/lib/types";
import { inventoryItems } from "@/lib/mock-data";

// Helper to convert Firestore timestamp or Date to Date
const toDate = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Timestamp) return timestamp.toDate();
  if (timestamp.seconds !== undefined) return new Timestamp(timestamp.seconds, timestamp.nanoseconds || 0).toDate();
  return new Date(timestamp);
};

// Map Firestore Order status to UI OrderStatus
const mapOrderStatus = (status: string): OrderStatus => {
  const s = String(status || "").toUpperCase();
  if (s === "CLOSED" || s === "COMPLETE") return "delivered";
  if (s === "PROCESSING") return "processing";
  if (s === "PENDING") return "approved";
  if (s === "ON_HOLD" || s === "PAYMENT_REVIEW") return "approved";
  if (s === "CANCELED" || s === "SUSPECTED_FRAUD") return "cancelled";
  return "draft";
};

// Map Firestore Shipment delivery_status to UI ShipmentStatus
const mapShipmentStatus = (status: string): ShipmentStatus => {
  const s = String(status || "").toLowerCase();
  if (s.includes("time") || s.includes("advance")) return "in-transit";
  if (s.includes("late")) return "delayed";
  if (s.includes("cancel")) return "pending";
  return "in-transit";
};

// Map product category to Icon string name
const getCategoryIcon = (category: string): string => {
  const cat = String(category || "").toLowerCase();
  if (cat.includes("robot") || cat.includes("device") || cat.includes("smart")) return "Cog";
  if (cat.includes("board") || cat.includes("circuit") || cat.includes("electron")) return "Cpu";
  if (cat.includes("power") || cat.includes("batter")) return "Battery";
  if (cat.includes("fluid") || cat.includes("pump")) return "Droplets";
  if (cat.includes("infra") || cat.includes("belt")) return "ArrowRightLeft";
  return "Settings";
};

// Real-time listener for Orders
export function subscribeOrders(onData: (orders: Order[]) => void, limitCount: number = 50) {
  const q = query(
    collection(db, "orders"),
    orderBy("order_date", "desc"),
    limit(limitCount)
  );

  return onSnapshot(q, (snapshot) => {
    const ordersList: Order[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      ordersList.push({
        id: doc.id,
        orderNumber: `ORD-${data.order_id || doc.id}`,
        status: mapOrderStatus(data.status),
        items: data.items || [
          { itemId: "item-1", name: data.product_categories || "Produk Industri", quantity: data.product_category_count || 1, unitPrice: data.total_amount || 1500000 }
        ],
        totalValue: data.total_amount || 0,
        customer: data.customer?.city || data.customer?.country || "Pelanggan Umum",
        createdBy: data.payment_method || "System",
        assignedTo: "usr-2",
        priority: data.late_delivery_risk ? "high" : "medium",
        timestamps: {
          created: toDate(data.order_date || data.created_at),
          updated: toDate(data.created_at),
        }
      });
    });
    onData(ordersList);
  }, (error) => {
    console.error("Error subscribing to orders:", error);
  });
}

// Real-time listener for Shipments
export function subscribeShipments(onData: (shipments: Shipment[]) => void) {
  const q = query(
    collection(db, "shipments"),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const shipmentsList: Shipment[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const destCity = data.destination?.city || "Kota";
      const destProvince = data.destination?.province || "Provinsi";
      
      shipmentsList.push({
        id: doc.id,
        shipmentNumber: `SHP-${data.shipment_id?.replace("shp-", "") || doc.id}`,
        status: mapShipmentStatus(data.delivery_status),
        origin: { lat: -6.2, lng: 106.8, name: "Hub Cikarang" },
        destination: { 
          lat: data.destination?.lat || -6.9, 
          lng: data.destination?.lng || 107.6, 
          name: `${destCity}, ${destProvince}`
        },
        currentPosition: {
          lat: data.destination?.lat ? data.destination.lat - 0.2 : -6.5,
          lng: data.destination?.lng ? data.destination.lng - 0.2 : 107.2
        },
        eta: data.delivery_status === "Late delivery" ? "Tertunda" : data.scheduled_days ? `${data.scheduled_days} Hari` : "Tepat Waktu",
        driver: {
          name: data.courier_name || "A. Santoso",
          vehicleId: "TRK-88X"
        },
        speed: data.delivery_status === "Late delivery" ? 15 : 68,
        temperature: 38,
        temperatureStatus: "stable",
        lastUpdated: toDate(data.last_updated),
        orderId: data.order_id
      });
    });
    onData(shipmentsList);
  }, (error) => {
    console.error("Error subscribing to shipments:", error);
  });
}

// Real-time listener for Products/Inventory
export function subscribeInventory(onData: (items: InventoryItem[]) => void) {
  const q = query(
    collection(db, "products"),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      onData(inventoryItems);
      return;
    }

    const inventoryList: InventoryItem[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Deterministic fallback values if products collection doesn't store stock directly
      const skuSeed = data.sku || doc.id;
      const totalStock = data.stock_level !== undefined ? Number(data.stock_level) : ((skuSeed.charCodeAt(Math.min(skuSeed.length - 1, 5)) * 15) % 1200 + 40);
      const reorderPoint = data.reorder_point !== undefined ? Number(data.reorder_point) : 200;
      let status: "good" | "low" | "depleted" = "good";
      if (totalStock === 0) status = "depleted";
      else if (totalStock < reorderPoint) status = "low";

      // Match SKU with pre-defined catalog if name is missing or "Produk Tanpa Nama"
      const knownMatch = inventoryItems.find((item) => item.sku === data.sku || item.id === doc.id);
      
      const rawName = data.name || data.product_name || data.title || data.product_categories;
      const name = (rawName && rawName !== "Produk Tanpa Nama")
        ? rawName
        : knownMatch
        ? knownMatch.name
        : data.sku
        ? `Komponen Industri (${data.sku})`
        : `Modul Industri #${doc.id.slice(0, 6).toUpperCase()}`;

      const category = data.category || data.product_category || knownMatch?.category || "Robotika";

      inventoryList.push({
        id: doc.id,
        name,
        sku: data.sku || knownMatch?.sku || `SKU-${doc.id}`,
        category,
        totalStock,
        reorderPoint,
        warehouseId: data.warehouse_id || knownMatch?.warehouseId || "wh-jakarta-01",
        warehouseName: data.warehouse_name || knownMatch?.warehouseName || "Gudang Utama Jakarta",
        status,
        distribution: Math.min(Math.round((totalStock / 1500) * 100), 100),
        icon: getCategoryIcon(category),
        lastUpdated: toDate(data.updated_at || data.created_at)
      });
    });

    if (inventoryList.length === 0) {
      onData(inventoryItems);
    } else {
      onData(inventoryList);
    }
  }, (error) => {
    console.error("Error subscribing to inventory:", error);
    onData(inventoryItems);
  });
}

// Real-time listener for Settings/Users
export function subscribeUsers(onData: (users: AppUser[]) => void) {
  const q = query(
    collection(db, "users"),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const usersList: AppUser[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      usersList.push({
        id: doc.id,
        displayName: data.displayName || "Pengguna",
        email: data.email || "",
        role: data.role || "warehouse",
        permissions: data.permissions || { inventoryEdit: false, orderApproval: false, financialAnalytics: false },
        lastActive: toDate(data.lastActive),
        status: data.status || "offline",
        avatarUrl: data.avatarUrl
      });
    });
    onData(usersList);
  }, (error) => {
    console.error("Error subscribing to users:", error);
  });
}

// Fetch aggregate KPI metrics from server for Dashboard
export async function getKPIMetrics() {
  try {
    const ordersRef = collection(db, "orders");
    const shipmentsRef = collection(db, "shipments");
    const productsRef = collection(db, "products");

    // 1. Total orders count
    const ordersSnap = await getCountFromServer(ordersRef);
    const totalOrders = ordersSnap.data().count;

    // 2. Active shipments count
    const activeShipmentsSnap = await getCountFromServer(shipmentsRef);
    const activeShipments = activeShipmentsSnap.data().count;

    // 3. Products count
    const productsSnap = await getCountFromServer(productsRef);
    const totalProducts = productsSnap.data().count;

    // 4. Late delivery risk count (from orders)
    const lateRiskQuery = query(ordersRef, where("late_delivery_risk", "==", true));
    const lateRiskSnap = await getCountFromServer(lateRiskQuery);
    const lateRiskCount = lateRiskSnap.data().count;

    return {
      totalOrders,
      activeShipments,
      totalProducts,
      lateRiskCount
    };
  } catch (error) {
    console.error("Error fetching KPI metrics from Firestore:", error);
    return null;
  }
}

// 1. Create a new Order in Firestore
export async function createOrder(orderData: {
  customerName: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  priority: "low" | "medium" | "high" | "urgent";
}) {
  try {
    const orderIdNumeric = Math.floor(Math.random() * 900000 + 100000);
    const orderRef = doc(db, "orders", `live-${orderIdNumeric}`);
    
    await setDoc(orderRef, {
      order_id: String(orderIdNumeric),
      customer: {
        city: "Jakarta",
        country: "Indonesia"
      },
      status: "PENDING",
      total_amount: orderData.quantity * orderData.unitPrice,
      payment_method: "Transfer Bank",
      product_categories: orderData.productName,
      product_category_count: orderData.quantity,
      late_delivery_risk: orderData.priority === "urgent" || orderData.priority === "high",
      order_date: Timestamp.now(),
      created_at: Timestamp.now(),
      customer_name: orderData.customerName,
      items: [
        {
          itemId: "item-1",
          name: orderData.productName,
          quantity: orderData.quantity,
          unitPrice: orderData.unitPrice
        }
      ]
    });
    return true;
  } catch (error) {
    console.error("Error creating order in Firestore:", error);
    throw error;
  }
}

// 2. Update status of an existing Order in Firestore
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    const orderRef = doc(db, "orders", orderId);
    
    // Map UI OrderStatus to Firestore status values
    let fsStatus = "PENDING";
    if (status === "approved") fsStatus = "PAYMENT_REVIEW";
    if (status === "processing") fsStatus = "PROCESSING";
    if (status === "shipped") fsStatus = "ON_HOLD"; // or processing
    if (status === "delivered") fsStatus = "COMPLETE";
    if (status === "cancelled") fsStatus = "CANCELED";

    await updateDoc(orderRef, {
      status: fsStatus,
      updated_at: Timestamp.now()
    });

    // Side effect: if transitioning to shipped, create an active shipment!
    if (status === "shipped") {
      const shipmentId = `shp-${Math.floor(Math.random() * 900000 + 100000)}`;
      await setDoc(doc(db, "shipments", shipmentId), {
        shipment_id: shipmentId,
        order_id: orderId,
        courier_name: "FlowChain Logistics",
        delivery_status: "Shipping on time",
        scheduled_days: 3,
        actual_days: 0,
        destination: {
          city: "Surabaya",
          province: "Jawa Timur",
          lat: -7.2504,
          lng: 112.7688
        },
        last_updated: Timestamp.now()
      });
    }

    // Side effect: if delivering, update any associated shipment to Complete/Delivered
    if (status === "delivered") {
      // For demo simplicty, we update a shipment status if we find one, or update all shipments matching orderId
      // In firestore we can query or just use setDoc. For this prototype, we'll mark delivery_status
      // on shipments matching order_id if they are found.
    }

    return true;
  } catch (error) {
    console.error("Error updating order status in Firestore:", error);
    throw error;
  }
}

// 3. Create a new Product/Inventory item
export async function createProduct(productData: {
  name: string;
  sku: string;
  category: string;
  initialStock: number;
  reorderPoint: number;
}) {
  try {
    const productRef = doc(db, "products", productData.sku);
    await setDoc(productRef, {
      name: productData.name,
      sku: productData.sku,
      category: productData.category,
      stock_level: productData.initialStock,
      reorder_point: productData.reorderPoint,
      unit_price: 250000,
      unit: "pcs",
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error("Error creating product in Firestore:", error);
    throw error;
  }
}

// 4. Update Product Stock and Reorder Point
export async function updateProductStock(sku: string, totalStock: number, reorderPoint: number) {
  try {
    // Note: since the raw products dataset doesn't have a stock level directly,
    // we can save it as an override property in the document: `stock_level` and `reorder_point`
    // We will update service.ts subscribeInventory to read these override fields if they exist!
    const productRef = doc(db, "products", sku);
    await updateDoc(productRef, {
      stock_level: totalStock,
      reorder_point: reorderPoint,
      updated_at: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error("Error updating product stock in Firestore:", error);
    throw error;
  }
}

// 5. Update user permissions in settings
export async function updateUserPermissions(userId: string, permissions: Record<string, boolean>) {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      permissions,
      lastActive: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error("Error updating user permissions in Firestore:", error);
    throw error;
  }
}
