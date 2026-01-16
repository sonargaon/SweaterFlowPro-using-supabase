
import React, { useState, useMemo } from 'react';
import { ProductionOrder, Transaction, PurchaseOrder, InspectionRecord, Customer, Supplier, SampleDevelopment, LinkingRecord, Department } from '../types';
import { 
  BarChart3, Search, Tag, DollarSign, Package, CheckCircle2, AlertCircle, 
  TrendingUp, TrendingDown, Factory, ShoppingCart, Truck, Wallet, FileText, Activity, ChevronDown, Calculator, FlaskConical, Printer, X, Eye, FileOutput, ArrowDown, Scissors, Layers, Zap, Info, Box, ClipboardCheck, Ghost
} from 'lucide-react';

interface ReportManagerProps {
  orders: ProductionOrder[];
  transactions: Transaction[];
  purchases: PurchaseOrder[];
  inspections: InspectionRecord[];
  customers: Customer[];
  suppliers: Supplier[];
  samples: SampleDevelopment[];
  linkingRecords: LinkingRecord[];
}

export const ReportManager: React.FC<ReportManagerProps> = ({ 
  orders, 
  transactions, 
  purchases, 
  inspections,
  customers,
  suppliers,
  samples,
  linkingRecords
}) => {
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const allStyles = useMemo(() => {
    return Array.from(new Set(orders.map(o => o.style))).sort();
  }, [orders]);

  const activeStyles = useMemo(() => {
    return Array.from(new Set(
      orders
        .filter(o => o.status === 'in-progress' || o.status === 'pending')
        .map(o => o.style)
    )).sort();
  }, [orders]);

  const filteredStyles = useMemo(() => {
    return allStyles.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [allStyles, searchTerm]);

  const styleReport = useMemo(() => {
    if (!selectedStyle) return null;

    const styleOrders = orders.filter(o => o.style === selectedStyle);
    const styleInspections = inspections.filter(i => i.styleNumber === selectedStyle);
    const styleLinking = linkingRecords.filter(l => l.styleNumber === selectedStyle);
    const stylePurchases = purchases.filter(p => p.styleNumber === selectedStyle);
    const styleSample = samples.find(s => s.styleNumber === selectedStyle);

    // 1. Sales Target
    const targetQty = styleOrders.reduce((sum, o) => sum + o.quantity, 0);
    
    // 2. Yarn Stage (Wastage)
    const consumption = styleSample?.yarnRequiredLbs || 0;
    const totalYarnReceived = stylePurchases
      .filter(p => p.itemType === 'Yarn')
      .reduce((sum, p) => sum + p.quantity, 0);
    
    // 3. Knitting Stage
    // We assume knitting production records are orders with no customerId or matching style in Knitting Dept
    const knittingProduced = orders
      .filter(o => o.style === selectedStyle && o.currentDepartment === Department.KNITTING)
      .reduce((sum, o) => sum + o.quantity, 0);

    // 4. Inspection Stage (Knitting QC)
    // Filter records where operatorId is not the FINAL-QC tag
    const knitInspections = styleInspections.filter(i => i.operatorId !== 'FINAL-QC');
    const knitPassed = knitInspections.reduce((sum, i) => sum + i.qualityPassed, 0);
    const knitRejected = knitInspections.reduce((sum, i) => sum + i.rejected, 0);

    // 5. Linking Stage
    const linkingFinished = styleLinking.reduce((sum, l) => sum + l.completedQty, 0);
    const linkingRejected = styleLinking.reduce((sum, l) => sum + Math.max(0, l.operatorCompletedQty - l.completedQty), 0);

    // 6. Finishing & QC Passed Summary
    const finalQCRecords = styleInspections.filter(i => i.operatorId === 'FINAL-QC');
    const finalPassed = finalQCRecords.reduce((sum, i) => sum + i.qualityPassed, 0);
    const finalRejected = finalQCRecords.reduce((sum, i) => sum + i.rejected, 0);

    // Total Efficiency Calculations
    const globalEfficiency = targetQty > 0 ? (finalPassed / targetQty) * 100 : 0;
    const totalLostUnits = knitRejected + linkingRejected + finalRejected;
    
    const projectedYarnUsed = finalPassed * consumption;
    const yarnWastageLbs = Math.max(0, totalYarnReceived - projectedYarnUsed);
    const yarnWastagePercent = totalYarnReceived > 0 ? (yarnWastageLbs / totalYarnReceived) * 100 : 0;

    const unitCost = styleSample ? (
      (styleSample.yarnRequiredLbs * styleSample.yarnPricePerLbs) + 
      styleSample.knittingCost + styleSample.linkingCost + styleSample.trimmingMendingCost +
      styleSample.washingCost + styleSample.sewingCosting + styleSample.overheadCost
    ) : 0;

    const rejectionCostImpact = totalLostUnits * unitCost;

    return {
      style: selectedStyle,
      sample: styleSample,
      pipeline: {
        targetQty,
        knittingProduced,
        knitPassed,
        knitRejected,
        linkingFinished,
        linkingRejected,
        finalPassed,
        finalRejected,
        totalLostUnits,
        globalEfficiency
      },
      wastage: {
        totalYarnReceived,
        projectedYarnUsed,
        yarnWastageLbs,
        yarnWastagePercent
      },
      financials: {
        unitCost,
        rejectionCostImpact
      }
    };
  }, [selectedStyle, orders, inspections, linkingRecords, purchases, samples]);

  const triggerSystemPrint = () => {
    window.print();
  };

  const ReportBody = ({ isPdf = false }: { isPdf?: boolean }) => {
    if (!styleReport) return null;
    
    const p = styleReport.pipeline;
    const w = styleReport.wastage;
    const f = styleReport.financials;

    return (
      <div className={`space-y-8 ${isPdf ? 'bg-white p-0' : ''}`}>
        {/* Print Header */}
        <div className={`${isPdf ? 'flex' : 'hidden print:flex'} items-center justify-between mb-8 border-b-2 border-slate-900 pb-4`}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 text-white rounded-xl">
              <BarChart3 size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Process Efficiency Audit</h1>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">SweaterFlow Pro ERP • Loss Identification Protocol</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-black uppercase text-indigo-600">Style: {styleReport.style}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Report Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Global Performance Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print-break-inside-avoid">
          <div className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={60} /></div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Plant Efficiency</p>
            <div className="flex items-baseline gap-2">
              <h4 className="text-5xl font-black">{p.globalEfficiency.toFixed(1)}%</h4>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Final Shipments vs Sales Order</p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Rejected Value (Est.)</p>
            <h4 className="text-4xl font-black text-slate-800">${f.rejectionCostImpact.toLocaleString()}</h4>
            <p className="text-xs text-slate-500 mt-2 font-medium uppercase tracking-tight">Direct Loss Across All Stages</p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Yarn Wastage</p>
            <h4 className="text-4xl font-black text-slate-800">{w.yarnWastagePercent.toFixed(1)}%</h4>
            <p className="text-xs text-slate-500 mt-2 font-medium uppercase tracking-tight">{w.yarnWastageLbs.toFixed(1)} LBS Surplus/Waste</p>
          </div>
        </div>

        {/* REFACTORED PRODUCTION LOSS FUNNEL */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 print-break-inside-avoid">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm flex items-center gap-2">
              <Layers size={18} className="text-indigo-600" /> Production Loss Funnel (End-to-End)
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-black text-slate-400 uppercase">Passed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="text-[10px] font-black text-slate-400 uppercase">Damage / Rejected</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 max-w-3xl mx-auto">
            
            {/* Sales Order Start */}
            <div className="bg-slate-100 p-5 rounded-2xl border-2 border-dashed border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white rounded-xl shadow-sm text-slate-600"><ShoppingCart size={18}/></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Input Requirement</p>
                  <p className="text-base font-black text-slate-800 uppercase">Sales Order Target</p>
                </div>
              </div>
              <p className="text-xl font-black text-slate-900">{p.targetQty} <span className="text-xs font-bold text-slate-400">PCS</span></p>
            </div>
            <div className="flex justify-center"><ArrowDown size={20} className="text-slate-300" /></div>

            {/* Stage: Yarn */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-blue-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600"><Box size={18}/></div>
                <div className="min-w-[120px]">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Material</p>
                  <p className="text-base font-black text-slate-800 uppercase">Yarn Sourcing</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-black text-amber-500 uppercase">Wastage</p>
                  <p className="text-sm font-black text-amber-600">{(w.yarnWastagePercent).toFixed(1)}%</p>
                </div>
                <div className="w-px h-8 bg-slate-100"></div>
                <div className="text-right min-w-[80px]">
                  <p className="text-[10px] font-black text-emerald-500 uppercase">Received</p>
                  <p className="text-sm font-black text-emerald-600">{w.totalYarnReceived.toLocaleString()} <span className="text-[9px]">LBS</span></p>
                </div>
              </div>
            </div>
            <div className="flex justify-center"><ArrowDown size={20} className="text-slate-300" /></div>

            {/* Stage: Knitting */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-purple-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600"><Layers size={18}/></div>
                <div className="min-w-[120px]">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Process</p>
                  <p className="text-base font-black text-slate-800 uppercase">Knitting</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-black text-rose-500 uppercase">Dropped</p>
                  <p className="text-sm font-black text-rose-600">-{p.knittingProduced > 0 ? (p.knittingProduced - p.knitPassed - p.knitRejected) : 0}</p>
                </div>
                <div className="w-px h-8 bg-slate-100"></div>
                <div className="text-right min-w-[80px]">
                  <p className="text-[10px] font-black text-emerald-500 uppercase">Produced</p>
                  <p className="text-sm font-black text-emerald-600">{p.knittingProduced} <span className="text-[9px]">PCS</span></p>
                </div>
              </div>
            </div>
            <div className="flex justify-center"><ArrowDown size={20} className="text-slate-300" /></div>

            {/* Stage: Inspection */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-amber-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600"><Search size={18}/></div>
                <div className="min-w-[120px]">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quality Control</p>
                  <p className="text-base font-black text-slate-800 uppercase">Inspection</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-black text-rose-500 uppercase">Rejected</p>
                  <p className="text-sm font-black text-rose-600">-{p.knitRejected}</p>
                </div>
                <div className="w-px h-8 bg-slate-100"></div>
                <div className="text-right min-w-[80px]">
                  <p className="text-[10px] font-black text-emerald-500 uppercase">Passed</p>
                  <p className="text-sm font-black text-emerald-600">{p.knitPassed} <span className="text-[9px]">PCS</span></p>
                </div>
              </div>
            </div>
            <div className="flex justify-center"><ArrowDown size={20} className="text-slate-300" /></div>

            {/* Stage: Linking */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-rose-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600"><Scissors size={18}/></div>
                <div className="min-w-[120px]">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assembly</p>
                  <p className="text-base font-black text-slate-800 uppercase">Linking</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-black text-rose-500 uppercase">Damage</p>
                  <p className="text-sm font-black text-rose-600">-{p.linkingRejected}</p>
                </div>
                <div className="w-px h-8 bg-slate-100"></div>
                <div className="text-right min-w-[80px]">
                  <p className="text-[10px] font-black text-emerald-500 uppercase">Assembled</p>
                  <p className="text-sm font-black text-emerald-600">{p.linkingFinished} <span className="text-[9px]">PCS</span></p>
                </div>
              </div>
            </div>
            <div className="flex justify-center"><ArrowDown size={20} className="text-slate-300" /></div>

            {/* Stage: Finishing */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-emerald-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600"><CheckCircle2 size={18}/></div>
                <div className="min-w-[120px]">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processing</p>
                  <p className="text-base font-black text-slate-800 uppercase">Finishing</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-black text-rose-500 uppercase">Rejected</p>
                  <p className="text-sm font-black text-rose-600">-{p.finalRejected}</p>
                </div>
                <div className="w-px h-8 bg-slate-100"></div>
                <div className="text-right min-w-[80px]">
                  <p className="text-[10px] font-black text-emerald-500 uppercase">Final Output</p>
                  <p className="text-sm font-black text-emerald-600">{p.finalPassed} <span className="text-[9px]">PCS</span></p>
                </div>
              </div>
            </div>
            <div className="flex justify-center"><ArrowDown size={20} className="text-slate-300" /></div>

            {/* Final QC Passed Summary */}
            <div className="bg-emerald-900 p-8 rounded-3xl shadow-xl shadow-emerald-900/20 flex justify-between items-center text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 p-2 opacity-5"><ClipboardCheck size={120} /></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-white/10 rounded-xl"><ClipboardCheck size={24}/></div>
                <div>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Final Milestone</p>
                  <p className="text-xl font-black uppercase">QC Passed Summary</p>
                </div>
              </div>
              <div className="text-right relative z-10">
                <p className="text-[10px] font-black text-emerald-400 uppercase">Ready to Ship</p>
                <p className="text-4xl font-black">{p.finalPassed} <span className="text-sm font-bold opacity-50 uppercase">PCS</span></p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
             <div className="p-2 bg-indigo-600 text-white rounded-lg"><Info size={20} /></div>
             <div>
               <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">Audit Findings</h4>
               <p className="text-xs text-slate-500 leading-relaxed font-medium">
                 {p.knitRejected > p.linkingRejected ? 
                  `Critical Loss Point identified in KNITTING stage (-${p.knitRejected} PCS). Machine maintenance or yarn tension controls may be required.` : 
                  `Critical Loss Point identified in LINKING stage (-${p.linkingRejected} PCS). Operator retraining or seam-check protocols recommended.`
                 } Total yield efficiency is <b>{p.globalEfficiency.toFixed(1)}%</b>.
               </p>
             </div>
          </div>
        </div>

        {/* Material Detail Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print-break-inside-avoid">
           <div className="bg-white rounded-3xl border border-slate-200 p-8">
              <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm mb-6 flex items-center gap-2">
                <Activity size={18} className="text-amber-500" /> Department Loss Detail
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-500">Knitting Rejections</span>
                  <span className="text-sm font-black text-rose-500 font-mono">-{p.knitRejected} PCS</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-500">Linking/Assembly Rejections</span>
                  <span className="text-sm font-black text-rose-500 font-mono">-{p.linkingRejected} PCS</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-500">Finishing QC Rejections</span>
                  <span className="text-sm font-black text-rose-500 font-mono">-{p.finalRejected} PCS</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-sm font-bold text-slate-800 uppercase">Total Inventory Shrinkage</span>
                  <span className="text-sm font-black text-rose-600 font-mono">{p.totalLostUnits} PCS</span>
                </div>
              </div>
           </div>

           <div className="bg-white rounded-3xl border border-slate-200 p-8">
              <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm mb-6 flex items-center gap-2">
                <Calculator size={18} className="text-indigo-600" /> Economic Impact Analysis
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-500">Mfg. Cost per Lost Unit</span>
                  <span className="text-sm font-black text-slate-800 font-mono">${f.unitCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-500">Direct Financial Loss</span>
                  <span className="text-sm font-black text-rose-600 font-mono">${f.rejectionCostImpact.toLocaleString()}</span>
                </div>
                <div className="pt-4 mt-2">
                   <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yield Health Index</p>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${p.globalEfficiency > 95 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {p.globalEfficiency > 95 ? 'Optimal' : 'Needs Control'}
                      </span>
                   </div>
                   <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${p.globalEfficiency > 95 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${p.globalEfficiency}%` }}></div>
                   </div>
                </div>
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="hidden print:block pt-8 border-t border-slate-100 mt-12 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">SweaterFlow Intelligence Protocol • Audit Node</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 pb-20">
      <style>{`
        @media print {
          html, body, #root, main, .max-w-7xl, .space-y-8 {
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            position: static !important;
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          aside, header, nav, .print-hidden, .modal-backdrop { 
            display: none !important; 
          }
          .modal-content {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .print-break-inside-avoid { 
            page-break-inside: avoid; 
            break-inside: avoid;
          }
        }
      `}</style>

      {/* Control Panel */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 print-hidden">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200">
            <BarChart3 size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Style Intelligence</h2>
            <p className="text-slate-500 text-sm font-medium">Process Efficiency & Departmental Loss Audit</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative min-w-[220px]">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Select Production Style</label>
            <div className="relative group">
              <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
              <select 
                className="w-full pl-11 pr-10 py-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all appearance-none cursor-pointer uppercase text-emerald-700"
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
              >
                <option value="">Quick Select Style...</option>
                {activeStyles.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="relative w-full sm:w-64">
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Search Database</label>
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text"
                  placeholder="SN-STYLE-NUMBER..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all uppercase"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
        </div>
      </div>

      {!styleReport ? (
        <div className="h-96 bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-20 text-center text-slate-400 print-hidden">
           <Ghost size={64} className="mb-4 opacity-10" />
           <h3 className="text-xl font-bold text-slate-500 uppercase tracking-widest">Awaiting Style Selection</h3>
           <p className="text-sm max-w-xs mx-auto mt-2">Choose a style to visualize the production loss pipeline and department efficiency scores.</p>
        </div>
      ) : (
        <div className="space-y-8 animate-in zoom-in-95 duration-300">
          <div className="flex justify-end print-hidden">
             <button 
               onClick={() => setShowPrintPreview(true)}
               className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
             >
               <Eye size={16} /> Preview Audit Report (PDF)
             </button>
          </div>
          
          <ReportBody />
        </div>
      )}

      {/* PDF PREVIEW MODAL */}
      {showPrintPreview && styleReport && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/90 backdrop-blur-xl modal-backdrop">
           <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-white/10 print-hidden">
              <div className="flex items-center gap-4">
                 <div className="p-2 bg-indigo-600 rounded-lg"><FileOutput size={20} /></div>
                 <div>
                    <h3 className="text-sm font-black uppercase tracking-widest">Efficiency Audit Preview</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Ready for Loss Identification Management</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <button 
                    onClick={triggerSystemPrint}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg active:scale-95"
                 >
                    <Printer size={16} /> Finalize & Print PDF
                 </button>
                 <button 
                    onClick={() => setShowPrintPreview(false)}
                    className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                 >
                    <X size={20} />
                 </button>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-4 sm:p-12 lg:p-20 bg-slate-800/50 flex justify-center scrollbar-hide">
              <div className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl rounded-sm p-[20mm] modal-content relative overflow-visible">
                 <ReportBody isPdf={true} />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
