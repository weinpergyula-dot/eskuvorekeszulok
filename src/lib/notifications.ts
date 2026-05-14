/**
 * Értesítési segédfüggvények.
 * Az API route-ok hívják ezeket a megfelelő esemény után.
 * Minden függvény fire-and-forget jellegű: a hívó nem vár a végeredményre.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/resend";
import { NewMessageEmail } from "@/emails/new-message";
import { NewReviewEmail } from "@/emails/new-review";
import { NewQuoteRequestEmail } from "@/emails/new-quote-request";
import { QuoteReplyEmail } from "@/emails/quote-reply";
import { ContactNotificationEmail } from "@/emails/contact-notification";
import React from "react";

// ── Preference helpers ─────────────────────────────────────────────────────────

interface NotificationPrefs {
  notify_new_message: boolean;
  notify_new_review: boolean;
  notify_new_quote_request: boolean;
  notify_quote_reply: boolean;
  notify_contact_message: boolean;
}

async function getPrefs(userId: string): Promise<NotificationPrefs> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  // Ha még nincs sor, az alapértelmezett true mindenhol
  return {
    notify_new_message:       data?.notify_new_message       ?? true,
    notify_new_review:        data?.notify_new_review        ?? true,
    notify_new_quote_request: data?.notify_new_quote_request ?? true,
    notify_quote_reply:       data?.notify_quote_reply       ?? true,
    notify_contact_message:   data?.notify_contact_message   ?? true,
  };
}

async function getUserEmail(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.getUserById(userId);
  return data?.user?.email ?? null;
}

async function getUserName(userId: string): Promise<string> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("full_name")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.full_name ?? "Felhasználó";
}

async function getAdminUserIds(): Promise<string[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("user_id")
    .eq("role", "admin");
  return (data ?? []).map((p: { user_id: string }) => p.user_id);
}

// ── Notification senders ───────────────────────────────────────────────────────

/**
 * Új üzenet értesítő — hívd a POST /api/messages után.
 */
export async function notifyNewMessage(params: {
  recipientId: string;
  senderId: string;
  subject: string;
  origin: string;
}): Promise<void> {
  try {
    const prefs = await getPrefs(params.recipientId);
    if (!prefs.notify_new_message) return;

    const [recipientEmail, recipientName, senderName] = await Promise.all([
      getUserEmail(params.recipientId),
      getUserName(params.recipientId),
      getUserName(params.senderId),
    ]);
    if (!recipientEmail) return;

    await sendEmail({
      to: recipientEmail,
      subject: "Új üzeneted érkezett – Esküvőre Készülök",
      template: React.createElement(NewMessageEmail, {
        recipientName,
        senderName,
        subject: params.subject,
        ctaUrl: `${params.origin}/profil#messages`,
      }),
    });
  } catch (err) {
    console.error("[notifyNewMessage] hiba:", err);
  }
}

/**
 * Új értékelés értesítő — hívd a POST /api/providers/[id]/reviews után.
 */
export async function notifyNewReview(params: {
  providerUserId: string;
  reviewerUserId: string;
  rating: number;
  comment?: string;
  origin: string;
}): Promise<void> {
  try {
    const prefs = await getPrefs(params.providerUserId);
    if (!prefs.notify_new_review) return;

    const [providerEmail, providerName, reviewerName] = await Promise.all([
      getUserEmail(params.providerUserId),
      getUserName(params.providerUserId),
      getUserName(params.reviewerUserId),
    ]);
    if (!providerEmail) return;

    await sendEmail({
      to: providerEmail,
      subject: "Új értékelés érkezett – Esküvőre Készülök",
      template: React.createElement(NewReviewEmail, {
        providerName,
        reviewerName,
        rating: params.rating,
        comment: params.comment,
        ctaUrl: `${params.origin}/profil#dashboard`,
      }),
    });
  } catch (err) {
    console.error("[notifyNewReview] hiba:", err);
  }
}

/**
 * Új ajánlatkérés értesítő egy adott szolgáltatónak.
 * Hívd a POST /api/quote-requests után minden érintett providerre.
 */
export async function notifyNewQuoteRequest(params: {
  providerUserId: string;
  visitorUserId: string;
  subject: string;
  category: string;
  message: string;
  origin: string;
}): Promise<void> {
  try {
    const prefs = await getPrefs(params.providerUserId);
    if (!prefs.notify_new_quote_request) return;

    const [providerEmail, providerName, visitorName] = await Promise.all([
      getUserEmail(params.providerUserId),
      getUserName(params.providerUserId),
      getUserName(params.visitorUserId),
    ]);
    if (!providerEmail) return;

    await sendEmail({
      to: providerEmail,
      subject: "Új ajánlatkérés érkezett – Esküvőre Készülök",
      template: React.createElement(NewQuoteRequestEmail, {
        providerName,
        visitorName,
        subject: params.subject,
        category: params.category,
        messagePreview: params.message.slice(0, 300),
        ctaUrl: `${params.origin}/profil?tab=quotes`,
      }),
    });
  } catch (err) {
    console.error("[notifyNewQuoteRequest] hiba:", err);
  }
}

/**
 * Válasz értesítő a látogatónak — hívd a POST /api/quote-requests/[id]/messages után,
 * ha a feladó a szolgáltató (azaz a látogató a fogadó fél).
 */
export async function notifyQuoteReply(params: {
  visitorUserId: string;
  providerUserId: string;
  subject: string;
  origin: string;
}): Promise<void> {
  try {
    const prefs = await getPrefs(params.visitorUserId);
    if (!prefs.notify_quote_reply) return;

    const [visitorEmail, visitorName, providerName] = await Promise.all([
      getUserEmail(params.visitorUserId),
      getUserName(params.visitorUserId),
      getUserName(params.providerUserId),
    ]);
    if (!visitorEmail) return;

    await sendEmail({
      to: visitorEmail,
      subject: "Válasz érkezett az ajánlatkérésedre – Esküvőre Készülök",
      template: React.createElement(QuoteReplyEmail, {
        visitorName,
        providerName,
        subject: params.subject,
        ctaUrl: `${params.origin}/profil?tab=quotes`,
      }),
    });
  } catch (err) {
    console.error("[notifyQuoteReply] hiba:", err);
  }
}

/**
 * Kapcsolati üzenet értesítő az adminoknak — hívd a POST /api/contact után.
 */
export async function notifyContactMessage(params: {
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  message: string;
  origin: string;
}): Promise<void> {
  try {
    const adminIds = await getAdminUserIds();
    if (!adminIds.length) return;

    await Promise.allSettled(
      adminIds.map(async (adminId) => {
        const prefs = await getPrefs(adminId);
        if (!prefs.notify_contact_message) return;

        const adminEmail = await getUserEmail(adminId);
        if (!adminEmail) return;

        await sendEmail({
          to: adminEmail,
          subject: "Új kapcsolatfelvételi üzenet – Esküvőre Készülök",
          template: React.createElement(ContactNotificationEmail, {
            senderName: params.senderName,
            senderEmail: params.senderEmail,
            senderPhone: params.senderPhone,
            messagePreview: params.message.slice(0, 500),
            ctaUrl: `${params.origin}/admin`,
          }),
        });
      })
    );
  } catch (err) {
    console.error("[notifyContactMessage] hiba:", err);
  }
}
