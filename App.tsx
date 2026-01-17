
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Database, CloudSync, Menu, ShoppingCart, Users, Truck, Wallet, 
  FlaskConical, ClipboardCheck, BarChart3, LogOut, ShieldCheck, Loader2, AlertTriangle, 
  Settings, Terminal
} from 'lucide-react';
import { Department, ProductionOrder, BusinessModule, PurchaseOrder, Transaction, Customer, Supplier, SampleDevelopment as SampleType, InspectionRecord, LinkingRecord, User, UserRole } from './types';
import { DEPARTMENTS_CONFIG, MOCK_ORDERS, MOCK_CUSTOMERS, MOCK_SUPPLIERS, MOCK_PURCHASES, MOCK_TRANSACTIONS, MOCK_SAMPLES, MOCK_INSPECTIONS, MOCK_LINKING, MOCK_USERS } from './constants';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Dashboard } from './components/Dashboard';
import { DepartmentManager } from './components/DepartmentManager';
import { FinanceManager } from './components/FinanceManager';
import { ProcurementManager } from './components/ProcurementManager';
import { EntityManager } from './components/EntityManager';
import { SampleDevelopment } from './components/SampleDevelopment';
import { SalesManager } from './components/SalesManager';
import { InspectionManager } from './components/InspectionManager';
import { LinkingManager } from './components/LinkingManager';
import { QCPassedSummary } from './components/QCPassedSummary';
import { ReportManager } from './components/ReportManager';
import { Login } from './components/Login';
import { UserManagement } from './components/UserManagement';
import { SystemSetup } from './components/SystemSetup';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<BusinessModule>('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Business Data State
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [samples, setSamples] = useState<SampleType[]>([]);
  const [inspections, setInspections] = useState<InspectionRecord[]>([]);
  const [linkingRecords, setLinkingRecords] = useState<LinkingRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setOrders(MOCK_ORDERS);
      setPurchases(MOCK_PURCHASES);
      setCustomers(MOCK_CUSTOMERS);
      setSuppliers(MOCK_SUPPLIERS);
      setTransactions(MOCK_TRANSACTIONS);
      setSamples(MOCK_SAMPLES);
      setInspections(MOCK_INSPECTIONS);
      setLinkingRecords(MOCK_LINKING);
      setUsers(MOCK_USERS);
      setLoading(false);
      return;
    }

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: any) => {
    try {
      // Try to get profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (data) {
        setCurrentUser(data);
        fetchAllData();
      } else {
        // ERROR FIX: If profile is not found (likely DB not setup), 
        // create a temporary session user so they can access 'System Setup'
        console.warn("Profile not found in database. Using temporary session user.");
        setCurrentUser({
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Cloud User',
          email: authUser.email || '',
          role: authUser.email === 'super@sweaterflow.com' ? UserRole.SUPER_ADMIN : UserRole.USER,
          department: 'All'
        });
        // Try to fetch data anyway (might fail if tables don't exist)
        fetchAllData();
      }
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    if (!isSupabaseConfigured) return;
    
    try {
      const [
        { data: ordersData },
        { data: purchasesData },
        { data: customersData },
        { data: suppliersData },
        { data: transactionsData },
        { data: samplesData },
        { data: inspectionsData },
        { data: linkingData },
        { data: profilesData }
      ] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('purchases').select('*').order('date', { ascending: false }),
        supabase.from('customers').select('*').order('name', { ascending: true }),
        supabase.from('suppliers').select('*').order('name', { ascending: true }),
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('samples').select('*').order('style_number', { ascending: true }),
        supabase.from('inspections').select('*').order('date', { ascending: false }),
        supabase.from('linking').select('*').order('date', { ascending: false }),
        supabase.from('profiles').select('*').order('name', { ascending: true })
      ]);

      if (ordersData) setOrders(ordersData.map((o: any) => ({
        id: o.id, orderNumber: o.order_number, customerId: o.customer_id, style: o.style, color: o.color, quantity: o.quantity, unitPrice: o.unit_price, currentDepartment: o.current_department, status: o.status, startDate: o.start_date, dueDate: o.due_date, progress: o.progress, yarnDetails: o.yarn_details
      })));
      
      if (purchasesData) setPurchases(purchasesData.map((p: any) => ({
        id: p.id, poNumber: p.po_number, supplierId: p.supplier_id, itemType: p.item_type, description: p.description, quantity: p.quantity, unit: p.unit, totalAmount: p.total_amount, status: p.status, date: p.date, styleNumber: p.style_number, color: p.color, lotNumber: p.lot_number, ratePerUnit: p.rate_per_unit, paymentDate: p.payment_date, paymentRef: p.payment_ref
      })));

      if (customersData) setCustomers(customersData.map((c: any) => ({
        id: c.id, name: c.name, email: c.email, phone: c.phone, address: c.address, totalOrders: c.total_orders, balance: c.balance
      })));

      if (suppliersData) setSuppliers(suppliersData.map((s: any) => ({
        id: s.id, name: s.name, contactPerson: s.contact_person, category: s.category, balance: s.balance
      })));
      
      if (transactionsData) setTransactions(transactionsData.map((t: any) => ({
        id: t.id, date: t.date, type: t.type, entityId: t.entity_id, entityName: t.entity_name, amount: t.amount, method: t.method, reference: t.reference, styleNumbers: t.style_numbers
      })));

      if (samplesData) setSamples(samplesData.map((s: any) => ({
        id: s.id, styleNumber: s.style_number, status: s.status, yarnType: s.yarn_type, yarnCount: s.yarn_count, yarnRequiredLbs: s.yarn_required_lbs, yarnPricePerLbs: s.yarn_price_per_lbs, knittingTime: s.knitting_time, knittingCost: s.knitting_cost, linkingCost: s.linking_cost, trimmingMendingCost: s.trimming_mending_cost, sewingCosting: s.sewing_costing, washingCost: s.washing_cost, pqcCosting: s.pqc_costing, ironCosting: s.iron_costing, getupCosting: s.getup_costing, packingCosting: s.packing_costing, boilerGas: s.boiler_gas, overheadCost: s.overhead_cost
      })));

      if (inspectionsData) setInspections(inspectionsData.map((i: any) => ({
        id: i.id, date: i.date, operatorId: i.operator_id, machineNo: i.machine_no, buyerName: i.buyer_name, styleNumber: i.style_number, color: i.color, totalDelivered: i.total_delivered, knittingCompletedQty: i.knitting_completed_qty, qualityPassed: i.quality_passed, rejected: i.rejected, rejectionRate: i.rejection_rate, orderNumber: i.order_number
      })));

      if (linkingData) setLinkingRecords(linkingData.map((l: any) => ({
        id: l.id, date: l.date, operatorId: l.operator_id, buyerName: l.buyer_name, styleNumber: l.style_number, orderNumber: l.order_number, color: l.color, totalQuantity: l.total_quantity, operatorCompletedQty: l.operator_completed_qty, completedQty: l.completed_qty
      })));

      if (profilesData) setUsers(profilesData);
    } catch (err) {
      console.error("Data fetch error - tables might not exist yet:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
  };

  const handleAddOrder = async (newOrder: ProductionOrder) => {
    if (isSupabaseConfigured) {
      const dbOrder = {
        id: newOrder.id,
        order_number: newOrder.orderNumber,
        customer_id: newOrder.customerId,
        style: newOrder.style,
        color: newOrder.color,
        quantity: newOrder.quantity,
        unit_price: newOrder.unitPrice,
        current_department: newOrder.currentDepartment,
        status: newOrder.status,
        start_date: newOrder.startDate,
        due_date: newOrder.dueDate,
        progress: newOrder.progress,
        yarn_details: newOrder.yarnDetails
      };
      const { error } = await supabase.from('orders').insert([dbOrder]);
      if (!error) fetchAllData();
    } else {
      setOrders(prev => [newOrder, ...prev]);
    }
  };

  const handleUpdateOrder = async (updatedOrder: ProductionOrder) => {
    if (isSupabaseConfigured) {
      const dbOrder = {
        order_number: updatedOrder.orderNumber,
        customer_id: updatedOrder.customerId,
        style: updatedOrder.style,
        color: updatedOrder.color,
        quantity: updatedOrder.quantity,
        unit_price: updatedOrder.unitPrice,
        current_department: updatedOrder.currentDepartment,
        status: updatedOrder.status,
        start_date: updatedOrder.startDate,
        due_date: updatedOrder.dueDate,
        progress: updatedOrder.progress,
        yarn_details: updatedOrder.yarnDetails
      };
      const { error } = await supabase.from('orders').update(dbOrder).eq('id', updatedOrder.id);
      if (!error) fetchAllData();
    } else {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    }
  };

  const handleAddPurchase = async (newPO: PurchaseOrder) => {
    if (isSupabaseConfigured) {
      const dbPO = {
        id: newPO.id,
        po_number: newPO.poNumber,
        supplier_id: newPO.supplierId,
        item_type: newPO.itemType,
        description: newPO.description,
        quantity: newPO.quantity,
        unit: newPO.unit,
        total_amount: newPO.totalAmount,
        status: newPO.status,
        date: newPO.date,
        style_number: newPO.styleNumber,
        color: newPO.color,
        lot_number: newPO.lotNumber,
        rate_per_unit: newPO.ratePerUnit,
        payment_date: newPO.paymentDate,
        payment_ref: newPO.paymentRef
      };
      const { error } = await supabase.from('purchases').insert([dbPO]);
      if (!error) fetchAllData();
    } else {
      setPurchases(prev => [newPO, ...prev]);
    }
  };

  const handleAddTransaction = async (newTx: Transaction) => {
    if (isSupabaseConfigured) {
      const dbTx = {
        id: newTx.id,
        date: newTx.date,
        type: newTx.type,
        entity_id: newTx.entityId,
        entity_name: newTx.entityName,
        amount: newTx.amount,
        method: newTx.method,
        reference: newTx.reference,
        style_numbers: newTx.styleNumbers
      };
      const { error } = await supabase.from('transactions').insert([dbTx]);
      if (!error) fetchAllData();
    } else {
      setTransactions(prev => [...prev, newTx]);
    }
  };

  const handleAddSample = async (newSample: SampleType) => {
    if (isSupabaseConfigured) {
      const dbSample = {
        id: newSample.id,
        style_number: newSample.styleNumber,
        status: newSample.status,
        yarn_type: newSample.yarnType,
        yarn_count: newSample.yarnCount,
        yarn_required_lbs: newSample.yarnRequiredLbs,
        yarn_price_per_lbs: newSample.yarnPricePerLbs,
        knitting_time: newSample.knittingTime,
        knitting_cost: newSample.knittingCost,
        linking_cost: newSample.linkingCost,
        trimming_mending_cost: newSample.trimmingMendingCost,
        sewing_costing: newSample.sewingCosting,
        washing_cost: newSample.washingCost,
        pqc_costing: newSample.pqcCosting,
        iron_costing: newSample.ironCosting,
        getup_costing: newSample.getupCosting,
        packing_costing: newSample.packingCosting,
        boiler_gas: newSample.boilerGas,
        overhead_cost: newSample.overheadCost
      };
      const { error } = await supabase.from('samples').insert([dbSample]);
      if (!error) fetchAllData();
    } else {
      setSamples(prev => [newSample, ...prev]);
    }
  };

  const handleAddCustomer = async (newCustomer: Customer) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('customers').insert([{
        id: newCustomer.id,
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        address: newCustomer.address
      }]);
      if (!error) fetchAllData();
    } else {
      setCustomers(prev => [newCustomer, ...prev]);
    }
  };

  const handleAddSupplier = async (newSupplier: Supplier) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('suppliers').insert([{
        id: newSupplier.id,
        name: newSupplier.name,
        contact_person: newSupplier.contactPerson,
        category: newSupplier.category
      }]);
      if (!error) fetchAllData();
    } else {
      setSuppliers(prev => [newSupplier, ...prev]);
    }
  };

  const handleAddInspection = async (i: InspectionRecord) => {
    if (isSupabaseConfigured) {
      const dbInspection = {
        id: i.id,
        date: i.date,
        operator_id: i.operatorId,
        machine_no: i.machineNo,
        buyer_name: i.buyerName,
        style_number: i.styleNumber,
        color: i.color,
        total_delivered: i.totalDelivered,
        knitting_completed_qty: i.knittingCompletedQty,
        quality_passed: i.qualityPassed,
        rejected: i.rejected,
        rejection_rate: i.rejectionRate,
        order_number: i.orderNumber
      };
      const { error } = await supabase.from('inspections').insert([dbInspection]);
      if (!error) fetchAllData();
    } else {
      setInspections(prev => [i, ...prev]);
    }
  };

  const handleAddLinking = async (l: LinkingRecord) => {
    if (isSupabaseConfigured) {
      const dbLinking = {
        id: l.id,
        date: l.date,
        operator_id: l.operatorId,
        buyer_name: l.buyerName,
        style_number: l.styleNumber,
        order_number: l.orderNumber,
        color: l.color,
        total_quantity: l.totalQuantity,
        operator_completed_qty: l.operatorCompletedQty,
        completed_qty: l.completedQty
      };
      const { error } = await supabase.from('linking').insert([dbLinking]);
      if (!error) fetchAllData();
    } else {
      setLinkingRecords(prev => [l, ...prev]);
    }
  };

  const handleAddUser = async (newUser: User) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('profiles').insert([{
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department
      }]);
      if (!error) fetchAllData();
    } else {
      setUsers(prev => [newUser, ...prev]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-4">
        <Loader2 size={48} className="text-indigo-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
          {isSupabaseConfigured ? 'Securing Cloud Handshake...' : 'Booting Local Engine...'}
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={(user) => setCurrentUser(user)} />;
  }

  const getNavGroups = () => {
    const isAdmin = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN;
    const isSuper = currentUser.role === UserRole.SUPER_ADMIN;
    const isManager = currentUser.role === UserRole.MANAGER || isAdmin;

    const groups = [
      {
        title: 'General',
        items: [
          { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={18} /> },
          { id: 'reports', label: 'Intelligence', icon: <BarChart3 size={18} /> },
          ...(isManager ? [{ id: 'sample-development', label: 'R&D Costing', icon: <FlaskConical size={18} /> }] : [])
        ]
      },
      {
        title: 'Production',
        items: [
          ...DEPARTMENTS_CONFIG
            .filter(dept => currentUser.department === 'All' || currentUser.department === dept.id)
            .map(dept => ({ id: dept.id, label: dept.id, icon: dept.icon })),
          { id: 'qc-passed', label: 'QC Summary', icon: <ClipboardCheck size={18} /> },
        ]
      }
    ];

    if (isManager) {
      groups.push({
        title: 'Business',
        items: [
          { id: 'sales', label: 'Sales Orders', icon: <ShoppingCart size={18} /> },
          { id: 'procurement', label: 'Procurement', icon: <Truck size={18} /> },
          { id: 'finance', label: 'Finance', icon: <Wallet size={18} /> },
          { id: 'entities', label: 'Network', icon: <Users size={18} /> },
        ]
      });
    }

    if (isSuper) {
      groups.push({
        title: 'System Protocols',
        items: [
          { id: 'user-management', label: 'Users', icon: <ShieldCheck size={18} /> },
          { id: 'system-setup', label: 'Database Setup', icon: <Terminal size={18} /> }
        ]
      });
    }

    return groups;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard orders={orders} />;
      case 'reports': return <ReportManager orders={orders} transactions={transactions} purchases={purchases} inspections={inspections} customers={customers} suppliers={suppliers} samples={samples} linkingRecords={linkingRecords} />;
      case 'user-management': return <UserManagement users={users} onAddUser={handleAddUser} />;
      case 'system-setup': return <SystemSetup />;
      case 'sample-development': return <SampleDevelopment samples={samples} onAddSample={handleAddSample} />;
      case 'qc-passed': return <QCPassedSummary orders={orders} inspections={inspections} customers={customers} onAddInspection={handleAddInspection} />;
      case 'finance': return <FinanceManager transactions={transactions} customers={customers} suppliers={suppliers} orders={orders} purchases={purchases} inspections={inspections} onAddTransaction={handleAddTransaction} />;
      case 'procurement': return <ProcurementManager purchases={purchases} suppliers={suppliers} orders={orders} onAddPurchase={handleAddPurchase} />;
      case 'entities': return <EntityManager customers={customers} suppliers={suppliers} onAddCustomer={handleAddCustomer} onAddSupplier={handleAddSupplier} />;
      case 'sales': return <SalesManager orders={orders} customers={customers} samples={samples} inspections={inspections} onAddOrder={handleAddOrder} onAddInspection={handleAddInspection} />;
      case Department.INSPECTION: return <InspectionManager records={inspections} customers={customers} samples={samples} orders={orders} onAddRecord={handleAddInspection} />;
      case Department.LINKING: return <LinkingManager records={linkingRecords} customers={customers} samples={samples} orders={orders} inspections={inspections} onAddRecord={handleAddLinking} />;
      default: 
        if (Object.values(Department).includes(activeTab as any)) {
          return <DepartmentManager deptId={activeTab as Department} orders={orders} customers={customers} samples={samples} purchases={purchases} onUpdateOrder={handleUpdateOrder} onAddOrder={handleAddOrder} />;
        }
        return <Dashboard orders={orders} />;
    }
  };

  const navGroups = getNavGroups();

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 print:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/30">
                <CloudSync size={24} className="text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">SweaterFlow<span className="text-indigo-400 font-black">PRO</span></h1>
            </div>
          </div>

          <div className="px-6 py-4 mb-4">
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-inner">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate leading-tight">{currentUser.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded text-[8px] font-black uppercase tracking-tighter">
                    {currentUser.role}
                  </span>
                  {isSupabaseConfigured && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>}
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 pb-6 space-y-8 overflow-y-auto scrollbar-hide">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-2">
                <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{group.title}</p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as BusinessModule)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                      {item.icon}
                      <span className="font-semibold text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-white/5 flex flex-col gap-2">
            <div className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isSupabaseConfigured ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              <Database size={12} />
              {isSupabaseConfigured ? 'Cloud Live' : 'Mock Mode'}
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-400 transition-all font-bold text-sm">
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden">
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-tight">{activeTab.replace(/-/g, ' ')}</h2>
              {!isSupabaseConfigured && (
                <div className="flex items-center gap-1.5 text-amber-600 font-black text-[9px] uppercase tracking-widest mt-0.5 animate-pulse">
                  <AlertTriangle size={10} />
                  Development Preview (Local)
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
