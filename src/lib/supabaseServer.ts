import { createClient } from "@supabase/supabase-js";

export const supabaseServer = () =>
  createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // server-only key
    { auth: { persistSession: false, autoRefreshToken: false } }
  );