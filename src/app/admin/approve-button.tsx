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

export function ApproveButton({
  providerId,
  type,
  action,
  changes,
}: ApproveButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handle = async () => {
    setLoading(true);

    if (action === "approve" && type === "edit" && changes) {
      // Apply pending changes to live data
      await supabase
        .from("providers")
        .update({
          ...changes,
          pending_changes: null,
          approval_status: "approved",
        })
        .eq("id", providerId);
    } else if (action === "approve" && type === "registration") {
      await supabase
        .from("providers")
        .update({ approval_status: "approved" })
        .eq("id", providerId);
    } else if (action === "reject" && type === "edit") {
      await supabase
        .from("providers")
        .update({ pending_changes: null, approval_status: "approved" })
        .eq("id", providerId);
    } else {
      // reject registration
      await supabase
        .from("providers")
        .update({ approval_status: "rejected" })
        .eq("id", providerId);
    }

    setLoading(false);
    router.refresh();
  };

  return (
    <Button
      size="sm"
      variant={action === "approve" ? "default" : "destructive"}
      onClick={handle}
      disabled={loading}
    >
      {loading
        ? "..."
        : action === "approve"
        ? "✓ Jóváhagy"
        : "✗ Elutasít"}
    </Button>
  );
}
