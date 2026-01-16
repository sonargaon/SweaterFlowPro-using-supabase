
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line
} from 'recharts';
import { StatCard } from './StatCard';
import { Activity, Clock, Package, CheckCircle, BrainCircuit } from 'lucide-react';
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
        <StatCard 
          label="Total Orders" 
          value={orders.length} 
          icon={<Package size={24} />} 
          colorClass="bg-blue-600" 
          change="+12%"
        />
        <StatCard 
          label="Active Production" 
          value={orders.filter(o => o.status === 'in-progress').length} 
          icon={<Activity size={24} />} 
          colorClass="bg-indigo-600" 
        />
        <StatCard 
          label="Pending Sync" 
          value="2" 
          icon={<Clock size={24} />} 
          colorClass="bg-amber-600" 
        />
        <StatCard 
          label="Completed Today" 
          value="45" 
          icon={<CheckCircle size={24} />} 
          colorClass="bg-emerald-600" 
          change="+5%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-6">Production Distribution by Department</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BrainCircuit size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit className="text-indigo-400" />
              <h3 className="text-lg font-bold">AI Production Insights</h3>
            </div>
            
            {loadingAi ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                <div className="h-20 bg-slate-700 rounded w-full"></div>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Status Summary</p>
                  <p className="text-sm leading-relaxed">{aiAnalysis.summary}</p>
                </div>
                
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Efficiency Score</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-400" 
                        style={{ width: `${aiAnalysis.efficiencyScore}%` }}
                      ></div>
                    </div>
                    <span className="text-xl font-bold text-emerald-400">{aiAnalysis.efficiencyScore}%</span>
                  </div>
                </div>

                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Bottlenecks</p>
                  <div className="flex flex-wrap gap-2">
                    {aiAnalysis.bottlenecks.map((b: string) => (
                      <span key={b} className="px-2 py-1 bg-rose-500/20 text-rose-300 text-xs rounded border border-rose-500/30">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">Analysis unavailable</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
