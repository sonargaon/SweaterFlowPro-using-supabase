
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { SampleDevelopment as SampleType } from '../types';
import { 
  FlaskConical, Plus, Box, Layers, X, ShieldCheck, Scissors, CheckCircle2, Truck, ClipboardList, Clock, Calculator, Trash2, AlertCircle
} from 'lucide-react';

interface SampleDevelopmentProps {
  samples: SampleType[];
  onAddSample: (sample: SampleType) => void;
  onDeleteSample?: (id: string) => void;
}

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

  useEffect(() => {
    const val = isCurrency && isBdtMode ? value * exchangeRate : value;
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
      <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black transition-colors ${
        isBdtMode && isCurrency ? 'text-indigo-500' : 'text-slate-400'
      }`}>
        {isCurrency ? (isBdtMode ? '৳' : '$') : prefix}
      </span>
      <input 
        ref={inputRef}
        type="number"
        step="any"
        disabled={disabled}
        className={`w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all disabled:opacity-50 placeholder:font-normal ${className} ${
          isBdtMode && isCurrency ? 'text-indigo-700' : 'text-slate-800'
        }`}
        placeholder="0.00"
        value={displayValue}
        onChange={handleChange}
      />
    </div>
  );
};

export const SampleDevelopment: React.FC<SampleDevelopmentProps> = ({ samples, onAddSample, onDeleteSample }) => {
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
    windingCost: 0,
    knittingTime: 0,
    knittingCost: 0,
    linkingCost: 0,
    trimmingCost: 0,
    mendingCost: 0,
    sewingCosting: 0,
    washingCost: 0,
    pqcCosting: 0,
    ironCosting: 0,
    getupCosting: 0,
    packingCosting: 0,
    boilerGas: 0,
    overheadCost: 0,
    others1: 0,
    others2: 0,
    others3: 0,
    others4: 0,
    notes: '',
    constructionNotes: '',
    packagingNotes: '',
  });

  const calculateTotal = useCallback((s: SampleType | Partial<SampleType>) => {
    const yarnCost = (s.yarnRequiredLbs || 0) * (s.yarnPricePerLbs || 0);
    const mfgCosts = 
      (s.windingCost || 0) +
      (s.knittingCost || 0) + 
      (s.linkingCost || 0) + 
      (s.trimmingCost || 0) + 
      (s.mendingCost || 0) +
      (s.sewingCosting || 0) + 
      (s.washingCost || 0) + 
      (s.pqcCosting || 0) + 
      (s.ironCosting || 0) + 
      (s.getupCosting || 0) + 
      (s.packingCosting || 0) + 
      (s.boilerGas || 0) + 
      (s.overheadCost || 0) +
      (s.others1 || 0) +
      (s.others2 || 0) +
      (s.others3 || 0) +
      (s.others4 || 0);
    return (yarnCost + mfgCosts);
  }, []);

  const totalUsd = useMemo(() => selectedSample ? calculateTotal(selectedSample) : 0, [selectedSample, calculateTotal]);
  const totalBdt = totalUsd * exchangeRate;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSample.styleNumber) return;
    const finalSample: SampleType = {
      ...newSample as SampleType,
      id: `SAMP-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    };
    onAddSample(finalSample);
    setSelectedSample(finalSample);
    setIsAdding(false);
  };

  const handleDelete = () => {
    if (selectedSample && window.confirm(`Are you sure you want to delete style ${selectedSample.styleNumber}?`)) {
      onDeleteSample?.(selectedSample.id);
      setSelectedSample(null);
    }
  };

  const handleInputChange = (field: keyof SampleType, value: any) => {
    if (selectedSample) {
      setSelectedSample({ ...selectedSample, [field]: value });
    }
  };

  const CostField = ({ label, field, isTime = false, s = selectedSample }: { label: string, field: keyof SampleType, isTime?: boolean, s?: any }) => (
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</label>
      <SmartCostInput 
        value={s?.[field] as number || 0} 
        onChange={(v) => isAdding ? setNewSample({...newSample, [field]: v}) : handleInputChange(field, v)} 
        exchangeRate={exchangeRate} 
        isBdtMode={isBdtInputMode} 
        isCurrency={!isTime} 
        prefix={isTime ? "min" : ""} 
      />
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-600';
      case 'rejected': return 'bg-rose-100 text-rose-600';
      case 'prototype': return 'bg-indigo-100 text-indigo-600';
      default: return 'bg-slate-200 text-slate-600';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-full lg:w-80 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <FlaskConical size={20} className="text-indigo-600" />
            STYLE R&D
          </h2>
          <button onClick={() => setIsAdding(true)} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-xl transition-all"><Plus size={20} /></button>
        </div>

        <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 scrollbar-hide">
          {samples.map(s => (
            <button key={s.id} onClick={() => setSelectedSample(s)} className={`w-full p-4 rounded-2xl border text-left transition-all ${selectedSample?.id === s.id ? 'bg-white border-indigo-200 shadow-xl translate-x-1' : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                 <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{s.styleNumber}</p>
                 {s.status === 'approved' && <ShieldCheck size={14} className="text-emerald-500" />}
                 {s.status === 'rejected' && <AlertCircle size={14} className="text-rose-500" />}
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Cost Analysis</h4>
              <div className="mt-4 flex justify-between items-end">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${getStatusColor(s.status)}`}>{s.status}</span>
                <span className="text-sm font-black text-slate-900 font-mono">${calculateTotal(s).toFixed(2)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1">
        {selectedSample ? (
          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden sticky top-24">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{selectedSample.styleNumber}</h3>
                  <button 
                    onClick={handleDelete}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                    title="Delete style from R&D registry"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Granular Manufacturing Costing Node</p>
              </div>
              <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col pr-4 border-r border-slate-100">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">X-Rate</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-indigo-600">৳</span>
                    <input type="number" className="w-16 bg-transparent border-none p-0 text-sm font-black focus:ring-0 outline-none" value={exchangeRate} onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1)} />
                  </div>
                </div>
                <button onClick={() => setIsBdtInputMode(!isBdtInputMode)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${isBdtInputMode ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {isBdtInputMode ? 'BDT Mode' : 'USD Mode'}
                </button>
              </div>
            </div>

            <div className="p-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <CostField label="Winding Cost" field="windingCost" />
                <CostField label="Knitting Time" field="knittingTime" isTime={true} />
                <CostField label="Knitting Cost" field="knittingCost" />
                <CostField label="Linking Cost" field="linkingCost" />
                <CostField label="Trimming Cost" field="trimmingCost" />
                <CostField label="Mending Cost" field="mendingCost" />
                <CostField label="Sewing Cost" field="sewingCosting" />
                <CostField label="PQC Cost" field="pqcCosting" />
                <CostField label="Washing Cost" field="washingCost" />
                <CostField label="Iron Cost" field="ironCosting" />
                <CostField label="Getup Cost" field="getupCosting" />
                <CostField label="Packing Cost" field="packingCosting" />
                <CostField label="CNG/LPG Boiler" field="boilerGas" />
                <CostField label="Other Cost 1" field="others1" />
                <CostField label="Other Cost 2" field="others2" />
                <CostField label="Other Cost 3" field="others3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <ClipboardList size={16} className="text-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Construction Details</span>
                  </div>
                  <textarea 
                    className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-xs font-medium focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none min-h-[140px]"
                    placeholder="Describe technical stitching, gage, and pattern requirements..."
                    value={selectedSample.constructionNotes || ''}
                    onChange={(e) => handleInputChange('constructionNotes', e.target.value)}
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Truck size={16} className="text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Packaging Requirements</span>
                  </div>
                  <textarea 
                    className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-xs font-medium focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none min-h-[140px]"
                    placeholder="Mention custom labeling or carton configurations..."
                    value={selectedSample.packagingNotes || ''}
                    onChange={(e) => handleInputChange('packagingNotes', e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-10 bg-slate-900 rounded-[2rem] p-10 text-white flex flex-col md:flex-row justify-between items-center gap-10">
                <div>
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Grand Total Unit Cost</p>
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-6xl font-black text-white tracking-tighter">${totalUsd.toFixed(2)}</h2>
                    <span className="text-slate-500 text-xl font-bold uppercase">USD</span>
                  </div>
                </div>
                <div className="text-right flex items-center gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-right">Status</label>
                    <select 
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase outline-none focus:ring-4 focus:ring-white/10 ${getStatusColor(selectedSample.status)}`}
                      value={selectedSample.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      <option value="draft">Draft</option>
                      <option value="prototype">Prototype</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Local Value</p>
                    <h3 className="text-4xl font-black text-indigo-300 font-mono">৳{totalBdt.toLocaleString()}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-24 text-center">
            <h3 className="text-2xl font-black text-slate-400 uppercase tracking-widest">Registry Empty</h3>
            <button onClick={() => setIsAdding(true)} className="mt-6 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs">Create New Technical Card</button>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-8 bg-indigo-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">New Tech Sheet</h3>
                <p className="text-[10px] text-indigo-300 font-black uppercase mt-1">Multi-Stage Cost Matrix Initialization</p>
              </div>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={28} /></button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
              <div className="bg-indigo-50/50 p-6 rounded-[1.5rem] border border-indigo-100 grid grid-cols-3 gap-6 shadow-sm">
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-2">Style ID</label>
                  <input required autoFocus type="text" className="w-full px-4 py-2 border border-indigo-200 rounded-xl outline-none text-xs font-bold uppercase" placeholder="e.g. SN-W-2025" value={newSample.styleNumber} onChange={(e) => setNewSample({...newSample, styleNumber: e.target.value})} />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-2">Yarn Type</label>
                  <input type="text" className="w-full px-4 py-2 border border-indigo-200 rounded-xl text-xs font-bold" value={newSample.yarnType || ''} onChange={(e) => setNewSample({...newSample, yarnType: e.target.value})} placeholder="e.g. Cotton" />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-2">Yarn Count</label>
                  <input type="text" className="w-full px-4 py-2 border border-indigo-200 rounded-xl text-xs font-bold" value={newSample.yarnCount || ''} onChange={(e) => setNewSample({...newSample, yarnCount: e.target.value})} placeholder="e.g. 2/28" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <CostField label="Winding" field="windingCost" s={newSample} />
                <CostField label="Knitting Time" field="knittingTime" isTime={true} s={newSample} />
                <CostField label="Knitting" field="knittingCost" s={newSample} />
                <CostField label="Linking" field="linkingCost" s={newSample} />
                <CostField label="Trimming" field="trimmingCost" s={newSample} />
                <CostField label="Mending" field="mendingCost" s={newSample} />
                <CostField label="Sewing" field="sewingCosting" s={newSample} />
                <CostField label="PQC" field="pqcCosting" s={newSample} />
                <CostField label="Washing" field="washingCost" s={newSample} />
                <CostField label="Ironing" field="ironCosting" s={newSample} />
                <CostField label="Getup" field="getupCosting" s={newSample} />
                <CostField label="Packing" field="packingCosting" s={newSample} />
                <CostField label="Boiler Fuel" field="boilerGas" s={newSample} />
                <CostField label="Other 1" field="others1" s={newSample} />
                <CostField label="Other 2" field="others2" s={newSample} />
                <CostField label="Other 3" field="others3" s={newSample} />
              </div>

              <div className="bg-slate-900 p-10 rounded-[2.5rem] text-slate-800 flex justify-between items-center border border-slate-200">
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Projected Unit Card Total</p>
                  <h2 className="text-5xl font-black text-indigo-400 tracking-tighter">${calculateTotal(newSample).toFixed(2)}</h2>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setIsAdding(false)} className="px-8 py-4 text-slate-400 font-bold uppercase text-xs">Discard</button>
                  <button type="submit" className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl uppercase text-xs transition-all active:scale-95">Commit Sheet</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
