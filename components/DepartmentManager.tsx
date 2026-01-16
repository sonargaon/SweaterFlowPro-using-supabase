
import React, { useState, useEffect, useMemo } from 'react';
import { Department, ProductionOrder, Customer, SampleDevelopment, PurchaseOrder } from '../types';
import { 
  Search, Plus, Filter, Download, RefreshCw, Hash, Factory, 
  X, Calendar, Package, Weight, Tag, Percent, Palette, CloudSync, User, ChevronDown, ArrowUpRight, ArrowDownRight, Equal, Printer, Eye, FileOutput, Calculator, Database, TrendingUp, TrendingDown, Scale
} from 'lucide-react';
import { DEPARTMENTS_CONFIG } from '../constants';
import { YarnCalculator } from './YarnCalculator';

interface DepartmentManagerProps {
  deptId: Department;
  orders: ProductionOrder[];
  customers: Customer[];
  samples?: SampleDevelopment[];
  purchases?: PurchaseOrder[];
  onUpdateOrder: (order: ProductionOrder) => void;
  onAddOrder?: (order: ProductionOrder) => void;
}

export const DepartmentManager: React.FC<DepartmentManagerProps> = ({ 
  deptId, 
  orders, 
  customers, 
  samples = [], 
  purchases = [],
  onUpdateOrder, 
  onAddOrder 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showStockReport, setShowStockReport] = useState(false);
  const [matchingOrder, setMatchingOrder] = useState<ProductionOrder | null>(null);
  
  const isYarnDept = deptId === Department.YARN;
  const isKnittingDept = deptId === Department.KNITTING;

  const [newOrder, setNewOrder] = useState<Partial<ProductionOrder>>({
    orderNumber: '',
    customerId: '',
    style: '',
    color: '',
    quantity: 0,
    status: 'pending',
    progress: 0,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    yarnDetails: {
      weightLbs: 0,
      wastagePercent: 5,
      lotNumber: '',
      dyeingFactory: '',
      totalRequiredLbs: 0,
      yarnType: '',
      yarnCount: '',
      actualUsedLbs: 0
    }
  });

  // Calculate Yarn Inventory/Balance for all styles
  const yarnInventoryData = useMemo(() => {
    if (!isYarnDept) return [];

    // Grouping by Style + Color
    const styleGroups = Array.from(new Set(orders.map(o => `${o.style}|${o.color}`)));

    return styleGroups.map((group: string) => {
      const [style, color] = group.split('|');
      const sample = samples.find(s => s.styleNumber === style);
      const consumption = sample?.yarnRequiredLbs || 0;
      const yarnType = sample?.yarnType || 'N/A';
      const yarnCount = sample?.yarnCount || 'N/A';

      const salesOrders = orders.filter(o => o.style === style && o.color === color && o.customerId);
      const totalSalesQty = salesOrders.reduce((sum, o) => sum + o.quantity, 0);

      // Total Standard Required (Based on Sales Booking)
      const requiredForOrder = totalSalesQty * consumption;

      // Actual usage reported from Knitting
      const productionRecords = orders.filter(o => o.style === style && o.color === color && o.currentDepartment === Department.KNITTING);
      const totalActualUsed = productionRecords.reduce((sum, o) => sum + (o.yarnDetails?.actualUsedLbs || 0), 0);
      
      // Standard usage based on what was produced
      const totalProducedQty = productionRecords.reduce((sum, o) => sum + o.quantity, 0);
      const standardUsedForProduced = totalProducedQty * consumption;

      const totalReceived = purchases
        .filter(p => p.styleNumber === style && p.color === color && p.itemType === 'Yarn')
        .reduce((sum, p) => sum + p.quantity, 0);

      // Surplus/Deficit relative to required booking
      const surplusDeficit = requiredForOrder - totalActualUsed;
      const storeBalance = totalReceived - totalActualUsed;

      return {
        style,
        color,
        yarnType,
        yarnCount,
        consumption,
        totalSalesQty,
        totalProducedQty,
        totalReceived,
        requiredForOrder,
        totalActualUsed,
        standardUsedForProduced,
        surplusDeficit,
        storeBalance
      };
    });
  }, [orders, samples, purchases, isYarnDept]);

  const findSalesTarget = (order: ProductionOrder) => {
    return orders.find(o => o.orderNumber === order.orderNumber && o.customerId);
  };

  const availableStyles = useMemo(() => {
    if (!newOrder.customerId) return [];
    const customerOrders = orders.filter(o => o.customerId === newOrder.customerId);
    return Array.from(new Set(customerOrders.map(o => o.style))).sort();
  }, [newOrder.customerId, orders]);

  const availableColors = useMemo(() => {
    if (!newOrder.customerId || !newOrder.style) return [];
    const filteredOrders = orders.filter(o => 
      o.customerId === newOrder.customerId && 
      o.style === newOrder.style
    );
    return Array.from(new Set(filteredOrders.map(o => o.color))).sort();
  }, [newOrder.customerId, newOrder.style, orders]);

  useEffect(() => {
    if (newOrder.customerId && newOrder.style && newOrder.color) {
      const match = orders.find(o => 
        o.customerId === newOrder.customerId && 
        o.style === newOrder.style &&
        o.color === newOrder.color
      );
      
      const sample = samples.find(s => s.styleNumber === newOrder.style);
      const consumption = sample?.yarnRequiredLbs || 0;

      if (match) {
        setMatchingOrder(match);
        if (!newOrder.quantity || newOrder.quantity === 0) {
          const totalReq = match.quantity * consumption;
          setNewOrder(prev => ({ 
            ...prev, 
            quantity: match.quantity,
            orderNumber: match.orderNumber,
            dueDate: match.dueDate,
            yarnDetails: {
              ...prev.yarnDetails!,
              totalRequiredLbs: Number(totalReq.toFixed(2)),
              yarnType: sample?.yarnType || '',
              yarnCount: sample?.yarnCount || '',
              actualUsedLbs: Number(totalReq.toFixed(2)) // Default suggest full required
            }
          }));
        }
      } else {
        setMatchingOrder(null);
      }
    } else {
      setMatchingOrder(null);
    }
  }, [newOrder.customerId, newOrder.style, newOrder.color, orders, samples]);

  const config = DEPARTMENTS_CONFIG.find(c => c.id === deptId);
  
  const filteredOrders = orders.filter(o => 
    o.currentDepartment === deptId && 
    (o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
     o.style.toLowerCase().includes(searchTerm.toLowerCase()) ||
     o.color.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const statusColors = {
    'pending': 'bg-slate-100 text-slate-600',
    'in-progress': 'bg-blue-100 text-blue-600',
    'completed': 'bg-emerald-100 text-emerald-600',
    'delayed': 'bg-rose-100 text-rose-600'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddOrder) return;
    const finalOrder: ProductionOrder = {
      ...(newOrder as ProductionOrder),
      id: Math.random().toString(36).substr(2, 9),
      currentDepartment: deptId,
      unitPrice: matchingOrder?.unitPrice || 0,
    };
    onAddOrder(finalOrder);
    setIsModalOpen(false);
    setNewOrder({
      orderNumber: '',
      customerId: '',
      style: '',
      color: '',
      quantity: 0,
      status: 'pending',
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      yarnDetails: { weightLbs: 0, wastagePercent: 5, lotNumber: '', dyeingFactory: '', totalRequiredLbs: 0, yarnType: '', yarnCount: '', actualUsedLbs: 0 }
    });
  };

  const triggerPrint = () => {
    window.print();
  };

  const YarnStockReport = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 text-white rounded-xl"><Database size={24} /></div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase">Yarn Inventory Balance Report</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Year-End Store Stock & Consumption Analysis</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-black text-indigo-600 uppercase">FY {new Date().getFullYear()}</p>
          <p className="text-[10px] text-slate-400 font-bold">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-100 border-y border-slate-200">
            <tr>
              <th className="px-3 py-3 text-[9px] font-black uppercase text-slate-500">Style / Type</th>
              <th className="px-3 py-3 text-[9px] font-black uppercase text-slate-500 text-right">Required (Lbs)</th>
              <th className="px-3 py-3 text-[9px] font-black uppercase text-slate-500 text-right">Received (Lbs)</th>
              <th className="px-3 py-3 text-[9px] font-black uppercase text-slate-500 text-right">Used (Lbs)</th>
              <th className="px-3 py-3 text-[9px] font-black uppercase text-slate-500 text-right">Surplus/Deficit</th>
              <th className="px-3 py-3 text-[9px] font-black uppercase text-slate-500 text-right">Store Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {yarnInventoryData.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-3 py-4">
                  <div className="text-xs font-black text-slate-800 uppercase">{item.style}</div>
                  <div className="text-[8px] text-indigo-500 font-bold uppercase">{item.yarnType} {item.yarnCount}</div>
                  <div className="text-[8px] text-slate-400 font-bold uppercase">{item.color}</div>
                </td>
                <td className="px-3 py-4 text-right text-xs font-bold text-slate-800">{item.requiredForOrder.toLocaleString()}</td>
                <td className="px-3 py-4 text-right text-xs font-bold text-slate-800">{item.totalReceived.toLocaleString()}</td>
                <td className="px-3 py-4 text-right text-xs font-black text-rose-600">{item.totalActualUsed.toLocaleString()}</td>
                <td className={`px-3 py-4 text-right text-xs font-black ${item.surplusDeficit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {item.surplusDeficit.toLocaleString()}
                </td>
                <td className={`px-3 py-4 text-right text-xs font-black ${item.storeBalance < 0 ? 'text-rose-500' : 'text-slate-900'}`}>
                  {item.storeBalance.toLocaleString()} Lbs
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 text-white p-6 rounded-2xl">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Store Stock</p>
          <h3 className="text-2xl font-black">
            {yarnInventoryData.reduce((sum, item) => sum + item.storeBalance, 0).toLocaleString()} <span className="text-xs font-normal">LBS</span>
          </h3>
        </div>
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl">
          <p className="text-[10px] font-black text-rose-400 uppercase mb-1">Total Actual Consumption</p>
          <h3 className="text-2xl font-black text-rose-700">
            {yarnInventoryData.reduce((sum, item) => sum + item.totalActualUsed, 0).toLocaleString()} <span className="text-xs font-normal">LBS</span>
          </h3>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
          <p className="text-[10px] font-black text-emerald-400 uppercase mb-1">Net Surplus/Deficit</p>
          <h3 className="text-2xl font-black text-emerald-700">
            {yarnInventoryData.reduce((sum, item) => sum + item.surplusDeficit, 0).toLocaleString()} <span className="text-xs font-normal">LBS</span>
          </h3>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <style>{`
        @media print {
          body { background: white !important; }
          .print-hidden, aside, header, nav { display: none !important; }
          main { margin: 0 !important; padding: 0 !important; display: block !important; }
          .max-w-7xl { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .shadow-sm, .shadow-xl { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
          .rounded-3xl, .rounded-2xl { border-radius: 4px !important; }
          .print-canvas { position: absolute !important; top: 0; left: 0; width: 100% !important; z-index: 1000; }
        }
      `}</style>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print-hidden">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${config?.color} text-white shadow-lg`}>{config?.icon}</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">{deptId}</h2>
            <p className="text-slate-500 text-sm italic">{isKnittingDept ? 'Production & Yarn Consumption Logging' : 'Inventory tracking & balance report'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isYarnDept && (
            <button 
              onClick={() => setShowStockReport(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 shadow-lg transition-all"
            >
              <Eye size={16} />
              <span>Year-End Report</span>
            </button>
          )}
          <button onClick={() => setIsModalOpen(true)} className={`flex items-center gap-2 px-6 py-2.5 ${config?.color} text-white rounded-xl font-bold shadow-lg transition-all`}>
            <Plus size={18} />
            <span>New {deptId} Record</span>
          </button>
        </div>
      </div>

      {isYarnDept && <div className="print-hidden"><YarnCalculator /></div>}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Style, Color or Order..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Info</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Style & Color</th>
                {isYarnDept ? (
                  <>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Required (LBS)</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Used (LBS)</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Balance</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Produced Qty</th>
                    {isKnittingDept && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Yarn Used (Lbs)</th>}
                  </>
                )}
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map((order) => {
                const salesTarget = findSalesTarget(order);
                const sample = samples.find(s => s.styleNumber === order.style);
                const consumption = sample?.yarnRequiredLbs || 0;
                
                return (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 font-mono">{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-800 font-bold uppercase">{order.style}</div>
                      <div className="text-[10px] text-indigo-500 font-black uppercase flex items-center gap-1 mt-1">
                        <Palette size={10} /> {order.color}
                      </div>
                    </td>
                    {isYarnDept ? (
                      <>
                        <td className="px-6 py-4 text-right">
                          <div className="text-sm font-black text-slate-900">{(salesTarget?.quantity || 0 * consumption).toFixed(2)}</div>
                          <div className="text-[10px] text-slate-400 uppercase">Target</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-sm font-black text-rose-500">{(order.yarnDetails?.actualUsedLbs || 0).toFixed(2)}</div>
                          <div className="text-[10px] text-slate-400 uppercase">Actual</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-sm font-black text-emerald-600">{((salesTarget?.quantity || 0 * consumption) - (order.yarnDetails?.actualUsedLbs || 0)).toFixed(2)}</div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-center text-slate-800 font-mono font-black">{order.quantity} pcs</td>
                        {isKnittingDept && (
                          <td className="px-6 py-4 text-right">
                            <div className="text-sm font-black text-rose-500 font-mono">{(order.yarnDetails?.actualUsedLbs || 0).toLocaleString()} lbs</div>
                            <div className="text-[9px] text-slate-400 font-bold">REQ: {(order.quantity * consumption).toFixed(2)} lbs</div>
                          </td>
                        )}
                      </>
                    )}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${statusColors[order.status]}`}>{order.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showStockReport && isYarnDept && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/90 backdrop-blur-xl">
           <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-white/10 print-hidden">
              <div className="flex items-center gap-4">
                 <div className="p-2 bg-indigo-600 rounded-lg"><FileOutput size={20} /></div>
                 <div>
                    <h3 className="text-sm font-black uppercase tracking-widest">Yarn Year-End Stock Audit</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Consolidated Store Balance Report</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <button 
                    onClick={triggerPrint}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg active:scale-95"
                 >
                    <Printer size={16} /> Print Full PDF
                 </button>
                 <button onClick={() => setShowStockReport(false)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><X size={20} /></button>
              </div>
           </div>
           <div className="flex-1 overflow-y-auto p-4 sm:p-12 lg:p-20 bg-slate-800/50 flex justify-center scrollbar-hide">
              <div className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl rounded-sm p-[20mm] relative overflow-visible print-canvas">
                 <YarnStockReport />
              </div>
           </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`p-6 ${config?.color} text-white flex justify-between items-center`}>
              <h3 className="text-xl font-black uppercase tracking-tight">New {deptId} Record</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <User size={12} /> Buyer Name
                  </label>
                  <select 
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold bg-white"
                    value={newOrder.customerId}
                    onChange={(e) => setNewOrder({...newOrder, customerId: e.target.value, style: '', color: ''})}
                  >
                    <option value="">Select Buyer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Tag size={12} /> Style Number
                  </label>
                  <select 
                    required
                    disabled={!newOrder.customerId}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold uppercase outline-none focus:ring-4 focus:ring-indigo-500/10 bg-white disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
                    value={newOrder.style}
                    onChange={(e) => setNewOrder({...newOrder, style: e.target.value, color: ''})}
                  >
                    <option value="">{newOrder.customerId ? 'Select Style...' : 'Select Buyer First'}</option>
                    {availableStyles.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Palette size={12} /> Color</label>
                  <select 
                    required
                    disabled={!newOrder.style}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 bg-white disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
                    value={newOrder.color}
                    onChange={(e) => setNewOrder({...newOrder, color: e.target.value})}
                  >
                    <option value="">{newOrder.style ? 'Select Color...' : 'Select Style First'}</option>
                    {availableColors.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {isYarnDept && (
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">Yarn Type</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800"
                        value={newOrder.yarnDetails?.yarnType || ''} 
                        onChange={(e) => setNewOrder({...newOrder, yarnDetails: {...newOrder.yarnDetails!, yarnType: e.target.value}})} 
                        placeholder="e.g. Cotton"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">Yarn Count</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800"
                        value={newOrder.yarnDetails?.yarnCount || ''} 
                        onChange={(e) => setNewOrder({...newOrder, yarnDetails: {...newOrder.yarnDetails!, yarnCount: e.target.value}})} 
                        placeholder="e.g. 2/28"
                      />
                    </div>
                  </div>
                )}

                <div className="col-span-2">
                  <div className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${matchingOrder ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${matchingOrder ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        <CloudSync size={18} className={matchingOrder ? 'animate-pulse' : ''} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest">Sales Order Sync</p>
                        <p className="text-sm font-bold">{matchingOrder ? `Order: ${matchingOrder.orderNumber}` : 'Awaiting Match...'}</p>
                      </div>
                    </div>
                    {matchingOrder && (
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase">Sales Target</p>
                        <p className="text-xl font-black">{matchingOrder.quantity} PCS</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    {isYarnDept ? 'Initial Weight Lbs' : `Production Quantity`}
                  </label>
                  <div className="relative">
                    <input 
                      required 
                      type="number" 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-lg font-black outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800"
                      value={newOrder.quantity || ''} 
                      onChange={(e) => setNewOrder({...newOrder, quantity: Number(e.target.value)})} 
                    />
                  </div>
                </div>

                {isKnittingDept && (
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Scale size={12} /> Actual Yarn Used (lbs)
                    </label>
                    <input 
                      required 
                      type="number" 
                      step="0.01"
                      className="w-full px-4 py-3 border border-rose-200 rounded-xl text-lg font-black outline-none focus:ring-4 focus:ring-rose-500/10 transition-all text-rose-800 bg-rose-50/30"
                      value={newOrder.yarnDetails?.actualUsedLbs || ''} 
                      onChange={(e) => setNewOrder({...newOrder, yarnDetails: {...newOrder.yarnDetails!, actualUsedLbs: Number(e.target.value)}})} 
                    />
                  </div>
                )}

                {(isYarnDept || isKnittingDept) && newOrder.quantity && (
                  <div className="col-span-2 bg-slate-900 rounded-2xl p-6 text-white space-y-4">
                     <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                        <Calculator className="text-indigo-400" size={18} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Standard Yarn Impact Analysis</p>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Standard Required</p>
                           <h4 className="text-xl font-black text-white">
                             {((newOrder.quantity || 0) * (samples.find(s => s.styleNumber === newOrder.style)?.yarnRequiredLbs || 0)).toFixed(2)} LBS
                           </h4>
                        </div>
                        {isKnittingDept && newOrder.yarnDetails?.actualUsedLbs ? (
                          <div className="text-right">
                             <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Surplus / Deficit</p>
                             <div className="flex items-center justify-end gap-2">
                               {((newOrder.quantity * (samples.find(s => s.styleNumber === newOrder.style)?.yarnRequiredLbs || 0)) - (newOrder.yarnDetails?.actualUsedLbs || 0)) >= 0 ? 
                                 <TrendingUp className="text-emerald-400" size={16} /> : 
                                 <TrendingDown className="text-rose-400" size={16} />
                               }
                               <h4 className={`text-xl font-black ${((newOrder.quantity * (samples.find(s => s.styleNumber === newOrder.style)?.yarnRequiredLbs || 0)) - (newOrder.yarnDetails?.actualUsedLbs || 0)) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                 {((newOrder.quantity * (samples.find(s => s.styleNumber === newOrder.style)?.yarnRequiredLbs || 0)) - (newOrder.yarnDetails?.actualUsedLbs || 0)).toFixed(2)} LBS
                               </h4>
                             </div>
                          </div>
                        ) : (
                          <div className="text-right">
                             <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Consumption Rate</p>
                             <p className="text-sm font-black text-indigo-300">
                               {samples.find(s => s.styleNumber === newOrder.style)?.yarnRequiredLbs || 0} lb/pc
                             </p>
                          </div>
                        )}
                     </div>
                  </div>
                )}
              </div>
              
              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 border border-slate-200 text-slate-500 rounded-2xl font-black uppercase text-xs hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className={`flex-1 px-6 py-4 ${config?.color} text-white rounded-2xl font-black uppercase text-xs shadow-lg hover:brightness-110 transition-all`}>Save Production Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
