/*
 * Factory+ NodeJS Helpers
 * Re-exports of libraris we use.
 * Copyright 2022 AMRC
 */

/* We import and re-export the important library functions here, because
 * the libraries used may change in the future and this provides a
 * consistent interface.
 */

import { createRequire } from "module";

/* Annoying re-export syntax... If you find yourself having to document
 * 'you can't do `export Foo from "foo"`' then maybe you should design
 * the syntax so you can... ? */
export { default as MQTT } from "mqtt";

/* No GSS on Windows. */
export const GSS = await
    import("gssapi.js")
        .then(mod => mod.default)
        .catch(e => undefined);

/* The 'pg' module is not properly ESM-compatible. While pure-JS use can
 * be accomplished with `import Pg from "pg"` this does not provide
 * access to the native (libpq) bindings. They are only available via
 * CommonJS import. */
const require = createRequire(import.meta.url);
const pg_cjs = require("pg");
export const Pg = pg_cjs.native ?? pg_cjs;

import sparkplug_payload from "sparkplug-payload";
export const SpB = sparkplug_payload.get("spBv1.0");

import _got_fetch from "got-fetch";
/* Bug fix */
export function fetch (url, opts) {
    return _got_fetch(`${url}`, opts);
}
