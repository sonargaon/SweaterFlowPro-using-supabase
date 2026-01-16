
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { SampleDevelopment as SampleType } from '../types';
import { 
  FlaskConical, Plus, Save, Calculator, DollarSign, Clock, FileText, 
  ChevronRight, CheckCircle2, Box, Layers, X, Info, RefreshCw, 
  ArrowRightLeft, TrendingUp, ShieldCheck, AlertCircle 
} from 'lucide-react';

interface SampleDevelopmentProps {
  samples: SampleType[];
  onAddSample: (sample: SampleType) => void;
}

/**
 * SmartCostInput prevents input "jitter" during currency conversion.
 * It keeps a local string state while typing and syncs the numeric value to the parent.
 */
const SmartCostInput = ({ 
  value, 
  onChange, 
  exchangeRate, 
  isBdtMode, 
  isCurrency, 
  prefix,
  disabled = false,
  className = ""
}: { 
  value: number, 
  onChange: (val: number) => void, 
  exchangeRate: number, 
  isBdtMode: boolean, 
  isCurrency: boolean,
  prefix?: string,
  disabled?: boolean,
  className?: string
}) => {
  const [displayValue, setDisplayValue] = useState<string>("");

  // Sync display value when the underlying value or mode changes externally
  useEffect(() => {
    const val = isCurrency && isBdtMode ? value * exchangeRate : value;
    // Only update if not currently focused to avoid fighting the user
    if (document.activeElement !== inputRef.current) {
      setDisplayValue(val === 0 ? "" : val.toString());
    }
  }, [value, isBdtMode, isCurrency, exchangeRate]);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDisplayValue(raw);

    const num = parseFloat(raw) || 0;
    const finalVal = isCurrency && isBdtMode ? num / exchangeRate : num;
    onChange(finalVal);
  };

  return (
    <div className="relative group">
      <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black transition-colors ${
        isBdtMode && isCurrency ? 'text-indigo-500' : 'text-slate-400'
      }`}>
        {isCurrency ? (isBdtMode ? '৳' : '$') : prefix}
      </span>
      <input 
        ref={inputRef}
        type="number"
        step="any"
        disabled={disabled}
        className={`w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all disabled:opacity-50 placeholder:font-normal ${className} ${
          isBdtMode && isCurrency ? 'text-indigo-700' : 'text-slate-800'
        }`}
        placeholder="0.00"
        value={displayValue}
        onChange={handleChange}
      />
    </div>
  );
};

export const SampleDevelopment: React.FC<SampleDevelopmentProps> = ({ samples, onAddSample }) => {
  const [selectedSample, setSelectedSample] = useState<SampleType | null>(samples[0] || null);
  const [isAdding, setIsAdding] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number>(118.50);
  const [isBdtInputMode, setIsBdtInputMode] = useState(false);

  const [newSample, setNewSample] = useState<Partial<SampleType>>({
    styleNumber: '',
    status: 'draft',
    yarnType: '',
    yarnCount: '',
    yarnRequiredLbs: 0,
    yarnPricePerLbs: 0,
    knittingTime: 0,
    knittingCost: 0,
    linkingCost: 0,
    trimmingMendingCost: 0,
    sewingCosting: 0,
    washingCost: 0,
    pqcCosting: 0,
    ironCosting: 0,
    getupCosting: 0,
    packingCosting: 0,
    boilerGas: 0,
    overheadCost: 0,
  });

  const calculateTotal = useCallback((s: SampleType | Partial<SampleType>) => {
    const yarnCost = (s.yarnRequiredLbs || 0) * (s.yarnPricePerLbs || 0);
    const manufacturingCosts = 
      (s.knittingCost || 0) + 
      (s.linkingCost || 0) + 
      (s.trimmingMendingCost || 0) + 
      (s.sewingCosting || 0) + 
      (s.washingCost || 0) + 
      (s.pqcCosting || 0) + 
      (s.ironCosting || 0) + 
      (s.getupCosting || 0) + 
      (s.packingCosting || 0) + 
      (s.boilerGas || 0) + 
      (s.overheadCost || 0);
    return (yarnCost + manufacturingCosts);
  }, []);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSample.styleNumber) return;

    if (samples.find(s => s.styleNumber === newSample.styleNumber)) {
      alert("Style Number must be unique!");
      return;
    }

    const finalSample: SampleType = {
      ...newSample as SampleType,
      id: `SAMP-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    };

    onAddSample(finalSample);
    setSelectedSample(finalSample);
    setIsAdding(false);
    setNewSample({
      styleNumber: '', status: 'draft', yarnType: '', yarnCount: '', yarnRequiredLbs: 0, yarnPricePerLbs: 0, 
      knittingTime: 0, knittingCost: 0, linkingCost: 0, trimmingMendingCost: 0, 
      sewingCosting: 0, washingCost: 0, pqcCosting: 0, ironCosting: 0, 
      getupCosting: 0, packingCosting: 0, boilerGas: 0, overheadCost: 0,
    });
  };

  const handleInputChange = (field: keyof SampleType, value: any) => {
    if (selectedSample) {
      setSelectedSample({ ...selectedSample, [field]: value });
    }
  };

  const totalUsd = useMemo(() => selectedSample ? calculateTotal(selectedSample) : 0, [selectedSample, calculateTotal]);
  const totalBdt = totalUsd * exchangeRate;

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sidebar List */}
      <div className="w-full lg:w-80 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <FlaskConical size={20} className="text-indigo-600" />
            STYLE R&D
          </h2>
          <button 
            onClick={() => setIsAdding(true)}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all transform hover:scale-105"
            title="Add New Style Costing"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 scrollbar-hide">
          {samples.length > 0 ? samples.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSample(s)}
              className={`w-full p-4 rounded-2xl border text-left transition-all group ${
                selectedSample?.id === s.id 
                  ? 'bg-white border-indigo-200 shadow-xl shadow-indigo-500/10 translate-x-1' 
                  : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-1.5">
                    <FileText size={12} className={selectedSample?.id === s.id ? 'text-indigo-500' : 'text-slate-400'} />
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.15em]">{s.styleNumber}</p>
                 </div>
                 {s.status === 'approved' && <ShieldCheck size={14} className="text-emerald-500" />}
              </div>
              <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Costing Sheet</h4>
              <div className="mt-4 flex justify-between items-end">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                  s.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600'
                }`}>
                  {s.status}
                </span>
                <span className="text-sm font-black text-slate-900 font-mono">${calculateTotal(s).toFixed(2)}</span>
              </div>
            </button>
          )) : (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <AlertCircle size={32} className="mx-auto text-slate-300 mb-2 opacity-50" />
              <p className="text-slate-400 text-xs font-bold italic">No records found</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Calculation Sheet */}
      <div className="flex-1">
        {selectedSample ? (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden sticky top-24">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-indigo-600 p-2 rounded-lg text-white"><FlaskConical size={16}/></div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{selectedSample.styleNumber}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Master Tech Pack Analysis</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col pr-4 border-r border-slate-100">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Conversion Rate</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-indigo-600">৳</span>
                    <input 
                      type="number" 
                      className="w-16 bg-transparent border-none p-0 text-sm font-black focus:ring-0 outline-none"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1)}
                    />
                  </div>
                </div>
                <button 
                  onClick={() => setIsBdtInputMode(!isBdtInputMode)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    isBdtInputMode 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <ArrowRightLeft size={14} />
                  {isBdtInputMode ? 'BDT Mode' : 'USD Mode'}
                </button>
              </div>
            </div>

            <div className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {/* Section Cards */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3 pb-3 border-b-2 border-indigo-100">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Box size={18} /></div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-900">Materials</h4>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Yarn Type</label>
                        <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" value={selectedSample.yarnType || ''} onChange={(e) => handleInputChange('yarnType', e.target.value)} placeholder="e.g. Cotton" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Yarn Count</label>
                        <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" value={selectedSample.yarnCount || ''} onChange={(e) => handleInputChange('yarnCount', e.target.value)} placeholder="e.g. 2/28" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Yarn Reqd (lbs/pc)</label>
                      <SmartCostInput value={selectedSample.yarnRequiredLbs} onChange={(v) => setSelectedSample({...selectedSample, yarnRequiredLbs: v})} exchangeRate={exchangeRate} isBdtMode={false} isCurrency={false} prefix="lb" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Yarn Unit Price</label>
                      <SmartCostInput value={selectedSample.yarnPricePerLbs} onChange={(v) => setSelectedSample({...selectedSample, yarnPricePerLbs: v})} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} />
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-3 pb-3 border-b-2 border-purple-100">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Layers size={18} /></div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-purple-900">Knitting & Linking</h4>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Knitting Time (Min)</label>
                      <SmartCostInput value={selectedSample.knittingTime} onChange={(v) => setSelectedSample({...selectedSample, knittingTime: v})} exchangeRate={exchangeRate} isBdtMode={false} isCurrency={false} prefix="m" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Knitting Cost</label>
                      <SmartCostInput value={selectedSample.knittingCost} onChange={(v) => setSelectedSample({...selectedSample, knittingCost: v})} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Linking Cost</label>
                      <SmartCostInput value={selectedSample.linkingCost} onChange={(v) => setSelectedSample({...selectedSample, linkingCost: v})} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} />
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-3 pb-3 border-b-2 border-emerald-100">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 size={18} /></div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-900">Finishing</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="col-span-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Trimming</label>
                      <SmartCostInput value={selectedSample.trimmingMendingCost} onChange={(v) => setSelectedSample({...selectedSample, trimmingMendingCost: v})} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Washing</label>
                      <SmartCostInput value={selectedSample.washingCost} onChange={(v) => setSelectedSample({...selectedSample, washingCost: v})} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Sewing</label>
                      <SmartCostInput value={selectedSample.sewingCosting} onChange={(v) => setSelectedSample({...selectedSample, sewingCosting: v})} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">PQC</label>
                      <SmartCostInput value={selectedSample.pqcCosting} onChange={(v) => setSelectedSample({...selectedSample, pqcCosting: v})} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} />
                    </div>
                    <div className="col-span-2 mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block">Other Overheads</label>
                       <div className="grid grid-cols-2 gap-4">
                          <SmartCostInput value={selectedSample.overheadCost} onChange={(v) => setSelectedSample({...selectedSample, overheadCost: v})} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} className="bg-white" />
                          <SmartCostInput value={selectedSample.boilerGas} onChange={(v) => setSelectedSample({...selectedSample, boilerGas: v})} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} className="bg-white" />
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Master Result Banner */}
              <div className="mt-16 bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row justify-between items-center gap-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                   <TrendingUp size={180} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-indigo-500 rounded-lg text-white shadow-lg shadow-indigo-500/50"><Calculator size={18}/></div>
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">Factory Cost per Piece</p>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-6xl font-black text-white tracking-tighter">${totalUsd.toFixed(2)}</h2>
                    <span className="text-slate-500 text-xl font-bold">USD / UNIT</span>
                  </div>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2">
                       <span className="text-[10px] font-black text-indigo-300 uppercase">Local:</span>
                       <span className="text-lg font-black font-mono">৳{totalBdt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <button 
                      onClick={() => handleInputChange('status', 'approved')}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    >
                      Approve Price
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full md:w-auto relative z-10">
                   <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl min-w-[160px]">
                      <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest">Yarn Value</p>
                      <p className="text-2xl font-black text-indigo-300 font-mono">${((selectedSample.yarnRequiredLbs || 0) * (selectedSample.yarnPricePerLbs || 0)).toFixed(2)}</p>
                      <p className="text-[9px] text-indigo-400/50 font-bold uppercase mt-1">৳{(((selectedSample.yarnRequiredLbs || 0) * (selectedSample.yarnPricePerLbs || 0)) * exchangeRate).toLocaleString()}</p>
                   </div>
                   <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl min-w-[160px]">
                      <p className="text-[10px] text-slate-500 uppercase font-black mb-2 tracking-widest">CM / Process</p>
                      <p className="text-2xl font-black text-emerald-300 font-mono">${(totalUsd - ((selectedSample.yarnRequiredLbs || 0) * (selectedSample.yarnPricePerLbs || 0))).toFixed(2)}</p>
                      <p className="text-[9px] text-emerald-400/50 font-bold uppercase mt-1">৳{((totalUsd - ((selectedSample.yarnRequiredLbs || 0) * (selectedSample.yarnPricePerLbs || 0))) * exchangeRate).toLocaleString()}</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-24 text-center text-slate-400">
            <div className="bg-white p-6 rounded-full shadow-xl mb-6"><FlaskConical size={64} className="text-indigo-200" /></div>
            <h3 className="text-2xl font-black text-slate-500 mb-2">Technically Empty</h3>
            <p className="text-sm max-w-xs mx-auto mb-10 leading-relaxed">No production cost sheets found in the database. Create one to begin your style analysis.</p>
            <button 
              onClick={() => setIsAdding(true)}
              className="group flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
            >
              <Plus size={24} className="group-hover:rotate-90 transition-transform" /> 
              <span>Create New Technical ID</span>
            </button>
          </div>
        )}
      </div>

      {/* Modern Add Style Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-300">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="p-8 bg-indigo-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg">
                  <FlaskConical size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">New Tech Costing</h3>
                  <p className="text-[10px] text-indigo-300 font-black uppercase tracking-[0.2em] mt-1">Master Development Primary Entry</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-4 bg-white/10 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-indigo-300">RATE:</span>
                    <span className="text-xs font-black">৳{exchangeRate}</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsBdtInputMode(!isBdtInputMode)}
                    className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg transition-all ${isBdtInputMode ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400 hover:text-white'}`}
                  >
                    {isBdtInputMode ? 'BDT Mode' : 'USD Mode'}
                  </button>
                </div>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                  <X size={28} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
              <div className="bg-indigo-50/50 p-8 rounded-[2rem] border border-indigo-100 grid grid-cols-2 gap-8 shadow-sm">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Info size={12} /> Style Identity
                  </label>
                  <input 
                    required
                    autoFocus
                    type="text" 
                    className="w-full px-5 py-4 border border-indigo-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold uppercase tracking-widest placeholder:font-normal placeholder:tracking-normal"
                    placeholder="e.g. SN-WINTER-2025"
                    value={newSample.styleNumber}
                    onChange={(e) => setNewSample({...newSample, styleNumber: e.target.value})}
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-3">Dev Status</label>
                  <select 
                    className="w-full px-5 py-4 border border-indigo-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold bg-white cursor-pointer"
                    value={newSample.status}
                    onChange={(e) => setNewSample({...newSample, status: e.target.value as any})}
                  >
                    <option value="draft">Draft Protocol</option>
                    <option value="prototype">Prototype Batch</option>
                    <option value="approved">Finalized for Production</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-3">Yarn Type</label>
                  <input type="text" className="w-full px-5 py-4 border border-indigo-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold" value={newSample.yarnType || ''} onChange={(e) => setNewSample({...newSample, yarnType: e.target.value})} placeholder="e.g. Cotton" />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-3">Yarn Count</label>
                  <input type="text" className="w-full px-5 py-4 border border-indigo-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold" value={newSample.yarnCount || ''} onChange={(e) => setNewSample({...newSample, yarnCount: e.target.value})} placeholder="e.g. 2/28" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <div className="space-y-6">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-3">Raw Sourcing</h4>
                   <div className="space-y-4">
                     <div>
                       <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Yarn Req (lbs)</label>
                       <SmartCostInput value={newSample.yarnRequiredLbs!} onChange={(v) => setNewSample({...newSample, yarnRequiredLbs: v})} exchangeRate={exchangeRate} isBdtMode={false} isCurrency={false} prefix="lb" />
                     </div>
                     <div>
                       <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Yarn Price</label>
                       <SmartCostInput value={newSample.yarnPricePerLbs!} onChange={(v) => setNewSample({...newSample, yarnPricePerLbs: v})} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} />
                     </div>
                   </div>
                 </div>
                 
                 <div className="space-y-6">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-3">Machine Process</h4>
                   <div className="space-y-4">
                     <div>
                       <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Knitting Time</label>
                       <SmartCostInput value={newSample.knittingTime!} onChange={(v) => setNewSample({...newSample, knittingTime: v})} exchangeRate={exchangeRate} isBdtMode={false} isCurrency={false} prefix="m" />
                     </div>
                     <div>
                       <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Knitting Cost</label>
                       <SmartCostInput value={newSample.knittingCost!} onChange={(v) => setNewSample({...newSample, knittingCost: v})} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} />
                     </div>
                   </div>
                 </div>

                 <div className="space-y-6">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-3">Secondary</h4>
                   <div className="space-y-4">
                     <div>
                       <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Linking Cost</label>
                       <SmartCostInput value={newSample.linkingCost!} onChange={(v) => setNewSample({...newSample, linkingCost: v})} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} />
                     </div>
                     <div>
                       <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Sewing Cost</label>
                       <SmartCostInput value={newSample.sewingCosting!} onChange={(v) => setNewSample({...newSample, sewingCosting: v})} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} />
                     </div>
                   </div>
                 </div>
              </div>

              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-200 pb-3 mb-6">Finishing Detail Costing</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div><label className="text-[9px] font-black text-slate-400 uppercase block mb-2">Trimming</label><SmartCostInput value={newSample.trimmingMendingCost!} onChange={(v) => setNewSample({...newSample, trimmingMendingCost: v})} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} className="bg-white" /></div>
                  <div><label className="text-[9px] font-black text-slate-400 uppercase block mb-2">Washing</label><SmartCostInput value={newSample.washingCost!} onChange={(v) => setNewSample({...newSample, washingCost: v})} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} className="bg-white" /></div>
                  <div><label className="text-[9px] font-black text-slate-400 uppercase block mb-2">PQC</label><SmartCostInput value={newSample.pqcCosting!} onChange={(v) => setNewSample({...newSample, pqcCosting: v})} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} className="bg-white" /></div>
                  <div><label className="text-[9px] font-black text-slate-400 uppercase block mb-2">Ironing</label><SmartCostInput value={newSample.ironCosting!} onChange={(v) => setNewSample({...newSample, ironCosting: v})} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} className="bg-white" /></div>
                  <div><label className="text-[9px] font-black text-slate-400 uppercase block mb-2">Getup</label><SmartCostInput value={newSample.getupCosting!} onChange={(v) => setNewSample({...newSample, getupCosting: v})} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} className="bg-white" /></div>
                  <div><label className="text-[9px] font-black text-slate-400 uppercase block mb-2">Packing</label><SmartCostInput value={newSample.packingCosting!} onChange={(v) => setNewSample({...newSample, packingCosting: v})} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} className="bg-white" /></div>
                  <div><label className="text-[9px] font-black text-slate-400 uppercase block mb-2">Boiler/Gas</label><SmartCostInput value={newSample.boilerGas!} onChange={(v) => setNewSample({...newSample, boilerGas: v})} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} className="bg-white" /></div>
                  <div><label className="text-[9px] font-black text-slate-400 uppercase block mb-2">Overhead</label><SmartCostInput value={newSample.overheadCost!} onChange={(v) => setNewSample({...newSample, overheadCost: v})} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} className="bg-white" /></div>
                </div>
              </div>

              <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex justify-between items-center shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><Calculator size={100}/></div>
                <div className="relative z-10">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Total Unit Forecast</p>
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-5xl font-black text-indigo-400 tracking-tighter">${calculateTotal(newSample).toFixed(2)}</h2>
                    <span className="text-xs font-bold text-slate-500 uppercase">/ Piece</span>
                  </div>
                  <p className="text-[10px] text-indigo-300 font-black mt-2">≈ ৳{(calculateTotal(newSample) * exchangeRate).toLocaleString()}</p>
                </div>
                <div className="flex gap-4 relative z-10">
                  <button 
                    type="button" 
                    onClick={() => setIsAdding(false)} 
                    className="px-8 py-4 text-slate-400 font-bold hover:text-white transition-colors uppercase text-xs tracking-widest"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit" 
                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/40 hover:bg-indigo-500 transition-all uppercase text-xs tracking-widest active:scale-95"
                  >
                    Commit Sheet
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
