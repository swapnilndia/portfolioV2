import { Resend } from "resend";

export function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
}

let _resend: Resend | null = null;

export function getResendClient(): Resend {
  if (!_resend) {
    _resend = new Resend(getEnvOrThrow("RESEND_API_KEY"));
  }
  return _resend;
}
