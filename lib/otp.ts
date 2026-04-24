// Client-side OTP helpers. Wrap the /api/otp/* routes so surfaces
// (customer login, store login, tailor login, tablet, kiosk, etc.)
// don't re-implement fetch boilerplate. All three helpers return
// { success, error? } shaped the same so UIs can share error
// rendering logic.

export type OtpResult = { success: true } | { success: false; error: string };

async function postOtp(
  path: "send" | "verify" | "resend",
  body: Record<string, string>,
): Promise<OtpResult> {
  try {
    const res = await fetch(`/api/otp/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      error?: string;
    };
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || `OTP ${path} failed`,
      };
    }
    return { success: true };
  } catch {
    return { success: false, error: "Network error — check your connection" };
  }
}

// Phone can be "+919800000001", "919800000001", or "9800000001". The
// API route normalizes all three to the same canonical form.
export function sendOtp(phone: string): Promise<OtpResult> {
  return postOtp("send", { phone });
}

export function verifyOtpCode(phone: string, otp: string): Promise<OtpResult> {
  return postOtp("verify", { phone, otp });
}

export function resendOtp(phone: string): Promise<OtpResult> {
  return postOtp("resend", { phone });
}
