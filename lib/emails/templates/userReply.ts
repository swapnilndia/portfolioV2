import type { ContactAnalysis } from "../aiReply";

export type UserReplyProps = {
  name: string;
  analysis: ContactAnalysis;
};

function greeting(name: string, intent: ContactAnalysis["intent"]): string {
  return intent === "general" ? `Hi ${name}! 👋` : `Hi ${name},`;
}

export function userReplyHtml({ name, analysis }: UserReplyProps): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;">

          <!-- ── Gradient accent bar ────────────── -->
          <tr>
            <td style="background-color:#3b82f6;background-image:linear-gradient(90deg,#1d4ed8 0%,#3b82f6 50%,#8b5cf6 100%);height:4px;border-radius:16px 16px 0 0;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- ── Header ────────────────────────── -->
          <tr>
            <td align="center" style="background-color:#3b82f6;background-image:linear-gradient(135deg,#1d4ed8 0%,#3b82f6 55%,#8b5cf6 100%);padding:44px 48px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="width:72px;height:72px;background-color:rgba(255,255,255,0.15);border-radius:36px;border:2px solid rgba(255,255,255,0.3);">
                    <span style="display:block;width:72px;line-height:72px;color:#ffffff;font-size:24px;font-weight:700;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center;">SK</span>
                  </td>
                </tr>
              </table>
              <h1 style="margin:20px 0 10px;color:#ffffff;font-size:26px;font-weight:700;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;letter-spacing:-0.3px;line-height:1.2;">${analysis.headerTitle}</h1>
              <p style="margin:0 0 20px;color:rgba(255,255,255,0.8);font-size:15px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.5;">${analysis.headerSubtitle}</p>
              <!-- Status badge -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                <tr>
                  <td align="center" style="background-color:rgba(16,185,129,0.2);border:1px solid rgba(52,211,153,0.5);border-radius:20px;padding:6px 16px;">
                    <span style="color:#34d399;font-size:12px;font-weight:700;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;letter-spacing:0.5px;">&#10003; MESSAGE RECEIVED</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Body ──────────────────────────── -->
          <tr>
            <td style="background-color:#ffffff;padding:44px 48px 36px;">
              <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${greeting(name, analysis.intent)}</p>
              <p style="margin:20px 0 0;font-size:15px;line-height:1.85;color:#475569;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">${analysis.reply}</p>

              <!-- What happens next -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
                <tr>
                  <td style="background-color:#f8fafc;padding:14px 18px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:11px;font-weight:700;color:#64748b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-transform:uppercase;letter-spacing:1.2px;">What happens next</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr><td style="padding:4px 0;font-size:13px;color:#475569;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">&#9889;&nbsp; I usually reply within <strong style="color:#0f172a;">24 hours</strong></td></tr>
                      <tr><td style="padding:4px 0;font-size:13px;color:#475569;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">&#128172;&nbsp; Expect a <strong style="color:#0f172a;">personal reply</strong>, not a template</td></tr>
                      <tr><td style="padding:4px 0;font-size:13px;color:#475569;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">&#128193;&nbsp; Check <strong style="color:#0f172a;">spam</strong> if you don't hear back in 24h</td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0 28px;">
                <tr><td style="border-top:1px solid #e2e8f0;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>

              <!-- Signature with real photo -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle">
                    <img src="https://www.swapnilkatiyar.com/swapnil_hero.png" width="60" height="60" alt="Swapnil Katiyar" style="display:block;border-radius:30px;object-fit:cover;object-position:center top;border:2px solid #e2e8f0;"/>
                  </td>
                  <td valign="middle" style="padding-left:14px;">
                    <p style="margin:0;font-size:15px;font-weight:700;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Swapnil Katiyar</p>
                    <p style="margin:3px 0 0;font-size:13px;color:#64748b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">Front-End Developer &middot; Noida, India</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#3b82f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-style:italic;">Building products, one component at a time.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── CTA Buttons ───────────────────── -->
          <tr>
            <td align="center" style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:28px 48px;">
              <p style="margin:0 0 18px;font-size:11px;font-weight:600;color:#94a3b8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-transform:uppercase;letter-spacing:1.5px;">Let&rsquo;s connect</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:0 3px;">
                    <a href="https://www.swapnilkatiyar.com" target="_blank" style="display:inline-block;background-color:#3b82f6;color:#ffffff;font-size:12px;font-weight:600;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-decoration:none;padding:10px 18px;border-radius:8px;">Portfolio</a>
                  </td>
                  <td style="padding:0 3px;">
                    <a href="https://github.com/swapnilndia" target="_blank" style="display:inline-block;background-color:#0f172a;color:#ffffff;font-size:12px;font-weight:600;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-decoration:none;padding:10px 18px;border-radius:8px;">GitHub</a>
                  </td>
                  <td style="padding:0 3px;">
                    <a href="https://www.linkedin.com/in/swapnilndia/" target="_blank" style="display:inline-block;background-color:#0a66c2;color:#ffffff;font-size:12px;font-weight:600;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-decoration:none;padding:10px 18px;border-radius:8px;">LinkedIn</a>
                  </td>
                  <td style="padding:0 3px;">
                    <a href="https://leetcode.com/u/Swapnilndia/" target="_blank" style="display:inline-block;background-color:#ffa116;color:#ffffff;font-size:12px;font-weight:600;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-decoration:none;padding:10px 18px;border-radius:8px;">LeetCode</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Footer ────────────────────────── -->
          <tr>
            <td align="center" style="background-color:#f1f5f9;border-radius:0 0 16px 16px;padding:20px 48px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;">
                You received this because you submitted the contact form on&nbsp;<a href="https://www.swapnilkatiyar.com/contact" style="color:#94a3b8;text-decoration:underline;">swapnilkatiyar.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
