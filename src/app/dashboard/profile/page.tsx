"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { COUNTIES, CATEGORY_LABELS, type ServiceCategory } from "@/lib/types";
import type { Provider } from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { ImagePlus, X } from "lucide-react";

function PillSelect<T extends string>({
  label,
  note,
  options,
  selected,
  onChange,
}: {
  label: string;
  note?: string;
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
    <div className="space-y-1.5">
      <Label>
        {label}{" "}
        {note && <span className="text-gray-400 font-normal text-sm">{note}</span>}
      </Label>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="max-h-52 overflow-y-auto p-2 space-y-0.5">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                className="accent-[#84AAA6] h-4 w-4 shrink-0"
              />
              <span className="text-base text-gray-900">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
      {selected.length > 0 && (
        <p className="text-sm text-[#84AAA6]">{selected.length} kiválasztva</p>
      )}
    </div>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [counties, setCounties] = useState<string[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [description, setDescription] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!supabase) { router.push("/"); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data } = await supabase
        .from("providers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setProvider(data);
        setFullName(data.full_name);
        setPhone(data.phone);
        setCounties(data.counties ?? []);
        setCategories((data.categories as ServiceCategory[]) ?? []);
        setDescription(data.description);
        setDetailedDescription(data.detailed_description ?? "");
        setWebsite(data.website ?? "");
        setAvatarPreview(data.avatar_url ?? null);
        setExistingGalleryUrls(data.gallery_urls ?? []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) { setError("Supabase nincs konfigurálva."); return; }
    setSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nincs bejelentkezve.");

      let avatarUrl = provider?.avatar_url ?? "";

      if (avatarFile) {
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(`${user.id}/avatar`, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(`${user.id}/avatar`);
        avatarUrl = urlData.publicUrl;
      }

      // Upload new gallery files and combine with kept existing ones
      let galleryUrls = existingGalleryUrls;
      for (let i = 0; i < galleryFiles.length; i++) {
        const path = `${user.id}/edit-${Date.now()}-${i}`;
        const { error: gErr } = await supabase.storage
          .from("gallery")
          .upload(path, galleryFiles[i], { upsert: true });
        if (gErr) throw gErr;
        const { data: gUrlData } = supabase.storage.from("gallery").getPublicUrl(path);
        galleryUrls = [...galleryUrls, gUrlData.publicUrl];
      }

      const changes = {
        full_name: fullName,
        phone,
        counties,
        categories,
        description,
        detailed_description: detailedDescription || null,
        website: website || null,
        avatar_url: avatarUrl || null,
        gallery_urls: galleryUrls,
      };

      // Store as pending_changes; admin must approve
      const { error: updateError } = await supabase
        .from("providers")
        .update({
          pending_changes: changes,
          approval_status: "pending",
        })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => router.push("/profil"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Hiba a mentés során.");
    } finally {
      setSaving(false);
    }
  };

  const categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value: value as ServiceCategory,
    label,
  }));
  const countyOptions = COUNTIES.map((c) => ({ value: c, label: c }));

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-900">Betöltés...</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Profil szerkesztése"
        breadcrumb={[{ label: "Profilom", href: "/profil" }]}
      />
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <p className="text-lg text-gray-900 mb-6">
        A módosítások az adminisztrátori jóváhagyás után jelennek meg nyilvánosan.
      </p>

      {success && (
        <div className="bg-green-50 text-green-700 text-lg px-4 py-3 rounded-xl border border-green-200 mb-6">
          ✓ Módosítások elküldve! Átirányítás...
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-lg p-6 space-y-5"
      >
        {error && (
          <div className="bg-[#F06C6C]/10 text-[#F06C6C] text-lg px-4 py-3 rounded-xl border border-[#F06C6C]/30">
            {error}
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
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
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
              Kép módosítása
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
          <Label htmlFor="fullName">Teljes név *</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label>Telefonszám *</Label>
          <PhoneInput value={phone} onChange={setPhone} />
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
          <Label htmlFor="description">Rövid bemutatkozás *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 200))}
            rows={3}
            required
          />
          <p className="text-xs text-gray-400 text-right">{description.length} / 200</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="detailed-description">Részletes bemutatkozás</Label>
          <Textarea
            id="detailed-description"
            value={detailedDescription}
            onChange={(e) => setDetailedDescription(e.target.value)}
            rows={6}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="website">Weboldal (opcionális)</Label>
          <Input
            id="website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://www.pelda.hu"
          />
        </div>

        {/* Gallery */}
        <div className="space-y-1.5">
          <Label>Galéria képek</Label>

          {/* Existing images */}
          {existingGalleryUrls.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Jelenlegi képek (kattints az X-re a törléshez):</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {existingGalleryUrls.map((url, i) => (
                  <div key={i} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => setExistingGalleryUrls((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add new files */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={(existingGalleryUrls.length + galleryFiles.length) >= 10}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#84AAA6] hover:text-[#84AAA6] text-gray-600 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ImagePlus className="h-4 w-4" />
              Képek hozzáadása
            </button>
            {(existingGalleryUrls.length + galleryFiles.length) > 0 && (
              <span className="text-sm text-gray-500">
                {existingGalleryUrls.length + galleryFiles.length} / 10
              </span>
            )}
          </div>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const newFiles = Array.from(e.target.files ?? []);
              setGalleryFiles((prev) =>
                [...prev, ...newFiles].slice(0, 10 - existingGalleryUrls.length)
              );
              e.target.value = "";
            }}
          />

          {/* New files list */}
          {galleryFiles.length > 0 && (
            <ul className="space-y-1">
              {galleryFiles.map((file, idx) => (
                <li key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                  <span className="text-gray-700 truncate flex-1">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setGalleryFiles((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? "Mentés..." : "Módosítások mentése"}
          </Button>
          <Link href="/profil">
            <Button type="button" variant="outline">
              Mégse
            </Button>
          </Link>
        </div>
      </form>
    </div>
    </div>
  );
}
