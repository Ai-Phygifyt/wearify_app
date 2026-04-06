"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

/**
 * Hook for uploading files to Convex storage.
 * Returns an `upload` function that takes a File and returns the storage Id.
 */
export function useUploadFile() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  async function upload(file: File): Promise<Id<"_storage">> {
    // 1. Get a short-lived upload URL from Convex
    const url = await generateUploadUrl();

    // 2. POST the file to the upload URL
    const result = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!result.ok) {
      throw new Error(`Upload failed: ${result.statusText}`);
    }

    const { storageId } = await result.json();
    return storageId as Id<"_storage">;
  }

  return { upload };
}
