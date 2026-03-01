import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import OpenAI from "openai";

const contactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  phone: z
    .string()
    .transform((v) => v.replace(/\s/g, ""))
    .refine((v) => v === "" || /^\+[1-9]\d{6,14}$/.test(v), {
      message: "Invalid phone number",
    })
    .optional()
    .default(""),
  message: z.string().min(10).max(3000),
});

function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

async function draftAiReply(name: string, message: string): Promise<string> {
  const openai = new OpenAI({ apiKey: getEnvOrThrow("OPENAI_API_KEY") });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 300,
    messages: [
      {
        role: "system",
        content: `You are Swapnil Katiyar, a Front-End Developer from Noida, India.
You're friendly, warm, slightly witty, and concise.
Draft a short email reply to someone who just reached out via your portfolio contact form.
The reply should:
- Acknowledge what they said specifically (reference their message)
- Feel personal, not templated
- Be 3-5 sentences max
- End with a note that you'll follow up properly soon
- Sound like a real human, not an automated bot
Do NOT include any greeting or sign-off — those will be added separately.`,
      },
      {
        role: "user",
        content: `Person's name: ${name}\nTheir message: ${message}`,
      },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() ?? "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? "_");
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(issue.message);
      }
      return NextResponse.json({ error: "Invalid form input.", fieldErrors }, { status: 400 });
    }

    const { name, email, phone, message } = parsed.data;

    const resend = new Resend(getEnvOrThrow("RESEND_API_KEY"));
    const fromAddress = getEnvOrThrow("FROM_EMAIL"); // e.g. hello@swapnilkatiyar.com
    const ownerEmail = getEnvOrThrow("OWNER_EMAIL"); // swapnil240695@gmail.com
    const submittedAt = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // Draft AI reply
    const aiReply = await draftAiReply(name, message);

    // ── 1. Notify owner ──────────────────────────────────────────────────────
    const { error: ownerSendError } = await resend.emails.send({
      from: `Portfolio Contact <${fromAddress}>`,
      to: ownerEmail,
      subject: `New message from ${name} via swapnilkatiyar.com`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1e293b">
          <h2 style="color:#2563eb;margin-bottom:4px">📬 New Portfolio Contact</h2>
          <p style="color:#64748b;font-size:13px;margin-top:0">${submittedAt} IST</p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0"/>

          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#64748b;width:80px">Name</td><td style="padding:6px 0"><strong>${name}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Email</td><td style="padding:6px 0"><a href="mailto:${email}" style="color:#2563eb">${email}</a></td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Phone</td><td style="padding:6px 0">${phone || "—"}</td></tr>
          </table>

          <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0"/>
          <h3 style="font-size:14px;color:#64748b;margin-bottom:8px">THEIR MESSAGE</h3>
          <p style="background:#f8fafc;border-left:3px solid #2563eb;padding:12px 16px;border-radius:4px;margin:0;white-space:pre-wrap">${message}</p>

          <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0"/>
          <h3 style="font-size:14px;color:#64748b;margin-bottom:8px">🤖 AI-DRAFTED REPLY SENT TO THEM</h3>
          <p style="background:#f0fdf4;border-left:3px solid #10b981;padding:12px 16px;border-radius:4px;margin:0;white-space:pre-wrap">${aiReply || "(unavailable)"}</p>
        </div>
      `,
    });

    if (ownerSendError) throw new Error(`Owner email failed: ${ownerSendError.message}`);

    // ── 2. Auto-reply to user ────────────────────────────────────────────────
    const { error: userSendError } = await resend.emails.send({
      from: `Swapnil Katiyar <${fromAddress}>`,
      to: email,
      replyTo: ownerEmail,
      subject: `Re: Your message — thanks for reaching out!`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1e293b">
          <p>Hi ${name}! 👋</p>
          <p>${aiReply}</p>
          <p>Talk soon,<br/><strong>Swapnil Katiyar</strong><br/>
            <span style="color:#64748b;font-size:13px">Front-End Developer · Noida, India</span>
          </p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
          <p style="font-size:12px;color:#94a3b8">
            <a href="https://www.swapnilkatiyar.com" style="color:#2563eb">Portfolio</a> ·
            <a href="https://github.com/swapnilndia" style="color:#2563eb">GitHub</a> ·
            <a href="https://www.linkedin.com/in/swapnilndia/" style="color:#2563eb">LinkedIn</a>
          </p>
        </div>
      `,
    });

    if (userSendError) throw new Error(`User email failed: ${userSendError.message}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact API error:", error);

    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "Failed to send message. Please try again later.",
      },
      { status: 500 }
    );
  }
}
