/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agents from "../agents.js";
import type * as billing from "../billing.js";
import type * as campaignOps from "../campaignOps.js";
import type * as customers from "../customers.js";
import type * as dashboard from "../dashboard.js";
import type * as devices from "../devices.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as legal from "../legal.js";
import type * as models from "../models.js";
import type * as network from "../network.js";
import type * as phoneAuth from "../phoneAuth.js";
import type * as releases from "../releases.js";
import type * as resilience from "../resilience.js";
import type * as sarees from "../sarees.js";
import type * as security from "../security.js";
import type * as seed from "../seed.js";
import type * as sessionOps from "../sessionOps.js";
import type * as settings from "../settings.js";
import type * as stores from "../stores.js";
import type * as support from "../support.js";
import type * as tailorOps from "../tailorOps.js";
import type * as trialRoom from "../trialRoom.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agents: typeof agents;
  billing: typeof billing;
  campaignOps: typeof campaignOps;
  customers: typeof customers;
  dashboard: typeof dashboard;
  devices: typeof devices;
  files: typeof files;
  http: typeof http;
  legal: typeof legal;
  models: typeof models;
  network: typeof network;
  phoneAuth: typeof phoneAuth;
  releases: typeof releases;
  resilience: typeof resilience;
  sarees: typeof sarees;
  security: typeof security;
  seed: typeof seed;
  sessionOps: typeof sessionOps;
  settings: typeof settings;
  stores: typeof stores;
  support: typeof support;
  tailorOps: typeof tailorOps;
  trialRoom: typeof trialRoom;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("../betterAuth/_generated/component.js").ComponentApi<"betterAuth">;
};
