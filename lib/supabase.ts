
import { createClient } from '@supabase/supabase-js';

// Supabase credentials for Project: ufysppbrgckezipndlrs
const supabaseUrl = 'https://ufysppbrgckezipndlrs.supabase.co';
const supabaseAnonKey = 'sb_publishable_yqWouuCIxBVpAIQuwQyobw_vor7HSfb';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseUrl.startsWith('https://') && 
  supabaseAnonKey && 
  supabaseAnonKey.length > 10
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
