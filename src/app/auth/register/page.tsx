"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { PageHeader } from "@/components/layout/page-header";

type Step = "role" | "basic" | "provider-details";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<"visitor" | "provider">("visitor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Basic fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Provider-only fields
  const [phone, setPhone] = useState("");
  const [county, setCounty] = useState("");
  const [category, setCategory] = useState<ServiceCategory | "">("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setGalleryFiles(files);
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleBasicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "visitor") {
      await registerUser();
    } else {
      setStep("provider-details");
    }
  };

  const registerUser = async () => {
    if (!supabase) { setError("Supabase nincs konfigurálva."); return; }
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Ismeretlen hiba történt.");

      if (role === "provider") {
        let avatarUrl = "";
        let galleryUrls: string[] = [];

        if (avatarFile) {
          avatarUrl = await uploadFile(
            avatarFile,
            "avatars",
            `${authData.user.id}/avatar`
          );
        }

        for (let i = 0; i < galleryFiles.length; i++) {
          const url = await uploadFile(
            galleryFiles[i],
            "gallery",
            `${authData.user.id}/gallery-${i}`
          );
          galleryUrls.push(url);
        }

        const { error: providerError } = await supabase.from("providers").insert({
          user_id: authData.user.id,
          full_name: fullName,
          email,
          phone,
          county,
          category,
          description,
          website: website || null,
          avatar_url: avatarUrl || null,
          gallery_urls: galleryUrls,
          approval_status: "pending",
          active: true,
        });

        if (providerError) throw providerError;
      }

      router.push(
        role === "provider"
          ? "/auth/register/success?provider=true"
          : "/auth/login?registered=true"
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Hiba történt a regisztráció során.");
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !county) {
      setError("Kérlek tölts ki minden kötelező mezőt.");
      return;
    }
    await registerUser();
  };

  // Step 1 – Role selection
  if (step === "role") {
    return (
      <div>
        <PageHeader title="Regisztráció" />
        <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <p className="text-gray-900 text-center mb-8">Melyik típusú fiókot szeretnéd létrehozni?</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => { setRole("visitor"); setStep("basic"); }}
              className="flex flex-col items-center p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-[#2a9d8f] hover:shadow-md transition-all group"
            >
              <span className="text-4xl mb-3">👰</span>
              <span className="font-semibold text-gray-900 group-hover:text-[#2a9d8f]">Látogató</span>
              <span className="text-base text-gray-900 mt-1 text-center">
                Böngészem a szolgáltatókat
              </span>
            </button>
            <button
              onClick={() => { setRole("provider"); setStep("basic"); }}
              className="flex flex-col items-center p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-[#2a9d8f] hover:shadow-md transition-all group"
            >
              <span className="text-4xl mb-3">💼</span>
              <span className="font-semibold text-gray-900 group-hover:text-[#2a9d8f]">Szolgáltató</span>
              <span className="text-base text-gray-900 mt-1 text-center">
                Hirdetem a szolgáltatásom
              </span>
            </button>
          </div>

          <p className="text-center text-lg text-gray-900">
            Már van fiókod?{" "}
            <Link href="/auth/login" className="text-[#2a9d8f] hover:underline">
              Lépj be
            </Link>
          </p>
        </div>
        </div>
      </div>
    );
  }

  // Step 2 – Basic info
  if (step === "basic") {
    return (
      <div>
        <PageHeader title="Regisztráció" />
        <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <button
              onClick={() => setStep("role")}
              className="text-lg text-gray-900 hover:text-[#2a9d8f] mb-4 flex items-center gap-1"
            >
              ← Vissza
            </button>
            <p className="text-gray-900 text-lg">Alapadatok megadása</p>
          </div>

          {/* Progress */}
          <div className="flex gap-2 mb-6">
            <div className="h-1 flex-1 bg-[#2a9d8f] rounded-full" />
            <div className={`h-1 flex-1 rounded-full ${role === "provider" ? "bg-gray-200" : "bg-[#2a9d8f]"}`} />
          </div>

          <form onSubmit={handleBasicSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 text-lg px-4 py-3 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="fullName">Teljes név *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Pl. Kiss Anna"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email cím *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pelda@email.hu"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Jelszó *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 karakter"
                minLength={6}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Regisztráció..."
                : role === "provider"
                ? "Tovább →"
                : "Regisztráció"}
            </Button>
          </form>

          <p className="text-center text-lg text-gray-900 mt-4">
            Már van fiókod?{" "}
            <Link href="/auth/login" className="text-[#2a9d8f] hover:underline">
              Lépj be
            </Link>
          </p>
        </div>
        </div>
      </div>
    );
  }

  // Step 3 – Provider details
  return (
    <div>
      <PageHeader title="Regisztráció" />
      <div className="flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="mb-6">
          <button
            onClick={() => setStep("basic")}
            className="text-lg text-gray-900 hover:text-[#2a9d8f] mb-4 flex items-center gap-1"
          >
            ← Vissza
          </button>
          <p className="text-gray-900 text-lg">
            Regisztráció után az admin jóváhagyja a profilod.
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          <div className="h-1 flex-1 bg-[#2a9d8f] rounded-full" />
          <div className="h-1 flex-1 bg-[#2a9d8f] rounded-full" />
        </div>

        <form onSubmit={handleProviderSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-lg px-4 py-3 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Avatar */}
          <div className="space-y-1.5">
            <Label>Profilkép</Label>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#2a9d8f] overflow-hidden bg-gray-50"
                onClick={() => avatarInputRef.current?.click()}
              >
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">📷</span>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => avatarInputRef.current?.click()}
              >
                Kép feltöltése
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

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone">Telefonszám *</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+36 30 123 4567"
              required
            />
          </div>

          {/* County */}
          <div className="space-y-1.5">
            <Label>Megye *</Label>
            <Select value={county} onValueChange={setCounty} required>
              <SelectTrigger>
                <SelectValue placeholder="Válassz megyét" />
              </SelectTrigger>
              <SelectContent>
                {COUNTIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Kategória *</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as ServiceCategory)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Válassz kategóriát" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Leírás *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rövid bemutatkozás a szolgáltatásodról..."
              rows={4}
              required
            />
          </div>

          {/* Website */}
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
            <Label htmlFor="gallery">Egyéb képek (opcionális, max. 5)</Label>
            <Input
              id="gallery"
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryChange}
              className="cursor-pointer"
            />
            {galleryFiles.length > 0 && (
              <p className="text-base text-gray-900">{galleryFiles.length} kép kiválasztva</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Regisztráció folyamatban..." : "Regisztráció elküldése"}
          </Button>

          <p className="text-base text-gray-900 text-center">
            A regisztrációt az adminisztrátornak kell jóváhagynia, mielőtt a
            profilod megjelenik az oldalon.
          </p>
        </form>
      </div>
      </div>
    </div>
  );
}
