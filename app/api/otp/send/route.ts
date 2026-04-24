import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex-server";

// POST /api/otp/send  { phone: "+919800000001" | "9800000001" }
//
// Dispatches a fresh OTP via MSG91 and, on success, writes an
// otpSessions row via Convex so subsequent phoneAuth.loginWithOtp calls
// have a session to verify against. Single round trip from the client
// — the Convex write happens here (server) not there (browser) so a
// dead-browser-between-calls scenario can't leave MSG91 having sent an
// SMS with no Convex trace.
//
// Env (Netlify): MSG91_AUTH_KEY, MSG91_TEMPLATE_ID.
// Missing vars surface as a 500 with a clear message — never fall
// through to the MSG91 call with `?authkey=undefined`.

const MSG91_API_URL = "https://control.msg91.com/api/v5/otp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const rawPhone = body?.phone;
    if (typeof rawPhone !== "string") {
      return NextResponse.json({ error: "Phone is required" }, { status: 400 });
    }

    const cleanPhone = rawPhone.replace(/\D/g, "");
    if (!/^\d{10,12}$/.test(cleanPhone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }
    // 10 digits = Indian local → prepend country code. 11-12 digits are
    // assumed already in E.164-without-plus form.
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;
    if (!authKey || !templateId) {
      return NextResponse.json(
        { error: "OTP service not configured — contact support" },
        { status: 500 },
      );
    }

    const msg91Response = await fetch(`${MSG91_API_URL}?authkey=${authKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // otp_length: 6 overrides whatever the MSG91 template is registered
      // with (some templates default to 4 digits). Our UI is hardcoded to 6
      // boxes with auto-submit on full, so these must agree.
      body: JSON.stringify({
        template_id: templateId,
        mobile: fullPhone,
        otp_length: 6,
      }),
    });
    const data = (await msg91Response.json()) as {
      type?: string;
      request_id?: string;
      message?: string;
    };

    // MSG91 quirk: sometimes returns type: "error" with "already" in
    // the message when an active OTP still exists. Treat that as
    // success — a new send isn't strictly required, the existing code
    // is still valid.
    const ok =
      data.type === "success" ||
      (data.type === "error" && typeof data.message === "string" && data.message.includes("already"));

    if (!ok) {
      return NextResponse.json(
        { error: data.message || "Failed to send OTP" },
        { status: 400 },
      );
    }

    const requestId = data.request_id ?? `req_${Date.now()}`;

    // Fuse the Convex write with the MSG91 call — one round trip from
    // the client's perspective. If Convex is down we still return the
    // error rather than lying about success, since downstream login
    // would fail regardless.
    await getConvexClient().mutation(api.otp.createOtpSession, {
      phone: "+" + fullPhone,
      requestId,
    });

    return NextResponse.json({ success: true, requestId });
  } catch (error) {
    console.error("[/api/otp/send]", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
