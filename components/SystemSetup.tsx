
import React, { useState } from 'react';
import { Terminal, Copy, CheckCircle2, Database, ShieldAlert, Code2 } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export const SystemSetup: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const sqlSchema = `-- ==========================================================
-- SWEATERFLOW PRO: COMPREHENSIVE DEPARTMENTAL SCHEMA
-- ==========================================================
-- Execute this script in your Supabase SQL Editor (SQL Tools)

-- 1. PROFILES & ACCESS CONTROL
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'User',
  department TEXT DEFAULT 'All',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SALES & NETWORK (Customers & Suppliers)
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
  category TEXT, -- 'Yarn' | 'Accessories' | 'General'
  balance NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SALES ORDERS & PRODUCTION TRACKING
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL,
  customer_id TEXT REFERENCES customers(id),
  style TEXT NOT NULL,
  color TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  unit_price NUMERIC DEFAULT 0,
  current_department TEXT NOT NULL, -- Yarn, Knitting, Linking, etc.
  status TEXT DEFAULT 'pending', -- pending, in-progress, completed
  progress INTEGER DEFAULT 0,
  start_date DATE,
  due_date DATE,
  yarn_details JSONB, -- Stores lot#, dyeing factory, requirement
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. R&D COSTING (Sample Development)
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

-- 5. PROCUREMENT (Yarn & Accessories)
CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  po_number TEXT NOT NULL,
  supplier_id TEXT REFERENCES suppliers(id),
  item_type TEXT, -- Yarn | Accessories
  description TEXT,
  quantity NUMERIC,
  unit TEXT, -- lbs | pcs | kg
  total_amount NUMERIC,
  status TEXT, -- ordered | received | paid
  date DATE,
  style_number TEXT,
  color TEXT,
  lot_number TEXT,
  rate_per_unit NUMERIC,
  payment_date DATE,
  payment_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INSPECTION & QUALITY CONTROL (Knitting Dept)
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

-- 7. LINKING DEPARTMENT LOGS
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
  completed_qty INTEGER, -- QC Checked in Linking
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. FINANCE LEDGER
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  type TEXT NOT NULL, -- receipt (from customer) | payment (to supplier)
  entity_id TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  method TEXT, -- Bank, Cash, LC
  reference TEXT,
  style_numbers TEXT[], -- Multi-style tracking
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- AUTO-SYNC PROFILES ON AUTH SIGNUP (OPTIONAL)
-- ==========================================================
-- This trigger automatically creates a profile entry when a user signs up
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS trigger AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, name, email)
--   VALUES (new.id, new.raw_user_meta_data->>'name', new.email);
--   RETURN new;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();`;

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
          <h2 className="text-2xl font-black uppercase tracking-tight">Database Infrastructure Setup</h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Initialize all departmental tables in your Supabase project.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Code2 size={18} className="text-indigo-600" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-800">Master Deployment Script</span>
              </div>
              <button 
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                {copied ? 'Schema Copied' : 'Copy All SQL'}
              </button>
            </div>
            <div className="p-6 bg-slate-950">
              <pre className="text-[11px] font-mono text-indigo-300 overflow-x-auto leading-relaxed h-[500px] custom-scrollbar">
                {sqlSchema}
              </pre>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-100 p-8 rounded-3xl space-y-4">
            <div className="p-3 bg-amber-500 text-white rounded-2xl w-fit shadow-lg">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-lg font-black text-amber-900 uppercase tracking-tight">Deployment Steps</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">1</div>
                <p className="text-xs font-bold text-amber-800 leading-relaxed">Copy the SQL script using the button on the left.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">2</div>
                <p className="text-xs font-bold text-amber-800 leading-relaxed">Open your Supabase Project -> **SQL Editor**.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">3</div>
                <p className="text-xs font-bold text-amber-800 leading-relaxed">Click **"New Query"**, paste the script, and hit **"Run"**.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">4</div>
                <p className="text-xs font-bold text-amber-800 leading-relaxed">Ensure you create your users in the **Authentication** tab for cloud login.</p>
              </li>
            </ul>
          </div>
          
          <div className="bg-indigo-900 p-8 rounded-3xl text-white relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-10"><Database size={80} /></div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-4">Cloud Health</h4>
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'bg-slate-500'}`}></div>
              <p className="text-xs font-bold">{isSupabaseConfigured ? 'Connected to Project ufysppbr...' : 'Disconnected'}</p>
            </div>
            <p className="text-[10px] text-indigo-300 font-medium mt-4 leading-relaxed">
              Once tables are created, all manufacturing modules will sync with your live database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
