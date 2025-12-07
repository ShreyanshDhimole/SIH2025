// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Load from environment variables (adjust based on your build system, e.g., Vite uses VITE_*)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing in environment variables. Check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);