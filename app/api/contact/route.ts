import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeContact } from "@/lib/emails/aiReply";
import { sendContactEmails } from "@/lib/emails/sendContact";

const contactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.email().max(120),
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

    const analysis = await analyzeContact(name, message);
    await sendContactEmails({ name, email, phone, message, analysis });

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
