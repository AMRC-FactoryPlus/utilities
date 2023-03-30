/*
 * Factory+ NodeJS Helpers
 * Main library entry point.
 * Copyright 2022 AMRC.
 */

export * from "./db.js";
export * from "./debug.js";
export * from "./deps.js";
export * as secrets from "./secrets.js";
export * from "./service-client.js";
export * from "./sparkplug-util.js";
export * from "./util.js";
export * as UUIDs from "./uuids.js";
export * from "./webapi.js";
export { default as ServiceInterface } from "./service/service-interface.js"

/* Compat export; better is to go via ServiceClient. */
export { gss_mqtt } from "./service/mqtt.js";

import { pkgVersion } from "./util.js";

export const Version = pkgVersion(import.meta);
