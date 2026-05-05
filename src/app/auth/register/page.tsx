"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

const COUNTRY_CODES = [
  { code: "+36", flag: "🇭🇺", name: "HU" },
  { code: "+43", flag: "🇦🇹", name: "AT" },
  { code: "+40", flag: "🇷🇴", name: "RO" },
  { code: "+421", flag: "🇸🇰", name: "SK" },
  { code: "+385", flag: "🇭🇷", name: "HR" },
  { code: "+381", flag: "🇷🇸", name: "RS" },
  { code: "+49", flag: "🇩🇪", name: "DE" },
  { code: "+44", flag: "🇬🇧", name: "GB" },
];

function PhoneInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [countryCode, setCountryCode] = useState("+36");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [p3, setP3] = useState("");
  const p1Ref = useRef<HTMLInputElement>(null);
  const p2Ref = useRef<HTMLInputElement>(null);
  const p3Ref = useRef<HTMLInputElement>(null);

  const update = (code: string, a: string, b: string, c: string) => {
    const full = a || b || c ? `${code} ${a} ${b} ${c}`.trimEnd() : "";
    onChange(full);
  };

  const handleP1 = (v: string) => {
    setP1(v);
    update(countryCode, v, p2, p3);
    if (v.length === 2) p2Ref.current?.focus();
  };
  const handleP2 = (v: string) => {
    setP2(v);
    update(countryCode, p1, v, p3);
    if (v.length === 3) p3Ref.current?.focus();
  };
  const handleP3 = (v: string) => {
    setP3(v);
    update(countryCode, p1, p2, v);
  };
  const handleCountry = (code: string) => {
    setCountryCode(code);
    update(code, p1, p2, p3);
  };

  // keep value prop in sync if cleared externally
  if (!value && (p1 || p2 || p3)) { setP1(""); setP2(""); setP3(""); }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 border border-gray-300 rounded-xl px-3 h-14 focus-within:border-[#84AAA6] bg-white transition-colors">
        <select
          value={countryCode}
          onChange={(e) => handleCountry(e.target.value)}
          className="bg-transparent text-base outline-none cursor-pointer shrink-0"
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
          ))}
        </select>
        <span className="text-gray-300">|</span>
        <input
          ref={p1Ref}
          type="text"
          inputMode="text"
          placeholder="20"
          value={p1}
          onChange={(e) => handleP1(e.target.value)}
          className="w-8 text-base outline-none bg-transparent text-center"
          maxLength={2}
        />
        <span className="text-gray-400 text-base">–</span>
        <input
          ref={p2Ref}
          type="text"
          inputMode="text"
          placeholder="123"
          value={p2}
          onChange={(e) => handleP2(e.target.value)}
          className="w-10 text-base outline-none bg-transparent text-center"
          maxLength={3}
        />
        <span className="text-gray-400 text-base">–</span>
        <input
          ref={p3Ref}
          type="text"
          inputMode="text"
          placeholder="4567"
          value={p3}
          onChange={(e) => handleP3(e.target.value)}
          className="w-14 text-base outline-none bg-transparent text-center"
          maxLength={4}
        />
      </div>
    </div>
  );
}

function PillSelect<T extends string>({
  label,
  hint,
  required,
  options,
  selected,
  onChange,
}: {
  label?: string;
  hint?: string;
  required?: boolean;
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
      {label && (
        <div className="flex items-baseline justify-between">
          <Label>
            {label.includes("*")
              ? <>{label.replace(" *", "")}<span className="text-[1.2em] font-bold leading-none align-middle"> *</span></>
              : label}
          </Label>
          {selected.length > 0 && (
            <span className="text-sm text-[#84AAA6]">{selected.length} kiválasztva</span>
          )}
        </div>
      )}
      {!label && selected.length > 0 && (
        <p className="text-sm text-[#84AAA6] text-right">{selected.length} kiválasztva</p>
      )}
      {hint && (
        <p className="text-base text-gray-800">
          {hint}{required && <span className="text-[1.2em] font-bold align-middle ml-0.5">*</span>}
        </p>
      )}
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

function translateError(msg: string): string {
  if (msg.includes("User already registered") || msg.includes("already registered")) return "Ez az e-mail cím már regisztrálva van.";
  if (msg.includes("Password should be at least")) return "A jelszónak legalább 6 karakter hosszúnak kell lennie.";
  if (msg.includes("Unable to validate email address") || msg.includes("Invalid email")) return "Érvénytelen e-mail cím.";
  if (msg.includes("rate limit") || msg.includes("too many")) return "Túl sok próbálkozás. Kérjük, várj egy kicsit.";
  return msg;
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<"visitor" | "provider">("visitor");
  const [isUpgrade, setIsUpgrade] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);

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
  const [detailedDescription, setDetailedDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  useEffect(() => {
    const type = searchParams.get("type");
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (type === "provider") {
        setRole("provider");
        if (user) {
          // Logged-in visitor upgrading to provider — skip to details step
          setFullName(user.user_metadata?.full_name ?? "");
          setEmail(user.email ?? "");
          setIsUpgrade(true);
          setStep("provider-details");
        } else {
          setStep("basic");
        }
      } else if (type === "visitor") {
        setRole("visitor");
        setStep("basic");
      }
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkEmail = async (val: string) => {
    const trimmed = val.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    setEmailChecking(true);
    try {
      const res = await fetch(`/api/check-email?email=${encodeURIComponent(trimmed)}`);
      const json = await res.json();
      setEmailError(json.exists ? "Ez az e-mail cím már regisztrálva van." : null);
    } catch {
      // ignore network errors silently
    } finally {
      setEmailChecking(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 10);
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
    if (!fullName.trim()) { setError("Add meg a teljes nevedet!"); return; }
    if (!email.trim()) { setError("Add meg az e-mail címedet!"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Adj meg érvényes e-mail címet (pl. nev@example.hu)."); return; }
    if (emailError) { setError(emailError); return; }
    if (!password) { setError("Add meg a jelszavadat!"); return; }
    if (password !== confirmPassword) { setError("A két jelszó nem egyezik meg."); return; }
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
      // Upgrade flow: user already logged in as visitor, just create provider record
      if (isUpgrade) {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) throw new Error("Nincs bejelentkezve. Kérjük, jelentkezz be újra.");

        let avatarUrl = "";
        const galleryUrls: string[] = [];
        if (avatarFile) avatarUrl = await uploadFile(avatarFile, "avatars", `${currentUser.id}/avatar`);
        for (let i = 0; i < galleryFiles.length; i++) {
          galleryUrls.push(await uploadFile(galleryFiles[i], "gallery", `${currentUser.id}/gallery-${i}`));
        }

        const { error: providerError } = await supabase.from("providers").insert({
          user_id: currentUser.id,
          full_name: fullName,
          email: currentUser.email,
          phone,
          counties,
          categories,
          description,
          detailed_description: detailedDescription || null,
          website: website || null,
          avatar_url: avatarUrl || null,
          gallery_urls: galleryUrls,
          approval_status: "pending",
        });
        if (providerError) throw providerError;

        await supabase.auth.updateUser({ data: { role: "provider" } });
        router.push("/auth/register/success?provider=true");
        return;
      }

      // Normal registration flow
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
        const galleryUrls: string[] = [];

        if (avatarFile) {
          avatarUrl = await uploadFile(avatarFile, "avatars", `${authData.user.id}/avatar`);
        }

        for (let i = 0; i < galleryFiles.length; i++) {
          galleryUrls.push(await uploadFile(galleryFiles[i], "gallery", `${authData.user.id}/gallery-${i}`));
        }

        const { error: providerError } = await supabase.from("providers").insert({
          user_id: authData.user.id,
          full_name: fullName,
          email,
          phone,
          counties,
          categories,
          description,
          detailed_description: detailedDescription || null,
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
      const msg = err instanceof Error ? err.message : "Hiba történt a regisztráció során.";
      setError(translateError(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) { setError("Add meg a telefonszámodat!"); return; }
    if (counties.length === 0) { setError("Válassz legalább egy megyét!"); return; }
    if (categories.length === 0) { setError("Válassz legalább egy kategóriát!"); return; }
    setError(null);
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
        <PageHeader icon={UserRound} title="Regisztráció" description="Látogatóként értékelj és ments kedvenceket – szolgáltatóként mutatkozz be ezer leendő párnak." bgColor="#84AAA6" />
        <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <p className="text-gray-900 text-center mb-8" style={{ fontSize: "22px" }}>Melyik típusú fiókot szeretnéd létrehozni?</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => { setRole("visitor"); setStep("basic"); router.replace("/auth/register?type=visitor"); }}
              className="flex flex-col items-center p-8 bg-white border-2 border-gray-200 rounded-xl hover:border-[#84AAA6] hover:shadow-md transition-all group"
            >
              <UserRound className="h-12 w-12 mb-4 text-[#84AAA6]" strokeWidth={1.5} />
              <span className="font-semibold text-gray-900 group-hover:text-[#84AAA6]" style={{ fontSize: "22px" }}>Látogató</span>
              <span className="text-base text-gray-900 mt-2 text-center">
                Böngészem a szolgáltatókat
              </span>
            </button>
            <button
              onClick={() => { setRole("provider"); setStep("basic"); router.replace("/auth/register?type=provider"); }}
              className="flex flex-col items-center p-8 bg-white border-2 border-gray-200 rounded-xl hover:border-[#84AAA6] hover:shadow-md transition-all group"
            >
              <Briefcase className="h-12 w-12 mb-4 text-[#84AAA6]" strokeWidth={1.5} />
              <span className="font-semibold text-gray-900 group-hover:text-[#84AAA6]" style={{ fontSize: "22px" }}>Szolgáltató</span>
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
        <PageHeader icon={UserRound} title="Regisztráció" description="Látogatóként értékelj és ments kedvenceket – szolgáltatóként mutatkozz be ezer leendő párnak." bgColor="#84AAA6" />
        <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <button
              onClick={() => { setStep("role"); router.replace("/auth/register"); }}
              className="text-lg text-gray-900 hover:text-[#84AAA6] mb-4 flex items-center gap-1"
            >
              ← Vissza
            </button>
            <p className="text-gray-900 text-lg">Alapadatok megadása</p>
          </div>

          {/* Progress */}
          <div className="flex gap-2 mb-6">
            <div className="h-1 flex-1 bg-[#84AAA6] rounded-full" />
            <div className={`h-1 flex-1 rounded-full ${role === "provider" ? "bg-gray-200" : "bg-[#84AAA6]"}`} />
          </div>

          <form onSubmit={handleBasicSubmit} className="space-y-4" noValidate>
            <FloatingInput
              accentColor="#84AAA6"
              id="fullName"
              label="Teljes név *"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <div>
              <FloatingInput
                accentColor="#84AAA6"
                id="email"
                label="Email cím *"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                onBlur={() => checkEmail(email)}
              />
              {emailChecking && (
                <p className="text-sm text-gray-400 mt-1 px-1">Ellenőrzés...</p>
              )}
              {emailError && (
                <p className="text-sm text-[#F06C6C] mt-1 px-1">{emailError}</p>
              )}
            </div>

            <FloatingInput
              accentColor="#84AAA6"
              id="password"
              label="Jelszó *"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <FloatingInput
              accentColor="#84AAA6"
              id="confirmPassword"
              label="Jelszó megerősítése *"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && (
              <div className="bg-[#F06C6C]/10 text-[#F06C6C] text-lg px-4 py-3 rounded-xl border border-[#F06C6C]/30">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-[#84AAA6] hover:bg-[#6B8E8A]" disabled={loading || !!emailError}>
              {loading
                ? "Regisztráció..."
                : role === "provider"
                ? "Tovább →"
                : "Regisztráció"}
            </Button>
            <p className="text-sm text-gray-500 text-center">
              <span className="text-base font-bold align-middle">*</span> A csillaggal megjelöltek kitöltése kötelező.
            </p>
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
      <PageHeader icon={UserRound} title="Regisztráció" bgColor="#84AAA6" />
      <div className="flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-5xl">
        <div className="mb-6">
          {!isUpgrade && (
            <button
              onClick={() => setStep("basic")}
              className="text-lg text-gray-900 hover:text-[#84AAA6] mb-4 flex items-center gap-1"
            >
              ← Vissza
            </button>
          )}
          {isUpgrade && (
            <div className="bg-[#84AAA6]/10 border border-[#84AAA6]/30 rounded-xl px-4 py-3 mb-4">
              <p className="text-base text-gray-900">
                Bejelentkezve mint <strong>{email}</strong>. Add meg a szolgáltatói adataidat, és jóváhagyás után megjelensz a kínálatban.
              </p>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          <div className="h-1 flex-1 bg-[#84AAA6] rounded-full" />
          <div className="h-1 flex-1 bg-[#84AAA6] rounded-full" />
        </div>

        <form onSubmit={handleProviderSubmit} noValidate>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-6">
            {/* ── LEFT COLUMN ── */}
            <div className="space-y-6">
              {/* Avatar */}
              <div className="space-y-2">
                <p className="text-base text-gray-800">Tölts fel egy profilképet, hogy a látogatók felismerhessenek.</p>
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

              {/* Short description */}
              <div className="space-y-2">
                <p className="text-base text-gray-800">Megjelenik a profilkártyádon – max. 200 karakter.</p>
                <FloatingTextarea
                  accentColor="#84AAA6"
                  id="description"
                  label="Rövid bemutatkozás"
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                  rows={3}
                />
                <p className="text-xs text-gray-400 text-right">{description.length} / 200</p>
              </div>

              {/* Detailed description */}
              <div className="space-y-2">
                <p className="text-base text-gray-800">Bővebb leírás, csak a profiloldalon látható.</p>
                <FloatingTextarea
                  accentColor="#84AAA6"
                  id="detailed-description"
                  label="Részletes bemutatkozás"
                  value={detailedDescription}
                  onChange={(e) => setDetailedDescription(e.target.value)}
                  rows={6}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <p className="text-base text-gray-800">Ezen a telefonszámon érhetnek el a látogatók.<span className="text-[1.2em] font-bold align-middle ml-0.5">*</span></p>
                <PhoneInput value={phone} onChange={setPhone} />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <p className="text-base text-gray-800">Ha van saját weboldalad a szolgáltatásodról, add meg itt.</p>
                <FloatingInput
                  accentColor="#84AAA6"
                  id="website"
                  label="Weboldal (opcionális)"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="space-y-6">
              <PillSelect
                hint="Jelöld be, hogy milyen megyékben vállalsz munkát. Többet is választhatsz."
                required
                options={countyOptions}
                selected={counties}
                onChange={setCounties}
              />

              <PillSelect
                hint="Milyen szolgáltatást nyújtasz? Többet is választhatsz."
                required
                options={categoryOptions}
                selected={categories}
                onChange={setCategories}
              />

              {/* Gallery */}
              <div className="space-y-2">
                <p className="text-base text-gray-800">Tölts fel képeket a munkáidról. (opcionális, max 10 db)</p>
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
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {error && (
              <div className="bg-[#F06C6C]/10 text-[#F06C6C] text-lg px-4 py-3 rounded-xl border border-[#F06C6C]/30">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full bg-[#84AAA6] hover:bg-[#6B8E8A]" disabled={loading}>
              {loading ? "Regisztráció folyamatban..." : "Regisztráció elküldése"}
            </Button>
            <p className="text-sm text-gray-500 text-center">
              <span className="text-base font-bold align-middle">*</span> A csillaggal megjelöltek kitöltése kötelező.
            </p>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
}
