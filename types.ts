
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

export type BusinessModule = 'dashboard' | Department | 'sales' | 'procurement' | 'finance' | 'entities' | 'customers' | 'suppliers' | 'sample-development' | 'qc-passed' | 'reports' | 'user-management' | 'system-setup' | 'design-studio';

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
  id: string;
  styleNumber: string;
  status: 'draft' | 'prototype' | 'approved';
  yarnType?: string;
  yarnCount?: string;
  yarnRequiredLbs: number; 
  yarnPricePerLbs: number;
  knittingTime: number; 
  knittingCost: number;
  linkingCost: number;
  trimmingCost: number;
  mendingCost: number;
  sewingCosting: number;
  washingCost: number;
  pqcCosting: number;
  ironCosting: number;
  getupCosting: number;
  packingCosting: number;
  boilerGas: number;
  overheadCost: number;
  others1: number;
  others2: number;
  others3: number;
  others4: number;
  notes?: string;
  constructionNotes?: string;
  packagingNotes?: string;
}

export interface InspectionRecord {
  id: string;
  date: string;
  operatorId: string;
  machineNo: string;
  buyerName: string;
  styleNumber: string;
  color: string;
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
  totalQuantity: number;
  operatorCompletedQty: number;
  completedQty: number;
}

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  customerId?: string;
  style: string;
  color: string;
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
  styleNumber?: string;
  styleNumbers?: string[];
}
