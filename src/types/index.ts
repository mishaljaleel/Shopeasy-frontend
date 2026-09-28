export type UserRole = 'Customer' | 'Merchant' | 'Admin';

export interface User {
  userID: number;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}

export interface Category {
  categoryID: number;
  name: string;
  parentID?: number | null;
  slug: string;
  productCount: number;
  subCategories?: Category[];
}

export interface Product {
  productID: number;
  merchantID: number;
  merchantName: string;
  categoryID: number;
  categoryName: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  status: 'Active' | 'Draft' | 'Archived';
  avgRating: number;
  reviewCount: number;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Address {
  addressID: number;
  fullName: string;
  addressLine: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault?: boolean;
}

export interface OrderItem {
  orderItemID: number;
  productID: number;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  orderID: number;
  customerID: number;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  totalAmount: number;
  status: 'Pending' | 'Paid' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod?: string;
  paymentStatus?: string;
  address?: Address;
  items: OrderItem[];
}

export interface Review {
  reviewID: number;
  productID: number;
  userID: number;
  userName: string;
  rating: number;
  comment?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface InventoryLog {
  logID: number;
  productID: number;
  productName: string;
  delta: number;
  operation: 'Sale' | 'Restock' | 'Return';
  loggedAt: string;
  notes?: string;
}

export interface TopProduct {
  productID: number;
  name: string;
  totalSold: number;
  revenue: number;
}

export interface LowStockAlert {
  productID: number;
  name: string;
  categoryName: string;
  currentStock: number;
  recommendedRestock: number;
  price: number;
}

export interface MerchantAnalytics {
  totalRevenue: number;
  totalOrders: number;
  activeProducts: number;
  lowStockCount: number;
  topProducts: TopProduct[];
  lowStockAlerts?: LowStockAlert[];
}

export interface CustomerAcquisition {
  totalUsers: number;
  newUsersThisMonth: number;
  totalCustomers: number;
  totalMerchants: number;
  customerGrowthRate: number;
}

export interface OrderFulfillment {
  pendingOrders: number;
  paidOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  fulfillmentRate: number;
}

export interface HighRiskOrder {
  orderID: number;
  customerName: string;
  totalAmount: number;
  orderDate: string;
  riskReason: string;
  isVerified: boolean;
}

export interface AdminAnalytics {
  totalPlatformRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalMerchants: number;
  totalProducts: number;
  topSellingProducts: TopProduct[];
  customerAcquisition?: CustomerAcquisition;
  orderFulfillment?: OrderFulfillment;
  highRiskOrders?: HighRiskOrder[];
}

export interface AdminUser {
  userID: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  orderCount: number;
}

export interface Coupon {
  code: string;
  title: string;
  description: string;
  discountType: 'Percentage' | 'Fixed' | 'FreeShipping';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
}

export interface CouponResult {
  isValid: boolean;
  code: string;
  discountType: string;
  discountAmount: number;
  finalTotal: number;
  message: string;
}


