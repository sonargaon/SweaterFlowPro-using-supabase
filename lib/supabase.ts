import { createClient } from '@supabase/supabase-js';

// Confirmed Supabase credentials for Project: SweaterFlow Pro (ufysppbrgckezipndlrs)
const supabaseUrl = 'https://ufysppbrgckezipndlrs.supabase.co';
const supabaseAnonKey = 'sb_publishable_yqWouuCIxBVpAIQuwQyobw_vor7HSfb';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any);