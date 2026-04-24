import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { getConvexClient } from "@/lib/convex-server";

// POST /api/otp/verify  { phone, otp }
//
// Consults MSG91 for code validity. On success, flips the Convex
// otpSessions row to verified=true so subsequent phoneAuth.loginWithOtp
// trusts it. The incrementAttempt call happens BEFORE the MSG91 round
// trip so a rate-limit burst can't bypass the cap by spamming bad codes.

const MSG91_VERIFY_URL = "https://control.msg91.com/api/v5/otp/verify";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const rawPhone = body?.phone;
    const otp = body?.otp;
    if (typeof rawPhone !== "string" || typeof otp !== "string") {
      return NextResponse.json(
        { error: "Phone and OTP are required" },
        { status: 400 },
      );
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

    const convex = getConvexClient();

    // Bump the attempt counter first. Throws if budget exhausted /
    // session missing / expired — propagate those to the UI so the
    // user sees "Too many attempts" instead of a vague MSG91 error.
    try {
      await convex.mutation(api.otp.incrementAttempt, {
        phone: "+" + fullPhone,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message.replace(/^Error: /, "") : "Verify failed";
      return NextResponse.json({ error: msg }, { status: 429 });
    }

    const msg91Response = await fetch(
      `${MSG91_VERIFY_URL}?authkey=${authKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: fullPhone, otp }),
      },
    );
    const data = (await msg91Response.json()) as {
      type?: string;
      message?: string;
    };

    if (data.type !== "success") {
      return NextResponse.json(
        { error: data.message || "Invalid OTP" },
        { status: 400 },
      );
    }

    await convex.mutation(api.otp.markOtpVerified, {
      phone: "+" + fullPhone,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[/api/otp/verify]", error);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
