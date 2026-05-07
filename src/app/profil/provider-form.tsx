"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FloatingInput, FloatingTextarea } from "@/components/ui/floating-input";
import { Clock, Pencil, X, ImagePlus, XCircle } from "lucide-react";
import { COUNTIES, CATEGORY_LABELS, type ServiceCategory } from "@/lib/types";
import type { Provider, UserRole } from "@/lib/types";
import { ProviderCard } from "@/components/providers/provider-card";

interface Props {
  userId: string;
  role: UserRole;
  provider: Provider | null;
  isProviderActive: boolean;
  onActiveChange: (val: boolean) => void;
}

// ── Pill multi-select ────────────────────────────────────────────────────────
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
    onChange(
      selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]
    );
  };
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label>{label}</Label>
        {selected.length > 0 && (
          <span className="text-sm text-[#84AAA6]">{selected.length} kiválasztva</span>
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
                  ? "bg-[#84AAA6] text-white border-[#84AAA6]"
                  : "bg-white text-gray-700 border-gray-300 hover:border-[#84AAA6] hover:text-[#84AAA6]"
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

// ── Profile view mode ────────────────────────────────────────────────────────
function ProfileView({
  provider,
  onEdit,
}: {
  provider: Provider;
  onEdit: () => void;
}) {
  const pc = provider.pending_changes as Record<string, unknown> | null | undefined;
  const isRejected = provider.approval_status === "rejected";
  const isPending = provider.approval_status === "pending";
  const isFirstSubmission = isPending || isRejected;
  const hasPendingUpdate = provider.approval_status === "approved" && !!pc;

  const pendingProvider: Provider = {
    ...provider,
    full_name: (pc?.full_name as string) ?? provider.full_name,
    phone: (pc?.phone as string) ?? provider.phone,
    description: (pc?.description as string) ?? provider.description,
    website: (pc?.website as string) ?? provider.website,
    avatar_url: (pc?.avatar_url as string) ?? provider.avatar_url,
    gallery_urls: (pc?.gallery_urls as string[]) ?? provider.gallery_urls,
    detailed_description: (pc?.detailed_description as string) ?? provider.detailed_description,
  };

  return (
    <div className="space-y-4">
      {isFirstSubmission ? (
        <div className="space-y-2 max-w-sm">
          {isRejected ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-red-600 flex items-center gap-1.5">
              <XCircle className="h-3.5 w-3.5" /> Elutasítva – profilod nem jelenik meg
            </p>
          ) : (
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Beküldött adatok – jóváhagyásra vár
            </p>
          )}
          <ProviderCard provider={provider} />
        </div>
      ) : hasPendingUpdate ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Élő előnézet</p>
            <ProviderCard provider={provider} />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Módosítás – jóváhagyásra vár
            </p>
            <ProviderCard provider={pendingProvider} disableLink />
          </div>
        </div>
      ) : (
        <div className="max-w-sm">
          <ProviderCard provider={provider} />
        </div>
      )}

      <Button variant="outline" onClick={onEdit} className="flex items-center gap-2">
        <Pencil className="h-4 w-4" />
        Szerkesztés
      </Button>
    </div>
  );
}

// ── Main form component ──────────────────────────────────────────────────────
export function ProviderForm({
  userId,
  role,
  provider,
  isProviderActive,
  onActiveChange,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(!provider);

  const [toggling, setToggling] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  // Pre-fill: pending_changes values take priority as "last submitted"
  const pc = provider?.pending_changes;
  const [fullName,    setFullName]    = useState((pc?.full_name    as string) ?? provider?.full_name    ?? "");
  const [phone,       setPhone]       = useState((pc?.phone        as string) ?? provider?.phone        ?? "");
  const [counties,    setCounties]    = useState<string[]>(provider?.counties ?? []);
  const [categories,  setCategories]  = useState<ServiceCategory[]>((provider?.categories as ServiceCategory[]) ?? []);
  const [description, setDescription] = useState((pc?.description  as string) ?? provider?.description  ?? "");
  const [detailedDescription, setDetailedDescription] = useState((pc?.detailed_description as string) ?? provider?.detailed_description ?? "");
  const [website,     setWebsite]     = useState((pc?.website      as string) ?? provider?.website      ?? "");
  const [avatarFile,  setAvatarFile]  = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(provider?.avatar_url ?? null);
  const [galleryUrls,   setGalleryUrls]   = useState<string[]>(provider?.gallery_urls ?? []);
  const [galleryFiles,  setGalleryFiles]  = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const handleToggle = async () => {
    const newVal = !isProviderActive;
    if (newVal && !provider) { onActiveChange(true); return; }
    if (provider) {
      setToggling(true); setToggleError(null);
      try {
        const { error: updateError } = await supabase
          .from("providers").update({ active: newVal }).eq("user_id", userId);
        if (updateError) throw updateError;
        onActiveChange(newVal);
      } catch (err: unknown) {
        setToggleError(
          err instanceof Error ? err.message
          : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "Nem sikerült menteni."
        );
      } finally { setToggling(false); }
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

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setGalleryFiles((prev) => {
      const combined = [...prev, ...files];
      const allowed = combined.slice(0, Math.max(0, 10 - galleryUrls.length));
      setGalleryPreviews((prevP) => [...prevP, ...allowed.slice(prev.length).map((f) => URL.createObjectURL(f))]);
      return allowed;
    });
    e.target.value = "";
  };

  const removeGalleryUrl = (url: string) => setGalleryUrls((prev) => prev.filter((u) => u !== url));
  const removeGalleryFile = (idx: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== idx));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) { setError("Supabase nincs konfigurálva."); return; }

    setSaving(true); setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nincs bejelentkezve.");

      let avatarUrl = provider?.avatar_url ?? "";
      if (avatarFile) {
        const { error: uploadError } = await supabase.storage
          .from("avatars").upload(`${userId}/avatar`, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(`${userId}/avatar`);
        avatarUrl = urlData.publicUrl;
      }

      // Upload new gallery images directly (no approval flow)
      const newGalleryUrls: string[] = [];
      for (const file of galleryFiles) {
        const path = `${userId}/gallery/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars").upload(path, file, { upsert: false });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        newGalleryUrls.push(urlData.publicUrl);
      }
      const allGalleryUrls = [...galleryUrls, ...newGalleryUrls];

      if (role === "visitor" || !provider) {
        // New provider: everything goes through approval
        const { error: insertError } = await supabase.from("providers").insert({
          user_id: userId, email: user.email ?? "",
          full_name: fullName, phone, counties, categories, description,
          detailed_description: detailedDescription || null,
          website: website || null, avatar_url: avatarUrl || null,
          gallery_urls: allGalleryUrls.length ? allGalleryUrls : null,
          approval_status: "pending",
        });
        if (insertError) throw insertError;
        if (role === "visitor") {
          const { error: roleError } = await supabase
            .from("profiles").update({ role: "provider" }).eq("user_id", userId);
          if (roleError) throw roleError;
        }
      } else if (provider.approval_status !== "approved") {
        // Rejected or pending provider: update actual fields and resubmit for approval
        const { error: updateError } = await supabase.from("providers").update({
          full_name: fullName, phone, counties, categories, description,
          detailed_description: detailedDescription || null,
          website: website || null, avatar_url: avatarUrl || null,
          gallery_urls: allGalleryUrls.length ? allGalleryUrls : null,
          approval_status: "pending",
          pending_changes: null,
        }).eq("user_id", userId);
        if (updateError) throw updateError;
      } else {
        // Approved provider: categories & counties instant; everything else → pending_changes
        const { error: catError } = await supabase
          .from("providers").update({ categories, counties }).eq("user_id", userId);
        if (catError) throw catError;

        const { error: updateError } = await supabase.from("providers").update({
          pending_changes: {
            full_name: fullName, phone, description,
            detailed_description: detailedDescription || null,
            website: website || null, avatar_url: avatarUrl || null,
            gallery_urls: allGalleryUrls.length ? allGalleryUrls : null,
          },
        }).eq("user_id", userId);
        if (updateError) throw updateError;
      }

      setEditing(false);
      window.dispatchEvent(new CustomEvent("profile-section", { detail: "provider" }));
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message
        : typeof err === "object" && err !== null && "message" in err
        ? String((err as { message: unknown }).message) : String(err);
      setError(msg || "Hiba a mentés során.");
    } finally { setSaving(false); }
  };

  const categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value: value as ServiceCategory, label }));
  const countyOptions   = COUNTIES.map((c) => ({ value: c, label: c }));

  return (
    <div className="space-y-6">
      {/* ── Toggle ──────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggle}
            disabled={toggling}
            className={`relative inline-flex h-7 w-13 min-w-[3.25rem] items-center rounded-full transition-colors focus:outline-none ${
              isProviderActive ? "bg-[#84AAA6]" : "bg-gray-300"
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
            {isProviderActive ? "Szolgáltató mód bekapcsolva" : "Szolgáltató mód kikapcsolva"}
          </span>
        </div>
        {toggleError && (
          <p className="text-sm text-[#F06C6C] bg-[#F06C6C]/10 border border-[#F06C6C]/30 rounded-lg px-3 py-2">
            {toggleError}
          </p>
        )}
      </div>

      {/* ── Content (only when active or no provider yet) ────────────────── */}
      {isProviderActive && (
        <>
          {/* VIEW MODE */}
          {provider && !editing && (
            <ProfileView provider={provider} onEdit={() => setEditing(true)} />
          )}

          {/* EDIT MODE */}
          {(!provider || editing) && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-[#F06C6C]/10 text-[#F06C6C] text-sm px-4 py-3 rounded-xl border border-[#F06C6C]/30">
                  {error}
                </div>
              )}

              {/* Approval info */}
              {provider && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                  <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    A <strong>kategória</strong> és <strong>megye</strong> módosítások azonnal érvénybe lépnek.
                    A többi mező (név, telefonszám, bemutatkozás, weboldal, kép) adminisztrátori jóváhagyás után jelenik meg.
                  </p>
                </div>
              )}

              {/* Avatar */}
              <div className="space-y-1.5">
                <Label>Profilkép</Label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#84AAA6] overflow-hidden bg-gray-50"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    {avatarPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">📷</span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => avatarInputRef.current?.click()}
                  >
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

              <FloatingInput
                id="pf-name"
                label="Teljes név"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <FloatingInput
                id="pf-phone"
                label="Telefonszám"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <PillSelect
                label="Megye"
                options={countyOptions}
                selected={counties}
                onChange={setCounties}
              />
              <PillSelect
                label="Kategória"
                options={categoryOptions}
                selected={categories}
                onChange={setCategories}
              />

              <div className="space-y-1">
                <FloatingTextarea
                  id="pf-description"
                  label="Rövid bemutatkozás (max 200 karakter)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                  rows={3}
                />
                <p className="text-xs text-gray-400 text-right">{description.length} / 200</p>
              </div>

              <FloatingTextarea
                id="pf-detailed-description"
                label="Részletes bemutatkozás"
                value={detailedDescription}
                onChange={(e) => setDetailedDescription(e.target.value)}
                rows={6}
              />

              <FloatingInput
                id="pf-website"
                label="Weboldal (opcionális)"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />

              {/* Gallery */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <Label>Galéria</Label>
                  <span className="text-sm text-gray-400">{galleryUrls.length + galleryFiles.length} / 10</span>
                </div>
                {(galleryUrls.length > 0 || galleryPreviews.length > 0) && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {galleryUrls.map((url, i) => (
                      <div key={`existing-${i}`} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                        <button
                          type="button"
                          onClick={() => removeGalleryUrl(url)}
                          className="absolute top-1 right-1 w-5 h-5 bg-[#F06C6C] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {galleryPreviews.map((url, i) => (
                      <div key={`new-${i}`} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-full h-24 object-cover rounded-lg border-2 border-dashed border-[#84AAA6]" />
                        <button
                          type="button"
                          onClick={() => removeGalleryFile(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-[#F06C6C] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <Button type="button" variant="outline" size="sm" onClick={() => galleryInputRef.current?.click()} className="flex items-center gap-2">
                  <ImagePlus className="h-4 w-4" />
                  Képek hozzáadása
                </Button>
                <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryChange} />
              </div>

              <div className="flex gap-3 pt-2 flex-wrap">
                <Button type="submit" disabled={saving}>
                  {saving
                    ? "Mentés..."
                    : role === "visitor"
                    ? "Profil aktiválása"
                    : "Módosítások mentése"}
                </Button>
                {provider && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setEditing(false); setError(null); }}
                  >
                    Mégse
                  </Button>
                )}
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
