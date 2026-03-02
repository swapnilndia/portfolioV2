import type { ContactAnalysis } from "../aiReply";

export type OwnerNotificationProps = {
  name: string;
  email: string;
  phone: string;
  message: string;
  analysis: ContactAnalysis;
  submittedAt: string;
};

// ── Badge helpers ─────────────────────────────────────────────────────────────

const INTENT_STYLES: Record<
  ContactAnalysis["intent"],
  { bg: string; color: string; border: string; label: string }
> = {
  recruiter: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe", label: "Recruiter" },
  freelance: { bg: "#f5f3ff", color: "#7c3aed", border: "#ddd6fe", label: "Freelance" },
  general: { bg: "#f8fafc", color: "#475569", border: "#e2e8f0", label: "General" },
  spam: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", label: "Spam" },
};

const URGENCY_STYLES: Record<
  ContactAnalysis["urgency"],
  { bg: string; color: string; border: string }
> = {
  high: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  medium: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  low: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
};

function leadScoreStyle(score: number): { bg: string; color: string } {
  if (score >= 80) return { bg: "#f0fdf4", color: "#16a34a" };
  if (score >= 60) return { bg: "#fffbeb", color: "#d97706" };
  if (score >= 40) return { bg: "#eff6ff", color: "#1d4ed8" };
  return { bg: "#fef2f2", color: "#dc2626" };
}

function badge(label: string, bg: string, color: string, border: string): string {
  return `<span style="display:inline-block;background-color:${bg};color:${color};border:1px solid ${border};font-size:11px;font-weight:700;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:4px 10px;border-radius:20px;letter-spacing:0.5px;">${label}</span>`;
}

// ── Template ──────────────────────────────────────────────────────────────────

export function ownerNotificationHtml({
  name,
  email,
  phone,
  message,
  analysis,
  submittedAt,
}: OwnerNotificationProps): string {
  const intent = INTENT_STYLES[analysis.intent];
  const urgency = URGENCY_STYLES[analysis.urgency];
  const scoreStyle = leadScoreStyle(analysis.leadScore);

  const intentBadge = badge(intent.label, intent.bg, intent.color, intent.border);
  const urgencyBadge = badge(
    analysis.urgency.toUpperCase(),
    urgency.bg,
    urgency.color,
    urgency.border
  );
  const scoreBadge = badge(
    `Score: ${analysis.leadScore}`,
    scoreStyle.bg,
    scoreStyle.color,
    scoreStyle.bg
  );

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:32px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">

          <!-- ── Header ───────────────────────────────── -->
          <tr>
            <td style="background-color:#0f172a;border-radius:12px 12px 0 0;padding:20px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle">
                    <p style="margin:0;color:#ffffff;font-size:16px;font-weight:700;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">📬 New Portfolio Contact</p>
                    <p style="margin:3px 0 0;color:#64748b;font-size:12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${submittedAt} IST</p>
                  </td>
                  <td valign="middle" align="right">
                    <span style="display:inline-block;background-color:#3b82f6;color:#ffffff;font-size:11px;font-weight:700;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:5px 12px;border-radius:20px;letter-spacing:0.5px;">NEW</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── AI Intelligence Panel ─────────────────── -->
          <tr>
            <td style="background-color:#ffffff;padding:24px 28px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
                <tr>
                  <td style="padding:12px 16px;background-color:#0f172a;">
                    <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-transform:uppercase;letter-spacing:1px;">🤖 AI Intelligence</p>
                  </td>
                </tr>
                <!-- Badges row -->
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-right:8px;">${intentBadge}</td>
                        <td style="padding-right:8px;">${urgencyBadge}</td>
                        <td>${scoreBadge}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Summary -->
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#94a3b8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-transform:uppercase;letter-spacing:0.5px;">Summary</p>
                    <p style="margin:0;font-size:13px;color:#334155;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.5;">${analysis.summary}</p>
                  </td>
                </tr>
                <!-- Follow-up suggestion -->
                <tr>
                  <td style="padding:12px 16px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#94a3b8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-transform:uppercase;letter-spacing:0.5px;">Suggested Follow-up</p>
                    <p style="margin:0;font-size:13px;color:#334155;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.5;font-style:italic;">&ldquo;${analysis.followUpQuestion}&rdquo;</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Contact Details ───────────────────────── -->
          <tr>
            <td style="background-color:#ffffff;padding:20px 28px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
                <tr>
                  <td style="padding:12px 16px;background-color:#f8fafc;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-transform:uppercase;letter-spacing:1px;">Contact Details</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="width:60px;font-size:12px;font-weight:600;color:#94a3b8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-transform:uppercase;letter-spacing:0.5px;">Name</td>
                        <td style="font-size:14px;font-weight:600;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${name}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="width:60px;font-size:12px;font-weight:600;color:#94a3b8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-transform:uppercase;letter-spacing:0.5px;">Email</td>
                        <td><a href="mailto:${email}" style="font-size:14px;font-weight:500;color:#3b82f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-decoration:none;">${email}</a></td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="width:60px;font-size:12px;font-weight:600;color:#94a3b8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-transform:uppercase;letter-spacing:0.5px;">Phone</td>
                        <td style="font-size:14px;color:#475569;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${phone || "—"}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Their Message ─────────────────────────── -->
          <tr>
            <td style="background-color:#ffffff;padding:20px 28px 0;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#94a3b8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-transform:uppercase;letter-spacing:1px;">Their Message</p>
              <p style="background:#f8fafc;border-left:3px solid #3b82f6;padding:14px 16px;border-radius:0 8px 8px 0;margin:0;font-size:14px;line-height:1.75;color:#334155;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;white-space:pre-wrap;">${message}</p>
            </td>
          </tr>

          <!-- ── AI Reply Sent ──────────────────────────── -->
          <tr>
            <td style="background-color:#ffffff;padding:20px 28px 0;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#94a3b8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-transform:uppercase;letter-spacing:1px;">Reply Sent to Them</p>
              <p style="background:#f0fdf4;border-left:3px solid #10b981;padding:14px 16px;border-radius:0 8px 8px 0;margin:0;font-size:14px;line-height:1.75;color:#334155;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;white-space:pre-wrap;">${analysis.reply}</p>
            </td>
          </tr>

          <!-- ── Reply CTA ──────────────────────────────── -->
          <tr>
            <td style="background-color:#ffffff;padding:24px 28px 28px;">
              <a href="mailto:${email}?subject=Re: Your message to swapnilkatiyar.com" style="display:inline-block;background-color:#3b82f6;color:#ffffff;font-size:13px;font-weight:600;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-decoration:none;padding:11px 24px;border-radius:8px;">Reply to ${name} &rarr;</a>
            </td>
          </tr>

          <!-- ── Footer ────────────────────────────────── -->
          <tr>
            <td align="center" style="background-color:#f8fafc;border-radius:0 0 12px 12px;padding:16px 28px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">swapnilkatiyar.com contact form &middot; ${submittedAt} IST</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
