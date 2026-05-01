"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

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
  const router = useRouter();
  const supabase = createClient();

  const handleApprove = async () => {
    if (!supabase) return;
    setLoading(true);

    if (type === "edit" && changes) {
      // Only spread known valid columns; also handle old single-value format
      const VALID_KEYS = ["full_name", "phone", "counties", "categories", "description", "website", "avatar_url", "gallery_urls"];
      const safeChanges: Record<string, unknown> = {};
      for (const key of VALID_KEYS) {
        if (key in changes) safeChanges[key] = changes[key];
      }
      // Migrate old format (category/county → categories/counties)
      if (!safeChanges.categories && changes.category) {
        safeChanges.categories = [changes.category];
      }
      if (!safeChanges.counties && changes.county) {
        safeChanges.counties = [changes.county];
      }

      await supabase
        .from("providers")
        .update({ ...safeChanges, pending_changes: null, approval_status: "approved", rejection_reason: null })
        .eq("id", providerId);
    } else {
      await supabase
        .from("providers")
        .update({ approval_status: "approved", rejection_reason: null })
        .eq("id", providerId);
    }

    setLoading(false);
    window.dispatchEvent(new CustomEvent("admin-pending-changed"));
    router.refresh();
  };

  const handleReject = async () => {
    if (!supabase) return;
    setLoading(true);

    if (type === "edit") {
      await supabase
        .from("providers")
        .update({ pending_changes: null, approval_status: "approved", rejection_reason: reason || null })
        .eq("id", providerId);
    } else {
      await supabase
        .from("providers")
        .update({ approval_status: "rejected", rejection_reason: reason || null })
        .eq("id", providerId);
    }

    setLoading(false);
    setShowModal(false);
    setReason("");
    window.dispatchEvent(new CustomEvent("admin-pending-changed"));
    router.refresh();
  };

  if (action === "approve") {
    return (
      <Button size="sm" variant="default" onClick={handleApprove} disabled={loading}>
        {loading ? "..." : "✓ Jóváhagy"}
      </Button>
    );
  }

  return (
    <>
      <Button size="sm" variant="destructive" onClick={() => setShowModal(true)}>
        ✗ Elutasít
      </Button>

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
                {loading ? "..." : "Elutasítás megerősítése"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
