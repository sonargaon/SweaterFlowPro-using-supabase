import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { StatCard } from './StatCard';
import { Activity, Clock, Package, CheckCircle, BrainCircuit, Loader2 } from 'lucide-react';
import { ProductionOrder, Department } from '../types';
import { analyzeProductionData } from '../services/geminiService';

interface DashboardProps {
  orders: ProductionOrder[];
}

export const Dashboard: React.FC<DashboardProps> = ({ orders }) => {
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const getAnalysis = async () => {
      setLoadingAi(true);
      const data = await analyzeProductionData(orders);
      setAiAnalysis(data);
      setLoadingAi(false);
    };
    getAnalysis();
  }, [orders]);

  const departmentData = Object.values(Department).map(dept => ({
    name: dept,
    count: orders.filter(o => o.currentDepartment === dept).length
  }));

  const COLORS = ['#3b82f6', '#6366f1', '#a855f7', '#f59e0b', '#f43f5e', '#10b981'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Orders" value={orders.length} icon={<Package size={24} />} colorClass="bg-blue-600" change="+12%" />
        <StatCard label="Active Production" value={orders.filter(o => o.status === 'in-progress').length} icon={<Activity size={24} />} colorClass="bg-indigo-600" />
        <StatCard label="Pending Sync" value="2" icon={<Clock size={24} />} colorClass="bg-amber-600" />
        <StatCard label="Completed Today" value="45" icon={<CheckCircle size={24} />} colorClass="bg-emerald-600" change="+5%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-6">Production Distribution</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                  {departmentData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><BrainCircuit size={120} /></div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="text-indigo-400" size={20} />
                <h3 className="text-sm font-black uppercase tracking-widest">AI Intelligence</h3>
              </div>
            </div>
            
            {loadingAi ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-3/4"></div>
                <div className="h-20 bg-white/5 rounded w-full"></div>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-4">
                <div>
                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Executive Summary</p>
                  <p className="text-xs leading-relaxed text-slate-300 italic">"{aiAnalysis.summary}"</p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Efficiency</p>
                    <span className="text-xs font-black text-emerald-400">{aiAnalysis.efficiencyScore}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${aiAnalysis.efficiencyScore}%` }}></div>
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-2">Department Alerts</p>
                  <div className="flex flex-wrap gap-2">
                    {aiAnalysis.bottlenecks.map((b: string) => (
                      <span key={b} className="px-2 py-1 bg-rose-500/10 text-rose-400 text-[9px] font-black rounded border border-rose-500/20 uppercase tracking-tighter">
                        {b} Critical
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">AI analysis not available at the moment.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};