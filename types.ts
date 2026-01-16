

export enum Department {
  YARN = 'Yarn',
  ACCESSORIES = 'Accessories',
  KNITTING = 'Knitting Production',
  INSPECTION = 'Inspection',
  LINKING = 'Linking',
  FINISHING = 'Finishing'
}

export enum UserRole {
  SUPER_ADMIN = 'Super Admin',
  ADMIN = 'Admin',
  USER = 'User',
  MANAGER = 'Manager'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  department?: Department | 'All';
  lastLogin?: string;
}

// Added 'system-setup' to BusinessModule to fix type error in App.tsx
export type BusinessModule = 'dashboard' | Department | 'sales' | 'procurement' | 'finance' | 'entities' | 'sample-development' | 'qc-passed' | 'reports' | 'user-management' | 'system-setup';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  balance: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  category: 'Yarn' | 'Accessories' | 'General';
  balance: number;
}

export interface SampleDevelopment {
  id: string; // Internal UUID
  styleNumber: string; // Primary Business Key
  status: 'draft' | 'prototype' | 'approved';
  yarnType?: string; // e.g., Cotton, Acrylic, Cashmere
  yarnCount?: string; // e.g., 2/28, 1/12
  yarnRequiredLbs: number; 
  yarnPricePerLbs: number;
  knittingTime: number; 
  knittingCost: number;
  linkingCost: number;
  trimmingMendingCost: number;
  sewingCosting: number;
  washingCost: number;
  pqcCosting: number;
  ironCosting: number;
  getupCosting: number;
  packingCosting: number;
  boilerGas: number;
  overheadCost: number;
}

export interface InspectionRecord {
  id: string;
  date: string;
  operatorId: string;
  machineNo: string;
  buyerName: string;
  styleNumber: string;
  color: string; // Added to support multi-color styles
  totalDelivered: number;
  knittingCompletedQty: number;
  qualityPassed: number;
  rejected: number;
  rejectionRate: number;
  orderNumber?: string;
}

export interface LinkingRecord {
  id: string;
  date: string;
  operatorId: string;
  buyerName: string;
  styleNumber: string;
  orderNumber?: string;
  color: string;
  totalQuantity: number; // Order quantity from sales
  operatorCompletedQty: number; // Quantity completed by linking operator
  completedQty: number; // Quality Checked completed quantity in linking
}

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  customerId?: string;
  style: string;
  color: string; // Promoted to top-level for better tracking
  quantity: number;
  unitPrice: number;
  currentDepartment: Department;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  startDate: string;
  dueDate: string;
  progress: number;
  yarnDetails?: {
    weightLbs: number;
    wastagePercent: number;
    lotNumber: string;
    dyeingFactory: string;
    totalRequiredLbs: number;
    yarnType?: string;
    yarnCount?: string;
    actualUsedLbs?: number;
  };
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  itemType: 'Yarn' | 'Accessories';
  description: string;
  quantity: number;
  unit: 'lbs' | 'pcs' | 'kg';
  totalAmount: number;
  status: 'ordered' | 'received' | 'paid';
  date: string;
  styleNumber?: string;
  color?: string;
  lotNumber?: string;
  ratePerUnit?: number;
  paymentDate?: string;
  paymentRef?: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'receipt' | 'payment'; 
  entityId: string; 
  entityName: string;
  amount: number;
  method: 'Bank Transfer' | 'Cash' | 'Cheque' | 'T/T' | 'LC Payment' | 'BTB LC Payment';
  reference: string;
  styleNumber?: string; // Kept for legacy
  styleNumbers?: string[]; // New support for multiple styles
}

export interface YarnInventory {
  id: string;
  type: string;
  color: string;
  weightLbs: number;
  lotNumber: string;
  dyeingFactory: string;
  status: 'available' | 'low' | 'out';
  wastageAllowance: number;
}

export interface AccessoriesInventory {
  id: string;
  item: string;
  description: string;
  quantity: number;
  unit: string;
}