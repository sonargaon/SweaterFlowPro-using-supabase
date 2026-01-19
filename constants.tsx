
import React from 'react';
import { 
  Box, Layers, Scissors, Search, CheckCircle, Package, 
  LayoutDashboard, ShoppingCart, Users, Truck, Wallet, FileText, FlaskConical 
} from 'lucide-react';
import { Department, ProductionOrder, Customer, Supplier, Transaction, PurchaseOrder, SampleDevelopment, InspectionRecord, LinkingRecord, User, UserRole } from './types';

export const DEPARTMENTS_CONFIG = [
  { id: Department.YARN, icon: <Box size={20} />, color: 'bg-blue-500' },
  { id: Department.KNITTING, icon: <Layers size={20} />, color: 'bg-purple-500' },
  { id: Department.INSPECTION, icon: <Search size={20} />, color: 'bg-amber-500' },
  { id: Department.LINKING, icon: <Scissors size={20} />, color: 'bg-rose-500' },
  { id: Department.FINISHING, icon: <CheckCircle size={20} />, color: 'bg-emerald-500' },
  { id: Department.ACCESSORIES, icon: <Package size={20} />, color: 'bg-indigo-500' },
];

export const MOCK_USERS: User[] = [
  {
    id: 'U1',
    name: 'Super Admin',
    email: 'super@sweaterflow.com',
    password: 'password123',
    role: UserRole.SUPER_ADMIN,
    department: 'All'
  },
  {
    id: 'U2',
    name: 'Admin Manager',
    email: 'admin@sweaterflow.com',
    password: 'password123',
    role: UserRole.ADMIN,
    department: 'All'
  },
  {
    id: 'U3',
    name: 'Yarn Operator',
    email: 'yarn@sweaterflow.com',
    password: 'password123',
    role: UserRole.USER,
    department: Department.YARN
  },
  {
    id: 'U4',
    name: 'Production Manager',
    email: 'manager@sweaterflow.com',
    password: 'password123',
    role: UserRole.MANAGER,
    department: 'All'
  }
];

export const MOCK_INSPECTIONS: InspectionRecord[] = [
  {
    id: 'INS-001',
    date: '2024-03-14',
    operatorId: 'OP-JAC-101',
    machineNo: 'M-05',
    buyerName: 'Nordic Knits Co.',
    styleNumber: 'SN-2024-X99',
    color: 'Navy',
    totalDelivered: 100,
    knittingCompletedQty: 100,
    qualityPassed: 98,
    rejected: 2,
    rejectionRate: 2,
    orderNumber: 'ORD-2024-001'
  },
  {
    id: 'INS-002',
    date: '2024-03-14',
    operatorId: 'OP-JAC-104',
    machineNo: 'M-12',
    buyerName: 'Alpine Gear',
    styleNumber: 'SN-2025-A10',
    color: 'Heather Grey',
    totalDelivered: 150,
    knittingCompletedQty: 155,
    qualityPassed: 142,
    rejected: 8,
    rejectionRate: 5.3,
    orderNumber: 'ORD-2024-002'
  }
];

export const MOCK_LINKING: LinkingRecord[] = [
  {
    id: 'LNK-001',
    date: '2024-03-14',
    operatorId: 'LNK-OP-501',
    buyerName: 'Nordic Knits Co.',
    styleNumber: 'SN-2024-X99',
    color: 'Navy',
    totalQuantity: 200,
    operatorCompletedQty: 190,
    completedQty: 185,
    orderNumber: 'ORD-2024-001'
  },
  {
    id: 'LNK-002',
    date: '2024-03-14',
    operatorId: 'LNK-OP-505',
    buyerName: 'Alpine Gear',
    styleNumber: 'SN-2025-A10',
    color: 'Heather Grey',
    totalQuantity: 100,
    operatorCompletedQty: 98,
    completedQty: 95,
    orderNumber: 'ORD-2024-002'
  }
];

export const MOCK_SAMPLES: SampleDevelopment[] = [
  {
    id: 'SAMP-001',
    styleNumber: 'SN-2024-X99',
    status: 'approved',
    yarnType: 'Cotton Blend',
    yarnCount: '2/28',
    yarnRequiredLbs: 0.85,
    yarnPricePerLbs: 18.50,
    // Fix: Added missing required windingCost property to match interface
    windingCost: 0.20,
    knittingTime: 45,
    knittingCost: 4.50,
    linkingCost: 3.20,
    // Fix: replaced trimmingMendingCost with trimmingCost and mendingCost
    trimmingCost: 0.75,
    mendingCost: 0.75,
    sewingCosting: 0.80,
    washingCost: 1.20,
    pqcCosting: 0.50,
    ironCosting: 0.70,
    getupCosting: 0.40,
    packingCosting: 0.60,
    boilerGas: 0.30,
    overheadCost: 2.00,
    // Fix: adding missing properties from SampleDevelopment interface
    others1: 0,
    others2: 0,
    others3: 0,
    others4: 0
  }
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'C1', name: 'Nordic Knits Co.', email: 'orders@nordicknits.com', phone: '+44 20 7946 0958', address: 'London, UK', totalOrders: 5, balance: 12500 },
  { id: 'C2', name: 'Alpine Gear', email: 'procurement@alpine.ch', phone: '+41 44 123 45 67', address: 'Zurich, Switzerland', totalOrders: 2, balance: 0 },
];

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 'S1', name: 'Global Yarn Hub', contactPerson: 'John Spinner', category: 'Yarn', balance: 5400 },
  { id: 'S2', name: 'Trim & Button Masters', contactPerson: 'Sarah Zipper', category: 'Accessories', balance: 1200 },
];

export const MOCK_ORDERS: ProductionOrder[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customerId: 'C1',
    style: 'SN-2024-X99',
    color: 'Navy',
    quantity: 500,
    unitPrice: 25,
    currentDepartment: Department.KNITTING,
    status: 'in-progress',
    startDate: '2024-03-01',
    dueDate: '2024-03-25',
    progress: 45
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customerId: 'C2',
    style: 'SN-2025-A10',
    color: 'Heather Grey',
    quantity: 300,
    unitPrice: 32,
    currentDepartment: Department.YARN,
    status: 'pending',
    startDate: '2024-03-05',
    dueDate: '2024-04-10',
    progress: 10,
    yarnDetails: {
      weightLbs: 450,
      wastagePercent: 5,
      lotNumber: 'LT-8821',
      dyeingFactory: 'Rainbow Dyeing Ltd',
      totalRequiredLbs: 472.5,
      yarnType: 'Acrylic',
      yarnCount: '1/12'
    }
  }
];

export const MOCK_PURCHASES: PurchaseOrder[] = [
  { id: 'PO1', poNumber: 'PO-Y-001', supplierId: 'S1', itemType: 'Yarn', description: '2/28 Cashmere Blend - Navy', quantity: 1000, unit: 'lbs', totalAmount: 15000, status: 'received', date: '2024-02-15', styleNumber: 'SN-2024-X99' },
  { id: 'PO2', poNumber: 'PO-A-002', supplierId: 'S2', itemType: 'Accessories', description: 'Logo Engraved Buttons', quantity: 5000, unit: 'pcs', totalAmount: 2500, status: 'ordered', date: '2024-03-10', styleNumber: 'SN-2025-A10' },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'T1', date: '2024-03-12', type: 'receipt', entityId: 'C1', entityName: 'Nordic Knits Co.', amount: 5000, method: 'Bank Transfer', reference: 'INV-4421', styleNumbers: ['SN-2024-X99'] },
  { id: 'T2', date: '2024-03-14', type: 'payment', entityId: 'S1', entityName: 'Global Yarn Hub', amount: 3000, method: 'Bank Transfer', reference: 'PO-Y-001-P1', styleNumbers: ['SN-2024-X99'] },
];
