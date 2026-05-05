"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";

interface AccountInfoProps {
  userId: string;
  initialName: string;
  email: string;
}

export function AccountInfoForm({ userId, initialName, email }: AccountInfoProps) {
  const supabase = createClient();
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    if (deleteConfirmEmail !== email) {
      setDeleteError("Az email cím nem egyezik.");
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hiba történt.");
      await supabase.auth.signOut();
      router.push("/");
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Hiba történt.");
      setDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    const { error: err } = await supabase
      .from("profiles")
      .update({ full_name: name })
      .eq("user_id", userId);

    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <FloatingInput id="email" label="E-mail cím" value={email} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
      <FloatingInput
        id="name"
        label="Teljes név"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      {error && (
        <p className="text-base text-[#F06C6C] bg-[#F06C6C]/10 border border-[#F06C6C]/30 rounded-lg px-3 py-2">{error}</p>
      )}
      {success && (
        <p className="text-base text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">✓ Név mentve.</p>
      )}
      <Button type="submit" disabled={saving}>
        {saving ? "Mentés..." : "Név mentése"}
      </Button>

      {/* Delete account */}
      <div className="pt-6 mt-6 border-t border-gray-100">
        <p className="text-base text-gray-900 mb-3">Veszélyes zóna</p>
        <Button
          type="button"
          variant="destructive"
          onClick={() => { setShowDeleteModal(true); setDeleteConfirmEmail(""); setDeleteError(null); }}
        >
          Fiók törlése
        </Button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <h3 className="font-bold text-gray-900">Fiók végleges törlése</h3>
            <p className="text-base text-gray-900">
              Ez a művelet <strong>nem visszavonható</strong>. Törlődik a fiókod, a profilod és minden adatod.
            </p>
            <p className="text-base text-gray-900">
              A megerősítéshez írd be az email címedet:
            </p>
            <FloatingInput
              id="delete-confirm-email"
              label={email}
              type="email"
              value={deleteConfirmEmail}
              onChange={(e) => setDeleteConfirmEmail(e.target.value)}
            />
            {deleteError && (
              <p className="text-base text-[#F06C6C]">{deleteError}</p>
            )}
            <div className="flex gap-3 justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Mégse
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmEmail !== email}
              >
                {deleting ? "Törlés..." : "Fiók végleges törlése"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

export function PasswordForm() {
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!currentPassword) { setError("Add meg a jelenlegi jelszavadat."); return; }
    if (!newPassword) { setError("Add meg az új jelszavadat."); return; }
    if (newPassword !== confirmPassword) { setError("A két jelszó nem egyezik."); return; }
    if (newPassword.length < 6) { setError("A jelszónak legalább 6 karakter hosszúnak kell lennie."); return; }
    if (!userEmail) { setError("Hiba történt. Kérjük, jelentkezz be újra."); return; }

    setSaving(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword,
    });

    if (signInError) {
      setError("A jelenlegi jelszó helytelen.");
      setSaving(false);
      return;
    }

    const { error: err } = await supabase.auth.updateUser({ password: newPassword });
    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <FloatingInput
        id="currentPassword"
        label="Jelenlegi jelszó"
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        required
      />
      <FloatingInput
        id="newPassword"
        label="Új jelszó"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        minLength={6}
      />
      <div>
        <FloatingInput
          id="confirmPassword"
          label="Jelszó megerősítése"
          type="password"
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPasswordError(null); }}
          onBlur={() => {
            if (confirmPassword && newPassword !== confirmPassword) {
              setConfirmPasswordError("A két jelszó nem egyezik.");
            } else {
              setConfirmPasswordError(null);
            }
          }}
          required
          minLength={6}
        />
        {confirmPasswordError && (
          <p className="text-sm text-[#F06C6C] mt-1 px-1">{confirmPasswordError}</p>
        )}
      </div>
      {error && (
        <p className="text-base text-[#F06C6C] bg-[#F06C6C]/10 border border-[#F06C6C]/30 rounded-lg px-3 py-2">{error}</p>
      )}
      {success && (
        <p className="text-base text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">✓ Jelszó sikeresen megváltoztatva.</p>
      )}
      <Button type="submit" variant="outline" disabled={saving}>
        {saving ? "Mentés..." : "Jelszó módosítása"}
      </Button>
    </form>
  );
}
