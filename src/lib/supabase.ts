// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// ✅ Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ✅ Create Supabase client with persisted auth session
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // 🔒 keeps the user logged in on refresh
    autoRefreshToken: true, // 🔄 auto refreshes expired tokens
  },
});
