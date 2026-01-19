
import React, { useState, useEffect } from 'react';
import { Customer, Supplier } from '../types';
import { Users, Truck, Mail, Phone, MapPin, DollarSign, Plus, X, Tag, User, Briefcase } from 'lucide-react';

interface EntityManagerProps {
  initialView?: 'customers' | 'suppliers';
  customers: Customer[];
  suppliers: Supplier[];
  onAddCustomer: (customer: Customer) => void;
  onAddSupplier: (supplier: Supplier) => void;
}

export const EntityManager: React.FC<EntityManagerProps> = ({ initialView = 'customers', customers, suppliers, onAddCustomer, onAddSupplier }) => {
  const [view, setView] = useState<'customers' | 'suppliers'>(initialView);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  // New Entity States
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    totalOrders: 0,
    balance: 0
  });

  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: '',
    contactPerson: '',
    category: 'Yarn',
    balance: 0
  });

  const handleEntitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (view === 'customers') {
      const customer: Customer = {
        ...newCustomer as Customer,
        id: `CST-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        totalOrders: 0,
        balance: 0
      };
      onAddCustomer(customer);
      setNewCustomer({ name: '', email: '', phone: '', address: '', totalOrders: 0, balance: 0 });
    } else {
      const supplier: Supplier = {
        ...newSupplier as Supplier,
        id: `SUP-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        balance: 0
      };
      onAddSupplier(supplier);
      setNewSupplier({ name: '', contactPerson: '', category: 'Yarn', balance: 0 });
    }
    setIsModalOpen(false);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="inline-flex bg-slate-200 p-1 rounded-xl">
          <button 
            onClick={() => setView('customers')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'customers' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Users size={18} /> Customers
          </button>
          <button 
            onClick={() => setView('suppliers')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'suppliers' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Truck size={18} /> Suppliers
          </button>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus size={18} />
          <span>Add New {view === 'customers' ? 'Customer' : 'Supplier'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {view === 'customers' ? (
          customers.map(c => (
            <div key={c.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl">
                  {c.name.charAt(0)}
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Outstanding</p>
                  <p className="text-lg font-bold text-rose-500">${c.balance.toLocaleString()}</p>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{c.name}</h3>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-slate-500"><Mail size={14} /> {c.email}</div>
                <div className="flex items-center gap-2 text-xs text-slate-500"><Phone size={14} /> {c.phone}</div>
                <div className="flex items-center gap-2 text-xs text-slate-500"><MapPin size={14} /> {c.address}</div>
              </div>
              <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Orders: <b className="text-slate-700">{c.totalOrders}</b></span>
                <button className="text-indigo-600 font-bold hover:underline">View History</button>
              </div>
            </div>
          ))
        ) : (
          suppliers.map(s => (
            <div key={s.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xl">
                  {s.name.charAt(0)}
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Total Payable</p>
                  <p className="text-lg font-bold text-blue-600">${s.balance.toLocaleString()}</p>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">{s.name}</h3>
              <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-4">{s.category} Supplier</p>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
                <User size={16} className="text-slate-400" />
                Contact: {s.contactPerson}
              </div>
              <div className="pt-4 border-t border-slate-50 flex justify-end gap-3">
                <button className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-xs font-bold hover:bg-slate-200">History</button>
                <button className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700 shadow-sm">Pay Now</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Entity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`p-6 bg-slate-900 text-white flex justify-between items-center`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg">
                  {view === 'customers' ? <Users size={20} /> : <Truck size={20} />}
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight">Add New {view === 'customers' ? 'Customer' : 'Supplier'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleEntitySubmit} className="p-8 space-y-6">
              {view === 'customers' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <User size={12} /> Company Name
                    </label>
                    <input 
                      required
                      autoFocus
                      type="text" 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold"
                      placeholder="e.g. Nordic Knits Co."
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Mail size={12} /> Email
                    </label>
                    <input 
                      required
                      type="email" 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold"
                      placeholder="contact@company.com"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Phone size={12} /> Phone
                    </label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold"
                      placeholder="+1 234 567 890"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <MapPin size={12} /> Address
                    </label>
                    <textarea 
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold resize-none h-24"
                      placeholder="Full business address..."
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Briefcase size={12} /> Supplier Name
                    </label>
                    <input 
                      required
                      autoFocus
                      type="text" 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold"
                      placeholder="e.g. Global Yarn Hub"
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <User size={12} /> Contact Person
                    </label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold"
                      placeholder="John Doe"
                      value={newSupplier.contactPerson}
                      onChange={(e) => setNewSupplier({...newSupplier, contactPerson: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Tag size={12} /> Category
                    </label>
                    <select 
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold bg-white"
                      value={newSupplier.category}
                      onChange={(e) => setNewSupplier({...newSupplier, category: e.target.value as any})}
                    >
                      <option value="Yarn">Yarn</option>
                      <option value="Accessories">Accessories</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all"
                >
                  Save {view === 'customers' ? 'Customer' : 'Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
