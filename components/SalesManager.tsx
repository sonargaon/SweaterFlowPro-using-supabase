
import React, { useState } from 'react';
import { ProductionOrder, Customer, SampleDevelopment, InspectionRecord } from '../types';
import { ShoppingCart, Plus, Search, Filter, Download, X, User, Tag, Calendar, DollarSign, Palette, Edit3, CheckCircle2, Calculator, AlertCircle, FileText, Printer, CloudSync, Hash, Activity } from 'lucide-react';

interface SalesManagerProps {
  orders: ProductionOrder[];
  customers: Customer[];
  samples: SampleDevelopment[];
  inspections: InspectionRecord[];
  onAddOrder: (order: ProductionOrder) => void;
  onAddInspection: (record: InspectionRecord) => void;
}

export const SalesManager: React.FC<SalesManagerProps> = ({ orders, customers, samples, inspections, onAddOrder, onAddInspection }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<ProductionOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newOrder, setNewOrder] = useState<Partial<ProductionOrder>>({
    orderNumber: `SO-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
    customerId: '',
    style: '',
    color: '',
    quantity: 0,
    unitPrice: 0,
    status: 'pending',
    progress: 0,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const getOrderQcPassed = (orderNo: string) => {
    return inspections
      .filter(i => i.orderNumber === orderNo)
      .reduce((sum, i) => sum + i.qualityPassed, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.customerId || !newOrder.style) return;

    const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const finalOrder: ProductionOrder = {
      id: orderId,
      orderNumber: newOrder.orderNumber!,
      customerId: newOrder.customerId!,
      style: newOrder.style!,
      color: (newOrder.color || 'Standard').toUpperCase(),
      quantity: newOrder.quantity!,
      unitPrice: newOrder.unitPrice!,
      status: 'pending',
      progress: 0,
      startDate: newOrder.startDate!,
      dueDate: newOrder.dueDate!,
      currentDepartment: 'Yarn' as any,
    };
    
    onAddOrder(finalOrder);

    setIsModalOpen(false);
    setNewOrder({
      orderNumber: `SO-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
      customerId: '',
      style: '',
      color: '',
      quantity: 0,
      unitPrice: 0,
      status: 'pending',
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  };

  const filteredOrders = orders.filter(o => 
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.style.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.color.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculatedTotalValue = (newOrder.quantity || 0) * (newOrder.unitPrice || 0);

  const handleOpenInvoice = (order: ProductionOrder) => {
    setSelectedOrderForInvoice(order);
    setIsInvoiceOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <ShoppingCart className="text-indigo-600" />
            SALES & ORDERS
          </h2>
          <p className="text-slate-500 text-sm italic">Enterprise Resource Allocation & Billing</p>
        </div>
        <div className="flex gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm"
          >
            <CloudSync size={18} className="text-emerald-500" />
            <span>Cloud Sync</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all text-sm"
          >
            <Plus size={20} />
            <span>Create Order</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Global Ledger..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">DNA Identity (Scan Tag)</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Buyer Entity</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tech Spec</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Lifecycle Progress</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Revenue</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map(order => {
                const customer = customers.find(c => c.id === order.customerId);
                const qcPassed = getOrderQcPassed(order.orderNumber);
                const actualRevenue = qcPassed * (order.unitPrice || 0);
                const completionPct = Math.round((qcPassed / order.quantity) * 100);
                
                return (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-0.5">
                           <div className="flex gap-[1px]">
                             {[1,2,3,1,4,2,3,1,2,3].map((h, i) => <div key={i} className={`w-[2px] bg-slate-900 rounded-full`} style={{ height: `${h * 4}px` }} />)}
                           </div>
                           <span className="text-[9px] font-mono font-black text-slate-400">{order.orderNumber}</span>
                        </div>
                        <div className="h-8 w-px bg-slate-100"></div>
                        <div>
                          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">Status</p>
                          <p className={`text-[10px] font-bold uppercase ${order.status === 'delayed' ? 'text-rose-500' : 'text-slate-700'}`}>{order.status}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{customer?.name || 'Walk-in Buyer'}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Verified Account • {customer?.id || 'NEW'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">{order.style}</span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                          <Palette size={10} className="text-rose-500" /> {order.color}
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 font-bold">REQ: {order.quantity} PCS @ ${order.unitPrice}/PC</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
                         <div className="flex justify-between w-full text-[9px] font-black uppercase text-slate-400 tracking-widest">
                           <span>{qcPassed} / {order.quantity}</span>
                           <span>{completionPct}%</span>
                         </div>
                         <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                           <div className={`h-full transition-all duration-1000 ${completionPct >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(completionPct, 100)}%` }} />
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="text-sm font-black text-slate-900 font-mono">${actualRevenue.toLocaleString()}</div>
                      <div className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Verified Settlement</div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button 
                        onClick={() => handleOpenInvoice(order)}
                        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-100 rounded-xl transition-all shadow-sm hover:shadow-md"
                        title="Style Intelligence Sheet"
                      >
                        <Activity size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {isInvoiceOpen && selectedOrderForInvoice && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.4em] mb-2">
                  <Activity size={16} />
                  Intelligence Protocol
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">PRODUCTION SETTLEMENT</h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Order Node Identification: {selectedOrderForInvoice.orderNumber}</p>
              </div>
              <button onClick={() => setIsInvoiceOpen(false)} className="p-3 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={28} /></button>
            </div>

            <div className="p-10 space-y-10">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Enterprise Buyer</label>
                    <p className="text-xl font-black text-slate-800 uppercase tracking-tight">{customers.find(c => c.id === selectedOrderForInvoice.customerId)?.name || 'Internal Demo Buyer'}</p>
                  </div>
                  <div className="flex gap-8 pt-6 border-t border-slate-100">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Style</label>
                      <p className="text-sm font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block uppercase tracking-widest">{selectedOrderForInvoice.style}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">DNA Color</label>
                      <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{selectedOrderForInvoice.color}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center space-y-6">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                     <span>Progress Metrics</span>
                     <span className="text-indigo-400">Verified</span>
                   </div>
                   <div className="flex justify-between items-end">
                     <div className="text-center">
                       <p className="text-[9px] font-black text-slate-500 uppercase">Target</p>
                       <p className="text-xl font-black">{selectedOrderForInvoice.quantity}</p>
                     </div>
                     <div className="h-8 w-px bg-white/10"></div>
                     <div className="text-center">
                       <p className="text-[9px] font-black text-emerald-500 uppercase">Passed</p>
                       <p className="text-xl font-black text-emerald-400">{getOrderQcPassed(selectedOrderForInvoice.orderNumber)}</p>
                     </div>
                     <div className="h-8 w-px bg-white/10"></div>
                     <div className="text-center">
                       <p className="text-[9px] font-black text-indigo-400 uppercase">Rate</p>
                       <p className="text-xl font-black">${selectedOrderForInvoice.unitPrice}</p>
                     </div>
                   </div>
                </div>
              </div>

              <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden shadow-2xl shadow-indigo-600/20">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Calculator size={120} />
                </div>
                <div className="relative z-10">
                  <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Verified Revenue Yield</p>
                  <h2 className="text-6xl font-black text-white tracking-tighter">
                    ${(getOrderQcPassed(selectedOrderForInvoice.orderNumber) * selectedOrderForInvoice.unitPrice).toLocaleString()}
                  </h2>
                  <p className="text-indigo-300 text-[10px] font-black uppercase mt-3 tracking-widest">Financial Node Synchronization: COMPLETE</p>
                </div>
                <div className="relative z-10 flex gap-3 mt-6 md:mt-0">
                   <button className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all"><Download size={20}/></button>
                   <button className="flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                     <Printer size={18} /> Print Audit
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600 rounded-[1.5rem] shadow-lg shadow-indigo-600/30"><ShoppingCart size={24} /></div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">Order Initialization</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">New DNA Identity Tag Generation</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={32} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                    <User size={14} className="text-indigo-600" /> Buyer Registry Profile
                  </label>
                  <select 
                    required
                    className="w-full px-5 py-4 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold bg-white appearance-none"
                    value={newOrder.customerId}
                    onChange={(e) => setNewOrder({...newOrder, customerId: e.target.value})}
                  >
                    <option value="">Choose Registry Buyer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                    <Tag size={14} className="text-indigo-600" /> Style Identifier
                  </label>
                  <input 
                    required
                    type="text"
                    className="w-full px-5 py-4 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold uppercase"
                    placeholder="Enter style ID..."
                    value={newOrder.style}
                    onChange={(e) => setNewOrder({...newOrder, style: e.target.value.toUpperCase()})}
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                    <Palette size={14} className="text-indigo-600" /> Color Spec
                  </label>
                  <input 
                    required
                    type="text"
                    className="w-full px-5 py-4 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold uppercase"
                    placeholder="e.g. Cobalt"
                    value={newOrder.color}
                    onChange={(e) => setNewOrder({...newOrder, color: e.target.value.toUpperCase()})}
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Order Quantity (PCS)</label>
                  <input 
                    required
                    type="number"
                    className="w-full px-5 py-4 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold"
                    value={newOrder.quantity || ''}
                    onChange={(e) => setNewOrder({...newOrder, quantity: Number(e.target.value)})}
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                    <DollarSign size={14} className="text-emerald-600" /> Rate Per Piece
                  </label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    className="w-full px-5 py-4 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold"
                    value={newOrder.unitPrice || ''}
                    onChange={(e) => setNewOrder({...newOrder, unitPrice: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Calculator size={80} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div>
                    <p className="text-indigo-400 text-[10px] uppercase font-black tracking-[0.3em] mb-2 flex items-center gap-2">
                      <Hash size={14} /> Global Ledger Booking
                    </p>
                    <div className="flex items-baseline gap-3">
                      <h2 className="text-5xl font-black text-white tracking-tighter">
                        ${calculatedTotalValue.toLocaleString()}
                      </h2>
                    </div>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)} 
                      className="flex-1 md:w-32 py-5 text-slate-400 font-bold hover:text-white transition-all uppercase text-xs tracking-widest"
                    >
                      Discard
                    </button>
                    <button 
                      type="submit" 
                      className="flex-2 md:w-56 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all uppercase text-xs tracking-widest"
                    >
                      Authorize session
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
