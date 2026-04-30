"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COUNTIES, CATEGORY_LABELS, type ServiceCategory } from "@/lib/types";
import type { Provider, UserRole } from "@/lib/types";

interface Props {
  userId: string;
  role: UserRole;
  provider: Provider | null;
  isProviderActive: boolean;
  onActiveChange: (val: boolean) => void;
}

function PillSelect<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  selected: T[];
  onChange: (next: T[]) => void;
}) {
  const toggle = (value: T) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label>{label}</Label>
        {selected.length > 0 && (
          <span className="text-sm text-[#2a9d8f]">{selected.length} kiválasztva</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                isSelected
                  ? "bg-[#2a9d8f] text-white border-[#2a9d8f]"
                  : "bg-white text-gray-700 border-gray-300 hover:border-[#2a9d8f] hover:text-[#2a9d8f]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ProviderForm({ userId, role, provider, isProviderActive, onActiveChange }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [toggling, setToggling] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  // Pending changes take priority (most recently submitted values)
  const pc = provider?.pending_changes;
  const [fullName, setFullName] = useState(
    (pc?.full_name as string) ?? provider?.full_name ?? ""
  );
  const [phone, setPhone] = useState(
    (pc?.phone as string) ?? provider?.phone ?? ""
  );
  const [counties, setCounties] = useState<string[]>(
    (pc?.counties as string[]) ?? provider?.counties ?? []
  );
  const [categories, setCategories] = useState<ServiceCategory[]>(
    ((pc?.categories ?? provider?.categories) as ServiceCategory[]) ?? []
  );
  const [description, setDescription] = useState(
    (pc?.description as string) ?? provider?.description ?? ""
  );
  const [website, setWebsite] = useState(
    (pc?.website as string) ?? provider?.website ?? ""
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    provider?.avatar_url ?? null
  );

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    const newVal = !isProviderActive;

    if (newVal && !provider) {
      onActiveChange(true);
      return;
    }

    if (provider) {
      setToggling(true);
      setToggleError(null);
      try {
        const { error: updateError } = await supabase
          .from("providers")
          .update({ active: newVal })
          .eq("user_id", userId);
        if (updateError) throw updateError;
        onActiveChange(newVal);
      } catch (err: unknown) {
        setToggleError(
          err instanceof Error
            ? err.message
            : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : "Nem sikerült menteni."
        );
      } finally {
        setToggling(false);
      }
      return;
    }

    onActiveChange(newVal);
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
    if (categories.length === 0) { setError("Kérjük, válassz legalább egy kategóriát."); return; }
    if (counties.length === 0) { setError("Kérjük, válassz legalább egy megyét."); return; }

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

      if (role === "visitor" || !provider) {
        // New provider: everything goes through approval
        const email = user.email ?? "";
        const { error: insertError } = await supabase.from("providers").insert({
          user_id: userId,
          email,
          full_name: fullName,
          phone,
          counties,
          categories,
          description,
          website: website || null,
          avatar_url: avatarUrl || null,
          approval_status: "pending",
        });
        if (insertError) throw insertError;

        if (role === "visitor") {
          const { error: roleError } = await supabase
            .from("profiles")
            .update({ role: "provider" })
            .eq("user_id", userId);
          if (roleError) throw roleError;
        }
      } else {
        // Existing provider: categories & counties apply immediately,
        // text/image fields go to pending_changes for admin review
        const { error: catError } = await supabase
          .from("providers")
          .update({ categories, counties })
          .eq("user_id", userId);
        if (catError) throw catError;

        const pendingPayload = {
          full_name: fullName,
          phone,
          description,
          website: website || null,
          avatar_url: avatarUrl || null,
        };
        const { error: updateError } = await supabase
          .from("providers")
          .update({ pending_changes: pendingPayload })
          .eq("user_id", userId);
        if (updateError) throw updateError;
      }

      setSuccess(true);
      setTimeout(() => { router.refresh(); }, 1500);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : String(err);
      setError(msg || "Hiba a mentés során.");
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value: value as ServiceCategory,
    label,
  }));

  const countyOptions = COUNTIES.map((c) => ({ value: c, label: c }));

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
              isProviderActive ? "bg-[#2a9d8f]" : "bg-gray-300"
            } ${toggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            aria-checked={isProviderActive}
            role="switch"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                isProviderActive ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-base font-medium text-gray-900">
            {isProviderActive ? "Szolgáltató" : "Látogató"}
          </span>
        </div>
        {toggleError && (
          <p className="text-base text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {toggleError}
          </p>
        )}
      </div>

      {/* Provider form – only shown when switcher is ON */}
      {isProviderActive && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 text-lg px-4 py-3 rounded-xl border border-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 text-lg px-4 py-3 rounded-xl border border-green-200">
              ✓ {!provider ? "Profil létrehozva! Jóváhagyásra vár." : "Módosítások elküldve, jóváhagyásra vár."}
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

          <PillSelect
            label="Megye *"
            options={countyOptions}
            selected={counties}
            onChange={setCounties}
          />

          <PillSelect
            label="Kategória *"
            options={categoryOptions}
            selected={categories}
            onChange={setCategories}
          />

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
