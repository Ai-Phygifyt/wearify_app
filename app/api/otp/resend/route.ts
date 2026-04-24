import { NextRequest, NextResponse } from "next/server";

// POST /api/otp/resend  { phone }
//
// Asks MSG91 to resend the existing OTP via SMS. Does NOT touch Convex
// — the otpSessions row is still live and the OTP value is still
// whatever MSG91 generated on the original send. If the session has
// already expired, point the user back through /api/otp/send.

const MSG91_RETRY_URL = "https://control.msg91.com/api/v5/otp/retry";

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
    const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const authKey = process.env.MSG91_AUTH_KEY;
    if (!authKey) {
      return NextResponse.json(
        { error: "OTP service not configured — contact support" },
        { status: 500 },
      );
    }

    const msg91Response = await fetch(
      `${MSG91_RETRY_URL}?authkey=${authKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: fullPhone, retrytype: "text" }),
      },
    );
    const data = (await msg91Response.json()) as {
      type?: string;
      message?: string;
    };

    if (data.type !== "success") {
      return NextResponse.json(
        { error: data.message || "Failed to resend OTP" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[/api/otp/resend]", error);
    return NextResponse.json({ error: "Failed to resend OTP" }, { status: 500 });
  }
}
