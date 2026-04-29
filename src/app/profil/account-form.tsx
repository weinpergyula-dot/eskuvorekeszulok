"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  userId: string;
  initialName: string;
  email: string;
}

export function AccountForm({ userId, initialName, email }: Props) {
  const supabase = createClient();

  const [name, setName] = useState(initialName);
  const [savingName, setSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSavingName(true);
    setNameError(null);
    setNameSuccess(false);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name })
      .eq("user_id", userId);

    if (error) {
      setNameError(error.message);
    } else {
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    }
    setSavingName(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setPwError(null);
    setPwSuccess(false);

    if (newPassword !== confirmPassword) {
      setPwError("A két jelszó nem egyezik.");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("A jelszónak legalább 6 karakter hosszúnak kell lennie.");
      return;
    }

    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPwError(error.message);
    } else {
      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwSuccess(false), 3000);
    }
    setSavingPw(false);
  };

  return (
    <div className="space-y-6">
      {/* Name */}
      <form onSubmit={handleSaveName} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail cím</Label>
          <Input id="email" value={email} disabled className="bg-gray-50 text-gray-900" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">Teljes név</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        {nameError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {nameError}
          </p>
        )}
        {nameSuccess && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            ✓ Név mentve.
          </p>
        )}
        <Button type="submit" disabled={savingName}>
          {savingName ? "Mentés..." : "Név mentése"}
        </Button>
      </form>

      <div className="border-t border-gray-100" />

      {/* Password */}
      <form onSubmit={handleChangePassword} className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Jelszó módosítása</h3>
        <div className="space-y-1.5">
          <Label htmlFor="newPassword">Új jelszó</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Jelszó megerősítése</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        {pwError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {pwError}
          </p>
        )}
        {pwSuccess && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            ✓ Jelszó sikeresen megváltoztatva.
          </p>
        )}
        <Button type="submit" variant="outline" disabled={savingPw}>
          {savingPw ? "Mentés..." : "Jelszó módosítása"}
        </Button>
      </form>
    </div>
  );
}
