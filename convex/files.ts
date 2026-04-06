import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate a short-lived upload URL for the client
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Get a serving URL for a stored file
export const getUrl = query({
  args: { fileId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.fileId);
  },
});

// Get multiple URLs at once
export const getUrls = query({
  args: { fileIds: v.array(v.id("_storage")) },
  handler: async (ctx, args) => {
    const urls: Record<string, string | null> = {};
    for (const id of args.fileIds) {
      urls[id] = await ctx.storage.getUrl(id);
    }
    return urls;
  },
});

// Store image IDs on a saree
export const setSareeImages = mutation({
  args: {
    sareeId: v.id("sarees"),
    imageIds: v.array(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sareeId, { imageIds: args.imageIds });
  },
});

// Store a KYC/logo file on a store
export const setStoreFile = mutation({
  args: {
    storeId: v.id("stores"),
    field: v.string(),
    fileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const validFields = [
      "logoFileId", "aadhaarFileId", "panFileId", "gstCertFileId",
      "shopLicenseFileId", "storePhotoExtFileId", "storePhotoIntFileId",
    ];
    if (!validFields.includes(args.field)) {
      throw new Error("Invalid file field: " + args.field);
    }
    await ctx.db.patch(args.storeId, { [args.field]: args.fileId });
  },
});
