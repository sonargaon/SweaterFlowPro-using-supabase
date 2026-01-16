
import React, { useState } from 'react';
import { ProductionOrder, Customer, SampleDevelopment, InspectionRecord } from '../types';
import { ShoppingCart, Plus, Search, Filter, Download, X, User, Tag, Calendar, DollarSign, Palette, Edit3, CheckCircle2, Calculator, AlertCircle, FileText, Printer, CloudSync } from 'lucide-react';

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
          <p className="text-slate-500 text-sm italic">Verified Production Revenue & Billing</p>
        </div>
        <div className="flex gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm"
          >
            <CloudSync size={18} className="text-emerald-500" />
            <span>Sync to Sheets</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all text-sm"
          >
            <Plus size={20} />
            <span>New Sales Order</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter by Order, Style, Color..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Ref</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Buyer Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Style & Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ord / QC Passed</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actual Bill</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map(order => {
                const customer = customers.find(c => c.id === order.customerId);
                const qcPassed = getOrderQcPassed(order.orderNumber);
                const actualRevenue = qcPassed * (order.unitPrice || 0);
                
                return (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 font-mono text-sm">{order.orderNumber}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">Due: {order.dueDate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-700">{customer?.name || 'Walk-in Buyer'}</div>
                      <div className="text-[10px] text-slate-400 uppercase">Region: {customer?.address?.split(',')[0] || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block uppercase tracking-tighter">{order.style}</div>
                      <div className="text-[10px] text-slate-500 mt-1 font-bold uppercase flex items-center gap-1">
                        <Palette size={10} className="text-rose-500" /> {order.color}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-4">
                         <div className="text-center">
                           <p className="text-[10px] text-slate-400 font-black uppercase">Ordered</p>
                           <p className="text-sm font-bold text-slate-700">{order.quantity}</p>
                         </div>
                         <div className="h-6 w-px bg-slate-100"></div>
                         <div className="text-center">
                           <p className="text-[10px] text-emerald-500 font-black uppercase">Passed</p>
                           <p className="text-sm font-black text-emerald-600">{qcPassed}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-black text-slate-900 font-mono">${actualRevenue.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Verified Revenue</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleOpenInvoice(order)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="View Final Invoice"
                      >
                        <FileText size={18} />
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 text-indigo-600 font-black text-sm uppercase tracking-widest mb-1">
                  <FileText size={18} />
                  Final Invoice
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">BILLING SUMMARY</h3>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Ref: {selectedOrderForInvoice.orderNumber}</p>
              </div>
              <button onClick={() => setIsInvoiceOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 block">Buyer Name</label>
                    <p className="text-lg font-bold text-slate-800">{customers.find(c => c.id === selectedOrderForInvoice.customerId)?.name || 'Direct Buyer'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Style Number</label>
                      <p className="text-sm font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block uppercase">{selectedOrderForInvoice.style}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Colorway</label>
                      <p className="text-sm font-bold text-slate-700 uppercase">{selectedOrderForInvoice.color}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-500 font-medium">Sales Order Quantity:</span>
                     <span className="font-bold text-slate-800">{selectedOrderForInvoice.quantity} PCS</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-emerald-600 font-bold">Total QC Passed Quantity:</span>
                     <span className="font-black text-emerald-600">{getOrderQcPassed(selectedOrderForInvoice.orderNumber)} PCS</span>
                   </div>
                   <div className="h-px bg-slate-200 my-2"></div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-500 font-medium">Rate per Piece:</span>
                     <span className="font-bold text-slate-800 font-mono">${selectedOrderForInvoice.unitPrice.toLocaleString()}</span>
                   </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-10 text-white flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Calculator size={100} />
                </div>
                <div className="relative z-10">
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Final Invoice Amount</p>
                  <h2 className="text-5xl font-black text-white tracking-tighter">
                    ${(getOrderQcPassed(selectedOrderForInvoice.orderNumber) * selectedOrderForInvoice.unitPrice).toLocaleString()}
                  </h2>
                  <p className="text-slate-500 text-xs mt-3 italic">Verified Production Qty x Contract Rate</p>
                </div>
                <div className="relative z-10 text-right">
                   <button className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-xs uppercase shadow-xl hover:bg-slate-100 transition-all">
                     <Printer size={16} /> Print Invoice
                   </button>
                </div>
              </div>
            </div>

            <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 text-center">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Powered by SweaterFlow Pro ERP | Cloud Database Verified</p>
            </div>
          </div>
        </div>
      )}

      {/* New Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/30"><ShoppingCart size={20} /></div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Create Sales Order</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Order Entry & Revenue Planning</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <User size={12} /> Customer / Buyer
                  </label>
                  <select 
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold bg-white"
                    value={newOrder.customerId}
                    onChange={(e) => setNewOrder({...newOrder, customerId: e.target.value})}
                  >
                    <option value="">Choose Buyer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Tag size={12} /> Style Number
                  </label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold uppercase"
                    placeholder="Enter style ID..."
                    value={newOrder.style}
                    onChange={(e) => setNewOrder({...newOrder, style: e.target.value.toUpperCase()})}
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Palette size={12} /> Colorway
                  </label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold placeholder:font-normal uppercase"
                    placeholder="e.g. Navy Blue"
                    value={newOrder.color}
                    onChange={(e) => setNewOrder({...newOrder, color: e.target.value.toUpperCase()})}
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Ordered Qty (PCS)</label>
                  <input 
                    required
                    type="number"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold"
                    value={newOrder.quantity || ''}
                    onChange={(e) => setNewOrder({...newOrder, quantity: Number(e.target.value)})}
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <DollarSign size={12} /> Unit Price (Rate)
                  </label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold"
                    value={newOrder.unitPrice || ''}
                    onChange={(e) => setNewOrder({...newOrder, unitPrice: Number(e.target.value)})}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Calendar size={12} /> Delivery Due
                  </label>
                  <input 
                    required
                    type="date"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold"
                    value={newOrder.dueDate}
                    onChange={(e) => setNewOrder({...newOrder, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="bg-indigo-900 p-8 rounded-3xl text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Calculator size={80} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div>
                    <p className="text-[10px] text-indigo-400 uppercase font-black tracking-[0.2em] mb-2 flex items-center gap-2">
                      <DollarSign size={12} /> Total Order Value
                    </p>
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-4xl font-black text-white tracking-tighter">
                        ${calculatedTotalValue.toLocaleString()}
                      </h2>
                      <span className="text-indigo-400 text-sm font-bold">Projected Revenue</span>
                    </div>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)} 
                      className="flex-1 md:w-32 py-4 text-slate-400 font-bold hover:text-white transition-all uppercase text-xs"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-2 md:w-48 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/30 hover:bg-indigo-500 transition-all uppercase text-xs"
                    >
                      Authorize Order
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
