
import React, { useState } from 'react';
import { CloudSync, Lock, Mail, ArrowRight, AlertCircle, Loader2, AlertTriangle, KeyRound, ArrowLeft, CheckCircle2, UserCog } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MOCK_USERS } from '../constants';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (isResetMode) {
      handleResetPassword();
      return;
    }

    // Step 1: Mock Credentials check
    const mockUser = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (mockUser) {
      onLogin(mockUser);
      setIsLoading(false);
      return;
    }

    // Step 2: Supabase Auth check
    if (isSupabaseConfigured) {
      try {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          setError(authError.message === 'Invalid login credentials' ? 'Invalid credentials. Please verify your email and secret key.' : authError.message);
        } else if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          if (profile) {
            onLogin(profile);
          } else {
            onLogin({
              id: data.user.id,
              name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Cloud Admin',
              email: data.user.email || '',
              role: data.user.email === 'super@sweaterflow.com' ? UserRole.SUPER_ADMIN : UserRole.USER,
              department: 'All'
            });
          }
        }
      } catch (err) {
        setError('Connection error. Ensure your terminal is online.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('System restricted. Contact IT Support.');
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (isSupabaseConfigured) {
      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
        if (resetError) setError(resetError.message);
        else setSuccess('Access recovery instructions sent to your work email.');
      } catch (err) {
        setError('Failed to initiate cloud recovery.');
      } finally {
        setIsLoading(false);
      }
    } else {
      const user = MOCK_USERS.find(u => u.email === email);
      if (user) setSuccess(`DEMO MODE: Password is "${user.password}"`);
      else setError('Work email not found in local registry.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-indigo-600 rounded-[2rem] shadow-2xl mb-6">
            <CloudSync size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">SweaterFlow<span className="text-indigo-500 italic">PRO</span></h1>
          <p className="text-slate-400 font-medium uppercase tracking-[0.2em] text-[10px]">
            {isSupabaseConfigured ? 'Enterprise Manufacturing Node' : 'Demo Terminal Mode'}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="mb-8">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">
              {isResetMode ? 'Security Recovery' : 'Workforce Login'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium italic">
              {isResetMode ? 'Enter email to receive recovery instructions.' : 'Access the factory floor control system.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Work Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  required
                  type="email" 
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-indigo-500 focus:bg-white/10 transition-all"
                  placeholder="name@factory.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {!isResetMode && (
              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Secret Key</label>
                  <button type="button" onClick={() => setIsResetMode(true)} className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest">Forgot Key?</button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input 
                    required={!isResetMode}
                    type="password" 
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-indigo-500 focus:bg-white/10 transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            {isResetMode && (
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-start gap-3 text-indigo-300">
                <UserCog size={18} className="shrink-0 mt-0.5 text-indigo-400" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest">Worker Tip</p>
                  <p className="text-xs font-medium leading-relaxed">
                    If you don't have access to email, please contact your <b>Production Manager</b> to manually reset your access key from the Admin Dashboard.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-rose-400 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p className="text-xs font-bold">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 text-emerald-400">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                <p className="text-xs font-bold">{success}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <>{isResetMode ? 'Initiate Recovery' : 'Authorize Session'} <ArrowRight size={18} /></>}
            </button>

            {isResetMode && (
              <button 
                type="button"
                onClick={() => setIsResetMode(false)} 
                className="w-full flex items-center justify-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
              >
                <ArrowLeft size={14} /> Back to Terminal Login
              </button>
            )}
          </form>
        </div>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-600 mb-2">
            <KeyRound size={12} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Encrypted Workforce Node</p>
          </div>
        </div>
      </div>
    </div>
  );
};
