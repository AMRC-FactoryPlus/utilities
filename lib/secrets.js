/* 
 * Factory+ / AMRC Connectivity Stack (ACS) NodeJS Helpers
 * Read Docker secrets from node.
 * Copyright 2021 AMRC.
 */

import fs from "node:fs";

export const read = function (name) {
    try {
        return fs.readFileSync(`/run/secrets/${name}`);
    }
    catch (err) {
        if (err.code != "ENOENT") {
            console.error("Error reading Docker secret [%s]: %o", name, err);
        }
        return null;
    }
};

export const readUTF8 = function (name) {
    const buf = read(name);
    if (buf == null) return null;

    return buf.toString("utf8").replace(/\r?\n$/, "");
};

/* Read a value from the environment if it exists. Otherwise append
 * _SECRET and read the value as a secret.
 */
export const env = function (key) {
    if (key in process.env)
        return process.env[key];

    const secret = `${key}_SECRET`;
    if (secret in process.env)
        return readUTF8(process.env[secret]);

    throw `No value available for ${key}!`;
}
