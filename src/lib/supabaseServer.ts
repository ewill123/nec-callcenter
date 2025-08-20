// "Server" Supabase for server-side secure operations (service role key)
import { createClient } from "@supabase/supabase-js";

export const supabaseServer = () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
    throw new Error("SUPABASE_SERVICE_ROLE_KEY missing in .env");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL)
    throw new Error("NEXT_PUBLIC_SUPABASE_URL missing in .env");

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
};
