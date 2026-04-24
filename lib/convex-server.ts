import { ConvexHttpClient } from "convex/browser";

// Shared HTTP client for Next.js server-side code (API routes, server
// actions) that needs to call Convex without a user-auth context. This
// is NOT for Better Auth flows (those go through lib/auth-server.ts's
// fetchAuthMutation / fetchAuthQuery, which forward the session token).
// Use this for operations that the caller has already authenticated
// some other way — e.g. /api/otp/* after MSG91 confirms the phone.
//
// NEXT_PUBLIC_CONVEX_URL is injected by the Netlify build command
// (npx convex deploy --cmd ...) so we never hardcode the prod URL.

let client: ConvexHttpClient | null = null;

export function getConvexClient(): ConvexHttpClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
    }
    client = new ConvexHttpClient(url);
  }
  return client;
}
