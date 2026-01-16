
import React, { useState, useEffect } from 'react';
import { LinkingRecord, Customer, SampleDevelopment, ProductionOrder, InspectionRecord } from '../types';
import { Search, Plus, Filter, Download, X, Calendar, User, Scissors, CheckCircle2, Tag, Briefcase, Activity, Palette, Hash, ClipboardCheck, Zap, Lock } from 'lucide-react';

interface LinkingManagerProps {
  records: LinkingRecord[];
  customers: Customer[];
  samples: SampleDevelopment[];
  orders: ProductionOrder[];
  inspections: InspectionRecord[];
  onAddRecord: (record: LinkingRecord) => void;
}

export const LinkingManager: React.FC<LinkingManagerProps> = ({ records, customers, samples, orders, inspections, onAddRecord }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newRecord, setNewRecord] = useState<Partial<LinkingRecord>>({
    date: new Date().toISOString().split('T')[0],
    operatorId: '',
    buyerName: '',
    styleNumber: '',
    orderNumber: '',
    color: '',
    totalQuantity: 0,
    operatorCompletedQty: 0,
    completedQty: 0,
  });

  const [availableFromInspection, setAvailableFromInspection] = useState<number>(0);

  // Sync QC Checked quantity from inspection whenever style OR color changes
  useEffect(() => {
    if (newRecord.styleNumber && newRecord.color) {
      // Filter by both style and color to support styles with multiple colors
      const totalPassed = inspections
        .filter(ins => ins.styleNumber === newRecord.styleNumber && ins.color === newRecord.color)
        .reduce((sum, ins) => sum + ins.qualityPassed, 0);
      
      setAvailableFromInspection(totalPassed);
      setNewRecord(prev => ({ ...prev, completedQty: totalPassed }));
    } else {
      setAvailableFromInspection(0);
      setNewRecord(prev => ({ ...prev, completedQty: 0 }));
    }
  }, [newRecord.styleNumber, newRecord.color, inspections]);

  const handleOrderChange = (orderNo: string) => {
    const order = orders.find(o => o.orderNumber === orderNo);
    if (order) {
      const customer = customers.find(c => c.id === order.customerId);
      setNewRecord({
        ...newRecord,
        orderNumber: orderNo,
        buyerName: customer?.name || 'Walk-in Customer',
        styleNumber: order.style,
        totalQuantity: order.quantity,
        color: order.color // Uses top-level color from ProductionOrder
      });
    } else {
      setNewRecord({
        ...newRecord,
        orderNumber: orderNo,
        buyerName: '',
        styleNumber: '',
        totalQuantity: 0,
        color: ''
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.operatorId || !newRecord.buyerName || !newRecord.styleNumber || !newRecord.color) {
      alert("Please fill in all required fields including Color.");
      return;
    }

    const record: LinkingRecord = {
      ...newRecord as LinkingRecord,
      id: `LNK-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    };

    onAddRecord(record);
    setIsModalOpen(false);
    setNewRecord({
      date: new Date().toISOString().split('T')[0],
      operatorId: '',
      buyerName: '',
      styleNumber: '',
      orderNumber: '',
      color: '',
      totalQuantity: 0,
      operatorCompletedQty: 0,
      completedQty: 0,
    });
  };

  const filteredRecords = records.filter(r => 
    r.operatorId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.styleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.color.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Scissors className="text-rose-500" />
            LINKING DEPARTMENT
          </h2>
          <p className="text-slate-500 text-sm">Component assembly & multi-color tracking</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 shadow-lg transition-all"
        >
          <Plus size={20} />
          <span>New Linking Report</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Order, Style or Color..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Order, Style & Color</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Op. Completed</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">QC Passed</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRecords.map(record => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-600 font-mono">{record.date}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-black text-indigo-600 font-mono">{record.orderNumber}</div>
                    <div className="text-sm font-bold text-slate-800">{record.styleNumber}</div>
                    <div className="text-[10px] text-rose-500 uppercase tracking-wider font-bold flex items-center gap-1 mt-0.5">
                      <Palette size={10} /> {record.color}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-800 text-center font-black">{record.operatorCompletedQty}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-emerald-600 font-bold flex items-center justify-center gap-1">
                      <CheckCircle2 size={16} /> {record.completedQty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-400" style={{ width: `${Math.min((record.completedQty / record.totalQuantity) * 100, 100)}%` }}></div>
                      </div>
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
            <div className="p-6 bg-rose-500 text-white flex justify-between items-center">
              <h3 className="text-lg font-black uppercase tracking-tight">Linking Production Report</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Hash size={12} /> Select Sales Order
                  </label>
                  <select 
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-rose-500/10 outline-none text-sm font-bold bg-white"
                    value={newRecord.orderNumber}
                    onChange={(e) => handleOrderChange(e.target.value)}
                  >
                    <option value="">Choose Order...</option>
                    {orders.map(o => (
                      <option key={o.id} value={o.orderNumber}>{o.orderNumber} - {o.style} ({o.color})</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1">
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Style</label>
                   <input readOnly type="text" className="w-full px-4 py-3 border border-slate-100 bg-slate-50 rounded-xl text-sm font-bold text-slate-500" value={newRecord.styleNumber} />
                </div>
                <div className="col-span-1">
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Palette size={12} /> Color</label>
                   <input readOnly type="text" className="w-full px-4 py-3 border border-slate-100 bg-slate-50 rounded-xl text-sm font-bold text-slate-500" value={newRecord.color} />
                </div>

                <div className="col-span-2 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                  <div className="flex items-center justify-between text-emerald-800">
                    <span className="text-[10px] font-black uppercase tracking-widest">Passed Inspection (Style+Color)</span>
                    <span className="text-sm font-black">{availableFromInspection} PCS</span>
                  </div>
                </div>

                <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-2"><Zap size={12} /> Op. Completed</label>
                    <input required type="number" className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none text-lg font-black" value={newRecord.operatorCompletedQty || ''} onChange={(e) => setNewRecord({...newRecord, operatorCompletedQty: Number(e.target.value)})} />
                </div>
                <div className="col-span-1">
                    <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2"><Lock size={12} /> QC Auto-Pull</label>
                    <input readOnly type="number" className="w-full px-4 py-3 border border-emerald-300 bg-emerald-100/30 rounded-xl outline-none text-lg font-black text-emerald-600" value={newRecord.completedQty || 0} />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 border border-slate-200 text-slate-500 font-bold rounded-2xl uppercase text-xs">Cancel</button>
                <button type="submit" className="flex-1 px-8 py-4 bg-rose-500 text-white rounded-2xl font-black shadow-lg uppercase text-xs">Save Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
