import { supabaseClient } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json();
  const { resolution, status } = body;

  const { error } = await supabaseClient
    .from("call_center_reports")
    .update({ resolution, status })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(
    { message: "Report updated successfully" },
    { status: 200 }
  );
}
