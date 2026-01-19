
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { SampleDevelopment as SampleType } from '../types';
import { 
  FlaskConical, Plus, Save, Calculator, DollarSign, Clock, FileText, 
  ChevronRight, CheckCircle2, Box, Layers, X, Info, RefreshCw, 
  ArrowRightLeft, TrendingUp, ShieldCheck, AlertCircle, Scissors, FileEdit, Truck, ClipboardList, BrainCircuit, Loader2, Zap
} from 'lucide-react';
import { analyzeStyleRisk } from '../services/geminiService';

interface SampleDevelopmentProps {
  samples: SampleType[];
  onAddSample: (sample: SampleType) => void;
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
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

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
    const manufacturingCosts = 
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
    return (yarnCost + manufacturingCosts);
  }, []);

  const totalUsd = useMemo(() => selectedSample ? calculateTotal(selectedSample) : 0, [selectedSample, calculateTotal]);
  const totalBdt = totalUsd * exchangeRate;

  const runAudit = async () => {
    if (!selectedSample?.constructionNotes) return;
    setIsAuditing(true);
    const result = await analyzeStyleRisk({
      ...selectedSample,
      totalCost: totalUsd
    });
    setAuditResult(result);
    setIsAuditing(false);
  };

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

  const handleInputChange = (field: keyof SampleType, value: any) => {
    if (selectedSample) {
      setSelectedSample({ ...selectedSample, [field]: value });
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
              </div>
              <h4 className="font-bold text-slate-800">Costing Analysis</h4>
              <div className="mt-4 flex justify-between items-end">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${s.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600'}`}>{s.status}</span>
                <span className="text-sm font-black text-slate-900 font-mono">${calculateTotal(s).toFixed(2)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1">
        {selectedSample ? (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden sticky top-24">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{selectedSample.styleNumber}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1 text-indigo-600">Enterprise Tech Pack Auditor Enabled</p>
              </div>
              <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col pr-4 border-r border-slate-100">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Exchange Rate</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-indigo-600">৳</span>
                    <input type="number" className="w-16 bg-transparent border-none p-0 text-sm font-black focus:ring-0 outline-none" value={exchangeRate} onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1)} />
                  </div>
                </div>
                <button onClick={() => setIsBdtInputMode(!isBdtInputMode)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${isBdtInputMode ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {isBdtInputMode ? 'BDT Mode' : 'USD Mode'}
                </button>
              </div>
            </div>

            <div className="p-10 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b-2 border-indigo-100">
                    <Box size={18} className="text-indigo-600" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-indigo-900">Materials</h4>
                  </div>
                  <div className="space-y-4">
                    <SmartCostInput value={selectedSample.yarnRequiredLbs} onChange={(v) => handleInputChange('yarnRequiredLbs', v)} exchangeRate={exchangeRate} isBdtMode={false} isCurrency={false} prefix="lb" />
                    <SmartCostInput value={selectedSample.yarnPricePerLbs} onChange={(v) => handleInputChange('yarnPricePerLbs', v)} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b-2 border-purple-100">
                    <Scissors size={18} className="text-purple-600" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-purple-900">Secondary Process</h4>
                  </div>
                  <div className="space-y-4">
                    <SmartCostInput value={selectedSample.linkingCost} onChange={(v) => handleInputChange('linkingCost', v)} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} prefix="LNK" />
                    <SmartCostInput value={selectedSample.trimmingCost} onChange={(v) => handleInputChange('trimmingCost', v)} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} prefix="TRM" />
                    <SmartCostInput value={selectedSample.mendingCost} onChange={(v) => handleInputChange('mendingCost', v)} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} prefix="MND" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-3 border-b-2 border-emerald-100">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-emerald-900">Finishing Detail</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <SmartCostInput value={selectedSample.sewingCosting} onChange={(v) => handleInputChange('sewingCosting', v)} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} prefix="SEW" />
                    <SmartCostInput value={selectedSample.washingCost} onChange={(v) => handleInputChange('washingCost', v)} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} prefix="WSH" />
                    <SmartCostInput value={selectedSample.others1} onChange={(v) => handleInputChange('others1', v)} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} prefix="OT1" />
                    <SmartCostInput value={selectedSample.others2} onChange={(v) => handleInputChange('others2', v)} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} prefix="OT2" />
                  </div>
                </div>
              </div>

              {/* Enterprise Feature: AI Risk Auditor */}
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 p-8 opacity-5"><BrainCircuit size={160} /></div>
                <div className="relative z-10">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                      <div>
                        <h4 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                          <BrainCircuit className="text-indigo-400" /> AI Production Guardrail
                        </h4>
                        <p className="text-slate-400 text-sm mt-1">Intelligent Tech-Pack audit based on construction complexity</p>
                      </div>
                      <button 
                        onClick={runAudit}
                        disabled={isAuditing || !selectedSample.constructionNotes}
                        className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all disabled:opacity-50"
                      >
                        {isAuditing ? <Loader2 size={18} className="animate-spin" /> : <><Zap size={16} /> Audit Tech Pack</>}
                      </button>
                   </div>

                   {!auditResult ? (
                     <div className="p-8 border-2 border-dashed border-white/10 rounded-3xl text-center text-slate-500">
                        <p className="text-sm font-medium">Input Construction Details below to enable risk forecasting.</p>
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="space-y-4">
                           <div className="flex justify-between items-end mb-2">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculated Risk Profile</span>
                             <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${
                               auditResult.riskLevel === 'High' ? 'bg-rose-500 text-white' : 
                               auditResult.riskLevel === 'Medium' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                             }`}>{auditResult.riskLevel} RISK</span>
                           </div>
                           <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-1000 ${
                                auditResult.riskLevel === 'High' ? 'bg-rose-500' : 
                                auditResult.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} style={{ width: `${auditResult.riskScore}%` }}></div>
                           </div>
                           <div className="space-y-2 mt-6">
                              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Technical Alerts</p>
                              {auditResult.technicalAlerts.map((a: string, i: number) => (
                                <div key={i} className="flex gap-2 text-xs text-slate-300">
                                  <AlertCircle size={14} className="text-rose-400 shrink-0" /> {a}
                                </div>
                              ))}
                           </div>
                        </div>
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                           <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">Guardrail Mitigation Steps</p>
                           <ul className="space-y-3">
                              {auditResult.mitigationSteps.map((s: string, i: number) => (
                                <li key={i} className="flex items-start gap-3 text-xs text-slate-400 font-medium">
                                   <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" /> {s}
                                </li>
                              ))}
                           </ul>
                        </div>
                     </div>
                   )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <ClipboardList size={16} className="text-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Construction Details (Audit Input)</span>
                  </div>
                  <textarea 
                    className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none min-h-[140px]"
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
                    className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-medium focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none min-h-[140px]"
                    placeholder="Mention custom labeling or carton configurations..."
                    value={selectedSample.packagingNotes || ''}
                    onChange={(e) => handleInputChange('packagingNotes', e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-16 bg-white rounded-[2.5rem] border border-slate-200 p-10 flex flex-col md:flex-row justify-between items-center gap-10">
                <div>
                  <p className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Standard Unit Costing</p>
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-6xl font-black text-slate-900 tracking-tighter">${totalUsd.toFixed(2)}</h2>
                    <span className="text-slate-400 text-xl font-bold uppercase">USD</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Local Estimated Value</p>
                  <h3 className="text-4xl font-black text-indigo-600 font-mono">৳{totalBdt.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-24 text-center">
            <h3 className="text-2xl font-black text-slate-400">Registry Empty</h3>
            <button onClick={() => setIsAdding(true)} className="mt-6 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs">Create New Development Record</button>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-8 bg-indigo-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">New Tech Costing</h3>
                <p className="text-[10px] text-indigo-300 font-black uppercase mt-1">Master Development Primary Entry</p>
              </div>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={28} /></button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
              <div className="bg-indigo-50/50 p-8 rounded-[2rem] border border-indigo-100 grid grid-cols-2 gap-8 shadow-sm">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-3">Style Identity</label>
                  <input required autoFocus type="text" className="w-full px-5 py-4 border border-indigo-200 rounded-2xl outline-none text-sm font-bold uppercase" placeholder="e.g. SN-WINTER-2025" value={newSample.styleNumber} onChange={(e) => setNewSample({...newSample, styleNumber: e.target.value})} />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-3">Yarn Type</label>
                  <input type="text" className="w-full px-5 py-4 border border-indigo-200 rounded-2xl text-sm font-bold" value={newSample.yarnType || ''} onChange={(e) => setNewSample({...newSample, yarnType: e.target.value})} placeholder="e.g. Cotton" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <div className="space-y-6">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-3">Raw Sourcing</h4>
                   <div className="space-y-4">
                     <SmartCostInput value={newSample.yarnRequiredLbs!} onChange={(v) => setNewSample({...newSample, yarnRequiredLbs: v})} exchangeRate={exchangeRate} isBdtMode={false} isCurrency={false} prefix="lb" />
                     <SmartCostInput value={newSample.yarnPricePerLbs!} onChange={(v) => setNewSample({...newSample, yarnPricePerLbs: v})} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} />
                   </div>
                 </div>
                 
                 <div className="space-y-6">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-3">Machine Process</h4>
                   <div className="space-y-4">
                     <SmartCostInput value={newSample.knittingTime!} onChange={(v) => setNewSample({...newSample, knittingTime: v})} exchangeRate={exchangeRate} isBdtMode={false} isCurrency={false} prefix="min" />
                     <SmartCostInput value={newSample.knittingCost!} onChange={(v) => setNewSample({...newSample, knittingCost: v})} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} />
                   </div>
                 </div>

                 <div className="space-y-6">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-3">Secondary</h4>
                   <div className="space-y-4">
                     <SmartCostInput value={newSample.linkingCost!} onChange={(v) => setNewSample({...newSample, linkingCost: v})} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} prefix="LNK" />
                     <SmartCostInput value={newSample.trimmingCost!} onChange={(v) => setNewSample({...newSample, trimmingCost: v})} exchangeRate={exchangeRate} isBdtMode={isBdtInputMode} isCurrency={true} prefix="TRM" />
                   </div>
                 </div>
              </div>

              <div className="bg-slate-50 p-10 rounded-[3rem] text-slate-800 flex justify-between items-center border border-slate-200">
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Projected Unit Cost</p>
                  <h2 className="text-5xl font-black text-indigo-600 tracking-tighter">${calculateTotal(newSample).toFixed(2)}</h2>
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
