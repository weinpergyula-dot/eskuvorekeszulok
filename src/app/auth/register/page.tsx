"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { signUpAction, createProviderProfileAction, acceptTosAction, getSignedUploadUrlAction, sendConfirmationEmailAction, deleteUserAction, setProfileAvatarAction, updateOAuthProfileAction } from "./actions";
import { logError } from "@/lib/log-error";
import { Button } from "@/components/ui/button";
import { FloatingInput, FloatingTextarea } from "@/components/ui/floating-input";
import { Label } from "@/components/ui/label";
import { COUNTIES, CATEGORY_LABELS, type ServiceCategory } from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { PhoneInput } from "@/components/ui/phone-input";
import { UserRound, Briefcase, ImagePlus, X, CheckCircle2, Link2Off, ArrowLeft, FileText } from "lucide-react";
import { compressImage, MAX_UPLOAD_BYTES, MAX_UPLOAD_MB, ALLOWED_IMAGE_ACCEPT } from "@/lib/image-utils"

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

type Step = "role" | "basic" | "provider-details";

function PillSelect<T extends string>({
  label,
  hint,
  required,
  options,
  selected,
  onChange,
  disabledValues,
}: {
  label?: string;
  hint?: string;
  required?: boolean;
  options: { value: T; label: string }[];
  selected: T[];
  onChange: (next: T[]) => void;
  disabledValues?: T[];
}) {
  const toggle = (value: T) => {
    if (disabledValues?.includes(value)) return;
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
          const isDisabled = disabledValues?.includes(opt.value) ?? false;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                isDisabled
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
                  : isSelected
                    ? "bg-[#84AAA6] text-white border-[#84AAA6] cursor-pointer"
                    : "bg-white text-gray-700 border-gray-300 hover:border-[#84AAA6] hover:text-[#84AAA6] cursor-pointer"
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
  if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("network") || msg.toLowerCase().includes("fetch")) return "A szerver átmenetileg nem elérhető. Kérjük, próbáld újra néhány perc múlva.";
  return msg;
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<"visitor" | "provider">("visitor");
  const [isUpgrade, setIsUpgrade] = useState(false);
  const [prefillMode, setPrefillMode] = useState(false);
  const [prefillRoleSelect, setPrefillRoleSelect] = useState(false);
  const [oauthUserId, setOauthUserId] = useState<string | null>(null);
  const [googleAvatarUrl, setGoogleAvatarUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  // Basic fields
  const [consentsAccepted, setConsentsAccepted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Provider-only fields
  const [displayNameChoice, setDisplayNameChoice] = useState<"own" | "business">("own");
  const [businessName, setBusinessName] = useState("");
  const providerDisplayName = displayNameChoice === "own" ? fullName : businessName;
  const [phone, setPhone] = useState("");
  const [counties, setCounties] = useState<string[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [description, setDescription] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  // Pricing fields (provider only)
  const [pricingText, setPricingText] = useState("");
  const [pricingPdfFile, setPricingPdfFile] = useState<File | null>(null);
  const pricingPdfInputRef = useRef<HTMLInputElement>(null);

  // Visitor avatar (basic step)
  const [visitorAvatarFile, setVisitorAvatarFile] = useState<File | null>(null);
  const [visitorAvatarPreview, setVisitorAvatarPreview] = useState<string | null>(null);
  const visitorAvatarInputRef = useRef<HTMLInputElement>(null);

  const basicValid = prefillMode
    ? fullName.trim().length > 0 && consentsAccepted
    : (fullName.trim().length > 0 &&
       email.trim().length > 0 &&
       /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
       !emailError &&
       password.length > 0 &&
       confirmPassword.length > 0 &&
       password === confirmPassword &&
       consentsAccepted);

  const providerValid =
    providerDisplayName.trim().length > 0 &&
    phone.trim().length > 0 &&
    counties.length > 0 &&
    categories.length > 0;

  useEffect(() => {
    const type = searchParams.get("type");
    const prefill = searchParams.get("prefill");

    const init = async () => {
      if (!supabase) return;

      // ── OAuth prefill: user just returned from Google OAuth ──
      if (prefill === "1") {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const savedRole = localStorage.getItem("oauth_register_role") as "visitor" | "provider" | null;
        localStorage.removeItem("oauth_register_role");
        setPrefillMode(true);
        setOauthUserId(user.id);
        setFullName(user.user_metadata?.full_name ?? "");
        setEmail(user.email ?? "");
        if (user.user_metadata?.avatar_url) {
          setGoogleAvatarUrl(user.user_metadata.avatar_url);
          setVisitorAvatarPreview(user.user_metadata.avatar_url);
        }
        if (savedRole) {
          // Came from register page — role already chosen
          setRole(savedRole);
          setStep("basic");
        } else {
          // Came from login page — let user pick role first
          setPrefillRoleSelect(true);
        }
        return;
      }

      // ── Normal type-based routing ──
      const { data: { user } } = await supabase.auth.getUser();
      if (type === "provider") {
        setRole("provider");
        if (user) {
          setFullName(user.user_metadata?.full_name ?? "");
          setEmail(user.email ?? "");
          setIsUpgrade(true);
          setStep("provider-details");
          const { data: profileData } = await supabase.from("profiles").select("avatar_url").eq("user_id", user.id).single();
          if (profileData?.avatar_url) setAvatarPreview(profileData.avatar_url);
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
    if (!trimmed) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Adj meg érvényes e-mail-címet (pl. nev@example.hu).");
      return;
    }
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImageError(null);
    if (file.size > MAX_UPLOAD_BYTES) {
      setImageError(`A kép mérete nem haladhatja meg a ${MAX_UPLOAD_MB} MB-ot.`);
      return;
    }
    const compressed = await compressImage(file);
    setAvatarFile(compressed);
    setAvatarPreview(URL.createObjectURL(compressed));
  };

  const handleGalleryAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? []);
    e.target.value = "";
    setImageError(null);
    const oversized = newFiles.find((f) => f.size > MAX_UPLOAD_BYTES);
    if (oversized) {
      setImageError(`Egy vagy több kép meghaladja a ${MAX_UPLOAD_MB} MB-os limitet.`);
      return;
    }
    const compressed = await Promise.all(newFiles.map((f) => compressImage(f)));
    setGalleryFiles((prev) => [...prev, ...compressed].slice(0, 10));
  };

  const removeGalleryFile = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleVisitorAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImageError(null);
    if (file.size > MAX_UPLOAD_BYTES) {
      setImageError(`A kép mérete nem haladhatja meg a ${MAX_UPLOAD_MB} MB-ot.`);
      return;
    }
    const compressed = await compressImage(file);
    setVisitorAvatarFile(compressed);
    setVisitorAvatarPreview(URL.createObjectURL(compressed));
  };

  const removeVisitorAvatar = () => {
    setVisitorAvatarFile(null);
    setVisitorAvatarPreview(googleAvatarUrl ?? null);
    if (visitorAvatarInputRef.current) visitorAvatarInputRef.current.value = "";
  };

  const handleGooglePrefill = async () => {
    if (!supabase) return;
    setLoading(true);
    localStorage.setItem("oauth_register_role", role);
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback` },
    });
    if (error) {
      setError("Nem sikerült a Google OAuth elindítása. Kérjük, próbáld újra.");
      localStorage.removeItem("oauth_register_role");
      setLoading(false);
    }
    // On success the page redirects — no cleanup needed
  };

  const handleDisconnect = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setPrefillMode(false);
    setOauthUserId(null);
    setGoogleAvatarUrl(null);
    setEmail("");
    setFullName("");
    setVisitorAvatarFile(null);
    setVisitorAvatarPreview(null);
    router.replace(`/auth/register?type=${role}`);
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const result = await getSignedUploadUrlAction(bucket, path);
    if ("error" in result) throw new Error(result.error);
    const { error } = await supabase.storage.from(bucket).uploadToSignedUrl(result.path, result.token, file);
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleBasicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { setError("Add meg a teljes nevedet!"); return; }
    if (!prefillMode) {
      if (!email.trim()) { setError("Add meg az e-mail címedet!"); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Adj meg érvényes e-mail címet (pl. nev@example.hu)."); return; }
      if (emailError) { setError(emailError); return; }
      if (!password) { setError("Add meg a jelszavadat!"); return; }
      if (password !== confirmPassword) { setError("A két jelszó nem egyezik meg."); return; }
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
      // ── OAuth prefill flow: user signed in via Google, just finalise registration ──
      if (prefillMode && oauthUserId) {
        if (role === "provider") {
          let avatarUrl = "";
          const galleryUrls: string[] = [];
          let pricingPdfUrl: string | null = null;
          if (avatarFile) avatarUrl = await uploadFile(avatarFile, "avatars", `${oauthUserId}/avatar`);
          for (let i = 0; i < galleryFiles.length; i++) {
            galleryUrls.push(await uploadFile(galleryFiles[i], "gallery", `${oauthUserId}/gallery-${i}`));
          }
          if (pricingPdfFile) pricingPdfUrl = await uploadFile(pricingPdfFile, "avatars", `${oauthUserId}/pricing/pricing.pdf`);
          const { error: providerError } = await createProviderProfileAction(oauthUserId, {
            full_name: providerDisplayName,
            email,
            phone,
            counties,
            categories,
            description,
            detailed_description: detailedDescription || null,
            website: website || null,
            avatar_url: avatarUrl || null,
            gallery_urls: galleryUrls,
            pricing_text: pricingText || null,
            pricing_pdf_url: pricingPdfUrl,
          });
          if (providerError) throw new Error(providerError);
          // createProviderProfileAction handles TOS; also update role + metadata
          await updateOAuthProfileAction(oauthUserId, fullName, "provider");
        } else {
          const { error: oauthError } = await updateOAuthProfileAction(oauthUserId, fullName, "visitor");
          if (oauthError) throw new Error(oauthError);
          if (visitorAvatarFile) {
            try {
              const avatarUrl = await uploadFile(visitorAvatarFile, "avatars", `${oauthUserId}/visitor-avatar`);
              await setProfileAvatarAction(oauthUserId, avatarUrl);
            } catch {
              // non-fatal
            }
          }
        }
        router.push(role === "provider" ? "/auth/register/success?provider=true&oauth=true" : "/auth/register/success?visitor=true&oauth=true");
        return;
      }

      // ── Upgrade flow: user already logged in as visitor, just create provider record ──
      if (isUpgrade) {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) throw new Error("Nincs bejelentkezve. Kérjük, jelentkezz be újra.");

        let avatarUrl = "";
        const galleryUrls: string[] = [];
        let upgradePricingPdfUrl: string | null = null;
        if (avatarFile) avatarUrl = await uploadFile(avatarFile, "avatars", `${currentUser.id}/avatar`);
        for (let i = 0; i < galleryFiles.length; i++) {
          galleryUrls.push(await uploadFile(galleryFiles[i], "gallery", `${currentUser.id}/gallery-${i}`));
        }
        if (pricingPdfFile) upgradePricingPdfUrl = await uploadFile(pricingPdfFile, "avatars", `${currentUser.id}/pricing/pricing.pdf`);

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
          pricing_text: pricingText || null,
          pricing_pdf_url: upgradePricingPdfUrl,
          approval_status: "pending",
          featured: null,
        });
        if (providerError) throw providerError;

        await supabase.auth.updateUser({ data: { role: "provider" } });
        router.push("/auth/register/success?provider=true");
        return;
      }

      // Normal registration flow – Supabase creates the user (email sending disabled on Supabase)
      const { userId: newUserId, error: signUpError } = await signUpAction(
        email,
        password,
        `${window.location.origin}/auth/callback`,
        { full_name: fullName, role }
      );

      if (signUpError) throw new Error(signUpError);
      if (!newUserId) throw new Error("Ismeretlen hiba történt.");

      if (role === "provider") {
        // Any failure after user creation rolls back by deleting the auth user,
        // so we never end up with a provider profile-less "zombie" account.
        try {
          let avatarUrl = "";
          const galleryUrls: string[] = [];
          let newPricingPdfUrl: string | null = null;

          if (avatarFile) {
            avatarUrl = await uploadFile(avatarFile, "avatars", `${newUserId}/avatar`);
          }
          for (let i = 0; i < galleryFiles.length; i++) {
            galleryUrls.push(await uploadFile(galleryFiles[i], "gallery", `${newUserId}/gallery-${i}`));
          }
          if (pricingPdfFile) {
            newPricingPdfUrl = await uploadFile(pricingPdfFile, "avatars", `${newUserId}/pricing/pricing.pdf`);
          }

          const { error: providerError } = await createProviderProfileAction(newUserId, {
            full_name: providerDisplayName,
            email,
            phone,
            counties,
            categories,
            description,
            detailed_description: detailedDescription || null,
            website: website || null,
            avatar_url: avatarUrl || null,
            gallery_urls: galleryUrls,
            pricing_text: pricingText || null,
            pricing_pdf_url: newPricingPdfUrl,
          });
          if (providerError) throw new Error(providerError);

          const { error: confirmError } = await sendConfirmationEmailAction(email, fullName, window.location.origin);
          if (confirmError) throw new Error(confirmError);
        } catch (innerErr) {
          const msg = innerErr instanceof Error ? innerErr.message : String(innerErr);
          await logError("registration/provider", msg, { email });
          await deleteUserAction(newUserId);
          throw innerErr;
        }
      } else {
        const { error: tosError } = await acceptTosAction(newUserId);
        if (tosError) throw new Error(tosError);

        if (visitorAvatarFile) {
          try {
            const avatarUrl = await uploadFile(visitorAvatarFile, "avatars", `${newUserId}/visitor-avatar`);
            await setProfileAvatarAction(newUserId, avatarUrl);
          } catch {
            // non-fatal — avatar upload failure does not block registration
          }
        }

        const { error: confirmError } = await sendConfirmationEmailAction(email, fullName, window.location.origin);
        if (confirmError) throw new Error(confirmError);
      }

      router.push(
        role === "provider"
          ? "/auth/register/success?provider=true"
          : "/auth/register/success?visitor=true"
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

  // Prefill role selection (Google login → new user, no role in localStorage)
  if (prefillRoleSelect) {
    return (
      <div>
        <PageHeader icon={UserRound} title="Regisztráció" description="Google fiókod össze van kötve. Válaszd ki, milyen fiókot szeretnél létrehozni." bgColor="#84AAA6" />
        <div className="flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-2xl">
            <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl mb-6">
              <GoogleIcon size={20} />
              <div>
                <p className="text-sm font-semibold text-green-800">Google fiók összekapcsolva</p>
                <p className="text-sm text-green-700">{email}</p>
              </div>
            </div>
            <p className="text-gray-900 text-center mb-6" style={{ fontSize: "22px" }}>Melyik típusú fiókot szeretnéd létrehozni?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => { setRole("visitor"); setPrefillRoleSelect(false); setStep("basic"); }}
                className="flex flex-col items-start p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-[#84AAA6] hover:shadow-md transition-all group text-left"
              >
                <UserRound className="h-10 w-10 mb-3 text-[#84AAA6]" strokeWidth={1.5} />
                <span className="font-semibold text-gray-900 group-hover:text-[#84AAA6] text-xl mb-0.5">Látogató</span>
                <span className="text-sm text-gray-400 mb-4">Ingyenes fiók</span>
                <ul className="space-y-2 text-sm text-gray-700 flex-1">
                  <li className="flex items-start gap-2"><span className="text-[#84AAA6] font-bold shrink-0">✓</span> Böngészés 20 kategóriában</li>
                  <li className="flex items-start gap-2"><span className="text-[#84AAA6] font-bold shrink-0">✓</span> Értékelések olvasása és írása</li>
                  <li className="flex items-start gap-2"><span className="text-[#84AAA6] font-bold shrink-0">✓</span> Kedvencek mentése</li>
                  <li className="flex items-start gap-2"><span className="text-[#84AAA6] font-bold shrink-0">✓</span> Csoportos ajánlatkérés küldése több szolgáltatónak egyszerre</li>
                  <li className="flex items-start gap-2"><span className="text-[#84AAA6] font-bold shrink-0">✓</span> Belső üzenetküldő a szolgáltatókkal</li>
                </ul>
                <span className="sm:hidden mt-4 w-full text-center py-2 border border-[#84AAA6] rounded-lg text-[#84AAA6] font-semibold block">
                  Regisztrálok
                </span>
              </button>
              <button
                onClick={() => { setRole("provider"); setPrefillRoleSelect(false); setStep("basic"); }}
                className="flex flex-col items-start p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-[#84AAA6] hover:shadow-md transition-all group text-left"
              >
                <Briefcase className="h-10 w-10 mb-3 text-[#84AAA6]" strokeWidth={1.5} />
                <span className="font-semibold text-gray-900 group-hover:text-[#84AAA6] text-xl mb-0.5">Szolgáltató</span>
                <span className="text-sm text-gray-400 mb-4">Ingyenes profil</span>
                <ul className="space-y-2 text-sm text-gray-700 flex-1">
                  <li className="flex items-start gap-2"><span className="text-[#84AAA6] font-bold shrink-0">✓</span> Ingyenes szolgáltatói profil</li>
                  <li className="flex items-start gap-2"><span className="text-[#84AAA6] font-bold shrink-0">✓</span> Képgaléria feltöltése</li>
                  <li className="flex items-start gap-2"><span className="text-[#84AAA6] font-bold shrink-0">✓</span> Ajánlatkérések fogadása érdeklődő pároktól</li>
                  <li className="flex items-start gap-2"><span className="text-[#84AAA6] font-bold shrink-0">✓</span> Belső üzenetküldő az érdeklődőkkel</li>
                </ul>
                <span className="sm:hidden mt-4 w-full text-center py-2 border border-[#84AAA6] rounded-lg text-[#84AAA6] font-semibold block">
                  Regisztrálok
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 1 – Role selection
  if (step === "role") {
    return (
      <div>
        <PageHeader icon={UserRound} title="Regisztráció" description="Csatlakozz az Esküvőre Készülök közösséghez – látogatóként vagy szolgáltatóként, ingyenesen." bgColor="#84AAA6" />
        <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl">
          <p className="text-gray-900 text-center mb-8" style={{ fontSize: "22px" }}>Melyik típusú fiókot szeretnéd létrehozni?</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => { setRole("visitor"); setStep("basic"); router.replace("/auth/register?type=visitor"); }}
              className="flex flex-col items-start p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-[#84AAA6] hover:shadow-md transition-all group text-left"
            >
              <UserRound className="h-10 w-10 mb-3 text-[#84AAA6]" strokeWidth={1.5} />
              <span className="font-semibold text-gray-900 group-hover:text-[#84AAA6] text-xl mb-0.5">Látogató</span>
              <span className="text-sm text-gray-400 mb-4">Ingyenes fiók</span>
              <ul className="space-y-2 text-sm text-gray-700 flex-1">
                <li className="flex items-start gap-2"><span className="text-[#84AAA6] font-bold shrink-0">✓</span> Böngészés 20 kategóriában</li>
                <li className="flex items-start gap-2"><span className="text-[#84AAA6] font-bold shrink-0">✓</span> Értékelések olvasása és írása</li>
                <li className="flex items-start gap-2"><span className="text-[#84AAA6] font-bold shrink-0">✓</span> Kedvencek mentése</li>
                <li className="flex items-start gap-2"><span className="text-[#84AAA6] font-bold shrink-0">✓</span> Csoportos ajánlatkérés küldése több szolgáltatónak egyszerre</li>
                <li className="flex items-start gap-2"><span className="text-[#84AAA6] font-bold shrink-0">✓</span> Belső üzenetküldő a szolgáltatókkal</li>
              </ul>
              <span className="sm:hidden mt-4 w-full text-center py-2 border border-[#84AAA6] rounded-lg text-[#84AAA6] font-semibold block">
                Regisztrálok
              </span>
            </button>
            <button
              onClick={() => { setRole("provider"); setStep("basic"); router.replace("/auth/register?type=provider"); }}
              className="flex flex-col items-start p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-[#84AAA6] hover:shadow-md transition-all group text-left"
            >
              <Briefcase className="h-10 w-10 mb-3 text-[#84AAA6]" strokeWidth={1.5} />
              <span className="font-semibold text-gray-900 group-hover:text-[#84AAA6] text-xl mb-0.5">Szolgáltató</span>
              <span className="text-sm text-gray-400 mb-4">Ingyenes profil</span>
              <ul className="space-y-2 text-sm text-gray-700 flex-1">
                <li className="flex items-start gap-2"><span className="text-[#84AAA6] font-bold shrink-0">✓</span> Ingyenes szolgáltatói profil létrehozása</li>
                <li className="flex items-start gap-2"><span className="text-[#84AAA6] font-bold shrink-0">✓</span> Képgaléria feltöltése</li>
                <li className="flex items-start gap-2"><span className="text-[#84AAA6] font-bold shrink-0">✓</span> Ajánlatkérések fogadása érdeklődő pároktól</li>
                <li className="flex items-start gap-2"><span className="text-[#84AAA6] font-bold shrink-0">✓</span> Belső üzenetküldő az érdeklődőkkel</li>
              </ul>
              <span className="sm:hidden mt-4 w-full text-center py-2 border border-[#84AAA6] rounded-lg text-[#84AAA6] font-semibold block">
                Regisztrálok
              </span>
            </button>
          </div>

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

  // Step 2 – Basic info
  if (step === "basic") {
    return (
      <div>
        <PageHeader
          icon={UserRound}
          title={role === "visitor" ? "Regisztráció – Látogató" : "Regisztráció – Szolgáltatói fiók"}
          description={
            role === "visitor"
              ? "Értékeld a szolgáltatókat, ments kedvenceket, és küldj ajánlatkérést egyszerre több szakembernek – ingyenesen, egy helyen."
              : "Add meg a bejelentkezési adataidat. A következő lépésben töltheted ki a nyilvános profilodat."
          }
          bgColor="#84AAA6"
          backHref="/auth/register"
        />
        <div className="flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg">
          <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm p-8">
          <p className="text-gray-900 text-lg mb-6">Alapadatok megadása</p>

          {/* Progress */}
          <div className="flex gap-2 mb-6">
            <div className="h-1 flex-1 bg-[#84AAA6] rounded-full" />
            <div className={`h-1 flex-1 rounded-full ${role === "provider" ? "bg-gray-200" : "bg-[#84AAA6]"}`} />
          </div>

          <form onSubmit={handleBasicSubmit} className="space-y-4" noValidate>
            {/* Google prefill / connected-account UI */}
            {prefillMode ? (
              <div className="flex items-center justify-between gap-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <GoogleIcon size={20} />
                  <div>
                    <p className="text-sm font-semibold text-green-800 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Google fiók összekapcsolva
                    </p>
                    <p className="text-sm text-green-700">{email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors shrink-0"
                >
                  <Link2Off className="h-3.5 w-3.5" />
                  Leválaszt
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleGooglePrefill}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors font-medium text-base disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <GoogleIcon />
                  {loading ? "Átirányítás..." : "Regisztráció Google-lal"}
                </button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-sm text-gray-400">vagy add meg manuálisan</span>
                  </div>
                </div>
              </>
            )}

            <FloatingInput
              accentColor="#84AAA6"
              id="fullName"
              label="Teljes név *"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            {!prefillMode && (
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
            )}

            {!prefillMode && (
              <FloatingInput
                accentColor="#84AAA6"
                id="password"
                label="Jelszó *"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}

            {!prefillMode && (
              <div>
                <FloatingInput
                  accentColor="#84AAA6"
                  id="confirmPassword"
                  label="Jelszó megerősítése *"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPasswordError(null); }}
                  onBlur={() => {
                    if (confirmPassword && password !== confirmPassword) {
                      setConfirmPasswordError("A két jelszó nem egyezik.");
                    } else {
                      setConfirmPasswordError(null);
                    }
                  }}
                />
                {confirmPasswordError && (
                  <p className="text-sm text-[#F06C6C] mt-1 px-1">{confirmPasswordError}</p>
                )}
              </div>
            )}

            {role === "visitor" && (
              <div className="space-y-2">
                <p className="text-base text-gray-800">Profilkép (opcionális)</p>
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#84AAA6] overflow-hidden bg-gray-50 shrink-0"
                    onClick={() => visitorAvatarInputRef.current?.click()}
                  >
                    {visitorAvatarPreview
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={visitorAvatarPreview} alt="preview" className="w-full h-full object-cover" />
                      : <span className="text-xl">📷</span>}
                  </div>
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <button type="button" onClick={() => visitorAvatarInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#84AAA6] hover:text-[#84AAA6] text-gray-600 text-sm font-medium transition-colors w-fit"
                    >
                      <ImagePlus className="h-4 w-4" />
                      {visitorAvatarFile ? "Csere" : "Kép feltöltése"}
                    </button>
                    {visitorAvatarFile && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-sm max-w-xs">
                        <span className="text-gray-700 truncate flex-1">{visitorAvatarFile.name}</span>
                        <button type="button" onClick={removeVisitorAvatar} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <input ref={visitorAvatarInputRef} type="file" accept={ALLOWED_IMAGE_ACCEPT} className="hidden" onChange={handleVisitorAvatarChange} />
                <p className="text-xs text-gray-400">max {MAX_UPLOAD_MB} MB</p>
              </div>
            )}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentsAccepted}
                onChange={(e) => setConsentsAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 accent-[#84AAA6] cursor-pointer shrink-0"
              />
              <span className="text-base text-gray-700">
                Elolvastam és elfogadom az{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#84AAA6] underline">
                  Általános Szerződési Feltételeket
                </a>{" "}
                és az{" "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#84AAA6] underline">
                  Adatvédelmi tájékoztatóban
                </a>{" "}
                foglaltakat.{" "}
                <span className="text-[1.1em] font-bold align-middle">*</span>
              </span>
            </label>

            {imageError && (
              <div className="bg-[#F06C6C]/10 text-[#F06C6C] text-sm px-4 py-3 rounded-xl border border-[#F06C6C]/30">
                {imageError}
              </div>
            )}
            {error && (
              <div className="bg-[#F06C6C]/10 text-[#F06C6C] text-lg px-4 py-3 rounded-xl border border-[#F06C6C]/30">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-[#84AAA6] hover:bg-[#6B8E8A]" disabled={loading || !basicValid}>
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
      </div>
    );
  }

  // Step 3 – Provider details
  return (
    <div>
      <PageHeader icon={UserRound} title="Regisztráció – Szolgáltatói profil" description="Töltsd ki a nyilvános profilodat – ez jelenik majd meg az oldalon az érdeklődő pároknak." bgColor="#84AAA6" />
      {!isUpgrade && (
        <div className="w-full bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <button
              onClick={() => setStep("basic")}
              className="inline-flex items-center gap-1.5 text-[15px] font-medium transition-colors"
              style={{ color: "#84AAA6" }}
            >
              <ArrowLeft className="h-4 w-4" />
              Vissza
            </button>
          </div>
        </div>
      )}
      <div className="flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-5xl">
        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm p-8">
        {isUpgrade && (
          <div className="bg-[#84AAA6]/10 border border-[#84AAA6]/30 rounded-xl px-4 py-3 mb-6">
            <p className="text-base text-gray-900">
              Bejelentkezve mint <strong>{email}</strong>. Add meg a szolgáltatói adataidat, és jóváhagyás után megjelensz a kínálatban.
            </p>
          </div>
        )}

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
                    className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#84AAA6] overflow-hidden bg-gray-50 shrink-0"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    {avatarPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">📷</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#84AAA6] hover:text-[#84AAA6] text-gray-600 text-sm font-medium transition-colors w-fit"
                    >
                      <ImagePlus className="h-4 w-4" />
                      {avatarFile ? "Csere" : "Kép feltöltése"}
                    </button>
                    {avatarFile && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-sm max-w-xs">
                        <span className="text-gray-700 truncate flex-1">{avatarFile.name}</span>
                        <button
                          type="button"
                          onClick={removeAvatar}
                          className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept={ALLOWED_IMAGE_ACCEPT}
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <p className="text-xs text-gray-400">max {MAX_UPLOAD_MB} MB</p>
              </div>

              {/* Display name */}
              <div className="space-y-2">
                <p className="text-base text-gray-800">
                  Milyen névvel jelenj meg a profilkártyádon?<span className="text-[1.2em] font-bold align-middle ml-0.5">*</span>
                </p>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="displayNameChoice"
                      value="own"
                      checked={displayNameChoice === "own"}
                      onChange={() => setDisplayNameChoice("own")}
                      className="h-4 w-4 accent-[#84AAA6]"
                    />
                    <span className="text-base text-gray-700">
                      Saját nevem{fullName ? <span className="ml-1 text-gray-500">({fullName})</span> : null}
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="displayNameChoice"
                      value="business"
                      checked={displayNameChoice === "business"}
                      onChange={() => setDisplayNameChoice("business")}
                      className="h-4 w-4 accent-[#84AAA6]"
                    />
                    <span className="text-base text-gray-700">Vállalkozásom neve</span>
                  </label>
                </div>
                {displayNameChoice === "business" && (
                  <FloatingInput
                    accentColor="#84AAA6"
                    id="businessName"
                    label="Vállalkozás neve *"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    compact
                  />
                )}
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
                disabledValues={
                  counties.includes("Országosan")
                    ? countyOptions.map((o) => o.value).filter((v) => v !== "Országosan")
                    : counties.length > 0
                      ? ["Országosan" as string]
                      : []
                }
                onChange={(next) => {
                  if (!counties.includes("Országosan") && next.includes("Országosan")) {
                    setCounties(["Országosan"]);
                  } else {
                    setCounties(next.filter((c) => c !== "Országosan"));
                  }
                }}
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
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={galleryFiles.length >= 10}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#84AAA6] hover:text-[#84AAA6] text-gray-600 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ImagePlus className="h-4 w-4" />
                    Képek hozzáadása
                  </button>
                  {galleryFiles.length > 0
                    ? <span className="text-sm text-gray-500">{galleryFiles.length} / 10</span>
                    : <span className="text-xs text-gray-400">max {MAX_UPLOAD_MB} MB / kép</span>
                  }
                </div>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept={ALLOWED_IMAGE_ACCEPT}
                  multiple
                  className="hidden"
                  onChange={handleGalleryAdd}
                />
                {galleryFiles.length > 0 && (
                  <ul className="space-y-1 mt-1">
                    {galleryFiles.map((file, idx) => (
                      <li key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                        <span className="text-gray-700 truncate flex-1">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeGalleryFile(idx)}
                          className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Pricing section */}
              <div className="space-y-3 border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div>
                  <p className="text-base font-semibold text-gray-900">Árak</p>
                  <p className="text-sm text-gray-500 mt-0.5">Tájékoztasd a leendő párokat a várható költségekről.</p>
                </div>
                <FloatingTextarea
                  accentColor="#84AAA6"
                  id="reg-pricing-text"
                  label="Szöveges árinformáció (opcionális)"
                  value={pricingText}
                  onChange={(e) => setPricingText(e.target.value)}
                  rows={4}
                />
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 font-medium">Árlista PDF (opcionális)</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => pricingPdfInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#84AAA6] hover:text-[#84AAA6] text-gray-600 text-sm font-medium transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      {pricingPdfFile ? "PDF módosítása" : "PDF feltöltése"}
                    </button>
                    {pricingPdfFile && (
                      <span className="text-sm text-[#84AAA6] flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {pricingPdfFile.name}
                        <button type="button" onClick={() => setPricingPdfFile(null)} className="text-gray-400 hover:text-red-500 ml-1">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    )}
                  </div>
                  <input
                    ref={pricingPdfInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) setPricingPdfFile(f); e.target.value = ""; }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {imageError && (
              <div className="bg-[#F06C6C]/10 text-[#F06C6C] text-sm px-4 py-3 rounded-xl border border-[#F06C6C]/30">
                {imageError}
              </div>
            )}
            {error && (
              <div className="bg-[#F06C6C]/10 text-[#F06C6C] text-lg px-4 py-3 rounded-xl border border-[#F06C6C]/30">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full bg-[#84AAA6] hover:bg-[#6B8E8A]" disabled={loading || !providerValid}>
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
