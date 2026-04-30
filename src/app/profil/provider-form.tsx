"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTIES, CATEGORY_LABELS, type ServiceCategory } from "@/lib/types";
import type { Provider, UserRole } from "@/lib/types";

interface Props {
  userId: string;
  role: UserRole;
  provider: Provider | null;
}

export function ProviderForm({ userId, role, provider }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Switcher state: ON if provider record exists and active !== false
  const [isProviderMode, setIsProviderMode] = useState(
    provider !== null ? provider.active !== false : false
  );
  const [toggling, setToggling] = useState(false);

  const [fullName, setFullName] = useState(provider?.full_name ?? "");
  const [phone, setPhone] = useState(provider?.phone ?? "");
  const [county, setCounty] = useState(provider?.county ?? "");
  const [category, setCategory] = useState<ServiceCategory | "">(
    (provider?.category as ServiceCategory) ?? ""
  );
  const [description, setDescription] = useState(provider?.description ?? "");
  const [website, setWebsite] = useState(provider?.website ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    provider?.avatar_url ?? null
  );

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    const newVal = !isProviderMode;

    // If turning ON with no provider record: just show the form
    if (newVal && !provider) {
      setIsProviderMode(true);
      return;
    }

    // If provider record exists: update active flag in DB
    if (provider) {
      setToggling(true);
      try {
        const { error: updateError } = await supabase
          .from("providers")
          .update({ active: newVal })
          .eq("user_id", userId);
        if (updateError) throw updateError;
      } catch {
        return;
      } finally {
        setToggling(false);
      }
    }

    setIsProviderMode(newVal);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) { setError("Supabase nincs konfigurálva."); return; }
    if (!category) { setError("Kérjük, válassz kategóriát."); return; }

    setSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nincs bejelentkezve.");

      let avatarUrl = provider?.avatar_url ?? "";
      if (avatarFile) {
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(`${userId}/avatar`, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(`${userId}/avatar`);
        avatarUrl = urlData.publicUrl;
      }

      const payload = {
        full_name: fullName,
        phone,
        county,
        category,
        description,
        website: website || null,
        avatar_url: avatarUrl || null,
      };

      if (role === "visitor") {
        const email = user.email ?? "";
        const { error: insertError } = await supabase.from("providers").insert({
          user_id: userId,
          email,
          ...payload,
          approval_status: "pending",
          active: true,
        });
        if (insertError) throw insertError;

        const { error: roleError } = await supabase
          .from("profiles")
          .update({ role: "provider" })
          .eq("user_id", userId);
        if (roleError) throw roleError;
      } else {
        const { error: updateError } = await supabase
          .from("providers")
          .update({
            pending_changes: payload,
            approval_status: "pending",
          })
          .eq("user_id", userId);
        if (updateError) throw updateError;
      }

      setSuccess(true);
      setTimeout(() => { router.refresh(); }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Hiba a mentés során.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Switcher */}
      <div className="space-y-3">
        <p className="text-base text-gray-900">
          Kapcsold be a szolgáltatói módot, hogy profilod megjelenjen a keresési listában.
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleToggle}
            disabled={toggling}
            className={`relative inline-flex h-7 w-13 min-w-[3.25rem] items-center rounded-full transition-colors focus:outline-none ${
              isProviderMode ? "bg-[#2a9d8f]" : "bg-gray-300"
            } ${toggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            aria-checked={isProviderMode}
            role="switch"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                isProviderMode ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-base font-medium text-gray-900">
            {isProviderMode ? "Szolgáltató" : "Látogató"}
          </span>
        </div>
      </div>

      {/* Provider form – only shown when switcher is ON */}
      {isProviderMode && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 text-lg px-4 py-3 rounded-xl border border-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 text-lg px-4 py-3 rounded-xl border border-green-200">
              ✓ {role === "visitor" ? "Profil létrehozva! Jóváhagyásra vár." : "Módosítások elküldve!"}
            </div>
          )}

          {/* Avatar */}
          <div className="space-y-1.5">
            <Label>Profilkép</Label>
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#2a9d8f] overflow-hidden bg-gray-50"
                onClick={() => avatarInputRef.current?.click()}
              >
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">📷</span>
                )}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()}>
                Kép {avatarPreview ? "módosítása" : "feltöltése"}
              </Button>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pf-name">Teljes név *</Label>
            <Input
              id="pf-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pf-phone">Telefonszám *</Label>
            <Input
              id="pf-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Megye *</Label>
            <Select value={county} onValueChange={setCounty}>
              <SelectTrigger>
                <SelectValue placeholder="Válassz megyét" />
              </SelectTrigger>
              <SelectContent>
                {COUNTIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Kategória *</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ServiceCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Válassz kategóriát" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pf-description">Leírás *</Label>
            <Textarea
              id="pf-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pf-website">Weboldal (opcionális)</Label>
            <Input
              id="pf-website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://www.pelda.hu"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              {saving
                ? "Mentés..."
                : role === "visitor"
                ? "Profil aktiválása"
                : "Módosítások mentése"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
