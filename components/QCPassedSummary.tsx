
import React, { useMemo, useState, useEffect } from 'react';
import { ProductionOrder, InspectionRecord, Customer } from '../types';
import { ClipboardCheck, Search, Palette, Plus, X, User, Tag, CheckCircle2, Hash, CloudSync, Calendar } from 'lucide-react';

interface QCPassedSummaryProps {
  orders: ProductionOrder[];
  inspections: InspectionRecord[];
  customers: Customer[];
  onAddInspection: (record: InspectionRecord) => void;
}

export const QCPassedSummary: React.FC<QCPassedSummaryProps> = ({ orders, inspections, customers, onAddInspection }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [matchingOrder, setMatchingOrder] = useState<ProductionOrder | null>(null);

  const [newQC, setNewQC] = useState<Partial<InspectionRecord>>({
    date: new Date().toISOString().split('T')[0],
    buyerName: '',
    styleNumber: '',
    color: '',
    qualityPassed: 0,
    rejected: 0,
    totalDelivered: 0,
  });

  const summaryData = useMemo(() => {
    return orders.map(order => {
      const orderInspections = inspections.filter(i => i.orderNumber === order.orderNumber);
      const totalPassed = orderInspections.reduce((sum, i) => sum + i.qualityPassed, 0);
      const totalRejected = orderInspections.reduce((sum, i) => sum + i.rejected, 0);
      
      return {
        ...order,
        totalPassed,
        totalRejected,
        actualSalesAmount: totalPassed * (order.unitPrice || 0)
      };
    });
  }, [orders, inspections]);

  // Sync Logic for New QC Entry
  useEffect(() => {
    if (newQC.buyerName && newQC.styleNumber && newQC.color) {
      const match = orders.find(o => {
        const customer = customers.find(c => c.id === o.customerId);
        return customer?.name === newQC.buyerName &&
               o.style === newQC.styleNumber &&
               o.color === newQC.color;
      });

      if (match) {
        setMatchingOrder(match);
        setNewQC(prev => ({ ...prev, orderNumber: match.orderNumber }));
      } else {
        setMatchingOrder(null);
      }
    } else {
      setMatchingOrder(null);
    }
  }, [newQC.buyerName, newQC.styleNumber, newQC.color, orders, customers]);

  const availableStyles = useMemo(() => {
    if (!newQC.buyerName) return [];
    const customer = customers.find(c => c.name === newQC.buyerName);
    if (!customer) return [];
    return Array.from(new Set(orders.filter(o => o.customerId === customer.id).map(o => o.style))).sort();
  }, [newQC.buyerName, orders, customers]);

  const availableColors = useMemo(() => {
    if (!newQC.buyerName || !newQC.styleNumber) return [];
    const customer = customers.find(c => c.name === newQC.buyerName);
    if (!customer) return [];
    return Array.from(new Set(orders.filter(o => o.customerId === customer.id && o.style === newQC.styleNumber).map(o => o.color))).sort();
  }, [newQC.buyerName, newQC.styleNumber, orders, customers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: InspectionRecord = {
      ...newQC as InspectionRecord,
      id: `FIN-QC-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      operatorId: 'FINAL-QC',
      machineNo: 'QC-DEPT',
      totalDelivered: (newQC.qualityPassed || 0) + (newQC.rejected || 0),
      knittingCompletedQty: (newQC.qualityPassed || 0) + (newQC.rejected || 0),
      rejectionRate: (newQC.qualityPassed || 0) + (newQC.rejected || 0) > 0 
        ? Number(((newQC.rejected || 0) / ((newQC.qualityPassed || 0) + (newQC.rejected || 0)) * 100).toFixed(1)) 
        : 0
    };
    onAddInspection(record);
    setIsModalOpen(false);
    setNewQC({
      date: new Date().toISOString().split('T')[0],
      buyerName: '',
      styleNumber: '',
      color: '',
      qualityPassed: 0,
      rejected: 0,
    });
  };

  const filteredSummary = summaryData.filter(s => 
    s.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.style.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.color.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <ClipboardCheck className="text-emerald-500" />
            QC PASSED SUMMARY
          </h2>
          <p className="text-slate-500 text-sm">Revenue calculated based on confirmed QC Passed quantities</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
        >
          <Plus size={20} />
          <span>Record QC Pass</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Order, Style or Color..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Info</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Style & Color</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Order Qty</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">QC Passed</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actual Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Completion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSummary.map(row => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 font-mono text-sm">{row.orderNumber}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-800">{row.style}</div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] font-black text-emerald-600 uppercase">
                      <Palette size={10} /> {row.color}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-sm text-slate-600">{row.quantity}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-emerald-600 font-black font-mono text-sm">
                      {row.totalPassed}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-black text-slate-900 font-mono">${row.actualSalesAmount.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Verified Sales</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden min-w-[100px]">
                        <div 
                          className={`h-full ${row.totalPassed >= row.quantity ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                          style={{ width: `${Math.min((row.totalPassed / row.quantity) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-black text-slate-400">
                        {Math.round((row.totalPassed / row.quantity) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-emerald-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg"><CheckCircle2 size={20} /></div>
                <h3 className="text-lg font-black uppercase tracking-tight">Post QC Result</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <User size={12} /> Buyer Name
                  </label>
                  <select 
                    required 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-bold bg-white" 
                    value={newQC.buyerName} 
                    onChange={(e) => setNewQC({...newQC, buyerName: e.target.value, styleNumber: '', color: ''})}
                  >
                    <option value="">Select Buyer</option>
                    {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Tag size={12} /> Style Number</label>
                    <select 
                      required 
                      disabled={!newQC.buyerName}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold bg-white disabled:bg-slate-50 uppercase" 
                      value={newQC.styleNumber} 
                      onChange={(e) => setNewQC({...newQC, styleNumber: e.target.value, color: ''})}
                    >
                      <option value="">Style...</option>
                      {availableStyles.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Palette size={12} /> Color</label>
                    <select 
                      required 
                      disabled={!newQC.styleNumber}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold bg-white disabled:bg-slate-50" 
                      value={newQC.color} 
                      onChange={(e) => setNewQC({...newQC, color: e.target.value})} 
                    >
                      <option value="">Color...</option>
                      {availableColors.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {matchingOrder && (
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-emerald-700">
                      <CloudSync size={18} className="animate-pulse" />
                      <div>
                        <p className="text-[10px] font-black uppercase">Linked Sales Order</p>
                        <p className="text-sm font-bold">{matchingOrder.orderNumber}</p>
                      </div>
                    </div>
                    <div className="text-right text-emerald-800">
                      <p className="text-[10px] font-black uppercase text-emerald-600">Total Goal</p>
                      <p className="text-xl font-black">{matchingOrder.quantity} PCS</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">QC Passed Quantity</label>
                    <input 
                      required 
                      type="number" 
                      className="w-full px-4 py-3 border border-emerald-200 rounded-xl text-lg font-black text-emerald-600 outline-none focus:ring-4 focus:ring-emerald-500/10" 
                      value={newQC.qualityPassed || ''} 
                      onChange={(e) => setNewQC({...newQC, qualityPassed: Number(e.target.value)})} 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Rejected Quantity</label>
                    <input 
                      required 
                      type="number" 
                      className="w-full px-4 py-3 border border-rose-200 rounded-xl text-lg font-black text-rose-500 outline-none focus:ring-4 focus:ring-rose-500/10" 
                      value={newQC.rejected || ''} 
                      onChange={(e) => setNewQC({...newQC, rejected: Number(e.target.value)})} 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Calendar size={12} /> Inspection Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold" 
                    value={newQC.date} 
                    onChange={(e) => setNewQC({...newQC, date: e.target.value})} 
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 border border-slate-200 text-slate-500 font-bold rounded-2xl uppercase text-xs">Cancel</button>
                <button type="submit" className="flex-1 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg uppercase text-xs">Confirm & Log Result</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
