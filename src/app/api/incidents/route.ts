// app/api/incidents/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const qType = searchParams.get("type"); // e.g. "polling_not_open"
  const supabase = supabaseServer();

  let query = supabase.from("incidents").select("*").order("created_at", { ascending: false });

  // optional filter by incident flag
  if (qType) {
    const col = `incident_${qType}`;
    // @ts-ignore
    query = query.eq(col, true);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  const payload = await req.json();

  // Basic server-side sanity: trim strings
  const clean = Object.fromEntries(
    Object.entries(payload).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
  );

  const supabase = supabaseServer();
  const { data, error } = await supabase.from("incidents").insert(clean).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
