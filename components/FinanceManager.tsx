
import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, Customer, Supplier, ProductionOrder, PurchaseOrder, InspectionRecord } from '../types';
import { 
  Wallet, TrendingUp, TrendingDown, CreditCard, ArrowUpRight, ArrowDownRight, 
  Plus, X, Calendar, DollarSign, User, Tag, Briefcase, Search, Filter, Info, CloudSync, Calculator, CheckSquare, Square, Truck
} from 'lucide-react';

interface FinanceManagerProps {
  transactions: Transaction[];
  customers: Customer[];
  suppliers: Supplier[];
  orders: ProductionOrder[];
  purchases: PurchaseOrder[];
  inspections: InspectionRecord[];
  onAddTransaction: (transaction: Transaction) => void;
}

export const FinanceManager: React.FC<FinanceManagerProps> = ({ 
  transactions, 
  customers, 
  suppliers, 
  orders, 
  purchases, 
  inspections,
  onAddTransaction 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newTx, setNewTx] = useState<Partial<Transaction>>({
    type: 'receipt',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    method: 'T/T',
    reference: '',
    entityId: '',
    styleNumbers: []
  });

  // Financial Calculations for Dashboard
  const metrics = useMemo(() => {
    const totalOrderValue = orders.reduce((sum, o) => sum + (o.quantity * o.unitPrice), 0);
    const totalReceipts = transactions.filter(t => t.type === 'receipt').reduce((sum, t) => sum + t.amount, 0);
    const totalPurchaseValue = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalPayments = transactions.filter(t => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0);

    return {
      totalReceipts,
      totalPayments,
      receivables: totalOrderValue - totalReceipts,
      payables: totalPurchaseValue - totalPayments
    };
  }, [orders, purchases, transactions]);

  // Aggregated Data for Selected Styles (Handles both Sales Receipts and Supplier Payments)
  const aggregateData = useMemo(() => {
    if (!newTx.entityId || !newTx.styleNumbers || newTx.styleNumbers.length === 0) return null;

    if (newTx.type === 'receipt') {
      let totalOrderQty = 0;
      let totalQcPassed = 0;
      let totalSuggestedAmount = 0;
      const styleBreakdown: any[] = [];

      newTx.styleNumbers.forEach(style => {
        const match = orders.find(o => o.customerId === newTx.entityId && o.style === style);
        if (match) {
          const passed = inspections
            .filter(i => i.orderNumber === match.orderNumber)
            .reduce((sum, i) => sum + i.qualityPassed, 0);
          
          const suggested = passed * match.unitPrice;
          totalOrderQty += match.quantity;
          totalQcPassed += passed;
          totalSuggestedAmount += suggested;

          styleBreakdown.push({
            style,
            metric: `${passed} PCS (QC Pass)`,
            value: suggested
          });
        }
      });

      return {
        label: "Sales & QC Verification",
        totalLabel: "QC Passed Value",
        totalSuggestedAmount,
        styleBreakdown,
        summary: `${totalQcPassed} / ${totalOrderQty} Total PCS Verified`
      };
    } else {
      // Payment (Outflow to Supplier)
      let totalSuggestedAmount = 0;
      const styleBreakdown: any[] = [];

      newTx.styleNumbers.forEach(style => {
        const stylePurchases = purchases.filter(p => p.supplierId === newTx.entityId && p.styleNumber === style);
        const styleTotal = stylePurchases.reduce((sum, p) => sum + p.totalAmount, 0);
        
        totalSuggestedAmount += styleTotal;
        styleBreakdown.push({
          style,
          metric: `${stylePurchases.length} POs Found`,
          value: styleTotal
        });
      });

      return {
        label: "Supplier Liability Aggregation",
        totalLabel: "Total Style PO Value",
        totalSuggestedAmount,
        styleBreakdown,
        summary: `${newTx.styleNumbers.length} Style Clusters Selected`
      };
    }
  }, [newTx.entityId, newTx.styleNumbers, newTx.type, orders, inspections, purchases]);

  // Auto-suggest amount when styles or type change - Always update to reflect selection accurately
  useEffect(() => {
    if (aggregateData) {
      setNewTx(prev => ({ ...prev, amount: aggregateData.totalSuggestedAmount }));
    } else if (newTx.styleNumbers?.length === 0) {
      setNewTx(prev => ({ ...prev, amount: 0 }));
    }
  }, [aggregateData]);

  const availableStyles = useMemo(() => {
    if (!newTx.entityId) return [];
    
    if (newTx.type === 'receipt') {
      // Styles linked to this customer via production orders
      return Array.from(new Set(orders
        .filter(o => o.customerId === newTx.entityId)
        .map(o => o.style)
      )).sort();
    } else {
      // Styles linked to this supplier via purchase orders
      return Array.from(new Set(purchases
        .filter(p => p.supplierId === newTx.entityId)
        .map(p => p.styleNumber)
        .filter(Boolean) as string[]
      )).sort();
    }
  }, [newTx.type, newTx.entityId, orders, purchases]);

  const toggleStyle = (style: string) => {
    setNewTx(prev => {
      const current = prev.styleNumbers || [];
      const updated = current.includes(style)
        ? current.filter(s => s !== style)
        : [...current, style];
      return { ...prev, styleNumbers: updated };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entity = newTx.type === 'receipt' 
      ? customers.find(c => c.id === newTx.entityId)
      : suppliers.find(s => s.id === newTx.entityId);

    if (!entity) return;

    const transaction: Transaction = {
      ...newTx as Transaction,
      id: `TX-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      entityName: entity.name,
    };

    onAddTransaction(transaction);
    setIsModalOpen(false);
    setNewTx({
      type: 'receipt',
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      method: 'T/T',
      reference: '',
      entityId: '',
      styleNumbers: []
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Wallet className="text-indigo-600" />
            FINANCE & LEDGER
          </h2>
          <p className="text-slate-500 text-sm italic">Production-synced receivables and payables</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all text-sm"
        >
          <Plus size={20} />
          <span>New Transaction</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp size={20} /></div>
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded uppercase">Total Inflow</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Receipts</p>
          <h3 className="text-2xl font-black text-slate-800">${metrics.totalReceipts.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><TrendingDown size={20} /></div>
            <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-1 rounded uppercase">Total Outflow</span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Payments</p>
          <h3 className="text-2xl font-black text-slate-800">${metrics.totalPayments.toLocaleString()}</h3>
        </div>

        <div className="bg-indigo-900 p-6 rounded-xl shadow-xl shadow-indigo-900/20 text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white/10 rounded-lg"><ArrowUpRight size={20} /></div>
          </div>
          <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">Receivables</p>
          <h3 className="text-2xl font-black text-white">${metrics.receivables.toLocaleString()}</h3>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl shadow-xl shadow-slate-900/20 text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white/10 rounded-lg"><ArrowDownRight size={20} /></div>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Payables</p>
          <h3 className="text-2xl font-black text-white">${metrics.payables.toLocaleString()}</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2 text-sm">
            <CreditCard className="text-indigo-50" size={18} />
            Transaction Ledger
          </h3>
          <div className="flex gap-2">
            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"><Filter size={18}/></button>
            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"><Search size={18}/></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date / Ref</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity & Styles</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...transactions].reverse().map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-800 font-mono">{t.date}</div>
                    <div className="text-[10px] text-slate-400 font-mono uppercase font-bold">{t.reference}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${
                      t.type === 'receipt' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-800">{t.entityName}</div>
                    {(t.styleNumbers && t.styleNumbers.length > 0) && (
                      <div className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-0.5 flex flex-wrap gap-1">
                        {t.styleNumbers.map(s => <span key={s} className="bg-indigo-50 px-1 rounded">{s}</span>)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-tighter">{t.method}</td>
                  <td className={`px-6 py-4 text-sm font-black text-right font-mono ${t.type === 'receipt' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'receipt' ? '+' : '-'}${t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`p-6 bg-slate-900 text-white flex justify-between items-center`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg"><Wallet size={20} /></div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">Record New Entry</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Production-Linked Transaction</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[85vh] overflow-y-auto">
              <div className="flex bg-slate-100 p-1 rounded-2xl">
                <button 
                  type="button"
                  onClick={() => setNewTx({...newTx, type: 'receipt', entityId: '', styleNumbers: [], amount: 0})}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${newTx.type === 'receipt' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500'}`}
                >
                  Receipt (In)
                </button>
                <button 
                  type="button"
                  onClick={() => setNewTx({...newTx, type: 'payment', entityId: '', styleNumbers: [], amount: 0})}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${newTx.type === 'payment' ? 'bg-white text-rose-600 shadow-md' : 'text-slate-500'}`}
                >
                  Payment (Out)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <User size={12} /> {newTx.type === 'receipt' ? 'Customer (Buyer)' : 'Supplier (Vendor)'}
                  </label>
                  <select 
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold bg-white"
                    value={newTx.entityId}
                    onChange={(e) => setNewTx({...newTx, entityId: e.target.value, styleNumbers: []})}
                  >
                    <option value="">Choose {newTx.type === 'receipt' ? 'Customer' : 'Supplier'}...</option>
                    {newTx.type === 'receipt' 
                      ? customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                      : suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.category})</option>)
                    }
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Tag size={12} /> Select Style Numbers (Multi-Select)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-40 overflow-y-auto">
                    {availableStyles.length > 0 ? availableStyles.map(style => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => toggleStyle(style)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs font-bold transition-all border ${
                          newTx.styleNumbers?.includes(style) 
                            ? (newTx.type === 'receipt' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-rose-600 text-white border-rose-600') 
                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                        } shadow-sm`}
                      >
                        {newTx.styleNumbers?.includes(style) ? <CheckSquare size={14} /> : <Square size={14} />}
                        <span className="truncate">{style}</span>
                      </button>
                    )) : (
                      <p className="col-span-full text-[10px] text-slate-400 text-center italic py-2">
                        {newTx.entityId ? 'No styles linked to this entity' : `Select a ${newTx.type === 'receipt' ? 'Buyer' : 'Supplier'} first`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Aggregation Summary */}
                {aggregateData && (
                  <div className="col-span-2 space-y-3">
                    <div className={`p-5 rounded-2xl border shadow-sm ${newTx.type === 'receipt' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg text-white ${newTx.type === 'receipt' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                          {newTx.type === 'receipt' ? <CloudSync size={18} /> : <Truck size={18} />}
                        </div>
                        <div>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${newTx.type === 'receipt' ? 'text-emerald-700' : 'text-rose-700'}`}>{aggregateData.label}</p>
                          <p className="text-sm font-bold text-slate-800">{aggregateData.summary}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4 max-h-32 overflow-y-auto scrollbar-hide">
                        {aggregateData.styleBreakdown.map(item => (
                          <div key={item.style} className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-slate-600 uppercase">{item.style}</span>
                            <span className="text-slate-400">({item.metric})</span>
                            <span className={`font-black ${newTx.type === 'receipt' ? 'text-emerald-600' : 'text-rose-600'}`}>${item.value.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className={`mt-2 pt-4 border-t flex justify-between items-center ${newTx.type === 'receipt' ? 'border-emerald-100' : 'border-rose-100'}`}>
                         <div className={`flex items-center gap-2 font-black ${newTx.type === 'receipt' ? 'text-emerald-900' : 'text-rose-900'}`}>
                           <Calculator size={14} />
                           <span className="text-xs uppercase tracking-tight">Suggested {newTx.type === 'receipt' ? 'Inflow' : 'Outflow'}:</span>
                         </div>
                         <div className={`text-xl font-black font-mono ${newTx.type === 'receipt' ? 'text-emerald-600' : 'text-rose-600'}`}>
                           ${aggregateData.totalSuggestedAmount.toLocaleString()}
                         </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Transaction Amount ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                    <input 
                      required
                      type="number"
                      className={`w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 text-sm font-black outline-none ${
                        newTx.type === 'receipt' ? 'text-emerald-600 focus:ring-emerald-500/10' : 'text-rose-600 focus:ring-rose-500/10'
                      }`}
                      value={newTx.amount || ''}
                      onChange={(e) => setNewTx({...newTx, amount: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Method</label>
                  <select 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold bg-white outline-none"
                    value={newTx.method}
                    onChange={(e) => setNewTx({...newTx, method: e.target.value as any})}
                  >
                    {newTx.type === 'receipt' ? (
                      <>
                        <option value="LC Payment">LC Payment</option>
                        <option value="T/T">T/T</option>
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </>
                    ) : (
                      <>
                        <option value="BTB LC Payment">BTB LC Payment</option>
                        <option value="T/T">T/T</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Calendar size={12} /> Entry Date</label>
                  <input 
                    required
                    type="date"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold outline-none"
                    value={newTx.date}
                    onChange={(e) => setNewTx({...newTx, date: e.target.value})}
                  />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Briefcase size={12} /> Voucher / Invoice Ref</label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g. INV-2024-MULTI"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold uppercase outline-none"
                    value={newTx.reference}
                    onChange={(e) => setNewTx({...newTx, reference: e.target.value.toUpperCase()})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 rounded-2xl font-bold uppercase text-xs hover:bg-slate-50">Discard</button>
                <button type="submit" className={`flex-1 px-6 py-4 text-white rounded-2xl font-black uppercase text-xs shadow-xl transition-all ${newTx.type === 'receipt' ? 'bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-700' : 'bg-rose-600 shadow-rose-600/20 hover:bg-rose-700'}`}>
                  Record {newTx.type === 'receipt' ? 'Receipt' : 'Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
