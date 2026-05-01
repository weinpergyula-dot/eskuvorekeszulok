"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { FloatingTextarea } from "@/components/ui/floating-input";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  reviewer_id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(cls, star <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200")}
        />
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="cursor-pointer transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              "h-7 w-7 transition-colors",
              star <= (hover || value) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
            )}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({
  providerId,
  existingReview,
  onSaved,
}: {
  providerId: string;
  existingReview: Review | null;
  onSaved: () => void;
}) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError("Kérlek válassz csillagos értékelést."); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/providers/${providerId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Hiba történt.");
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onSaved(); }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Hiba történt.");
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <p className="text-base text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
        ✓ Értékelésed mentve!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm text-gray-600 mb-2">
          {existingReview ? "Értékelésed módosítása:" : "Értékelésed:"}
        </p>
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <FloatingTextarea
        id="review-comment"
        label="Szöveges vélemény (opcionális)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
      />
      {error && (
        <p className="text-base text-[#F06C6C] bg-[#F06C6C]/10 border border-[#F06C6C]/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <Button type="submit" disabled={saving}>
        {saving ? "Mentés..." : existingReview ? "Értékelés frissítése" : "Értékelés küldése"}
      </Button>
    </form>
  );
}

export function ReviewSection({ providerId, providerUserId }: { providerId: string; providerUserId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  const loadReviews = async () => {
    const res = await fetch(`/api/providers/${providerId}/reviews`);
    const data = await res.json();
    setReviews(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setLoggedIn(!!data.user);
      setUserId(data.user?.id ?? null);
    });
    loadReviews();
  }, []);

  const myReview = reviews.find((r) => r.reviewer_id === userId) ?? null;
  const otherReviews = reviews.filter((r) => r.reviewer_id !== userId);
  const isProvider = userId === providerUserId;

  return (
    <section className="mt-8 pt-8 border-t border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Star className="h-5 w-5 text-[#84AAA6]" />
        Értékelések
        {reviews.length > 0 && (
          <span className="text-base font-normal text-gray-500">({reviews.length})</span>
        )}
      </h2>

      {/* Review form */}
      {loggedIn === null ? null : loggedIn && !isProvider ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            {myReview ? "Saját értékelésed" : "Adj értékelést"}
          </p>
          <ReviewForm providerId={providerId} existingReview={myReview} onSaved={loadReviews} />
        </div>
      ) : !loggedIn ? (
        <p className="text-base text-gray-700 mb-6">
          <Link href="/auth/login" className="text-[#84AAA6] hover:underline font-medium">
            Jelentkezz be
          </Link>{" "}
          az értékelés leadásához.
        </p>
      ) : null}

      {/* Reviews list */}
      {loading ? (
        <p className="text-base text-gray-500">Betöltés...</p>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
          <MessageSquare className="h-8 w-8 mb-2 text-gray-300" strokeWidth={1.5} />
          <p className="text-base">Még nincs értékelés.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...(myReview ? [myReview] : []), ...otherReviews].map((review) => (
            <div
              key={review.id}
              className={`border rounded-xl p-4 ${review.reviewer_id === userId ? "border-[#84AAA6]/40 bg-[#84AAA6]/5" : "border-gray-200 bg-white"}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-base font-medium text-gray-900">
                    {review.reviewer_id === userId ? "Saját értékelésed" : review.reviewer_name}
                  </span>
                  <span className="text-sm text-gray-400 ml-2">{formatDate(review.created_at)}</span>
                </div>
                <StarDisplay rating={review.rating} size="sm" />
              </div>
              {review.comment && (
                <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
