// convex/runpod.ts
//
// Pure RunPod / ComfyUI helpers. No Convex DB access; no _generated imports.
// Used by convex/tryOn.ts. Action-runtime only (uses fetch).
//
// See docs/superpowers/specs/2026-05-03-kiosk-runpod-tryon-design.md §"ComfyUI workflow port"

// =====================================================================
// Types
// =====================================================================

export type RunPodJobStatus =
  | "IN_QUEUE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "TIMED_OUT";

export type RunPodStatusResponse = {
  id: string;
  status: RunPodJobStatus;
  output?: {
    images?: Array<
      | string
      | { base64?: string; data?: string; url?: string }
    >;
  };
  error?: string;
};

export type RunPodRunPayload = {
  input: {
    workflow: Record<string, unknown>;
  };
};

// =====================================================================
// Base64 helpers (ported from comfyui_next/app/api/run/route.ts:11-18)
// =====================================================================

export function fixBase64Padding(base64: string): string {
  const pure = base64.replace(/^data:image\/[a-z]+;base64,/, "");
  const pad = pure.length % 4;
  if (pad > 0) return pure + "=".repeat(4 - pad);
  return pure;
}

// Convert a Blob (from ctx.storage.get) to a base64 string.
// btoa() doesn't accept arbitrary bytes directly — chunk through binary string.
export async function blobToBase64(blob: Blob): Promise<string> {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let bin = "";
  // Process in chunks to avoid call-stack issues on large images.
  const CHUNK = 0x8000;
  for (let i = 0; i < buf.length; i += CHUNK) {
    bin += String.fromCharCode.apply(
      null,
      Array.from(buf.subarray(i, i + CHUNK)),
    );
  }
  // btoa is available in the Convex action runtime.
  return btoa(bin);
}

export function base64ToBytes(base64: string): Uint8Array {
  const bin = atob(base64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// =====================================================================
// Saree config — ported from comfyui_next/app/api/run/route.ts:52-65
// (CATEGORY_CONFIG.saree). Other categories (mens_formal,
// mens_traditional) intentionally dropped — see spec §5.3.
// =====================================================================

const SAREE_CONFIG = {
  lora: "Qwen-Image-Edit-2511-Object-Adder.safetensors",
  prompt:
    "Perform a high-accuracy virtual try-on.\n\nCompletely replace the existing garment on the woman in Image 1 with the exact saree from Image 2.\n\nDo not just transfer color or texture; replace the entire saree. The generated saree MUST have the exact same motifs, border design, pallu pattern, fabric texture, and color as the reference saree in Image 2.\n\nIgnore the original saree's patterns, colors, and details.\n\nEdit only the saree region.\n\nPreserve blouse, face, hairstyle, body shape, pose, lighting and background.\n\nDrape the new saree naturally according to the body shape and pose.\n\nDo not invent new patterns, colors, or mix the old and new designs.",
  negativePrompt:
    "no extra limbs, no extra hands, no extra legs, no body reshaping, no face change, no pose change, no blouse modification, no leg regeneration, no background change, no outfit merging, no embroidery blur, color bleeding, texture mixing, original garment showing through, recoloring only, half try-on\n",
};

// =====================================================================
// Workflow builder — ported byte-for-byte from
// comfyui_next/app/api/run/route.ts:72-344. Two injection points:
//   • Node 12: cloth (saree) base64
//   • Node 13: person base64
// All other nodes / params verbatim from the reference. If you tune
// the workflow, update both places.
// =====================================================================

export function buildSareeWorkflow(
  personBase64: string,
  garmentBase64: string,
): RunPodRunPayload {
  return {
    input: {
      workflow: {
        "4": {
          inputs: {
            lora_name: SAREE_CONFIG.lora,
            strength_model: 0.9,
            model: ["126", 0],
          },
          class_type: "LoraLoaderModelOnly",
          _meta: {
            title: "LoraLoaderModelOnly",
          },
        },
        "5": {
          inputs: {
            conditioning: ["10", 0],
          },
          class_type: "ConditioningZeroOut",
          _meta: {
            title: "ConditioningZeroOut",
          },
        },
        "6": {
          inputs: {
            custom_output: ["10", 2],
          },
          class_type: "QwenEditOutputExtractor",
          _meta: {
            title: "Qwen Edit Output Extractor",
          },
        },
        "8": {
          inputs: {
            value: SAREE_CONFIG.prompt,
          },
          class_type: "PrimitiveStringMultiline",
          _meta: {
            title: "String (Multiline)",
          },
        },
        "9": {
          inputs: {
            max_size: 2300,
            image: ["111", 0],
          },
          class_type: "QwenEditAdaptiveLongestEdge",
          _meta: {
            title: "Qwen Edit Adaptive Longest Edge",
          },
        },
        "10": {
          inputs: {
            prompt: ["8", 0],
            return_full_refs_cond: true,
            instruction:
              "Describe the key features of the input image (color, shape, size, texture, objects, background), then explain how the user's text instruction should alter or modify the image. Generate a new image that meets the user's requirements while maintaining consistency with the original input where appropriate.",
            clip: ["125", 0],
            vae: ["124", 0],
            configs: ["15", 0],
          },
          class_type: "TextEncodeQwenImageEditPlusCustom_lrzjason",
          _meta: {
            title: "TextEncodeQwenImageEditPlusCustom lrzjason",
          },
        },
        "11": {
          inputs: {
            max_size: 1536,
            image: ["12", 0],
          },
          class_type: "QwenEditAdaptiveLongestEdge",
          _meta: {
            title: "Qwen Edit Adaptive Longest Edge",
          },
        },
        // INJECTION POINT — saree (garment) image
        "12": {
          inputs: {
            base64_data: garmentBase64,
            image_output: "Preview",
            save_prefix: "ComfyUI",
          },
          class_type: "easy loadImageBase64",
          _meta: {
            title: "Load Cloth Image",
          },
        },
        // INJECTION POINT — person image
        "13": {
          inputs: {
            base64_data: personBase64,
            image_output: "Preview",
            save_prefix: "ComfyUI",
          },
          class_type: "easy loadImageBase64",
          _meta: {
            title: "Load Person Image",
          },
        },
        "15": {
          inputs: {
            to_ref: true,
            ref_main_image: false,
            ref_longest_edge: ["11", 0],
            ref_crop: "center",
            ref_upscale: "lanczos",
            to_vl: true,
            vl_resize: true,
            vl_target_size: 384,
            vl_crop: "center",
            vl_upscale: "bicubic",
            image: ["12", 0],
            configs: ["16", 0],
          },
          class_type: "QwenEditConfigPreparer",
          _meta: {
            title: "Qwen Edit Config Preparer",
          },
        },
        "16": {
          inputs: {
            to_ref: true,
            ref_main_image: true,
            ref_longest_edge: ["9", 0],
            ref_crop: "pad",
            ref_upscale: "lanczos",
            to_vl: true,
            vl_resize: true,
            vl_target_size: 384,
            vl_crop: "center",
            vl_upscale: "bicubic",
            image: ["111", 0],
          },
          class_type: "QwenEditConfigPreparer",
          _meta: {
            title: "Qwen Edit Config Preparer",
          },
        },
        "18": {
          inputs: {
            image: ["22", 0],
            pad_info: ["6", 0],
          },
          class_type: "CropWithPadInfo",
          _meta: {
            title: "Crop With Pad Info",
          },
        },
        "22": {
          inputs: {
            samples: ["123", 0],
            vae: ["124", 0],
          },
          class_type: "VAEDecode",
          _meta: {
            title: "VAE Decode",
          },
        },
        "44": {
          inputs: {
            reference_latents_method: "index_timestep_zero",
            conditioning: ["10", 0],
          },
          class_type: "FluxKontextMultiReferenceLatentMethod",
          _meta: {
            title: "FluxKontextMultiReferenceLatentMethod",
          },
        },
        "111": {
          inputs: {
            Input: 1,
            image1: ["13", 0],
          },
          class_type: "CR Image Input Switch",
          _meta: {
            title: "🔀 CR Image Input Switch",
          },
        },
        "123": {
          inputs: {
            seed: Math.floor(Math.random() * 1000000000000000),
            steps: 4,
            cfg: 1,
            sampler_name: "euler",
            scheduler: "beta",
            denoise: 1,
            model: ["4", 0],
            positive: ["44", 0],
            negative: ["135", 0],
            latent_image: ["10", 1],
          },
          class_type: "KSampler",
          _meta: {
            title: "KSampler",
          },
        },
        "124": {
          inputs: {
            vae_name: "qwen_image_vae.safetensors",
          },
          class_type: "VAELoader",
          _meta: {
            title: "Load VAE",
          },
        },
        "125": {
          inputs: {
            clip_name: "qwen_2.5_vl_7b_fp8_scaled.safetensors",
            type: "qwen_image",
            device: "default",
          },
          class_type: "CLIPLoader",
          _meta: {
            title: "Load CLIP",
          },
        },
        "126": {
          inputs: {
            unet_name:
              "qwen_image_edit_2511_fp8_e4m3fn_scaled_lightning_comfyui_4steps_v1.0.safetensors",
            weight_dtype: "default",
          },
          class_type: "UNETLoader",
          _meta: {
            title: "Load Diffusion Model",
          },
        },
        // ComfyUI rgthree Image Comparer — UI-only debug node. The
        // hardcoded temp URLs in `rgthree_comparer.images` are not
        // execution inputs (RunPod ignores them); kept verbatim from
        // the reference port so the workflow JSON stays diff-free.
        "134": {
          inputs: {
            rgthree_comparer: {
              images: [
                {
                  name: "A",
                  selected: true,
                  url: "/api/view?filename=rgthree.compare._temp_zeeyv_00027_.png&type=temp&subfolder=&rand=0.7585319046781084",
                },
                {
                  name: "B",
                  selected: true,
                  url: "/api/view?filename=rgthree.compare._temp_zeeyv_00028_.png&type=temp&subfolder=&rand=0.18510602073287685",
                },
              ],
            },
            image_a: ["13", 0],
            image_b: ["18", 0],
          },
          class_type: "Image Comparer (rgthree)",
          _meta: {
            title: "Image Comparer (rgthree)",
          },
        },
        "135": {
          inputs: {
            text: SAREE_CONFIG.negativePrompt,
            clip: ["125", 0],
          },
          class_type: "CLIPTextEncode",
          _meta: {
            title: "CLIP Text Encode (Prompt)",
          },
        },
        "200": {
          inputs: {
            filename_prefix: "ComfyUI",
            images: ["18", 0],
          },
          class_type: "SaveImage",
          _meta: {
            title: "Save Image",
          },
        },
      },
    },
  };
}

// =====================================================================
// Config reader — env vars only. Throws if RunPod isn't configured.
// =====================================================================

export type RunPodConfig = { apiKey: string; endpointId: string };

export function readRunPodConfig(): RunPodConfig {
  const apiKey = process.env.RUNPOD_API_KEY;
  const endpointId = process.env.RUNPOD_ENDPOINT_ID;
  if (!apiKey) throw new Error("INTERNAL: RUNPOD_API_KEY is not set");
  if (!endpointId) throw new Error("INTERNAL: RUNPOD_ENDPOINT_ID is not set");
  return { apiKey, endpointId };
}

// =====================================================================
// REST submit (POST /v2/{ID}/run) — ported from comfyui_next:347-365
// =====================================================================

export async function submitRunPodJob(
  cfg: RunPodConfig,
  payload: RunPodRunPayload,
): Promise<{ id: string }> {
  const res = await fetch(`https://api.runpod.ai/v2/${cfg.endpointId}/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`INTERNAL: RunPod submit failed (${res.status}): ${text}`);
  }
  const json = (await res.json()) as { id?: string };
  if (!json.id) {
    throw new Error("INTERNAL: RunPod submit returned no job id");
  }
  return { id: json.id };
}

// =====================================================================
// REST poll (GET /v2/{ID}/status/{jobId}) — ported from
// comfyui_next/app/api/status/route.ts
// =====================================================================

export async function pollRunPodJob(
  cfg: RunPodConfig,
  jobId: string,
): Promise<RunPodStatusResponse> {
  const res = await fetch(
    `https://api.runpod.ai/v2/${cfg.endpointId}/status/${jobId}`,
    {
      headers: { Authorization: `Bearer ${cfg.apiKey}` },
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`INTERNAL: RunPod poll failed (${res.status}): ${text}`);
  }
  return (await res.json()) as RunPodStatusResponse;
}

// =====================================================================
// Output extraction — RunPod returns output.images[0] as one of:
//   • plain base64 string
//   • { base64: "..." }
//   • { data: "..." }
//   • { url: "https://..." } (we don't follow URLs here — caller does)
// Returns null if not extractable.
// =====================================================================

export function extractImageBase64(
  status: RunPodStatusResponse,
): string | null {
  const first = status.output?.images?.[0];
  if (!first) return null;
  if (typeof first === "string") return fixBase64Padding(first);
  if (first.base64) return fixBase64Padding(first.base64);
  if (first.data) return fixBase64Padding(first.data);
  return null;
}

// =====================================================================
// Canned image emitted by the dry-run code path (1x1 transparent PNG,
// 68 bytes → 92 base64 chars). Only used when an operator opts in via
// platformConfig.tryon.dryRun = "true" — kept as a debugging aid for
// CI / dev environments without RunPod credits, NOT a default.
// =====================================================================

export const DRYRUN_IMAGE_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
