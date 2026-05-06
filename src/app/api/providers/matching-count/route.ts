import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const countiesParam = searchParams.get("counties");

  if (!category || !countiesParam) return NextResponse.json({ count: 0 });

  const counties = countiesParam.split(",").filter(Boolean);
  const searchCounties = [...counties, "Országosan"];

  const admin = createAdminClient();
  const { count } = await admin
    .from("providers")
    .select("*", { count: "exact", head: true })
    .eq("approval_status", "approved")
    .contains("categories", [category])
    .overlaps("counties", searchCounties);

  return NextResponse.json({ count: count ?? 0 });
}
