

import React, { useState } from 'react';
import { Terminal, Copy, CheckCircle2, Database, ShieldAlert, Code2 } from 'lucide-react';
// Added import for isSupabaseConfigured to fix reference errors
import { isSupabaseConfigured } from '../lib/supabase';

export const SystemSetup: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const sqlSchema = `-- INITIALIZE SWEATERFLOW PRO DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor

-- 1. Profiles (User Identity)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'User',
  department TEXT DEFAULT 'All',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Customers & Suppliers
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  total_orders INTEGER DEFAULT 0,
  balance NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  category TEXT,
  balance NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Production Orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL,
  customer_id TEXT REFERENCES customers(id),
  style TEXT NOT NULL,
  color TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  unit_price NUMERIC DEFAULT 0,
  current_department TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  start_date DATE,
  due_date DATE,
  yarn_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Sample Development (R&D Costing)
CREATE TABLE IF NOT EXISTS samples (
  id TEXT PRIMARY KEY,
  style_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'draft',
  yarn_type TEXT,
  yarn_count TEXT,
  yarn_required_lbs NUMERIC DEFAULT 0,
  yarn_price_per_lbs NUMERIC DEFAULT 0,
  knitting_time INTEGER DEFAULT 0,
  knitting_cost NUMERIC DEFAULT 0,
  linking_cost NUMERIC DEFAULT 0,
  trimming_mending_cost NUMERIC DEFAULT 0,
  sewing_costing NUMERIC DEFAULT 0,
  washing_cost NUMERIC DEFAULT 0,
  pqc_costing NUMERIC DEFAULT 0,
  iron_costing NUMERIC DEFAULT 0,
  getup_costing NUMERIC DEFAULT 0,
  packing_costing NUMERIC DEFAULT 0,
  boiler_gas NUMERIC DEFAULT 0,
  overhead_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Financial Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  type TEXT NOT NULL, -- receipt / payment
  entity_id TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  method TEXT,
  reference TEXT,
  style_numbers TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Quality Control & Production Logs
CREATE TABLE IF NOT EXISTS inspections (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  operator_id TEXT,
  machine_no TEXT,
  buyer_name TEXT,
  style_number TEXT,
  color TEXT,
  total_delivered INTEGER DEFAULT 0,
  quality_passed INTEGER DEFAULT 0,
  rejected INTEGER DEFAULT 0,
  rejection_rate NUMERIC,
  order_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS linking (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  operator_id TEXT,
  buyer_name TEXT,
  style_number TEXT,
  order_number TEXT,
  color TEXT,
  total_quantity INTEGER,
  operator_completed_qty INTEGER,
  completed_qty INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Procurement
CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  po_number TEXT NOT NULL,
  supplier_id TEXT REFERENCES suppliers(id),
  item_type TEXT,
  description TEXT,
  quantity NUMERIC,
  unit TEXT,
  total_amount NUMERIC,
  status TEXT,
  date DATE,
  style_number TEXT,
  color TEXT,
  lot_number TEXT,
  rate_per_unit NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 bg-slate-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 p-4 opacity-5"><Database size={100} /></div>
        <div className="p-4 bg-indigo-600 rounded-2xl">
          <Terminal size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">System Infrastructure Setup</h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Configure your Supabase Cloud Database for live manufacturing production.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Code2 size={18} className="text-indigo-600" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-800">PostgreSQL Schema (Initialization)</span>
              </div>
              <button 
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                {copied ? 'Copied to Clipboard' : 'Copy SQL Script'}
              </button>
            </div>
            <div className="p-6 bg-slate-950">
              <pre className="text-[11px] font-mono text-indigo-300 overflow-x-auto leading-relaxed h-[400px] custom-scrollbar">
                {sqlSchema}
              </pre>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-100 p-8 rounded-3xl space-y-4">
            <div className="p-3 bg-amber-500 text-white rounded-2xl w-fit shadow-lg shadow-amber-500/20">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-lg font-black text-amber-900 uppercase tracking-tight">Required Steps</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">1</div>
                <p className="text-xs font-bold text-amber-800 leading-relaxed">Login to your <a href="https://supabase.com" target="_blank" className="underline font-black">Supabase Dashboard</a> and create a new project.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">2</div>
                <p className="text-xs font-bold text-amber-800 leading-relaxed">Go to the **SQL Editor** tab and paste the script shown on the left.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">3</div>
                <p className="text-xs font-bold text-amber-800 leading-relaxed">Ensure **Email Auth** is enabled under the Authentication section.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">4</div>
                <p className="text-xs font-bold text-amber-800 leading-relaxed">Set your `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the environment settings.</p>
              </li>
            </ul>
          </div>
          
          <div className="bg-indigo-900 p-8 rounded-3xl text-white relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Database size={80} /></div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-4">Cloud Status</h4>
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'bg-slate-500'}`}></div>
              <p className="text-xs font-bold">{isSupabaseConfigured ? 'Production Live' : 'Disconnected (Local)'}</p>
            </div>
            <p className="text-[10px] text-indigo-300 font-medium mt-4 leading-relaxed">
              Once connected, mock data will be hidden and the system will pull from your real encrypted database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};