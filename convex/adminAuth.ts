import { QueryCtx, MutationCtx } from "./_generated/server";
import { authComponent } from "./betterAuth/auth";

// The one authenticated user we treat as platform admin. Kept in sync
// with ADMIN_EMAIL in app/admin/layout.tsx — the client check is still
// there for UX (redirecting non-admins on load), but this server-side
// enforcement is the real gate.
const ADMIN_EMAILS: ReadonlyArray<string> = ["admin@wearify.com"];

// Throws if the caller is not the platform admin. Callable from queries,
// mutations, and actions — authComponent plugs into Convex's ctx.auth so
// the user identity is derived from the Better Auth session token that
// ConvexBetterAuthProvider forwards on every call.
export async function requireAdmin(ctx: QueryCtx | MutationCtx): Promise<{
  email: string;
  userId: string;
}> {
  const user = await authComponent.safeGetAuthUser(ctx);
  if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
    throw new Error("UNAUTHORIZED: admin access required");
  }
  return { email: user.email, userId: user._id };
}
