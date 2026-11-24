"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import type { UserRole } from "@/lib/types";
import type { UserIdentity } from "@supabase/supabase-js";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB, ALLOWED_IMAGE_TYPES, ALLOWED_IMAGE_ACCEPT } from "@/lib/image-utils";

// ── Avatar crop modal ─────────────────────────────────────────────────────────

const PREVIEW_SIZE = 240;
const CROP_OUTPUT  = 400;

function AvatarCropModal({
  src,
  onConfirm,
  onCancel,
}: {
  src: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const [scale, setScale]       = useState(1);
  const [minScale, setMinScale] = useState(1);
  const [offset, setOffset]     = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragOrigin              = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });
  const canvasRef               = useRef<HTMLCanvasElement>(null);
  const naturalSize             = useRef({ w: 1, h: 1 });

  // Load image to determine initial cover-scale
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      naturalSize.current = { w: img.naturalWidth, h: img.naturalHeight };
      // cover: both dimensions >= PREVIEW_SIZE when width = PREVIEW_SIZE * scale
      const coverScale = Math.max(1, img.naturalWidth / img.naturalHeight);
      setMinScale(coverScale);
      setScale(coverScale);
      setOffset({ x: 0, y: 0 });
    };
    img.src = src;
  }, [src]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCancel]);

  const startDrag = useCallback((clientX: number, clientY: number) => {
    setDragging(true);
    dragOrigin.current = { mx: clientX, my: clientY, ox: offset.x, oy: offset.y };
  }, [offset]);

  const moveDrag = useCallback((clientX: number, clientY: number) => {
    if (!dragging) return;
    const dx = clientX - dragOrigin.current.mx;
    const dy = clientY - dragOrigin.current.my;
    setOffset({ x: dragOrigin.current.ox + dx, y: dragOrigin.current.oy + dy });
  }, [dragging]);

  const stopDrag = useCallback(() => setDragging(false), []);

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = CROP_OUTPUT;
    canvas.height = CROP_OUTPUT;

    const { w: nw, h: nh } = naturalSize.current;
    const displayedW = PREVIEW_SIZE * scale;
    const displayedH = (nh / nw) * displayedW;

    const imgLeft = PREVIEW_SIZE / 2 + offset.x - displayedW / 2;
    const imgTop  = PREVIEW_SIZE / 2 + offset.y - displayedH / 2;

    const ratioX = displayedW / nw;
    const ratioY = displayedH / nh;

    const srcX = -imgLeft / ratioX;
    const srcY = -imgTop  / ratioY;
    const srcW = PREVIEW_SIZE / ratioX;
    const srcH = PREVIEW_SIZE / ratioY;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, CROP_OUTPUT, CROP_OUTPUT);
      canvas.toBlob((blob) => { if (blob) onConfirm(blob); }, "image/jpeg", 0.92);
    };
    img.src = src;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm space-y-5 p-6">
        <h3 className="text-base font-semibold text-gray-900">Profilkép beállítása</h3>

        {/* Preview circle */}
        <div
          className="mx-auto rounded-full overflow-hidden bg-gray-100 select-none"
          style={{
            width: PREVIEW_SIZE, height: PREVIEW_SIZE,
            cursor: dragging ? "grabbing" : "grab",
            backgroundImage: `url(${src})`,
            backgroundSize: `${PREVIEW_SIZE * scale}px`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: `calc(50% + ${offset.x}px) calc(50% + ${offset.y}px)`,
            touchAction: "none",
          }}
          onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
          onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          onTouchStart={(e) => { const t = e.touches[0]; startDrag(t.clientX, t.clientY); }}
          onTouchMove={(e) => { e.preventDefault(); const t = e.touches[0]; moveDrag(t.clientX, t.clientY); }}
          onTouchEnd={stopDrag}
        />

        {/* Zoom slider */}
        <div className="flex items-center gap-3 px-1">
          <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/>
          </svg>
          <input
            type="range"
            min={minScale}
            max={minScale * 3}
            step={0.01}
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="flex-1 accent-[#84AAA6]"
          />
          <svg className="h-5 w-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/>
          </svg>
        </div>
        <p className="text-xs text-gray-400 text-center -mt-3">Húzd a képet a kör belsejében, csíkkal nagyítsd</p>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>Mégse</Button>
          <Button onClick={handleConfirm} className="bg-[#84AAA6] hover:bg-[#6B8E8A]">Alkalmaz</Button>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

interface AccountInfoProps {
  userId: string;
  initialName: string;
  email: string;
  role?: UserRole;
}

export function AccountInfoForm({ userId, initialName, email, role }: AccountInfoProps) {
  const supabase = createClient();
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Avatar — shown for visitors and admins (providers manage it in Szolgáltatói profil)
  const showAvatar = role !== "provider";
  const [avatarPreview, setAvatarPreview]   = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarSizeError, setAvatarSizeError] = useState<string | null>(null);
  const [cropSrc, setCropSrc]               = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showAvatar || !supabase) return;
    supabase.from("profiles").select("avatar_url").eq("user_id", userId).single()
      .then(({ data }) => { if (data?.avatar_url) setAvatarPreview(data.avatar_url); });
  }, [userId, showAvatar]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setAvatarSizeError(null);
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setAvatarSizeError("Nem támogatott formátum. Kérjük JPEG, PNG vagy WebP képet tölts fel.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setAvatarSizeError(`A kép mérete nem haladhatja meg a ${MAX_UPLOAD_MB} MB-ot.`);
      return;
    }
    setCropSrc(URL.createObjectURL(file));
  };

  const handleCropConfirm = async (blob: Blob) => {
    setCropSrc(null);
    if (!supabase) return;
    setAvatarPreview(URL.createObjectURL(blob));
    setAvatarUploading(true);
    try {
      const path = `${userId}/avatar`;
      const { error: uploadError } = await supabase.storage
        .from("avatars").upload(path, blob, { upsert: true, contentType: "image/jpeg" });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatarUrl = `${urlData.publicUrl}?v=${Date.now()}`;
      await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("user_id", userId);
    } catch {
      // preview already shown; upload failure is silent
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmEmail !== email) { setDeleteError("Az email cím nem egyezik."); return; }
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hiba történt.");
      await supabase.auth.signOut();
      router.push("/");
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Hiba történt.");
      setDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    const { error: err } = await supabase
      .from("profiles").update({ full_name: name }).eq("user_id", userId);
    if (err) { setError(err.message); } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  return (
    <>
      {cropSrc && (
        <AvatarCropModal
          src={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropSrc(null)}
        />
      )}
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {showAvatar && (
        <div className="flex items-center gap-4 pb-2">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-[#84AAA6] transition-colors cursor-pointer shrink-0 group"
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="flex items-center justify-center w-full h-full text-gray-400 text-2xl font-semibold">
                {initialName ? initialName[0].toUpperCase() : "?"}
              </span>
            )}
            <span className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            {avatarUploading && (
              <span className="absolute inset-0 bg-white/60 flex items-center justify-center">
                <span className="w-5 h-5 border-2 border-gray-200 border-t-[#84AAA6] rounded-full animate-spin" />
              </span>
            )}
          </button>
          <div>
            <p className="text-sm font-medium text-gray-900">Profilkép</p>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="text-sm text-[#84AAA6] hover:text-[#6B8E8A] cursor-pointer"
            >
              Módosítás
            </button>
            <p className="text-xs text-gray-400 mt-0.5">max {MAX_UPLOAD_MB} MB</p>
            {avatarSizeError && (
              <p className="text-xs text-[#F06C6C] mt-0.5">{avatarSizeError}</p>
            )}
          </div>
          <input ref={avatarInputRef} type="file" accept={ALLOWED_IMAGE_ACCEPT} className="hidden" onChange={handleAvatarChange} />
        </div>
      )}

      <FloatingInput id="email" label="E-mail cím" value={email} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
      <FloatingInput
        id="name"
        label="Teljes név"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      {error && (
        <p className="text-base text-[#F06C6C] bg-[#F06C6C]/10 border border-[#F06C6C]/30 rounded-lg px-3 py-2">{error}</p>
      )}
      {success && (
        <p className="text-base text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">✓ Sikeresen mentve.</p>
      )}
      <Button type="submit" disabled={saving}>
        {saving ? "Mentés..." : "Mentés"}
      </Button>

      <div className="pt-6 mt-6 border-t border-gray-100">
        <p className="text-base text-gray-900 mb-3">Veszélyes zóna</p>
        <Button
          type="button"
          variant="destructive"
          onClick={() => { setShowDeleteModal(true); setDeleteConfirmEmail(""); setDeleteError(null); }}
        >
          Fiók törlése
        </Button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <h3 className="font-bold text-gray-900">Fiók végleges törlése</h3>
            <p className="text-base text-gray-900">
              Ez a művelet <strong>nem visszavonható</strong>. Törlődik a fiókod, a profilod és minden adatod.
            </p>
            <p className="text-base text-gray-900">A megerősítéshez írd be az email címedet:</p>
            <FloatingInput
              id="delete-confirm-email"
              label={email}
              type="email"
              value={deleteConfirmEmail}
              onChange={(e) => setDeleteConfirmEmail(e.target.value)}
            />
            {deleteError && <p className="text-base text-[#F06C6C]">{deleteError}</p>}
            <div className="flex gap-3 justify-end">
              <Button size="sm" variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleting}>Mégse</Button>
              <Button size="sm" variant="destructive" onClick={handleDeleteAccount} disabled={deleting || deleteConfirmEmail !== email}>
                {deleting ? "Törlés..." : "Fiók végleges törlése"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
    </>
  );
}

export function PasswordForm() {
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!currentPassword) { setError("Add meg a jelenlegi jelszavadat."); return; }
    if (!newPassword) { setError("Add meg az új jelszavadat."); return; }
    if (newPassword !== confirmPassword) { setError("A két jelszó nem egyezik."); return; }
    if (newPassword.length < 6) { setError("A jelszónak legalább 6 karakter hosszúnak kell lennie."); return; }
    if (!userEmail) { setError("Hiba történt. Kérjük, jelentkezz be újra."); return; }

    setSaving(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword,
    });

    if (signInError) { setError("A jelenlegi jelszó helytelen."); setSaving(false); return; }

    const { error: err } = await supabase.auth.updateUser({ password: newPassword });
    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <FloatingInput id="currentPassword" label="Jelenlegi jelszó" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
      <FloatingInput id="newPassword" label="Új jelszó" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
      <div>
        <FloatingInput
          id="confirmPassword"
          label="Jelszó megerősítése"
          type="password"
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPasswordError(null); }}
          onBlur={() => {
            if (confirmPassword && newPassword !== confirmPassword) {
              setConfirmPasswordError("A két jelszó nem egyezik.");
            } else {
              setConfirmPasswordError(null);
            }
          }}
          required
          minLength={6}
        />
        {confirmPasswordError && <p className="text-sm text-[#F06C6C] mt-1 px-1">{confirmPasswordError}</p>}
      </div>
      {error && <p className="text-base text-[#F06C6C] bg-[#F06C6C]/10 border border-[#F06C6C]/30 rounded-lg px-3 py-2">{error}</p>}
      {success && <p className="text-base text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">✓ Jelszó sikeresen megváltoztatva.</p>}
      <Button type="submit" variant="outline" disabled={saving}>
        {saving ? "Mentés..." : "Jelszó módosítása"}
      </Button>
    </form>
  );
}

export function LinkedAccountsSection() {
  const supabase = createClient();
  const [identities, setIdentities] = useState<UserIdentity[]>([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.auth as any).getUserIdentities().then(({ data }: { data: { identities: UserIdentity[] } | null }) => {
      setIdentities(data?.identities ?? []);
      setLoading(false);
    });
  }, []);

  const googleIdentity = identities.find((i) => i.provider === "google");
  const canUnlink = identities.length > 1;

  const handleLink = async () => {
    if (!supabase) return;
    setLinking(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.auth as any).linkWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    // redirects away
  };

  const handleUnlink = async () => {
    if (!googleIdentity || !supabase) return;
    if (!canUnlink) {
      setError("A Google fiók leválasztásához először állíts be jelszavas bejelentkezést.");
      return;
    }
    setUnlinking(true);
    setError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: unlinkError } = await (supabase.auth as any).unlinkIdentity(googleIdentity);
    if (unlinkError) {
      setError(unlinkError.message);
    } else {
      setIdentities((prev) => prev.filter((i) => i.provider !== "google"));
      setSuccess("Google fiók sikeresen leválasztva.");
      setTimeout(() => setSuccess(null), 3000);
    }
    setUnlinking(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-4 border-gray-200 border-t-[#84AAA6] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-md">
      <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <GoogleIcon size={20} />
          <div>
            <p className="text-sm font-medium text-gray-900">Google</p>
            <p className="text-xs text-gray-500">
              {googleIdentity ? "Csatlakoztatva" : "Nincs csatlakoztatva"}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant={googleIdentity ? "outline" : "default"}
          onClick={googleIdentity ? handleUnlink : handleLink}
          disabled={linking || unlinking}
          className={!googleIdentity ? "bg-[#84AAA6] hover:bg-[#6B8E8A]" : ""}
        >
          {googleIdentity
            ? (unlinking ? "Leválasztás..." : "Leválasztás")
            : (linking   ? "Csatlakoztatás..." : "Csatlakoztatás")}
        </Button>
      </div>
      {!canUnlink && googleIdentity && (
        <p className="text-sm text-gray-500">
          A Google fiók leválasztásához először állíts be jelszavas bejelentkezést a Jelszó módosítás menüpontban.
        </p>
      )}
      {error   && <p className="text-sm text-[#F06C6C] bg-[#F06C6C]/10 border border-[#F06C6C]/30 rounded-lg px-3 py-2">{error}</p>}
      {success && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">✓ {success}</p>}
    </div>
  );
}
