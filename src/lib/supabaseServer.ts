// src/lib/supabaseServer.ts
import { createClient } from "@supabase/supabase-js";

export const supabaseServer = () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
    throw new Error("SUPABASE_SERVICE_ROLE_KEY missing in .env");
  if (!process.env.VITE_SUPABASE_URL)
    throw new Error("VITE_SUPABASE_URL missing in .env");

  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY, // server-only
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
};
