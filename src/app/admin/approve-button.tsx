"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ApproveButtonProps {
  providerId: string;
  type: "registration" | "edit";
  action: "approve" | "reject";
  changes: Record<string, unknown> | null;
}

export function ApproveButton({ providerId, type, action, changes }: ApproveButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const callApi = async (body: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/providers/${providerId}/approve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Hiba történt.");
  };

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      await callApi({ action: "approve", type, changes });
      window.dispatchEvent(new CustomEvent("admin-pending-changed"));
      router.refresh();
      // keep loading=true — the component disappears after refresh
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Hiba történt.");
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setError(null);
    try {
      await callApi({ action: "reject", type, reason });
      window.dispatchEvent(new CustomEvent("admin-pending-changed"));
      router.refresh();
      // keep loading=true — the component disappears after refresh
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Hiba történt.");
      setLoading(false);
    }
  };

  if (action === "approve") {
    return (
      <div className="flex flex-col gap-1">
        <Button size="sm" variant="default" onClick={handleApprove} disabled={loading} className="flex items-center gap-1.5">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "✓"}
          Jóváhagy
        </Button>
        {error && <p className="text-xs text-[#F06C6C]">{error}</p>}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        <Button size="sm" variant="destructive" onClick={() => setShowModal(true)} disabled={loading} className="flex items-center gap-1.5">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "✗"}
          Elutasít
        </Button>
        {error && <p className="text-xs text-[#F06C6C]">{error}</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <h3 className="font-bold text-gray-900">Elutasítás indoklása</h3>
            <p className="text-base text-gray-900">
              {type === "edit"
                ? "A módosítási kérelmet elutasítod. A szolgáltató látja az indoklást."
                : "A regisztrációt elutasítod. A szolgáltató látja az indoklást."}
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Indoklás (opcionális)..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#84AAA6] resize-none"
            />
            <div className="flex gap-3 justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setShowModal(false); setReason(""); }}
                disabled={loading}
              >
                Mégse
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleReject}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Elutasítás megerősítése"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
