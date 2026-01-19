
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Database, CloudSync, Menu, ShoppingCart, Users, Truck, Wallet, 
  FlaskConical, ClipboardCheck, BarChart3, LogOut, ShieldCheck, Loader2, AlertTriangle, 
  Settings, Terminal, Wand2, Building2, UserCircle
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
  const [initError, setInitError] = useState<string | null>(null);
  
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
    const bootstrap = async () => {
      try {
        if (!isSupabaseConfigured || !supabase) {
          setOrders(MOCK_ORDERS);
          setPurchases(MOCK_PURCHASES);
          setCustomers(MOCK_CUSTOMERS);
          setSuppliers(MOCK_SUPPLIERS);
          setTransactions(MOCK_TRANSACTIONS);
          setSamples(MOCK_SAMPLES.map(s => ({...s, trimmingCost: 0, mendingCost: 0, others1: 0, others2: 0, others3: 0, others4: 0})));
          setInspections(MOCK_INSPECTIONS);
          setLinkingRecords(MOCK_LINKING);
          setUsers(MOCK_USERS);
          setLoading(false);
          return;
        }

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (sessionData?.session?.user) {
          await fetchUserProfile(sessionData.session.user);
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        setInitError(err.message || "Failed to connect to authentication server.");
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const fetchUserProfile = async (authUser: any) => {
    if (!supabase) return;
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
      if (data) setCurrentUser(data);
      else setCurrentUser({
        id: authUser.id,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Cloud Admin',
        email: authUser.email || '',
        role: authUser.email === 'super@sweaterflow.com' ? UserRole.SUPER_ADMIN : UserRole.USER,
        department: 'All'
      });
      await fetchAllData();
    } catch (err) {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const results = await Promise.all([
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
      const [o, p, c, s, t, smp, i, l, pr] = results;
      if (o.data) setOrders(o.data.map((x: any) => ({ ...x, orderNumber: x.order_number, currentDepartment: x.current_department, startDate: x.start_date, dueDate: x.due_date, yarnDetails: x.yarn_details })));
      if (p.data) setPurchases(p.data.map((x: any) => ({ ...x, poNumber: x.po_number, supplierId: x.supplier_id, itemType: x.item_type, totalAmount: x.total_amount, styleNumber: x.style_number, lotNumber: x.lot_number, ratePerUnit: x.rate_per_unit, paymentDate: x.payment_date, paymentRef: x.payment_ref })));
      if (c.data) setCustomers(c.data.map((x: any) => ({ ...x, totalOrders: x.total_orders })));
      if (s.data) setSuppliers(s.data.map((x: any) => ({ ...x, contactPerson: x.contact_person })));
      if (t.data) setTransactions(t.data.map((x: any) => ({ ...x, entityId: x.entity_id, entityName: x.entity_name, styleNumbers: x.style_numbers })));
      if (smp.data) setSamples(smp.data.map((x: any) => ({ 
        ...x, 
        styleNumber: x.style_number, 
        yarnType: x.yarn_type, 
        yarnCount: x.yarn_count, 
        yarnRequiredLbs: x.yarn_required_lbs, 
        yarnPricePerLbs: x.yarn_price_per_lbs, 
        knittingTime: x.knitting_time, 
        knittingCost: x.knitting_cost, 
        linkingCost: x.linking_cost, 
        trimmingCost: x.trimming_cost,
        mendingCost: x.mending_cost,
        sewingCosting: x.sewing_costing, 
        washingCost: x.washing_cost, 
        pqcCosting: x.pqc_costing, 
        ironCosting: x.iron_costing, 
        getupCosting: x.getup_costing, 
        packingCosting: x.packing_costing, 
        boilerGas: x.boiler_gas, 
        overheadCost: x.overhead_cost,
        others1: x.others1,
        others2: x.others2,
        others3: x.others3,
        others4: x.others4
      })));
      if (i.data) setInspections(i.data.map((x: any) => ({ ...x, operatorId: x.operator_id, machineNo: x.machine_no, buyerName: x.buyer_name, styleNumber: x.style_number, totalDelivered: x.total_delivered, knittingCompletedQty: x.knitting_completed_qty, qualityPassed: x.quality_passed, rejectionRate: x.rejection_rate, orderNumber: x.order_number })));
      if (l.data) setLinkingRecords(l.data.map((x: any) => ({ ...x, operatorId: x.operator_id, buyerName: x.buyer_name, styleNumber: x.style_number, orderNumber: x.order_number, totalQuantity: x.total_quantity, operatorCompletedQty: x.operator_completed_qty, completedQty: x.completed_qty })));
      if (pr.data) setUsers(pr.data);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const addCustomer = (c: Customer) => setCustomers([...customers, c]);
  const addSupplier = (s: Supplier) => setSuppliers([...suppliers, s]);
  const addOrder = (o: ProductionOrder) => setOrders([...orders, o]);
  const addSample = (s: SampleType) => setSamples([...samples, s]);
  const addInspection = (i: InspectionRecord) => setInspections([...inspections, i]);
  const addPurchase = (p: PurchaseOrder) => setPurchases([...purchases, p]);
  const addTransaction = (t: Transaction) => setTransactions([...transactions, t]);
  const addUser = (u: User) => setUsers([...users, u]);
  const updateUser = (u: User) => setUsers(users.map(user => user.id === u.id ? u : user));

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard orders={orders} />;
      case 'reports': return <ReportManager orders={orders} transactions={transactions} purchases={purchases} inspections={inspections} customers={customers} suppliers={suppliers} samples={samples} linkingRecords={linkingRecords} />;
      case 'user-management': return <UserManagement users={users} onAddUser={addUser} onUpdateUser={updateUser} />;
      case 'system-setup': return <SystemSetup />;
      case 'sample-development': return <SampleDevelopment samples={samples} onAddSample={addSample} />;
      case 'qc-passed': return <QCPassedSummary orders={orders} inspections={inspections} customers={customers} onAddInspection={addInspection} />;
      case 'finance': return <FinanceManager transactions={transactions} customers={customers} suppliers={suppliers} orders={orders} purchases={purchases} inspections={inspections} onAddTransaction={addTransaction} />;
      case 'procurement': return <ProcurementManager purchases={purchases} suppliers={suppliers} orders={orders} onAddPurchase={addPurchase} />;
      case 'partners': return <EntityManager initialView="customers" customers={customers} suppliers={suppliers} onAddCustomer={addCustomer} onAddSupplier={addSupplier} />;
      case 'sales': return <SalesManager orders={orders} customers={customers} samples={samples} inspections={inspections} onAddOrder={addOrder} onAddInspection={addInspection} />;
      default: 
        if (Object.values(Department).includes(activeTab as any)) {
          return <DepartmentManager deptId={activeTab as Department} orders={orders} customers={customers} samples={samples} purchases={purchases} onUpdateOrder={() => {}} onAddOrder={addOrder} />;
        }
        return <Dashboard orders={orders} />;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-4">
      <Loader2 size={48} className="text-indigo-500 animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Initializing Database...</p>
    </div>
  );

  if (!currentUser) return <Login onLogin={(u) => setCurrentUser(u)} />;

  const navGroups = [
    {
      title: 'General',
      items: [
        { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={18} /> },
        { id: 'reports', label: 'Intelligence', icon: <BarChart3 size={18} /> },
        { id: 'sample-development', label: 'R&D Costing', icon: <FlaskConical size={18} /> }
      ]
    },
    {
      title: 'Production',
      items: [
        ...DEPARTMENTS_CONFIG.map(dept => ({ id: dept.id, label: dept.id, icon: dept.icon })),
        { id: 'qc-passed', label: 'QC Summary', icon: <ClipboardCheck size={18} /> },
      ]
    },
    {
      title: 'Business',
      items: [
        { id: 'sales', label: 'Sales Orders', icon: <ShoppingCart size={18} /> },
        { id: 'procurement', label: 'Procurement', icon: <Truck size={18} /> },
        { id: 'partners', label: 'Business Partners', icon: <UserCircle size={18} /> },
        { id: 'finance', label: 'Finance', icon: <Wallet size={18} /> },
      ]
    }
  ];

  if (currentUser.role === UserRole.SUPER_ADMIN) {
    navGroups.push({
      title: 'Admin Protocols',
      items: [
        { id: 'user-management', label: 'Users', icon: <ShieldCheck size={18} /> },
        { id: 'system-setup', label: 'Database Setup', icon: <Terminal size={18} /> }
      ]
    });
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300`}>
        <div className="h-full flex flex-col">
          <div className="p-8 flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg"><CloudSync size={24} /></div>
            <h1 className="text-xl font-bold">SweaterFlow<span className="text-indigo-400">PRO</span></h1>
          </div>
          <nav className="flex-1 px-4 space-y-8 overflow-y-auto">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-2">
                <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{group.title}</p>
                {group.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as BusinessModule)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    {item.icon}
                    <span className="text-sm font-semibold">{item.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="p-4 border-t border-white/5">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-400 font-bold text-sm">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2"><Menu size={20}/></button>
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">{activeTab.replace(/-/g, ' ')}</h2>
        </header>
        <div className="p-8 max-w-7xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
