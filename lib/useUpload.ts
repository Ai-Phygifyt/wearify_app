"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { assertFileClient, type UploadGuard } from "./uploadGuards";

/**
 * Hook for uploading files to Convex storage.
 *
 * Pass an optional `guard` to enforce size + MIME limits before the upload
 * is sent. This is a UX convenience (fast failure, no wasted bandwidth);
 * the real security boundary lives on the server via convex/fileValidation.
 */
export function useUploadFile() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  async function upload(file: File, guard?: UploadGuard): Promise<Id<"_storage">> {
    if (guard) assertFileClient(file, guard);

    const url = await generateUploadUrl();

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
