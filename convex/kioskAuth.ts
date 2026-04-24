import { QueryCtx, MutationCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

// Authenticate a kiosk by its long-lived device token. Returns the devices
// row so the caller can trust devices.storeId (never the client-supplied
// storeId). Throws if the token is missing, unknown, or revoked.
//
// Callable from queries and mutations. Mutations additionally refresh
// lastSeenAt — queries skip the write since queries can't.
export async function requireKioskDevice(
  ctx: QueryCtx | MutationCtx,
  deviceToken: string,
): Promise<Doc<"devices">> {
  if (!deviceToken) {
    throw new Error("UNAUTHORIZED: kiosk device token required");
  }
  const device = await ctx.db
    .query("devices")
    .withIndex("by_deviceToken", (q) => q.eq("deviceToken", deviceToken))
    .unique();
  if (!device) {
    throw new Error("UNAUTHORIZED: unknown kiosk device");
  }
  if (device.revokedAt) {
    throw new Error("UNAUTHORIZED: kiosk device revoked");
  }
  // Best-effort heartbeat — only from mutation contexts.
  if ("patch" in ctx.db) {
    const mctx = ctx as MutationCtx;
    await mctx.db.patch(device._id, { lastSeenAt: Date.now() });
  }
  return device;
}

// Same as requireKioskDevice but also verifies the device is paired to the
// expected store. Use this on mutations that take storeId from the client —
// the client-supplied storeId is treated as a sanity check; the device's
// own storeId is authoritative.
export async function requireKioskDeviceForStore(
  ctx: QueryCtx | MutationCtx,
  deviceToken: string,
  storeId: string,
): Promise<Doc<"devices">> {
  const device = await requireKioskDevice(ctx, deviceToken);
  if (device.storeId !== storeId) {
    throw new Error("UNAUTHORIZED: device is not paired to this store");
  }
  return device;
}
