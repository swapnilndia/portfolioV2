import { getResendClient, getEnvOrThrow } from "./client";
import type { ContactAnalysis } from "./aiReply";
import { ownerNotificationHtml } from "./templates/ownerNotification";
import { userReplyHtml } from "./templates/userReply";

export type ContactEmailPayload = {
  name: string;
  email: string;
  phone: string;
  message: string;
  analysis: ContactAnalysis;
};

export async function sendContactEmails(payload: ContactEmailPayload): Promise<void> {
  const resend = getResendClient();
  const fromAddress = getEnvOrThrow("FROM_EMAIL");
  const ownerEmail = getEnvOrThrow("OWNER_EMAIL");
  const submittedAt = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const { name, email, phone, message, analysis } = payload;

  // ── 1. Notify owner ──────────────────────────────────────────────────────
  const { error: ownerSendError } = await resend.emails.send({
    from: `Portfolio Contact <${fromAddress}>`,
    to: ownerEmail,
    replyTo: email,
    subject: `📬 New message from ${name} — swapnilkatiyar.com`,
    html: ownerNotificationHtml({ name, email, phone, message, analysis, submittedAt }),
  });

  if (ownerSendError) throw new Error(`Owner email failed: ${ownerSendError.message}`);

  // ── 2. Auto-reply to sender ───────────────────────────────────────────────
  const { error: userSendError } = await resend.emails.send({
    from: `Swapnil Katiyar <${fromAddress}>`,
    to: email,
    replyTo: ownerEmail,
    subject: `Re: Your message — thanks for reaching out!`,
    html: userReplyHtml({ name, analysis }),
  });

  if (userSendError) throw new Error(`User email failed: ${userSendError.message}`);
}
