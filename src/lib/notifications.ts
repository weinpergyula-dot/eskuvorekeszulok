/**
 * Értesítési segédfüggvények.
 *
 * Az azonnali értesítések (új értékelés, ajánlatkérés, kapcsolati üzenet)
 * fire-and-forget jelleggel mennek ki a hívás pillanatában.
 *
 * Az üzenet-alapú értesítések (new_message, quote_reply) késleltetett sorba
 * kerülnek (pending_notifications tábla), és a cron job küldi ki őket 5 perccel
 * az utolsó üzenet után – de csak akkor, ha a fogadó közben nem olvasta el.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/resend";
import { NewMessageEmail } from "@/emails/new-message";
import { NewReviewEmail } from "@/emails/new-review";
import { NewQuoteRequestEmail } from "@/emails/new-quote-request";
import { QuoteReplyEmail } from "@/emails/quote-reply";
import { ContactNotificationEmail } from "@/emails/contact-notification";
import React from "react";

// ── Konstansok ─────────────────────────────────────────────────────────────────

/** Ennyi perccel az utolsó üzenet után megy ki az email, ha nem olvasták el. */
const NOTIFICATION_DELAY_MINUTES = 5;

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

// ── Késleltetett értesítés ütemezése ──────────────────────────────────────────

async function scheduleNotification(params: {
  type: "new_message" | "quote_reply";
  recipientId: string;
  senderId: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  const admin = createAdminClient();
  const sendAfter = new Date(
    Date.now() + NOTIFICATION_DELAY_MINUTES * 60 * 1000
  ).toISOString();

  // Ha már van függőben lévő értesítés ugyanerre a (típus, fogadó, feladó) párosra,
  // frissítjük a send_after időt (azaz az utolsó üzenet után 5 perccel küldünk).
  await admin.from("pending_notifications").upsert(
    {
      type: params.type,
      recipient_id: params.recipientId,
      sender_id: params.senderId,
      payload: params.payload,
      send_after: sendAfter,
      sent: false,
    },
    { onConflict: "type,recipient_id,sender_id" }
  );
}

// ── Azonnali értesítők (ezek változatlanul működnek) ─────────────────────────

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
 * Új ajánlatkérés értesítő — hívd a POST /api/quote-requests után minden érintett providerre.
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

// ── Késleltetett értesítők (sorba írják az emailt) ────────────────────────────

/**
 * Üzenet értesítő ütemezése — hívd a POST /api/messages után.
 * Az email 5 perccel az utolsó üzenet után megy ki, ha a fogadó nem olvasta el.
 */
export async function notifyNewMessage(params: {
  recipientId: string;
  senderId: string;
  subject: string;
  origin: string;
}): Promise<void> {
  try {
    await scheduleNotification({
      type: "new_message",
      recipientId: params.recipientId,
      senderId: params.senderId,
      payload: { subject: params.subject, origin: params.origin },
    });
  } catch (err) {
    console.error("[notifyNewMessage] ütemezési hiba:", err);
  }
}

/**
 * Ajánlatkérés-válasz értesítő ütemezése — hívd a POST /api/quote-requests/[id]/messages után,
 * ha a feladó a szolgáltató.
 */
export async function notifyQuoteReply(params: {
  visitorUserId: string;
  providerUserId: string;
  subject: string;
  origin: string;
}): Promise<void> {
  try {
    await scheduleNotification({
      type: "quote_reply",
      recipientId: params.visitorUserId,
      senderId: params.providerUserId,
      payload: { subject: params.subject, origin: params.origin },
    });
  } catch (err) {
    console.error("[notifyQuoteReply] ütemezési hiba:", err);
  }
}

// ── Cron feldolgozó ───────────────────────────────────────────────────────────

/**
 * A cron job hívja ezt percenként.
 * Felszedi a lejárt, el nem küldött értesítéseket, ellenőrzi az olvasottságot,
 * és szükség esetén elküldi az emailt.
 */
export async function processPendingNotifications(): Promise<void> {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  // Atomikusan lefoglalja a lejárt sorokat (sent = true),
  // hogy párhuzamos futás esetén se menjen ki kétszer email.
  const { data: claimed } = await admin
    .from("pending_notifications")
    .update({ sent: true })
    .lte("send_after", now)
    .eq("sent", false)
    .select();

  if (!claimed || claimed.length === 0) return;

  await Promise.allSettled(
    claimed.map(async (n) => {
      try {
        if (n.type === "new_message") {
          await sendDeferredNewMessage(n);
        } else if (n.type === "quote_reply") {
          await sendDeferredQuoteReply(n);
        }
      } catch (err) {
        console.error("[processPendingNotifications]", n.type, err);
      }
    })
  );

  // Régi, már elküldött sorok törlése (1 napnál régebbiek)
  try {
    await admin
      .from("pending_notifications")
      .delete()
      .eq("sent", true)
      .lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  } catch {
    // nem kritikus, következő futásnál újra megpróbálja
  }
}

// ── Deferred küldők ───────────────────────────────────────────────────────────

async function sendDeferredNewMessage(n: {
  recipient_id: string;
  sender_id: string;
  payload: unknown;
}): Promise<void> {
  const payload = n.payload as { subject: string; origin: string };
  const admin = createAdminClient();

  // Van-e még olvasatlan üzenet ettől a feladótól ennek a fogadónak?
  const { count } = await admin
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", n.recipient_id)
    .eq("sender_id", n.sender_id)
    .eq("read", false)
    .eq("deleted_for_recipient", false);

  if ((count ?? 0) === 0) return; // Már elolvasta, nem kell email

  const prefs = await getPrefs(n.recipient_id);
  if (!prefs.notify_new_message) return;

  const [recipientEmail, recipientName, senderName] = await Promise.all([
    getUserEmail(n.recipient_id),
    getUserName(n.recipient_id),
    getUserName(n.sender_id),
  ]);
  if (!recipientEmail) return;

  await sendEmail({
    to: recipientEmail,
    subject: "Új üzeneted érkezett – Esküvőre Készülök",
    template: React.createElement(NewMessageEmail, {
      recipientName,
      senderName,
      subject: payload.subject,
      ctaUrl: `${payload.origin}/profil#messages`,
    }),
  });
}

async function sendDeferredQuoteReply(n: {
  recipient_id: string; // visitor
  sender_id: string;    // provider user_id
  payload: unknown;
}): Promise<void> {
  const payload = n.payload as { subject: string; origin: string };
  const admin = createAdminClient();

  // Megkeressük a látogató ajánlatkéréseit
  const { data: visitorRequests } = await admin
    .from("quote_requests")
    .select("id")
    .eq("visitor_id", n.recipient_id);

  const reqIds = (visitorRequests ?? []).map((r: { id: string }) => r.id);
  if (reqIds.length === 0) return;

  // Van-e még olvasatlan válaszüzenet ettől a szolgáltatótól?
  const { count } = await admin
    .from("quote_messages")
    .select("*", { count: "exact", head: true })
    .in("quote_request_id", reqIds)
    .eq("sender_id", n.sender_id)
    .eq("read", false);

  if ((count ?? 0) === 0) return; // Már elolvasta

  const prefs = await getPrefs(n.recipient_id);
  if (!prefs.notify_quote_reply) return;

  const [visitorEmail, visitorName, providerName] = await Promise.all([
    getUserEmail(n.recipient_id),
    getUserName(n.recipient_id),
    getUserName(n.sender_id),
  ]);
  if (!visitorEmail) return;

  await sendEmail({
    to: visitorEmail,
    subject: "Válasz érkezett az ajánlatkérésedre – Esküvőre Készülök",
    template: React.createElement(QuoteReplyEmail, {
      visitorName,
      providerName,
      subject: payload.subject,
      ctaUrl: `${payload.origin}/profil?tab=quotes`,
    }),
  });
}
