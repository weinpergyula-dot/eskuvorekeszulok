import { NextRequest, NextResponse } from "next/server";
import { closePosition, deletePosition } from "@/lib/trade/positions";
import { toMessage } from "@/lib/trade/util";

export const dynamic = "force-dynamic";

// PATCH { exit_amount } -> close a position (records realised P/L).
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as {
    exit_amount?: unknown;
  } | null;
  const exit_amount = Number(body?.exit_amount);
  if (!Number.isFinite(exit_amount) || exit_amount < 0) {
    return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
  }
  try {
    const position = await closePosition(id, exit_amount);
    return NextResponse.json({ position });
  } catch (e) {
    return NextResponse.json({ error: toMessage(e) }, { status: 500 });
  }
}

// DELETE -> remove a position entirely.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await deletePosition(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: toMessage(e) }, { status: 500 });
  }
}
