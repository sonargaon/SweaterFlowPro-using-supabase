
import React, { useState, useEffect, useMemo } from 'react';
import { InspectionRecord, Customer, SampleDevelopment, ProductionOrder } from '../types';
import { Search, Plus, Filter, Download, X, Calendar, User, Settings, AlertCircle, CheckCircle2, Tag, Briefcase, Layers, Palette, CloudSync } from 'lucide-react';

interface InspectionManagerProps {
  records: InspectionRecord[];
  customers: Customer[];
  samples: SampleDevelopment[];
  orders: ProductionOrder[];
  onAddRecord: (record: InspectionRecord) => void;
}

export const InspectionManager: React.FC<InspectionManagerProps> = ({ records, customers, samples, orders, onAddRecord }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [matchingOrder, setMatchingOrder] = useState<ProductionOrder | null>(null);
  
  const [newRecord, setNewRecord] = useState<Partial<InspectionRecord>>({
    date: new Date().toISOString().split('T')[0],
    operatorId: '',
    machineNo: '',
    buyerName: '',
    styleNumber: '',
    color: '',
    totalDelivered: 0,
    knittingCompletedQty: 0,
    qualityPassed: 0,
    rejected: 0,
    rejectionRate: 0,
  });

  // Get available styles for the selected buyer from Sales Orders
  const availableStyles = useMemo(() => {
    if (!newRecord.buyerName) return [];
    // Find customer ID from buyer name
    const customer = customers.find(c => c.name === newRecord.buyerName);
    if (!customer) return [];
    
    const customerOrders = orders.filter(o => o.customerId === customer.id);
    return Array.from(new Set(customerOrders.map(o => o.style))).sort();
  }, [newRecord.buyerName, orders, customers]);

  // Get available colors for the selected buyer AND style
  const availableColors = useMemo(() => {
    if (!newRecord.buyerName || !newRecord.styleNumber) return [];
    const customer = customers.find(c => c.name === newRecord.buyerName);
    if (!customer) return [];

    const filteredOrders = orders.filter(o => 
      o.customerId === customer.id && 
      o.style === newRecord.styleNumber
    );
    return Array.from(new Set(filteredOrders.map(o => o.color))).sort();
  }, [newRecord.buyerName, newRecord.styleNumber, orders, customers]);

  // Sync logic for Inspection: Auto-pull quantity when Buyer, Style, and Color match
  useEffect(() => {
    if (newRecord.buyerName && newRecord.styleNumber && newRecord.color) {
      const match = orders.find(o => {
        const customer = customers.find(c => c.id === o.customerId);
        return customer?.name === newRecord.buyerName &&
               o.style === newRecord.styleNumber &&
               o.color === newRecord.color;
      });

      if (match) {
        setMatchingOrder(match);
        // Suggest total order quantity as Delivered if currently 0 or resetting
        setNewRecord(prev => ({ 
          ...prev, 
          totalDelivered: match.quantity, 
          orderNumber: match.orderNumber,
          // Re-calculate rejection rate based on new quantity suggestion
          rejected: match.quantity - (prev.qualityPassed || 0),
          rejectionRate: match.quantity > 0 ? Number(((match.quantity - (prev.qualityPassed || 0)) / match.quantity * 100).toFixed(1)) : 0
        }));
      } else {
        setMatchingOrder(null);
      }
    } else {
      setMatchingOrder(null);
    }
  }, [newRecord.buyerName, newRecord.styleNumber, newRecord.color, orders, customers]);

  const handleTotalChange = (val: number) => {
    const passed = newRecord.qualityPassed || 0;
    const rejected = val - passed;
    const rate = val > 0 ? (rejected / val) * 100 : 0;
    setNewRecord({ ...newRecord, totalDelivered: val, rejected, rejectionRate: Number(rate.toFixed(1)) });
  };

  const handlePassedChange = (val: number) => {
    const total = newRecord.totalDelivered || 0;
    const rejected = total - val;
    const rate = total > 0 ? (rejected / total) * 100 : 0;
    setNewRecord({ ...newRecord, qualityPassed: val, rejected, rejectionRate: Number(rate.toFixed(1)) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: InspectionRecord = {
      ...newRecord as InspectionRecord,
      id: `INS-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    };
    onAddRecord(record);
    setIsModalOpen(false);
    setNewRecord({
      date: new Date().toISOString().split('T')[0],
      operatorId: '',
      machineNo: '',
      buyerName: '',
      styleNumber: '',
      color: '',
      totalDelivered: 0,
      knittingCompletedQty: 0,
      qualityPassed: 0,
      rejected: 0,
      rejectionRate: 0,
    });
  };

  const filteredRecords = records.filter(r => 
    r.operatorId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.styleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.color.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">KNITTING INSPECTION</h2>
          <p className="text-slate-500 text-sm italic">Quality verification: Deliver → Inspect → Report</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus size={20} />
          <span>New Inspection Entry</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Order, Color or Style..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Date / Machine</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Buyer, Style & Color</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Total Delivered</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Passed</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Rejected</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRecords.map(record => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-800 font-mono">{record.date}</div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Machine: {record.machineNo}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-800">{record.buyerName}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-indigo-500 font-black uppercase tracking-widest uppercase">{record.styleNumber}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Palette size={10} /> {record.color}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-800 text-center font-bold">{record.totalDelivered}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-emerald-600 font-bold flex items-center justify-center gap-1">
                      <CheckCircle2 size={14} /> {record.qualityPassed}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-rose-500 font-bold flex items-center justify-center gap-1">
                      <AlertCircle size={14} /> {record.rejected}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-black">
                    <div className={`px-2 py-1 rounded inline-block ${record.rejectionRate > 5 ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                      {record.rejectionRate}%
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-amber-500 text-white flex justify-between items-center">
              <h3 className="text-lg font-black uppercase tracking-tight">Knitting QC Report</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Buyer Name</label>
                  <select 
                    required 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-amber-500/10 outline-none text-sm font-bold bg-white" 
                    value={newRecord.buyerName} 
                    onChange={(e) => setNewRecord({...newRecord, buyerName: e.target.value, styleNumber: '', color: ''})}
                  >
                    <option value="">Select Buyer</option>
                    {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Style Number</label>
                  <select 
                    required 
                    disabled={!newRecord.buyerName}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-amber-500/10 outline-none text-sm font-bold bg-white disabled:bg-slate-50 uppercase" 
                    value={newRecord.styleNumber} 
                    onChange={(e) => setNewRecord({...newRecord, styleNumber: e.target.value, color: ''})}
                  >
                    <option value="">{newRecord.buyerName ? 'Select Style...' : 'Select Buyer First'}</option>
                    {availableStyles.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Palette size={12} /> Color</label>
                  <select 
                    required 
                    disabled={!newRecord.styleNumber}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-amber-500/10 outline-none text-sm font-bold bg-white disabled:bg-slate-50" 
                    value={newRecord.color} 
                    onChange={(e) => setNewRecord({...newRecord, color: e.target.value})} 
                  >
                    <option value="">{newRecord.styleNumber ? 'Select Color...' : 'Select Style First'}</option>
                    {availableColors.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <div className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${matchingOrder ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${matchingOrder ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                        <CloudSync size={18} className={matchingOrder ? 'animate-pulse' : ''} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest">Sales Order Verification</p>
                        <p className="text-sm font-bold">{matchingOrder ? `Found: ${matchingOrder.orderNumber}` : 'Syncing with Sales...'}</p>
                      </div>
                    </div>
                    {matchingOrder && (
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase">Order Target</p>
                        <p className="text-lg font-black">{matchingOrder.quantity} PCS</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Delivered</label>
                  <input required type="number" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold" value={newRecord.totalDelivered || ''} onChange={(e) => handleTotalChange(Number(e.target.value))} />
                </div>
                
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">QC Passed</label>
                  <input required type="number" className="w-full px-4 py-3 border border-emerald-200 rounded-xl text-sm font-bold text-emerald-600" value={newRecord.qualityPassed || ''} onChange={(e) => handlePassedChange(Number(e.target.value))} />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-8 py-3 bg-amber-500 text-white rounded-xl font-black shadow-lg hover:brightness-105 transition-all">Post Inspection</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
