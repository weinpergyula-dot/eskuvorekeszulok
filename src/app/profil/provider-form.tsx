"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FloatingInput, FloatingTextarea } from "@/components/ui/floating-input";
import { Clock, Pencil, X, ImagePlus } from "lucide-react";
import { COUNTIES, CATEGORY_LABELS, type ServiceCategory } from "@/lib/types";
import type { Provider, UserRole } from "@/lib/types";

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

// ── Single data card (live or pending) ──────────────────────────────────────
function DataCard({
  title,
  variant,
  avatarUrl,
  fullName,
  phone,
  description,
  website,
  counties,
  categories,
  pendingKeys = new Set<string>(),
}: {
  title: string;
  variant: "live" | "pending" | "submitted";
  avatarUrl?: string | null;
  fullName?: string | null;
  phone?: string | null;
  description?: string | null;
  website?: string | null;
  counties?: string[];
  categories?: ServiceCategory[];
  pendingKeys?: Set<string>;
}) {
  const isLive = variant === "live";
  const borderCls = isLive ? "border-gray-200 bg-white" : "border-amber-200 bg-amber-50/40";
  const titleCls  = isLive ? "text-gray-700" : "text-amber-700";

  const Row = ({ fieldKey, label, value }: { fieldKey: string; label: string; value?: string | null }) => {
    const isPending = pendingKeys.has(fieldKey);
    return (
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
          {isPending && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title="Jóváhagyásra vár" />}
        </div>
        <p className="text-sm text-gray-900 leading-snug">
          {value || <span className="text-gray-400 italic">–</span>}
        </p>
      </div>
    );
  };

  const avatarPending = pendingKeys.has("avatar_url");

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${borderCls}`}>
      <div className="flex items-center gap-2 pb-1 border-b border-inherit">
        {!isLive && <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
        <p className={`text-xs font-semibold uppercase tracking-wide ${titleCls}`}>{title}</p>
      </div>

      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <div className={`w-14 h-14 rounded-full overflow-hidden border-2 bg-gray-100 flex items-center justify-center shrink-0 ${avatarPending ? "border-amber-400" : "border-white"} shadow-sm`}>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">📷</span>
          )}
        </div>
        <Row fieldKey="full_name" label="Teljes név" value={fullName} />
      </div>

      <Row fieldKey="phone" label="Telefonszám" value={phone} />

      {counties !== undefined && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Megye</p>
          <div className="flex flex-wrap gap-1">
            {(counties ?? []).length > 0
              ? (counties ?? []).map((c) => (
                  <span key={c} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200">{c}</span>
                ))
              : <span className="text-gray-400 italic text-sm">–</span>}
          </div>
        </div>
      )}

      {categories !== undefined && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Kategória</p>
          <div className="flex flex-wrap gap-1">
            {(categories ?? []).length > 0
              ? (categories ?? []).map((c) => (
                  <span key={c} className="px-2 py-0.5 rounded-full text-xs bg-[#84AAA6]/10 text-[#84AAA6] border border-[#84AAA6]/20">
                    {CATEGORY_LABELS[c as ServiceCategory] ?? c}
                  </span>
                ))
              : <span className="text-gray-400 italic text-sm">–</span>}
          </div>
        </div>
      )}

      <Row fieldKey="description" label="Bemutatkozás" value={description} />
      <Row fieldKey="website" label="Weboldal" value={website ?? null} />
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
  const isFirstSubmission = provider.approval_status !== "approved";
  const hasPendingUpdate = !isFirstSubmission && !!pc;

  // Compute which keys actually differ (for pending card markers)
  const pendingKeys = new Set<string>();
  if (pc) {
    const norm = (v: unknown) => String(v ?? "");
    const FIELDS = ["full_name", "phone", "description", "website", "avatar_url"] as const;
    for (const key of FIELDS) {
      if (key in pc && norm(pc[key]) !== norm((provider as unknown as Record<string, unknown>)[key])) {
        pendingKeys.add(key);
      }
    }
  }

  return (
    <div className="space-y-4">
      {isFirstSubmission ? (
        /* First submission – single amber card */
        <DataCard
          title="Beküldött adatok – jóváhagyásra vár"
          variant="submitted"
          avatarUrl={provider.avatar_url}
          fullName={provider.full_name}
          phone={provider.phone}
          description={provider.description}
          website={provider.website}
          counties={provider.counties}
          categories={provider.categories}
        />
      ) : (
        /* Approved profile – live card + optional pending card */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DataCard
            title="Élő verzió"
            variant="live"
            avatarUrl={provider.avatar_url}
            fullName={provider.full_name}
            phone={provider.phone}
            description={provider.description}
            website={provider.website}
            counties={provider.counties}
            categories={provider.categories}
          />
          {hasPendingUpdate && (
            <DataCard
              title="Módosítás – jóváhagyásra vár"
              variant="pending"
              /* Merge: pending_changes overrides live for changed fields */
              avatarUrl={(pc?.avatar_url as string | null) ?? provider.avatar_url}
              fullName={(pc?.full_name as string | null) ?? provider.full_name}
              phone={(pc?.phone as string | null) ?? provider.phone}
              description={(pc?.description as string | null) ?? provider.description}
              website={(pc?.website as string | null) ?? provider.website}
              counties={provider.counties}
              categories={provider.categories}
              pendingKeys={pendingKeys}
            />
          )}
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
    setGalleryFiles((prev) => [...prev, ...files]);
    setGalleryPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
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
    if (categories.length === 0) { setError("Kérjük, válassz legalább egy kategóriát."); return; }
    if (counties.length === 0)   { setError("Kérjük, válassz legalább egy megyét."); return; }

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
      } else {
        // Existing provider: categories, counties & gallery instant; text/image → pending_changes
        const { error: catError } = await supabase
          .from("providers").update({ categories, counties, gallery_urls: allGalleryUrls }).eq("user_id", userId);
        if (catError) throw catError;

        const { error: updateError } = await supabase.from("providers").update({
          pending_changes: {
            full_name: fullName, phone, description,
            website: website || null, avatar_url: avatarUrl || null,
          },
        }).eq("user_id", userId);
        if (updateError) throw updateError;
      }

      setEditing(false);
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
                label="Teljes név *"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />

              <FloatingInput
                id="pf-phone"
                label="Telefonszám *"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

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

              <FloatingTextarea
                id="pf-description"
                label="Bemutatkozás *"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
              />

              <FloatingInput
                id="pf-website"
                label="Weboldal (opcionális)"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />

              {/* Gallery */}
              <div className="space-y-2">
                <Label>Galéria</Label>
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
