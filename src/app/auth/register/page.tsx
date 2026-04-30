"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { FloatingInput, FloatingTextarea } from "@/components/ui/floating-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COUNTIES, CATEGORY_LABELS, type ServiceCategory } from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { UserRound, Briefcase } from "lucide-react";

type Step = "role" | "basic" | "provider-details";

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
  const [confirmPassword, setConfirmPassword] = useState("");

  // Provider-only fields
  const [phone, setPhone] = useState("");
  const [counties, setCounties] = useState<string[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
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
    if (password !== confirmPassword) {
      setError("A két jelszó nem egyezik meg.");
      return;
    }
    setError(null);
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
          counties,
          categories,
          description,
          website: website || null,
          avatar_url: avatarUrl || null,
          gallery_urls: galleryUrls,
          approval_status: "pending",
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
    if (categories.length === 0 || counties.length === 0) {
      setError("Kérlek válassz legalább egy kategóriát és egy megyét.");
      return;
    }
    await registerUser();
  };

  const categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value: value as ServiceCategory,
    label,
  }));

  const countyOptions = COUNTIES.map((c) => ({ value: c, label: c }));

  // Step 1 – Role selection
  if (step === "role") {
    return (
      <div>
        <PageHeader title="Regisztráció" description="A látogatók számára a szolgáltatók értékeléséhez, a szolgáltatók számára pedig a profiljuk menedzseléséhez szükséges a regisztráció." />
        <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <p className="text-gray-900 text-center mb-8" style={{ fontSize: "22px" }}>Melyik típusú fiókot szeretnéd létrehozni?</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => { setRole("visitor"); setStep("basic"); }}
              className="flex flex-col items-center p-8 bg-white border-2 border-gray-200 rounded-xl hover:border-[#C65EA5] hover:shadow-md transition-all group"
            >
              <UserRound className="h-12 w-12 mb-4 text-[#C65EA5]" strokeWidth={1.5} />
              <span className="font-semibold text-gray-900 group-hover:text-[#C65EA5]" style={{ fontSize: "22px" }}>Látogató</span>
              <span className="text-base text-gray-900 mt-2 text-center">
                Böngészem a szolgáltatókat
              </span>
            </button>
            <button
              onClick={() => { setRole("provider"); setStep("basic"); }}
              className="flex flex-col items-center p-8 bg-white border-2 border-gray-200 rounded-xl hover:border-[#C65EA5] hover:shadow-md transition-all group"
            >
              <Briefcase className="h-12 w-12 mb-4 text-[#C65EA5]" strokeWidth={1.5} />
              <span className="font-semibold text-gray-900 group-hover:text-[#C65EA5]" style={{ fontSize: "22px" }}>Szolgáltató</span>
              <span className="text-base text-gray-900 mt-2 text-center">
                Hirdetem a szolgáltatásom
              </span>
            </button>
          </div>

          <p className="text-center text-lg text-gray-900">
            Már van fiókod?{" "}
            <Link href="/auth/login" className="text-[#84AAA6] hover:underline">
              Jelentkezz be
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
        <PageHeader title="Regisztráció" description="A látogatók számára a szolgáltatók értékeléséhez, a szolgáltatók számára pedig a profiljuk menedzseléséhez szükséges a regisztráció." />
        <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <button
              onClick={() => setStep("role")}
              className="text-lg text-gray-900 hover:text-[#84AAA6] mb-4 flex items-center gap-1"
            >
              ← Vissza
            </button>
            <p className="text-gray-900 text-lg">Alapadatok megadása</p>
          </div>

          {/* Progress */}
          <div className="flex gap-2 mb-6">
            <div className="h-1 flex-1 bg-[#C65EA5] rounded-full" />
            <div className={`h-1 flex-1 rounded-full ${role === "provider" ? "bg-gray-200" : "bg-[#C65EA5]"}`} />
          </div>

          <form onSubmit={handleBasicSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 text-lg px-4 py-3 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <FloatingInput
              id="fullName"
              label="Teljes név *"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <FloatingInput
              id="email"
              label="Email cím *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <FloatingInput
              id="password"
              label="Jelszó *"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />

            <FloatingInput
              id="confirmPassword"
              label="Jelszó megerősítése *"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
            />

            <Button type="submit" className="w-full bg-[#C65EA5] hover:bg-[#A84D8B]" disabled={loading}>
              {loading
                ? "Regisztráció..."
                : role === "provider"
                ? "Tovább →"
                : "Regisztráció"}
            </Button>
          </form>

          <p className="text-center text-lg text-gray-900 mt-4">
            Már van fiókod?{" "}
            <Link href="/auth/login" className="text-[#84AAA6] hover:underline">
              Jelentkezz be
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
            className="text-lg text-gray-900 hover:text-[#84AAA6] mb-4 flex items-center gap-1"
          >
            ← Vissza
          </button>
          <p className="text-gray-900 text-lg">
            Regisztráció után az admin jóváhagyja a profilod.
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          <div className="h-1 flex-1 bg-[#C65EA5] rounded-full" />
          <div className="h-1 flex-1 bg-[#C65EA5] rounded-full" />
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
                className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#84AAA6] overflow-hidden bg-gray-50"
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
          <FloatingInput
            id="phone"
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

          {/* Description */}
          <FloatingTextarea
            id="description"
            label="Leírás *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />

          {/* Website */}
          <FloatingInput
            id="website"
            label="Weboldal (opcionális)"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

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

          <Button type="submit" className="w-full bg-[#C65EA5] hover:bg-[#A84D8B]" disabled={loading}>
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
