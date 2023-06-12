/*
 * Factory+ NodeJS Utilities
 * Service interface base class.
 * Copyright 2022 AMRC.
 */

import content_type from "content-type";
import Optional from "optional-js";

export default class ServiceInterface {
    constructor (fplus) {
        this.fplus = fplus;
        this.debug = fplus.debug;
    }

    async fetch (opts) {
        if (typeof opts == "string")
            opts = { url: opts };

        const body = "body" in opts ? JSON.stringify(opts.body) : undefined;

        const headers = { ...opts.headers };
        headers["Accept"] = "application/json";
        if (body)
            headers["Content-Type"] = "application/json";

        opts = {
            ...opts,
            service:    this.service,
            headers,
            body,
        };
        const res = await this.fplus.fetch(opts);
        const json = Optional
            .ofNullable(res.headers.get("Content-Type"))
            .map(content_type.parse)
            .filter(ct => ct.type == "application/json")
            .map(_ => res.json())
            .orElse(undefined);

        return [res.status, await json];
    }

    async ping () {
        const [st, ping] = await this.fetch("/ping");
        if (st != 200) return;
        return ping;
    }
}
