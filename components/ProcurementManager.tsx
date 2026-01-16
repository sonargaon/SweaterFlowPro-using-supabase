
import React, { useState, useEffect } from 'react';
import { PurchaseOrder, Supplier, ProductionOrder } from '../types';
import { Truck, Plus, Package, Box, Tag, X, Palette, Hash, DollarSign, Calculator, List, Search, CreditCard, Calendar as CalendarIcon } from 'lucide-react';

interface ProcurementManagerProps {
  purchases: PurchaseOrder[];
  suppliers: Supplier[];
  orders: ProductionOrder[];
  onAddPurchase?: (purchase: PurchaseOrder) => void;
}

const ACCESSORY_CATEGORIES = [
  'Carton', 'Poly', 'Button', 'Logo', 'Embroidery', 'Printing', 'Zipper', 'Others'
];

export const ProcurementManager: React.FC<ProcurementManagerProps> = ({ purchases, suppliers, orders, onAddPurchase }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPO, setNewPO] = useState<Partial<PurchaseOrder>>({
    poNumber: `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
    itemType: 'Yarn',
    description: '',
    quantity: 0,
    unit: 'lbs',
    totalAmount: 0,
    status: 'ordered',
    date: new Date().toISOString().split('T')[0],
    styleNumber: '',
    color: '',
    lotNumber: '',
    ratePerUnit: 0,
    paymentDate: '',
    paymentRef: ''
  });

  // Unique styles from Sales Orders for the dropdowns
  const availableStyles = Array.from(new Set(orders.map(o => o.style))).sort();

  // Auto-calculate Total Amount
  useEffect(() => {
    const qty = Number(newPO.quantity) || 0;
    const rate = Number(newPO.ratePerUnit) || 0;
    setNewPO(prev => ({ ...prev, totalAmount: qty * rate }));
  }, [newPO.quantity, newPO.ratePerUnit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddPurchase) return;

    const finalPurchase: PurchaseOrder = {
      ...(newPO as PurchaseOrder),
      id: Math.random().toString(36).substr(2, 9),
    };

    onAddPurchase(finalPurchase);
    setIsModalOpen(false);
    // Reset
    setNewPO({
      poNumber: `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
      itemType: 'Yarn',
      description: '',
      quantity: 0,
      unit: 'lbs',
      totalAmount: 0,
      status: 'ordered',
      date: new Date().toISOString().split('T')[0],
      styleNumber: '',
      color: '',
      lotNumber: '',
      ratePerUnit: 0,
      paymentDate: '',
      paymentRef: ''
    });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">PROCUREMENT</h2>
          <p className="text-sm text-slate-500">Sourcing Yarn and Accessories for production</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg transition-all"
        >
          <Plus size={18} />
          <span>New Purchase Order</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item & Style</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty / Rate</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {purchases.map(po => {
                const supplier = suppliers.find(s => s.id === po.supplierId);
                return (
                  <tr key={po.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-indigo-600 font-mono">{po.poNumber}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{po.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">{supplier?.name || 'Unknown Vendor'}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{po.itemType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-800">{po.description}</div>
                      <div className="flex gap-2 mt-1">
                        {po.styleNumber && <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">{po.styleNumber}</span>}
                        {po.color && <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Palette size={10} /> {po.color}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-800 font-mono">{po.quantity} {po.unit}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">@ ${po.ratePerUnit || 0}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-slate-900 text-right font-mono">${po.totalAmount.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg"><Truck size={24} /></div>
                <h3 className="text-xl font-black uppercase tracking-tight">Create PO</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
              {/* Type Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-2xl">
                <button 
                  type="button"
                  onClick={() => setNewPO({...newPO, itemType: 'Yarn', unit: 'lbs', description: '', styleNumber: '', color: ''})}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${newPO.itemType === 'Yarn' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500'}`}
                >
                  Yarn
                </button>
                <button 
                  type="button"
                  onClick={() => setNewPO({...newPO, itemType: 'Accessories', unit: 'pcs', description: '', styleNumber: '', color: ''})}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${newPO.itemType === 'Accessories' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500'}`}
                >
                  Accessories & Trims
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Supplier</label>
                  <select 
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold bg-white"
                    value={newPO.supplierId}
                    onChange={(e) => setNewPO({...newPO, supplierId: e.target.value})}
                  >
                    <option value="">Choose Supplier...</option>
                    {suppliers.filter(s => s.category === newPO.itemType || s.category === 'General').map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <List size={12} /> {newPO.itemType === 'Accessories' ? 'Item Category' : 'Yarn Description'}
                  </label>
                  {newPO.itemType === 'Accessories' ? (
                    <select 
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold bg-white"
                      value={newPO.description}
                      onChange={(e) => setNewPO({...newPO, description: e.target.value})}
                    >
                      <option value="">Select Accessory Type...</option>
                      {ACCESSORY_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  ) : (
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold"
                      placeholder="e.g. 2/28 Cotton Cashmere"
                      value={newPO.description}
                      onChange={(e) => setNewPO({...newPO, description: e.target.value})}
                    />
                  )}
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Tag size={12} /> Style Number (from Sales)
                  </label>
                  <select 
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold bg-white uppercase"
                    value={newPO.styleNumber}
                    onChange={(e) => setNewPO({...newPO, styleNumber: e.target.value})}
                  >
                    <option value="">Link to Sales Order Style...</option>
                    {availableStyles.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {newPO.itemType === 'Yarn' ? (
                  <>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Palette size={12} /> Color</label>
                      <input 
                        required
                        type="text" 
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold"
                        placeholder="e.g. Charcoal"
                        value={newPO.color}
                        onChange={(e) => setNewPO({...newPO, color: e.target.value})}
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Hash size={12} /> Lot Number</label>
                      <input 
                        required
                        type="text" 
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold"
                        placeholder="e.g. LOT-A123"
                        value={newPO.lotNumber}
                        onChange={(e) => setNewPO({...newPO, lotNumber: e.target.value})}
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><DollarSign size={12} /> Rate per LBS</label>
                      <input 
                        required
                        type="number" 
                        step="0.01"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold"
                        value={newPO.ratePerUnit || ''}
                        onChange={(e) => setNewPO({...newPO, ratePerUnit: Number(e.target.value)})}
                      />
                    </div>
                  </>
                ) : (
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><DollarSign size={12} /> Rate (pcs)</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold"
                      value={newPO.ratePerUnit || ''}
                      onChange={(e) => setNewPO({...newPO, ratePerUnit: Number(e.target.value)})}
                    />
                  </div>
                )}

                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Quantity ({newPO.unit})</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold"
                    value={newPO.quantity || ''}
                    onChange={(e) => setNewPO({...newPO, quantity: Number(e.target.value)})}
                  />
                </div>
                
                <div className="col-span-2 p-6 bg-slate-900 rounded-2xl text-white">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PO Total Amount</p>
                      <p className="text-3xl font-black text-indigo-400">${(newPO.totalAmount || 0).toLocaleString()}</p>
                    </div>
                    <Calculator size={32} className="text-slate-700" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <CalendarIcon size={12} /> Date of Payment
                      </label>
                      <input 
                        type="date" 
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold focus:bg-white/10 outline-none text-white"
                        value={newPO.paymentDate}
                        onChange={(e) => setNewPO({...newPO, paymentDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <CreditCard size={12} /> Payment Against PO # / Ref
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold focus:bg-white/10 outline-none text-white placeholder:text-slate-600"
                        placeholder="e.g. PO-882-PAY"
                        value={newPO.paymentRef}
                        onChange={(e) => setNewPO({...newPO, paymentRef: e.target.value.toUpperCase()})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 border border-slate-200 text-slate-500 rounded-2xl font-black uppercase text-xs">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-indigo-600/20">Authorize Purchase</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
