/* 
 * Factory+ NodeJS Utilities
 * Debugging / logging support.
 * Copyright 2022 AMRC.
 */

import util from "node:util";

export class Debug {
    constructor (opts) {
        opts ??= {};
        const verb = opts.verbose 
            ?? process.env.VERBOSE
            ?? opts.default
            ?? "";

        this.levels = new Set();
        this.verbose = false;

        if (verb == "1") {
            this.verbose = true;
        }
        else {
            verb.split(",")
                .forEach(l => this.levels.add(l));
        }
    }

    log (level, msg, ...args) {
        if (!this.verbose && !this.levels.has(level))
            return;
        
        const out = util.format(msg, ...args);
        const spc = " ".repeat(Math.max(0, 8 - level.length));
        console.log(`${level}${spc} : ${out}`);
    }
}
